const express = require('express');

const router = express.Router();

const {
  createSupportMessage,
  getMySupportMessages,
  getAllSupportMessages,
  sendSupportReply
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

// ============================================================
// SUPER ADMIN - GET ALL INQUIRIES
// ============================================================

router.get(
  '/messages',
  protect,
  getAllSupportMessages
);
// reply 
router.post(
  '/messages/reply',
  protect,
  sendSupportReply
);

module.exports = router;