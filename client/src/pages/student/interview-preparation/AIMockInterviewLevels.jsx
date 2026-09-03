import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import StudentLayout from '../../../components/StudentLayout';

import {
  FaRobot,
  FaArrowRight,
  FaCheckCircle,
  FaStar,
  FaLock,
  FaCrown,
  FaTimes,
  FaPlay,
} from 'react-icons/fa';

const LEVEL_DESCRIPTIONS = [
  'Basic / Fundamental Questions',
  'Basic + Easy Practical Questions',
  'Intermediate Questions',
  'Intermediate Practical Questions',
  'Intermediate + Advanced Practical Questions',
  'Advanced Role-Specific Questions',
  'Advanced Scenario / Problem-Solving Questions',
  'Complex Technical / Role-Specific Questions',
  'Advanced Real-World Scenarios',
  'Expert-Level Challenging Questions',
];

const AIMockInterviewLevels = () => {
  const navigate = useNavigate();

  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedLockedLevel, setSelectedLockedLevel] = useState(null);

  // Dynamically generate 10 interview levels
  const levels = Array.from({ length: 10 }, (_, index) => {
    const level = index + 1;
    const questionCount = 10 + (level - 1) * 5;

    return {
      level,
      questionCount,
      description:
        LEVEL_DESCRIPTIONS[index] || `Level ${level} Interview`,
      isFree: level === 1,
    };
  });

  // Level 1 = Free
  // Level 2-10 = Premium
  const handleSelectLevel = (levelObj) => {
    if (levelObj.level === 1) {
      navigate(
        `/student/interview-preparation/ai-mock/setup?level=${levelObj.level}&questions=${levelObj.questionCount}`
      );
      return;
    }

    // Show premium popup for locked levels
    setSelectedLockedLevel(levelObj);
    setShowPremiumModal(true);
  };

  const closePremiumModal = () => {
    setShowPremiumModal(false);
    setSelectedLockedLevel(null);
  };

  return (
    <StudentLayout>
      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="text-center mb-5">
        <span
          className="badge px-3 py-2 rounded-pill mb-3 fw-semibold"
          style={{
            backgroundColor: '#EEF2FF',
            color: '#4F46E5',
            border: '1px solid #C7D2FE',
          }}
        >
          <FaRobot className="me-2" />
          Personalized AI Mock Interview
        </span>

        <h2 className="fw-bold text-dark mb-2">
          AI Mock Interview
        </h2>

        <h5 className="text-primary fw-bold mb-3">
          Select Interview Level
        </h5>

        <p
          className="text-muted small mx-auto mb-0"
          style={{ maxWidth: '650px', lineHeight: '1.7' }}
        >
          Start with our free Level 1 interview or unlock advanced
          interview levels for deeper preparation.
        </p>
      </div>

      {/* =====================================================
          FREE LEVEL INFO
      ===================================================== */}
      <div
        className="mb-4 p-3 d-flex align-items-center gap-3"
        style={{
          backgroundColor: '#ECFDF5',
          border: '1px solid #A7F3D0',
          borderRadius: '14px',
        }}
      >
        <div
          className="d-flex align-items-center justify-content-center flex-shrink-0"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            backgroundColor: '#10B981',
            color: '#fff',
          }}
        >
          <FaCheckCircle />
        </div>

        <div>
          <div
            className="fw-bold"
            style={{ color: '#065F46' }}
          >
            Level 1 is completely FREE
          </div>

          <small style={{ color: '#047857' }}>
            Try the AI Mock Interview before upgrading to premium
            levels.
          </small>
        </div>
      </div>

      {/* =====================================================
          LEVEL CARDS
      ===================================================== */}
      <div className="row g-4">
        {levels.map((item) => (
          <div
            key={item.level}
            className="col-xl-4 col-md-6"
          >
            <div
              className="card h-100 border-0 shadow-sm d-flex flex-column"
              style={{
                borderRadius: '18px',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                opacity: item.isFree ? 1 : 0.94,
              }}
            >
              {/* TOP STRIP */}
              <div
                style={{
                  height: '5px',
                  background: item.isFree
                    ? 'linear-gradient(90deg, #10B981, #059669)'
                    : 'linear-gradient(90deg, #6366F1, #7C3AED)',
                }}
              />

              <div className="card-body p-4 d-flex flex-column">

                {/* =================================================
                    CARD HEADER
                ================================================= */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span
                    className="badge px-3 py-2 fw-bold"
                    style={{
                      backgroundColor: item.isFree
                        ? '#10B981'
                        : '#4F46E5',
                      color: '#fff',
                      borderRadius: '8px',
                    }}
                  >
                    Level {item.level}
                  </span>

                  {item.isFree ? (
                    <span
                      className="badge px-3 py-2 fw-bold"
                      style={{
                        backgroundColor: '#ECFDF5',
                        color: '#059669',
                        border: '1px solid #A7F3D0',
                        borderRadius: '8px',
                      }}
                    >
                      <FaCheckCircle className="me-1" />
                      FREE
                    </span>
                  ) : (
                    <span
                      className="badge px-3 py-2 fw-bold"
                      style={{
                        backgroundColor: '#F5F3FF',
                        color: '#7C3AED',
                        border: '1px solid #DDD6FE',
                        borderRadius: '8px',
                      }}
                    >
                      <FaLock className="me-1" />
                      PREMIUM
                    </span>
                  )}
                </div>

                {/* =================================================
                    TITLE
                ================================================= */}
                <h5 className="fw-bold text-dark mb-2">
                  Level {item.level} AI Interview
                </h5>

                <p className="text-muted small mb-4">
                  {item.description}
                </p>

                {/* =================================================
                    QUESTION COUNT
                ================================================= */}
                <div
                  className="p-3 mb-4"
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="small text-muted">
                      Interview Questions
                    </span>

                    <span className="fw-bold text-dark">
                      {item.questionCount}
                    </span>
                  </div>
                </div>

                {/* =================================================
                    BUTTON
                ================================================= */}
                <div className="mt-auto">
                  {item.isFree ? (
                    <button
                      type="button"
                      className="btn btn-success w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                      onClick={() =>
                        handleSelectLevel(item)
                      }
                      style={{
                        borderRadius: '10px',
                      }}
                    >
                      <FaPlay size={14} />
                      Start Free Interview
                      <FaArrowRight size={13} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                      onClick={() =>
                        handleSelectLevel(item)
                      }
                      style={{
                        borderRadius: '10px',
                        backgroundColor: '#F3F4F6',
                        color: '#4B5563',
                        border: '1px solid #D1D5DB',
                      }}
                    >
                      <FaLock size={13} />
                      Unlock Level {item.level}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* =====================================================
          PREMIUM POPUP
      ===================================================== */}
      {showPremiumModal && selectedLockedLevel && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            zIndex: 1050,
            padding: '20px',
          }}
          onClick={closePremiumModal}
        >
          <div
            className="bg-white shadow-lg"
            style={{
              width: '100%',
              maxWidth: '480px',
              borderRadius: '22px',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div
              className="p-4 text-center"
              style={{
                background:
                  'linear-gradient(135deg, #312E81, #6D28D9)',
                color: '#fff',
              }}
            >
              <button
                type="button"
                className="btn btn-sm position-absolute"
                onClick={closePremiumModal}
                style={{
                  right: '15px',
                  top: '15px',
                  color: '#fff',
                  border: 'none',
                }}
              >
                <FaTimes />
              </button>

              <div
                className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '18px',
                  backgroundColor:
                    'rgba(255,255,255,0.15)',
                }}
              >
                <FaCrown
                  className="fs-2"
                  style={{ color: '#FDE68A' }}
                />
              </div>

              <h4 className="fw-bold mb-1 text-white">
                Premium Level Locked
              </h4>

              <p className="mb-0 text-white-50 small">
                Level {selectedLockedLevel.level} requires
                Premium access.
              </p>
            </div>

            {/* MODAL BODY */}
            <div className="p-4 text-center">
              <h5 className="fw-bold text-dark mb-2">
                Unlock Level {selectedLockedLevel.level}
              </h5>

              <p
                className="text-muted small mb-4"
                style={{ lineHeight: '1.7' }}
              >
                Get access to advanced AI mock interviews,
                real-world scenarios and progressively harder
                questions designed for serious interview
                preparation.
              </p>

              {/* FEATURES */}
              <div
                className="text-start p-3 mb-4"
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div className="d-flex align-items-center gap-2 mb-2">
                  <FaCheckCircle className="text-success" />
                  <span className="small fw-semibold">
                    Advanced interview questions
                  </span>
                </div>

                <div className="d-flex align-items-center gap-2 mb-2">
                  <FaCheckCircle className="text-success" />
                  <span className="small fw-semibold">
                    Role-specific AI questions
                  </span>
                </div>

                <div className="d-flex align-items-center gap-2 mb-2">
                  <FaCheckCircle className="text-success" />
                  <span className="small fw-semibold">
                    Real-world scenarios
                  </span>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <FaCheckCircle className="text-success" />
                  <span className="small fw-semibold">
                    Higher difficulty levels
                  </span>
                </div>
              </div>

              {/* BUY BUTTON */}
              <button
                type="button"
                className="btn btn-primary w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                onClick={() => {
                  // TODO:
                  // Replace this with your actual payment/
                  // subscription page route.
                  navigate('/student/subscription');
                }}
                style={{
                  borderRadius: '11px',
                }}
              >
                <FaCrown />
                Buy Premium Access
                <FaArrowRight size={14} />
              </button>

              <button
                type="button"
                className="btn btn-link text-muted mt-2 small text-decoration-none"
                onClick={closePremiumModal}
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  );
};

export default AIMockInterviewLevels;