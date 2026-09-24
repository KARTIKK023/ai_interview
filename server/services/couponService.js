const Coupon = require('../models/Coupon');
const { Claim } = require('../models/Coupon');
const Group = require('../models/Group');

const userInAllowedGroups = async (userId, groupIds) => {
  if (!groupIds || groupIds.length === 0) return false;
  const groups = await Group.find({ _id: { $in: groupIds } }).select('memberIds').lean();
  return groups.some((group) =>
    group.memberIds.some((id) => id && String(id) === String(userId))
  );
};

const validateCouponForUser = async ({ coupon, user, baseAmountPaise, now = Date.now() }) => {
  if (!coupon || !coupon.active) return { ok: false, discountPaise: 0, reason: 'INVALID' };

  const from = new Date(coupon.validFrom).getTime();
  const until = new Date(coupon.validUntil).getTime();
  if (now < from || now > until) return { ok: false, discountPaise: 0, reason: 'EXPIRED' };

  if (coupon.scope === 'STUDENTS' && !coupon.studentIds.some((id) => String(id) === String(user._id))) {
    return { ok: false, discountPaise: 0, reason: 'NOT_ELIGIBLE' };
  }

  if (coupon.scope === 'GROUP' && !(await userInAllowedGroups(user._id, coupon.groupIds))) {
    return { ok: false, discountPaise: 0, reason: 'NOT_ELIGIBLE' };
  }

  const discountPaise =
    coupon.discountType === 'PERCENT'
      ? Math.floor((baseAmountPaise * coupon.discountValue) / 100)
      : Math.round(coupon.discountValue * 100);

  return { ok: true, discountPaise, reason: 'OK' };
};

const claimCoupon = async ({ coupon, user, orderId }) => {
  if (coupon.maxRedemptions) {
    const atomicallyClaimed = await Coupon.findOneAndUpdate(
      { _id: coupon._id, redemptions: { $lt: coupon.maxRedemptions } },
      { $inc: { redemptions: 1 } },
      { new: true }
    );
    if (!atomicallyClaimed) return false;
  }

  await Claim.create({ coupon: coupon._id, student: user._id, orderId });
  return true;
};

module.exports = { validateCouponForUser, claimCoupon, userInAllowedGroups };