const express = require('express');
const router = express.Router();
const { getPlacementOpportunities } = require('../controllers/placementController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getPlacementOpportunities);

module.exports = router;
