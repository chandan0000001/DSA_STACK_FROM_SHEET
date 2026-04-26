import mongoose from 'mongoose'

const userDailyProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    date: {
        type: String,
        required: true,
        default: () => new Date().toISOString().slice(0, 10)
    },
    problems: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "problem"
        }
    ],
    solvedProblems: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: "problem" }],
        default: []
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

// One daily set per user per date
userDailyProgressSchema.index({ userId: 1, date: 1 }, { unique: true });

const userDailyProgress = mongoose.model("UserDailyProgress", userDailyProgressSchema);
export default userDailyProgress;