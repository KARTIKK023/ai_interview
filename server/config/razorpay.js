const Razorpay = require('razorpay');
const dotenv = require('dotenv');

dotenv.config();

const RAZORPAY_MODE = process.env.RAZORPAY_MODE || 'test';

const CREDS =
  RAZORPAY_MODE === 'live'
    ? {
        key_id: (process.env.RAZORPAY_LIVE_KEY_ID || '').trim(),
        key_secret: (process.env.RAZORPAY_LIVE_KEY_SECRET || '').trim(),
        webhook_secret: (process.env.RAZORPAY_LIVE_WEBHOOK_SECRET || '').trim()
      }
    : {
        key_id: (process.env.RAZORPAY_TEST_KEY_ID || '').trim(),
        key_secret: (process.env.RAZORPAY_TEST_KEY_SECRET || '').trim(),
        webhook_secret: (process.env.RAZORPAY_TEST_WEBHOOK_SECRET || '').trim()
      };

const PAYMENTS_ENABLED = !!(
  process.env.PAYMENTS_ENABLED === 'true' &&
  CREDS.key_id &&
  CREDS.key_secret &&
  CREDS.webhook_secret
);

const razorpay = PAYMENTS_ENABLED
  ? new Razorpay({ key_id: CREDS.key_id, key_secret: CREDS.key_secret })
  : null;

module.exports = {
  PAYMENTS_ENABLED,
  RAZORPAY_MODE,
  RAZORPAY_KEY_ID: CREDS.key_id,
  RAZORPAY_KEY_SECRET: CREDS.key_secret,
  RAZORPAY_WEBHOOK_SECRET: CREDS.webhook_secret,
  razorpay
};