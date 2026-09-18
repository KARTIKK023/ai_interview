import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { AuthContext } from "../context/AuthContext";

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
} from "react-icons/fa";

import { TbScan } from "react-icons/tb";

/* =========================================================
   DATA
========================================================= */

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
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [questionIndex, setQuestionIndex] = useState(0);
  const [roleType, setRoleType] = useState("Technical");
   const [hiringTextIndex, setHiringTextIndex] = useState(0);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

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
      navigate("/student/dashboard");
    } else {
      navigate("/login");
    }
  };

  const currentQuestion = questions[questionIndex];

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
            ].map(([text, href]) => (

              <a
                key={text}
                href={href}
                style={{
                  color: "#ffffff",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: 600,
                  transition: ".3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color =
                    "#94a3b8";
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

                  <motion.a
                    whileHover={{
                      scale: 1.04,
                      background:
                        "rgba(59,130,246,.12)",
                    }}
                    href="#features"
                    style={{
                      borderRadius: "35px",
                      padding: "17px 28px",
                      color: "#fff",
                      textDecoration: "none",
                      fontWeight: 700,
                      border:
                        "1px solid rgba(96,165,250,.3)",
                      background:
                        "rgba(15,23,42,.65)",
                    }}
                  >
                    <FaPlay
                      size={11}
                      className="me-2"
                    />
                    Explore AI Interview
                  </motion.a>

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

            {/* =================================================
                AI INTERVIEW DASHBOARD
            ================================================= */}

            <div className="col-lg-6">

              <motion.div
                style={{
                  x: smoothX,
                  y: smoothY,
                }}
              >

                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.75,
                    rotateY: 12,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    rotateY: 0,
                  }}
                  transition={{
                    duration: 1.2,
                    delay: 0.3,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  style={{
                    position: "relative",
                    maxWidth: "620px",
                    margin: "auto",
                    perspective: "1200px",
                  }}
                >

                  {/* OUTER GLOW */}

                  <motion.div
                    animate={{
                      opacity: [0.25, 0.5, 0.25],
                      scale: [0.95, 1.05, 0.95],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                    }}
                    style={{
                      position: "absolute",
                      inset: "-30px",
                      background:
                        "radial-gradient(circle,rgba(37,99,235,.3),transparent 65%)",
                      filter: "blur(30px)",
                    }}
                  />

                  {/* MAIN CARD */}

                  <motion.div
                    animate={{
                      y: [0, -8, 0],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{
                      position: "relative",
                      zIndex: 2,
                      padding: "22px",
                      borderRadius: "22px",
                      background:
                        "linear-gradient(145deg,rgba(15,23,42,.97),rgba(3,7,18,.97))",
                      border:
                        "1px solid rgba(96,165,250,.35)",
                      boxShadow:
                        "0 35px 100px rgba(0,0,0,.55),0 0 70px rgba(37,99,235,.13)",
                    }}
                  >

                    {/* HEADER */}

                    <div
                      className="d-flex justify-content-between align-items-center pb-3 mb-3"
                      style={{
                        borderBottom:
                          "1px solid rgba(255,255,255,.08)",
                      }}
                    >

                      <div className="d-flex align-items-center gap-3">

                        <motion.div
                          animate={{
                            boxShadow: [
                              "0 0 10px rgba(6,182,212,.3)",
                              "0 0 30px rgba(6,182,212,.7)",
                              "0 0 10px rgba(6,182,212,.3)",
                            ],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                          }}
                          style={{
                            width: "50px",
                            height: "50px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background:
                              "linear-gradient(135deg,#06b6d4,#2563eb)",
                          }}
                        >
                          <FaRobot size={24} />
                        </motion.div>

                        <div>

                          <div
                            style={{
                              fontWeight: 800,
                            }}
                          >
                            AI Interviewer
                          </div>

                          <span
                            style={{
                              color: "#34d399",
                              fontSize: "11px",
                              fontWeight: 700,
                            }}
                          >
                            ● LIVE SESSION
                          </span>

                        </div>

                      </div>

                      <div
                        style={{
                          color: "#f87171",
                          fontSize: "12px",
                          fontWeight: 700,
                        }}
                      >
                        <motion.span
                          animate={{
                            opacity: [1, 0.3, 1],
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

                    {/* QUESTION */}

                    <div
                      style={{
                        padding: "18px",
                        borderRadius: "12px",
                        background:
                          "rgba(30,41,59,.7)",
                        border:
                          "1px solid rgba(96,165,250,.15)",
                        minHeight: "125px",
                        marginBottom: "15px",
                      }}
                    >

                      <div className="d-flex justify-content-between mb-3">

                        <strong
                          style={{
                            color: "#06b6d4",
                            fontSize: "12px",
                          }}
                        >
                          QUESTION{" "}
                          {String(questionIndex + 1).padStart(
                            2,
                            "0"
                          )}{" "}
                          / 08
                        </strong>

                        <span
                          style={{
                            color: "#ffffff",
                            fontSize: "12px",
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
                            y: 15,
                            filter: "blur(5px)",
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            filter: "blur(0px)",
                          }}
                          exit={{
                            opacity: 0,
                            y: -15,
                          }}
                          transition={{
                            duration: 0.45,
                          }}
                          style={{
                            fontSize: "15px",
                            lineHeight: 1.5,
                          }}
                        >
                          "{currentQuestion.text}"
                        </motion.div>

                      </AnimatePresence>

                    </div>

                    {/* WAVEFORM */}

                    <div
                      style={{
                        padding: "16px",
                        borderRadius: "12px",
                        background:
                          "rgba(2,6,23,.9)",
                        border:
                          "1px solid rgba(59,130,246,.2)",
                        marginBottom: "15px",
                      }}
                    >

                      <div className="d-flex justify-content-between">

                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: "13px",
                          }}
                        >
                          <FaMicrophone
                            className="text-info me-2"
                          />
                          Listening to your answer...
                        </span>

                        <span
                          className="text-info"
                          style={{
                            fontSize: "12px",
                          }}
                        >
                          00:12
                        </span>

                      </div>

                      <div
                        className="d-flex justify-content-center align-items-center gap-1 mt-3"
                        style={{
                          height: "42px",
                        }}
                      >

                        {[18, 30, 14, 35, 22, 42, 27, 38, 17, 32, 24, 40, 20, 30, 15].map(
                          (height, index) => (

                            <motion.div
                              key={index}
                              animate={{
                                height: [
                                  `${height * 0.4}px`,
                                  `${height}px`,
                                  `${height * 0.6}px`,
                                  `${height}px`,
                                ],
                              }}
                              transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                delay: index * 0.06,
                              }}
                              style={{
                                width: "4px",
                                borderRadius: "5px",
                                background:
                                  "linear-gradient(#a855f7,#06b6d4)",
                                boxShadow:
                                  "0 0 8px rgba(6,182,212,.4)",
                              }}
                            />

                          )
                        )}

                      </div>

                    </div>

                    {/* SCORES */}

                    <div className="row g-2">

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

                          <div
                            style={{
                              padding: "13px",
                              borderRadius: "10px",
                              background: `${color}0C`,
                              border:
                                `1px solid ${color}30`,
                            }}
                          >

                            <div className="d-flex justify-content-between">

                              <span
                                style={{
                                  color: "#ffffff",
                                  fontSize: "12px",
                                }}
                              >
                                {name}
                              </span>

                              <strong
                                style={{
                                  color,
                                  fontSize: "13px",
                                }}
                              >
                                {value}%
                              </strong>

                            </div>

                            <div
                              style={{
                                height: "5px",
                                marginTop: "8px",
                                background:
                                  "rgba(255,255,255,.1)",
                                borderRadius: "10px",
                              }}
                            >

                              <motion.div
                                initial={{
                                  width: 0,
                                }}
                                whileInView={{
                                  width: `${value}%`,
                                }}
                                viewport={{
                                  once: true,
                                }}
                                transition={{
                                  duration: 1.4,
                                  delay: 0.2,
                                }}
                                style={{
                                  height: "100%",
                                  borderRadius: "10px",
                                  background: color,
                                  boxShadow:
                                    `0 0 10px ${color}80`,
                                }}
                              />

                            </div>

                          </div>

                        </div>

                      ))}

                    </div>

                  </motion.div>

                  {/* =================================================
                      FLOATING RESUME CARD
                  ================================================= */}

                  <motion.div
                    animate={{
                      y: [0, -12, 0],
                      rotate: [0, 1, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                    }}
                    style={{
                      position: "absolute",
                      zIndex: 5,
                      right: "-30px",
                      top: "-25px",
                      width: "190px",
                      padding: "15px",
                      borderRadius: "15px",
                      background:
                        "rgba(7,13,29,.94)",
                      backdropFilter: "blur(20px)",
                      border:
                        "1px solid rgba(59,130,246,.4)",
                      boxShadow:
                        "0 20px 50px rgba(0,0,0,.4)",
                    }}
                  >

                    <div className="d-flex gap-3">

                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "10px",
                          color: "#06b6d4",
                          background:
                            "rgba(6,182,212,.12)",
                        }}
                      >
                        <TbScan size={22} />
                      </div>

                      <div>

                        <div
                          style={{
                            color: "#ffffff",
                            fontSize: "11px",
                          }}
                        >
                          Resume Analysis
                        </div>

                        <strong
                          style={{
                            color: "#06b6d4",
                          }}
                        >
                          92% Match
                        </strong>

                      </div>

                    </div>

                  </motion.div>

                  {/* FEEDBACK */}

                  <motion.div
                    animate={{
                      y: [0, 10, 0],
                      rotate: [0, -1, 0],
                    }}
                    transition={{
                      duration: 4.5,
                      repeat: Infinity,
                    }}
                    style={{
                      position: "absolute",
                      zIndex: 5,
                      left: "-40px",
                      bottom: "-25px",
                      width: "200px",
                      padding: "15px",
                      borderRadius: "15px",
                      background:
                        "rgba(7,13,29,.94)",
                      backdropFilter: "blur(20px)",
                      border:
                        "1px solid rgba(16,185,129,.3)",
                      boxShadow:
                        "0 20px 50px rgba(0,0,0,.4)",
                    }}
                  >

                    <div className="d-flex gap-3">

                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "50%",
                          color: "#ffffff",
                          background:
                            "rgba(16,185,129,.12)",
                        }}
                      >
                        <FaLightbulb />
                      </div>

                      <div>

                        <div
                          style={{
                            color: "#ffffff",
                            fontSize: "11px",
                          }}
                        >
                          AI Feedback
                        </div>

                        <strong>
                          Ready ✓
                        </strong>

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
          background:
            "rgba(15,23,42,.25)",
          borderTop:
            "1px solid rgba(96,165,250,.1)",
          borderBottom:
            "1px solid rgba(96,165,250,.1)",
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
                border:
                  "1px solid rgba(124,58,237,.4)",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              YOUR AI INTERVIEW JOURNEY
            </span>

            <h2 className="display-4 fw-bold mt-3">
              From Resume To{" "}
              <span
                style={{
                  background:
                    "linear-gradient(90deg,#8b5cf6,#06b6d4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Interview Ready
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
            ].map(([number, icon, title, text], index) => (

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
                  }}
                  className="text-center p-4 h-100"
                  style={{
                    borderRadius: "18px",
                    background:
                      "rgba(8,15,32,.7)",
                    border:
                      "1px solid rgba(59,130,246,.18)",
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
                      background:
                        "rgba(6,182,212,.1)",
                      border:
                        "1px solid rgba(6,182,212,.3)",
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

            ))}

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
                  }}
                  onClick={handleStart}
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
          background:
            "rgba(15,23,42,.3)",
        }}
      >

        <div className="container">

          <div className="row align-items-center g-5">

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
              >

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
                  PERSONALIZED AI COACHING
                </span>

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

                <div className="d-flex flex-column gap-3 mt-4">

                  {[
                    "Role-matched scenario questions",
                    "Dynamic AI follow-up probing",
                    "Technical and communication scoring",
                    "Personalized improvement recommendations",
                  ].map((item) => (

                    <div
                      key={item}
                      className="d-flex align-items-center gap-3"
                    >

                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#10b981",
                          background:
                            "rgba(16,185,129,.1)",
                        }}
                      >
                        <FaCheckCircle />
                      </div>

                      <span>{item}</span>

                    </div>

                  ))}

                </div>

              </motion.div>

            </div>

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

                <h5 className="fw-bold mb-4">
                  <FaChartLine className="text-info me-2" />
                  Live Performance Breakdown
                </h5>

                {[
                  ["Technical Knowledge", 91, "#06b6d4"],
                  ["Communication & Clarity", 84, "#3b82f6"],
                  ["Confidence & Speech Flow", 88, "#10b981"],
                  ["Answer Relevance", 94, "#facc15"],
                ].map(([name, score, color]) => (

                  <div
                    className="mb-4"
                    key={name}
                  >

                    <div className="d-flex justify-content-between mb-2">

                      <span
                        style={{
                          fontSize: "14px",
                        }}
                      >
                        {name}
                      </span>

                      <strong style={{ color }}>
                        {score}%
                      </strong>

                    </div>

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
                    }}
                  >
                    AI RECOMMENDATION
                  </strong>

                  <p
                    className="text-white-50 small mb-0 mt-2"
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
                }}
                style={{
                  height: "100%",
                  padding: "40px",
                  borderRadius: "20px",
                  background:
                    "linear-gradient(145deg,rgba(15,23,42,.9),rgba(2,6,23,.9))",
                  border:
                    "1px solid rgba(6,182,212,.25)",
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
                    background:
                      "rgba(6,182,212,.1)",
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
                }}
                style={{
                  height: "100%",
                  padding: "40px",
                  borderRadius: "20px",
                  background:
                    "linear-gradient(145deg,rgba(15,23,42,.9),rgba(2,6,23,.9))",
                  border:
                    "1px solid rgba(59,130,246,.25)",
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
                    background:
                      "rgba(37,99,235,.1)",
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
                    background:
                      "rgba(2,6,23,.8)",
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

      {/* ===================================================
          FINAL CTA
      =================================================== */}

      <section
        style={{
          position: "relative",
          zIndex: 2,
          padding: "80px 0 110px",
        }}
      >

        <div className="container">

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.92,
            }}
            whileInView={{
              opacity: 1,
              scale: 1,
            }}
            viewport={{
              once: true,
            }}
            style={{
              position: "relative",
              overflow: "hidden",
              textAlign: "center",
              padding: "75px 30px",
              borderRadius: "25px",
              background:
                "linear-gradient(120deg,rgba(76,29,149,.4),rgba(37,99,235,.3),rgba(6,182,212,.12))",
              border:
                "1px solid rgba(99,102,241,.45)",
              boxShadow:
                "0 30px 100px rgba(37,99,235,.12)",
            }}
          >

            {/* CTA GLOW */}

            <motion.div
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                width: "200px",
                background:
                  "linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent)",
                transform: "skewX(-20deg)",
              }}
            />

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
              START YOUR JOURNEY
            </span>

            <h2
              className="display-3 fw-bold mt-3"
              style={{
                position: "relative",
              }}
            >
              Ready To Ace Your{" "}
              <span
                style={{
                  background:
                    "linear-gradient(90deg,#a855f7,#2563eb,#06b6d4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Next Interview?
              </span>
            </h2>

            <p
              className="text-white-50 fs-5"
              style={{
                position: "relative",
              }}
            >
              Practice with AI. Improve with data.
              Interview with confidence.
            </p>

            <motion.button
              whileHover={{
                scale: 1.07,
                boxShadow:
                  "0 0 50px rgba(99,102,241,.6)",
              }}
              whileTap={{
                scale: 0.95,
              }}
              onClick={handleStart}
              style={{
                position: "relative",
                marginTop: "20px",
                border: "none",
                borderRadius: "35px",
                padding: "16px 35px",
                color: "#fff",
                fontWeight: 700,
                background:
                  "linear-gradient(90deg,#7c3aed,#2563eb)",
                boxShadow:
                  "0 10px 40px rgba(99,102,241,.35)",
              }}
            >
              Get Started Now{" "}
              <FaArrowRight size={12} />
            </motion.button>

          </motion.div>

        </div>

      </section>

      {/* ===================================================
          FOOTER
      =================================================== */}

      <footer
        style={{
          position: "relative",
          zIndex: 2,
          padding: "60px 0 25px",
          background: "#01030b",
          borderTop:
            "1px solid rgba(96,165,250,.12)",
        }}
      >

        <div className="container">

          <div className="row g-5">

            <div className="col-lg-4">

              <div
                className="d-flex align-items-center gap-2 mb-3"
                style={{
                  fontSize: "21px",
                  fontWeight: 800,
                }}
              >

                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      "linear-gradient(135deg,#06b6d4,#2563eb)",
                  }}
                >
                  <FaRobot />
                </div>

                <span>
                  <span className="text-info">
                    HireSmart AI
                  </span>{" "}
                
                </span>

              </div>

              <p
                className="text-white small"
                style={{
                  maxWidth: "350px",
                  lineHeight: 1.7,
                }}
              >
                AI-powered interview preparation platform
                helping candidates practice smarter and
                interview with confidence.
              </p>

            </div>

            <div className="col-6 col-lg-2">

              <h6 className="fw-bold mb-3">
                Product
              </h6>

              <div className="d-flex flex-column gap-2">

                <a
                  href="#features"
                  className="text-white-50 small text-decoration-none"
                >
                  HireSmart AI
                </a>

                <a
                  href="#roles"
                  className="text-white-50 small text-decoration-none"
                >
                  Role Explorer
                </a>

                <a
                  href="#coach"
                  className="text-white-50 small text-decoration-none"
                >
                  AI Coach
                </a>

              </div>

            </div>

            <div className="col-6 col-lg-2">

              <h6 className="fw-bold mb-3">
                Students
              </h6>

              <div className="d-flex flex-column gap-2">

                <Link
                  to="/login"
                  className="text-white-50 small text-decoration-none"
                >
                  Practice
                </Link>

                <Link
                  to="/login"
                  className="text-white-50 small text-decoration-none"
                >
                  Resume Analysis
                </Link>

                <Link
                  to="/login"
                  className="text-white-50 small text-decoration-none"
                >
                  Interview History
                </Link>

              </div>

            </div>

            <div className="col-6 col-lg-2">

              <h6 className="fw-bold mb-3">
                Support
              </h6>

              <div className="d-flex flex-column gap-2">

                <a
                  href="#top"
                  className="text-white-50 small text-decoration-none"
                >
                  Privacy
                </a>

                <a
                  href="#top"
                  className="text-white-50 small text-decoration-none"
                >
                  Terms
                </a>

                <a
                  href="#top"
                  className="text-white-50 small text-decoration-none"
                >
                  Contact
                </a>

              </div>

            </div>

          </div>

          <div
            className="text-center text-white-50 small mt-5 pt-4"
            style={{
              borderTop:
                "1px solid rgba(255,255,255,.08)",
            }}
          >
            © {new Date().getFullYear()}{" "}
            <strong className="text-white">
              HireSmart AI
            </strong>
            . All rights reserved.
          </div>

        </div>

      </footer>

    </div>
  );
};

export default Home;