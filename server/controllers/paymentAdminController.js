const Payment = require('../models/Payment');
const Coupon = require('../models/Coupon');
const Group = require('../models/Group');
const { CATALOG } = require('./paymentController');

const getPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const [payments, total] = await Promise.all([
      Payment.find({})
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate('student', 'name fullName email studentId')
        .populate('coupon', 'code')
        .lean(),
      Payment.countDocuments({})
    ]);

    res.json({ success: true, payments, total, page: pageNum, limit: limitNum });
  } catch (err) {
    next(err);
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const from = req.query.from ? new Date(req.query.from) : null;
    const to = req.query.to ? new Date(req.query.to) : null;

    const match = { status: 'PAID' };
    const range = {};
    if (from) range.$gte = from;
    if (to) range.$lte = to;
    if (Object.keys(range).length) match.capturedAt = range;

    const [revenueByDay, revenueByPurpose, revenueByMethod, couponReport, totals] = await Promise.all([
      Payment.aggregate([
        { $match: match },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$capturedAt' } },
            revenue: { $sum: '$payableAmountPaise' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Payment.aggregate([
        { $match: match },
        { $group: { _id: '$purpose', revenue: { $sum: '$payableAmountPaise' }, count: { $sum: 1 } } },
        { $sort: { revenue: -1 } }
      ]),
      Payment.aggregate([
        { $match: { ...match, method: { $exists: true, $ne: '' } } },
        { $group: { _id: '$method', revenue: { $sum: '$payableAmountPaise' }, count: { $sum: 1 } } },
        { $sort: { revenue: -1 } }
      ]),
      Payment.aggregate([
        { $match: { ...match, coupon: { $exists: true, $ne: null } } },
        { $lookup: { from: 'coupons', localField: 'coupon', foreignField: '_id', as: 'c' } },
        { $unwind: { path: '$c', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: '$coupon',
            code: { $first: '$c.code' },
            revenue: { $sum: '$payableAmountPaise' },
            discounts: { $sum: '$discountPaise' },
            redemptions: { $sum: 1 }
          }
        },
        { $sort: { revenue: -1 } }
      ]),
      Payment.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$payableAmountPaise' },
            totalDiscounts: { $sum: '$discountPaise' },
            totalOrders: { $sum: 1 }
          }
        }
      ])
    ]);

    const total = totals[0] || { totalRevenue: 0, totalDiscounts: 0, totalOrders: 0 };
    res.json({
      success: true,
      totals: {
        totalRevenuePaise: total.totalRevenue,
        totalDiscountPaise: total.totalDiscounts,
        totalOrders: total.totalOrders,
        avgOrderPaise: total.totalOrders ? Math.round(total.totalRevenue / total.totalOrders) : 0,
        catalog: CATALOG
      },
      revenueByDay,
      revenueByPurpose,
      revenueByMethod,
      couponReport
    });
  } catch (err) {
    next(err);
  }
};

const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({})
      .sort({ createdAt: -1 })
      .populate('groupIds', 'name')
      .populate('studentIds', 'name fullName email')
      .lean();
    res.json({ success: true, coupons });
  } catch (err) {
    next(err);
  }
};

const createCoupon = async (req, res, next) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      scope = 'ALL',
      studentIds = [],
      groupIds = [],
      validFrom,
      validUntil,
      perUserLimit = 1,
      maxRedemptions = 0,
      active = true
    } = req.body;

    if (!code || !discountType || discountValue === undefined || !validFrom || !validUntil) {
      return res.status(400).json({ success: false, message: 'Missing required coupon fields' });
    }

    const existing = await Coupon.findOne({ code: code.toString().trim().toUpperCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code: code.toString().trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      scope,
      studentIds: scope === 'STUDENTS' ? studentIds : [],
      groupIds: scope === 'GROUP' ? groupIds : [],
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      perUserLimit: Number(perUserLimit),
      maxRedemptions: Number(maxRedemptions),
      active
    });

    res.status(201).json({ success: true, coupon });
  } catch (err) {
    next(err);
  }
};

const updateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowed = [
      'code',
      'discountType',
      'discountValue',
      'scope',
      'studentIds',
      'groupIds',
      'validFrom',
      'validUntil',
      'perUserLimit',
      'maxRedemptions',
      'active'
    ];

    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (updates.validFrom) updates.validFrom = new Date(updates.validFrom);
    if (updates.validUntil) updates.validUntil = new Date(updates.validUntil);
    if (updates.code) updates.code = updates.code.toString().trim().toUpperCase();

    const coupon = await Coupon.findByIdAndUpdate(id, { $set: updates }, { new: true });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    res.json({ success: true, coupon });
  } catch (err) {
    next(err);
  }
};

const deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (err) {
    next(err);
  }
};

const getGroups = async (req, res, next) => {
  try {
    const groups = await Group.find({}).populate('memberIds', 'name fullName email studentId').lean();
    res.json({ success: true, groups });
  } catch (err) {
    next(err);
  }
};

const createGroup = async (req, res, next) => {
  try {
    const { name, memberIds = [] } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Group name is required' });
    }

    const existing = await Group.findOne({ name: name.toString().trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Group already exists' });
    }

    const group = await Group.create({ name: name.toString().trim(), memberIds });
    res.status(201).json({ success: true, group });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPayments,
  getAnalytics,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getGroups,
  createGroup
};