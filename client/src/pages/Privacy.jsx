import React from "react";
import LandingFooter from "./LandingFooter";
import { Link } from "react-router-dom";
import {
  FaShieldAlt,
  FaArrowLeft,
  FaUserShield,
  FaDatabase,
  FaRobot,
  FaLock,
  FaEnvelope,
  FaTrashAlt,
  FaCookieBite,
  FaCloud,
  FaGlobe,
  FaCheckCircle,
} from "react-icons/fa";

const Section = ({ id, number, title, children }) => (
  <section
    id={id}
    style={{
      scrollMarginTop: "100px",
      paddingBottom: "42px",
      marginBottom: "42px",
      borderBottom: "1px solid rgba(148,163,184,.12)",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "18px",
      }}
    >
      <span
        style={{
          width: "34px",
          height: "34px",
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(59,130,246,.12)",
          border: "1px solid rgba(59,130,246,.22)",
          color: "#ffffff",
          fontSize: "13px",
          fontWeight: 700,
        }}
      >
        {number}
      </span>

      <h2
        style={{
          margin: 0,
          color: "#fff",
          fontSize: "22px",
          fontWeight: 700,
        }}
      >
        {title}
      </h2>
    </div>

    <div
      style={{
        color: "#94a3b8",
        fontSize: "15px",
        lineHeight: 1.85,
      }}
    >
      {children}
    </div>
  </section>
);

const InfoCard = ({ icon, title, children }) => (
  <div
    style={{
      height: "100%",
      padding: "22px",
      borderRadius: "16px",
      background: "rgba(15,23,42,.55)",
      border: "1px solid rgba(96,165,250,.12)",
    }}
  >
    <div
      style={{
        width: "42px",
        height: "42px",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(59,130,246,.12)",
        color: "#60a5fa",
        marginBottom: "15px",
      }}
    >
      {icon}
    </div>

    <h3
      style={{
        color: "#fff",
        fontSize: "16px",
        fontWeight: 700,
        marginBottom: "8px",
      }}
    >
      {title}
    </h3>

    <div style={{ color: "#94a3b8", fontSize: "14px", lineHeight: 1.7 }}>
      {children}
    </div>
  </div>
);

const Privacy = () => {
  const lastUpdated = "September 22, 2026";

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 15% 10%, rgba(37,99,235,.14), transparent 30%), radial-gradient(circle at 85% 15%, rgba(124,58,237,.12), transparent 28%), #020617",
        color: "#fff",
      }}
    >
      {/* Background grid */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.18,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />

      {/* Navbar */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          background: "rgba(2,6,23,.82)",
          borderBottom: "1px solid rgba(148,163,184,.10)",
        }}
      >
        <div
          className="container"
          style={{
            minHeight: "70px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            to="/"
            style={{
              color: "#fff",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontWeight: 800,
              fontSize: "20px",
            }}
          >
            <span
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "linear-gradient(135deg,#2563eb,#7c3aed)",
                boxShadow: "0 8px 30px rgba(37,99,235,.25)",
              }}
            >
              <FaRobot size={17} />
            </span>

            HireSmart <span style={{ color: "#60a5fa" }}>AI</span>
          </Link>

          <Link
            to="/"
            style={{
              color: "#cbd5e1",
              textDecoration: "none",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaArrowLeft size={12} />
            Back to Home
          </Link>
        </div>
      </nav>

      <main
        style={{
          position: "relative",
          zIndex: 2,
          paddingBottom: "70px",
        }}
      >
        {/* Hero */}
        <section
          style={{
            padding: "80px 0 55px",
            textAlign: "center",
          }}
        >
          <div className="container">
            <div
              style={{
                width: "72px",
                height: "72px",
                margin: "0 auto 22px",
                borderRadius: "22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(59,130,246,.12)",
                border: "1px solid rgba(96,165,250,.25)",
                color: "#60a5fa",
                boxShadow: "0 0 50px rgba(37,99,235,.14)",
              }}
            >
              <FaShieldAlt size={30} />
            </div>

            <div
              style={{
                color: "#60a5fa",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: ".12em",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              Privacy & Data Protection
            </div>

            <h1
              style={{
                fontSize: "clamp(38px, 6vw, 64px)",
                fontWeight: 800,
                letterSpacing: "-.04em",
                marginBottom: "18px",
                background:
                  "linear-gradient(90deg,#fff,#93c5fd,#c4b5fd)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Privacy Policy
            </h1>

            <p
              style={{
                maxWidth: "720px",
                margin: "0 auto",
                color: "#ffffff",
                fontSize: "16px",
                lineHeight: 1.8,
              }}
            >
              This Privacy Policy explains how HireSmart AI collects, uses,
              stores, processes, and protects information when you use our
              website, applications, AI interview tools, resume analysis
              services, and related features.
            </p>

            <div
              style={{
                marginTop: "20px",
                color: "#ffffff",
                fontSize: "13px",
              }}
            >
              Last Updated: {lastUpdated}
            </div>
          </div>
        </section>

        <div className="container">
          {/* Important Notice */}
          <div
            style={{
              padding: "18px 20px",
              marginBottom: "45px",
              borderRadius: "14px",
              background: "rgba(37,99,235,.07)",
              border: "1px solid rgba(96,165,250,.18)",
              color: "#cbd5e1",
              fontSize: "14px",
              lineHeight: 1.75,
            }}
          >
            <strong style={{ color: "#fff" }}>
              Please read this policy carefully.
            </strong>{" "}
            By using HireSmart AI, you acknowledge that your information may
            be processed as described below. Where applicable, we will obtain
            consent or rely on another lawful basis before processing personal
            data.
          </div>

          <div className="row g-4">
            {/* Sidebar */}
          

            {/* Content */}
            <div className="col-lg-12">
              <div
                style={{
                  padding: "35px",
                  borderRadius: "22px",
                  background: "#0b1224",
                  border: "1px solid rgba(148,163,184,.10)",
                  boxShadow: "0 25px 80px rgba(0,0,0,.22)",
                }}
              >
                {/* 1 */}
                <Section id="overview" number="01" title="Overview">
                  <p>
                    HireSmart AI is an AI-powered career and interview
                    preparation platform designed to help users practice
                    interviews, analyze resumes, prepare for job roles,
                    receive AI-generated feedback, and track interview
                    performance.
                  </p>

                  <p>
                    This policy applies to information collected through the
                    HireSmart AI website, user accounts, interview
                    functionality, resume analysis features, enquiry forms,
                    and other services that link to this Privacy Policy.
                  </p>

                  <p>
                    In this policy, "HireSmart AI", "we", "our", and "us" refer
                    to the operator of the HireSmart AI service.
                  </p>

                  <div
                    className="row g-3 mt-2"
                  >
                    <div className="col-md-4">
                      <InfoCard
                        icon={<FaUserShield />}
                        title="Account Data"
                      >
                        Information needed to create and manage your account.
                      </InfoCard>
                    </div>

                    <div className="col-md-4">
                      <InfoCard
                        icon={<FaDatabase />}
                        title="Career Data"
                      >
                        Resumes, skills, education, experience and job-related
                        information.
                      </InfoCard>
                    </div>

                    <div className="col-md-4">
                      <InfoCard
                        icon={<FaRobot />}
                        title="AI Data"
                      >
                        Interview responses, evaluations, scores and
                        AI-generated feedback.
                      </InfoCard>
                    </div>
                  </div>
                </Section>

                {/* 2 */}
                <Section
                  id="information"
                  number="02"
                  title="Information We Collect"
                >
                  <p>
                    The information we collect depends on the features you use.
                    We aim to collect information that is reasonably necessary
                    to provide and improve the service.
                  </p>

                  <div className="table-responsive">
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        minWidth: "650px",
                        marginTop: "20px",
                      }}
                    >
                      <thead>
                        <tr>
                          {[
                            "Category",
                            "Examples",
                            "Why We Need It",
                          ].map((heading) => (
                            <th
                              key={heading}
                              style={{
                                textAlign: "left",
                                padding: "14px",
                                color: "#fff",
                                fontSize: "13px",
                                background: "rgba(30,41,59,.7)",
                                borderBottom:
                                  "1px solid rgba(148,163,184,.12)",
                              }}
                            >
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        <tr>
                          <td style={cellStyle}>Account</td>
                          <td style={cellStyle}>
                            Name, email, phone number, authentication
                            information and profile details.
                          </td>
                          <td style={cellStyle}>
                            Account creation, authentication and profile
                            management.
                          </td>
                        </tr>

                        <tr>
                          <td style={cellStyle}>Resume & Career</td>
                          <td style={cellStyle}>
                            Resume/CV, education, skills, projects, work
                            experience and career preferences.
                          </td>
                          <td style={cellStyle}>
                            Resume analysis, interview preparation and career
                            personalization.
                          </td>
                        </tr>

                        <tr>
                          <td style={cellStyle}>Job Information</td>
                          <td style={cellStyle}>
                            Job descriptions, target job roles and related
                            information.
                          </td>
                          <td style={cellStyle}>
                            Role-specific questions and preparation.
                          </td>
                        </tr>

                        <tr>
                          <td style={cellStyle}>Interview Data</td>
                          <td style={cellStyle}>
                            Questions, answers, scores, feedback and interview
                            history.
                          </td>
                          <td style={cellStyle}>
                            AI evaluation and performance tracking.
                          </td>
                        </tr>

                        <tr>
                          <td style={cellStyle}>Communications</td>
                          <td style={cellStyle}>
                            Enquiries, support requests and notification
                            preferences.
                          </td>
                          <td style={cellStyle}>
                            Customer support and service communications.
                          </td>
                        </tr>

                        <tr>
                          <td style={cellStyle}>Technical</td>
                          <td style={cellStyle}>
                            IP address, browser/device information, logs and
                            similar technical information where collected.
                          </td>
                          <td style={cellStyle}>
                            Security, troubleshooting and service operation.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <p style={{ marginTop: "20px" }}>
                    <strong style={{ color: "#e2e8f0" }}>
                      Sensitive information:
                    </strong>{" "}
                    Please do not upload sensitive personal information into
                    your resume or interview responses unless it is necessary
                    for your intended use of the service. If your platform
                    begins intentionally collecting sensitive categories,
                    this policy and the underlying data flows should be
                    reviewed and updated accordingly.
                  </p>
                </Section>

                {/* 3 */}
                <Section
                  id="usage"
                  number="03"
                  title="How We Use Your Information"
                >
                  <p>Depending on the features you use, we may process your information to:</p>

                  <ul>
                    <li>Create and maintain your HireSmart AI account.</li>
                    <li>Authenticate users and protect accounts.</li>
                    <li>Provide AI-powered mock interviews.</li>
                    <li>Generate role-specific interview questions.</li>
                    <li>Analyze resumes and identify relevant skills.</li>
                    <li>Compare resumes with job descriptions where that feature is enabled.</li>
                    <li>Evaluate interview responses and generate feedback.</li>
                    <li>Calculate and display interview or resume-analysis results.</li>
                    <li>Maintain interview and performance history.</li>
                    <li>Respond to enquiries and support requests.</li>
                    <li>Send OTPs, transactional emails and service notifications.</li>
                    <li>Detect, prevent and investigate security or abuse.</li>
                    <li>Maintain, troubleshoot and improve the platform.</li>
                    <li>Comply with applicable legal obligations.</li>
                  </ul>
                </Section>

                {/* 4 */}
                <Section
                  id="ai"
                  number="04"
                  title="AI & Automated Processing"
                >
                  <p>
                    AI is a core part of HireSmart AI. Certain information you
                    provide may be processed by AI systems to provide the
                    requested functionality.
                  </p>

                  <div className="row g-3 mt-2">
                    <div className="col-md-6">
                      <InfoCard
                        icon={<FaRobot />}
                        title="Resume Analysis"
                      >
                        Your resume may be processed to identify skills,
                        experience, education, projects and other career
                        information relevant to the analysis you request.
                      </InfoCard>
                    </div>

                    <div className="col-md-6">
                      <InfoCard
                        icon={<FaRobot />}
                        title="Interview Generation"
                      >
                        Your selected job role, resume and/or job description
                        may be used to generate interview questions.
                      </InfoCard>
                    </div>

                    <div className="col-md-6">
                      <InfoCard
                        icon={<FaRobot />}
                        title="Interview Evaluation"
                      >
                        Your submitted interview answers may be processed to
                        generate scores, observations and personalized
                        feedback.
                      </InfoCard>
                    </div>

                    <div className="col-md-6">
                      <InfoCard
                        icon={<FaRobot />}
                        title="Personalization"
                      >
                        Your previous interview or resume information may be
                        used to personalize preparation features where
                        supported.
                      </InfoCard>
                    </div>
                  </div>

                  <p style={{ marginTop: "20px" }}>
                    AI-generated results are intended to assist with interview
                    preparation and career development. They should not be
                    treated as guaranteed employment decisions, professional
                    advice, or factual conclusions about a person's
                    qualifications.
                  </p>

                  <p>
                    Where third-party AI providers are used, relevant data may
                    be transmitted to those providers as necessary to perform
                    the requested AI functionality. Your production vendor
                    list should be kept accurate and reflected in this policy.
                  </p>
                </Section>

                {/* 5 */}
                <Section
                  id="sharing"
                  number="05"
                  title="How We Share Information"
                >
                  <p>
                    We do not intend to sell your personal information as a
                    standalone commercial product. We may disclose information
                    when necessary to operate the platform or comply with
                    applicable law.
                  </p>

                  <ul>
                    <li>
                      <strong style={{ color: "#e2e8f0" }}>
                        Service providers:
                      </strong>{" "}
                      hosting, databases, email delivery, authentication,
                      storage, analytics and other infrastructure providers.
                    </li>

                    <li>
                      <strong style={{ color: "#e2e8f0" }}>
                        AI providers:
                      </strong>{" "}
                      AI/API providers used to provide resume analysis,
                      question generation or interview evaluation.
                    </li>

                    <li>
                      <strong style={{ color: "#e2e8f0" }}>
                        Authentication providers:
                      </strong>{" "}
                      providers such as Google where you choose social login.
                    </li>

                    <li>
                      <strong style={{ color: "#e2e8f0" }}>
                        Email providers:
                      </strong>{" "}
                      providers used to send OTPs, notifications and
                      transactional messages.
                    </li>

                    <li>
                      <strong style={{ color: "#e2e8f0" }}>
                        Legal or regulatory authorities:
                      </strong>{" "}
                      where disclosure is required by applicable law, legal
                      process or a valid governmental request.
                    </li>

                    <li>
                      <strong style={{ color: "#e2e8f0" }}>
                        Business transfers:
                      </strong>{" "}
                      information may be transferred as part of a merger,
                      acquisition, restructuring or sale of relevant assets,
                      subject to applicable requirements.
                    </li>
                  </ul>
                </Section>

                {/* 6 */}
                <Section
                  id="storage"
                  number="06"
                  title="Data Storage & Retention"
                >
                  <p>
                    HireSmart AI uses application databases and infrastructure
                    to store information required to provide the service.
                  </p>

                  <p>
                    We retain personal information only for as long as
                    reasonably necessary for the purposes described in this
                    policy, including account operation, requested features,
                    security, dispute resolution, legal obligations and
                    legitimate operational requirements.
                  </p>

                  <p>
                    Exact retention periods may differ depending on the type of
                    information and the feature involved.
                  </p>

                  <div
                    style={{
                      padding: "18px",
                      borderRadius: "12px",
                      background: "rgba(245,158,11,.06)",
                      border: "1px solid rgba(245,158,11,.16)",
                      color: "#cbd5e1",
                      marginTop: "18px",
                    }}
                  >
                    <strong style={{ color: "#fbbf24" }}>
                      Production requirement:
                    </strong>{" "}
                    Before publishing this policy, define your actual retention
                    periods for accounts, resumes, interview history, OTP
                    records, logs, backups and deleted accounts.
                  </div>
                </Section>

                {/* 7 */}
                <Section id="security" number="07" title="Data Security">
                  <p>
                    We use reasonable technical and organizational measures
                    designed to protect personal information against
                    unauthorized access, alteration, disclosure or destruction.
                  </p>

                  <p>
                    Depending on the specific service architecture, security
                    measures may include authentication controls, access
                    restrictions, encrypted connections, secure credential
                    handling, logging and infrastructure protections.
                  </p>

                  <p>
                    However, no internet service or electronic storage system
                    can be guaranteed to be completely secure.
                  </p>

                  <p>
                    If you believe your account or personal information has
                    been compromised, contact us promptly using the details
                    below.
                  </p>
                </Section>

                {/* 8 */}
                <Section
                  id="cookies"
                  number="08"
                  title="Cookies & Local Storage"
                >
                  <p>
                    HireSmart AI may use browser storage technologies such as
                    cookies, local storage or session storage depending on how
                    authentication, preferences and application functionality
                    are implemented.
                  </p>

                  <p>These technologies may be used to:</p>

                  <ul>
                    <li>Maintain authentication sessions.</li>
                    <li>Remember application preferences.</li>
                    <li>Maintain security-related information.</li>
                    <li>Improve application functionality.</li>
                    <li>Understand service usage where analytics are enabled.</li>
                  </ul>

                  <p>
                    The exact technologies used by the production application
                    should be reviewed and listed here before launch.
                  </p>
                </Section>

                {/* 9 */}
                <Section
                  id="rights"
                  number="09"
                  title="Your Privacy Rights"
                >
                  <p>
                    Depending on your location and applicable law, you may have
                    rights relating to your personal information.
                  </p>

                  <div
                    className="row g-3 mt-2"
                  >
                    {[
                      "Request access to personal information.",
                      "Request correction of inaccurate information.",
                      "Request deletion where applicable.",
                      "Withdraw consent where processing is based on consent.",
                      "Request information about processing of your data.",
                      "Raise a privacy-related complaint or grievance.",
                    ].map((item) => (
                      <div className="col-md-6" key={item}>
                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            padding: "14px",
                            borderRadius: "11px",
                            background: "rgba(15,23,42,.55)",
                            border:
                              "1px solid rgba(148,163,184,.10)",
                          }}
                        >
                          <FaCheckCircle
                            style={{
                              color: "#60a5fa",
                              marginTop: "4px",
                              flexShrink: 0,
                            }}
                          />

                          <span>{item}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p style={{ marginTop: "20px" }}>
                    To make a privacy request, contact us at the privacy
                    contact address provided below. We may need to verify your
                    identity before completing certain requests.
                  </p>

                  <p>
                    Rights and request procedures may differ depending on your
                    location and applicable law. For users in India, our
                    processes should be aligned with applicable requirements
                    under the Digital Personal Data Protection framework.
                  </p>
                </Section>

                {/* 10 */}
                <Section
                  id="children"
                  number="10"
                  title="Children's Privacy"
                >
                  <p>
                    HireSmart AI is intended for users who are legally able to
                    use the service under applicable law.
                  </p>

                  <p>
                    We do not knowingly design the service to collect personal
                    information from children in circumstances where such
                    collection is prohibited by applicable law.
                  </p>

                  <p>
                    If you believe that a child has provided personal
                    information to us inappropriately, please contact us so
                    that we can review the situation and take appropriate
                    action.
                  </p>
                </Section>

                {/* 11 */}
                <Section
                  id="transfers"
                  number="11"
                  title="International Data Transfers"
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "15px",
                      padding: "18px",
                      marginBottom: "18px",
                      borderRadius: "14px",
                      background: "rgba(59,130,246,.06)",
                      border: "1px solid rgba(96,165,250,.13)",
                    }}
                  >
                    <FaGlobe
                      style={{
                        color: "#60a5fa",
                        marginTop: "4px",
                        flexShrink: 0,
                      }}
                    />

                    <div>
                      <strong style={{ color: "#fff" }}>
                        Global infrastructure
                      </strong>

                      <p style={{ margin: "6px 0 0" }}>
                        Some service providers used by HireSmart AI may process
                        information in countries other than your own. Where
                        applicable, we will use appropriate safeguards required
                        by applicable data-protection law.
                      </p>
                    </div>
                  </div>

                  <p>
                    The actual countries and third-party providers used by the
                    production system should be documented and reflected in
                    this section.
                  </p>
                </Section>

                {/* 12 */}
                <Section
                  id="changes"
                  number="12"
                  title="Changes to This Privacy Policy"
                >
                  <p>
                    We may update this Privacy Policy when our services,
                    technology, data-processing practices or legal obligations
                    change.
                  </p>

                  <p>
                    When we make material changes, we may update the "Last
                    Updated" date and, where appropriate, provide additional
                    notice through the service or other reasonable
                    communication channels.
                  </p>
                </Section>

                {/* 13 */}
                <Section id="contact" number="13" title="Contact Us">
                  <p>
                    If you have questions, requests or concerns about this
                    Privacy Policy or the processing of your personal
                    information, contact HireSmart AI:
                  </p>

                  <div
                    style={{
                      marginTop: "20px",
                      padding: "24px",
                      borderRadius: "16px",
                      background:
                        "linear-gradient(135deg, rgba(37,99,235,.10), rgba(124,58,237,.08))",
                      border:
                        "1px solid rgba(96,165,250,.16)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "14px",
                      }}
                    >
                      <FaEnvelope style={{ color: "#60a5fa" }} />

                      <strong style={{ color: "#fff" }}>
                        Privacy & Support
                      </strong>
                    </div>

                    <a
                      href="mailto:support@hiresmart.ai"
                      style={{
                        color: "#93c5fd",
                        textDecoration: "none",
                        fontSize: "15px",
                      }}
                    >
                      support@hiresmart.ai
                    </a>

                    <p
                      style={{
                        marginTop: "12px",
                        marginBottom: 0,
                        color: "#64748b",
                        fontSize: "13px",
                      }}
                    >
                      Replace this contact information with your actual legal
                      entity and designated privacy/grievance contact before
                      production launch.
                    </p>
                  </div>
                </Section>

                {/* Final card */}
                <div
                  style={{
                    padding: "24px",
                    borderRadius: "16px",
                    background: "rgba(15,23,42,.65)",
                    border: "1px solid rgba(148,163,184,.12)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "14px",
                      alignItems: "flex-start",
                    }}
                  >
                    <FaLock
                      style={{
                        color: "#60a5fa",
                        marginTop: "4px",
                        flexShrink: 0,
                      }}
                    />

                    <div>
                      <h3
                        style={{
                          color: "#fff",
                          fontSize: "16px",
                          marginBottom: "7px",
                        }}
                      >
                        Your data matters
                      </h3>

                      <p
                        style={{
                          margin: 0,
                          color: "#94a3b8",
                          fontSize: "14px",
                          lineHeight: 1.7,
                        }}
                      >
                        HireSmart AI is designed to give users greater
                        visibility and control over how their career and
                        interview information is used within the platform.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

    {/* Footer */}
      <LandingFooter />
    </div>
  );
};

const cellStyle = {
  padding: "14px",
  color: "#94a3b8",
  fontSize: "13px",
  lineHeight: 1.65,
  verticalAlign: "top",
  borderBottom: "1px solid rgba(148,163,184,.10)",
};

export default Privacy;