const transporter = require("../config/mailer");
// ↑ CHANGE THIS PATH to wherever your existing transporter is located

const sendEnquiry = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      organization,
      enquiryType,
      subject,
      message,
    } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    const isDetailedEnquiry = Boolean(enquiryType || subject);

    if (isDetailedEnquiry && (!enquiryType || !subject)) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,

      // This is the Gmail where YOU want to receive enquiries
      to: process.env.ENQUIRY_RECEIVER,

      // When you click Reply in Gmail,
      // it will reply to the person who submitted the enquiry
      replyTo: email,

      subject: `HireSmart AI Enquiry - ${subject || "General Enquiry"}`,

      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
          
          <h2 style="color: #2563eb;">
            New HireSmart AI Enquiry
          </h2>

          <p><strong>Name:</strong> ${name}</p>

          <p><strong>Email:</strong> ${email}</p>

          <p><strong>Phone:</strong> ${phone || "Not provided"}</p>

          ${organization ? `<p><strong>Organization:</strong> ${organization}</p>` : ""}

          ${enquiryType ? `<p><strong>Enquiry Type:</strong> ${enquiryType}</p>` : ""}

          ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ""}

          <hr />

          <h3>Message</h3>

          <p>
            ${message}
          </p>

        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Enquiry sent successfully.",
    });

  } catch (error) {
    console.error("Enquiry email error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send enquiry.",
    });
  }
};

module.exports = {
  sendEnquiry,
};