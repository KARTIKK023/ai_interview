const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  createInterview,
  startInterview,
  submitAnswer,
  submitVideoAnswer,
  submitFullInterview,
  completeInterview,
  stopInterview,
  getInterviews,
  getInterviewById,
  deleteInterview,
  getStudentCertificates,
  getStudentCertificateById
} = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `video_${Date.now()}_${file.originalname}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

router.use(protect);

router.get('/student/certificates', getStudentCertificates);
router.get('/student/certificates/:id', getStudentCertificateById);

router.route('/')
  .post(createInterview)
  .get(getInterviews);

router.route('/:id')
  .get(getInterviewById)
  .delete(deleteInterview);

router.post('/:id/start', startInterview);
router.post('/:id/answer', submitAnswer);
router.post('/:id/video-answer', upload.single('video'), submitVideoAnswer);
router.post('/:id/submit', submitFullInterview);
router.post('/:id/complete', completeInterview);
router.post('/:id/stop', stopInterview);

module.exports = router;
