const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Otp = require('../models/Otp');
const { sendOtpEmail } = require('../services/emailService');
const { generateStudentId } = require('../utils/studentIdGenerator');
const { calculateProfileProgress } = require('../services/profileProgressService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'ai_interview_secret_key_2026_super_secure', {
    expiresIn: '30d'
  });
};

// @desc    Send 6-digit OTP to email for registration
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = async (req, res, next) => {
  try {
    const { fullName, name, email } = req.body;

    const studentName = (fullName || name || 'Student').trim();
    const normalizedEmail = (email || '').toLowerCase().trim();

    if (!normalizedEmail) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ success: false, message: 'Invalid email' });
    }

    // Check if user already exists in MongoDB
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Cooldown rate limit check (60 seconds)
    const existingOtp = await Otp.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });
    if (existingOtp) {
      const timeDiffSeconds = Math.floor((Date.now() - new Date(existingOtp.createdAt).getTime()) / 1000);
      if (timeDiffSeconds < 60) {
        const remaining = 60 - timeDiffSeconds;
        return res.status(429).json({
          success: false,
          message: `Please wait ${remaining} seconds before requesting a new OTP`
        });
      }
    }

    // Invalidate previous OTPs for this email
    await Otp.deleteMany({ email: normalizedEmail });

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = Otp.hashOtp(otp);

    // Save hashed OTP in DB with 5-minute expiration
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await Otp.create({
      email: normalizedEmail,
      otpHash,
      expiresAt
    });

    // Send OTP via Nodemailer SMTP (never logging OTP)
    await sendOtpEmail(normalizedEmail, otp, studentName);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email and OTP' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const otpHash = Otp.hashOtp(otp.trim());

    const otpRecord = await Otp.findOne({ email: normalizedEmail, otpHash });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    if (new Date() > new Date(otpRecord.expiresAt)) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    // Mark OTP record as verified
    otpRecord.verified = true;
    await otpRecord.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Register Student user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { fullName, name, email, mobileNumber, phone, password, confirmPassword, otp } = req.body;

    const studentName = (fullName || name || '').trim();
    const studentMobile = (mobileNumber || phone || '').trim();
    const normalizedEmail = (email || '').toLowerCase().trim();

    // Backend Enforcement: Check if OTP was verified for this email OR verify matching OTP
    let isEmailOtpVerified = false;
    if (otp) {
      const otpHash = Otp.hashOtp(otp.trim());
      const otpRecord = await Otp.findOne({ email: normalizedEmail, otpHash });
      if (otpRecord && new Date() <= new Date(otpRecord.expiresAt)) {
        isEmailOtpVerified = true;
      }
    }

    if (!isEmailOtpVerified) {
      const verifiedOtpRecord = await Otp.findOne({ email: normalizedEmail, verified: true });
      if (verifiedOtpRecord && new Date() <= new Date(verifiedOtpRecord.expiresAt)) {
        isEmailOtpVerified = true;
      }
    }

    if (!isEmailOtpVerified) {
      return res.status(400).json({
        success: false,
        message: 'Please verify your email before creating your account.'
      });
    }

    // Field Validations on Registration
    if (!studentName) {
      return res.status(400).json({ success: false, message: 'Full name is required' });
    }

    if (!normalizedEmail) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ success: false, message: 'Invalid email' });
    }

    if (!studentMobile) {
      return res.status(400).json({ success: false, message: 'Mobile number is required' });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    // Check if email already registered
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Force role: "student" for public registration
    const role = 'student';

    // Generate unique Student ID on backend (STU-YYYY-XXXXX)
    const studentId = await generateStudentId();

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create student in MongoDB Atlas
    const user = await User.create({
      studentId,
      fullName: studentName,
      name: studentName,
      email: normalizedEmail,
      password: hashedPassword,
      mobileNumber: studentMobile,
      role,
      emailVerified: true,
      profile: {
        phone: studentMobile
      }
    });

    // Invalidate OTP after successful account creation
    await Otp.deleteMany({ email: normalizedEmail });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        _id: user._id,
        studentId: user.studentId,
        fullName: user.fullName || user.name,
        name: user.fullName || user.name,
        email: user.email,
        mobileNumber: user.mobileNumber || user.profile?.phone || '',
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    const token = generateToken(user._id);

    const userObj = {
      id: user._id,
      _id: user._id,
      fullName: user.fullName || user.name,
      name: user.fullName || user.name,
      email: user.email,
      mobileNumber: user.mobileNumber || user.profile?.phone || '',
      role: user.role,
      profilePhoto: user.profilePhoto || user.profile?.profilePhoto || '',
      dateOfBirth: user.dateOfBirth || user.profile?.dateOfBirth || '',
      gender: user.gender || user.profile?.gender || '',
      location: user.location || user.profile?.location || '',
      bio: user.bio || user.profile?.bio || '',
      education: user.education || user.profile?.education || {},
      professionalLinks: user.professionalLinks || user.profile?.professionalLinks || {},
      profile: user.profile
    };

    const isStudent = (user.role || '').toLowerCase() === 'student';
    if (isStudent && (user.studentId || user.student_id)) {
      const sId = user.studentId || user.student_id;
      userObj.studentId = sId;
      userObj.student_id = sId;
    }

    res.json({
      success: true,
      token,
      user: userObj
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  const userObj = {
    id: req.user._id,
    _id: req.user._id,
    fullName: req.user.fullName || req.user.name,
    name: req.user.fullName || req.user.name,
    email: req.user.email,
    mobileNumber: req.user.mobileNumber || req.user.profile?.phone || '',
    role: req.user.role,
    profilePhoto: req.user.profilePhoto || req.user.profile?.profilePhoto || '',
    dateOfBirth: req.user.dateOfBirth || req.user.profile?.dateOfBirth || '',
    gender: req.user.gender || req.user.profile?.gender || '',
    location: req.user.location || req.user.profile?.location || '',
    bio: req.user.bio || req.user.profile?.bio || '',
    education: req.user.education || req.user.profile?.education || {},
    professionalLinks: req.user.professionalLinks || req.user.profile?.professionalLinks || {},
    profile: req.user.profile
  };

  const isStudent = (req.user.role || '').toLowerCase() === 'student';
  if (isStudent && (req.user.studentId || req.user.student_id)) {
    const sId = req.user.studentId || req.user.student_id;
    userObj.studentId = sId;
    userObj.student_id = sId;
  }

  res.json({
    success: true,
    user: userObj
  });
};

// @desc    Get dynamic profile progress calculation
// @route   GET /api/profile/progress or GET /api/auth/profile-progress
// @access  Private
const getProfileProgress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const progressData = await calculateProfileProgress(user);
    res.status(200).json({
      success: true,
      ...progressData
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Extract education inputs safely from root or profile
    const inputEdu = req.body.education || req.body.profile?.education || {};
    const existingEdu = user.education || user.profile?.education || {};

    const educationObj = {
      highestQualification: inputEdu.highestQualification ?? existingEdu.highestQualification ?? '',
      collegeUniversity: inputEdu.collegeUniversity ?? existingEdu.collegeUniversity ?? existingEdu.college ?? '',
      degree: inputEdu.degree ?? existingEdu.degree ?? '',
      specialization: inputEdu.specialization ?? existingEdu.specialization ?? '',
      graduationYear: inputEdu.graduationYear ?? existingEdu.graduationYear ?? '',
      cgpaPercentage: inputEdu.cgpaPercentage ?? existingEdu.cgpaPercentage ?? existingEdu.cgpa ?? ''
    };

    // Extract professionalLinks inputs safely from root or profile
    const inputLinks = req.body.professionalLinks || req.body.profile?.professionalLinks || {};
    const existingLinks = user.professionalLinks || user.profile?.professionalLinks || {};

    const professionalLinksObj = {
      linkedin: inputLinks.linkedin ?? existingLinks.linkedin ?? '',
      portfolio: inputLinks.portfolio ?? existingLinks.portfolio ?? '',
      other: inputLinks.other ?? existingLinks.other ?? existingLinks.otherLink ?? ''
    };

    // Update names
    if (req.body.fullName) {
      user.fullName = req.body.fullName;
      user.name = req.body.fullName;
    } else if (req.body.name) {
      user.name = req.body.name;
      user.fullName = req.body.name;
    }

    // Update mobile
    if (req.body.mobileNumber) {
      user.mobileNumber = req.body.mobileNumber;
    }

    // Update personal fields
    const profilePhoto = req.body.profilePhoto ?? req.body.profile?.profilePhoto ?? user.profilePhoto ?? user.profile?.profilePhoto ?? '';
    const dateOfBirth = req.body.dateOfBirth ?? req.body.profile?.dateOfBirth ?? user.dateOfBirth ?? user.profile?.dateOfBirth ?? '';
    const gender = req.body.gender ?? req.body.profile?.gender ?? user.gender ?? user.profile?.gender ?? '';
    const location = req.body.location ?? req.body.profile?.location ?? user.location ?? user.profile?.location ?? '';
    const bio = req.body.bio ?? req.body.profile?.bio ?? user.bio ?? user.profile?.bio ?? '';

    user.profilePhoto = profilePhoto;
    user.dateOfBirth = dateOfBirth;
    user.gender = gender;
    user.location = location;
    user.bio = bio;
    user.education = educationObj;
    user.professionalLinks = professionalLinksObj;

    // Safely update user.profile nested object without causing undefined fields
    const currentProfile = user.profile ? (typeof user.profile.toObject === 'function' ? user.profile.toObject() : user.profile) : {};
    user.profile = {
      ...currentProfile,
      phone: user.mobileNumber || currentProfile.phone || '',
      bio,
      profilePhoto,
      dateOfBirth,
      gender,
      location,
      education: educationObj,
      professionalLinks: professionalLinksObj
    };

    await user.save();

    const userObj = {
      id: user._id,
      _id: user._id,
      studentId: user.studentId,
      fullName: user.fullName || user.name,
      name: user.fullName || user.name,
      email: user.email,
      mobileNumber: user.mobileNumber || user.profile?.phone || '',
      role: user.role,
      profilePhoto: user.profilePhoto || user.profile?.profilePhoto || '',
      dateOfBirth: user.dateOfBirth || user.profile?.dateOfBirth || '',
      gender: user.gender || user.profile?.gender || '',
      location: user.location || user.profile?.location || '',
      bio: user.bio || user.profile?.bio || '',
      education: educationObj,
      professionalLinks: professionalLinksObj,
      profile: user.profile
    };

    res.json({
      success: true,
      user: userObj
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload profile photo
// @route   POST /api/auth/upload-photo
// @access  Private
const uploadProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select an image file to upload' });
    }

    const photoPath = `/uploads/${req.file.filename}`;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.profilePhoto = photoPath;
    if (!user.profile) user.profile = {};
    user.profile.profilePhoto = photoPath;

    await user.save();

    const userObj = {
      id: user._id,
      _id: user._id,
      studentId: user.studentId,
      fullName: user.fullName || user.name,
      name: user.fullName || user.name,
      email: user.email,
      mobileNumber: user.mobileNumber || user.profile?.phone || '',
      role: user.role,
      profilePhoto: photoPath,
      dateOfBirth: user.dateOfBirth || user.profile?.dateOfBirth || '',
      gender: user.gender || user.profile?.gender || '',
      location: user.location || user.profile?.location || '',
      bio: user.bio || user.profile?.bio || '',
      education: user.education || user.profile?.education || {},
      professionalLinks: user.professionalLinks || user.profile?.professionalLinks || {},
      profile: user.profile
    };

    res.status(200).json({
      success: true,
      message: 'Profile photo uploaded successfully',
      profilePhoto: photoPath,
      user: userObj
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  getProfileProgress,
  uploadProfilePhoto
};
