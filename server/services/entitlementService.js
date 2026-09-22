const User = require('../models/User');

const grantEntitlement = async ({ student, razorpayPaymentId }) => {
  const user = await User.findByIdAndUpdate(
    student,
    { $set: { accessUnlocked: true, unlockedAt: new Date() } },
    { new: true }
  );
  return user;
};

module.exports = { grantEntitlement };