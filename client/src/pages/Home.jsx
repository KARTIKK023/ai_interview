import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import {
  FaRobot,
  FaLaptopCode,
  FaUserTie,
  FaVideo,
  FaFont,
  FaChartLine,
  FaCheckCircle,
  FaArrowRight,
  FaBriefcase,
  FaGraduationCap,
  FaFileAlt,
  FaMicrophone,
  FaSlidersH,
  FaShieldAlt,
  FaStar,
  FaLightbulb,
  FaUsers,
  FaCheck,
  FaPlayCircle,
  FaArrowUp,
  FaRegDotCircle
} from 'react-icons/fa';
import { TbScan } from 'react-icons/tb';

const sampleTechRoles = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
  "DevOps Engineer",
  "React Developer",
  "AI Engineer",
  "Python Developer"
];

const sampleNonTechRoles = [
  "Sales Executive",
  "Sales Manager",
  "HR Executive",
  "Marketing Executive",
  "Financial Analyst",
  "Business Development Executive",
  "Customer Support",
  "Legal Advisor"
];

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Technical');

  const isStudent = user && (user.role || '').toLowerCase() === 'student';

  const handleStartPracticing = () => {
    if (isStudent) {
      navigate('/student/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="bg-futuristic-dark text-white min-vh-100 d-flex flex-column overflow-hidden" id="top">
      {/* FLOATING TRANSLUCENT NAVBAR */}
      <div className="container py-3 sticky-top" style={{ zIndex: 1050 }}>
        <nav className="glass-navbar navbar navbar-expand-lg navbar-dark px-4 py-2">
          <div className="container-fluid p-0">
            <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold text-white fs-4" to="/">
              <div className="bg-primary bg-opacity-25 border border-primary text-primary rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px' }}>
                <FaRobot size={20} className="text-info" />
              </div>
              <span className="fw-extrabold tracking-tight">
                <span className="text-gradient-purple-blue">AI</span> Interview
              </span>
            </Link>

            <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#homeNavbar">
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="homeNavbar">
              <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-lg-3">
                <li className="nav-item">
                  <a className="nav-link text-white fw-semibold small" href="#top">Home</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link text-white-50 fw-semibold small" href="#features">Features</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link text-white-50 fw-semibold small" href="#how-it-works">How It Works</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link text-white-50 fw-semibold small" href="#roles">For Students</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link text-white-50 fw-semibold small" href="#analytics">For Companies</a>
                </li>
              </ul>

              <div className="d-flex align-items-center gap-3">
                {isStudent ? (
                  <button
                    className="btn btn-glow-primary rounded-pill px-4 py-2 small d-flex align-items-center gap-2"
                    onClick={handleStartPracticing}
                  >
                    Go to Dashboard <FaArrowRight size={12} />
                  </button>
                ) : (
                  <>
                    <Link to="/login" className="text-white-50 fw-semibold text-decoration-none small px-2">
                      Login
                    </Link>
                    <Link to="/login" className="btn btn-glow-primary rounded-pill px-4 py-2 small d-flex align-items-center gap-2">
                      Get Started <FaArrowRight size={12} />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* HERO SECTION */}
      <section className="py-5 position-relative">
        <div className="container py-lg-4">
          <div className="row align-items-center g-5">
            {/* HERO LEFT COLUMN */}
            <div className="col-lg-7">
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="d-inline-flex align-items-center gap-2 glow-pill px-3 py-1 rounded-pill small fw-bold mb-4">
                  <span>✦ AI-POWERED INTERVIEW PLATFORM</span>
                </div>

                <h1 className="display-3 fw-extrabold mb-4 lh-sm text-white">
                  Turn Your Skills Into <br />
                  <span className="text-gradient-purple-blue">Dream Opportunities</span>
                </h1>

                <p className="lead text-white-50 mb-4 me-lg-4 fs-5">
                  Practice smarter. Interview with confidence. Get job ready with AI-powered mock interviews and personalized feedback.
                </p>

                <div className="d-flex flex-wrap gap-3 mb-5">
                  <Link
                    to={isStudent ? '/student/dashboard' : '/login'}
                    className="btn btn-glow-primary btn-lg rounded-pill px-4 py-3 fw-bold d-flex align-items-center gap-2 fs-6 shadow-lg text-decoration-none"
                  >
                    Start Practicing Free <FaArrowRight size={14} />
                  </Link>
                  <a
                    href="#features"
                    className="btn glass-card text-white btn-lg rounded-pill px-4 py-3 fw-semibold d-flex align-items-center gap-2 fs-6"
                  >
                    Explore AI Interview
                  </a>
                </div>

                {/* TRUST INDICATORS */}
                <div className="d-flex align-items-center gap-4 text-white-50 small fw-semibold">
                  <span className="d-flex align-items-center gap-2">
                    <FaCheckCircle className="text-cyan-400 text-info" /> Resume-Based
                  </span>
                  <span>•</span>
                  <span className="d-flex align-items-center gap-2">
                    <FaCheckCircle className="text-purple-400 text-primary" /> AI-Powered
                  </span>
                  <span>•</span>
                  <span className="d-flex align-items-center gap-2">
                    <FaCheckCircle className="text-success" /> Instant Feedback
                  </span>
                </div>
              </motion.div>
            </div>

            {/* HERO RIGHT COLUMN (AI INTERVIEWER HOLOGRAPHIC VISUAL) */}
            <div className="col-lg-5 position-relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="position-relative"
              >
                {/* Glowing Outer Rings */}
                <div
                  className="position-absolute top-50 start-50 translate-middle rounded-circle border border-primary border-opacity-25 floating-anim"
                  style={{ width: '380px', height: '380px', background: 'radial-gradient(circle, rgba(124, 58, 237, 0.25) 0%, transparent 70%)' }}
                ></div>

                {/* Central AI Avatar Visualization Card */}
                <div className="glass-card p-4 text-white floating-anim position-relative">
                  <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom border-secondary border-opacity-25">
                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-gradient-primary text-white rounded-circle p-3 shadow-lg d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                        <FaRobot size={26} />
                      </div>
                      <div>
                        <h6 className="fw-bold mb-0 text-white">AI Interviewer</h6>
                        <span className="badge bg-success bg-opacity-25 text-success extra-small">● ACTIVE SESSION</span>
                      </div>
                    </div>
                    <span className="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-50 px-2 py-1 extra-small fw-bold">
                      ● REC
                    </span>
                  </div>

                  {/* Simulated Question */}
                  <div className="p-3 rounded-3 mb-3" style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(148, 163, 184, 0.15)' }}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="extra-small text-info fw-bold text-uppercase">Question 04 of 08</span>
                      <span className="extra-small text-muted">React & Frontend Architecture</span>
                    </div>
                    <p className="small text-white mb-0 italic">
                      "Explain how React's Virtual DOM reconciliation process optimizes UI re-rendering performance."
                    </p>
                  </div>

                  {/* Audio Waveform Visualizer */}
                  <div className="d-flex align-items-center justify-content-between p-3 rounded-3 mb-3" style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(124, 58, 237, 0.3)' }}>
                    <div className="d-flex align-items-center gap-2">
                      <FaMicrophone className="text-info fs-5" />
                      <span className="extra-small fw-bold text-light">Listening Candidate Response...</span>
                    </div>
                    <div className="d-flex align-items-center gap-1" style={{ height: '24px' }}>
                      <div className="waveform-bar" style={{ animationDelay: '0.1s' }}></div>
                      <div className="waveform-bar" style={{ animationDelay: '0.3s' }}></div>
                      <div className="waveform-bar" style={{ animationDelay: '0.2s' }}></div>
                      <div className="waveform-bar" style={{ animationDelay: '0.4s' }}></div>
                      <div className="waveform-bar" style={{ animationDelay: '0.1s' }}></div>
                    </div>
                  </div>

                  {/* Floating Micro Metrics */}
                  <div className="row g-2">
                    <div className="col-6">
                      <div className="p-2 rounded-2 bg-success bg-opacity-10 border border-success border-opacity-25 text-center">
                        <span className="extra-small d-block text-success fw-bold">Live Technical Score</span>
                        <span className="fw-extrabold text-white fs-6">92% Excellent</span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="p-2 rounded-2 bg-primary bg-opacity-10 border border-primary border-opacity-25 text-center">
                        <span className="extra-small d-block text-info fw-bold">Speech Clarity</span>
                        <span className="fw-extrabold text-white fs-6">Strong Answer ✓</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Badge 1: Resume Analysis */}
                <div
                  className="glass-card p-3 position-absolute shadow-lg d-flex align-items-center gap-3 text-white"
                  style={{ top: '-20px', right: '-15px', backdropFilter: 'blur(20px)', width: '200px' }}
                >
                  <div className="bg-info bg-opacity-25 text-info p-2 rounded-circle">
                    <TbScan size={22} />
                  </div>
                  <div>
                    <span className="extra-small text-muted d-block">Resume Analysis</span>
                    <strong className="small text-info">92% Match Score</strong>
                  </div>
                </div>

                {/* Floating Badge 2: AI Mock Session */}
                <div
                  className="glass-card p-3 position-absolute shadow-lg d-flex align-items-center gap-3 text-white"
                  style={{ bottom: '-20px', left: '-20px', backdropFilter: 'blur(20px)', width: '210px' }}
                >
                  <div className="bg-purple-500 bg-opacity-25 text-primary p-2 rounded-circle">
                    <FaRobot size={22} />
                  </div>
                  <div>
                    <span className="extra-small text-muted d-block">AI Mock Interview</span>
                    <strong className="small text-white">Feedback Ready ✓</strong>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 5 FEATURE CARDS ROW */}
      <section className="py-5" id="features">
        <div className="container py-lg-3">
          <div className="text-center mb-5">
            <span className="badge glow-pill px-3 py-2 rounded-pill small fw-bold mb-2">POWERFUL CAPABILITIES</span>
            <h2 className="fw-extrabold text-white display-5">Next-Gen Interview Intelligence</h2>
            <p className="text-white-50 max-w-xl mx-auto small">
              Engineered with advanced language model evaluation, voice capture, and ATS resume matching.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-lg-4 col-md-6">
              <div className="glass-card p-4 h-100">
                <div className="bg-primary bg-opacity-25 border border-primary text-primary p-3 rounded-3 d-inline-flex mb-3">
                  <FaRobot size={26} />
                </div>
                <h5 className="fw-bold text-white mb-2">AI Mock Interview</h5>
                <p className="text-white-50 small mb-0">
                  Interactive conversational audio and text interview simulations with dynamic follow-ups customized to your domain.
                </p>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="glass-card p-4 h-100">
                <div className="bg-info bg-opacity-25 border border-info text-info p-3 rounded-3 d-inline-flex mb-3">
                  <FaSlidersH size={26} />
                </div>
                <h5 className="fw-bold text-white mb-2">Role-Based Questions</h5>
                <p className="text-white-50 small mb-0">
                  Over 90+ predefined job hierarchies spanning Frontend, Backend, Full Stack, HR, Sales, Marketing, and Management.
                </p>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="glass-card p-4 h-100">
                <div className="bg-purple bg-opacity-25 border border-purple text-info p-3 rounded-3 d-inline-flex mb-3" style={{ color: '#a855f7' }}>
                  <TbScan size={26} />
                </div>
                <h5 className="fw-bold text-white mb-2">Resume Intelligence</h5>
                <p className="text-white-50 small mb-0">
                  Automated resume parsing extracts your projects, skills, and experience to generate personalized interview questions.
                </p>
              </div>
            </div>

            <div className="col-lg-6 col-md-6">
              <div className="glass-card p-4 h-100">
                <div className="bg-danger bg-opacity-25 border border-danger text-danger p-3 rounded-3 d-inline-flex mb-3">
                  <FaVideo size={26} />
                </div>
                <h5 className="fw-bold text-white mb-2">Video & Voice Interview Mode</h5>
                <p className="text-white-50 small mb-0">
                  Live camera preview with real-time Speech-to-Text transcription. Evaluates speech flow, confidence, and articulation.
                </p>
              </div>
            </div>

            <div className="col-lg-6 col-md-12">
              <div className="glass-card p-4 h-100">
                <div className="bg-success bg-opacity-25 border border-success text-success p-3 rounded-3 d-inline-flex mb-3">
                  <FaChartLine size={26} />
                </div>
                <h5 className="fw-bold text-white mb-2">Smart AI Evaluation & Reports</h5>
                <p className="text-white-50 small mb-0">
                  Comprehensive performance breakdown with percentage scores, strengths, improvement areas, and ideal sample answers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CAREER ROLE EXPLORER */}
      <section className="py-5 bg-gradient-dark" id="roles" style={{ background: 'rgba(15, 23, 42, 0.7)' }}>
        <div className="container py-lg-3">
          <div className="text-center mb-5">
            <span className="badge glow-pill px-3 py-2 rounded-pill small fw-bold mb-2">CAREER HIERARCHY</span>
            <h2 className="fw-extrabold text-white display-5 mb-2">Explore Career Opportunities</h2>
            <p className="text-white-50 small">Choose your target role and start practicing today.</p>

            {/* TAB BUTTONS */}
            <div className="d-inline-flex p-1 rounded-pill glass-card border border-secondary border-opacity-50 mt-3">
              <button
                className={`btn rounded-pill px-4 py-2 fw-bold small transition-all ${activeTab === 'Technical' ? 'btn-glow-primary' : 'text-white-50 border-0'}`}
                onClick={() => setActiveTab('Technical')}
              >
                <FaLaptopCode className="me-2" /> Technical Roles (44+)
              </button>
              <button
                className={`btn rounded-pill px-4 py-2 fw-bold small transition-all ${activeTab === 'Non-Technical' ? 'btn-glow-primary' : 'text-white-50 border-0'}`}
                onClick={() => setActiveTab('Non-Technical')}
              >
                <FaUserTie className="me-2" /> Non-Technical Roles (50+)
              </button>
            </div>
          </div>

          <div className="row g-3">
            {(activeTab === 'Technical' ? sampleTechRoles : sampleNonTechRoles).map((role, idx) => (
              <div key={idx} className="col-lg-3 col-md-4 col-sm-6">
                <div
                  className="glass-card p-3 d-flex align-items-center justify-content-between cursor-pointer"
                  onClick={handleStartPracticing}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div className="p-2 rounded-circle bg-primary bg-opacity-10 text-primary">
                      {activeTab === 'Technical' ? <FaLaptopCode size={16} /> : <FaUserTie size={16} />}
                    </div>
                    <span className="fw-bold text-white small">{role}</span>
                  </div>
                  <FaArrowRight size={12} className="text-primary" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-5" id="how-it-works">
        <div className="container py-lg-3">
          <div className="text-center mb-5">
            <span className="badge glow-pill px-3 py-2 rounded-pill small fw-bold mb-2">SIMPLE STEP-BY-STEP PROCESS</span>
            <h2 className="fw-extrabold text-white display-5">How It Works</h2>
            <p className="text-white-50 small">Master your interview preparation in 4 seamless steps.</p>
          </div>

          <div className="row g-4">
            <div className="col-lg-3 col-md-6">
              <div className="glass-card p-4 text-center h-100 position-relative">
                <div className="display-4 fw-extrabold text-gradient-purple-blue mb-3">01</div>
                <h5 className="fw-bold text-white mb-2">Choose Your Role</h5>
                <p className="text-white-50 small mb-0">Select from 90+ predefined technical or non-technical job profiles.</p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="glass-card p-4 text-center h-100 position-relative">
                <div className="display-4 fw-extrabold text-gradient-purple-blue mb-3">02</div>
                <h5 className="fw-bold text-white mb-2">Take AI Interview</h5>
                <p className="text-white-50 small mb-0">Practice via Text or Speech-to-Text Video mode with dynamic AI questions.</p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="glass-card p-4 text-center h-100 position-relative">
                <div className="display-4 fw-extrabold text-gradient-purple-blue mb-3">03</div>
                <h5 className="fw-bold text-white mb-2">Get Instant Feedback</h5>
                <p className="text-white-50 small mb-0">Receive instant AI scoring on technical knowledge, confidence, and structure.</p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="glass-card p-4 text-center h-100 position-relative">
                <div className="display-4 fw-extrabold text-gradient-purple-blue mb-3">04</div>
                <h5 className="fw-bold text-white mb-2">Improve & Get Hired</h5>
                <p className="text-white-50 small mb-0">Refine your responses, boost your ATS match score, and ace real interviews.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI COACH & INTELLIGENCE SECTION */}
      <section className="py-5" id="analytics" style={{ background: 'rgba(15, 23, 42, 0.5)' }}>
        <div className="container py-lg-3">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="badge glow-pill px-3 py-2 rounded-pill small fw-bold mb-3">PERSONALIZED AI COACHING</span>
              <h2 className="display-5 fw-extrabold text-white mb-4">Your AI Interview Coach</h2>
              <p className="text-white-50 mb-4 fs-6">
                Every interview becomes personalized to your role, resume, skills, and target job description. Get objective Feedback & Evaluation reports.
              </p>

              <div className="d-flex flex-column gap-3 mb-4">
                <div className="d-flex align-items-start gap-3">
                  <div className="p-2 rounded-circle bg-success bg-opacity-25 text-success">
                    <FaCheck size={14} />
                  </div>
                  <div>
                    <strong className="text-white d-block small">Role-Matched Scenario Questions</strong>
                    <span className="extra-small text-white-50">Adapts difficulty based on Junior, Mid, or Senior candidate level.</span>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-3">
                  <div className="p-2 rounded-circle bg-info bg-opacity-25 text-info">
                    <FaCheck size={14} />
                  </div>
                  <div>
                    <strong className="text-white d-block small">Dynamic Follow-Up Probing</strong>
                    <span className="extra-small text-white-50">AI asks follow-ups when explanations need technical depth or structure.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="glass-card p-4 text-white">
                <h5 className="fw-bold text-white mb-4 d-flex align-items-center gap-2">
                  <FaChartLine className="text-primary" /> Live Performance Breakdown
                </h5>

                <div className="mb-3">
                  <div className="d-flex justify-content-between small mb-1">
                    <span>Technical Knowledge</span>
                    <span className="fw-bold text-info">91%</span>
                  </div>
                  <div className="progress" style={{ height: '6px' }}>
                    <div className="progress-bar bg-info" style={{ width: '91%' }}></div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between small mb-1">
                    <span>Communication & Clarity</span>
                    <span className="fw-bold text-primary">84%</span>
                  </div>
                  <div className="progress" style={{ height: '6px' }}>
                    <div className="progress-bar bg-primary" style={{ width: '84%' }}></div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between small mb-1">
                    <span>Confidence & Speech Flow</span>
                    <span className="fw-bold text-success">88%</span>
                  </div>
                  <div className="progress" style={{ height: '6px' }}>
                    <div className="progress-bar bg-success" style={{ width: '88%' }}></div>
                  </div>
                </div>

                <div className="p-3 rounded-3 bg-primary bg-opacity-10 border border-primary border-opacity-25 mt-4">
                  <span className="extra-small text-info fw-bold d-block mb-1">AI RECOMMENDATION</span>
                  <p className="extra-small text-white-50 mb-0 italic">
                    "Your technical explanation of React state management is strong. Focus on structuring behavioral STAR method answers more concisely."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RESUME + JOB DESCRIPTION BLUEPRINT SECTION */}
      <section className="py-5">
        <div className="container py-lg-3">
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="glass-card p-4 p-lg-5 h-100">
                <div className="bg-purple bg-opacity-25 text-info p-3 rounded-3 d-inline-flex mb-4" style={{ color: '#a855f7' }}>
                  <FaFileAlt size={30} />
                </div>
                <h3 className="fw-bold text-white mb-3">Your Resume Becomes Your Interview Blueprint</h3>
                <p className="text-white-50 small mb-4">
                  Upload your resume to let our AI parse your experience, projects, and tech stack to generate relevant interview questions.
                </p>

                <ul className="list-unstyled d-flex flex-column gap-2 small text-white-50">
                  <li className="d-flex align-items-center gap-2"><FaCheckCircle className="text-success" /> Skills & Keywords Extracted</li>
                  <li className="d-flex align-items-center gap-2"><FaCheckCircle className="text-success" /> Experience Depth Analyzed</li>
                  <li className="d-flex align-items-center gap-2"><FaCheckCircle className="text-success" /> Key Projects & Technologies Identified</li>
                  <li className="d-flex align-items-center gap-2"><FaCheckCircle className="text-success" /> Tailored Behavioral & Technical Questions</li>
                </ul>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="glass-card p-4 p-lg-5 h-100">
                <div className="bg-info bg-opacity-25 text-info p-3 rounded-3 d-inline-flex mb-4">
                  <TbScan size={30} />
                </div>
                <h3 className="fw-bold text-white mb-3">Practice Against The Actual Job Description</h3>
                <p className="text-white-50 small mb-4">
                  Match your profile against target Job Descriptions to calculate your ATS match score and optimize your answers before the actual interview.
                </p>

                <div className="p-3 rounded-3 bg-dark bg-opacity-50 border border-secondary border-opacity-25">
                  <div className="d-flex align-items-center justify-content-between small text-white mb-2">
                    <span className="fw-bold">ATS Match Engine</span>
                    <span className="badge bg-success">92% Match Score</span>
                  </div>
                  <div className="progress" style={{ height: '6px' }}>
                    <div className="progress-bar bg-success" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL HIGH-IMPACT CTA */}
      <section className="py-5 my-4 position-relative">
        <div className="container">
          <div className="glass-card p-5 text-center position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.25) 0%, rgba(37, 99, 235, 0.25) 100%)' }}>
            <div className="position-relative" style={{ zIndex: 2 }}>
              <span className="badge glow-pill px-3 py-2 rounded-pill small fw-bold mb-3">GET STARTED TODAY</span>
              <h2 className="display-4 fw-extrabold text-white mb-3">Ready To Ace Your Next Interview?</h2>
              <p className="text-white-50 fs-5 mb-4 max-w-xl mx-auto">
                Practice with AI. Improve with data. Interview with confidence.
              </p>
              <button
                onClick={handleStartPracticing}
                className="btn btn-glow-primary btn-lg rounded-pill px-5 py-3 fw-bold d-inline-flex align-items-center gap-2 fs-6"
              >
                Get Started Now <FaArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* POLISHED SAAS FOOTER */}
      <footer className="mt-auto border-top border-secondary border-opacity-25 py-5" style={{ background: '#020410' }}>
        <div className="container">
          <div className="row g-4 mb-4">
            <div className="col-6 col-lg-3">
              <h6 className="fw-bold text-white small mb-3">Product</h6>
              <ul className="list-unstyled extra-small text-white-50 d-flex flex-column gap-2 mb-0">
                <li><a href="#features" className="text-white-50 text-decoration-none">AI Mock Interview</a></li>
                <li><a href="#roles" className="text-white-50 text-decoration-none">Role Explorer</a></li>
                <li><a href="#how-it-works" className="text-white-50 text-decoration-none">How It Works</a></li>
              </ul>
            </div>

            <div className="col-6 col-lg-3">
              <h6 className="fw-bold text-white small mb-3">For Students</h6>
              <ul className="list-unstyled extra-small text-white-50 d-flex flex-column gap-2 mb-0">
                <li><Link to="/login" className="text-white-50 text-decoration-none">Practice Setup</Link></li>
                <li><Link to="/login" className="text-white-50 text-decoration-none">ATS Scanner</Link></li>
                <li><Link to="/login" className="text-white-50 text-decoration-none">Interview History</Link></li>
              </ul>
            </div>

            <div className="col-6 col-lg-3">
              <h6 className="fw-bold text-white small mb-3">For Companies</h6>
              <ul className="list-unstyled extra-small text-white-50 d-flex flex-column gap-2 mb-0">
                <li><Link to="/login?role=HR" className="text-white-50 text-decoration-none">HR Recruitment</Link></li>
                <li><Link to="/login?role=HR" className="text-white-50 text-decoration-none">Create Job Postings</Link></li>
                <li><Link to="/login?role=HR" className="text-white-50 text-decoration-none">Candidate Invites</Link></li>
              </ul>
            </div>

            <div className="col-6 col-lg-3">
              <h6 className="fw-bold text-white small mb-3">Legal & Support</h6>
              <ul className="list-unstyled extra-small text-white-50 d-flex flex-column gap-2 mb-0">
                <li><a href="#top" className="text-white-50 text-decoration-none">Privacy Policy</a></li>
                <li><a href="#top" className="text-white-50 text-decoration-none">Terms & Conditions</a></li>
                <li><a href="#top" className="text-white-50 text-decoration-none">Support Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-top border-secondary border-opacity-25 text-center text-white-50 extra-small">
            <p className="mb-0">
              © {new Date().getFullYear()} <span className="fw-bold text-white">HireSmart AI</span>. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
