const express = require('express');

const router = express.Router();

const {
  createSupportMessage,
  getMySupportMessages,
} = require('../controllers/supportController');

// IMPORTANT:
// Your authMiddleware exports { protect }
const { protect } = require('../middleware/authMiddleware');

// ============================================================
// CREATE SUPPORT REQUEST
// ============================================================

router.post(
  '/messages',
  protect,
  createSupportMessage
);

// ============================================================
// GET CURRENT STUDENT SUPPORT HISTORY
// ============================================================

router.get(
  '/messages/my',
  protect,
  getMySupportMessages
);

module.exports = router;