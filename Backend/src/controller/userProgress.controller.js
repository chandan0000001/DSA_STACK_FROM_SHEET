import problemModel from "../models/problems.model.js";
import userDailyProgressModel from "../models/userDailyProgress.model.js";
import userProblemProgressModel from "../models/userProblemProgress.model.js";
import SystemState from '../models/systemState.model.js'
import userModel from '../models/user.model.js';

// ================= DATE KEY =================
function getDateKey(date) {
    const d = date ? new Date(date) : new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// ================= MAIN SUMMARY FUNCTION =================
export async function getUserProgressSummary(userId) {
    const completedProgress = await userProblemProgressModel
        .find({ userId, isCompleted: true })
        .select("problemId completedAt")
        .populate("problemId", "difficulty") // ✅ added
        .lean();

    const completedProblemIds = completedProgress.map((item) =>
        String(item.problemId?._id ?? item.problemId)
    );

    // ================= DIFFICULTY BREAKDOWN ✅ =================
    const difficultyBreakdown = { Easy: 0, Medium: 0, Hard: 0 };
    completedProgress.forEach((item) => {
        const diff = item.problemId?.difficulty;
        if (diff && difficultyBreakdown[diff] !== undefined) {
            difficultyBreakdown[diff]++;
        }
    });

    // ================= DAILY SET =================
    const solvedSet = new Set(
        completedProgress
            .filter((item) => item.completedAt)
            .map((item) => getDateKey(item.completedAt))
    );

    // ================= STREAK =================
    let streak = 0;
    const today = new Date();

    const todayKey = getDateKey(today);
    const startIndex = solvedSet.has(todayKey) ? 0 : 1;

    for (let i = startIndex; i < 365; i++) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const key = getDateKey(d);
        if (solvedSet.has(key)) {
            streak++;
        } else {
            break;
        }
    }

    // ================= MONTHLY CHART =================
    const monthlyProgress = Array(12).fill(0);
    completedProgress.forEach((item) => {
        if (item.completedAt) {
            const month = new Date(item.completedAt).getMonth();
            monthlyProgress[month]++;
        }
    });

    // ================= DAILY MAP (HEATMAP) =================
    const dailyMap = {};
    completedProgress.forEach((item) => {
        if (!item.completedAt) return;
        const key = getDateKey(item.completedAt);
        dailyMap[key] = (dailyMap[key] || 0) + 1;
    });

    return {
        completedProblemIds,
        streak,
        totalCompleted: completedProblemIds.length,
        monthlyProgress,
        dailyMap,
        difficultyBreakdown, // ✅ added
    };
}

// ================= GET PROGRESS SUMMARY =================
export async function getProgressSummary(req, res) {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized User" });
        }

        const summary = await getUserProgressSummary(userId);

        return res.status(200).json({
            message: "Progress summary fetched successfully",
            summary,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error while fetching progress summary",
            error: error.message,
        });
    }
}

// ================= GET PUBLIC PROGRESS SUMMARY =================
export async function getPublicProgressSummary(req, res) {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        const summary = await getUserProgressSummary(userId);
        
        // Also fetch basic user info for the public profile
        const user = await userModel.findById(userId).select("name avatar email");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "Public progress summary fetched successfully",
            summary,
            user,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error while fetching public progress summary",
            error: error.message,
        });
    }
}

// ================= TOGGLE PROGRESS =================
export async function toggleProblemProgress(req, res) {
    try {
        const userId = req.user?._id;
        const { problemId } = req.body ?? {};

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized User" });
        }

        if (!problemId) {
            return res.status(400).json({ message: "problemId is required" });
        }

        const problem = await problemModel.findById(problemId);

        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        const date = getDateKey();

        let progress = await userProblemProgressModel.findOne({ userId, problemId });

        if (!progress) {
            progress = new userProblemProgressModel({
                userId,
                problemId,
                date,
                isCompleted: true,
                completedAt: new Date(),
            });
        } else {
            progress.isCompleted = !progress.isCompleted;
            progress.date = date;
            progress.completedAt = progress.isCompleted ? new Date() : null;
        }

        await progress.save();

        const summary = await getUserProgressSummary(userId);

        return res.status(200).json({
            message: "Problem progress updated successfully",
            progress,
            summary,
        });

    } catch (error) {
        console.error("PROGRESS TOGGLE ERROR:", error);
        return res.status(500).json({
            message: "Server error while updating progress",
            error: error.message,
        });
    }
}

// ================= GET DAILY PROBLEMS =================
export const getDailyProblems = async (req, res) => {
    try {
        const userId = req.user._id;
        const date = getDateKey(req.query.date);

        let daily = await userDailyProgressModel
            .findOne({ userId, date, problems: { $exists: true, $not: { $size: 0 } } })
            .populate("problems");

        if (daily) {
            return res.json({ success: true, daily });
        }

        let state = await SystemState.findOne({ key: "daily_pointer" });
        if (!state) {
            state = await SystemState.create({ key: "daily_pointer", lastIndex: 0 });
        }

        const allProblems = await problemModel.find().sort({ order: 1 });

        if (allProblems.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No problems available in the system"
            });
        }

        const DAILY_COUNT = Math.min(4, allProblems.length);

        if (state.lastIndex + DAILY_COUNT > allProblems.length) {
            state.lastIndex = 0;
        }

        const selected = allProblems.slice(state.lastIndex, state.lastIndex + DAILY_COUNT);

        state.lastIndex += DAILY_COUNT;
        await state.save();

        daily = await userDailyProgressModel.findOneAndUpdate(
            { userId, date },
            {
                $set: {
                    problems: selected.map(p => p._id),
                    isCompleted: false,
                    solvedProblems: []
                },
            },
            { upsert: true, returnDocument: 'after' }
        );

        daily = await daily.populate("problems");

        return res.json({ success: true, daily });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ================= TOGGLE DAILY PROBLEM =================
export async function toggleDailyProblem(req, res) {
    try {
        const userId = req.user?._id;
        const { problemId } = req.body ?? {};

        if (!userId) return res.status(401).json({ message: "Unauthorized User" });
        if (!problemId) return res.status(400).json({ message: "problemId is required" });

        const date = getDateKey();

        const dailyRecord = await userDailyProgressModel.findOne({
            userId,
            date,
            problems: { $exists: true, $not: { $size: 0 } }
        });

        if (!dailyRecord) {
            return res.status(404).json({ message: "No daily problems found for today" });
        }

        const isInDaily = dailyRecord.problems
            .map(id => id.toString())
            .includes(problemId.toString());

        if (!isInDaily) {
            return res.status(400).json({ message: "Problem is not in today's daily set" });
        }

        const alreadySolved = dailyRecord.solvedProblems
            .map(id => id.toString())
            .includes(problemId.toString());

        if (alreadySolved) {
            dailyRecord.solvedProblems = dailyRecord.solvedProblems
                .filter(id => id.toString() !== problemId.toString());
        } else {
            dailyRecord.solvedProblems.push(problemId);
        }

        dailyRecord.isCompleted =
            dailyRecord.solvedProblems.length === dailyRecord.problems.length;
        dailyRecord.completedAt = dailyRecord.isCompleted ? new Date() : null;

        await dailyRecord.save();

        await userProblemProgressModel.findOneAndUpdate(
            { userId, problemId },
            {
                $set: {
                    date,
                    isCompleted: !alreadySolved,
                    completedAt: !alreadySolved ? new Date() : null,
                }
            },
            { upsert: true, returnDocument: 'after' }
        );

        const summary = await getUserProgressSummary(userId);

        return res.status(200).json({
            message: alreadySolved ? "Problem unmarked" : "Problem marked as solved",
            solvedProblems: dailyRecord.solvedProblems,
            isCompleted: dailyRecord.isCompleted,
            summary,
        });

    } catch (error) {
        console.error("DAILY TOGGLE ERROR:", error);
        return res.status(500).json({
            message: "Server error while toggling daily problem",
            error: error.message,
        });
    }
}

// ================= GET TODAY'S FINISHERS =================
export async function getDailyFinishers(req, res) {
    try {
        const date = getDateKey();
        const userId = req.user._id;

        const finishers = await userDailyProgressModel
            .find({
                date,
                isCompleted: true,
                problems: { $exists: true, $not: { $size: 0 } }
            })
            .sort({ completedAt: 1 })
            .populate("userId", "name email avatar")
            .lean();

        const result = finishers.map((f, index) => ({
            rank: index + 1,
            user: f.userId,
            completedAt: f.completedAt,
            solvedCount: f.solvedProblems.length,
        }));

        const myRank = result.find(
            (f) => f.user?._id?.toString() === userId.toString()
        );

        return res.status(200).json({
            success: true,
            date,
            totalFinishers: result.length,
            myRank: myRank
                ? { rank: myRank.rank, completedAt: myRank.completedAt }
                : null,
            finishers: result,
        });

    } catch (error) {
        console.error("FINISHERS ERROR:", error);
        return res.status(500).json({
            message: "Server error while fetching finishers",
            error: error.message,
        });
    }
}
