import React from 'react';
import ScoreCard from './ScoreCard';
import { FaCheckCircle, FaExclamationTriangle, FaLightbulb, FaRobot, FaTimes } from 'react-icons/fa';

const InterviewReportContent = ({ data, isModal = false, onClose = null }) => {
  if (!data) return null;

  const { interview = {}, answers = [], evaluation = {} } = data;
  const overallScore = evaluation?.overallScore ?? interview.score ?? 0;
  const roleScores = evaluation?.roleSpecificScores || {};

  const candidateName = interview.candidateId?.fullName || interview.candidateId?.name || 'Student Candidate';
  const candidateEmail = interview.candidateId?.email || '';

  return (
    <div className="interview-report-content">
      {/* REPORT HEADER */}
      <div className="card card-custom p-4 mb-4 border-0 shadow-sm rounded-3">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
              <span className="badge bg-primary me-1">{interview.category || 'Technical'} Category</span>
              <span className="badge bg-info text-dark me-1">{interview.jobRole || 'Software Engineer'}</span>
              <span className={`badge ${interview.mode === 'Video' ? 'bg-danger' : 'bg-secondary'} me-1`}>
                {interview.mode || 'Text'} Mode
              </span>
              <span className="badge bg-dark">
                Candidate: {candidateName} {candidateEmail ? `(${candidateEmail})` : ''}
              </span>
            </div>
            <h3 className="fw-extrabold text-dark mt-2 mb-1">Interview Performance Report</h3>
            <p className="text-muted small mb-0">
              Completed on {interview.completedAt ? new Date(interview.completedAt).toLocaleDateString() : (interview.createdAt ? new Date(interview.createdAt).toLocaleDateString() : 'N/A')} • {interview.purpose || 'Practice'} Purpose
            </p>
          </div>

          {isModal && onClose && (
            <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1.5 fw-semibold" onClick={onClose}>
              <FaTimes size={14} /> Close Report
            </button>
          )}
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* OVERALL SCORE & ROLE METRICS */}
        <div className="col-lg-5">
          <ScoreCard title={`${interview.jobRole || 'Interview'} Score`} score={overallScore} criteriaScores={roleScores} />
        </div>

        {/* AI STRENGTHS & IMPROVEMENTS */}
        <div className="col-lg-7">
          <div className="card card-custom p-4 h-100 border-0 shadow-sm rounded-3">
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <FaRobot className="text-primary" /> AI Performance Summary
            </h5>

            <p className="text-dark bg-light p-3 rounded-3 mb-4 italic border-start border-3 border-primary">
              "{evaluation?.summary || 'Candidate completed the interview demonstrating functional role understanding.'}"
            </p>

            <div className="row g-3">
              <div className="col-md-6">
                <div className="p-3 bg-success bg-opacity-10 rounded-3 border border-success h-100">
                  <h6 className="fw-bold text-success mb-2 d-flex align-items-center gap-2">
                    <FaCheckCircle /> Strengths
                  </h6>
                  <ul className="mb-0 ps-3 small text-dark">
                    {(evaluation?.strengths || ["Strong understanding of core role concepts"]).map((s, i) => (
                      <li key={i} className="mb-1">{s}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="col-md-6">
                <div className="p-3 bg-warning bg-opacity-10 rounded-3 border border-warning h-100">
                  <h6 className="fw-bold text-warning mb-2 d-flex align-items-center gap-2">
                    <FaExclamationTriangle /> Needs Improvement
                  </h6>
                  <ul className="mb-0 ps-3 small text-dark">
                    {(evaluation?.weaknesses || ["Elaborate on specific numerical achievements"]).map((w, i) => (
                      <li key={i} className="mb-1">{w}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {evaluation?.recommendations && evaluation.recommendations.length > 0 && (
              <div className="mt-4 pt-3 border-top">
                <h6 className="fw-bold text-primary mb-2 d-flex align-items-center gap-2">
                  <FaLightbulb /> Recommended Practice Topics
                </h6>
                <ul className="mb-0 ps-3 small text-muted">
                  {evaluation.recommendations.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QUESTION BY QUESTION BREAKDOWN */}
      <div className="card card-custom p-4 border-0 shadow-sm rounded-3">
        <h5 className="fw-bold text-dark mb-3">Detailed Question Responses & AI Feedback</h5>

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th style={{ width: '5%' }}>#</th>
                <th style={{ width: '30%' }}>Question</th>
                <th style={{ width: '30%' }}>Candidate Response / Transcript</th>
                <th style={{ width: '12%' }}>Score</th>
                <th style={{ width: '23%' }}>AI Feedback & Analysis</th>
              </tr>
            </thead>
            <tbody>
              {answers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">No submitted answers found for this session.</td>
                </tr>
              ) : (
                answers.map((ans, idx) => {
                  const rawAnsText = (ans.answerText || ans.transcript || '').trim();
                  const cleanText = rawAnsText.toLowerCase();

                  const isNoAnswer = ans.evaluationReason === 'Not Answered' ||
                    ans.evaluationReason === 'No Answer Provided' ||
                    !rawAnsText ||
                    cleanText === 'no answer provided' ||
                    cleanText === 'no answer provided.' ||
                    cleanText === 'spoken video response recorded' ||
                    cleanText === 'spoken video response recorded.';

                  const isUnrelated = !isNoAnswer && (ans.evaluationReason === 'Unrelated / Random Answer' || ans.isRelevant === false || ans.score === 0);
                  const scoreVal = typeof ans.score === 'number' ? ans.score : 0;
                  const ansWeaknesses = ans.weaknesses || ans.improvements || [];
                  const ansStrengths = ans.strengths || [];

                  return (
                    <tr key={ans._id || idx}>
                      <td className="fw-bold text-muted">{idx + 1}</td>
                      <td className="fw-semibold text-dark">{ans.questionText}</td>
                      <td className="small text-secondary font-monospace">
                        {isNoAnswer ? (
                          <span className="fst-italic text-muted fw-semibold">No Answer Provided</span>
                        ) : (
                          rawAnsText
                        )}
                      </td>
                      <td>
                        {isNoAnswer ? (
                          <div>
                            <span className="badge bg-secondary fs-6 px-2 py-1">0%</span>
                            <div className="mt-1">
                              <span className="badge bg-secondary bg-opacity-25 text-dark border border-secondary extra-small fw-bold">
                                Not Answered
                              </span>
                            </div>
                          </div>
                        ) : isUnrelated ? (
                          <div>
                            <span className="badge bg-danger fs-6 px-2 py-1">0%</span>
                            <div className="mt-1">
                              <span className="badge bg-danger bg-opacity-10 text-danger border border-danger extra-small">
                                Unrelated / Random Answer
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className={`badge fs-6 px-2 py-1 ${scoreVal >= 75 ? 'bg-success' : scoreVal >= 50 ? 'bg-primary' : 'bg-warning text-dark'}`}>
                            {scoreVal}%
                          </span>
                        )}
                      </td>
                      <td className="small">
                        <div className="text-dark fw-semibold mb-1">{ans.feedback || 'Evaluated'}</div>
                        {ansStrengths.length > 0 && !isNoAnswer && !isUnrelated && (
                          <div className="text-success extra-small mt-1">
                            <strong>✓ Strengths:</strong> {ansStrengths.join(' • ')}
                          </div>
                        )}
                        {ansWeaknesses.length > 0 && (
                          <div className="text-danger extra-small mt-1">
                            <strong>⚠ Improvements:</strong> {ansWeaknesses.join(' • ')}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InterviewReportContent;
