const mongoose = require('mongoose');

const pendingUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'admin'],
      default: 'patient',
    },
    otp: { type: String, default: null },
    otpExpiresAt: { type: Date, default: null },
    otpAttempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Expire unverified registrations automatically after 15 minutes.
pendingUserSchema.index({ createdAt: 1 }, { expireAfterSeconds: 15 * 60 });

module.exports = mongoose.model('PendingUser', pendingUserSchema);