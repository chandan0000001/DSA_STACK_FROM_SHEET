import mongoose from "mongoose";

const systemStateSchema = new mongoose.Schema({
  key: {
    type: String,
    unique: true
  },

  lastIndex: {
    type: Number,
    default: 0
  }
});

export default mongoose.model("SystemState", systemStateSchema);