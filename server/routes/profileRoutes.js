const express = require('express');
const router = express.Router();
const { getProfileProgress } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/profile/progress
// @access  Private
router.get('/progress', protect, getProfileProgress);

module.exports = router;
