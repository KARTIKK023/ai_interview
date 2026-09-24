import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaRegCommentDots,
  FaPaperPlane,
  FaCheckCircle,
  FaRobot,
} from "react-icons/fa";

const LandingEnquirySection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // SUBMIT ENQUIRY
  // ==========================================
const handleSubmit = async (e) => {
  e.preventDefault();

  setLoading(true);
  setSuccess("");
  setError("");

  try {
    // Read values directly from submitted form
    const submittedForm = new FormData(e.currentTarget);

    const payload = {
      name: String(
        submittedForm.get("name") || ""
      ).trim(),

      email: String(
        submittedForm.get("email") || ""
      ).trim(),

      phone: String(
        submittedForm.get("phone") || ""
      ).trim(),

      message: String(
        submittedForm.get("message") || ""
      ).trim(),
    };

    console.log(
      "Landing enquiry payload:",
      payload
    );

    // Validation
    if (
      !payload.name ||
      !payload.email ||
      !payload.phone ||
      !payload.message
    ) {
      setError(
        "Please fill all required fields."
      );
      setLoading(false);
      return;
    }

    const enquiryFormData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      enquiryFormData.append(key, value);
    });

    // Send only these 4 fields as multipart form data.
    const response = await fetch(
      "http://localhost:5000/api/enquiry",
      {
        method: "POST",
        body: enquiryFormData,
      }
    );

    const data = await response.json();

    console.log(
      "Enquiry API response:",
      response.status,
      data
    );

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to send enquiry"
      );
    }

    // Success
    setSuccess(
      "Your enquiry has been sent successfully."
    );

    setError("");

    // Reset form
    e.currentTarget.reset();

    setFormData({
      name: "",
      email: "",
      phone: "",
      message: "",
    });

    setTimeout(() => {
      setSuccess("");
    }, 4000);

  } catch (error) {
    console.error(
      "Landing enquiry submission error:",
      error
    );

    setError(
      error.message ||
        "Failed to send enquiry. Please try again."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <section
      id="enquiry"
      style={{
        position: "relative",
        zIndex: 2,
        padding: "90px 0",
        background: "rgba(15,23,42,.25)",
        borderTop:
          "1px solid rgba(96,165,250,.08)",
        borderBottom:
          "1px solid rgba(96,165,250,.08)",
      }}
    >
      <div className="container">

        {/* =================================================
            SECTION HEADER
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.7,
          }}
          className="text-center mb-5"
        >
          <span
            style={{
              display: "inline-block",
              padding: "7px 14px",
              borderRadius: "30px",
              color: "#67e8f9",
              background:
                "rgba(6,182,212,.05)",
              border:
                "1px solid rgba(6,182,212,.28)",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.4px",
            }}
          >
            HAVE A QUESTION?
          </span>

          <h2
            className="fw-bold mt-3 mb-2"
            style={{
              fontSize: "36px",
              lineHeight: 1.15,
            }}
          >
            Send Your{" "}
            <span
              style={{
                background:
                  "linear-gradient(90deg,#8b5cf6,#06b6d4)",
                WebkitBackgroundClip:
                  "text",
                WebkitTextFillColor:
                  "transparent",
              }}
            >
              Enquiry
            </span>
          </h2>

          <p
            className="text-white-50 mx-auto mb-0"
            style={{
              maxWidth: "600px",
              fontSize: "14px",
              lineHeight: 1.7,
            }}
          >
            Have a question about HireSmart AI?
            Send us your details and our team
            will contact you soon.
          </p>
        </motion.div>


        {/* =================================================
            BOTH CARDS
            SAME WIDTH
            SAME HEIGHT
            SAME HORIZONTAL ALIGNMENT
        ================================================= */}

        <div
          className="row g-4 align-items-stretch"
          style={{
            display: "flex",
          }}
        >

          {/* =================================================
              LEFT — ENQUIRY CARD
          ================================================= */}

          <div className="col-lg-6 d-flex">

            <motion.div
              initial={{
                opacity: 0,
                x: -35,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.7,
              }}
              style={{
                width: "100%",
                height: "430px",
                padding: "24px",
                borderRadius: "18px",
                background:
                  "rgba(8,15,32,.88)",
                border:
                  "1px solid rgba(99,102,241,.25)",
                boxShadow:
                  "0 20px 50px rgba(0,0,0,.25)",
                display: "flex",
                flexDirection: "column",
              }}
            >

              <form
                onSubmit={handleSubmit}
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >

                {/* SUCCESS MESSAGE */}
                {success && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className="d-flex align-items-center gap-2 mb-3"
                    style={{
                      padding: "9px 11px",
                      borderRadius: "9px",
                      color: "#86efac",
                      background:
                        "rgba(16,185,129,.08)",
                      border:
                        "1px solid rgba(16,185,129,.2)",
                      fontSize: "12px",
                    }}
                  >
                    <FaCheckCircle
                      size={13}
                    />
                    <span>{success}</span>
                  </motion.div>
                )}


                {/* ERROR MESSAGE */}
                {error && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className="mb-3"
                    style={{
                      padding: "9px 11px",
                      borderRadius: "9px",
                      color: "#fca5a5",
                      background:
                        "rgba(239,68,68,.08)",
                      border:
                        "1px solid rgba(239,68,68,.2)",
                      fontSize: "12px",
                    }}
                  >
                    {error}
                  </motion.div>
                )}


                {/* =================================================
                    FORM FIELDS
                ================================================= */}

                <div className="row g-3">

                  {/* NAME */}
                  <div className="col-md-6">

                    <label
                      className="form-label text-white mb-1"
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      Name
                    </label>

                    <div
                      style={{
                        position: "relative",
                      }}
                    >

                      <FaUser
                        size={12}
                        style={{
                          position:
                            "absolute",
                          left: "13px",
                          top: "50%",
                          transform:
                            "translateY(-50%)",
                          color: "#64748b",
                          pointerEvents:
                            "none",
                        }}
                      />

                      <input
                        type="text"
                        name="name"
                        value={
                          formData.name
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="Enter your name"
                        required
                        autoComplete="name"
                        style={{
                          width: "100%",
                          height: "42px",
                          padding:
                            "0 12px 0 34px",
                          borderRadius:
                            "9px",
                          border:
                            "1px solid rgba(148,163,184,.16)",
                          outline: "none",
                          background:
                            "rgba(255,255,255,.035)",
                          color:
                            "#ffffff",
                          fontSize:
                            "12px",
                          boxSizing:
                            "border-box",
                        }}
                      />

                    </div>
                  </div>


                  {/* GMAIL */}
                  <div className="col-md-6">

                    <label
                      className="form-label text-white mb-1"
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      Gmail
                    </label>

                    <div
                      style={{
                        position: "relative",
                      }}
                    >

                      <FaEnvelope
                        size={12}
                        style={{
                          position:
                            "absolute",
                          left: "13px",
                          top: "50%",
                          transform:
                            "translateY(-50%)",
                          color: "#64748b",
                          pointerEvents:
                            "none",
                        }}
                      />

                      <input
                        type="email"
                        name="email"
                        value={
                          formData.email
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="Enter your Gmail"
                        required
                        autoComplete="email"
                        style={{
                          width: "100%",
                          height: "42px",
                          padding:
                            "0 12px 0 34px",
                          borderRadius:
                            "9px",
                          border:
                            "1px solid rgba(148,163,184,.16)",
                          outline: "none",
                          background:
                            "rgba(255,255,255,.035)",
                          color:
                            "#ffffff",
                          fontSize:
                            "12px",
                          boxSizing:
                            "border-box",
                        }}
                      />

                    </div>
                  </div>


                  {/* MOBILE / PHONE */}
                  <div className="col-12">

                    <label
                      className="form-label text-white mb-1"
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      Mobile Number
                    </label>

                    <div
                      style={{
                        position: "relative",
                      }}
                    >

                      <FaPhoneAlt
                        size={12}
                        style={{
                          position:
                            "absolute",
                          left: "13px",
                          top: "50%",
                          transform:
                            "translateY(-50%)",
                          color: "#64748b",
                          pointerEvents:
                            "none",
                        }}
                      />

                      <input
                        type="tel"
                        name="phone"
                        value={
                          formData.phone
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="Enter mobile number"
                        required
                        maxLength="10"
                        pattern="[0-9]{10}"
                        inputMode="numeric"
                        autoComplete="tel"
                        style={{
                          width: "100%",
                          height: "42px",
                          padding:
                            "0 12px 0 34px",
                          borderRadius:
                            "9px",
                          border:
                            "1px solid rgba(148,163,184,.16)",
                          outline: "none",
                          background:
                            "rgba(255,255,255,.035)",
                          color:
                            "#ffffff",
                          fontSize:
                            "12px",
                          boxSizing:
                            "border-box",
                        }}
                      />

                    </div>
                  </div>


                  {/* MESSAGE */}
                  <div className="col-12">

                    <label
                      className="form-label text-white mb-1"
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      Message
                    </label>

                    <div
                      style={{
                        position: "relative",
                      }}
                    >

                      <FaRegCommentDots
                        size={12}
                        style={{
                          position:
                            "absolute",
                          left: "13px",
                          top: "13px",
                          color:
                            "#64748b",
                          pointerEvents:
                            "none",
                        }}
                      />

                      <textarea
                        name="message"
                        value={
                          formData.message
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="Write your enquiry..."
                        required
                        rows="3"
                        style={{
                          width: "100%",
                          height: "82px",
                          padding:
                            "11px 12px 11px 34px",
                          borderRadius:
                            "9px",
                          border:
                            "1px solid rgba(148,163,184,.16)",
                          outline: "none",
                          background:
                            "rgba(255,255,255,.035)",
                          color:
                            "#ffffff",
                          fontSize:
                            "12px",
                          resize: "none",
                          boxSizing:
                            "border-box",
                        }}
                      />

                    </div>
                  </div>


                  {/* SEND BUTTON */}
                  <div className="col-12">

                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{
                        scale:
                          loading
                            ? 1
                            : 1.03,
                        boxShadow:
                          loading
                            ? "none"
                            : "0 8px 25px rgba(99,102,241,.3)",
                      }}
                      whileTap={{
                        scale:
                          loading
                            ? 1
                            : 0.97,
                      }}
                      style={{
                        display:
                          "inline-flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        gap: "8px",
                        padding:
                          "10px 18px",
                        border: "none",
                        borderRadius:
                          "9px",
                        color:
                          "#ffffff",
                        fontSize:
                          "12px",
                        fontWeight:
                          700,
                        background:
                          "linear-gradient(90deg,#8b5cf6,#06b6d4)",
                        boxShadow:
                          "0 6px 18px rgba(99,102,241,.2)",
                        cursor:
                          loading
                            ? "not-allowed"
                            : "pointer",
                        opacity:
                          loading
                            ? 0.7
                            : 1,
                      }}
                    >

                      {loading
                        ? "Sending..."
                        : "Send Enquiry"}

                      {!loading && (
                        <FaPaperPlane
                          size={11}
                        />
                      )}

                    </motion.button>

                  </div>

                </div>

              </form>

            </motion.div>

          </div>


          {/* =================================================
              RIGHT — NEED HELP CARD
          ================================================= */}

          <div className="col-lg-6 d-flex">

            <motion.div
              initial={{
                opacity: 0,
                x: 35,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.7,
              }}
              style={{
                width: "100%",
                height: "430px",
                padding: "28px",
                borderRadius: "18px",
                background:
                  "rgba(8,15,32,.88)",
                border:
                  "1px solid rgba(96,165,250,.15)",
                boxShadow:
                  "0 20px 50px rgba(0,0,0,.25)",
                display: "flex",
                flexDirection:
                  "column",
                justifyContent:
                  "center",
                boxSizing:
                  "border-box",
              }}
            >

              {/* ICON */}
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  flexShrink: 0,
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  borderRadius:
                    "14px",
                  color:
                    "#67e8f9",
                  background:
                    "rgba(6,182,212,.08)",
                  border:
                    "1px solid rgba(6,182,212,.18)",
                  marginBottom:
                    "20px",
                }}
              >
                <FaRobot size={23} />
              </div>


              {/* TITLE */}
              <h3
                className="fw-bold text-white mb-3"
                style={{
                  fontSize: "24px",
                  lineHeight: 1.2,
                }}
              >
                Need Help?
              </h3>


              {/* DESCRIPTION */}
              <p
                className="text-white-50 mb-4"
                style={{
                  maxWidth:
                    "430px",
                  fontSize:
                    "14px",
                  lineHeight:
                    1.7,
                }}
              >
                Our team is here to help
                you with questions about
                AI interviews, resume
                analysis and the platform.
              </p>


              {/* EMAIL */}
              <div
                className="d-flex align-items-center gap-3 mb-3"
              >

                <FaEnvelope
                  size={17}
                  style={{
                    color:
                      "#06b6d4",
                    flexShrink: 0,
                  }}
                />

                <span
                  className="text-white-50"
                  style={{
                    fontSize:
                      "14px",
                  }}
                >
                  support@webaitechsolution.com
                </span>

              </div>


              {/* PHONE */}
              <div
                className="d-flex align-items-center gap-3"
              >

                <FaPhoneAlt
                  size={16}
                  style={{
                    color:
                      "#8b5cf6",
                    flexShrink: 0,
                  }}
                />

                <span
                  className="text-white-50"
                  style={{
                    fontSize:
                      "14px",
                  }}
                >
                  +91 9696026985
                </span>

              </div>

            </motion.div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default LandingEnquirySection;