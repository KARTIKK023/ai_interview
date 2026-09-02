const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const {
  sendOtp,
  verifyOtp,
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  getProfileProgress,
  uploadProfilePhoto
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Storage configuration for profile photos
const uploadsDir = path.join(__dirname, '../uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `profile-${req.user._id}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  }
});

const uploadPhoto = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedMimeTypes.includes(file.mimetype) || ['.jpg', '.jpeg', '.png'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG and PNG images are allowed'), false);
    }
  }
});

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/profile-progress', protect, getProfileProgress);

// Upload profile photo endpoint
router.post('/upload-photo', protect, (req, res, next) => {
  uploadPhoto.single('photo')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'Image size must be less than 2MB' });
      }
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    uploadProfilePhoto(req, res, next);
  });
});

module.exports = router;
