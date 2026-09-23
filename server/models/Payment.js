const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    purpose: { type: String, enum: ['MOCK_LEVELS', 'ATS_PRO', 'SUPER_PACK'], required: true, default: 'SUPER_PACK' },
    baseAmountPaise: { type: Number, required: true },
    discountPaise: { type: Number, default: 0 },
    payableAmountPaise: { type: Number, required: true },
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', default: null },
    status: {
      type: String,
      enum: ['CREATED', 'VERIFIED', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'CREATED',
      index: true
    },
    razorpayOrderId: { type: String, index: true },
    razorpayPaymentId: { type: String },
    method: { type: String, default: '' },
    fee: { type: Number, default: 0 },
    capturedAt: { type: Date, default: null },
    notes: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

paymentSchema.index({ student: 1, createdAt: -1 });
paymentSchema.index({ status: 1, capturedAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);