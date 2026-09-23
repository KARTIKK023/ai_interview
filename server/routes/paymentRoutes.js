const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  getMyPayments,
  getEntitlements,
  applyCouponPreview,
  CATALOG
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/catalog', (req, res) => {
  res.json({ success: true, catalog: CATALOG, paymentsEnabled: true });
});

router.use(protect);

router.post('/create-order', createOrder);
router.post('/apply-coupon', applyCouponPreview);
router.post('/verify', verifyPayment);
router.get('/my-payments', getMyPayments);
router.get('/entitlements', getEntitlements);

module.exports = router;