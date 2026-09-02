const mongoose = require('mongoose');
const crypto = require('crypto');

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    otpHash: {
      type: String,
      required: true
    },
    verified: {
      type: Boolean,
      default: false
    },
    expiresAt: {
      type: Date,
      required: true,
      expires: 300 // MongoDB TTL index: automatically deletes document 300 seconds (5 mins) after expiresAt
    }
  },
  {
    timestamps: true
  }
);

// Helper method to hash OTP
otpSchema.statics.hashOtp = function (otp) {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

otpSchema.index({ email: 1 });

module.exports = mongoose.model('Otp', otpSchema);
