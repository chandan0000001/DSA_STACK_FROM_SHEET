import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  avatar: {
    type: String,
    default: "",
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },

  // Email verification
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  verificationTokenExpiry: Date,   // ← token now expires

  // Password reset
  resetPasswordToken: String,
  resetPasswordExpiry: Date,

  // Refresh token (stored hashed)
  refreshToken: String,

  // Daily email tracking (Asia/Kolkata date key like 2026-04-24)
  lastDailyEmailSentDate: String,

}, { timestamps: true });

const userModel = mongoose.model('user', userSchema);
export default userModel;
