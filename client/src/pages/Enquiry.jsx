import React, { useState } from "react";
import { Link } from "react-router-dom";
import LandingFooter from "./LandingFooter";
import { motion } from "framer-motion";
import {
  FaRobot,
  FaArrowRight,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaClock,
  FaUser,
  FaBuilding,
  FaCommentDots,
  FaCheckCircle,
  FaPaperPlane,
} from "react-icons/fa";

const Enquiry = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    enquiryType: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch(
      "http://localhost:5000/api/enquiry",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      }
    );

    const data = await response.json();

    console.log("Enquiry API response:", response.status, data);

    if (!response.ok) {
      throw new Error(data.message || "Failed to send enquiry");
    }

    setSubmitted(true);

    setForm({
      name: "",
      email: "",
      phone: "",
      organization: "",
      enquiryType: "",
      subject: "",
      message: "",
    });

    setTimeout(() => {
      setSubmitted(false);
    }, 4000);

  } catch (error) {
    console.error("Enquiry submission error:", error);
    alert(error.message);
  }
};

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "#fff",
        overflow: "hidden",
      }}
    >

      {/* ================= BACKGROUND ================= */}

      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          overflow: "hidden",
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            left: "-300px",
            top: "100px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(37,99,235,.25), transparent 68%)",
            filter: "blur(40px)",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: "650px",
            height: "650px",
            right: "-300px",
            top: "150px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(124,58,237,.25), transparent 68%)",
            filter: "blur(40px)",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.12,
            backgroundImage: `
              linear-gradient(rgba(59,130,246,.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59,130,246,.15) 1px, transparent 1px)
            `,
            backgroundSize: "55px 55px",
          }}
        />
      </div>

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
            minHeight: "68px",
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

          {/* LOGO */}

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
                  "0 0 30px rgba(6,182,212,.4)",
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

          {/* NAV LINKS */}

          <div
            className="d-none d-lg-flex"
            style={{
              flex: 1,
              justifyContent: "center",
              gap: "30px",
            }}
          >
            <Link className="text-white text-decoration-none" to="/">
              Home
            </Link>

            <a
              className="text-white text-decoration-none"
              href="/#features"
            >
              Features
            </a>

            <a
              className="text-white text-decoration-none"
              href="/#how"
            >
              How It Works
            </a>

            <a
              className="text-white text-decoration-none"
              href="/#roles"
            >
              For Students
            </a>

            <a
              className="text-white text-decoration-none"
              href="/#coach"
            >
              AI Coach
            </a>

            <Link
              to="/enquiry"
              className="text-decoration-none"
              style={{
                color: "#c084fc",
                fontWeight: 700,
              }}
            >
              Enquiry
            </Link>
          </div>

          <div className="d-flex align-items-center gap-3">

            <Link
              to="/login"
              className="text-white text-decoration-none fw-semibold"
            >
              Login
            </Link>

            <Link
              to="/login"
              className="text-decoration-none"
              style={{
                padding: "12px 22px",
                borderRadius: "30px",
                color: "#fff",
                fontWeight: 700,
                background:
                  "linear-gradient(90deg,#7c3aed,#2563eb)",
                boxShadow:
                  "0 0 30px rgba(99,102,241,.4)",
              }}
            >
              Get Started <FaArrowRight size={11} />
            </Link>

          </div>
        </nav>
      </div>

      {/* ================= HERO ================= */}

      <section
        style={{
          position: "relative",
          zIndex: 2,
          padding: "90px 0 55px",
        }}
      >
        <div className="container text-center">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >

            <span
              style={{
                display: "inline-block",
                padding: "9px 17px",
                borderRadius: "30px",
                color: "#c084fc",
                border:
                  "1px solid rgba(168,85,247,.45)",
                background:
                  "rgba(124,58,237,.08)",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              ✦ WE'D LOVE TO HEAR FROM YOU
            </span>

            <h1
              style={{
                marginTop: "25px",
                fontSize: "clamp(45px,6vw,72px)",
                fontWeight: 800,
                letterSpacing: "-3px",
              }}
            >
              Get In{" "}
              <span
                style={{
                  background:
                    "linear-gradient(90deg,#a855f7,#7c5cff,#06b6d4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Touch
              </span>
            </h1>

            <p
              style={{
                maxWidth: "720px",
                margin: "15px auto",
                color: "#cbd5e1",
                fontSize: "17px",
                lineHeight: 1.7,
              }}
            >
              Have questions about HireSmart AI? Need support,
              want a demo, or interested in collaboration?
              Send us an enquiry and our team will get back to you.
            </p>

          </motion.div>

        </div>
      </section>

      {/* ================= MAIN CONTENT ================= */}

      <section
        style={{
          position: "relative",
          zIndex: 2,
          padding: "30px 0 100px",
        }}
      >
        <div className="container">

          <div className="row g-5">

            {/* ================= LEFT ================= */}

            <div className="col-lg-5">

              <h2 className="fw-bold mb-3">
                Contact Information
              </h2>

              <p
                style={{
                  color: "#94a3b8",
                  lineHeight: 1.7,
                }}
              >
                You can reach the HireSmart AI team through
                the following channels.
              </p>

              <div className="row g-3 mt-3">

                {[
                  {
                    icon: <FaEnvelope />,
                    title: "Email Support",
                    value: "support@hiresmartai.com",
                    color: "#06b6d4",
                  },
                  {
                    icon: <FaPhone />,
                    title: "Phone Support",
                    value: "+91 98765 43210",
                    color: "#10b981",
                  },
                  {
                    icon: <FaMapMarkerAlt />,
                    title: "Our Location",
                    value: "Kanpur, Uttar Pradesh",
                    color: "#8b5cf6",
                  },
                  {
                    icon: <FaClock />,
                    title: "Working Hours",
                    value: "Mon - Sat | 10:00 AM - 6:30 PM",
                    color: "#f59e0b",
                  },
                ].map((item) => (
                  <div
                    className="col-md-6"
                    key={item.title}
                  >
                    <motion.div
                      whileHover={{
                        y: -6,
                        scale: 1.02,
                      }}
                      style={{
                        height: "100%",
                        padding: "22px",
                        borderRadius: "16px",
                        background:
                          "linear-gradient(145deg,rgba(15,23,42,.85),rgba(2,6,23,.9))",
                        border:
                          "1px solid rgba(96,165,250,.18)",
                        boxShadow:
                          "0 15px 40px rgba(0,0,0,.2)",
                      }}
                    >
                      <div
                        style={{
                          width: "45px",
                          height: "45px",
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: item.color,
                          background: `${item.color}15`,
                          marginBottom: "15px",
                        }}
                      >
                        {item.icon}
                      </div>

                      <h6 className="fw-bold">
                        {item.title}
                      </h6>

                      <p
                        className="mb-0"
                        style={{
                          color: "#94a3b8",
                          fontSize: "13px",
                          lineHeight: 1.6,
                        }}
                      >
                        {item.value}
                      </p>
                    </motion.div>
                  </div>
                ))}

              </div>

              {/* WHY CONTACT */}

              <div className="mt-5">

                <h3 className="fw-bold">
                  Why Contact Us?
                </h3>

                <p style={{ color: "#94a3b8" }}>
                  We're here to help you with:
                </p>

                {[
                  "Platform usage guidance",
                  "Product demonstrations",
                  "College & institution collaboration",
                  "Recruiter & enterprise enquiries",
                  "Partnership opportunities",
                ].map((item) => (
                  <div
                    key={item}
                    className="d-flex align-items-center gap-3 mb-3"
                  >
                    <FaCheckCircle
                      style={{
                        color: "#8b5cf6",
                        fontSize: "19px",
                      }}
                    />

                    <span>{item}</span>
                  </div>
                ))}

              </div>

            </div>

            {/* ================= FORM ================= */}

            <div className="col-lg-7">

              <motion.div
                initial={{
                  opacity: 0,
                  x: 50,
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
                style={{
                  padding: "32px",
                  borderRadius: "22px",
                  background:
                    "linear-gradient(145deg,rgba(15,23,42,.9),rgba(2,6,23,.95))",
                  border:
                    "1px solid rgba(139,92,246,.55)",
                  boxShadow:
                    "0 25px 80px rgba(0,0,0,.45)",
                }}
              >

                <div className="d-flex align-items-center gap-3 mb-4">

                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        "linear-gradient(135deg,#7c3aed,#2563eb)",
                      boxShadow:
                        "0 0 30px rgba(124,58,237,.35)",
                    }}
                  >
                    <FaEnvelope />
                  </div>

                  <div>
                    <h3 className="fw-bold mb-1">
                      Send Us an Enquiry
                    </h3>

                    <p
                      className="mb-0"
                      style={{
                        color: "#94a3b8",
                        fontSize: "14px",
                      }}
                    >
                      Fill out the form and we'll get back to you.
                    </p>
                  </div>

                </div>

                <form onSubmit={handleSubmit}>

                  {/* NAME */}

                  <label className="form-label fw-semibold">
                    Full Name <span className="text-danger">*</span>
                  </label>

                  <div className="input-group mb-3">

                    <span className="input-group-text bg-transparent text-info border-secondary">
                      <FaUser />
                    </span>

                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="form-control bg-transparent text-white border-secondary"
                      placeholder="Enter your full name"
                    />

                  </div>

                  {/* EMAIL + PHONE */}

                  <div className="row">

                    <div className="col-md-6">

                      <label className="form-label fw-semibold">
                        Email Address{" "}
                        <span className="text-danger">*</span>
                      </label>

                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="form-control bg-transparent text-white border-secondary mb-3"
                        placeholder="you@example.com"
                      />

                    </div>

                    <div className="col-md-6">

                      <label className="form-label fw-semibold">
                        Phone Number
                      </label>

                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="form-control bg-transparent text-white border-secondary mb-3"
                        placeholder="+91 XXXXX XXXXX"
                      />

                    </div>

                  </div>

                  {/* ORGANIZATION */}

                  <label className="form-label fw-semibold">
                    Organization
                  </label>

                  <div className="input-group mb-3">

                    <span className="input-group-text bg-transparent text-info border-secondary">
                      <FaBuilding />
                    </span>

                    <input
                      type="text"
                      name="organization"
                      value={form.organization}
                      onChange={handleChange}
                      className="form-control bg-transparent text-white border-secondary"
                      placeholder="College, company or organization"
                    />

                  </div>

                  {/* ENQUIRY TYPE */}

                  <label className="form-label fw-semibold">
                    Enquiry Type{" "}
                    <span className="text-danger">*</span>
                  </label>

                  <select
                    name="enquiryType"
                    value={form.enquiryType}
                    onChange={handleChange}
                    required
                    className="form-select bg-dark text-white border-secondary mb-3"
                  >
                    <option value="">
                      Select enquiry type
                    </option>
                    <option value="general">
                      General Enquiry
                    </option>
                    <option value="support">
                      Technical Support
                    </option>
                    <option value="demo">
                      Product Demo
                    </option>
                    <option value="college">
                      College / Institution
                    </option>
                    <option value="recruiter">
                      Recruiter / Company
                    </option>
                    <option value="partnership">
                      Partnership
                    </option>
                  </select>

                  {/* SUBJECT */}

                  <label className="form-label fw-semibold">
                    Subject{" "}
                    <span className="text-danger">*</span>
                  </label>

                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                    className="form-control bg-transparent text-white border-secondary mb-3"
                    placeholder="Brief subject of your enquiry"
                  />

                  {/* MESSAGE */}
<label className="form-label fw-semibold">
  Message{" "}
  <span className="text-danger">*</span>
</label>

<div className="input-group mb-4">
  <span className="input-group-text bg-transparent text-info border-secondary align-items-start pt-3">
    <FaCommentDots />
  </span>

  <textarea
    name="message"
    value={form.message}
    onChange={handleChange}
    required
    rows="1"
    className="form-control bg-transparent text-white border-secondary"
    placeholder="Tell us more about your enquiry..."
    style={{
      resize: "none",
      minHeight: "40px",
    }}
  />
</div>

                  {/* SUCCESS */}

                  {submitted && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: -10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className="alert alert-success"
                    >
                      <FaCheckCircle className="me-2" />
                      Your enquiry has been submitted successfully!
                    </motion.div>
                  )}

                  {/* SUBMIT */}

                  <motion.button
                    whileHover={{
                      scale: 1.02,
                      boxShadow:
                        "0 0 35px rgba(99,102,241,.55)",
                    }}
                    whileTap={{
                      scale: 0.97,
                    }}
                    type="submit"
                    style={{
                      width: "100%",
                      border: "none",
                      borderRadius: "12px",
                      padding: "15px",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "15px",
                      background:
                        "linear-gradient(90deg,#a855f7,#2563eb)",
                    }}
                  >
                    <FaPaperPlane className="me-2" />
                    Send Enquiry
                    <FaArrowRight
                      className="ms-2"
                      size={12}
                    />
                  </motion.button>

                  <p
                    className="text-center mt-3 mb-0"
                    style={{
                      color: "#64748b",
                      fontSize: "12px",
                    }}
                  >
                    🔒 We respect your privacy and protect your information.
                  </p>

                </form>

              </motion.div>

            </div>

          </div>

        </div>
      </section>

      {/* ================= FOOTER ================= */}

    <LandingFooter />

    </div>
  );
};

export default Enquiry;