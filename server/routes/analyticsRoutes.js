const express = require('express');
const router = express.Router();
const { getStudentAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/student', getStudentAnalytics);

module.exports = router;
