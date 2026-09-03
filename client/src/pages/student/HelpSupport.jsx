import React, {
  useState,
  useContext,
  useEffect,
  useRef
} from 'react';

import StudentLayout from '../../components/StudentLayout';
import { AuthContext } from '../../context/AuthContext';

import {
  FaQuestionCircle,
  FaHeadset,
  FaEnvelope,
  FaPaperPlane,
  FaCheckCircle,
  FaChevronDown,
  FaChevronUp,
  FaRobot,
  FaShieldAlt,
  FaBriefcase,
  FaAward,
  FaTimes,
  FaRedo,
  FaArrowRight
} from 'react-icons/fa';

import toast from 'react-hot-toast';


const HelpSupport = () => {

  const { user } = useContext(AuthContext);


  // ============================================================
  // SUPPORT FORM
  // ============================================================

  const [formData, setFormData] = useState({
    subject: '',
    category: 'Technical',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);


  // ============================================================
  // AI CHATBOT
  // ============================================================

  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatTyping, setChatTyping] = useState(false);

  const chatBodyRef = useRef(null);
  const chatInputRef = useRef(null);


  // ============================================================
  // FAQ DATA
  // ============================================================

  const faqs = [
    {
      id: 1,
      question: 'How does the AI Mock Interview evaluate my responses?',
      answer:
        'Our AI engine analyzes your responses against key competency criteria for your target job role. It evaluates technical accuracy, logical structure, clarity, and completeness, providing instant scores out of 100 alongside tailored strengths and improvement feedback.',
      icon: FaRobot
    },
    {
      id: 2,
      question: 'What format and size limits apply to Resume uploads?',
      answer:
        'Resumes must be in PDF format with a maximum file size of 16MB. Our system extracts candidate text for ATS scoring and stores your document securely directly in our encrypted BSON storage.',
      icon: FaShieldAlt
    },
    {
      id: 3,
      question: 'How are Placement Opportunities matched to my profile?',
      answer:
        'Placement Opportunities are personalized strictly according to your saved Target Jobs and core competencies. The system queries live job feeds and matches roles, required skills, and location preferences directly for your career targets.',
      icon: FaBriefcase
    },
    {
      id: 4,
      question: 'How can I view or download my Verified Certificates?',
      answer:
        'Navigate to the Certificates & Achievements section in your sidebar. Click "View Certificate" to open an interactive modal preview or click "Download PDF" to export your official HireSmart AI credential.',
      icon: FaAward
    }
  ];


  // ============================================================
  // MOCK AI KNOWLEDGE
  // ============================================================

  const aiKnowledge = [
    {
      keywords: [
        'interview',
        'mock interview',
        'ai interview',
        'evaluation',
        'evaluate',
        'score',
        'scoring',
        'answer'
      ],
      response:
        'Your AI Mock Interview responses are evaluated against competency criteria for your target role. The system looks at relevance, accuracy, technical knowledge, problem solving, and overall answer quality. You receive a score along with strengths, weaknesses, and improvement suggestions.'
    },

    {
      keywords: [
        'resume',
        'cv',
        'upload resume',
        'upload cv',
        'resume upload',
        'pdf'
      ],
      response:
        'You can upload your resume as a PDF file. The current maximum file size is 16MB. HireSmart AI extracts the resume content for ATS analysis and uses it to help evaluate your career profile.'
    },

    {
      keywords: [
        'ats',
        'ats score',
        'resume score',
        'scanner',
        'resume analysis'
      ],
      response:
        'The ATS scanner analyzes your resume content against important job-related information. It helps identify how well your resume aligns with the skills and requirements relevant to your target career.'
    },

    {
      keywords: [
        'placement',
        'placements',
        'job',
        'jobs',
        'job opportunities',
        'placement opportunities',
        'job matching'
      ],
      response:
        'Placement Opportunities are matched using your saved Target Jobs, core competencies, required skills, and location preferences. This helps surface opportunities that are more relevant to the career path you are targeting.'
    },

    {
      keywords: [
        'target job',
        'target jobs',
        'career target',
        'career goal'
      ],
      response:
        'Your Target Jobs help HireSmart AI understand the career direction you are preparing for. They are used to personalize interview preparation, competency matching, and relevant placement opportunities.'
    },

    {
      keywords: [
        'certificate',
        'certificates',
        'credential',
        'achievement',
        'download certificate'
      ],
      response:
        'You can find your certificates under the Certificates & Achievements section in the sidebar. From there, you can view your certificate and download the PDF version when available.'
    },

    {
      keywords: [
        'profile',
        'account',
        'name',
        'phone',
        'profile information'
      ],
      response:
        'You can manage your personal profile information from the Profile section. Keep your information and professional details updated so your HireSmart AI experience remains personalized.'
    },

    {
      keywords: [
        'help',
        'support',
        'contact',
        'support team',
        'ticket'
      ],
      response:
        'Of course! 😊 You can use the "Send Us a Message" section on this page to submit a support request. Select a category, describe your issue, and our candidate support team can follow up with you.'
    },

    {
      keywords: [
        'hello',
        'hi',
        'hey',
        'good morning',
        'good afternoon',
        'good evening'
      ],
      response:
        'Hey there! 👋 I’m HireSmart AI. I can help you understand interviews, resumes, ATS scoring, placement opportunities, certificates, and other platform features.'
    }
  ];


  // ============================================================
  // AI RESPONSE
  // ============================================================

  const getAIResponse = (question) => {

    const normalizedQuestion =
      question.toLowerCase().trim();

    const matchedTopic = aiKnowledge.find((topic) =>
      topic.keywords.some((keyword) =>
        normalizedQuestion.includes(keyword)
      )
    );

    if (matchedTopic) {
      return matchedTopic.response;
    }

    return (
      'That’s a great question! 😊 I’m still learning the HireSmart AI knowledge base, ' +
      'but I can currently help with AI Mock Interviews, resume uploads, ATS scoring, ' +
      'placement opportunities, Target Jobs, certificates, profiles, and support requests.'
    );
  };


  // ============================================================
  // SUGGESTED QUESTIONS
  // ============================================================

  const suggestedQuestions = [
    'How does AI evaluate my interview?',
    'How do I upload my resume?',
    'How are placement jobs matched?',
    'Where can I find my certificates?'
  ];


  // ============================================================
  // INITIAL CHAT
  // ============================================================

  useEffect(() => {

    const displayName =
      user?.fullName ||
      user?.name ||
      'there';

    setChatMessages([
      {
        id: Date.now(),
        sender: 'ai',
        text:
          `Hi ${displayName}! 👋 I’m HireSmart AI. ` +
          `I’m here to help you with interviews, resumes, placements, certificates, ` +
          `and anything else you need around the platform.`,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    ]);

  }, [user?.fullName, user?.name]);


  // ============================================================
  // AUTO SCROLL
  // ============================================================

  useEffect(() => {

    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop =
        chatBodyRef.current.scrollHeight;
    }

  }, [chatMessages, chatTyping]);


  // ============================================================
  // FOCUS CHAT INPUT
  // ============================================================

  useEffect(() => {

    if (chatOpen) {

      setTimeout(() => {
        chatInputRef.current?.focus();
      }, 150);

    }

  }, [chatOpen]);


  // ============================================================
  // SEND CHAT MESSAGE
  // ============================================================

  const sendChatMessage = async (
    messageToSend = chatInput
  ) => {

    const message =
      messageToSend.trim();

    if (!message || chatTyping) {
      return;
    }

    const currentTime =
      new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });


    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: message,
      time: currentTime
    };


    setChatMessages((previous) => [
      ...previous,
      userMessage
    ]);

    setChatInput('');
    setChatTyping(true);


    const delay =
      Math.floor(Math.random() * 700) + 900;


    setTimeout(() => {

      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: getAIResponse(message),
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      };


      setChatMessages((previous) => [
        ...previous,
        aiMessage
      ]);

      setChatTyping(false);

    }, delay);

  };


  // ============================================================
  // CHAT KEYBOARD
  // ============================================================

  const handleChatKeyDown = (e) => {

    if (
      e.key === 'Enter' &&
      !e.shiftKey
    ) {

      e.preventDefault();

      sendChatMessage();

    }

  };


  // ============================================================
  // RESET CHAT
  // ============================================================

  const resetChat = () => {

    const displayName =
      user?.fullName ||
      user?.name ||
      'there';


    setChatMessages([
      {
        id: Date.now(),
        sender: 'ai',
        text:
          `Hi ${displayName}! 👋 Welcome back. ` +
          `What would you like help with?`,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    ]);

    setChatInput('');
    setChatTyping(false);
  };


  // ============================================================
  // SUPPORT FORM
  // ============================================================

  const handleInputChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };


  const handleSubmit = (e) => {

    e.preventDefault();


    if (
      !formData.subject.trim() ||
      !formData.message.trim()
    ) {

      toast.error(
        'Please fill in all required fields.'
      );

      return;
    }


    setSubmitting(true);


    setTimeout(() => {

      toast.success(
        'Your support request has been submitted! Our team will get back to you within 24 hours.'
      );


      setFormData({
        subject: '',
        category: 'Technical',
        message: ''
      });


      setSubmitting(false);

    }, 800);

  };


  // ============================================================
  // FAQ TOGGLE
  // ============================================================

  const toggleFaq = (id) => {

    setOpenFaq(
      openFaq === id
        ? null
        : id
    );

  };


  // ============================================================
  // RENDER
  // ============================================================

  return (

    <StudentLayout>

      <div className="hs-page">

        <div className="container-fluid">


          {/* ==================================================
              PAGE HEADER
          ================================================== */}

          <div className="hs-page-header">

            <div>

              <div className="hs-eyebrow">
                <FaHeadset />
                HELP & SUPPORT
              </div>

              <h1>
                How can we help?
              </h1>

              <p>
                Get answers, explore platform features,
                or connect with our support team.
              </p>

            </div>


            <div className="hs-header-status">

              <span className="hs-header-status-dot" />

              Support is available

            </div>

          </div>


          {/* ==================================================
              AI HERO
          ================================================== */}

          <section className="hs-ai-hero">

            <div className="hs-ai-circle" />

            <div className="hs-ai-hero-content">

              <div className="hs-ai-hero-icon">
                <FaRobot />
              </div>


              <div className="hs-ai-badge">
                AI ASSISTANT
              </div>


              <h2>
                Meet HireSmart AI
              </h2>


              <p>
                Have a quick question? Ask our little AI
                assistant. It can guide you through
                interviews, resumes, ATS scoring,
                placements and certificates.
              </p>


              <button
                type="button"
                className="hs-ai-hero-button"
                onClick={() => setChatOpen(true)}
              >

                <FaRobot />

                Ask HireSmart AI

                <FaArrowRight className="hs-ai-button-arrow" />

              </button>

            </div>


            <div className="hs-ai-hero-decoration">

              <div className="hs-decoration-dot dot-one" />
              <div className="hs-decoration-dot dot-two" />
              <div className="hs-decoration-dot dot-three" />

            </div>

          </section>


          {/* ==================================================
              FAQ + SUPPORT
          ================================================== */}

          <div className="row g-4 mt-1">


            {/* =================================================
                FAQ SECTION
            ================================================= */}

            <div className="col-xl-7">

              <section className="hs-section-card">

                <div className="hs-section-header">

                  <div>

                    <div className="hs-section-label">
                      <FaQuestionCircle />
                      COMMON QUESTIONS
                    </div>

                    <h3>
                      Frequently Asked Questions
                    </h3>

                    <p>
                      Quick answers to the things candidates
                      ask us most often.
                    </p>

                  </div>

                  <div className="hs-section-count">
                    {faqs.length}
                    <span>topics</span>
                  </div>

                </div>


                <div className="hs-faq-list">

                  {faqs.map((faq, index) => {

                    const Icon = faq.icon;

                    const isOpen =
                      openFaq === faq.id;


                    return (

                      <div
                        key={faq.id}
                        className={`hs-faq-item ${
                          isOpen
                            ? 'hs-faq-open'
                            : ''
                        }`}
                      >

                        <button
                          type="button"
                          className="hs-faq-question"
                          onClick={() =>
                            toggleFaq(faq.id)
                          }
                        >

                          <div className="hs-faq-left">

                            <div className="hs-faq-icon">
                              <Icon />
                            </div>


                            <div>

                              <span className="hs-faq-number">
                                0{index + 1}
                              </span>

                              <span className="hs-faq-title">
                                {faq.question}
                              </span>

                            </div>

                          </div>


                          <div className="hs-faq-toggle">

                            {isOpen
                              ? <FaChevronUp />
                              : <FaChevronDown />
                            }

                          </div>

                        </button>


                        {isOpen && (

                          <div className="hs-faq-answer">

                            <div className="hs-faq-answer-line" />

                            <p>
                              {faq.answer}
                            </p>

                          </div>

                        )}

                      </div>

                    );

                  })}

                </div>

              </section>

            </div>


            {/* =================================================
                SEND MESSAGE
            ================================================= */}

            <div className="col-xl-5">

              <section className="hs-section-card hs-support-card">

                <div className="hs-section-label">
                  <FaEnvelope />
                  CONTACT SUPPORT
                </div>


                <h3>
                  Send Us a Message
                </h3>


                <p className="hs-support-intro">
                  Can't find what you're looking for?
                  Send us a message and our support team
                  will help you out.
                </p>


                <form onSubmit={handleSubmit}>


                  {/* NAME */}

                  <div className="hs-form-group">

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


                  {/* CATEGORY */}

                  <div className="hs-form-group">

                    <label>
                      Category
                    </label>

                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                    >

                      <option value="Technical">
                        AI Mock Interview / Technical
                      </option>

                      <option value="Resume">
                        Resume Upload & ATS Scanner
                      </option>

                      <option value="Placements">
                        Placement Opportunities
                      </option>

                      <option value="Account">
                        Account & Profile
                      </option>

                      <option value="Other">
                        General Inquiry
                      </option>

                    </select>

                  </div>


                  {/* SUBJECT */}

                  <div className="hs-form-group">

                    <label>
                      Subject <span>*</span>
                    </label>

                    <input
                      type="text"
                      name="subject"
                      placeholder="What can we help with?"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                    />

                  </div>


                  {/* MESSAGE */}

                  <div className="hs-form-group">

                    <label>
                      Message <span>*</span>
                    </label>

                    <textarea
                      name="message"
                      rows="5"
                      placeholder="Tell us a little more about your question..."
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                    />

                  </div>


                  <button
                    type="submit"
                    className="hs-submit-button"
                    disabled={submitting}
                  >

                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane />
                        Send Support Request
                      </>
                    )}

                  </button>


                  <div className="hs-response-note">

                    <FaCheckCircle />

                    We usually respond within 24 hours.

                  </div>

                </form>

              </section>

            </div>

          </div>


          {/* ==================================================
              SUPPORT FEATURES
          ================================================== */}

          <div className="hs-feature-row">


            <div className="hs-feature">

              <div className="hs-feature-icon purple">
                <FaRobot />
              </div>

              <div>

                <h6>
                  AI-Powered Help
                </h6>

                <p>
                  Get instant answers about the platform.
                </p>

              </div>

            </div>


            <div className="hs-feature">

              <div className="hs-feature-icon green">
                <FaCheckCircle />
              </div>

              <div>

                <h6>
                  Candidate Support
                </h6>

                <p>
                  Our team is here when you need us.
                </p>

              </div>

            </div>


            <div className="hs-feature">

              <div className="hs-feature-icon orange">
                <FaShieldAlt />
              </div>

              <div>

                <h6>
                  Secure Platform
                </h6>

                <p>
                  Your candidate information stays protected.
                </p>

              </div>

            </div>


            <div className="hs-feature">

              <div className="hs-feature-icon blue">
                <FaBriefcase />
              </div>

              <div>

                <h6>
                  Career Guidance
                </h6>

                <p>
                  Get help throughout your career journey.
                </p>

              </div>

            </div>

          </div>


        </div>


        {/* ====================================================
            FLOATING AI LAUNCHER
        ===================================================== */}

        {!chatOpen && (

          <button
            type="button"
            className="hs-floating-ai"
            onClick={() => setChatOpen(true)}
            aria-label="Open HireSmart AI"
          >

            <span className="hs-floating-ai-icon">
              <FaRobot />
            </span>

            <span className="hs-floating-ai-text">
              Ask HireSmart AI
            </span>

          </button>

        )}


        {/* ====================================================
            AI CHAT WINDOW
        ===================================================== */}

        {chatOpen && (

          <div className="hs-chat-window">


            {/* CHAT HEADER */}

            <div className="hs-chat-header">

              <div className="hs-chat-header-left">

                <div className="hs-chat-avatar">
                  <FaRobot />
                </div>


                <div>

                  <div className="hs-chat-title">
                    HireSmart AI
                  </div>

                  <div className="hs-chat-status">

                    <span />

                    Online · Ready to help

                  </div>

                </div>

              </div>


              <div className="hs-chat-actions">

                <button
                  type="button"
                  onClick={resetChat}
                  title="Reset conversation"
                >
                  <FaRedo />
                </button>

                <button
                  type="button"
                  onClick={() => setChatOpen(false)}
                  title="Close"
                >
                  <FaTimes />
                </button>

              </div>

            </div>


            {/* CHAT BODY */}

            <div
              className="hs-chat-body"
              ref={chatBodyRef}
            >

              {chatMessages.length === 1 && (

                <div className="hs-chat-welcome">

                  <div className="hs-chat-welcome-icon">
                    <FaRobot />
                  </div>

                  <h5>
                    What can I help you with?
                  </h5>

                  <p>
                    Choose a question or type your own.
                  </p>


                  <div className="hs-chat-suggestions">

                    {suggestedQuestions.map(
                      (question) => (

                        <button
                          key={question}
                          type="button"
                          onClick={() =>
                            sendChatMessage(question)
                          }
                        >
                          {question}
                        </button>

                      )
                    )}

                  </div>

                </div>

              )}


              {chatMessages.map((message) => (

                <div
                  key={message.id}
                  className={`hs-chat-message-row ${
                    message.sender === 'user'
                      ? 'user'
                      : ''
                  }`}
                >

                  {message.sender === 'ai' && (

                    <div className="hs-chat-mini-avatar">
                      <FaRobot />
                    </div>

                  )}


                  <div
                    className={`hs-chat-message ${
                      message.sender === 'user'
                        ? 'user-message'
                        : 'bot-message'
                    }`}
                  >

                    <div>
                      {message.text}
                    </div>

                    <span>
                      {message.time}
                    </span>

                  </div>

                </div>

              ))}


              {chatTyping && (

                <div className="hs-chat-message-row">

                  <div className="hs-chat-mini-avatar">
                    <FaRobot />
                  </div>

                  <div className="hs-chat-typing">

                    <span />
                    <span />
                    <span />

                  </div>

                </div>

              )}

            </div>


            {/* CHAT INPUT */}

            <div className="hs-chat-input-wrapper">

              <textarea
                ref={chatInputRef}
                value={chatInput}
                onChange={(e) =>
                  setChatInput(e.target.value)
                }
                onKeyDown={handleChatKeyDown}
                placeholder="Ask anything..."
                rows="1"
                disabled={chatTyping}
              />


              <button
                type="button"
                onClick={() =>
                  sendChatMessage()
                }
                disabled={
                  !chatInput.trim() ||
                  chatTyping
                }
              >
                <FaPaperPlane />
              </button>

            </div>


            <div className="hs-chat-footer">

              <FaRobot />

              HireSmart AI · Demo Assistant

            </div>

          </div>

        )}


        {/* ====================================================
            PAGE STYLES
        ===================================================== */}

        <style>{`

          /* ================================================
             PAGE
          ================================================ */

          .hs-page {
            min-height: 100vh;
            background: #FAFAFB;
            padding: 4px 0 80px;
            color: #172033;
          }


          /* ================================================
             PAGE HEADER
          ================================================ */

          .hs-page-header {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;

            padding: 28px 4px 24px;

            gap: 20px;
          }


          .hs-eyebrow {
            display: flex;
            align-items: center;
            gap: 7px;

            margin-bottom: 8px;

            color: #5146E5;

            font-size: 10px;
            font-weight: 800;
            letter-spacing: 1.2px;
          }


          .hs-page-header h1 {
            margin: 0;

            color: #172033;

            font-size: clamp(28px, 3vw, 38px);
            font-weight: 800;

            letter-spacing: -1.4px;
          }


          .hs-page-header p {
            margin: 8px 0 0;

            color: #697386;

            font-size: 14px;
          }


          .hs-header-status {
            display: flex;
            align-items: center;
            gap: 8px;

            padding: 9px 13px;

            border: 1px solid #E6E8EF;
            border-radius: 999px;

            background: #FFFFFF;

            color: #687184;

            font-size: 11px;
            font-weight: 600;
          }


          .hs-header-status-dot {
            width: 7px;
            height: 7px;

            border-radius: 50%;

            background: #35C98A;

            box-shadow:
              0 0 0 4px rgba(53,201,138,0.10);
          }


          /* ================================================
             AI HERO
          ================================================ */

          .hs-ai-hero {
            position: relative;

            min-height: 440px;

            overflow: hidden;

            margin-bottom: 24px;

            border: 1px solid #DDE3FA;

            border-radius: 28px;

            background:
              linear-gradient(
                145deg,
                #F1F4FF 0%,
                #F8F9FE 55%,
                #FFFFFF 100%
              );

            box-shadow:
              0 8px 35px rgba(51,65,85,0.04);
          }


          .hs-ai-hero-content {
            position: relative;
            z-index: 2;

            max-width: 780px;

            padding: 50px 50px 55px;
          }


          .hs-ai-hero-icon {
            width: 116px;
            height: 116px;

            display: flex;
            align-items: center;
            justify-content: center;

            margin-bottom: 38px;

            border-radius: 50%;

            color: #FFFFFF;

            background:
              linear-gradient(
                145deg,
                #5542E9,
                #7438E8
              );

            font-size: 43px;

            box-shadow:
              0 18px 35px rgba(88,65,230,0.20);
          }


          .hs-ai-badge {
            display: inline-flex;
            align-items: center;

            margin-bottom: 16px;

            padding: 7px 15px;

            border-radius: 999px;

            color: #4438C9;

            background: #E1E7FF;

            font-size: 13px;
            font-weight: 800;
          }


          .hs-ai-hero h2 {
            margin: 0 0 17px;

            color: #182237;

            font-size: clamp(40px, 5vw, 56px);
            line-height: 1.05;
            font-weight: 800;

            letter-spacing: -2.5px;
          }


          .hs-ai-hero p {
            max-width: 760px;

            margin: 0 0 30px;

            color: #596170;

            font-size: 18px;
            line-height: 1.65;
          }


          .hs-ai-hero-button {
            display: inline-flex;
            align-items: center;
            gap: 13px;

            padding: 16px 24px;

            border: none;
            border-radius: 15px;

            color: #FFFFFF;

            background: #1677F2;

            font-size: 17px;
            font-weight: 700;

            box-shadow:
              0 10px 25px rgba(22,119,242,0.20);

            cursor: pointer;

            transition:
              transform .2s ease,
              box-shadow .2s ease;
          }


          .hs-ai-hero-button:hover {
            transform: translateY(-2px);

            box-shadow:
              0 15px 30px rgba(22,119,242,0.25);
          }


          .hs-ai-button-arrow {
            margin-left: 8px;

            font-size: 13px;

            transition:
              transform .2s ease;
          }


          .hs-ai-hero-button:hover
          .hs-ai-button-arrow {
            transform: translateX(3px);
          }


          .hs-ai-circle {
            position: absolute;

            width: 380px;
            height: 380px;

            right: -130px;
            top: -190px;

            border-radius: 50%;

            background:
              rgba(108,122,231,0.08);
          }


          .hs-ai-circle::after {
            content: '';

            position: absolute;

            width: 240px;
            height: 240px;

            right: 80px;
            bottom: -150px;

            border-radius: 50%;

            background:
              rgba(108,122,231,0.045);
          }


          .hs-ai-hero-decoration {
            position: absolute;

            right: 90px;
            bottom: 65px;

            width: 130px;
            height: 130px;
          }


          .hs-decoration-dot {
            position: absolute;

            border-radius: 50%;

            background: #C7D2FE;
          }


          .dot-one {
            width: 8px;
            height: 8px;

            right: 15px;
            top: 15px;
          }


          .dot-two {
            width: 5px;
            height: 5px;

            right: 45px;
            top: 48px;
          }


          .dot-three {
            width: 11px;
            height: 11px;

            right: 80px;
            top: 80px;

            opacity: .55;
          }


          /* ================================================
             SECTION CARDS
          ================================================ */

          .hs-section-card {
            height: 100%;

            padding: 28px;

            border: 1px solid #E5E7ED;
            border-radius: 20px;

            background: #FFFFFF;

            box-shadow:
              0 5px 25px rgba(15,23,42,0.035);
          }


          .hs-section-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;

            gap: 20px;

            padding-bottom: 23px;

            border-bottom: 1px solid #EEF0F4;
          }


          .hs-section-label {
            display: flex;
            align-items: center;
            gap: 7px;

            margin-bottom: 9px;

            color: #5A50DD;

            font-size: 10px;
            font-weight: 800;
            letter-spacing: 1px;
          }


          .hs-section-label svg {
            font-size: 11px;
          }


          .hs-section-card h3 {
            margin: 0;

            color: #1B2538;

            font-size: 23px;
            font-weight: 800;

            letter-spacing: -.5px;
          }


          .hs-section-header p,
          .hs-support-intro {
            margin: 7px 0 0;

            color: #7A8291;

            font-size: 12px;
            line-height: 1.6;
          }


          .hs-section-count {
            display: flex;
            align-items: center;
            gap: 5px;

            padding: 7px 10px;

            border-radius: 8px;

            color: #5A50DD;

            background: #F2F3FF;

            font-size: 12px;
            font-weight: 800;
          }


          .hs-section-count span {
            color: #8A8FA0;

            font-size: 10px;
            font-weight: 600;
          }


          /* ================================================
             FAQ
          ================================================ */

          .hs-faq-list {
            padding-top: 18px;
          }


          .hs-faq-item {
            margin-bottom: 8px;

            border: 1px solid transparent;
            border-radius: 13px;

            overflow: hidden;

            transition:
              border-color .2s ease,
              background .2s ease;
          }


          .hs-faq-item:hover {
            border-color: #E8EAF1;

            background: #FCFCFE;
          }


          .hs-faq-open {
            border-color: #DFE2F7;

            background: #F9FAFF;
          }


          .hs-faq-question {
            width: 100%;

            display: flex;
            align-items: center;
            justify-content: space-between;

            gap: 15px;

            padding: 15px 13px;

            border: none;

            color: #1F2937;

            background: transparent;

            text-align: left;

            cursor: pointer;
          }


          .hs-faq-left {
            display: flex;
            align-items: center;
            gap: 13px;

            min-width: 0;
          }


          .hs-faq-icon {
            width: 38px;
            height: 38px;

            flex-shrink: 0;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 10px;

            color: #5A50DD;

            background: #EFF1FF;

            font-size: 14px;
          }


          .hs-faq-number {
            display: block;

            margin-bottom: 3px;

            color: #A0A6B2;

            font-size: 9px;
            font-weight: 700;
            letter-spacing: .5px;
          }


          .hs-faq-title {
            display: block;

            color: #30394A;

            font-size: 13px;
            font-weight: 700;

            line-height: 1.45;
          }


          .hs-faq-toggle {
            width: 28px;
            height: 28px;

            flex-shrink: 0;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 8px;

            color: #7B8190;

            background: #F4F5F8;

            font-size: 9px;
          }


          .hs-faq-open .hs-faq-toggle {
            color: #5A50DD;

            background: #E9EBFF;
          }


          .hs-faq-answer {
            display: flex;
            gap: 12px;

            padding:
              0 18px 18px 64px;
          }


          .hs-faq-answer-line {
            width: 2px;

            flex-shrink: 0;

            border-radius: 10px;

            background: #C7D2FE;
          }


          .hs-faq-answer p {
            margin: 0;

            color: #6B7280;

            font-size: 12px;
            line-height: 1.75;
          }


          /* ================================================
             SUPPORT FORM
          ================================================ */

          .hs-support-card {
            padding: 30px;
          }


          .hs-support-card h3 {
            font-size: 27px;

            margin-bottom: 8px;
          }


          .hs-support-intro {
            font-size: 13px;

            margin-bottom: 26px;
          }


          .hs-form-group {
            margin-bottom: 17px;
          }


          .hs-form-group label {
            display: block;

            margin-bottom: 7px;

            color: #4B5563;

            font-size: 11px;
            font-weight: 700;
          }


          .hs-form-group label span {
            color: #EF4444;
          }


          .hs-form-group input,
          .hs-form-group select,
          .hs-form-group textarea {
            width: 100%;

            padding: 11px 12px;

            border: 1px solid #E1E5EB;
            border-radius: 10px;

            outline: none;

            color: #293244;

            background: #FAFBFC;

            font-family: inherit;

            font-size: 12px;

            transition:
              border-color .2s ease,
              box-shadow .2s ease,
              background .2s ease;
          }


          .hs-form-group textarea {
            resize: vertical;

            min-height: 115px;
          }


          .hs-form-group input:focus,
          .hs-form-group select:focus,
          .hs-form-group textarea:focus {
            border-color: #A5B4FC;

            background: #FFFFFF;

            box-shadow:
              0 0 0 3px rgba(99,102,241,.07);
          }


          .hs-form-group input:disabled {
            color: #858C9A;

            background: #F5F6F8;

            cursor: not-allowed;
          }


          .hs-form-group input::placeholder,
          .hs-form-group textarea::placeholder {
            color: #A1A8B4;
          }


          .hs-submit-button {
            width: 100%;

            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;

            padding: 12px;

            border: none;
            border-radius: 10px;

            color: #FFFFFF;

            background: #4F46E5;

            font-size: 12px;
            font-weight: 700;

            cursor: pointer;

            transition:
              background .2s ease,
              transform .2s ease;
          }


          .hs-submit-button:hover:not(:disabled) {
            background: #4338CA;

            transform: translateY(-1px);
          }


          .hs-submit-button:disabled {
            opacity: .65;

            cursor: not-allowed;
          }


          .hs-response-note {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;

            margin-top: 13px;

            color: #8A919F;

            font-size: 10px;
          }


          .hs-response-note svg {
            color: #34B27B;
          }


          /* ================================================
             FEATURE ROW
          ================================================ */

          .hs-feature-row {
            display: grid;

            grid-template-columns:
              repeat(4, 1fr);

            gap: 12px;

            margin-top: 18px;
          }


          .hs-feature {
            display: flex;
            align-items: center;

            gap: 11px;

            padding: 16px;

            border: 1px solid #E7E9EE;
            border-radius: 13px;

            background: #FFFFFF;
          }


          .hs-feature-icon {
            width: 35px;
            height: 35px;

            flex-shrink: 0;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 9px;

            font-size: 13px;
          }


          .hs-feature-icon.purple {
            color: #5B4DE4;
            background: #EFF0FF;
          }


          .hs-feature-icon.green {
            color: #159A69;
            background: #EAF9F2;
          }


          .hs-feature-icon.orange {
            color: #D97706;
            background: #FFF5E7;
          }


          .hs-feature-icon.blue {
            color: #2563EB;
            background: #EBF3FF;
          }


          .hs-feature h6 {
            margin: 0 0 3px;

            color: #30394A;

            font-size: 11px;
            font-weight: 800;
          }


          .hs-feature p {
            margin: 0;

            color: #9096A3;

            font-size: 9px;
            line-height: 1.4;
          }


          /* ================================================
             FLOATING AI BUTTON
             MATCHES YOUR REFERENCE
          ================================================ */

          .hs-floating-ai {
            position: fixed;

            right: 24px;
            bottom: 24px;

            z-index: 9998;

            height: 72px;

            display: flex;
            align-items: center;

            padding:
              0 28px 0 18px;

            gap: 17px;

            border: none;

            border-radius: 999px;

            color: #FFFFFF;

            background: #111827;

            box-shadow:
              0 18px 45px rgba(15,23,42,.22);

            cursor: pointer;

            transition:
              transform .22s ease,
              box-shadow .22s ease;
          }


          .hs-floating-ai:hover {
            transform: translateY(-3px);

            box-shadow:
              0 23px 50px rgba(15,23,42,.28);
          }


          .hs-floating-ai-icon {
            width: 50px;
            height: 50px;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 50%;

            color: #FFFFFF;

            background:
              linear-gradient(
                145deg,
                #5145E5,
                #4F46E5
              );

            font-size: 21px;

            box-shadow:
              0 8px 20px rgba(79,70,229,.25);
          }


          .hs-floating-ai-text {
            font-size: 18px;
            font-weight: 700;

            white-space: nowrap;
          }


          /* ================================================
             CHAT WINDOW
          ================================================ */

          .hs-chat-window {
            position: fixed;

            right: 24px;
            bottom: 24px;

            z-index: 9999;

            width: 390px;
            height: 590px;

            max-width:
              calc(100vw - 30px);

            max-height:
              calc(100vh - 45px);

            display: flex;
            flex-direction: column;

            overflow: hidden;

            border:
              1px solid #E1E5EC;

            border-radius: 20px;

            background: #FFFFFF;

            box-shadow:
              0 25px 70px rgba(15,23,42,.22);
          }


          /* CHAT HEADER */

          .hs-chat-header {
            display: flex;
            align-items: center;
            justify-content: space-between;

            padding: 14px 15px;

            color: #FFFFFF;

            background: #111827;
          }


          .hs-chat-header-left {
            display: flex;
            align-items: center;

            gap: 11px;
          }


          .hs-chat-avatar {
            width: 42px;
            height: 42px;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 50%;

            color: #FFFFFF;

            background:
              linear-gradient(
                145deg,
                #5548E9,
                #4F46E5
              );

            font-size: 19px;
          }


          .hs-chat-title {
            color: #FFFFFF;

            font-size: 14px;
            font-weight: 800;
          }


          .hs-chat-status {
            display: flex;
            align-items: center;
            gap: 5px;

            margin-top: 2px;

            color: #AAB2C0;

            font-size: 9px;
          }


          .hs-chat-status span {
            width: 6px;
            height: 6px;

            border-radius: 50%;

            background: #35D399;
          }


          .hs-chat-actions {
            display: flex;
            gap: 4px;
          }


          .hs-chat-actions button {
            width: 30px;
            height: 30px;

            display: flex;
            align-items: center;
            justify-content: center;

            border: none;
            border-radius: 8px;

            color: #AAB2C0;

            background: rgba(255,255,255,.07);

            cursor: pointer;
          }


          .hs-chat-actions button:hover {
            color: #FFFFFF;

            background:
              rgba(255,255,255,.13);
          }


          /* CHAT BODY */

          .hs-chat-body {
            flex: 1;

            overflow-y: auto;

            padding: 15px;

            background: #F8F9FC;
          }


          .hs-chat-body::-webkit-scrollbar {
            width: 5px;
          }


          .hs-chat-body::-webkit-scrollbar-thumb {
            background: #D4D8E1;

            border-radius: 10px;
          }


          /* WELCOME */

          .hs-chat-welcome {
            padding: 16px;

            margin-bottom: 17px;

            text-align: center;

            border: 1px solid #E7EAF0;

            border-radius: 14px;

            background: #FFFFFF;
          }


          .hs-chat-welcome-icon {
            width: 42px;
            height: 42px;

            display: flex;
            align-items: center;
            justify-content: center;

            margin: 0 auto 9px;

            border-radius: 12px;

            color: #5146E5;

            background: #EEF0FF;
          }


          .hs-chat-welcome h5 {
            margin: 0 0 4px;

            color: #20293A;

            font-size: 13px;
            font-weight: 800;
          }


          .hs-chat-welcome p {
            margin: 0 0 12px;

            color: #8A91A0;

            font-size: 10px;
          }


          .hs-chat-suggestions {
            display: flex;
            flex-wrap: wrap;

            justify-content: center;

            gap: 6px;
          }


          .hs-chat-suggestions button {
            padding: 7px 9px;

            border:
              1px solid #E0E4F8;

            border-radius: 999px;

            color: #4D45BE;

            background: #F5F6FF;

            font-size: 9px;
            font-weight: 600;

            cursor: pointer;
          }


          .hs-chat-suggestions button:hover {
            background: #ECEEFF;
          }


          /* MESSAGES */

          .hs-chat-message-row {
            display: flex;
            align-items: flex-end;

            gap: 7px;

            margin-bottom: 11px;
          }


          .hs-chat-message-row.user {
            justify-content: flex-end;
          }


          .hs-chat-mini-avatar {
            width: 24px;
            height: 24px;

            flex-shrink: 0;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 8px;

            color: #5146E5;

            background: #E7E9FF;

            font-size: 10px;
          }


          .hs-chat-message {
            max-width: 78%;

            padding: 9px 11px;

            border-radius: 12px;

            font-size: 11px;

            line-height: 1.55;
          }


          .bot-message {
            color: #374151;

            background: #FFFFFF;

            border:
              1px solid #E3E6ED;

            border-bottom-left-radius: 4px;
          }


          .user-message {
            color: #FFFFFF;

            background: #4F46E5;

            border-bottom-right-radius: 4px;
          }


          .hs-chat-message span {
            display: block;

            margin-top: 4px;

            text-align: right;

            font-size: 7px;

            opacity: .5;
          }


          /* TYPING */

          .hs-chat-typing {
            display: flex;
            align-items: center;

            gap: 4px;

            padding: 11px 12px;

            border:
              1px solid #E3E6ED;

            border-radius: 12px;

            border-bottom-left-radius: 4px;

            background: #FFFFFF;
          }


          .hs-chat-typing span {
            width: 5px;
            height: 5px;

            border-radius: 50%;

            background: #9299A7;

            animation:
              hsTyping 1.2s infinite;
          }


          .hs-chat-typing span:nth-child(2) {
            animation-delay: .15s;
          }


          .hs-chat-typing span:nth-child(3) {
            animation-delay: .3s;
          }


          @keyframes hsTyping {

            0%,
            60%,
            100% {
              transform: translateY(0);
              opacity: .4;
            }

            30% {
              transform: translateY(-4px);
              opacity: 1;
            }

          }


          /* CHAT INPUT */

          .hs-chat-input-wrapper {
            display: flex;
            align-items: flex-end;

            gap: 8px;

            padding: 10px;

            border-top:
              1px solid #E7E9EE;

            background: #FFFFFF;
          }


          .hs-chat-input-wrapper textarea {
            flex: 1;

            min-height: 39px;
            max-height: 90px;

            resize: none;

            padding: 10px;

            border:
              1px solid #DDE1E8;

            border-radius: 10px;

            outline: none;

            color: #273142;

            background: #FAFBFC;

            font-family: inherit;

            font-size: 11px;
          }


          .hs-chat-input-wrapper textarea:focus {
            border-color: #9EA5F8;

            background: #FFFFFF;

            box-shadow:
              0 0 0 3px rgba(79,70,229,.06);
          }


          .hs-chat-input-wrapper button {
            width: 39px;
            height: 39px;

            flex-shrink: 0;

            display: flex;
            align-items: center;
            justify-content: center;

            border: none;
            border-radius: 10px;

            color: #FFFFFF;

            background: #4F46E5;

            cursor: pointer;
          }


          .hs-chat-input-wrapper button:hover:not(:disabled) {
            background: #4338CA;
          }


          .hs-chat-input-wrapper button:disabled {
            opacity: .4;

            cursor: not-allowed;
          }


          .hs-chat-footer {
            display: flex;
            align-items: center;
            justify-content: center;

            gap: 5px;

            padding: 5px;

            border-top:
              1px solid #F0F1F4;

            color: #9AA1AE;

            background: #FFFFFF;

            font-size: 8px;
          }


          /* ================================================
             RESPONSIVE
          ================================================ */

          @media (max-width: 1199px) {

            .hs-feature-row {
              grid-template-columns:
                repeat(2, 1fr);
            }

          }


          @media (max-width: 767px) {

            .hs-page-header {
              align-items: flex-start;
              flex-direction: column;
            }


            .hs-header-status {
              display: none;
            }


            .hs-ai-hero {
              min-height: 420px;

              border-radius: 20px;
            }


            .hs-ai-hero-content {
              padding: 35px 25px 40px;
            }


            .hs-ai-hero-icon {
              width: 82px;
              height: 82px;

              margin-bottom: 28px;

              font-size: 30px;
            }


            .hs-ai-hero h2 {
              font-size: 38px;

              letter-spacing: -1.5px;
            }


            .hs-ai-hero p {
              font-size: 15px;
            }


            .hs-ai-hero-decoration {
              display: none;
            }


            .hs-section-card {
              padding: 21px;
            }


            .hs-section-header {
              flex-direction: column;
            }


            .hs-section-count {
              display: none;
            }


            .hs-feature-row {
              grid-template-columns: 1fr;
            }


            .hs-floating-ai {
              right: 15px;
              bottom: 15px;

              height: 60px;

              padding:
                0 18px 0 10px;

              gap: 10px;
            }


            .hs-floating-ai-icon {
              width: 44px;
              height: 44px;

              font-size: 18px;
            }


            .hs-floating-ai-text {
              font-size: 14px;
            }


            .hs-chat-window {
              right: 10px;
              bottom: 10px;

              width:
                calc(100vw - 20px);

              height:
                calc(100vh - 20px);

              max-height: none;

              border-radius: 17px;
            }

          }


          @media (max-width: 480px) {

            .hs-page-header h1 {
              font-size: 30px;
            }


            .hs-ai-hero-content {
              padding:
                30px 20px;
            }


            .hs-ai-hero h2 {
              font-size: 34px;
            }


            .hs-ai-hero-button {
              width: 100%;

              justify-content: center;
            }


            .hs-faq-answer {
              padding-left: 15px;
            }


            .hs-faq-number {
              display: none;
            }

          }

        `}</style>

      </div>

    </StudentLayout>
  );
};


export default HelpSupport;