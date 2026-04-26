import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
    default: function () {
      return this.admin;
    },
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    }
  ],
  pastMembers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    }
  ],
  discordLink: {
    type: String,
    trim: true,
    default: "",
  },
  maxMembers: {
    type: Number,
    default: 20,
    min: 1,
    max: 100,
  },
  inviteCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  }
}, { timestamps: true });

const roomModel = mongoose.model("Room", roomSchema);
export default roomModel;
