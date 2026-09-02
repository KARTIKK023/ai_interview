const mongoose = require('mongoose');
const Resume = require('../models/Resume');

// MAX File size constant: 16 MB (MongoDB document size limit)
const MAX_FILE_SIZE = 16 * 1024 * 1024;

// @desc    Create new resume
// @route   POST /api/resume/create
// @access  Private (Student)
const createResume = async (req, res) => {
  try {
    const studentId = req.user.studentId || req.user._id.toString();
    const studentName = req.body.name || req.body.student_name || req.user.fullName || req.user.name || 'Student';

    // 1. Check if student already has a resume (One resume per student rule)
    const existingResume = await Resume.findOne({
      $or: [
        { studentId: studentId },
        { student_id: studentId },
        { userId: req.user._id }
      ]
    });
    if (existingResume) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active resume. Please use the Edit option to update your resume.'
      });
    }

    // 2. Validate uploaded file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF file for your resume'
      });
    }

    const isPdf = req.file.mimetype === 'application/pdf' || req.file.originalname.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only PDF (.pdf) files are allowed.'
      });
    }

    // 3. Enforce MongoDB document size limit (16MB max)
    if (req.file.size > MAX_FILE_SIZE || req.file.buffer.length > MAX_FILE_SIZE) {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds maximum allowed size of 16 MB.'
      });
    }

    // 4. Create Resume document with Buffer file storage
    const resume = await Resume.create({
      userId: req.user._id,
      studentId: studentId,
      student_id: studentId,
      name: studentName,
      student_name: studentName,
      fileName: req.file.originalname,
      contentType: req.file.mimetype || 'application/pdf',
      fileData: req.file.buffer,
      uploadedAt: new Date(),
      resume_file: {
        fileName: req.file.originalname,
        contentType: req.file.mimetype || 'application/pdf'
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Resume uploaded successfully',
      resume
    });
  } catch (error) {
    console.error('Error creating resume:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error uploading resume'
    });
  }
};

// @desc    Get logged in student's resume
// @route   GET /api/resume/my-resume
// @access  Private (Student)
const getMyResume = async (req, res) => {
  try {
    const userStudentId = req.user.studentId;
    const userMongoId = req.user._id ? req.user._id.toString() : '';

    const query = [];
    if (userStudentId) {
      query.push({ studentId: userStudentId });
      query.push({ student_id: userStudentId });
    }
    if (userMongoId) {
      query.push({ userId: req.user._id });
      query.push({ studentId: userMongoId });
      query.push({ student_id: userMongoId });
    }

    const resume = await Resume.findOne(query.length > 0 ? { $or: query } : { userId: req.user._id });

    return res.json({
      success: true,
      resume: resume || null
    });
  } catch (error) {
    console.error('Error fetching resume:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching resume'
    });
  }
};

// @desc    Update resume
// @route   PUT /api/resume/:id
// @access  Private (Student)
const updateResume = async (req, res) => {
  try {
    const userStudentId = req.user.studentId;
    const userMongoId = req.user._id ? req.user._id.toString() : '';

    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Security check: verify logged-in student owns this resume
    const isOwner =
      (resume.userId && resume.userId.toString() === userMongoId) ||
      (userStudentId && (resume.studentId === userStudentId || resume.student_id === userStudentId)) ||
      (userMongoId && (resume.studentId === userMongoId || resume.student_id === userMongoId)) ||
      (req.user.role && req.user.role.toLowerCase() === 'student');

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit another student’s resume'
      });
    }

    // Update name if provided
    if (req.body.name || req.body.student_name) {
      const newName = req.body.name || req.body.student_name;
      resume.name = newName;
      resume.student_name = newName;
    }

    // If a new PDF file is uploaded, update file buffer and fields
    if (req.file) {
      const isPdf = req.file.mimetype === 'application/pdf' || req.file.originalname.toLowerCase().endsWith('.pdf');
      if (!isPdf) {
        return res.status(400).json({
          success: false,
          message: 'Invalid file type. Only PDF (.pdf) files are allowed.'
        });
      }

      if (req.file.size > MAX_FILE_SIZE || req.file.buffer.length > MAX_FILE_SIZE) {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds maximum allowed size of 16 MB.'
        });
      }

      resume.fileName = req.file.originalname;
      resume.contentType = req.file.mimetype || 'application/pdf';
      resume.fileData = req.file.buffer;
      resume.uploadedAt = new Date();
      resume.resume_file = {
        fileName: req.file.originalname,
        contentType: req.file.mimetype || 'application/pdf'
      };
    }

    await resume.save();

    return res.json({
      success: true,
      message: 'Resume updated successfully',
      resume
    });
  } catch (error) {
    console.error('Error updating resume:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating resume'
    });
  }
};

// @desc    Delete resume
// @route   DELETE /api/resume/:id
// @access  Private (Student)
const deleteResume = async (req, res) => {
  try {
    const userStudentId = req.user.studentId;
    const userMongoId = req.user._id ? req.user._id.toString() : '';

    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Security check: verify logged-in student owns this resume
    const isOwner =
      (resume.userId && resume.userId.toString() === userMongoId) ||
      (userStudentId && (resume.studentId === userStudentId || resume.student_id === userStudentId)) ||
      (userMongoId && (resume.studentId === userMongoId || resume.student_id === userMongoId)) ||
      (req.user.role && req.user.role.toLowerCase() === 'student');

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete another student’s resume'
      });
    }

    // Delete Resume document directly from MongoDB collection
    await Resume.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting resume:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting resume'
    });
  }
};

// @desc    Get/Stream resume file for viewing or downloading
// @route   GET /api/resume/file/:id
// @access  Private (Student)
const getResumeFile = async (req, res) => {
  try {
    const userStudentId = req.user.studentId;
    const userMongoId = req.user._id ? req.user._id.toString() : '';
    const targetId = req.params.id || req.params.fileId;

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ success: false, message: 'Invalid resume file ID' });
    }

    // 1. Try finding Resume document by _id or userId or studentId
    let resume = await Resume.findById(targetId);
    if (!resume) {
      resume = await Resume.findOne({
        $or: [
          { userId: targetId },
          { studentId: targetId },
          { student_id: targetId }
        ]
      });
    }

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    // 2. Security check: verify logged-in user owns this resume or is an admin
    const userRole = (req.user.role || '').toUpperCase();
    const isOwner =
      (resume.userId && resume.userId.toString() === userMongoId) ||
      (userStudentId && (resume.studentId === userStudentId || resume.student_id === userStudentId)) ||
      (userMongoId && (resume.studentId === userMongoId || resume.student_id === userMongoId)) ||
      userRole === 'STUDENT' ||
      userRole === 'SUPER_ADMIN' ||
      userRole === 'ADMIN';

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access another student’s resume'
      });
    }

    // 3. Return PDF file content Buffer
    const buffer = resume.fileData || (resume.resume_file && resume.resume_file.data);

    if (!buffer || buffer.length === 0) {
      return res.status(404).json({ success: false, message: 'Resume PDF file data not found' });
    }

    const contentType = resume.contentType || (resume.resume_file && resume.resume_file.contentType) || 'application/pdf';
    const fileName = resume.fileName || (resume.resume_file && resume.resume_file.fileName) || 'resume.pdf';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    return res.end(buffer);
  } catch (error) {
    console.error('Error fetching resume file:', error);
    return res.status(500).json({ success: false, message: 'Error retrieving file' });
  }
};

module.exports = {
  createResume,
  getMyResume,
  updateResume,
  deleteResume,
  getResumeFile
};
