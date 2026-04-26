import mongoose from 'mongoose'

const userProblemProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "problem",
        required: true
    },
    date: {
        type: String,
        default: () => new Date().toISOString().slice(0, 10)
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

// One record per user per problem
userProblemProgressSchema.index({ userId: 1, problemId: 1 }, { unique: true });

const userProblemProgress = mongoose.model("UserProblemProgress", userProblemProgressSchema);
export default userProblemProgress;