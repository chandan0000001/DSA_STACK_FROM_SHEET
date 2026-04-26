import mongoose from 'mongoose'

const userProgressSchema = new mongoose.Schema({
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
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "problem",
        default: null
    },
    problems: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "problem"
        }
    ],
    solvedProblems: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "problem"
            }
        ],
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

// for query performance only — NOT unique
userProgressSchema.index({ userId: 1, date: 1 });

// unique per user per problem — for toggleProblemProgress
userProgressSchema.index({ userId: 1, problemId: 1 }, { unique: true, sparse: true });

const userProgress = mongoose.model("UserProgress", userProgressSchema);

export default userProgress;