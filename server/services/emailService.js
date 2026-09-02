const nodemailer = require('nodemailer');

const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (
    !user ||
    !pass ||
    user.includes('yourgmail') ||
    user.includes('example.com') ||
    pass.includes('your_16_character') ||
    pass.includes('your_gmail')
  ) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass
    }
  });
};

const sendOtpEmail = async (email, otp, name = 'User') => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"AI Interview Platform" <${process.env.EMAIL_USER || 'no-reply@aiinterview.com'}>`,
    to: email,
    subject: 'AI Interview Platform - Email Verification OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #2563eb; text-align: center;">AI Interview Platform</h2>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="font-size: 16px; color: #333;">Hello <strong>${name}</strong>,</p>
        <p style="font-size: 15px; color: #555;">Your OTP for creating your AI Interview Platform account is:</p>
        <div style="text-align: center; margin: 25px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2563eb; background-color: #eff6ff; padding: 10px 25px; border-radius: 6px; border: 1px dashed #2563eb;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 14px; color: #666;">This OTP is valid for <strong>5 minutes</strong>.</p>
        <p style="font-size: 14px; color: #888;">If you did not request this OTP, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="font-size: 13px; color: #999; text-align: center;">
          Regards,<br />
          <strong>AI Interview Platform Team</strong>
        </p>
      </div>
    `,
    text: `Hello ${name},\n\nYour OTP for creating your AI Interview Platform account is: ${otp}\n\nThis OTP is valid for 5 minutes.\n\nIf you did not request this OTP, please ignore this email.\n\nRegards,\nAI Interview Platform Team`
  };

  // Always log Dev OTP in terminal for fast testing / fallback
  console.log(`\n==================================================`);
  console.log(`[DEV MODE OTP] Email: ${email} | OTP: ${otp}`);
  console.log(`==================================================\n`);

  if (transporter) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[EMAIL SERVICE] OTP email successfully sent to ${email} (MessageID: ${info.messageId})`);
    } catch (err) {
      console.error(`[EMAIL SERVICE WARNING] SMTP send failed: ${err.message}`);
    }
  }
};

module.exports = {
  sendOtpEmail
};
