import React, { useContext, useEffect, useState } from 'react';
import StudentLayout from '../../components/StudentLayout';
import { AuthContext } from '../../context/AuthContext';

import {
  FaHeadset,
  FaEnvelope,
  FaPaperPlane,
  FaCheckCircle,
  FaChevronDown,
  FaChevronUp,
  FaShieldAlt,
  FaBriefcase,
  FaAward,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaClock,
  FaGlobe,
  FaHistory,
  FaExternalLinkAlt,
} from 'react-icons/fa';

import toast from 'react-hot-toast';

const HelpSupport = () => {
  const { user, token } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    subject: '',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [supportHistory, setSupportHistory] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);

  // ============================================================
  // AUTH HEADERS
  // ============================================================

  const getAuthHeaders = () => {
    const authToken =
      token ||
      localStorage.getItem('studentToken') ||
      localStorage.getItem('token');

    return authToken
      ? {
          Authorization: `Bearer ${authToken}`,
        }
      : {};
  };

  // ============================================================
  // FAQ DATA
  // ============================================================

  const faqs = [
    {
      id: 1,
      question: 'How does the AI Mock Interview evaluate my responses?',
      answer:
        'The AI Mock Interview evaluates your responses based on the requirements of your selected job role. It considers factors such as relevance, clarity, technical understanding, communication and completeness.',
      icon: FaBriefcase,
    },
    {
      id: 2,
      question: 'What format should I use for my Resume?',
      answer:
        'We recommend uploading your resume in PDF format. Make sure your resume contains accurate education, skills, experience and professional information.',
      icon: FaShieldAlt,
    },
    {
      id: 3,
      question: 'How are Placement Opportunities matched?',
      answer:
        'Placement opportunities are matched using information such as your target job preferences, skills, experience and other profile information available on the platform.',
      icon: FaBriefcase,
    },
    {
      id: 4,
      question: 'Where can I find my certificates?',
      answer:
        'You can access your certificates from the Certificates section available in your student dashboard.',
      icon: FaAward,
    },
  ];

  // ============================================================
  // FETCH SUPPORT HISTORY
  // ============================================================

  const fetchSupportHistory = async () => {
    try {
      setLoadingHistory(true);

      const response = await fetch('/api/support/messages/my', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to load support history'
        );
      }

      setSupportHistory(data.data || []);
    } catch (error) {
      console.error('Support history error:', error);

      if (
        error.message !== 'Not authorized, no token provided'
      ) {
        toast.error(
          error.message || 'Failed to load support history'
        );
      }
    } finally {
      setLoadingHistory(false);
    }
  };

  // ============================================================
  // LOAD HISTORY
  // ============================================================

  useEffect(() => {
    if (token || localStorage.getItem('token')) {
      fetchSupportHistory();
    } else {
      setLoadingHistory(false);
    }
  }, [token]);

  // ============================================================
  // INPUT CHANGE
  // ============================================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ============================================================
  // SUBMIT SUPPORT REQUEST
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const subject = formData.subject.trim();
    const message = formData.message.trim();

    if (!subject) {
      toast.error('Please enter a subject.');
      return;
    }

    if (!message) {
      toast.error('Please enter your message.');
      return;
    }

    const authHeaders = getAuthHeaders();

    if (!authHeaders.Authorization) {
      toast.error('Your session has expired. Please login again.');
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch('/api/support/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({
          subject,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to submit support request'
        );
      }

      toast.success(
        'Support request submitted successfully!'
      );

      setFormData({
        subject: '',
        message: '',
      });

      // Refresh history
      await fetchSupportHistory();
    } catch (error) {
      console.error('Support submit error:', error);

      toast.error(
        error.message ||
          'Failed to submit support request'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // FAQ TOGGLE
  // ============================================================

  const toggleFaq = (id) => {
    setOpenFaq((previous) =>
      previous === id ? null : id
    );
  };

  // ============================================================
  // WHATSAPP
  // ============================================================

  const openWhatsApp = () => {
    const studentName =
      user?.fullName ||
      user?.name ||
      'Student';

    const message =
      `Hello Web AI Tech Solution, I am ${studentName}. ` +
      `I need help regarding HireSmart AI.`;

    const whatsappUrl =
      `https://wa.me/916306376352?text=${encodeURIComponent(
        message
      )}`;

    window.open(
      whatsappUrl,
      '_blank',
      'noopener,noreferrer'
    );
  };

  // ============================================================
  // DATE FORMAT
  // ============================================================

  const formatDate = (date) => {
    if (!date) return '';

    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ============================================================
  // STATUS CLASS
  // ============================================================

  const getStatusClass = (status) => {
    switch (status) {
      case 'Resolved':
        return 'status-resolved';

      case 'In Progress':
        return 'status-progress';

      default:
        return 'status-pending';
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <StudentLayout>
      <div className="support-page">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="support-header">
          <div>
            <div className="support-small-title">
              <FaHeadset />
              HELP & SUPPORT
            </div>

            <h1>
              How can we help you?
            </h1>

            <p>
              Get assistance with HireSmart AI,
              your account, interviews, resume,
              placements and more.
            </p>
          </div>

          <div className="support-header-icon">
            <FaHeadset />
          </div>
        </div>

        {/* ======================================================
            COMPANY CONTACT CARDS
        ====================================================== */}

        <div className="contact-grid">

          {/* Email */}

          <div className="contact-card">
            <div className="contact-icon">
              <FaEnvelope />
            </div>

            <div>
              <span>Email Support</span>

              <a href="mailto:ns3445730@gmail.com">
                ns3445730@gmail.com
              </a>

              <small>
                Send us your query anytime
              </small>
            </div>
          </div>

          {/* WhatsApp */}

          <button
            type="button"
            className="contact-card whatsapp-card"
            onClick={openWhatsApp}
          >
            <div className="contact-icon whatsapp-icon">
              <FaWhatsapp />
            </div>

            <div>
              <span>WhatsApp Support</span>

              <strong>
                +91 6306 376 352
              </strong>

              <small>
                Click to chat with our support team
              </small>
            </div>
          </button>

          {/* Website */}

          <a
            href="https://www.webaitechsolution.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-card"
          >
            <div className="contact-icon">
              <FaGlobe />
            </div>

            <div>
              <span>Company Website</span>

              <strong>
                Web AI Tech Solution LLP
              </strong>

              <small>
                Visit our official website
                <FaExternalLinkAlt />
              </small>
            </div>
          </a>

        </div>

        {/* ======================================================
            COMPANY INFORMATION
        ====================================================== */}

        <div className="company-info-card">

          <div className="company-info-left">

            <div className="company-logo">
              <FaHeadset />
            </div>

            <div>
              <h2>
                Web AI Tech Solution LLP
              </h2>

              <p>
                Professional technology solutions
                for web, software and digital services.
              </p>
            </div>

          </div>

          <div className="company-details">

            <div>
              <FaMapMarkerAlt />

              <span>
                STPI 8th Floor, UPSIDA Complex,
                Lakhanpur, Kanpur-208024, UP
              </span>
            </div>

            <div>
              <FaClock />

              <span>
                24/7 Services Available
              </span>
            </div>

          </div>

        </div>

        {/* ======================================================
            MAIN CONTENT
        ====================================================== */}

        <div className="support-content-grid">

          {/* ====================================================
              SEND MESSAGE
          ==================================================== */}

          <div className="support-card">

            <div className="card-heading">

              <div className="card-heading-icon">
                <FaPaperPlane />
              </div>

              <div>
                <h2>
                  Send Us a Message
                </h2>

                <p>
                  Tell us about your problem and
                  our support team will help you.
                </p>
              </div>

            </div>

            <form onSubmit={handleSubmit}>

              {/* Candidate Name */}

              <div className="form-group">
                <label>
                  Candidate Name
                </label>

                <input
                  type="text"
                  value={
                    user?.fullName ||
                    user?.name ||
                    'Student'
                  }
                  disabled
                />
              </div>

              {/* Email */}

              <div className="form-group">
                <label>
                  Email Address
                </label>

                <input
                  type="email"
                  value={
                    user?.email ||
                    user?.emailAddress ||
                    ''
                  }
                  disabled
                />
              </div>

              {/* Subject */}

              <div className="form-group">
                <label>
                  Subject <span>*</span>
                </label>

                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Enter your support subject"
                  maxLength={200}
                  required
                />
              </div>

              {/* Message */}

              <div className="form-group">
                <label>
                  Message <span>*</span>
                </label>

                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Describe your issue or question..."
                  rows={6}
                  maxLength={5000}
                  required
                />

                <div className="character-count">
                  {formData.message.length}/5000
                </div>
              </div>

              {/* Submit */}

              <button
                type="submit"
                className="submit-button"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner"></span>
                    Sending...
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    Send Support Request
                  </>
                )}
              </button>

              <div className="secure-note">
                <FaCheckCircle />
                Your request will be securely saved
                and sent to our support team.
              </div>

            </form>

          </div>

          {/* ====================================================
              FAQ
          ==================================================== */}

          <div className="support-card">

            <div className="card-heading">

              <div className="card-heading-icon">
                <FaHeadset />
              </div>

              <div>
                <h2>
                  Frequently Asked Questions
                </h2>

                <p>
                  Find quick answers to common questions.
                </p>
              </div>

            </div>

            <div className="faq-list">

              {faqs.map((faq) => {
                const Icon = faq.icon;
                const isOpen = openFaq === faq.id;

                return (
                  <div
                    className={`faq-item ${
                      isOpen ? 'faq-open' : ''
                    }`}
                    key={faq.id}
                  >

                    <button
                      type="button"
                      className="faq-question"
                      onClick={() =>
                        toggleFaq(faq.id)
                      }
                    >

                      <div className="faq-question-left">

                        <div className="faq-icon">
                          <Icon />
                        </div>

                        <span>
                          {faq.question}
                        </span>

                      </div>

                      {isOpen ? (
                        <FaChevronUp />
                      ) : (
                        <FaChevronDown />
                      )}

                    </button>

                    {isOpen && (
                      <div className="faq-answer">
                        {faq.answer}
                      </div>
                    )}

                  </div>
                );
              })}

            </div>

          </div>

        </div>

        {/* ======================================================
            SUPPORT HISTORY
        ====================================================== */}

        <div className="support-card history-card">

          <div className="history-header">

            <div className="card-heading">

              <div className="card-heading-icon">
                <FaHistory />
              </div>

              <div>
                <h2>
                  Your Previous Requests
                </h2>

                <p>
                  Track the support requests you
                  have submitted to our team.
                </p>
              </div>

            </div>

            <div className="request-count">
              <strong>
                {supportHistory.length}
              </strong>

              <span>
                Requests
              </span>
            </div>

          </div>

          {loadingHistory ? (

            <div className="history-loading">
              <span className="large-spinner"></span>
              Loading your support history...
            </div>

          ) : supportHistory.length === 0 ? (

            <div className="empty-history">

              <div className="empty-history-icon">
                <FaHistory />
              </div>

              <h3>
                No Support Requests Yet
              </h3>

              <p>
                Your submitted support requests
                will appear here.
              </p>

            </div>

          ) : (

            <div className="history-list">

              {supportHistory.map((item) => (

                <div
                  className="history-item"
                  key={item._id}
                >

                  <div className="history-main">

                    <div className="history-title-row">

                      <h3>
                        {item.subject}
                      </h3>

                      <span
                        className={`status-badge ${getStatusClass(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>

                    </div>

                    <p>
                      {item.message}
                    </p>

                    <div className="history-meta">
                      Submitted on {formatDate(item.createdAt)}
                    </div>

                  </div>

                  <div className="email-status">

                    <FaCheckCircle />

                    {item.emailStatus === 'Sent'
                      ? 'Email Sent'
                      : item.emailStatus === 'Failed'
                      ? 'Email Failed'
                      : 'Email Pending'}

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

        {/* ======================================================
            BOTTOM FEATURES
        ====================================================== */}

        <div className="features-grid">

          <div className="feature-card">
            <FaHeadset />
            <h3>Candidate Support</h3>
            <p>
              Get assistance whenever you face
              an issue on the platform.
            </p>
          </div>

          <div className="feature-card">
            <FaShieldAlt />
            <h3>Secure Platform</h3>
            <p>
              Your support requests and account
              information are handled securely.
            </p>
          </div>

          <div className="feature-card">
            <FaBriefcase />
            <h3>Career Guidance</h3>
            <p>
              Get help related to interviews,
              jobs and your career journey.
            </p>
          </div>

          <div className="feature-card">
            <FaAward />
            <h3>Career Resources</h3>
            <p>
              Get help with resumes, certificates,
              placements and other resources.
            </p>
          </div>

        </div>

        {/* ======================================================
            STYLES
        ====================================================== */}

        <style>{`

          * {
            box-sizing: border-box;
          }

          .support-page {
            padding: 10px 5px 40px;
            background: #f6f7fb;
            min-height: 100vh;
          }

          /* HEADER */

          .support-header {
            background: linear-gradient(
              135deg,
              #171b4d,
              #4235a4
            );
            border-radius: 22px;
            padding: 35px;
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            box-shadow: 0 15px 40px rgba(47, 43, 120, 0.18);
          }

          .support-small-title {
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 1.5px;
            display: flex;
            gap: 8px;
            align-items: center;
            margin-bottom: 8px;
            opacity: 0.85;
          }

          .support-header h1 {
            font-size: 34px;
            margin: 0 0 8px;
            font-weight: 800;
          }

          .support-header p {
            margin: 0;
            opacity: 0.8;
            font-size: 15px;
          }

          .support-header-icon {
            width: 82px;
            height: 82px;
            border-radius: 22px;
            background: rgba(255,255,255,0.14);
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 36px;
          }

          /* CONTACT */

          .contact-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 18px;
            margin-bottom: 20px;
          }

          .contact-card {
            background: white;
            border: 1px solid #e8e9f1;
            border-radius: 17px;
            padding: 20px;
            display: flex;
            gap: 15px;
            align-items: center;
            text-decoration: none;
            color: #20233b;
            transition: 0.2s ease;
            text-align: left;
          }

          .contact-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 28px rgba(35, 35, 70, 0.08);
          }

          button.contact-card {
            width: 100%;
            cursor: pointer;
            font-family: inherit;
          }

          .contact-icon {
            min-width: 48px;
            height: 48px;
            border-radius: 14px;
            background: #eeedff;
            color: #5146df;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 21px;
          }

          .whatsapp-icon {
            background: #e6f9ed;
            color: #16a34a;
          }

          .contact-card span {
            display: block;
            color: #85899d;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 4px;
          }

          .contact-card strong,
          .contact-card a {
            color: #22253d;
            font-size: 14px;
            font-weight: 750;
            text-decoration: none;
            display: block;
          }

          .contact-card small {
            color: #9699aa;
            font-size: 11px;
            margin-top: 4px;
            display: flex;
            gap: 5px;
            align-items: center;
          }

          /* COMPANY */

          .company-info-card {
            background: white;
            border: 1px solid #e8e9f1;
            border-radius: 18px;
            padding: 23px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 30px;
            margin-bottom: 22px;
          }

          .company-info-left {
            display: flex;
            align-items: center;
            gap: 15px;
          }

          .company-logo {
            width: 55px;
            height: 55px;
            border-radius: 16px;
            background: #eeedff;
            color: #5146df;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 23px;
          }

          .company-info-left h2 {
            margin: 0 0 5px;
            font-size: 19px;
            color: #20233b;
          }

          .company-info-left p {
            margin: 0;
            color: #85899d;
            font-size: 13px;
          }

          .company-details {
            display: flex;
            gap: 28px;
          }

          .company-details div {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #64687c;
            font-size: 12px;
          }

          .company-details svg {
            color: #5146df;
          }

          /* MAIN */

          .support-content-grid {
            display: grid;
            grid-template-columns: 1.05fr 0.95fr;
            gap: 22px;
            margin-bottom: 22px;
          }

          .support-card {
            background: white;
            border: 1px solid #e8e9f1;
            border-radius: 20px;
            padding: 27px;
          }

          .card-heading {
            display: flex;
            align-items: center;
            gap: 13px;
            margin-bottom: 25px;
          }

          .card-heading-icon {
            width: 45px;
            height: 45px;
            background: #eeedff;
            color: #5146df;
            border-radius: 13px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .card-heading h2 {
            margin: 0 0 3px;
            color: #20233b;
            font-size: 19px;
          }

          .card-heading p {
            margin: 0;
            color: #8a8da0;
            font-size: 12px;
          }

          /* FORM */

          .form-group {
            margin-bottom: 17px;
          }

          .form-group label {
            display: block;
            font-size: 12px;
            font-weight: 700;
            color: #565a70;
            margin-bottom: 7px;
          }

          .form-group label span {
            color: #ef4444;
          }

          .form-group input,
          .form-group textarea {
            width: 100%;
            border: 1px solid #dfe1ea;
            background: #fafbfc;
            border-radius: 11px;
            padding: 12px 14px;
            font-family: inherit;
            font-size: 13px;
            color: #292c42;
            outline: none;
            transition: 0.2s;
          }

          .form-group input:focus,
          .form-group textarea:focus {
            border-color: #6559e8;
            background: white;
            box-shadow: 0 0 0 3px rgba(101, 89, 232, 0.08);
          }

          .form-group input:disabled {
            background: #f3f4f7;
            color: #85899b;
          }

          .form-group textarea {
            resize: vertical;
            min-height: 135px;
          }

          .character-count {
            text-align: right;
            font-size: 10px;
            color: #9699a9;
            margin-top: 4px;
          }

          .submit-button {
            width: 100%;
            border: none;
            border-radius: 11px;
            background: linear-gradient(
              135deg,
              #5146df,
              #6358e9
            );
            color: white;
            padding: 13px;
            font-size: 13px;
            font-weight: 750;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            cursor: pointer;
            transition: 0.2s;
          }

          .submit-button:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 8px 20px rgba(81, 70, 223, 0.22);
          }

          .submit-button:disabled {
            opacity: 0.65;
            cursor: not-allowed;
          }

          .spinner,
          .large-spinner {
            border: 3px solid rgba(255,255,255,0.35);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          .spinner {
            width: 15px;
            height: 15px;
          }

          .large-spinner {
            width: 25px;
            height: 25px;
            border-color: #d9d7ff;
            border-top-color: #5146df;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }

          .secure-note {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            color: #7e8294;
            font-size: 10px;
            margin-top: 12px;
          }

          .secure-note svg {
            color: #22c55e;
          }

          /* FAQ */

          .faq-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .faq-item {
            border: 1px solid #e7e8ef;
            border-radius: 13px;
            overflow: hidden;
          }

          .faq-item.faq-open {
            border-color: #d5d1ff;
            background: #fbfaff;
          }

          .faq-question {
            border: none;
            background: transparent;
            width: 100%;
            padding: 15px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            color: #292c42;
            text-align: left;
          }

          .faq-question-left {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .faq-question-left span {
            font-size: 12px;
            font-weight: 700;
          }

          .faq-question > svg {
            color: #777b8f;
            font-size: 12px;
          }

          .faq-icon {
            width: 34px;
            height: 34px;
            min-width: 34px;
            border-radius: 10px;
            background: #efeeff;
            color: #5146df;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .faq-answer {
            padding: 0 15px 17px 61px;
            color: #74788b;
            font-size: 12px;
            line-height: 1.7;
          }

          /* HISTORY */

          .history-card {
            margin-bottom: 22px;
          }

          .history-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
          }

          .request-count {
            min-width: 75px;
            height: 68px;
            border-radius: 14px;
            background: #f5f4ff;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }

          .request-count strong {
            color: #5146df;
            font-size: 23px;
          }

          .request-count span {
            color: #8a8da0;
            font-size: 9px;
          }

          .history-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .history-item {
            border: 1px solid #e7e8ef;
            border-radius: 14px;
            padding: 18px;
            display: flex;
            justify-content: space-between;
            gap: 20px;
          }

          .history-main {
            flex: 1;
          }

          .history-title-row {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 7px;
          }

          .history-title-row h3 {
            margin: 0;
            color: #282b42;
            font-size: 14px;
          }

          .history-main p {
            margin: 0 0 9px;
            color: #777b8d;
            font-size: 12px;
            line-height: 1.6;
            white-space: pre-wrap;
          }

          .history-meta {
            font-size: 10px;
            color: #999cac;
          }

          .status-badge {
            border-radius: 20px;
            padding: 4px 9px;
            font-size: 9px;
            font-weight: 800;
          }

          .status-pending {
            background: #fff6dc;
            color: #b77900;
          }

          .status-progress {
            background: #e9f2ff;
            color: #2563eb;
          }

          .status-resolved {
            background: #e8f9ee;
            color: #16803b;
          }

          .email-status {
            color: #22a552;
            font-size: 10px;
            display: flex;
            align-items: center;
            gap: 5px;
            white-space: nowrap;
          }

          .empty-history {
            text-align: center;
            padding: 35px 15px;
          }

          .empty-history-icon {
            width: 55px;
            height: 55px;
            margin: auto;
            border-radius: 50%;
            background: #f1f0ff;
            color: #665be4;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 21px;
          }

          .empty-history h3 {
            margin: 13px 0 5px;
            font-size: 15px;
            color: #292c42;
          }

          .empty-history p {
            margin: 0;
            color: #8c8fa0;
            font-size: 11px;
          }

          .history-loading {
            min-height: 150px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            color: #777b8e;
            font-size: 12px;
          }

          /* FEATURES */

          .features-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
          }

          .feature-card {
            background: white;
            border: 1px solid #e8e9f1;
            border-radius: 16px;
            padding: 20px;
          }

          .feature-card > svg {
            color: #5146df;
            font-size: 21px;
            margin-bottom: 12px;
          }

          .feature-card h3 {
            margin: 0 0 6px;
            color: #292c42;
            font-size: 13px;
          }

          .feature-card p {
            margin: 0;
            color: #85899a;
            font-size: 10px;
            line-height: 1.6;
          }

          /* RESPONSIVE */

          @media (max-width: 1000px) {

            .contact-grid {
              grid-template-columns: 1fr;
            }

            .support-content-grid {
              grid-template-columns: 1fr;
            }

            .company-info-card {
              flex-direction: column;
              align-items: flex-start;
            }

            .company-details {
              flex-direction: column;
              gap: 10px;
            }

            .features-grid {
              grid-template-columns: repeat(2, 1fr);
            }

          }

          @media (max-width: 600px) {

            .support-page {
              padding: 5px;
            }

            .support-header {
              padding: 25px;
            }

            .support-header h1 {
              font-size: 27px;
            }

            .support-header-icon {
              display: none;
            }

            .support-card {
              padding: 20px;
            }

            .history-item {
              flex-direction: column;
            }

            .email-status {
              align-self: flex-start;
            }

            .features-grid {
              grid-template-columns: 1fr;
            }

            .history-header {
              align-items: flex-start;
            }

          }

        `}</style>

      </div>
    </StudentLayout>
  );
};

export default HelpSupport;