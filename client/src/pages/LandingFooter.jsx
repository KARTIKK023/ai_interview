import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import {
  FaRobot,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
} from "react-icons/fa";

const LandingFooter = () => {
  const { user } = useContext(AuthContext);
  const linkStyle = {
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 600,
  };

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
    transition: "all 0.25s ease",
  };

  return (
    <footer
      style={{
        position: "relative",
        zIndex: 2,
        padding: "60px 0 25px",
        background: "#0A1629",
        borderTop: "1px solid rgba(96,165,250,.12)",
      }}
    >
      <div className="container">
        <div className="row g-5">

          {/* Brand */}
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
                  color: "#fff",
                }}
              >
                <FaRobot />
              </div>

              <span className="text-info">
                HireSmart AI
              </span>
            </div>

            <p
              className="small"
              style={{
                maxWidth: "350px",
                lineHeight: 1.7,
                color: "#ffffff",
              }}
            >
              AI-powered interview preparation platform
              helping candidates practice smarter and
              interview with confidence.
            </p>
          </div>

          {/* Product */}
          <div className="col-6 col-lg-2">
            <h6 className="fw-bold mb-3">
              Product
            </h6>

            <div className="d-flex flex-column gap-2">
              <a
                href="/#features"
                style={linkStyle}
              >
                HireSmart AI
              </a>

              <a
                href="/#roles"
                style={linkStyle}
              >
                Role Explorer
              </a>

              <a
                href="/#coach"
                style={linkStyle}
              >
                AI Coach
              </a>
            </div>
          </div>

         {/* Students */}
<div className="col-6 col-lg-2">
  <h6 className="fw-bold mb-3">
    Students
  </h6>

  <div className="d-flex flex-column gap-2">

    <Link
      to={
        user
          ? "/student/interview-preparation/ai-mock"
          : "/login"
      }
      style={linkStyle}
    >
      Practice
    </Link>

    <Link
      to={
        user
          ? "/student/ats-scanner"
          : "/login"
      }
      style={linkStyle}
    >
      Resume Analysis
    </Link>

    <Link
      to={
        user
          ? "/student/interviews"
          : "/login"
      }
      style={linkStyle}
    >
      Interview History
    </Link>

  </div>
</div>

          {/* Support */}
          <div className="col-6 col-lg-2">
            <h6 className="fw-bold mb-3">
              Support
            </h6>

            <div className="d-flex flex-column gap-2"
            style={{
              color: "#ffffff",
            }}>
              <Link
                to="/privacy"
                style={linkStyle}
              >
                Privacy Policy
              </Link>

              <Link
                to="/terms"
                style={linkStyle}
              >
                Terms & Conditions
              </Link>

              <Link
                to="/enquiry"
                style={linkStyle}
              >
                Enquiry
              </Link>
            </div>
          </div>

          {/* Contact Us */}
          <div className="col-6 col-lg-2">
            <h6
              className="fw-bold"
              style={{
                color: "#ffffff",
                fontSize: "16px",
                marginBottom: "18px",
              }}
            >
              Contact Us
            </h6>

            {/* Phone */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                color: "#ffffff",
                fontSize: "14px",
                marginBottom: "14px",
              }}
            >
              <FaPhoneAlt size={14} />
              <span>+91-9696026985</span>
            </div>

            {/* Email */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                color: "#ffffff",
                fontSize: "14px",
                marginBottom: "14px",
              }}
            >
              <FaEnvelope
                size={15}
                style={{ marginTop: "3px" }}
              />

              <span
                style={{
                  wordBreak: "break-word",
                }}
              >
                support@webaitechsolution.com
              </span>
            </div>

            {/* Address */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    color: "#ffffff",
                    fontSize: "14px",
                    lineHeight: 1.5,
                  }}
                >
                  <FaMapMarkerAlt
                    size={23}
                    style={{
                      marginTop: "1px",
                      flexShrink: 0,
                      color: "#ffffff",
                    }}
                  />

                  <a
                    href="https://www.google.com/maps/search/?api=1&query=STPI+8th+Floor%2C+UPSIDA+Complex%2C+Lakhanpur%2C+Kanpur-208024%2C+UP"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#ffffff",
                      textDecoration: "none",
                      cursor: "pointer",
                    }}
                  >
                    STPI 8th Floor, UPSIDA Complex,
                    Lakhanpur, Kanpur-208024, UP
                  </a>
                </div>

            {/* Social */}
            {/* <h6
              className="fw-bold"
              style={{
                color: "#ffffff",
                fontSize: "16px",
                marginTop: "22px",
                marginBottom: "14px",
              }}
            >
              Follow Us
            </h6> */}

            {/* <div
              style={{
                display: "flex",
                gap: "10px",
              }}
            >
              <a
                href="#"
                style={socialStyle}
                aria-label="Facebook"
              >
                <FaFacebookF />
              </a>

              <a
                href="#"
                style={socialStyle}
                aria-label="Twitter"
              >
                <FaTwitter />
              </a>

              <a
                href="#"
                style={socialStyle}
                aria-label="LinkedIn"
              >
                <FaLinkedinIn />
              </a>

              <a
                href="#"
                style={socialStyle}
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>
            </div> */}
          </div>
        </div>

<div
  className="text-center small mt-5 pt-4"
  style={{
    borderTop: "1px solid rgba(255,255,255,.08)",
    color: "#64748b",
  }}
>
  © {new Date().getFullYear()}{" "}

  <Link
    to={{
      pathname: "/",
      hash: "#top",
    }}
    style={{
      color: "#fff",
      textDecoration: "none",
      fontWeight: 700,
    }}
  >
    HireSmart AI
  </Link>

  . All rights reserved.
</div>
      </div>
    </footer>
  );
};

export default LandingFooter;