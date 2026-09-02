import React, { useState, useContext } from 'react';
import StudentLayout from '../../components/StudentLayout';
import { AuthContext } from '../../context/AuthContext';
import {
  FaQuestionCircle,
  FaHeadset,
  FaEnvelope,
  FaBookOpen,
  FaPaperPlane,
  FaCheckCircle,
  FaChevronDown,
  FaChevronUp,
  FaRobot,
  FaShieldAlt,
  FaBriefcase,
  FaAward
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const HelpSupport = () => {
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    subject: '',
    category: 'Technical',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      id: 1,
      question: 'How does the AI Mock Interview evaluate my responses?',
      answer: 'Our AI engine analyzes your responses against key competency criteria for your target job role. It evaluates technical accuracy, logical structure, clarity, and completeness, providing instant scores out of 100 alongside tailored strengths and improvement feedback.',
      icon: FaRobot
    },
    {
      id: 2,
      question: 'What format and size limits apply to Resume uploads?',
      answer: 'Resumes must be in PDF format with a maximum file size of 16MB. Our system extracts candidate text for ATS scoring and stores your document securely directly in our encrypted BSON storage.',
      icon: FaShieldAlt
    },
    {
      id: 3,
      question: 'How are Placement Opportunities matched to my profile?',
      answer: 'Placement Opportunities are personalized strictly according to your saved Target Jobs and core competencies. The system queries live job feeds and matches roles, required skills, and location preferences directly for your career targets.',
      icon: FaBriefcase
    },
    {
      id: 4,
      question: 'How can I view or download my Verified Certificates?',
      answer: 'Navigate to the Certificates & Achievements section in your sidebar. Click "View Certificate" to open an interactive modal preview or click "Download PDF" to export your official HireSmart AI credential.',
      icon: FaAward
    }
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      toast.success('Your support request has been submitted! Our team will get back to you within 24 hours.');
      setFormData({ subject: '', category: 'Technical', message: '' });
      setSubmitting(false);
    }, 800);
  };

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <StudentLayout>
      <div className="container-fluid py-2">
        {/* HERO BANNER */}
        <div
          className="p-3.5 p-md-4 mb-4 text-white position-relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #312E81 100%)',
            borderRadius: '16px',
            boxShadow: '0 8px 25px -8px rgba(49, 46, 129, 0.35)',
            border: '1px solid rgba(99, 102, 241, 0.25)'
          }}
        >
          <div className="row align-items-center">
            <div className="col-lg-8">
              <div className="d-flex align-items-center gap-2 mb-1.5">
                <span className="badge bg-primary bg-opacity-30 border border-primary border-opacity-40 px-2.5 py-1 rounded-pill" style={{ color: '#93C5FD', fontSize: '0.725rem' }}>
                  <FaHeadset className="me-1" style={{ fontSize: '0.675rem' }} /> 24/7 Candidate Support
                </span>
                <span className="badge bg-success bg-opacity-30 border border-success border-opacity-40 px-2.5 py-1 rounded-pill" style={{ color: '#6EE7B7', fontSize: '0.725rem' }}>
                  <FaCheckCircle className="me-1" style={{ fontSize: '0.675rem' }} /> Help Knowledge Base
                </span>
              </div>
              <h3 className="fw-extrabold mb-1 text-white">Help & Support Center</h3>
              <p className="text-white-50 mb-0 small leading-relaxed">
                Have questions about your AI Mock Interviews, Target Jobs, or Resume analysis? We are here to assist your career journey.
              </p>
            </div>
            <div className="col-lg-4 text-center text-lg-end mt-3 mt-lg-0">
              <div className="d-inline-flex p-2.5 rounded-circle bg-white bg-opacity-10 border border-white border-opacity-20 shadow-sm">
                <FaQuestionCircle size={38} className="text-warning" />
              </div>
            </div>
          </div>
        </div>

        {/* SUPPORT CHANNEL CARDS */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card card-custom p-4 bg-white border-0 shadow-sm text-center h-100">
              <div className="p-3 rounded-circle bg-primary bg-opacity-10 text-primary mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                <FaHeadset size={28} />
              </div>
              <h6 className="fw-bold text-dark mb-1">Direct Support Ticket</h6>
              <p className="text-muted small mb-3">Submit a ticket directly to our technical and placement support specialists.</p>
              <span className="badge bg-light text-primary fw-semibold align-self-center mt-auto">Average Response: &lt; 2 Hours</span>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card card-custom p-4 bg-white border-0 shadow-sm text-center h-100">
              <div className="p-3 rounded-circle bg-success bg-opacity-10 text-success mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                <FaEnvelope size={28} />
              </div>
              <h6 className="fw-bold text-dark mb-1">Email Inquiry</h6>
              <p className="text-muted small mb-3">Reach out via official email for general or partnership inquiries.</p>
              <span className="text-primary font-monospace fw-semibold align-self-center mt-auto">support@hiresmart.ai</span>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card card-custom p-4 bg-white border-0 shadow-sm text-center h-100">
              <div className="p-3 rounded-circle bg-warning bg-opacity-10 text-warning mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                <FaBookOpen size={28} />
              </div>
              <h6 className="fw-bold text-dark mb-1">Platform FAQs</h6>
              <p className="text-muted small mb-3">Find instant answers to common questions about mock interviews and target jobs.</p>
              <span className="badge bg-light text-secondary fw-semibold align-self-center mt-auto">Self-Service Knowledge Base</span>
            </div>
          </div>
        </div>

        {/* MAIN HELP CONTENT GRID */}
        <div className="row g-4 mb-4">
          {/* FAQ ACCORDION SECTION */}
          <div className="col-lg-7">
            <div className="card card-custom p-4 bg-white border-0 shadow-sm h-100">
              <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <FaQuestionCircle className="text-primary" /> Frequently Asked Questions
              </h5>

              <div className="d-flex flex-column gap-3">
                {faqs.map((faq) => {
                  const IconComp = faq.icon;
                  const isOpen = openFaq === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className="border rounded-3 p-3 transition-all cursor-pointer"
                      onClick={() => toggleFaq(faq.id)}
                      style={{ backgroundColor: isOpen ? '#F8FAFC' : '#FFFFFF' }}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2.5">
                          <IconComp className="text-primary" size={18} />
                          <h6 className="fw-bold text-dark mb-0">{faq.question}</h6>
                        </div>
                        <span className="text-muted">{isOpen ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}</span>
                      </div>
                      {isOpen && (
                        <div className="mt-3 pt-3 border-top text-muted small leading-relaxed">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CONTACT SUPPORT FORM */}
          <div className="col-lg-5">
            <div className="card card-custom p-4 bg-white border-0 shadow-sm h-100">
              <h5 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                <FaPaperPlane className="text-primary" /> Send Us a Message
              </h5>
              <p className="text-muted small mb-3">Fill out the details below to open a ticket with candidate support.</p>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label text-muted small fw-semibold">Candidate Name</label>
                  <input
                    type="text"
                    className="form-control bg-light"
                    value={user?.fullName || user?.name || 'Student'}
                    disabled
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted small fw-semibold">Category</label>
                  <select
                    className="form-select bg-light fw-semibold"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="Technical">AI Mock Interview / Technical</option>
                    <option value="Resume">Resume Upload & ATS Scanner</option>
                    <option value="Placements">Placement Opportunities</option>
                    <option value="Account">Account & Profile</option>
                    <option value="Other">General Inquiry</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted small fw-semibold">Subject *</label>
                  <input
                    type="text"
                    className="form-control bg-light"
                    name="subject"
                    placeholder="Brief summary of your question..."
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label text-muted small fw-semibold">Detailed Message *</label>
                  <textarea
                    className="form-control bg-light"
                    rows="4"
                    name="message"
                    placeholder="Describe your issue or question in detail..."
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary fw-bold w-100 py-2.5 d-flex align-items-center justify-content-center gap-2 shadow-sm"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting Message...' : (
                    <>
                      <FaPaperPlane /> Send Support Request
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default HelpSupport;
