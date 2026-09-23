import React from "react";
import { Link } from "react-router-dom";
import {
  FaRobot,
  FaArrowLeft,
  FaFileContract,
  FaUserCheck,
  FaBan,
  FaExclamationTriangle,
  FaCopyright,
  FaCloud,
  FaLock,
  FaEnvelope,
  FaCheckCircle,
} from "react-icons/fa";

import LandingFooter from "./LandingFooter";

const TermsSection = ({ id, number, title, children }) => {
  return (
    <section
      id={id}
      style={{
        marginBottom: "42px",
        paddingBottom: "40px",
        borderBottom:
          "1px solid rgba(148,163,184,.10)",
        scrollMarginTop: "100px",
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
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(59,130,246,.12)",
            border:
              "1px solid rgba(59,130,246,.22)",
            color: "#60a5fa",
            fontSize: "13px",
            fontWeight: 700,
            flexShrink: 0,
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
};

const InfoCard = ({ icon, title, children }) => {
  return (
    <div
      style={{
        height: "100%",
        padding: "22px",
        borderRadius: "16px",
        background: "rgba(15,23,42,.55)",
        border:
          "1px solid rgba(96,165,250,.12)",
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
          marginBottom: "14px",
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

      <p
        style={{
          color: "#94a3b8",
          fontSize: "13px",
          lineHeight: 1.7,
          margin: 0,
        }}
      >
        {children}
      </p>
    </div>
  );
};

const Terms = () => {
  const lastUpdated = "September 23, 2026";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "#fff",
        overflow: "hidden",
      }}
    >
      {/* Background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          opacity: 0.12,
          backgroundImage:
            "linear-gradient(rgba(59,130,246,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,.12) 1px, transparent 1px)",
          backgroundSize: "55px 55px",
        }}
      />

      {/* Navbar */}
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
            justifyContent: "space-between",
            background: "rgba(2,6,23,.78)",
            backdropFilter: "blur(25px)",
            border:
              "1px solid rgba(96,165,250,.22)",
            boxShadow:
              "0 15px 50px rgba(0,0,0,.35)",
          }}
        >
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
                  "0 0 30px rgba(6,182,212,.25)",
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

          <Link
            to="/"
            className="text-decoration-none"
            style={{
              color: "#94a3b8",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaArrowLeft size={12} />
            Back to Home
          </Link>
        </nav>
      </div>

      {/* Main */}
      <main
        style={{
          position: "relative",
          zIndex: 2,
          paddingBottom: "80px",
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
                border:
                  "1px solid rgba(96,165,250,.25)",
                color: "#60a5fa",
              }}
            >
              <FaFileContract size={30} />
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
              Legal
            </div>

            <h1
              style={{
                fontSize: "clamp(40px,6vw,64px)",
                fontWeight: 800,
                letterSpacing: "-.04em",
                marginBottom: "18px",
                background:
                  "linear-gradient(90deg,#fff,#93c5fd,#c4b5fd)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Terms of Service
            </h1>

            <p
              style={{
                maxWidth: "760px",
                margin: "0 auto",
                color: "#ffffff",
                fontSize: "16px",
                lineHeight: 1.8,
              }}
            >
              These Terms of Service explain the rules that apply when
              you access or use HireSmart AI, including our AI-powered
              interview preparation, resume analysis, evaluation,
              coaching, and related services.
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
          {/* Important notice */}
          <div
            style={{
              padding: "18px 20px",
              marginBottom: "45px",
              borderRadius: "14px",
              background: "rgba(59,130,246,.06)",
              border:
                "1px solid rgba(96,165,250,.18)",
              color: "#cbd5e1",
              fontSize: "14px",
              lineHeight: 1.75,
            }}
          >
            <strong style={{ color: "#fff" }}>
              Please read these Terms carefully.
            </strong>{" "}
            By accessing or using HireSmart AI, you agree to comply
            with these Terms and any additional terms presented for
            specific features or services.
          </div>

          <div className="row">
            <div className="col-12">
              <div
                style={{
                  padding: "40px",
                  borderRadius: "22px",
                  background: "rgba(2,6,23,.72)",
                  border:
                    "1px solid rgba(148,163,184,.10)",
                  boxShadow:
                    "0 25px 80px rgba(0,0,0,.22)",
                }}
              >
                {/* 01 */}
                <TermsSection
                  id="acceptance"
                  number="01"
                  title="Acceptance of Terms"
                >
                  <p>
                    These Terms of Service form an agreement between you
                    and the operator of HireSmart AI. By creating an
                    account, accessing the platform, or using any
                    HireSmart AI feature, you acknowledge that you have
                    read and understood these Terms and agree to follow
                    them.
                  </p>

                  <p>
                    If you do not agree with these Terms, you should not
                    use the service.
                  </p>
                </TermsSection>

                {/* 02 */}
                <TermsSection
                  id="service"
                  number="02"
                  title="About HireSmart AI"
                >
                  <p>
                    HireSmart AI is an AI-powered career and interview
                    preparation platform. Depending on the features
                    available to you, the service may provide:
                  </p>

                  <div className="row g-3 mt-2">
                    <div className="col-md-4">
                      <InfoCard
                        icon={<FaRobot />}
                        title="AI Mock Interviews"
                      >
                        Practice role-specific interview scenarios
                        using AI-generated questions and responses.
                      </InfoCard>
                    </div>

                    <div className="col-md-4">
                      <InfoCard
                        icon={<FaFileContract />}
                        title="Resume Analysis"
                      >
                        Review resumes and provide career-related
                        analysis or improvement suggestions.
                      </InfoCard>
                    </div>

                    <div className="col-md-4">
                      <InfoCard
                        icon={<FaCheckCircle />}
                        title="AI Evaluation"
                      >
                        Generate interview feedback, performance
                        scores, and improvement suggestions.
                      </InfoCard>
                    </div>
                  </div>
                </TermsSection>

                {/* 03 */}
                <TermsSection
                  id="eligibility"
                  number="03"
                  title="Eligibility & Accounts"
                >
                  <p>
                    You are responsible for providing accurate information
                    when creating or maintaining your account.
                  </p>

                  <ul>
                    <li>
                      You must provide information that is accurate and
                      reasonably up to date.
                    </li>

                    <li>
                      You are responsible for keeping your login
                      credentials secure.
                    </li>

                    <li>
                      You are responsible for activity performed through
                      your authenticated account.
                    </li>

                    <li>
                      You must promptly notify us if you believe your
                      account has been accessed without authorization.
                    </li>
                  </ul>

                  <p>
                    We may require account verification, including email
                    or OTP verification, for security and authentication
                    purposes.
                  </p>
                </TermsSection>

                {/* 04 */}
                <TermsSection
                  id="ai"
                  number="04"
                  title="AI-Generated Results"
                >
                  <div
                    style={{
                      padding: "20px",
                      borderRadius: "14px",
                      background:
                        "rgba(124,58,237,.07)",
                      border:
                        "1px solid rgba(124,58,237,.16)",
                      marginBottom: "18px",
                    }}
                  >
                    <strong style={{ color: "#c4b5fd" }}>
                      Important:
                    </strong>{" "}
                    HireSmart AI provides AI-assisted preparation and
                    feedback. AI-generated results are not guarantees of
                    interview success or employment.
                  </div>

                  <p>
                    AI-generated questions, scores, feedback,
                    recommendations, summaries, and other outputs may
                    contain mistakes, omissions, or inaccurate
                    information.
                  </p>

                  <p>
                    You should use your own judgment when reviewing AI
                    outputs and should not treat them as guaranteed
                    professional, employment, legal, financial, or other
                    expert advice.
                  </p>

                  <p>
                    HireSmart AI does not guarantee that a particular
                    score, recommendation, or evaluation represents an
                    actual employer's hiring decision or assessment
                    process.
                  </p>
                </TermsSection>

                {/* 05 */}
                <TermsSection
                  id="user-content"
                  number="05"
                  title="Resume, Job Description & Interview Content"
                >
                  <p>
                    You may provide content such as resumes, job
                    descriptions, interview answers, skills, education,
                    projects, work experience, and other career-related
                    information.
                  </p>

                  <p>
                    You represent that you have the right to provide the
                    content you upload or submit and that doing so does
                    not knowingly violate another person's rights.
                  </p>

                  <p>
                    You should not upload confidential information,
                    passwords, private keys, financial credentials, or
                    other information that is unrelated to your intended
                    use of the service.
                  </p>

                  <p>
                    Your use of personal information submitted through
                    HireSmart AI is also subject to our{" "}
                    <Link
                      to="/privacy"
                      style={{
                        color: "#60a5fa",
                        textDecoration: "none",
                      }}
                    >
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </TermsSection>

                {/* 06 */}
                <TermsSection
                  id="acceptable-use"
                  number="06"
                  title="Acceptable Use"
                >
                  <p>You agree not to:</p>

                  <ul>
                    <li>
                      Use the service for unlawful or fraudulent
                      purposes.
                    </li>

                    <li>
                      Attempt to gain unauthorized access to accounts,
                      systems, APIs, databases, or infrastructure.
                    </li>

                    <li>
                      Interfere with or disrupt the operation of the
                      platform.
                    </li>

                    <li>
                      Reverse engineer, decompile, or attempt to extract
                      source code except where permitted by applicable
                      law.
                    </li>

                    <li>
                      Upload malware, malicious code, or other harmful
                      material.
                    </li>

                    <li>
                      Use automated methods to abuse, overload, scrape,
                      or bypass platform limits without authorization.
                    </li>

                    <li>
                      Misrepresent AI-generated output as guaranteed
                      professional or employer-approved advice.
                    </li>

                    <li>
                      Use the service to infringe intellectual property,
                      privacy, or other rights of another person.
                    </li>
                  </ul>
                </TermsSection>

                {/* 07 */}
                <TermsSection
                  id="intellectual-property"
                  number="07"
                  title="Intellectual Property"
                >
                  <div className="row g-3">
                    <div className="col-md-6">
                      <InfoCard
                        icon={<FaCopyright />}
                        title="HireSmart AI Property"
                      >
                        The HireSmart AI software, branding, design,
                        interface, logos, text, graphics and platform
                        functionality are owned by or licensed to the
                        service operator, unless stated otherwise.
                      </InfoCard>
                    </div>

                    <div className="col-md-6">
                      <InfoCard
                        icon={<FaUserCheck />}
                        title="Your Content"
                      >
                        You retain rights in content you provide,
                        subject to the permissions necessary for us to
                        operate the features you request.
                      </InfoCard>
                    </div>
                  </div>

                  <p style={{ marginTop: "20px" }}>
                    Nothing in these Terms transfers ownership of your
                    original content to HireSmart AI merely because you
                    submit it to the platform.
                  </p>
                </TermsSection>

                {/* 08 */}
                <TermsSection
                  id="third-party"
                  number="08"
                  title="Third-Party Services"
                >
                  <p>
                    HireSmart AI may rely on third-party services for
                    functionality such as authentication, AI processing,
                    databases, hosting, email delivery, storage,
                    analytics, or other infrastructure.
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: "14px",
                      padding: "18px",
                      borderRadius: "13px",
                      background:
                        "rgba(59,130,246,.06)",
                      border:
                        "1px solid rgba(96,165,250,.14)",
                    }}
                  >
                    <FaCloud
                      style={{
                        color: "#60a5fa",
                        marginTop: "4px",
                        flexShrink: 0,
                      }}
                    />

                    <span>
                      Third-party services may have their own terms,
                      privacy policies, and service limitations. Your use
                      of an integrated third-party service may therefore
                      also be subject to that provider's terms.
                    </span>
                  </div>
                </TermsSection>

                {/* 09 */}
                <TermsSection
                  id="availability"
                  number="09"
                  title="Service Availability"
                >
                  <p>
                    We aim to keep HireSmart AI available and reliable,
                    but we do not guarantee uninterrupted or error-free
                    operation.
                  </p>

                  <p>
                    The service may occasionally be unavailable because
                    of maintenance, upgrades, infrastructure problems,
                    third-party service interruptions, security events,
                    or circumstances outside our reasonable control.
                  </p>
                </TermsSection>

                {/* 10 */}
                <TermsSection
                  id="payments"
                  number="10"
                  title="Plans, Payments & Subscriptions"
                >
                  <p>
                    Some HireSmart AI features may be offered for free
                    while others may require payment or a subscription.
                  </p>

                  <p>
                    Where paid services are introduced, the applicable
                    price, billing interval, renewal terms, cancellation
                    rules, and refund conditions will be presented before
                    purchase and may be supplemented by additional
                    purchase terms.
                  </p>

                  <p>
                    Do not publish specific refund or subscription claims
                    here until they match your actual billing system and
                    commercial policy.
                  </p>
                </TermsSection>

                {/* 11 */}
                <TermsSection
                  id="termination"
                  number="11"
                  title="Suspension & Termination"
                >
                  <p>
                    You may stop using HireSmart AI at any time.
                  </p>

                  <p>
                    We may suspend or terminate access when reasonably
                    necessary to protect the platform, users, third
                    parties, or our legal rights, including in cases of
                    suspected abuse, unauthorized access, fraud, or
                    material violation of these Terms.
                  </p>

                  <p>
                    Where appropriate and legally permissible, we may
                    provide notice or an opportunity to resolve a
                    violation before taking action.
                  </p>
                </TermsSection>

                {/* 12 */}
                <TermsSection
                  id="disclaimer"
                  number="12"
                  title="Disclaimers"
                >
                  <div
                    style={{
                      padding: "20px",
                      borderRadius: "14px",
                      background:
                        "rgba(245,158,11,.06)",
                      border:
                        "1px solid rgba(245,158,11,.16)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                      }}
                    >
                      <FaExclamationTriangle
                        style={{
                          color: "#fbbf24",
                          marginTop: "4px",
                          flexShrink: 0,
                        }}
                      />

                      <span>
                        To the extent permitted by applicable law,
                        HireSmart AI is provided for interview and career
                        preparation purposes and is not a promise of
                        employment, interview selection, compensation,
                        promotion, or any particular career outcome.
                      </span>
                    </div>
                  </div>

                  <p style={{ marginTop: "18px" }}>
                    We do not guarantee that information, questions,
                    evaluations, recommendations, or other results will
                    always be complete, accurate, current, or suitable
                    for your particular circumstances.
                  </p>
                </TermsSection>

                {/* 13 */}
                <TermsSection
                  id="liability"
                  number="13"
                  title="Limitation of Liability"
                >
                  <p>
                    To the maximum extent permitted by applicable law,
                    the service operator will not be responsible for
                    indirect, incidental, special, consequential, or
                    similar losses arising from your use of or inability
                    to use the service.
                  </p>

                  <p>
                    Any limitations or exclusions in this section are
                    subject to mandatory rights or remedies that cannot
                    legally be excluded or limited.
                  </p>

                  <p>
                    Before publishing this section, your legal adviser
                    should adapt it to your business structure and
                    applicable jurisdiction.
                  </p>
                </TermsSection>

                {/* 14 */}
                <TermsSection
                  id="indemnity"
                  number="14"
                  title="User Responsibility"
                >
                  <p>
                    You are responsible for your use of HireSmart AI and
                    for information or content you submit to the
                    platform.
                  </p>

                  <p>
                    Where permitted by applicable law, you agree to
                    cooperate with reasonable requests relating to claims
                    arising from your unlawful use of the service or
                    violation of these Terms.
                  </p>
                </TermsSection>

                {/* 15 */}
                <TermsSection
                  id="law"
                  number="15"
                  title="Governing Law & Disputes"
                >
                  <p>
                    These Terms should identify the governing law,
                    jurisdiction, and dispute-resolution process
                    applicable to the legal entity operating HireSmart
                    AI.
                  </p>

                  <div
                    style={{
                      padding: "18px",
                      marginTop: "15px",
                      borderRadius: "12px",
                      background:
                        "rgba(59,130,246,.06)",
                      border:
                        "1px solid rgba(96,165,250,.13)",
                    }}
                  >
                    <strong style={{ color: "#fff" }}>
                      Production placeholder
                    </strong>

                    <p
                      style={{
                        margin: "7px 0 0",
                        color: "#94a3b8",
                      }}
                    >
                      Replace this section with the actual governing
                      law, jurisdiction, registered office, and dispute
                      mechanism after legal review.
                    </p>
                  </div>
                </TermsSection>

                {/* 16 */}
                <TermsSection
                  id="changes"
                  number="16"
                  title="Changes to These Terms"
                >
                  <p>
                    We may update these Terms when our services, features,
                    business practices, or legal obligations change.
                  </p>

                  <p>
                    When changes are made, we may update the "Last
                    Updated" date and, where appropriate, provide
                    additional notice through the platform or other
                    reasonable communication channels.
                  </p>
                </TermsSection>

                {/* 17 */}
                <TermsSection
                  id="contact"
                  number="17"
                  title="Contact Us"
                >
                  <p>
                    Questions about these Terms can be sent to the
                    designated HireSmart AI support or legal contact.
                  </p>

                  <div
                    style={{
                      marginTop: "20px",
                      padding: "22px",
                      borderRadius: "15px",
                      background:
                        "rgba(59,130,246,.07)",
                      border:
                        "1px solid rgba(96,165,250,.16)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "10px",
                      }}
                    >
                      <FaEnvelope
                        style={{ color: "#60a5fa" }}
                      />

                      <strong style={{ color: "#fff" }}>
                        HireSmart AI
                      </strong>
                    </div>

                    <a
                      href="mailto:support@webaitechsolution.com"
                      style={{
                        color: "#93c5fd",
                        textDecoration: "none",
                        fontSize: "14px",
                      }}
                    >
                      support@webaitechsolution.com
                    </a>

                    <p
                      style={{
                        color: "#64748b",
                        fontSize: "12px",
                        marginTop: "12px",
                        marginBottom: 0,
                      }}
                    >
                      Replace this with the appropriate legal/support
                      contact before public production launch.
                    </p>
                  </div>
                </TermsSection>

                {/* Final */}
                <div
                  style={{
                    padding: "24px",
                    borderRadius: "16px",
                    background:
                      "rgba(15,23,42,.55)",
                    border:
                      "1px solid rgba(148,163,184,.12)",
                    textAlign: "center",
                  }}
                >
                  <FaLock
                    style={{
                      color: "#60a5fa",
                      marginBottom: "12px",
                    }}
                    size={22}
                  />

                  <h3
                    style={{
                      color: "#fff",
                      fontSize: "17px",
                      marginBottom: "8px",
                    }}
                  >
                    Use HireSmart AI Responsibly
                  </h3>

                  <p
                    style={{
                      color: "#94a3b8",
                      fontSize: "14px",
                      lineHeight: 1.7,
                      maxWidth: "650px",
                      margin: "0 auto",
                    }}
                  >
                    HireSmart AI is designed to help you practice,
                    learn, evaluate your performance, and become better
                    prepared for interviews.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Reusable Footer */}
      <LandingFooter />
    </div>
  );
};

export default Terms;