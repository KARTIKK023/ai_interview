import React from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../../../components/StudentLayout';
import { FaRobot, FaLayerGroup, FaArrowRight, FaCheckCircle, FaStar } from 'react-icons/fa';

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
  'Expert-Level Challenging Questions'
];

const AIMockInterviewLevels = () => {
  const navigate = useNavigate();

  // Dynamically generate 10 interview levels
  const levels = Array.from({ length: 10 }, (_, index) => {
    const level = index + 1;
    const questionCount = 10 + (level - 1) * 5;
    return {
      level,
      questionCount,
      description: LEVEL_DESCRIPTIONS[index] || `Level ${level} Interview`
    };
  });

  const handleSelectLevel = (levelObj) => {
    navigate(`/student/interview-preparation/ai-mock/setup?level=${levelObj.level}&questions=${levelObj.questionCount}`);
  };

  return (
    <StudentLayout>
      {/* Header */}
      <div className="text-center mb-5">
        <span className="badge bg-primary bg-opacity-10 text-primary border border-primary px-3 py-2 rounded-pill mb-2 fw-semibold">
          <FaRobot className="me-1" /> Personalized AI Mock Interview
        </span>
        <h2 className="fw-extrabold text-dark mb-2">AI Mock Interview</h2>
        <h5 className="text-primary fw-bold mb-3">Select Interview Level</h5>
        <p className="text-muted small mx-auto" style={{ maxWidth: '650px' }}>
          Choose your difficulty level below. Questions will be dynamically auto-generated based on your saved target job roles!
        </p>
      </div>

      <div className="row g-4">
        {levels.map((item) => (
          <div key={item.level} className="col-xl-4 col-md-6">
            <div className="card card-custom p-4 bg-white shadow-sm border-0 h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="badge bg-primary px-3 py-2 fs-6 fw-bold">
                    Level {item.level}
                  </span>
                  <span className="badge bg-light text-dark border px-3 py-2">
                    {item.questionCount} Questions
                  </span>
                </div>
                <h5 className="fw-bold text-dark mb-2">Level {item.level} AI Interview</h5>
                <p className="text-muted small mb-4">
                  {item.description}
                </p>
              </div>

              <button
                className="btn btn-primary w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                onClick={() => handleSelectLevel(item)}
              >
                Start Level {item.level} <FaArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </StudentLayout>
  );
};

export default AIMockInterviewLevels;
