const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  createResume,
  getMyResume,
  updateResume,
  deleteResume,
  getResumeFile
} = require('../controllers/resumeController');

// Multer in-memory storage for Buffer storage in MongoDB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 16 * 1024 * 1024 }, // 16MB limit (MongoDB BSON document limit)
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/pdf' ||
      file.originalname.toLowerCase().endsWith('.pdf')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF (.pdf) files are allowed'), false);
    }
  }
});

// Protect all routes and enforce student role
router.post('/create', protect, authorize('student', 'STUDENT'), upload.single('resume'), createResume);
router.get('/my-resume', protect, authorize('student', 'STUDENT'), getMyResume);
router.put('/:id', protect, authorize('student', 'STUDENT'), upload.single('resume'), updateResume);
router.delete('/:id', protect, authorize('student', 'STUDENT'), deleteResume);
router.get('/file/:id', protect, getResumeFile);
router.get('/file/:fileId', protect, getResumeFile);

module.exports = router;
