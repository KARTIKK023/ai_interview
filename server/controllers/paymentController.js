const Payment = require('../models/Payment');
const Coupon = require('../models/Coupon');
const { validateCouponForUser, claimCoupon } = require('../services/couponService');
const { grantEntitlement } = require('../services/entitlementService');
const {
  PAYMENTS_ENABLED,
  RAZORPAY_MODE,
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET,
  RAZORPAY_WEBHOOK_SECRET,
  razorpay
} = require('../config/razorpay');
const { validatePaymentVerification, validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils');

const CATALOG = {
  FULL_ACCESS: 499
};

const assertPaymentsEnabled = () => {
  if (!PAYMENTS_ENABLED || !razorpay) {
    const err = new Error('Payments are not enabled yet. Add Razorpay keys to server/.env');
    err.statusCode = 503;
    throw err;
  }
};

const createOrder = async (req, res, next) => {
  try {
    assertPaymentsEnabled();

    const { purpose = 'FULL_ACCESS', couponCode } = req.body;

    const basePrice = CATALOG[purpose];
    if (!basePrice) {
      return res.status(400).json({ success: false, message: 'Unknown purpose' });
    }
    const baseAmountPaise = basePrice * 100;

    let discountPaise = 0;
    let coupon = null;

    if (couponCode && typeof couponCode === 'string' && couponCode.trim()) {
      coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase(), active: true });
      const verdict = await validateCouponForUser({
        coupon,
        user: req.user,
        baseAmountPaise,
        now: Date.now()
      });
      if (verdict.ok) {
        const claimed = await claimCoupon({ coupon, user: req.user, orderId: null });
        if (claimed) {
          discountPaise = verdict.discountPaise;
        }
      }
    }

    const payable = Math.max(baseAmountPaise - discountPaise, 1);

    let rzOrder;
    try {
      rzOrder = await razorpay.orders.create({
        amount: payable,
        currency: 'INR',
        receipt: 'pay_' + Date.now() + '_' + req.user._id,
        notes: { studentId: req.user._id.toString(), purpose, couponCode: couponCode || '' }
      });
    } catch (rzErr) {
      console.error('Razorpay order creation failed:', rzErr.message);
      return res.status(502).json({ success: false, message: 'Failed to create Razorpay order' });
    }

    const payment = await Payment.create({
      student: req.user._id,
      purpose,
      baseAmountPaise,
      discountPaise,
      payableAmountPaise: payable,
      coupon: coupon?._id || null,
      razorpayOrderId: rzOrder.id,
      status: 'CREATED',
      notes: { couponCode: couponCode || '' }
    });

    res.status(201).json({
      success: true,
      keyId: RAZORPAY_KEY_ID,
      orderId: rzOrder.id,
      amount: payable,
      paymentId: payment._id
    });
  } catch (err) {
    next(err);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    assertPaymentsEnabled();

    const { orderId, paymentId, signature } = req.body;
    const payment = await Payment.findOne({ razorpayOrderId: orderId, student: req.user._id });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const ok = validatePaymentVerification(
      { order_id: orderId, payment_id: paymentId },
      signature,
      RAZORPAY_KEY_SECRET
    );

    if (!ok) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    payment.razorpayPaymentId = paymentId;
    if (payment.status === 'CREATED') {
      payment.status = 'VERIFIED';
    }
    await payment.save();

    res.json({ success: true, message: 'Payment verified' });
  } catch (err) {
    next(err);
  }
};

const webhook = async (req, res) => {
  if (!PAYMENTS_ENABLED) {
    return res.status(503).json({ success: false });
  }

  const rawBody = req.body?.toString ? req.body.toString() : '';
  const signature = req.headers['x-razorpay-signature'];

  if (!rawBody || !validateWebhookSignature(rawBody, signature, RAZORPAY_WEBHOOK_SECRET)) {
    return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch (err) {
    return res.status(400).json({ success: false, message: 'Invalid webhook body' });
  }

  const { event } = payload;
  const entity = payload.payload?.payment?.entity || {};

  try {
    if (event === 'order.paid' || event === 'payment.captured') {
      const orderId = entity.order_id;
      const updated = await Payment.findOneAndUpdate(
        { razorpayOrderId: orderId, status: { $ne: 'PAID' } },
        {
          $set: {
            status: 'PAID',
            razorpayPaymentId: entity.id,
            method: entity.method || '',
            fee: entity.fee || 0,
            capturedAt: entity.created_at ? new Date(entity.created_at * 1000) : new Date()
          }
        },
        { new: true }
      );
      if (updated) {
        await grantEntitlement(updated);
      }
    } else if (event === 'payment.failed') {
      const orderId = entity.order_id;
      await Payment.updateOne(
        { razorpayOrderId: orderId, status: 'CREATED' },
        { $set: { status: 'FAILED' } }
      );
    }
  } catch (err) {
    console.error('Webhook handler error:', err.message);
    res.status(500).json({ success: false });
    return;
  }

  res.json({ success: true });
};

const getMyPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ student: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('coupon', 'code')
      .lean();
    res.json({ success: true, payments });
  } catch (err) {
    next(err);
  }
};

const getEntitlements = async (req, res, next) => {
  try {
    const latest = await Payment.findOne({ student: req.user._id, status: 'PAID' }).sort({ capturedAt: -1 }).lean();
    res.json({
      success: true,
      accessUnlocked: !!req.user.accessUnlocked,
      unlockedAt: req.user.unlockedAt || null,
      latestPayment: latest ? { purpose: latest.purpose, amountPaise: latest.payableAmountPaise, capturedAt: latest.capturedAt } : null,
      activeMode: RAZORPAY_MODE
    });
  } catch (err) {
    next(err);
  }
};

const applyCouponPreview = async (req, res, next) => {
  try {
    assertPaymentsEnabled();

    const { purpose = 'FULL_ACCESS', couponCode } = req.body;

    const basePrice = CATALOG[purpose];
    if (!basePrice) {
      return res.status(400).json({ success: false, message: 'Unknown purpose' });
    }
    const baseAmountPaise = basePrice * 100;

    if (!couponCode || typeof couponCode !== 'string' || !couponCode.trim()) {
      return res.status(400).json({ success: false, code: codeMessage('EMPTY'), message: 'Enter a coupon code.' });
    }

    const coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase(), active: true });
    const verdict = await validateCouponForUser({
      coupon,
      user: req.user,
      baseAmountPaise,
      now: Date.now()
    });

    if (!verdict.ok) {
      return res.status(400).json({ success: false, code: verdict.reason, message: codeMessage(verdict.reason) });
    }

    res.json({
      success: true,
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      baseAmountPaise,
      discountPaise: verdict.discountPaise,
      finalAmountPaise: Math.max(baseAmountPaise - verdict.discountPaise, 1)
    });
  } catch (err) {
    next(err);
  }
};

const codeMessage = (reason) => {
  switch (reason) {
    case 'EMPTY': return 'Enter a coupon code.';
    case 'INVALID': return 'This coupon code is not valid.';
    case 'EXPIRED': return 'This coupon has expired.';
    case 'NOT_ELIGIBLE': return 'This coupon is not applicable for your account.';
    default: return 'This coupon code is not valid.';
  }
};

module.exports = { createOrder, verifyPayment, webhook, getMyPayments, getEntitlements, applyCouponPreview, CATALOG };