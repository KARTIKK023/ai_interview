const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getScans,
  getScanById,
  createScan,
  deleteScan,
  optimizeScan,
  updateTailoredResume,
  downloadOptimizedResume
} = require('../controllers/atsController');

const router = express.Router();

router.use(protect);
router.get('/scans', getScans);
router.get('/scans/:id', getScanById);
router.post('/scan', createScan);
router.delete('/scans/:id', deleteScan);
router.post('/scans/:id/optimize', optimizeScan);
router.put('/scans/:id/tailored-resume', updateTailoredResume);
router.get('/scans/:id/optimized-resume', downloadOptimizedResume);

module.exports = router;
