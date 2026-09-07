const nodemailer = require('nodemailer');
const SupportMessage = require('../models/SupportMessage');

// ============================================================
// EMAIL TRANSPORTER
// ============================================================

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ============================================================
// CREATE SUPPORT MESSAGE
// ============================================================

const createSupportMessage = async (req, res) => {
  try {
    // User comes from protect middleware
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const studentId = user._id;

    const studentName =
      user.fullName ||
      user.name ||
      'Student';

    const studentEmail =
      user.email ||
      user.emailAddress;

    const subject =
      req.body.subject?.trim();

    const message =
      req.body.message?.trim();

    // ----------------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------------

    if (!studentEmail) {
      return res.status(400).json({
        success: false,
        message:
          'Student email address not found',
      });
    }

    if (!subject) {
      return res.status(400).json({
        success: false,
        message:
          'Subject is required',
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        message:
          'Message is required',
      });
    }

    // ----------------------------------------------------------
    // SAVE TO MONGODB
    // ----------------------------------------------------------

    const supportMessage =
      await SupportMessage.create({
        studentId,
        studentName,
        studentEmail,
        subject,
        message,
        status: 'Pending',
        emailStatus: 'Pending',
      });

    // ----------------------------------------------------------
    // SEND EMAIL
    // ----------------------------------------------------------

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,

        to:
          process.env.SUPPORT_EMAIL ||
          'ns3445730@gmail.com',

        replyTo: studentEmail,

        subject:
          `[HireSmart Support] ${subject}`,

        text: `
New HireSmart AI Support Request

Candidate Name:
${studentName}

Candidate Email:
${studentEmail}

Subject:
${subject}

Message:
${message}

Submitted:
${new Date().toLocaleString('en-IN')}

Support Request ID:
${supportMessage._id}
        `,

        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">

            <h2 style="color: #5146df;">
              New HireSmart AI Support Request
            </h2>

            <hr />

            <p>
              <strong>Candidate Name:</strong>
              ${studentName}
            </p>

            <p>
              <strong>Candidate Email:</strong>
              ${studentEmail}
            </p>

            <p>
              <strong>Subject:</strong>
              ${subject}
            </p>

            <p>
              <strong>Message:</strong>
            </p>

            <div
              style="
                background: #f5f5f5;
                padding: 15px;
                border-radius: 8px;
                white-space: pre-wrap;
              "
            >
              ${message}
            </div>

            <p>
              <strong>Submitted:</strong>
              ${new Date().toLocaleString('en-IN')}
            </p>

            <p>
              <strong>Support Request ID:</strong>
              ${supportMessage._id}
            </p>

          </div>
        `,
      });

      // Email successful
      supportMessage.emailStatus = 'Sent';

      await supportMessage.save();

    } catch (emailError) {

      console.error(
        'Support email error:',
        emailError
      );

      supportMessage.emailStatus = 'Failed';

      await supportMessage.save();

      return res.status(500).json({
        success: false,
        message:
          'Your support request was saved, but the email could not be sent.',
        data: supportMessage,
      });
    }

    // ----------------------------------------------------------
    // SUCCESS
    // ----------------------------------------------------------

    return res.status(201).json({
      success: true,
      message:
        'Support request submitted successfully.',
      data: supportMessage,
    });

  } catch (error) {

    console.error(
      'Create support message error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Failed to submit support request.',
    });
  }
};

// ============================================================
// GET CURRENT STUDENT SUPPORT HISTORY
// ============================================================

const getMySupportMessages = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const messages =
      await SupportMessage.find({
        studentId: user._id,
      })
        .sort({
          createdAt: -1,
        })
        .lean();

    return res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });

  } catch (error) {

    console.error(
      'Get support history error:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Failed to fetch support history.',
    });
  }
};

module.exports = {
  createSupportMessage,
  getMySupportMessages,
};