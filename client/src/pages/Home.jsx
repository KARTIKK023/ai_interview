import React, { useContext, useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import LandingFooter from "./LandingFooter";
import LandingEnquirySection from "./LandingEnquirySection";
const MotionLink = motion(Link);

import {
  FaRobot,
  FaArrowRight,
  FaPlay,
  FaMicrophone,
  FaCheckCircle,
  FaLaptopCode,
  FaUserTie,
  FaFileAlt,
  FaChartLine,
  FaBrain,
  FaVideo,
  FaUsers,
  FaLightbulb,
  FaBullseye,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFacebookF,
  FaLinkedinIn,
  FaInstagram,
  FaTimes,
  FaUser,
  FaChevronDown,
  FaSignOutAlt,
} from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";

import { TbScan } from "react-icons/tb";

/* =========================================================
   DATA
========================================================= */


const socialStyle = {
  width: "34px",
  height: "34px",
  border: "1px solid #1e3a5f",
  borderRadius: "7px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#3b82f6",
  textDecoration: "none",
};





const questions = [
  {
    category: "Behavioral",
    text: "Tell me about yourself and your technical background.",
  },
  {
    category: "React & Frontend",
    text: "Explain how React's Virtual DOM improves performance.",
  },
  {
    category: "Problem Solving",
    text: "How would you optimize a slow web application?",
  },
  {
    category: "Backend",
    text: "Explain REST API architecture with an example.",
  },
];

const technicalRoles = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
  "DevOps Engineer",
  "React Developer",
  "AI Engineer",
  "Python Developer",
];

const nonTechnicalRoles = [
  "HR Executive",
  "Sales Executive",
  "Marketing Executive",
  "Business Analyst",
  "Financial Analyst",
  "Customer Support",
  "Operations Manager",
  "Recruiter",
];

const roleDetails = {
  "Frontend Developer": {
    description:
      "Build responsive and interactive web applications using modern frontend technologies.",
    skills: "HTML, CSS, JavaScript, React, Tailwind CSS, Git",
    practice: [
      "Frontend interview questions",
      "JavaScript concepts",
      "React & API questions",
      "Project-based questions",
    ],
    focus: "Technical • Projects • Problem Solving",
  },
  "Backend Developer": {
    description:
      "Design reliable server-side applications, APIs, and data services that power modern products.",
    skills: "Node.js, Express, REST APIs, Databases, Authentication, Git",
    practice: [
      "Backend fundamentals",
      "API design and security",
      "Database and scalability questions",
      "System design scenarios",
    ],
    focus: "Technical • APIs • System Design",
  },
  "Full Stack Developer": {
    description:
      "Create complete products across the frontend, backend, database, and deployment layers.",
    skills: "JavaScript, React, Node.js, SQL, REST APIs, Deployment",
    practice: [
      "End-to-end application questions",
      "Frontend and backend concepts",
      "Architecture trade-offs",
      "Full stack project discussions",
    ],
    focus: "Technical • Architecture • Projects",
  },
  "Data Analyst": {
    description:
      "Turn business data into clear insights, useful reports, and confident recommendations.",
    skills: "SQL, Excel, Python, Statistics, Power BI, Data Visualization",
    practice: [
      "SQL and data-cleaning questions",
      "Analytics case studies",
      "Statistics and visualization concepts",
      "Portfolio and project questions",
    ],
    focus: "Analytics • Business Cases • Communication",
  },
  "DevOps Engineer": {
    description:
      "Build reliable delivery pipelines and cloud infrastructure for fast, resilient software teams.",
    skills: "Linux, Docker, Kubernetes, CI/CD, Cloud, Monitoring",
    practice: [
      "DevOps and cloud fundamentals",
      "CI/CD troubleshooting",
      "Infrastructure and reliability scenarios",
      "Incident-response questions",
    ],
    focus: "Cloud • Reliability • Troubleshooting",
  },
  "React Developer": {
    description:
      "Craft maintainable, high-performance user experiences with React and its modern ecosystem.",
    skills: "React, JavaScript, Hooks, State Management, APIs, Testing",
    practice: [
      "React component questions",
      "Hooks and state management",
      "Performance and testing topics",
      "Frontend project walkthroughs",
    ],
    focus: "React • Performance • Projects",
  },
  "AI Engineer": {
    description:
      "Build intelligent applications by combining machine learning models, data, and production systems.",
    skills: "Python, Machine Learning, NLP, LLMs, APIs, MLOps",
    practice: [
      "Machine learning fundamentals",
      "LLM and AI application design",
      "Model evaluation and deployment",
      "AI project discussions",
    ],
    focus: "Machine Learning • AI Systems • Projects",
  },
  "Python Developer": {
    description:
      "Develop clear, scalable software and automation with Python across web, data, and services.",
    skills: "Python, OOP, Django, FastAPI, SQL, Testing",
    practice: [
      "Python language concepts",
      "Object-oriented programming",
      "Web framework and API questions",
      "Coding and debugging challenges",
    ],
    focus: "Python • Coding • Problem Solving",
  },
};

const features = [
{
  icon: <FaRobot style={{ color: "#ffffff" }} />,
  title: "AI Mock Interview",
  text: "Practice realistic interviews with dynamic AI-generated questions and follow-ups.",
  color: "#ffffff",
  textColor: "#ffffff",
},
  {
    icon: <TbScan />,
    title: "Resume Intelligence",
    text: "AI understands your resume, projects, skills and experience before the interview.",
    color: "#06b6d4",
  },
  {
    icon: <FaBullseye />,
    title: "Role-Based Questions",
    text: "Get questions specifically matched to your target job role and experience.",
    color: "#8b5cf6",
  },
  {
    icon: <FaVideo />,
    title: "Voice & Video",
    text: "Practice through text, voice and video-style interview experiences.",
    color: "#ec4899",
  },
  {
    icon: <FaChartLine />,
    title: "Smart Evaluation",
    text: "Analyze technical knowledge, communication, confidence and relevance.",
    color: "#f59e0b",
  },
  {
    icon: <FaBrain />,
    title: "AI Interview Coach",
    text: "Receive personalized recommendations after every interview session.",
    color: "#10b981",
  },
];

/* =========================================================
   ANIMATION VARIANTS
========================================================= */

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 50,
    filter: "blur(10px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

/* =========================================================
   HERO WORD
========================================================= */

const HeroWord = ({ children, delay = 0 }) => (
  <motion.span
    initial={{
      opacity: 0,
      y: 70,
      filter: "blur(12px)",
    }}
    animate={{
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
    }}
    transition={{
      duration: 0.9,
      delay,
      ease: [0.16, 1, 0.3, 1],
    }}
    style={{
      display: "inline-block",
      marginRight: "14px",
    }}
  >
    {children}
  </motion.span>
);

const hiringTexts = [
  "Get Hired Faster.",
  "Ace Every Interview.",
  "Build Real Confidence.",
  "Land Your Dream Role.",
  
];
/* =========================================================
   HOME
========================================================= */

const Home = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [roleType, setRoleType] = useState("Technical");
  const [selectedRole, setSelectedRole] = useState(null);
  const [hiringTextIndex, setHiringTextIndex] = useState(0);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const [demoStatus, setDemoStatus] = useState(0);
  const [demoTime, setDemoTime] = useState(12);
  const [speechIndex, setSpeechIndex] = useState(0);
  const [activeNav, setActiveNav] = useState("Home");

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const smoothX = useSpring(mouseX, {
    stiffness: 80,
    damping: 20,
  });

  const smoothY = useSpring(mouseY, {
    stiffness: 80,
    damping: 20,
  });

  const isStudent =
    user && (user.role || "").toLowerCase() === "student";


    // Demo status animation
useEffect(() => {
  const interval = setInterval(() => {
    setDemoStatus((prev) => (prev + 1) % 4);
  }, 2200);

  return () => clearInterval(interval);
}, []);

// Demo timer
useEffect(() => {
  const interval = setInterval(() => {
    setDemoTime((prev) => (prev >= 59 ? 0 : prev + 1));
  }, 1000);

  return () => clearInterval(interval);
}, []);

// Rotate demo speech
useEffect(() => {
  const interval = setInterval(() => {
    setSpeechIndex((prev) => (prev + 1) % 3);
  }, 4000);

  return () => clearInterval(interval);
}, []);
 

//AI Capabilities
const featureRoutes = {
  "AI Mock Interview": "/student/interview-preparation/ai-mock",
  "Resume Intelligence": "/student/ats-scanner",
  "Role-Based Questions": "/student/question-bank-reader",
  "Voice & Video": "/student/interview-preparation/ai-mock",
  "Smart Evaluation": "/student/interviews",
  "AI Interview Coach": "/student/ask",
};

  /* =======================================================
     QUESTION ROTATION
  ======================================================= */

  useEffect(() => {
    const interval = setInterval(() => {
      setHiringTextIndex(
        (prev) => (prev + 1) % hiringTexts.length
      );
    }, 2500);

    return () => clearInterval(interval);
  }, []);


  // Auto-change interview questions
useEffect(() => {
  const interval = setInterval(() => {
    setQuestionIndex((prev) => (prev + 1) % questions.length);
  }, 5000); // change every 5 seconds

  return () => clearInterval(interval);
}, []);

  /* =======================================================
     BODY SCROLL LOCK WHEN MODAL IS OPEN
  ======================================================= */

  useEffect(() => {
    if (selectedRole) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedRole]);

  /* =======================================================
     MOUSE PARALLAX
  ======================================================= */

  const handleMouseMove = (e) => {
    const x =
      (e.clientX / window.innerWidth - 0.5) * 25;

    const y =
      (e.clientY / window.innerHeight - 0.5) * 25;

    mouseX.set(x);
    mouseY.set(y);
  };

  /* =======================================================
     START BUTTON
  ======================================================= */

  const handleStart = () => {
    if (isStudent) {
      navigate("/student/interview-preparation/ai-mock");
    } else {
      navigate("/login");
    }
  };

  const currentQuestion = questions[questionIndex];
  const selectedRoleDetails = selectedRole
    ? roleDetails[selectedRole] || {
        description:
          "Build the skills and confidence needed to perform at your best in this career path.",
        skills: "Communication, Problem Solving, Role Fundamentals, Collaboration",
        practice: [
          "Role-specific interview questions",
          "Scenario-based practice",
          "Communication and confidence",
          "Personalized interview feedback",
        ],
        focus: "Role Knowledge • Communication • Scenarios",
      }
    : null;

  return (
    <div
      onMouseMove={handleMouseMove}
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "#fff",
        overflow: "hidden",
      }}
    >

      {/* ===================================================
          PREMIUM BACKGROUND
      =================================================== */}

      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          overflow: "hidden",
        }}
      >

        {/* Grid */}

        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.18,
            backgroundImage: `
              linear-gradient(rgba(59,130,246,.12) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59,130,246,.12) 1px, transparent 1px)
            `,
            backgroundSize: "55px 55px",
            maskImage:
              "linear-gradient(to bottom, black, transparent 85%)",
          }}
        />

        {/* Blue Orb */}

        <motion.div
          animate={{
            x: [-50, 60, -50],
            y: [20, -40, 20],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            width: "650px",
            height: "650px",
            left: "-300px",
            top: "100px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(37,99,235,.25), transparent 68%)",
            filter: "blur(25px)",
          }}
        />

        {/* Purple Orb */}

        <motion.div
          animate={{
            x: [50, -60, 50],
            y: [-30, 50, -30],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            right: "-280px",
            top: "200px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(124,58,237,.22), transparent 68%)",
            filter: "blur(25px)",
          }}
        />

        {/* Cyan Glow */}

        <motion.div
          animate={{
            opacity: [0.08, 0.18, 0.08],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
          }}
          style={{
            position: "absolute",
            width: "450px",
            height: "450px",
            left: "40%",
            top: "30%",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(6,182,212,.12), transparent 70%)",
            filter: "blur(40px)",
          }}
        />

      </div>

      {/* ===================================================
          NAVBAR
      =================================================== */}

      <div
        className="container"
        style={{
          position: "relative",
          zIndex: 20,
          paddingTop: "20px",
        }}
      >

        <motion.nav
          initial={{
            opacity: 0,
            y: -30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.8,
          }}
          style={{
            height: "68px",
            borderRadius: "40px",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            background: "rgba(2,6,23,.72)",
            backdropFilter: "blur(25px)",
            border:
              "1px solid rgba(96,165,250,.22)",
            boxShadow:
              "0 15px 50px rgba(0,0,0,.4)",
          }}
        >

          {/* Logo */}

          <Link
            to="/"
            className="text-decoration-none"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#fff",
              fontSize: "21px",
              fontWeight: 800,
              minWidth: "210px",
            }}
          >

            <motion.div
              whileHover={{
                scale: 1.15,
                rotate: 8,
              }}
              animate={{
                boxShadow: [
                  "0 0 15px rgba(6,182,212,.25)",
                  "0 0 35px rgba(6,182,212,.55)",
                  "0 0 15px rgba(6,182,212,.25)",
                ],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
              }}
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "linear-gradient(135deg,#06b6d4,#2563eb)",
              }}
            >
              <FaRobot />
            </motion.div>

            <span>
              <span
                style={{
                  background:
                    "linear-gradient(90deg,#a855f7,#06b6d4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                HireSmart Ai
              </span>{" "}
           
            </span>

          </Link>

          {/* Navigation */}

          <div
            className="d-none d-lg-flex"
            style={{
              flex: 1,
              justifyContent: "center",
              gap: "32px",
              color: "#ffffff"
            }}
          >
         {[
  ["Home", "#top"],
  ["Features", "#features"],
  ["How It Works", "#how"],
  ["For Students", "#roles"],
  ["AI Coach", "#coach"],
  ["Enquiry", "/enquiry"],
].map(([text, href]) => (
  <a
    key={text}
    href={href}
    onClick={() => setActiveNav(text)}
    style={{
      color:
        activeNav === text
          ? "#60a5fa"
          : "#ffffff",

      textDecoration: "none",
      fontSize: "14px",
      fontWeight:
        activeNav === text
          ? 700
          : 600,

      transition: "color 0.25s ease",
      cursor: "pointer",
    }}
  >
    {text}
  </a>
))}

          </div>

          {/* Right */}

          <div
            className="d-flex align-items-center gap-3"
          >
            {user ? (
              <div
                ref={dropdownRef}
                style={{
                  position: "relative",
                }}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowProfileDropdown((prev) => !prev)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    background: "rgba(15,23,42,.75)",
                    border: "1px solid rgba(96,165,250,.20)",
                    borderRadius: "30px",
                    padding: "6px 14px 6px 8px",
                    color: "#ffffff",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 4px 20px rgba(0,0,0,.3)",
                    outline: "none",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#2563eb,#7c3aed)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      color: "#ffffff",
                      boxShadow: "0 2px 8px rgba(37,99,235,.4)",
                      flexShrink: 0,
                    }}
                  >
                    {user?.profilePhoto || user?.profile?.profilePhoto ? (
                      <img
                        src={user.profilePhoto || user.profile.profilePhoto}
                        alt={user?.fullName || user?.name || "User Profile"}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <FaUser size={13} />
                    )}
                  </div>

                  <span
                    style={{
                      maxWidth: "140px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {user?.fullName || user?.name || "Student"}
                  </span>

                  <FaChevronDown
                    size={10}
                    style={{
                      color: "#94a3b8",
                      transform: showProfileDropdown ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                      marginLeft: "2px",
                    }}
                  />
                </motion.button>

                <AnimatePresence>
                  {showProfileDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      style={{
                        position: "absolute",
                        top: "calc(100% + 10px)",
                        right: 0,
                        width: "240px",
                        background: "#0b1224",
                        border: "1px solid rgba(96,165,250,.20)",
                        borderRadius: "16px",
                        padding: "16px",
                        boxShadow:
                          "0 20px 40px rgba(0,0,0,.6), 0 0 25px rgba(59,130,246,.15)",
                        zIndex: 1000,
                      }}
                    >
                      {/* USER INFO */}
                      <div style={{ paddingBottom: "12px", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
                        <div
                          style={{
                            color: "#ffffff",
                            fontSize: "14px",
                            fontWeight: 700,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {user?.fullName || user?.name || "Student"}
                        </div>
                        {user?.email && (
                          <div
                            style={{
                              color: "#94a3b8",
                              fontSize: "12px",
                              marginTop: "3px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {user.email}
                          </div>
                        )}
                      </div>

                      {/* DROPDOWN MENU ITEMS */}
                      <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
                        <motion.div
                          whileHover={{ background: "rgba(96,165,250,.12)", x: 2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setShowProfileDropdown(false);
                            navigate("/student/profile");
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "9px 12px",
                            borderRadius: "10px",
                            color: "#ffffff",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "background 0.2s ease",
                          }}
                        >
                          <FaUser size={13} style={{ color: "#60a5fa" }} />
                          <span>My Profile</span>
                        </motion.div>

                        <motion.div
                          whileHover={{ background: "rgba(248,113,113,.12)", x: 2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={async () => {
                            setShowProfileDropdown(false);
                            if (logout) {
                              await logout();
                            }
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "9px 12px",
                            borderRadius: "10px",
                            color: "#f87171",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "background 0.2s ease",
                          }}
                        >
                          <FaSignOutAlt size={13} style={{ color: "#f87171" }} />
                          <span>Logout</span>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  style={{
                    color: "#ffffff",
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: "14px",
                  }}
                >
                  Login
                </Link>

                <motion.button
                  whileHover={{
                    scale: 1.05,
                  }}
                  whileTap={{
                    scale: 0.96,
                  }}
                  onClick={handleStart}
                  style={{
                    border: "none",
                    borderRadius: "30px",
                    padding: "12px 22px",
                    color: "#fff",
                    fontWeight: 700,
                    background:
                      "linear-gradient(90deg,#7c3aed,#2563eb)",
                    boxShadow:
                      "0 0 30px rgba(99,102,241,.4)",
                  }}
                >
                  Get Started <FaArrowRight size={11} />
                </motion.button>
              </>
            )}

          </div>

        </motion.nav>

      </div>

      {/* ===================================================
          HERO
      =================================================== */}

      <section
        id="top"
        style={{
          position: "relative",
          zIndex: 2,
          padding:
            "110px 0 100px",
        }}
      >

        <div className="container">

          <div className="row align-items-center g-5">

            {/* HERO CONTENT */}

            <div className="col-lg-6">

              <motion.div
                variants={stagger}
                initial="hidden"
                animate="visible"
              >

                <motion.div
                  variants={fadeUp}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "9px 16px",
                    borderRadius: "30px",
                    color: "#c084fc",
                    border:
                      "1px solid rgba(168,85,247,.45)",
                    background:
                      "rgba(124,58,237,.08)",
                    fontSize: "12px",
                    fontWeight: 700,
                    marginBottom: "25px",
                  }}
                >
                  ✦ AI-POWERED INTERVIEW PLATFORM
                </motion.div>

                <h1
                  style={{
                    fontSize:
                      "clamp(38px,4vw,65px)",
                    lineHeight: 1.03,
                    letterSpacing: "-3px",
                    fontWeight: 800,
                    marginBottom: "25px",
                  }}
                >

                  <HeroWord delay={0.1}>
                    Prepare  Smarter.
                  </HeroWord>

                  <br />

                 <motion.span
  style={{
    background:
      "linear-gradient(90deg, #a855f7, #7c5cff, #287cff, #00c8ff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    display: "inline-block",
    overflow: "hidden",
    whiteSpace: "nowrap",
  }}
  animate={{
    width: ["0%", "100%", "100%", "0%"],
  }}
  transition={{
    duration: 4,
    times: [0, 0.45, 0.75, 1],
    repeat: Infinity,
    repeatDelay: 0.5,
    ease: "easeInOut",
  }}
>
  Interview Better.
</motion.span>

      <br />

  <AnimatePresence mode="wait">
  <motion.span
    key={hiringTexts[hiringTextIndex]}
    initial={{
      opacity: 0,
      y: 30,
      filter: "blur(8px)",
    }}
    animate={{
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
    }}
    exit={{
      opacity: 0,
      y: -30,
      filter: "blur(8px)",
    }}
    transition={{
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    }}
    style={{
      display: "inline-block",
      color: "#ffffff",
      whiteSpace: "nowrap",
      fontSize: "clamp(38px, 4vw, 60px)",
    }}
  >
    {hiringTexts[hiringTextIndex]}
  </motion.span>
</AnimatePresence>
                </h1>

                <motion.p
                  variants={fadeUp}
                  style={{
                    color: "#ffffff",
                    fontSize: "18px",
                    lineHeight: 1.7,
                    maxWidth: "620px",
                    marginBottom: "30px",
                  }}
                >
                  Practice realistic interviews with AI that
                  understands your resume, skills, target role
                  and job description.
                </motion.p>

                {/* BUTTONS */}

                <motion.div
                  variants={fadeUp}
                  className="d-flex flex-wrap gap-3"
                >

                  <motion.button
                    whileHover={{
                      scale: 1.05,
                      boxShadow:
                        "0 0 45px rgba(99,102,241,.65)",
                    }}
                    whileTap={{
                      scale: 0.96,
                    }}
                    onClick={handleStart}
                    style={{
                      border: "none",
                      borderRadius: "35px",
                      padding: "17px 28px",
                      color: "#fff",
                      fontSize: "16px",
                      fontWeight: 700,
                      background:
                        "linear-gradient(90deg,#7c3aed,#2563eb)",
                      boxShadow:
                        "0 10px 35px rgba(99,102,241,.35)",
                    }}
                  >
                    Start Practicing Free{" "}
                    <FaArrowRight size={13} />
                  </motion.button>

                 <MotionLink
                  to="/student/interview-preparation/ai-mock"
                  whileHover={{
                    scale: 1.04,
                    background: "rgba(59,130,246,.12)",
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "35px",
                    padding: "17px 28px",
                    color: "#fff",
                    textDecoration: "none",
                    fontWeight: 700,
                    border: "1px solid rgba(96,165,250,.3)",
                    background: "rgba(15,23,42,.65)",
                  }}
                >
                  <FaPlay
                    size={11}
                    className="me-2"
                  />
                  Explore AI Interview
                </MotionLink>

                </motion.div>

                {/* TRUST */}

                <motion.div
                  variants={fadeUp}
                  className="d-flex flex-wrap gap-4 mt-4"
                  style={{
                    color: "#ffffff",
                    fontSize: "13px",
                  }}
                >

                  <span>
                    <FaCheckCircle
                      className="text-info me-2 "
                    />
                    Resume-Based
                  </span>

                  <span>
                    <FaCheckCircle
                      className="text-primary me-2"
                    />
                    AI-Powered
                  </span>

                  <span>
                    <FaCheckCircle
                      className="text-success me-2"
                    />
                    Instant Feedback
                  </span>

                </motion.div>

              </motion.div>

            </div>

        

       {/* =========================================================
    AI INTERVIEWER - INTERACTIVE DEMO CARD
========================================================= */}

  <div className="col-lg-6">
  <motion.div
    style={{
      x: smoothX,
      y: smoothY,
      position: "relative",
    }}
  >

    <motion.div
      initial={{
        opacity: 0,
        scale: 0.88,
        rotateY: 12,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        rotateY: 0,
      }}
      transition={{
        duration: 1.1,
        delay: 0.2,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{
        position: "relative",
        maxWidth: "620px",
        margin: "auto",
        perspective: "1150px",
      }}
    >

      {/* =====================================================
          AMBIENT GLOW
      ===================================================== */}

      <motion.div
        animate={{
          scale: [0.92, 1.08, 0.92],
          opacity: [0.18, 0.38, 0.18],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          position: "absolute",
          inset: "-50px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(37,99,235,.30), transparent 68%)",
          filter: "blur(35px)",
          pointerEvents: "none",
        }}
      />

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <motion.div
        animate={{
          y: [0, -6, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        whileHover={{
          y: -10,
        }}
        style={{
          position: "relative",
          zIndex: 2,
          padding: "22px",
          borderRadius: "24px",
          width: "100%",
          background:
            "linear-gradient(145deg, rgba(15,23,42,.98), rgba(3,7,18,.98))",
          border:
            "1px solid rgba(96,165,250,.32)",
          boxShadow:
            "0 35px 100px rgba(0,0,0,.55), 0 0 70px rgba(37,99,235,.12)",
          overflow: "visible",
        }}
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="d-flex justify-content-between align-items-center"
          style={{
            paddingBottom: "14px",
            marginBottom: "16px",
            borderBottom:
              "1px solid rgba(255,255,255,.08)",
          }}
        >

          <div className="d-flex align-items-center gap-3">

            {/* AI ICON */}
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 12px rgba(6,182,212,.25)",
                  "0 0 32px rgba(6,182,212,.65)",
                  "0 0 12px rgba(6,182,212,.25)",
                ],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
              }}
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "linear-gradient(135deg,#06b6d4,#2563eb)",
                color: "#fff",
              }}
            >
              <FaRobot size={21} />
            </motion.div>

            <div>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 750,
                  color: "#fff",
                  letterSpacing: "0.2px",
                }}
              >
                AI Interviewer
              </div>

              <motion.div
                animate={{
                  opacity: [0.55, 1, 0.55],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
                style={{
                  color: "#34d399",
                  fontSize: "10px",
                  fontWeight: 700,
                  marginTop: "2px",
                  letterSpacing: "0.5px",
                }}
              >
                ● LIVE SESSION
              </motion.div>
            </div>

          </div>

          {/* LIVE REC */}
          <div
            style={{
              color: "#f87171",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.5px",
            }}
          >
            <motion.span
              animate={{
                opacity: [1, 0.3, 1],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
            >
              ● REC
            </motion.span>
          </div>

        </div>

        {/* =================================================
            AI AVATAR AREA
        ================================================= */}

        <div
          style={{
            position: "relative",
            height: "155px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            borderRadius: "18px",
            background:
              "radial-gradient(circle at center, rgba(37,99,235,.16), rgba(2,6,23,.35) 55%, transparent 75%)",
          }}
        >

          {/* ROTATING OUTER RING */}
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              position: "absolute",
              width: "145px",
              height: "145px",
              borderRadius: "50%",
              border:
                "1px solid rgba(59,130,246,.5)",
              boxShadow:
                "0 0 30px rgba(37,99,235,.20)",
            }}
          />

          {/* SECOND RING */}
          <motion.div
            animate={{
              rotate: -360,
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              position: "absolute",
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              border:
                "1px dashed rgba(168,85,247,.65)",
            }}
          />

          {/* AI GLOW */}
          <motion.div
            animate={{
              scale: [0.9, 1.15, 0.9],
              opacity: [0.25, 0.5, 0.25],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              position: "absolute",
              width: "105px",
              height: "105px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(6,182,212,.30), transparent 70%)",
              filter: "blur(10px)",
            }}
          />

        
         {/* ROBOT */}
          <motion.div
            animate={{
              y: [0, -7, 0],
              scale: [1, 1.025, 1],
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              position: "relative",
              zIndex: 3,
              width: "72px",
              height: "72px",
              borderRadius: "22px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(145deg,#e0f2fe,#bfdbfe)",
              boxShadow: "0 0 30px rgba(6,182,212,.55)",
            }}
          >
            <FaRobot
              size={40}
              style={{
                color: "#06b6d4",
              }}
            />
          </motion.div>

          {/* LISTENING PILL */}
          <motion.div
            animate={{
              scale: [1, 1.04, 1],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
            }}
            style={{
              position: "absolute",
              zIndex: 4,
              bottom: "12px",
              left: "50%",
              transform: "translateX(-50%)",
              padding: "6px 14px",
              borderRadius: "30px",
              background:
                "rgba(2,6,23,.92)",
              border:
                "1px solid rgba(6,182,212,.45)",
              color: "#67e8f9",
              fontSize: "11px",
              fontWeight: 700,
              boxShadow:
                "0 0 25px rgba(6,182,212,.18)",
              whiteSpace: "nowrap",
            }}
          >
            <motion.span
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
            >
              🎙 I'm listening...
            </motion.span>
          </motion.div>

          {/* LEFT WAVE */}
          <div
            style={{
              position: "absolute",
              left: "20px",
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              alignItems: "center",
              gap: "3px",
            }}
          >
            {[14, 22, 30, 18, 26].map(
              (height, index) => (
                <motion.span
                  key={index}
                  animate={{
                    height: [
                      `${height * 0.45}px`,
                      `${height}px`,
                      `${height * 0.6}px`,
                      `${height}px`,
                    ],
                  }}
                  transition={{
                    duration: 0.7,
                    repeat: Infinity,
                    delay: index * 0.08,
                  }}
                  style={{
                    width: "2px",
                    borderRadius: "3px",
                    background:
                      "linear-gradient(#7c3aed,#06b6d4)",
                    boxShadow:
                      "0 0 8px rgba(6,182,212,.5)",
                  }}
                />
              )
            )}
          </div>

          {/* RIGHT WAVE */}
          <div
            style={{
              position: "absolute",
              right: "20px",
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              alignItems: "center",
              gap: "2px",
            }}
          >
            {[26, 18, 30, 22, 14].map(
              (height, index) => (
                <motion.span
                  key={index}
                  animate={{
                    height: [
                      `${height * 0.45}px`,
                      `${height}px`,
                      `${height * 0.65}px`,
                      `${height}px`,
                    ],
                  }}
                  transition={{
                    duration: 0.7,
                    repeat: Infinity,
                    delay: index * 0.08,
                  }}
                  style={{
                    width: "2px",
                    borderRadius: "3px",
                    background:
                      "linear-gradient(#06b6d4,#7c3aed)",
                    boxShadow:
                      "0 0 8px rgba(124,58,237,.5)",
                  }}
                />
              )
            )}
          </div>

          {/* SPEECH BUBBLE */}
          <AnimatePresence mode="wait">
            <motion.div
              key={speechIndex}
              initial={{
                opacity: 0,
                y: 10,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: -10,
                scale: 0.96,
              }}
              transition={{
                duration: 0.35,
              }}
              style={{
                position: "absolute",
                top: "12px",
                right: "16px",
                maxWidth: "210px",
                padding: "10px 14px",
                borderRadius: "14px",
                background:
                  "rgba(15,23,42,.92)",
                border:
                  "1px solid rgba(124,58,237,.4)",
                color: "#e2e8f0",
                fontSize: "11px",
                lineHeight: 1.5,
                boxShadow:
                  "0 10px 30px rgba(0,0,0,.3)",
              }}
            >
              {[
                "Hello! 👋 I'm your AI Interviewer.",
                "Take your time. Think through your answer.",
                "Great! Let's move to the next question.",
              ][speechIndex]}
            </motion.div>
          </AnimatePresence>

        </div>

        {/* =================================================
            QUESTION
        ================================================= */}

        <motion.div
          whileHover={{
            borderColor:
              "rgba(6,182,212,.35)",
          }}
          style={{
            padding: "18px 20px",
            borderRadius: "16px",
            background:
              "rgba(30,41,59,.65)",
            border:
              "1px solid rgba(96,165,250,.15)",
            marginTop: "16px",
          }}
        >

          <div
            className="d-flex justify-content-between align-items-center mb-2"
          >
            <span
              style={{
                color: "#06b6d4",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.5px",
              }}
            >
              QUESTION{" "}
              {String(questionIndex + 1).padStart(2, "0")}
              {" / 08"}
            </span>

            <span
              style={{
                color: "#94a3b8",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              {currentQuestion.category}
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.text}
              initial={{
                opacity: 0,
                y: 12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -12,
              }}
              transition={{
                duration: 0.4,
              }}
              style={{
                color: "#f8fafc",
                fontSize: "15px",
                lineHeight: 1.6,
              }}
            >
              "{currentQuestion.text}"
            </motion.div>
          </AnimatePresence>

        </motion.div>

        {/* =================================================
            LIVE ANALYSIS STATUS
        ================================================= */}

        {/* <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(4, 1fr)",
            gap: "7px",
            marginTop: "12px",
          }}
        >

          {[
            ["Analyzing", "◉"],
            ["Evaluating", "◈"],
            ["Feedback", "✦"],
            ["Ready", "✓"],
          ].map(([label, icon], index) => {

            const active =
              demoStatus === index;

            return (
              <motion.div
                key={label}
                animate={{
                  scale: active ? 1.04 : 1,
                  borderColor: active
                    ? "rgba(6,182,212,.55)"
                    : "rgba(96,165,250,.12)",
                  background: active
                    ? "rgba(6,182,212,.08)"
                    : "rgba(15,23,42,.45)",
                }}
                transition={{
                  duration: 0.3,
                }}
                style={{
                  padding: "9px 7px",
                  borderRadius: "9px",
                  border:
                    "1px solid rgba(96,165,250,.12)",
                  textAlign: "center",
                }}
              >
                <motion.div
                  animate={{
                    opacity: active
                      ? [0.5, 1, 0.5]
                      : 0.6,
                  }}
                  transition={{
                    duration: 1,
                    repeat: active
                      ? Infinity
                      : 0,
                  }}
                  style={{
                    color: active
                      ? "#67e8f9"
                      : "#64748b",
                    fontSize: "15px",
                  }}
                >
                  {icon}
                </motion.div>

                <div
                  style={{
                    color: active
                      ? "#e2e8f0"
                      : "#64748b",
                    fontSize: "12px",
                    marginTop: "3px",
                  }}
                >
                  {label}
                </div>
              </motion.div>
            );
          })}

        </div> */}

        {/* =================================================
            WAVEFORM
        ================================================= */}

        <div
          style={{
            marginTop: "16px",
            padding: "15px 18px",
            borderRadius: "16px",
            background:
              "rgba(2,6,23,.85)",
            border:
              "1px solid rgba(59,130,246,.18)",
          }}
        >

          <div className="d-flex justify-content-between align-items-center">
            <span
              style={{
                color: "#cbd5e1",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              <FaMicrophone
                className="text-info me-2"
                size={13}
              />
              Listening to your answer...
            </span>

            <span
              style={{
                color: "#06b6d4",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.5px",
              }}
            >
              00:{String(demoTime).padStart(2, "0")}
            </span>
          </div>

          <div
            className="d-flex justify-content-center align-items-center gap-1"
            style={{
              height: "44px",
              marginTop: "10px",
            }}
          >
            {[
              13, 24, 16, 32, 22,
              38, 26, 42, 20, 34,
              18, 30, 14, 27, 19,
              35, 23, 16, 31, 20,
            ].map((height, index) => (
              <motion.div
                key={index}
                animate={{
                  height: [
                    `${height * 0.35}px`,
                    `${height}px`,
                    `${height * 0.55}px`,
                    `${height}px`,
                  ],
                }}
                transition={{
                  duration: 0.7,
                  repeat: Infinity,
                  delay: index * 0.045,
                }}
                style={{
                  width: "4px",
                  borderRadius: "4px",
                  background:
                    "linear-gradient(#a855f7,#06b6d4)",
                  boxShadow:
                    "0 0 8px rgba(6,182,212,.4)",
                }}
              />
            ))}
          </div>

        </div>

        {/* =================================================
            SCORES
        ================================================= */}

        <div
          className="row g-3"
          style={{
            marginTop: "16px",
          }}
        >

          {[
            ["Technical", 92, "#06b6d4"],
            ["Communication", 84, "#3b82f6"],
            ["Confidence", 88, "#10b981"],
            ["Relevance", 90, "#facc15"],
          ].map(([name, value, color]) => (

            <div
              className="col-6"
              key={name}
            >

              <motion.div
                whileHover={{
                  y: -3,
                  scale: 1.02,
                }}
                style={{
                  padding: "14px 16px",
                  borderRadius: "14px",
                  background:
                    `${color}0c`,
                  border:
                    `1px solid ${color}25`,
                }}
              >

                <div
                  className="d-flex justify-content-between align-items-center mb-2"
                >
                  <span
                    style={{
                      color: "#e2e8f0",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  >
                    {name}
                  </span>

                  <strong
                    style={{
                      color,
                      fontSize: "13px",
                      fontWeight: 700,
                    }}
                  >
                    {value}%
                  </strong>
                </div>

                <div
                  style={{
                    height: "5px",
                    marginTop: "8px",
                    borderRadius: "10px",
                    background:
                      "rgba(255,255,255,.08)",
                    overflow: "hidden",
                  }}
                >

                  <motion.div
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: `${value}%`,
                    }}
                    transition={{
                      duration: 1.8,
                      delay: 0.4,
                      ease: "easeOut",
                    }}
                    style={{
                      height: "100%",
                      borderRadius: "10px",
                      background: color,
                      boxShadow:
                        `0 0 10px ${color}90`,
                    }}
                  />

                </div>

              </motion.div>

            </div>

          ))}

        </div>

      </motion.div>

      {/* =====================================================
          FLOATING RESUME MATCH
      ===================================================== */}

      <motion.div
        animate={{
          y: [0, -12, 0],
          rotate: [0, 1.5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        whileHover={{
          scale: 1.05,
        }}
        style={{
          position: "absolute",
          zIndex: 10,
          right: "-20px",
          top: "-20px",
          width: "175px",
          padding: "12px 16px",
          borderRadius: "16px",
          background:
            "rgba(7,13,29,.96)",
          backdropFilter: "blur(20px)",
          border:
            "1px solid rgba(6,182,212,.35)",
          boxShadow:
            "0 20px 50px rgba(0,0,0,.4)",
        }}
      >

        <div className="d-flex gap-2 align-items-center">

          <motion.div
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#06b6d4",
              background:
                "rgba(6,182,212,.12)",
            }}
          >
            <TbScan size={20} />
          </motion.div>

          <div>
            <div
              style={{
                color: "#94a3b8",
                fontSize: "10px",
                fontWeight: 600,
                marginBottom: "2px",
              }}
            >
              Resume Analysis
            </div>

            <strong
              style={{
                color: "#06b6d4",
                fontSize: "15px",
                fontWeight: 800,
              }}
            >
              92% Match
            </strong>
          </div>

        </div>

      </motion.div>

      {/* =====================================================
          FLOATING AI FEEDBACK
      ===================================================== */}

      <motion.div
        animate={{
          y: [0, 10, 0],
          rotate: [0, -1.5, 0],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        whileHover={{
          scale: 1.05,
        }}
        style={{
          position: "absolute",
          zIndex: 10,
          left: "-24px",
          bottom: "-24px",
          width: "190px",
          padding: "12px 16px",
          borderRadius: "16px",
          background:
            "rgba(7,13,29,.96)",
          backdropFilter: "blur(20px)",
          border:
            "1px solid rgba(16,185,129,.3)",
          boxShadow:
            "0 20px 50px rgba(0,0,0,.4)",
        }}
      >

        <div className="d-flex gap-2 align-items-center">

          <motion.div
            animate={{
              scale: [1, 1.12, 1],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
            }}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#10b981",
              background:
                "rgba(16,185,129,.12)",
            }}
          >
            <FaLightbulb />
          </motion.div>

          <div>
            <div
              style={{
                color: "#94a3b8",
                fontSize: "10px",
                fontWeight: 600,
                marginBottom: "2px",
              }}
            >
              AI Feedback
            </div>

            <AnimatePresence mode="wait">
              <motion.strong
                key={demoStatus}
                initial={{
                  opacity: 0,
                  y: 5,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -5,
                }}
                style={{
                  color:
                    demoStatus === 3
                      ? "#34d399"
                      : "#cbd5e1",
                  fontSize: "13px",
                  fontWeight: 700,
                }}
              >
                {[
                  "Analyzing...",
                  "Evaluating...",
                  "Generating...",
                  "Ready ✓",
                ][demoStatus]}
              </motion.strong>
            </AnimatePresence>

          </div>

        </div>

      </motion.div>

    </motion.div>

  </motion.div>

</div>

          </div>

        </div>
      </section>

      {/* ===================================================
          TRUST BAR
      =================================================== */}

      <section
        style={{
          position: "relative",
          zIndex: 2,
          borderTop:
            "1px solid rgba(96,165,250,.12)",
          borderBottom:
            "1px solid rgba(96,165,250,.12)",
          background:
            "rgba(15,23,42,.35)",
        }}
      >

        <div className="container py-4">

          <div className="row align-items-center text-center g-4">

            <div className="col-6 col-lg-3">
              <FaUsers
                className="text-primary mb-2"
                size={23}
              />
              <h4 className="fw-bold mb-0">
                10K+
              </h4>
              <small className="text-white">
                Practice Sessions
              </small>
            </div>

            <div className="col-6 col-lg-3">
              <FaBullseye
                className="text-info mb-2"
                size={23}
              />
              <h4 className="fw-bold mb-0">
                90+
              </h4>
              <small className="text-white">
                Career Roles
              </small>
            </div>

            <div className="col-6 col-lg-3">
              <FaBrain
                className="text-purple mb-2"
                size={23}
                style={{ color: "#a855f7" }}
              />
              <h4 className="fw-bold mb-0">
                AI
              </h4>
              <small className="text-white">
                Smart Evaluation
              </small>
            </div>

            <div className="col-6 col-lg-3">
              <FaVideo
                className="text-success mb-2"
                size={23}
              />
              <h4 className="fw-bold mb-0">
                3 Modes
              </h4>
              <small className="text-white">
                Text • Voice • Video
              </small>
            </div>

          </div>

        </div>

      </section>

      {/* ===================================================
          FEATURES
      =================================================== */}

      <section
        id="features"
        style={{
          position: "relative",
          zIndex: 2,
          padding: "110px 0",
        }}
      >

        <div className="container">

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.2,
            }}
            variants={stagger}
            className="text-center mb-5"
          >

            <motion.span
              variants={fadeUp}
              style={{
                display: "inline-block",
                padding: "8px 15px",
                borderRadius: "30px",
                color: "#c084fc",
                border:
                  "1px solid rgba(168,85,247,.4)",
                background:
                  "rgba(124,58,237,.08)",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              POWERFUL AI CAPABILITIES
            </motion.span>

            <motion.h2
              variants={fadeUp}
              className="display-4 fw-bold mt-3"
            >
              Everything You Need To{" "}
              <span
                style={{
                  background:
                    "linear-gradient(90deg,#a855f7,#06b6d4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Ace Your Interview
              </span>
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="text-white mx-auto"
              style={{
                maxWidth: "680px",
              }}
            >
              From resume analysis to AI evaluation,
              everything you need to become interview-ready.
            </motion.p>

          </motion.div>

          <div className="row g-4">

            {features.map((feature, index) => (

              <div
                className="col-lg-4 col-md-6"
                key={feature.title}
              >

              <motion.div
  initial={{
    opacity: 0,
    y: 60,
    rotateX: 10,
  }}
  whileInView={{
    opacity: 1,
    y: 0,
    rotateX: 0,
  }}
  viewport={{
    once: true,
    amount: 0.15,
  }}
  transition={{
    duration: 0.7,
    delay: index * 0.08,
  }}
  whileHover={{
    y: -12,
    scale: 1.025,
  }}
  whileTap={{
    scale: 0.98,
  }}
  onClick={() => {
    const route = featureRoutes[feature.title];

    if (route) {
      navigate(route);
    }
  }}
  onKeyDown={(event) => {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();

      const route = featureRoutes[feature.title];

      if (route) {
        navigate(route);
      }
    }
  }}
  role="link"
  tabIndex={0}
  aria-label={`Open ${feature.title}`}
  style={{
    height: "100%",
    padding: "28px",
    borderRadius: "18px",
    background:
      "linear-gradient(145deg,rgba(15,23,42,.85),rgba(2,6,23,.9))",
    border:
      "1px solid rgba(96,165,250,.18)",
    boxShadow:
      "0 15px 50px rgba(0,0,0,.2)",
    position: "relative",
    overflow: "hidden",
    cursor: "pointer",
  }}
>

                  {/* Hover light */}

                  <motion.div
                    initial={{
                      x: "-120%",
                    }}
                    whileHover={{
                      x: "120%",
                    }}
                    transition={{
                      duration: 0.8,
                    }}
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      width: "80px",
                      background:
                        "linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent)",
                      transform: "skewX(-20deg)",
                    }}
                  />

                  <motion.div
                    whileHover={{
                      scale: 1.15,
                      rotate: 8,
                    }}
                    style={{
                      width: "55px",
                      height: "55px",
                      borderRadius: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: feature.color,
                      background: `${feature.color}12`,
                      border:
                        `1px solid ${feature.color}35`,
                      marginBottom: "22px",
                      boxShadow:
                        `0 0 25px ${feature.color}15`,
                    }}
                  >
                    {React.cloneElement(
                      feature.icon,
                      { size: 24 }
                    )}
                  </motion.div>

                  <h5 className="fw-bold">
                    {feature.title}
                  </h5>

                  <p
                    className="text-white small mb-0"
                    style={{
                      lineHeight: 1.7,
                    }}
                  >
                    {feature.text}
                  </p>

                </motion.div>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* ===================================================
          HOW IT WORKS
      =================================================== */}

   <section
  id="how"
  style={{
    position: "relative",
    zIndex: 2,
    padding: "110px 0",
    background: "rgba(15,23,42,.25)",
    borderTop: "1px solid rgba(96,165,250,.1)",
    borderBottom: "1px solid rgba(96,165,250,.1)",
  }}
>
  <div className="container">

    <div className="text-center mb-5">

      <span
        style={{
          display: "inline-block",
          padding: "8px 15px",
          borderRadius: "30px",
          color: "#a78bfa",
          border: "1px solid rgba(124,58,237,.4)",
          fontSize: "12px",
          fontWeight: 700,
        }}
      >
        YOUR AI INTERVIEW JOURNEY
      </span>

      <h2 className="display-4 fw-bold mt-3">
        From Resume{" "}
        <span
          style={{
            background:
              "linear-gradient(90deg,#8b5cf6,#06b6d4)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          To Interview Ready
        </span>
      </h2>

    </div>

    <div className="row g-4">

      {[
        [
          "01",
          <FaFileAlt />,
          "Upload Resume",
          "AI understands your profile, skills and experience.",
        ],
        [
          "02",
          <FaLaptopCode />,
          "Choose Your Role",
          "Select your target technical or non-technical role.",
        ],
        [
          "03",
          <FaMicrophone />,
          "Take AI Interview",
          "Answer dynamic questions through text or voice.",
        ],
        [
          "04",
          <FaChartLine />,
          "Get Evaluation",
          "Receive detailed AI performance analysis.",
        ],
        [
          "05",
          <FaLightbulb />,
          "Improve",
          "Use personalized recommendations to improve.",
        ],
      ].map(([number, icon, title, text], index) => {

        const stepRoutes = {
          "Upload Resume": "/student/resume",
          "Choose Your Role": "/student/target-jobs",
          "Take AI Interview": "/student/interview-preparation/ai-mock",
          "Get Evaluation": "/student/interviews",
          "Improve": "/student/ask",
        };

        return (
          <div
            className="col-lg col-md-6"
            key={number}
          >
            <motion.div
              initial={{
                opacity: 0,
                y: 50,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.6,
                delay: index * 0.12,
              }}
              whileHover={{
                y: -8,
                scale: 1.02,
              }}
              whileTap={{
                scale: 0.98,
              }}
              onClick={() => {
                const route = stepRoutes[title];

                if (!route) return;

                navigate(user ? route : "/login");
              }}
              role="link"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();

                  const route = stepRoutes[title];

                  if (!route) return;

                  navigate(user ? route : "/login");
                }
              }}
              className="text-center p-4 h-100"
              style={{
                borderRadius: "18px",
                background: "rgba(8,15,32,.7)",
                border: "1px solid rgba(59,130,246,.18)",
                cursor: "pointer",
                transition:
                  "border-color .3s ease, box-shadow .3s ease",
              }}
            >

              <div
                style={{
                  fontSize: "42px",
                  fontWeight: 800,
                  background:
                    "linear-gradient(90deg,#8b5cf6,#06b6d4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {number}
              </div>

              <motion.div
                whileHover={{
                  scale: 1.15,
                  rotate: 8,
                }}
                style={{
                  width: "54px",
                  height: "54px",
                  margin: "10px auto 18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  color: "#ffffff",
                  background: "rgba(6,182,212,.1)",
                  border: "1px solid rgba(6,182,212,.3)",
                }}
              >
                {icon}
              </motion.div>

              <h6 className="fw-bold">
                {title}
              </h6>

              <p
                className="small text-white mb-0"
                style={{
                  lineHeight: 1.6,
                }}
              >
                {text}
              </p>

            </motion.div>
          </div>
        );
      })}

    </div>

  </div>
</section>
      {/* ===================================================
          ROLES
      =================================================== */}

      <section
        id="roles"
        style={{
          position: "relative",
          zIndex: 2,
          padding: "110px 0",
        }}
      >

        <div className="container">

          <div className="text-center mb-5">

            <span
              style={{
                display: "inline-block",
                padding: "8px 15px",
                borderRadius: "30px",
                color: "#c084fc",
                border:
                  "1px solid rgba(168,85,247,.4)",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              CAREER PATHS
            </span>

            <h2 className="display-4 fw-bold mt-3">
              Explore Your{" "}
              <span
                style={{
                  background:
                    "linear-gradient(90deg,#a855f7,#06b6d4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Career Role
              </span>
            </h2>

            <p className="text-white">
              Choose a role and practice interview questions
              designed for that career.
            </p>

            {/* TABS */}

            <div
              style={{
                display: "inline-flex",
                padding: "5px",
                borderRadius: "35px",
                background:
                  "rgba(15,23,42,.8)",
                border:
                  "1px solid rgba(96,165,250,.25)",
              }}
            >

              <motion.button
                onClick={() => setRoleType("Technical")}
                whileTap={{ scale: 0.96 }}
                style={{
                  border: "none",
                  borderRadius: "30px",
                  padding: "12px 25px",
                  color:
                    roleType === "Technical"
                      ? "#fff"
                      : "#94a3b8",
                  fontWeight: 700,
                  background:
                    roleType === "Technical"
                      ? "linear-gradient(90deg,#7c3aed,#2563eb)"
                      : "transparent",
                }}
              >
                <FaLaptopCode className="me-2" />
                Technical Roles
              </motion.button>

              <motion.button
                onClick={() =>
                  setRoleType("Non-Technical")
                }
                whileTap={{ scale: 0.96 }}
                style={{
                  border: "none",
                  borderRadius: "30px",
                  padding: "12px 25px",
                  color:
                    roleType === "Non-Technical"
                      ? "#fff"
                      : "#94a3b8",
                  fontWeight: 700,
                  background:
                    roleType === "Non-Technical"
                      ? "linear-gradient(90deg,#7c3aed,#2563eb)"
                      : "transparent",
                }}
              >
                <FaUserTie className="me-2" />
                Non-Technical
              </motion.button>

            </div>

          </div>

          <motion.div
            layout
            className="row g-3"
          >

            {(roleType === "Technical"
              ? technicalRoles
              : nonTechnicalRoles
            ).map((role, index) => (

              <div
                className="col-lg-3 col-md-4 col-sm-6"
                key={role}
              >

                <motion.div
                  layout
                  initial={{
                    opacity: 0,
                    scale: 0.8,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    delay: index * 0.06,
                  }}
                  whileHover={{
                    scale: 1.04,
                    x: 5,
                    boxShadow: "0 14px 34px rgba(37,99,235,.16)",
                  }}
                  onClick={() => setSelectedRole(role)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedRole(role);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Explore ${role} career path`}
                  style={{
                    cursor: "pointer",
                    padding: "17px",
                    borderRadius: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background:
                      "rgba(8,15,32,.75)",
                    border:
                      "1px solid rgba(59,130,246,.2)",
                  }}
                >

                  <div className="d-flex align-items-center gap-3">

                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#3b82f6",
                        background:
                          "rgba(37,99,235,.1)",
                      }}
                    >
                      {roleType === "Technical" ? (
                        <FaLaptopCode size={15} />
                      ) : (
                        <FaUserTie size={15} />
                      )}
                    </div>

                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: "14px",
                      }}
                    >
                      {role}
                    </span>

                  </div>

                  <motion.span
                    whileHover={{
                      x: 5,
                    }}
                    style={{
                      color: "#06b6d4",
                    }}
                  >
                    <FaArrowRight size={12} />
                  </motion.span>

                </motion.div>

              </div>

            ))}

          </motion.div>

          {createPortal(
            <AnimatePresence>
              {selectedRole && selectedRoleDetails && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onMouseDown={(event) => {
                    if (event.target === event.currentTarget) {
                      setSelectedRole(null);
                    }
                  }}
                  style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 2147483647,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "20px",
                    background: "rgba(2, 6, 23, 0.85)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 24, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 16, scale: 0.97 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="career-role-modal-title"
                    onMouseDown={(event) => event.stopPropagation()}
                    style={{
                      position: "relative",
                      width: "100%",
                      maxWidth: "640px",
                      maxHeight: "90vh",
                      overflowY: "auto",
                      padding: "34px",
                      borderRadius: "18px",
                      color: "#fff",
                      background:
                        "linear-gradient(145deg, rgba(15,23,42,.98), rgba(30,27,75,.98))",
                      border: "1px solid rgba(96,165,250,.35)",
                      boxShadow: "0 28px 90px rgba(0,0,0,.55)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedRole(null)}
                      aria-label="Close career role details"
                      style={{
                        position: "absolute",
                        top: "16px",
                        right: "16px",
                        width: "34px",
                        height: "34px",
                        border: "1px solid rgba(148,163,184,.3)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#cbd5e1",
                        background: "rgba(15,23,42,.65)",
                        cursor: "pointer",
                      }}
                    >
                      <FaTimes size={13} />
                    </button>

                    <span
                      style={{
                        color: "#67e8f9",
                        fontSize: "12px",
                        fontWeight: 700,
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                      }}
                    >
                      Career Path
                    </span>

                    <h3 id="career-role-modal-title" className="fw-bold mt-2 mb-3">
                      {selectedRole}
                    </h3>

                    <p className="text-white mb-4" style={{ lineHeight: 1.7 }}>
                      {selectedRoleDetails.description}
                    </p>

                    <div className="mb-4">
                      <h6 className="fw-bold mb-2">Key Skills</h6>
                      <p className="text-white-50 mb-0" style={{ lineHeight: 1.7 }}>
                        {selectedRoleDetails.skills}
                      </p>
                    </div>

                    <div className="mb-4">
                      <h6 className="fw-bold mb-2">Practice with HireSmart AI</h6>
                      <div className="d-grid gap-2">
                        {selectedRoleDetails.practice.map((item) => (
                          <div
                            key={item}
                            className="d-flex align-items-center gap-2 text-white-50"
                          >
                            <FaCheckCircle style={{ color: "#22d3ee" }} size={14} />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div
                      className="mb-4"
                      style={{
                        padding: "14px 16px",
                        borderRadius: "10px",
                        background: "rgba(59,130,246,.1)",
                        border: "1px solid rgba(96,165,250,.2)",
                      }}
                    >
                      <h6 className="fw-bold mb-1">Interview Focus</h6>
                      <span className="text-white-50">{selectedRoleDetails.focus}</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleStart}
                      className="btn text-white fw-bold w-100"
                      style={{
                        padding: "13px 20px",
                        border: "none",
                        borderRadius: "9px",
                        background: "linear-gradient(90deg,#7c3aed,#2563eb)",
                      }}
                    >
                      Start Practicing <FaArrowRight className="ms-2" size={12} />
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>,
            document.body
          )}

        </div>

      </section>

      {/* ===================================================
          AI COACH
      =================================================== */}

    <section
  id="coach"
  style={{
    position: "relative",
    zIndex: 2,
    padding: "110px 0",
    background: "rgba(15,23,42,.3)",
  }}
>
  <div className="container">

    <div className="row align-items-center g-5">

      {/* =====================================================
          LEFT CONTENT
      ===================================================== */}

      <div className="col-lg-6">

        <motion.div
          initial={{
            opacity: 0,
            x: -50,
          }}
          whileInView={{
            opacity: 1,
            x: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.8,
          }}
        >

          {/* LABEL */}
          <span
            style={{
              display: "inline-block",
              padding: "8px 15px",
              borderRadius: "30px",
              color: "#c084fc",
              border: "1px solid rgba(168,85,247,.4)",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.5px",
            }}
          >
            PERSONALIZED AI COACHING
          </span>

          {/* HEADING */}
          <h2
            className="display-4 fw-bold mt-3"
            style={{
              lineHeight: 1.15,
            }}
          >
            Your Personal{" "}
            <span
              style={{
                background:
                  "linear-gradient(90deg,#a855f7,#06b6d4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              AI Interview Coach
            </span>
          </h2>

          {/* DESCRIPTION */}
          <p
            className="text-white fs-5"
            style={{
              lineHeight: 1.7,
            }}
          >
            Every interview becomes an opportunity to
            improve. Understand your strengths, identify
            weak areas and receive actionable AI feedback.
          </p>

          {/* =================================================
              FEATURES
          ================================================= */}

          <div className="d-flex flex-column gap-3 mt-4">

            {[
              "Role-matched scenario questions",
              "Dynamic AI follow-up probing",
              "Technical and communication scoring",
              "Personalized improvement recommendations",
            ].map((item) => (

              <motion.div
                key={item}
                whileHover={{
                  x: 6,
                }}
                transition={{
                  duration: 0.2,
                }}
                className="d-flex align-items-center gap-3"
              >

                {/* CHECK ICON */}
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    flexShrink: 0,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#10b981",
                    background:
                      "rgba(16,185,129,.1)",
                    border:
                      "1px solid rgba(16,185,129,.2)",
                  }}
                >
                  <FaCheckCircle />
                </div>

                {/* TEXT */}
                <span
                  style={{
                    color: "#e2e8f0",
                    fontSize: "15px",
                  }}
                >
                  {item}
                </span>

              </motion.div>

            ))}

          </div>

          {/* =================================================
              START AI COACHING BUTTON
          ================================================= */}

          <div className="mt-4">

            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow:
                  "0 12px 35px rgba(139,92,246,.35)",
              }}
              whileTap={{
                scale: 0.97,
              }}
              onClick={() => {
                navigate(
                  user
                    ? "/student/ask"
                    : "/login"
                );
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                padding: "14px 26px",
                border: "none",
                borderRadius: "12px",
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: 700,
                background:
                  "linear-gradient(90deg,#8b5cf6,#06b6d4)",
                boxShadow:
                  "0 8px 25px rgba(99,102,241,.25)",
                cursor: "pointer",
                transition: "all .3s ease",
              }}
            >
              Start AI Coaching
              <FaArrowRight size={15} />
            </motion.button>

          </div>

        </motion.div>

      </div>


      {/* =====================================================
          RIGHT PERFORMANCE CARD
      ===================================================== */}

      <div className="col-lg-6">

        <motion.div
          initial={{
            opacity: 0,
            x: 50,
            scale: 0.9,
          }}
          whileInView={{
            opacity: 1,
            x: 0,
            scale: 1,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.8,
          }}
          style={{
            padding: "25px",
            borderRadius: "20px",
            background:
              "rgba(8,15,32,.85)",
            border:
              "1px solid rgba(99,102,241,.35)",
            boxShadow:
              "0 30px 80px rgba(0,0,0,.4)",
          }}
        >

          {/* HEADER */}
          <h5 className="fw-bold mb-4">
            <FaChartLine
              className="text-info me-2"
            />
            Live Performance Breakdown
          </h5>


          {/* =================================================
              PERFORMANCE SCORES
          ================================================= */}

          {[
            [
              "Technical Knowledge",
              91,
              "#06b6d4",
            ],
            [
              "Communication & Clarity",
              84,
              "#3b82f6",
            ],
            [
              "Confidence & Speech Flow",
              88,
              "#10b981",
            ],
            [
              "Answer Relevance",
              94,
              "#facc15",
            ],
          ].map(([name, score, color]) => (

            <div
              className="mb-4"
              key={name}
            >

              {/* SCORE HEADER */}
              <div className="d-flex justify-content-between mb-2">

                <span
                  style={{
                    fontSize: "14px",
                    color: "#e2e8f0",
                  }}
                >
                  {name}
                </span>

                <strong
                  style={{
                    color,
                  }}
                >
                  {score}%
                </strong>

              </div>

              {/* PROGRESS BAR */}
              <div
                style={{
                  height: "7px",
                  borderRadius: "20px",
                  background:
                    "rgba(255,255,255,.1)",
                  overflow: "hidden",
                }}
              >

                <motion.div
                  initial={{
                    width: 0,
                  }}
                  whileInView={{
                    width: `${score}%`,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    duration: 1.4,
                    ease: "easeOut",
                  }}
                  style={{
                    height: "100%",
                    borderRadius: "20px",
                    background: color,
                    boxShadow:
                      `0 0 12px ${color}`,
                  }}
                />

              </div>

            </div>

          ))}


          {/* =================================================
              AI RECOMMENDATION
          ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              delay: 1,
              duration: 0.6,
            }}
            style={{
              padding: "17px",
              borderRadius: "12px",
              background:
                "rgba(37,99,235,.08)",
              border:
                "1px solid rgba(37,99,235,.25)",
            }}
          >

            <strong
              className="text-info"
              style={{
                fontSize: "12px",
                letterSpacing: "0.5px",
              }}
            >
              AI RECOMMENDATION
            </strong>

            <p
              className="text-white-50 small mb-0 mt-2"
              style={{
                lineHeight: 1.6,
              }}
            >
              Your technical explanation is strong.
              Focus on structuring behavioral answers more
              clearly using the STAR method.
            </p>

          </motion.div>

        </motion.div>

      </div>

    </div>

  </div>
</section>


      {/* ===================================================
          Enquiry Section
      =================================================== */}

<LandingEnquirySection />

      {/* ===================================================
          RESUME / ATS
      =================================================== */}

 <section
  style={{
    position: "relative",
    zIndex: 2,
    padding: "100px 0",
  }}
>
  <div className="container">

    <div className="row g-4">

      {/* RESUME */}
      <div className="col-lg-6">
        <motion.div
          whileHover={{
            y: -10,
            scale: 1.01,
          }}
          whileTap={{
            scale: 0.98,
          }}
          onClick={() => {
            navigate(
              user
                ? "/student/resume"
                : "/login"
            );
          }}
          role="link"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();

              navigate(
                user
                  ? "/student/resume"
                  : "/login"
              );
            }
          }}
          style={{
            height: "100%",
            padding: "40px",
            borderRadius: "20px",
            background:
              "linear-gradient(145deg,rgba(15,23,42,.9),rgba(2,6,23,.9))",
            border:
              "1px solid rgba(6,182,212,.25)",
            cursor: "pointer",
            transition:
              "border-color .3s ease, box-shadow .3s ease",
          }}
        >

          <div
            style={{
              width: "58px",
              height: "58px",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#06b6d4",
              background: "rgba(6,182,212,.1)",
              marginBottom: "25px",
            }}
          >
            <FaFileAlt size={27} />
          </div>

          <h3 className="fw-bold">
            Your Resume Becomes Your
            Interview Blueprint
          </h3>

          <p className="text-white-50">
            AI analyzes your resume and creates
            personalized interview questions based on
            your actual profile.
          </p>

          {[
            "Skills detected",
            "Projects analyzed",
            "Experience mapped",
            "Personalized questions",
          ].map((item) => (
            <div
              className="small text-white-50 mb-3"
              key={item}
            >
              <FaCheckCircle
                className="text-success me-2"
              />
              {item}
            </div>
          ))}

        </motion.div>
      </div>


      {/* ATS */}
      <div className="col-lg-6">
        <motion.div
          whileHover={{
            y: -10,
            scale: 1.01,
          }}
          whileTap={{
            scale: 0.98,
          }}
          onClick={() => {
            navigate(
              user
                ? "/student/interview-preparation/ai-mock"
                : "/login"
            );
          }}
          role="link"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();

              navigate(
                user
                  ? "/student/interview-preparation/ai-mock"
                  : "/login"
              );
            }
          }}
          style={{
            height: "100%",
            padding: "40px",
            borderRadius: "20px",
            background:
              "linear-gradient(145deg,rgba(15,23,42,.9),rgba(2,6,23,.9))",
            border:
              "1px solid rgba(59,130,246,.25)",
            cursor: "pointer",
            transition:
              "border-color .3s ease, box-shadow .3s ease",
          }}
        >

          <div
            style={{
              width: "58px",
              height: "58px",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#3b82f6",
              background: "rgba(37,99,235,.1)",
              marginBottom: "25px",
            }}
          >
            <TbScan size={30} />
          </div>

          <h3 className="fw-bold">
            Practice Against The Actual
            Job Description
          </h3>

          <p className="text-white-50">
            Match your resume and skills against your
            target job description before your interview.
          </p>

          <div
            style={{
              marginTop: "25px",
              padding: "20px",
              borderRadius: "15px",
              background: "rgba(2,6,23,.8)",
              border:
                "1px solid rgba(59,130,246,.2)",
            }}
          >

            <div className="d-flex justify-content-between">

              <span className="fw-bold">
                ATS Match
              </span>

              <strong className="text-info">
                92%
              </strong>

            </div>

            <div
              style={{
                height: "8px",
                borderRadius: "20px",
                marginTop: "12px",
                background:
                  "rgba(255,255,255,.1)",
              }}
            >

              <motion.div
                initial={{
                  width: 0,
                }}
                whileInView={{
                  width: "92%",
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 1.5,
                }}
                style={{
                  height: "100%",
                  borderRadius: "20px",
                  background:
                    "linear-gradient(90deg,#06b6d4,#10b981)",
                  boxShadow:
                    "0 0 15px rgba(6,182,212,.5)",
                }}
              />

            </div>

          </div>

        </motion.div>
      </div>

    </div>

  </div>
</section>

     {/* =========================================================
    PRICING SECTION
========================================================= */}

<section
  id="pricing"
  style={{
    position: "relative",
    zIndex: 2,
    padding: "110px 0",
  }}
>
  <div className="container">

    {/* Heading */}
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7 }}
      className="text-center mb-5"
    >
      <span
        style={{
          display: "inline-block",
          padding: "8px 15px",
          borderRadius: "30px",
          color: "#c084fc",
          border: "1px solid rgba(168,85,247,.4)",
          background: "rgba(124,58,237,.06)",
          fontSize: "12px",
          fontWeight: 700,
          letterSpacing: ".5px",
        }}
      >
        SIMPLE PRICING
      </span>

      <h2
        className="display-4 fw-bold mt-3"
        style={{
          color: "#fff",
        }}
      >
        Choose Your{" "}
        <span
          style={{
            background:
              "linear-gradient(90deg,#a855f7,#06b6d4)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Interview Plan
        </span>
      </h2>

      <p
        className="mx-auto"
        style={{
          maxWidth: "680px",
          color: "#ffffff",
          fontSize: "16px",
          lineHeight: 1.7,
        }}
      >
        Practice smarter with AI-powered interviews, resume analysis,
        personalized feedback and performance tracking.
      </p>
    </motion.div>

    {/* Pricing Cards */}
    <div className="row g-4 justify-content-center">

      {[
        {
          name: "Free",
          price: "₹0",
          period: "Forever",
          description:
            "Get started with essential interview preparation.",
          features: [
            "AI Mock Interviews",
            "Role-Based Questions",
            "Basic AI Feedback",
            "Limited Practice Sessions",
          ],
          button: "Start Free",
          popular: false,
        },

        {
          name: "Student",
          price: "₹299",
          period: "/ month",
          description:
            "Designed for students preparing for internships and placements.",
          features: [
            "Unlimited Mock Interviews",
            "Resume + JD Interviews",
            "Detailed AI Evaluation",
            "Interview History",
            "Skill Gap Insights",
            "AI Interview Coach",
          ],
          button: "Choose Student",
          popular: true,
        },

        {
          name: "Pro",
          price: "₹599",
          period: "/ month",
          description:
            "Advanced preparation for serious interview practice.",
          features: [
            "Everything in Student",
            "Advanced AI Evaluation",
            "Voice Interview Practice",
            "Interview Replay",
            "Personalized Recommendations",
            "Priority Features",
          ],
          button: "Choose Pro",
          popular: false,
        },
      ].map((plan, index) => (

        <div
          className="col-lg-4 col-md-6"
          key={plan.name}
        >

          <motion.div
            initial={{
              opacity: 0,
              y: 50,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.15,
            }}
            transition={{
              duration: 0.7,
              delay: index * 0.12,
            }}
            whileHover={{
              y: -10,
              scale: 1.02,
            }}
            style={{
              position: "relative",
              height: "100%",
              padding: "32px",
              borderRadius: "22px",

              background: plan.popular
                ? "linear-gradient(145deg,#101a3a,#071225)"
                : "#07101f",

              border: plan.popular
                ? "1px solid rgba(99,102,241,.65)"
                : "1px solid rgba(96,165,250,.16)",

              boxShadow: plan.popular
                ? "0 20px 60px rgba(99,102,241,.18)"
                : "0 15px 45px rgba(0,0,0,.18)",

              overflow: "hidden",
            }}
          >

            {/* Popular Badge */}
            {plan.popular && (
              <div
                style={{
                  position: "absolute",
                  top: "18px",
                  right: "18px",
                  padding: "6px 11px",
                  borderRadius: "20px",
                  background:
                    "linear-gradient(90deg,#7c3aed,#2563eb)",
                  color: "#fff",
                  fontSize: "10px",
                  fontWeight: 700,
                }}
              >
                MOST POPULAR
              </div>
            )}

            {/* Plan Name */}
            <div
              style={{
                color: plan.popular
                  ? "#a78bfa"
                  : "#60a5fa",
                fontSize: "14px",
                fontWeight: 700,
                marginBottom: "12px",
              }}
            >
              {plan.name}
            </div>

            {/* Price */}
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "7px",
                marginBottom: "12px",
              }}
            >
              <span
                style={{
                  fontSize: "42px",
                  fontWeight: 800,
                  color: "#fff",
                  letterSpacing: "-1px",
                }}
              >
                {plan.price}
              </span>

              <span
                style={{
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                {plan.period}
              </span>
            </div>

            {/* Description */}
            <p
              style={{
                color: "#94a3b8",
                fontSize: "14px",
                lineHeight: 1.7,
                minHeight: "48px",
              }}
            >
              {plan.description}
            </p>

            {/* Divider */}
            <div
              style={{
                borderTop:
                  "1px solid rgba(148,163,184,.10)",
                margin: "22px 0",
              }}
            />

            {/* Features */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "13px",
              }}
            >
              {plan.features.map((feature) => (
                <div
                  key={feature}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    color: "#cbd5e1",
                    fontSize: "13px",
                  }}
                >
                  <FaCheckCircle
                    size={14}
                    style={{
                      color: "#22c55e",
                      flexShrink: 0,
                    }}
                  />

                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* Button */}
            <motion.button
              whileHover={{
                scale: 1.03,
              }}
              whileTap={{
                scale: 0.97,
              }}
              onClick={handleStart}
              style={{
                width: "100%",
                marginTop: "28px",
                padding: "13px 18px",
                borderRadius: "10px",
                border: plan.popular
                  ? "none"
                  : "1px solid rgba(96,165,250,.25)",

                background: plan.popular
                  ? "linear-gradient(90deg,#7c3aed,#2563eb)"
                  : "rgba(15,23,42,.7)",

                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",

                boxShadow: plan.popular
                  ? "0 10px 30px rgba(99,102,241,.25)"
                  : "none",
              }}
            >
              {plan.button}
              <FaArrowRight
                className="ms-2"
                size={11}
              />
            </motion.button>

          </motion.div>

        </div>
      ))}
    </div>

    {/* Bottom note */}
    <motion.p
      initial={{
        opacity: 0,
      }}
      whileInView={{
        opacity: 1,
      }}
      viewport={{
        once: true,
      }}
      transition={{
        delay: 0.4,
      }}
      className="text-center mt-4 mb-0"
      style={{
        color: "#ffffff",
        fontSize: "20px",
      }}
    >
      Start with the plan that fits your preparation journey.
    </motion.p>

  </div>
</section>
     {/* Footer */}
      <LandingFooter />

    </div>
  );
};

export default Home;