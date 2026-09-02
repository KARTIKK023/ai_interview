const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createTargetJob,
  getMyTargetJobs,
  getTargetJobById,
  updateTargetJob,
  deleteTargetJob
} = require('../controllers/targetJobController');

// All routes require authentication
router.use(protect);

router.route('/')
  .post(createTargetJob)
  .get(getMyTargetJobs);

router.route('/:id')
  .get(getTargetJobById)
  .put(updateTargetJob)
  .delete(deleteTargetJob);

module.exports = router;
