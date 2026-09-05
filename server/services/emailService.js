const nodemailer = require('nodemailer');


// ==========================================
// CREATE SMTP TRANSPORTER
// ==========================================

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

    console.error(
      '[EMAIL SERVICE] Email credentials are not configured.'
    );

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


// ==========================================
// SEND OTP EMAIL
// ==========================================

const sendOtpEmail = async (
  email,
  otp,
  name = 'User'
) => {

  const transporter = createTransporter();


  const mailOptions = {

    from: `"AI Interview Platform" <${
      process.env.EMAIL_USER ||
      'no-reply@aiinterview.com'
    }>`,

    to: email,

    subject:
      'AI Interview Platform - Email Verification OTP',


    html: `

      <div style="
        font-family: Arial, sans-serif;
        max-width: 500px;
        margin: 0 auto;
        padding: 20px;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
      ">

        <h2 style="
          color: #2563eb;
          text-align: center;
        ">
          AI Interview Platform
        </h2>


        <hr style="
          border: none;
          border-top: 1px solid #e0e0e0;
          margin: 20px 0;
        " />


        <p style="
          font-size: 16px;
          color: #333;
        ">
          Hello <strong>${name}</strong>,
        </p>


        <p style="
          font-size: 15px;
          color: #555;
        ">
          Your OTP for creating your AI Interview Platform account is:
        </p>


        <div style="
          text-align: center;
          margin: 25px 0;
        ">

          <span style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 5px;
            color: #2563eb;
            background-color: #eff6ff;
            padding: 10px 25px;
            border-radius: 6px;
            border: 1px dashed #2563eb;
          ">

            ${otp}

          </span>

        </div>


        <p style="
          font-size: 14px;
          color: #666;
        ">
          This OTP is valid for
          <strong>5 minutes</strong>.
        </p>


        <p style="
          font-size: 14px;
          color: #888;
        ">
          If you did not request this OTP,
          please ignore this email.
        </p>


        <hr style="
          border: none;
          border-top: 1px solid #e0e0e0;
          margin: 20px 0;
        " />


        <p style="
          font-size: 13px;
          color: #999;
          text-align: center;
        ">

          Regards,

          <br />

          <strong>
            AI Interview Platform Team
          </strong>

        </p>

      </div>

    `,


    text: `
Hello ${name},

Your OTP for creating your AI Interview Platform account is: ${otp}

This OTP is valid for 5 minutes.

If you did not request this OTP, please ignore this email.

Regards,
AI Interview Platform Team
    `

  };


  // Development logging

  console.log(
    `\n==================================================`
  );

  console.log(
    `[DEV MODE OTP] Email: ${email} | OTP: ${otp}`
  );

  console.log(
    `==================================================\n`
  );


  if (transporter) {

    try {

      const info =
        await transporter.sendMail(mailOptions);


      console.log(
        `[EMAIL SERVICE] OTP email successfully sent to ${email} (MessageID: ${info.messageId})`
      );


    } catch (err) {

      console.error(
        `[EMAIL SERVICE WARNING] SMTP send failed: ${err.message}`
      );

    }

  }

};



// ==========================================
// SEND NOTIFICATION EMAIL
// ==========================================

const sendNotificationEmail = async (
  email,
  name = 'Student',
  subject,
  message
) => {

  const transporter = createTransporter();

  const mockInterviewUrl =
  `${process.env.CLIENT_URL}/student/interview-preparation/ai-mock`;


  // Check if SMTP is configured
  if (!transporter) {
    console.log(
      `\n==================================================`
    );
    console.log(
      `[DEV MODE NOTIFICATION] To: ${email} (${name})\nSubject: ${subject}\nMessage: ${message}`
    );
    console.log(
      `==================================================\n`
    );

    return {
      success: true,
      message: 'Email service not configured. Notification logged in dev console.'
    };
  }


  const mailOptions = {

    from: `"AI Interview Platform" <${
      process.env.EMAIL_USER
    }>`,

    to: email,

    subject: subject,


    html: `

      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 30px;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        background: #ffffff;
      ">


        <h2 style="
          color: #4C1D95;
          text-align: center;
          margin-bottom: 20px;
        ">
          AI Interview Platform 🚀
        </h2>


        <hr style="
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 20px 0;
        " />


        <p style="
          font-size: 16px;
          color: #333;
        ">

          Hello <strong>${name}</strong>,

        </p>


        <h3 style="
          color: #4C1D95;
          margin-top: 25px;
        ">

          ${subject}

        </h3>


        <p style="
          font-size: 16px;
          line-height: 1.7;
          color: #555;
        ">

          ${message}

        </p>

<div style="
  text-align: center;
  margin: 30px 0;
">

  <a
    href="${mockInterviewUrl}"
    style="
      display: inline-block;
      background-color: #4C1D95;
      color: #ffffff;
      padding: 14px 25px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: bold;
      font-size: 14px;
    "
  >
    Start Preparing Smarter Today!
  </a>

</div>

        <hr style="
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 25px 0;
        " />


        <p style="
          font-size: 14px;
          color: #888;
          text-align: center;
        ">

          Regards,

          <br />

          <strong>
            AI Interview Platform Team
          </strong>

        </p>


      </div>

    `,


    text: `
Hello ${name},

${subject}

${message}

Start preparing smarter today!

Regards,
AI Interview Platform Team
    `

  };


  try {

    const info =
      await transporter.sendMail(mailOptions);


    console.log(
      `[EMAIL SERVICE] Notification successfully sent to ${email} (MessageID: ${info.messageId})`
    );


    return {

      success: true,

      messageId:
        info.messageId

    };


  } catch (err) {

    console.error(
      `[EMAIL SERVICE ERROR] Notification failed for ${email}: ${err.message}`
    );


    return {

      success: false,

      message:
        err.message

    };

  }

};

// ==========================================
// SEND SCORE BASED PERFORMANCE EMAIL
// ==========================================

const sendScoreBasedNotificationEmail = async (
  email,
  name,
  score,
  customSubject = null,
  customMessage = null
) => {

  const numericScore = Number(score) || 0;

  let subject;
  let message;
  let cta;

  // 🔴 0%
  if (numericScore === 0) {

  subject = 'Your Interview Comeback Starts Today! 🔥';

  message = customMessage || (
    `Don’t let one result stop you. Practice with AI-powered interviews ` +
    `and improve your skills with every attempt.\n\n` +
    `🎁 Special Offer: Get 20% OFF`
  );

  cta = 'Start Practicing';

}

  // 🟠 1% - 49%
  else if (numericScore < 50) {

    subject = customSubject || 'Your Next Score Can Be Better! 🚀';

    message = customMessage || (
      `You’ve started your journey — now it’s time to level up. ` +
      `Practice more AI interviews and turn your weak areas into strengths.\n\n` +
      `🎁 Get 15% OFF Your Subscription`
    );

    cta = 'Improve Your Score';

  }

  // 🟢 50% - 89%
  else if (numericScore < 90) {

    subject = customSubject || 'You’re Getting Closer! 💪';

    message = customMessage || (
      `Your performance is improving. Take your preparation to the next level ` +
      `with advanced AI interviews and personalized feedback.\n\n` +
      `🎁 Get 10% OFF`
    );

    cta = 'Go Premium';

  }

  // 🏆 90%+
  else {

    subject = customSubject || '90%+ Accuracy! You’re Interview Ready! 🏆';

    message = customMessage || (
      `Your performance is outstanding! Now challenge yourself with advanced ` +
      `interviews and get closer to your dream job.\n\n` +
      `🔥 Unlock Elite Preparation & Get 15% OFF`
    );

    cta = 'Unlock Elite';

  }


  const frontendUrl =
    process.env.CLIENT_URL || 'http://localhost:5173';

  const mockInterviewUrl =
    `${frontendUrl}/student/interview-preparation/ai-mock`;


  const htmlMessage = `
    <div style="
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      background: #ffffff;
    ">

      <h2 style="
        color: #4C1D95;
        text-align: center;
      ">
        AI Interview Platform 🚀
      </h2>

      <hr style="
        border: none;
        border-top: 1px solid #e5e7eb;
        margin: 20px 0;
      " />

      <p style="
        font-size: 16px;
        color: #333;
      ">
        Hello <strong>${name}</strong>,
      </p>

      <div style="
        background: #F3E8FF;
        padding: 15px;
        border-radius: 8px;
        margin: 20px 0;
        text-align: center;
      ">

        <div style="
          font-size: 14px;
          color: #666;
        ">
          Your AI Interview Score
        </div>

        <div style="
          font-size: 36px;
          font-weight: bold;
          color: #4C1D95;
          margin-top: 5px;
        ">
          ${numericScore}%
        </div>

      </div>

      <h3 style="
        color: #4C1D95;
      ">
        ${subject}
      </h3>

      <p style="
        font-size: 16px;
        line-height: 1.7;
        color: #555;
        white-space: pre-line;
      ">
        ${message}
      </p>

      <div style="
        text-align: center;
        margin: 30px 0;
      ">

        <a
          href="${mockInterviewUrl}"
          style="
            display: inline-block;
            background: #4C1D95;
            color: #ffffff;
            text-decoration: none;
            padding: 13px 25px;
            border-radius: 7px;
            font-weight: bold;
          "
        >
          ${cta}
        </a>

      </div>

      <hr style="
        border: none;
        border-top: 1px solid #e5e7eb;
        margin: 25px 0;
      " />

      <p style="
        font-size: 14px;
        color: #888;
        text-align: center;
      ">
        Regards,<br />
        <strong>AI Interview Platform Team</strong>
      </p>

    </div>
  `;


  const transporter = createTransporter();

  if (!transporter) {

    console.log(
      `[DEV MODE SCORE EMAIL] To: ${email} | Score: ${numericScore}% | Subject: ${subject}`
    );

    return {
      success: true,
      message: 'Email service not configured'
    };

  }


  const mailOptions = {

    from: `"AI Interview Platform" <${process.env.EMAIL_USER}>`,

    to: email,

    subject,

    html: htmlMessage,

    text: `
Hello ${name},

Your AI Interview Score: ${numericScore}%

${subject}

${message}

${cta}: ${mockInterviewUrl}

Regards,
AI Interview Platform Team
    `

  };


  try {

    const info =
      await transporter.sendMail(mailOptions);

    console.log(
      `[EMAIL SERVICE] Score notification sent to ${email} (${numericScore}%)`
    );

    return {
      success: true,
      messageId: info.messageId
    };

  } catch (error) {

    console.error(
      `[EMAIL SERVICE ERROR] Score notification failed for ${email}: ${error.message}`
    );

    return {
      success: false,
      message: error.message
    };

  }

};



// ==========================================
// EXPORT FUNCTIONS
// ==========================================

module.exports = {
  sendOtpEmail,
  sendNotificationEmail,
  sendScoreBasedNotificationEmail
};