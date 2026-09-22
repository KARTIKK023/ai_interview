const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ['PERCENT', 'FIXED'], required: true },
    discountValue: { type: Number, required: true },
    scope: { type: String, enum: ['ALL', 'GROUP', 'STUDENTS'], default: 'ALL' },
    studentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    groupIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    perUserLimit: { type: Number, default: 1 },
    maxRedemptions: { type: Number, default: 0 },
    redemptions: { type: Number, default: 0 },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const claimSchema = new mongoose.Schema(
  {
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', default: null },
    discountPaise: { type: Number, default: 0 },
    claimedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

claimSchema.index({ coupon: 1, student: 1 });

module.exports = mongoose.model('Coupon', couponSchema);
module.exports.Claim = mongoose.model('Claim', claimSchema);