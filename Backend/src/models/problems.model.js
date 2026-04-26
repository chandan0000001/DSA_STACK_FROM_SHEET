import mongoose from 'mongoose'

const problemSchema = new mongoose.Schema({

    name: {
        type: String, 
        required: true, 
        unique: true
    }, 

    link: {
        type: String, 
        required : true
    }, 

    tags: [
        String,
    ],

    difficulty: {
        type: String,
        enum: ["Easy", "Medium", "Hard"],
    },

    order: {                 // 🔥 ADDED FIELD
        type: Number,
        required: true
    }

}, { timestamps: true });


problemSchema.pre(/^find/, function () {
    this.sort({ order: 1 });
});

const problem = mongoose.model("problem", problemSchema); 
export default problem;