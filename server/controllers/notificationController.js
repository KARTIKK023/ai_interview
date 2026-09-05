const User = require('../models/User');
const MockInterview = require('../models/Interview');

const {
  sendNotificationEmail,
  sendScoreBasedNotificationEmail
} = require('../services/emailService');

const sendNotification = async (req, res, next) => {
  try {

    const { studentIds, subject: customSubject, message: customMessage } = req.body;

    // Check students selected
    if (
      !studentIds ||
      !Array.isArray(studentIds) ||
      studentIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one student.'
      });
    }


    // Find selected registered students
    const students = await User.find({
      _id: { $in: studentIds },
      isActive: { $ne: false }
    });


    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No registered students found.'
      });
    }


    const emailSubject = customSubject || 'Your Interview Journey Starts Here!';
    const emailMessage = customMessage || 'Get access to AI-powered mock interviews, personalized feedback & performance tracking. Upgrade now and prepare smarter for your next interview.';

    // Send email to every selected student
    const results = [];

    for (const student of students) {

      const result =
        await sendNotificationEmail(
          student.email,
          student.fullName || student.name || 'Student',
          emailSubject,
          emailMessage
        );


      results.push({
        studentId: student._id,
        email: student.email,
        success: result.success
      });

    }


    const successCount =
      results.filter(
        (result) => result.success
      ).length;


    const failedCount =
      results.length - successCount;


    return res.status(200).json({

      success: true,

      message:
        `Notification sent successfully to ${successCount} student(s).`,

      totalSelected:
        studentIds.length,

      successCount,

      failedCount,

      results

    });


  } catch (error) {

    console.error(
      'SEND NOTIFICATION ERROR:',
      error
    );


    next(error);

  }
};

const sendScoreBasedNotification = async (req, res, next) => {
  try {

    const { interviewIds, subject: customSubject, message: customMessage } = req.body;

    // Check interviews selected
    if (
      !interviewIds ||
      !Array.isArray(interviewIds) ||
      interviewIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one interview.'
      });
    }

    // Find selected interviews
    const interviews = await MockInterview
      .find({
        _id: { $in: interviewIds }
      })
      .populate(
        'candidateId',
        'fullName name email'
      );

    if (interviews.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No selected interviews found.'
      });
    }

    const results = [];

    // Send score-based email
    for (const interview of interviews) {

      const student = interview.candidateId;

      if (!student || !student.email) {

        results.push({
          interviewId: interview._id,
          success: false,
          message: 'Student email not found.'
        });

        continue;
      }

      // IMPORTANT:
      // Status is NOT considered.
      // Only score is considered.
      const score = Number(
        interview.score ??
        interview.percentage ??
        0
      );

      const result =
        await sendScoreBasedNotificationEmail(
          student.email,
          student.fullName ||
          student.name ||
          'Student',
          score,
          customSubject,
          customMessage
        );

      results.push({
        interviewId: interview._id,
        studentId: student._id,
        email: student.email,
        score,
        success: result.success,
        messageId: result.messageId
      });
    }

    const successCount =
      results.filter(
        result => result.success
      ).length;

    const failedCount =
      results.length - successCount;

    return res.status(200).json({

      success: true,

      message:
        `Performance message sent to ${successCount} student(s).`,

      totalSelected:
        interviewIds.length,

      successCount,

      failedCount,

      results

    });

  } catch (error) {

    console.error(
      'SEND SCORE NOTIFICATION ERROR:',
      error
    );

    next(error);
  }
};

module.exports = {
  sendNotification,
  sendScoreBasedNotification
};