const express = require('express');
const router = express.Router();
const { getQuestions, createQuestion, generateAIQuestions } = require('../controllers/questionController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', getQuestions);
router.post('/', protect, authorize('ADMIN', 'HR'), createQuestion);

module.exports = router;
