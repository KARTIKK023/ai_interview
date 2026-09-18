import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaRobot,
  FaEnvelope,
  FaQuestionCircle,
  FaHeadset,
  FaArrowRight,
  FaChevronDown,
  FaBug,
  FaFileAlt,
  FaUser,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const faqs = [
  {
    question: "How does HireSmart AI work?",
    answer:
      "Upload your resume, choose your target job role, and start an AI-powered interview. HireSmart AI generates relevant questions and provides personalized performance feedback.",
  },
  {
    question: "Can I practice interviews using my resume?",
    answer:
      "Yes. HireSmart AI can use your resume information to create interview questions based on your skills, projects, experience, and target role.",
  },
  {
    question: "What types of interviews can I practice?",
    answer:
      "You can practice technical, behavioral, role-based, voice, and video-style interview experiences depending on the available platform features.",
  },
  {
    question: "How is my interview evaluated?",
    answer:
      "Your responses can be evaluated across areas such as technical knowledge, communication, confidence, relevance, and answer structure.",
  },
  {
    question: "I am facing a technical problem. What should I do?",
    answer:
      "Try refreshing the page and checking your internet connection first. If the issue continues, contact our support team with the problem details and screenshots if available.",
  },
];

const Support = () => {
  const [openFaq, setOpenFaq] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Support Request:", formData);

    alert("Your support request has been submitted.");

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "#fff",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* ================= BACKGROUND ================= */}

      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          background: `
            radial-gradient(
              circle at 15% 20%,
              rgba(37,99,235,.18),
              transparent 30%
            ),
            radial-gradient(
              circle at 85% 25%,
              rgba(124,58,237,.18),
              transparent 30%
            ),
            radial-gradient(
              circle at 50% 80%,
              rgba(6,182,212,.08),
              transparent 35%
            )
          `,
        }}
      />

      {/* ================= NAVBAR ================= */}

      <div
        className="container"
        style={{
          position: "relative",
          zIndex: 10,
          paddingTop: "20px",
        }}
      >
        <nav
          style={{
            height: "68px",
            borderRadius: "40px",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            background: "rgba(2,6,23,.78)",
            backdropFilter: "blur(25px)",
            border: "1px solid rgba(96,165,250,.22)",
            boxShadow: "0 15px 50px rgba(0,0,0,.4)",
          }}
        >
          <Link
            to="/"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#fff",
              fontSize: "20px",
              fontWeight: 800,
              minWidth: "220px",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "linear-gradient(135deg,#06b6d4,#2563eb)",
                boxShadow:
                  "0 0 25px rgba(6,182,212,.35)",
              }}
            >
              <FaRobot />
            </div>

            <span
              style={{
                background:
                  "linear-gradient(90deg,#a855f7,#06b6d4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              HireSmart AI
            </span>
          </Link>

          <div
            className="d-none d-lg-flex"
            style={{
              flex: 1,
              justifyContent: "center",
              gap: "30px",
            }}
          >
            {[
              ["Home", "/"],
              ["Features", "/#features"],
              ["How It Works", "/#how"],
              ["For Students", "/#roles"],
              ["AI Coach", "/#coach"],
            ].map(([text, href]) => (
              <Link
                key={text}
                to={href}
                style={{
                  color: "#94a3b8",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                {text}
              </Link>
            ))}
          </div>

          <Link
            to="/login"
            style={{
              color: "#fff",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            Login
          </Link>
        </nav>
      </div>

      {/* ================= HERO ================= */}

      <section
        style={{
          position: "relative",
          zIndex: 2,
          padding: "85px 0 55px",
          textAlign: "center",
        }}
      >
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "9px 17px",
                borderRadius: "30px",
                color: "#c084fc",
                border: "1px solid rgba(168,85,247,.4)",
                background: "rgba(124,58,237,.08)",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              <FaHeadset />
              HIRE SMART AI SUPPORT
            </div>

            <h1
              style={{
                fontSize: "clamp(42px,6vw,72px)",
                fontWeight: 800,
                lineHeight: 1.05,
                marginTop: "22px",
                letterSpacing: "-3px",
              }}
            >
              How Can We{" "}
              <span
                style={{
                  background:
                    "linear-gradient(90deg,#a855f7,#4f7cff,#06cbea)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Help You?
              </span>
            </h1>

            <p
              style={{
                maxWidth: "650px",
                margin: "18px auto 0",
                color: "#94a3b8",
                fontSize: "16px",
                lineHeight: 1.7,
              }}
            >
              Find answers, report an issue, or contact the
              HireSmart AI support team for help with your
              interview journey.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ================= QUICK HELP ================= */}

      <section
        style={{
          position: "relative",
          zIndex: 2,
          paddingBottom: "60px",
        }}
      >
        <div className="container">
          <div className="row g-3">
            {[
              {
                icon: <FaQuestionCircle />,
                title: "FAQs",
                text: "Find quick answers to common questions.",
                color: "#8b5cf6",
              },
              {
                icon: <FaBug />,
                title: "Report a Problem",
                text: "Tell us about a technical issue.",
                color: "#06b6d4",
              },
              {
                icon: <FaEnvelope />,
                title: "Email Support",
                text: "Contact our support team directly.",
                color: "#10b981",
              },
            ].map((item, index) => (
              <div className="col-lg-4" key={item.title}>
                <motion.div
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{
                    y: -7,
                    borderColor: `${item.color}80`,
                    boxShadow: `0 15px 40px ${item.color}15`,
                  }}
                  style={{
                    height: "100%",
                    padding: "25px",
                    borderRadius: "15px",
                    background: "rgba(7,17,37,.82)",
                    border:
                      "1px solid rgba(96,165,250,.18)",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: item.color,
                      background: `${item.color}12`,
                      border: `1px solid ${item.color}35`,
                      fontSize: "19px",
                      marginBottom: "18px",
                    }}
                  >
                    {item.icon}
                  </div>

                  <h5 style={{ fontWeight: 800 }}>
                    {item.title}
                  </h5>

                  <p
                    style={{
                      color: "#718096",
                      fontSize: "13px",
                      lineHeight: 1.6,
                    }}
                  >
                    {item.text}
                  </p>

                  <span
                    style={{
                      color: item.color,
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    Get Help <FaArrowRight size={9} />
                  </span>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FAQ + CONTACT ================= */}

      <section
        style={{
          position: "relative",
          zIndex: 2,
          padding: "65px 0",
          background: "rgba(4,12,28,.65)",
          borderTop:
            "1px solid rgba(96,165,250,.08)",
          borderBottom:
            "1px solid rgba(96,165,250,.08)",
        }}
      >
        <div className="container">
          <div className="row g-5">

            {/* FAQ */}

            <div className="col-lg-6">
              <div
                style={{
                  color: "#c084fc",
                  fontSize: "12px",
                  fontWeight: 800,
                  marginBottom: "10px",
                }}
              >
                FREQUENTLY ASKED QUESTIONS
              </div>

              <h2
                style={{
                  fontSize: "35px",
                  fontWeight: 800,
                  marginBottom: "25px",
                }}
              >
                Common{" "}
                <span className="text-info">
                  Questions
                </span>
              </h2>

              {faqs.map((faq, index) => (
                <div
                  key={faq.question}
                  style={{
                    marginBottom: "10px",
                    borderRadius: "10px",
                    border:
                      "1px solid rgba(96,165,250,.16)",
                    background: "rgba(7,17,37,.7)",
                    overflow: "hidden",
                  }}
                >
                  <button
                    onClick={() =>
                      setOpenFaq(
                        openFaq === index ? null : index
                      )
                    }
                    style={{
                      width: "100%",
                      border: 0,
                      background: "transparent",
                      color: "#fff",
                      padding: "17px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      textAlign: "left",
                      fontWeight: 700,
                      fontSize: "13px",
                    }}
                  >
                    {faq.question}

                    <motion.span
                      animate={{
                        rotate:
                          openFaq === index ? 180 : 0,
                      }}
                    >
                      <FaChevronDown />
                    </motion.span>
                  </button>

                  <AnimatePresence>
                    {openFaq === index && (
                      <motion.div
                        initial={{
                          height: 0,
                          opacity: 0,
                        }}
                        animate={{
                          height: "auto",
                          opacity: 1,
                        }}
                        exit={{
                          height: 0,
                          opacity: 0,
                        }}
                      >
                        <p
                          style={{
                            padding:
                              "0 17px 17px",
                            margin: 0,
                            color: "#7d8aa0",
                            fontSize: "12px",
                            lineHeight: 1.7,
                          }}
                        >
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* CONTACT FORM */}

            <div className="col-lg-6">
              <div
                style={{
                  padding: "30px",
                  borderRadius: "16px",
                  background:
                    "rgba(7,17,37,.9)",
                  border:
                    "1px solid rgba(124,58,237,.28)",
                  boxShadow:
                    "0 20px 60px rgba(0,0,0,.25)",
                }}
              >
                <div
                  style={{
                    color: "#c084fc",
                    fontSize: "12px",
                    fontWeight: 800,
                    marginBottom: "8px",
                  }}
                >
                  CONTACT SUPPORT
                </div>

                <h3
                  style={{
                    fontSize: "26px",
                    fontWeight: 800,
                  }}
                >
                  Send Us a{" "}
                  <span className="text-info">
                    Message
                  </span>
                </h3>

                <p
                  style={{
                    color: "#718096",
                    fontSize: "12px",
                  }}
                >
                  Tell us what you need help with and our
                  team will assist you.
                </p>

                <form onSubmit={handleSubmit}>
                  <div className="row g-3 mt-2">

                    <div className="col-md-6">
                      <label
                        style={{
                          color: "#cbd5e1",
                          fontSize: "12px",
                          marginBottom: "6px",
                        }}
                      >
                        Name
                      </label>

                      <div className="input-group">
                        <span
                          className="input-group-text"
                          style={{
                            background: "#0b162d",
                            border:
                              "1px solid #1e3152",
                            color: "#64748b",
                          }}
                        >
                          <FaUser />
                        </span>

                        <input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="form-control"
                          placeholder="Your name"
                          style={{
                            background: "#0b162d",
                            border:
                              "1px solid #1e3152",
                            color: "#fff",
                          }}
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label
                        style={{
                          color: "#cbd5e1",
                          fontSize: "12px",
                          marginBottom: "6px",
                        }}
                      >
                        Email
                      </label>

                      <div className="input-group">
                        <span
                          className="input-group-text"
                          style={{
                            background: "#0b162d",
                            border:
                              "1px solid #1e3152",
                            color: "#64748b",
                          }}
                        >
                          <FaEnvelope />
                        </span>

                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="form-control"
                          placeholder="you@example.com"
                          style={{
                            background: "#0b162d",
                            border:
                              "1px solid #1e3152",
                            color: "#fff",
                          }}
                        />
                      </div>
                    </div>

                    <div className="col-12">
                      <label
                        style={{
                          color: "#cbd5e1",
                          fontSize: "12px",
                          marginBottom: "6px",
                        }}
                      >
                        Subject
                      </label>

                      <input
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="form-control"
                        placeholder="How can we help?"
                        style={{
                          background: "#0b162d",
                          border:
                            "1px solid #1e3152",
                          color: "#fff",
                        }}
                      />
                    </div>

                    <div className="col-12">
                      <label
                        style={{
                          color: "#cbd5e1",
                          fontSize: "12px",
                          marginBottom: "6px",
                        }}
                      >
                        Message
                      </label>

                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows="5"
                        className="form-control"
                        placeholder="Describe your issue..."
                        style={{
                          background: "#0b162d",
                          border:
                            "1px solid #1e3152",
                          color: "#fff",
                          resize: "none",
                        }}
                      />
                    </div>

                    <div className="col-12">
                      <motion.button
                        whileHover={{
                          scale: 1.03,
                          boxShadow:
                            "0 0 30px rgba(99,102,241,.4)",
                        }}
                        whileTap={{
                          scale: 0.97,
                        }}
                        type="submit"
                        style={{
                          width: "100%",
                          border: 0,
                          borderRadius: "10px",
                          padding: "13px",
                          color: "#fff",
                          fontWeight: 800,
                          background:
                            "linear-gradient(90deg,#7c3aed,#2563eb)",
                        }}
                      >
                        Submit Support Request{" "}
                        <FaArrowRight size={10} />
                      </motion.button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}

      <footer
        style={{
          position: "relative",
          zIndex: 2,
          padding: "25px 0",
          background: "#01040b",
        }}
      >
        <div className="container">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <span
              style={{
                color: "#64748b",
                fontSize: "12px",
              }}
            >
              © {new Date().getFullYear()}{" "}
              <strong style={{ color: "#fff" }}>
                HireSmart AI
              </strong>
              . All rights reserved.
            </span>

            <Link
              to="/"
              style={{
                color: "#06b6d4",
                textDecoration: "none",
                fontSize: "12px",
              }}
            >
              Back to Home <FaArrowRight size={9} />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Support;