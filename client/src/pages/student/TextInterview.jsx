import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Loading from '../../components/Loading';
import API from '../../services/api';
import {
  FaClock,
  FaArrowRight,
  FaArrowLeft,
  FaPaperPlane,
  FaExclamationCircle,
  FaCheckCircle,
  FaTh,
  FaBookmark,
  FaEraser,
  FaExclamationTriangle,
  FaStar,
  FaTimesCircle
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const TextInterview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [answerText, setAnswerText] = useState('');
  const [visitedSet, setVisitedSet] = useState(new Set([0]));
  const [reviewSet, setReviewSet] = useState(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);

  const autoSubmittedRef = useRef(false);

  useEffect(() => {
    fetchInterviewDetails();
  }, [id]);

  const handleStopInterview = async () => {
    try {
      setShowStopModal(false);
      await API.post(`/interviews/${id}/stop`);
      toast.success('Interview session stopped');
      navigate('/student/dashboard');
    } catch (err) {
      console.error('Error stopping interview:', err);
      navigate('/student/dashboard');
    }
  };

  useEffect(() => {
    if (!interview || !interview.startedAt) return;

    const updateTimer = () => {
      const startTime = new Date(interview.startedAt).getTime();
      const elapsed = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
      setTimerSeconds(elapsed);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [interview?.startedAt]);

  // Auto-submit when interview duration is reached
  useEffect(() => {
    if (!interview || submitting || autoSubmittedRef.current) return;

    const maxSeconds = (interview.duration || 30) * 60;
    if (timerSeconds >= maxSeconds) {
      autoSubmittedRef.current = true;
      toast.error(`⏰ ${interview.duration || 5}-minute time limit reached! Auto-submitting your answers...`, { duration: 6000 });
      const finalAnswersMap = getUpdatedAnswersMap();
      executeFinalSubmission(finalAnswersMap);
    }
  }, [timerSeconds, interview, submitting]);

  const fetchInterviewDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await API.get(`/interviews/${id}`);
      if (res.data.interview) {
        let activeInterview = res.data.interview;
        if (activeInterview.status === 'Completed') {
          navigate(`/student/result/${id}`, { replace: true });
          return;
        }
        if (activeInterview.status === 'Pending') {
          const startRes = await API.post(`/interviews/${id}/start`);
          if (startRes.data?.interview) {
            activeInterview = startRes.data.interview;
          }
        }
        setInterview(activeInterview);
      }
    } catch (err) {
      console.error('Failed to load interview:', err);
      const msg = err.response?.data?.message || 'Failed to load interview session';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Synchronize current answer into answers map
  const getUpdatedAnswersMap = () => {
    const map = { ...answers };
    if (answerText.trim()) {
      map[currentIndex] = answerText;
    } else {
      delete map[currentIndex];
    }
    return map;
  };

  // Direct Jump to Question
  const handleJumpToQuestion = (targetIndex) => {
    if (targetIndex === currentIndex) return;

    const updatedAnswers = getUpdatedAnswersMap();
    setAnswers(updatedAnswers);
    setError('');

    setVisitedSet((prev) => new Set(prev).add(targetIndex));
    setCurrentIndex(targetIndex);
    setAnswerText(updatedAnswers[targetIndex] || '');
  };

  // Clear Response
  const handleClearResponse = () => {
    setAnswerText('');
    setAnswers((prev) => {
      const updated = { ...prev };
      delete updated[currentIndex];
      return updated;
    });
    setError('');
    toast.success('Response cleared');
  };

  // Mark for Review & Next
  const handleMarkForReviewAndNext = () => {
    const updatedAnswers = getUpdatedAnswersMap();
    setAnswers(updatedAnswers);
    setError('');

    setReviewSet((prev) => new Set(prev).add(currentIndex));

    const nextIndex = currentIndex + 1;
    if (nextIndex < interview.questions.length) {
      setVisitedSet((prev) => new Set(prev).add(nextIndex));
      setCurrentIndex(nextIndex);
      setAnswerText(updatedAnswers[nextIndex] || '');
    } else {
      toast.success('Question marked for review');
    }
  };

  // Handle Previous Button Click
  const handlePrevious = () => {
    if (currentIndex === 0) return;

    const updatedAnswers = getUpdatedAnswersMap();
    setAnswers(updatedAnswers);
    setError('');

    const prevIndex = currentIndex - 1;
    setVisitedSet((prev) => new Set(prev).add(prevIndex));
    setCurrentIndex(prevIndex);
    setAnswerText(updatedAnswers[prevIndex] || '');
  };

  // Handle Save & Next Button Click
  const handleSaveAndNext = () => {
    const updatedAnswers = getUpdatedAnswersMap();
    setAnswers(updatedAnswers);
    setError('');

    const nextIndex = currentIndex + 1;
    if (nextIndex < interview.questions.length) {
      setVisitedSet((prev) => new Set(prev).add(nextIndex));
      setCurrentIndex(nextIndex);
      setAnswerText(updatedAnswers[nextIndex] || '');
    }
  };

  // Jump to First Unanswered / Unvisited Question
  const handleGoToUnanswered = () => {
    const updatedAnswers = getUpdatedAnswersMap();
    setAnswers(updatedAnswers);

    const targetIdx = interview.questions.findIndex((_, idx) => {
      const val = idx === currentIndex ? answerText : updatedAnswers[idx];
      return !val || val.trim().length === 0;
    });

    if (targetIdx !== -1) {
      setVisitedSet((prev) => new Set(prev).add(targetIdx));
      setCurrentIndex(targetIdx);
      setAnswerText(updatedAnswers[targetIdx] || '');
      setError('');
    } else {
      toast.success('All questions answered!');
    }
  };

  // Trigger Submission
  const handleTriggerSubmit = () => {
    setError('');
    const finalAnswersMap = getUpdatedAnswersMap();
    setAnswers(finalAnswersMap);

    const totalQ = interview.questions.length;
    const answeredCount = Object.values(finalAnswersMap).filter((a) => a && a.trim().length > 0).length;
    const unansweredCount = totalQ - answeredCount;

    if (unansweredCount > 0) {
      setShowConfirmModal(true);
    } else {
      executeFinalSubmission(finalAnswersMap);
    }
  };

  // Execute Submission API
  const executeFinalSubmission = async (finalAnswersMap) => {
    setShowConfirmModal(false);
    try {
      setSubmitting(true);

      const formattedAnswersPayload = interview.questions.map((q, idx) => ({
        questionIndex: idx,
        questionText: q.questionText || q.question,
        answerText: finalAnswersMap[idx] || 'No answer provided.'
      }));

      const res = await API.post(`/interviews/${id}/submit`, {
        answers: formattedAnswersPayload
      });

      if (res.data.success) {
        toast.success('Interview submitted and evaluated successfully!');
        navigate(`/student/result/${id}`);
      }
    } catch (err) {
      console.error('Error submitting full interview:', err);
      toast.error(err.response?.data?.message || 'Failed to submit interview. Please try again.');
      setSubmitting(false);
    }
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading || !interview) {
    return <Loading message="Loading interview questions..." />;
  }

  const currentQ = interview.questions[currentIndex];
  const totalQuestions = interview.questions.length;
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  // Compute live current answers map & status counters
  const currentAnswersMap = getUpdatedAnswersMap();

  let answeredCount = 0;
  let notAnsweredCount = 0;
  let notVisitedCount = 0;
  let reviewCount = 0;

  for (let i = 0; i < totalQuestions; i++) {
    const hasAnswer = Boolean(currentAnswersMap[i] && currentAnswersMap[i].trim().length > 0);
    const isReviewed = reviewSet.has(i);
    const isVisited = visitedSet.has(i);

    if (hasAnswer) answeredCount++;
    if (isReviewed) reviewCount++;
    if (isVisited && !hasAnswer) notAnsweredCount++;
    if (!isVisited) notVisitedCount++;
  }

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Navbar />

      <div className="container-fluid px-lg-5 py-4">
        {/* INTERVIEW HEADER BAR */}
        <div className="card card-custom p-3 mb-4 shadow-sm">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <span className="badge bg-primary me-2">{interview.category}</span>
              <span className="badge bg-info text-dark me-2">{interview.jobRole}</span>
              <span className="badge bg-secondary">{interview.difficulty}</span>
              <h5 className="fw-bold text-dark mt-2 mb-0">{interview.title}</h5>
            </div>

            <div className="d-flex align-items-center gap-3">
              {(() => {
                const maxSecs = (interview.duration || 30) * 60;
                const remainingSecs = Math.max(0, maxSecs - timerSeconds);
                const isTimeLow = remainingSecs <= 60;
                return (
                  <div className="text-end me-2">
                    <span className="text-muted small">Time Remaining ({interview.duration || 30}m limit)</span>
                    <h5 className={`fw-bold mb-0 d-flex align-items-center gap-1 ${isTimeLow ? 'text-danger fw-extrabold' : 'text-primary'}`}>
                      <FaClock /> {formatTimer(remainingSecs)}
                    </h5>
                  </div>
                );
              })()}

              <button
                type="button"
                className="btn btn-outline-danger btn-sm fw-bold d-flex align-items-center gap-1 px-3 py-2 shadow-sm"
                onClick={() => setShowStopModal(true)}
              >
                🛑 Stop Interview
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="progress mt-3" style={{ height: '6px' }}>
            <div className="progress-bar progress-bar-custom" role="progressbar" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        {submitting ? (
          <div className="card card-custom p-5 text-center shadow-sm">
            <Loading message="Evaluating complete interview & generating report with AI..." />
          </div>
        ) : (
          /* 2-COLUMN COMPETITIVE EXAM PALETTE LAYOUT */
          <div className="row g-4">
            {/* LEFT COLUMN: MAIN QUESTION & ANSWER AREA */}
            <div className="col-lg-8">
              <div className="card card-custom p-4 shadow-sm border-0 h-100 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                  <h6 className="fw-extrabold text-primary mb-0">
                    Question {currentIndex + 1} of {totalQuestions}
                  </h6>
                  <span className="text-muted small">AI Mode: Text Response</span>
                </div>

                {error && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 small mb-3">
                    <FaExclamationCircle /> {error}
                  </div>
                )}

                {/* Question Prompt */}
                <div className="p-4 bg-light rounded-3 mb-4 border-start border-4 border-primary">
                  <h4 className="fw-bold text-dark mb-2">{currentQ?.questionText}</h4>
                  {currentQ?.evaluationCriteria && currentQ.evaluationCriteria.length > 0 && (
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      <small className="text-muted fw-semibold">Evaluation Focus:</small>
                      {currentQ.evaluationCriteria.map((c, i) => (
                        <span key={i} className="badge bg-secondary bg-opacity-10 text-secondary border">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Answer Textarea */}
                <div className="mb-4 flex-grow-1">
                  <label className="form-label fw-bold small text-muted text-uppercase">Your Answer Response</label>
                  <textarea
                    className="form-control"
                    rows="8"
                    placeholder="Type your comprehensive response here... Be detailed and include concrete examples."
                    value={answerText}
                    onChange={(e) => {
                      setAnswerText(e.target.value);
                      if (error) setError('');
                    }}
                  ></textarea>
                </div>

                {/* ACTION BUTTONS ROW */}
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 pt-3 border-top mt-auto">
                  {/* Left Action Buttons: Clear Response & Mark for Review */}
                  <div className="d-flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm fw-bold px-3 py-2 d-flex align-items-center gap-1"
                      onClick={handleClearResponse}
                      disabled={!answerText && !answers[currentIndex]}
                    >
                      <FaEraser /> Clear Response
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-warning text-dark btn-sm fw-bold px-3 py-2 d-flex align-items-center gap-1"
                      onClick={handleMarkForReviewAndNext}
                    >
                      <FaBookmark className="text-warning" /> Mark for Review & Next
                    </button>
                  </div>

                  {/* Right Action Buttons: Previous & Save & Next / Submit */}
                  <div className="d-flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-4 py-2 fw-bold d-flex align-items-center gap-2"
                      onClick={handlePrevious}
                      disabled={currentIndex === 0 || submitting}
                    >
                      <FaArrowLeft /> Previous
                    </button>

                    {!isLastQuestion ? (
                      <button
                        type="button"
                        className="btn btn-primary px-4 py-2 fw-bold d-flex align-items-center gap-2"
                        onClick={handleSaveAndNext}
                        disabled={submitting}
                      >
                        Save & Next <FaArrowRight />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-success px-4 py-2 fw-bold d-flex align-items-center gap-2"
                        onClick={handleTriggerSubmit}
                        disabled={submitting}
                      >
                        <FaPaperPlane /> {submitting ? 'Submitting...' : 'Submit Interview'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: QUESTION PALETTE & STATUS PANEL */}
            <div className="col-lg-4">
              <div className="card card-custom p-4 shadow-sm border-0 h-100 d-flex flex-column bg-white">
                <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                  <h6 className="fw-extrabold text-dark mb-0 d-flex align-items-center gap-2">
                    <FaTh className="text-primary" /> QUESTION PALETTE
                  </h6>
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 text-decoration-none text-primary fw-bold"
                    onClick={handleGoToUnanswered}
                  >
                    Go to Unanswered →
                  </button>
                </div>

                {/* Status Summary Counters (2x2 Grid) */}
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <div className="p-2 bg-success bg-opacity-10 border border-success rounded text-center">
                      <span className="d-block fw-extrabold text-success fs-5">{answeredCount}</span>
                      <small className="text-success fw-bold extra-small">✓ Answered</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-2 bg-danger bg-opacity-10 border border-danger rounded text-center">
                      <span className="d-block fw-extrabold text-danger fs-5">{notAnsweredCount}</span>
                      <small className="text-danger fw-bold extra-small">○ Not Answered</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-2 bg-secondary bg-opacity-10 border border-secondary rounded text-center">
                      <span className="d-block fw-extrabold text-secondary fs-5">{notVisitedCount}</span>
                      <small className="text-secondary fw-bold extra-small">□ Not Visited</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-2 bg-warning bg-opacity-10 border border-warning rounded text-center">
                      <span className="d-block fw-extrabold text-dark fs-5">{reviewCount}</span>
                      <small className="text-dark fw-bold extra-small">★ Review</small>
                    </div>
                  </div>
                </div>

                {/* Question Grid Buttons */}
                <div className="flex-grow-1 overflow-y-auto mb-3" style={{ maxHeight: '360px' }}>
                  <div className="d-flex flex-wrap gap-2">
                    {interview.questions.map((q, idx) => {
                      const isCurrent = idx === currentIndex;
                      const hasAnswer = Boolean(currentAnswersMap[idx] && currentAnswersMap[idx].trim().length > 0);
                      const isReviewed = reviewSet.has(idx);
                      const isVisited = visitedSet.has(idx);

                      let btnBg = 'bg-light text-secondary border';
                      let labelPrefix = '';

                      if (hasAnswer && isReviewed) {
                        btnBg = 'bg-success text-white border border-warning border-2';
                        labelPrefix = '✓★ ';
                      } else if (hasAnswer) {
                        btnBg = 'bg-success text-white border-0';
                        labelPrefix = '✓ ';
                      } else if (isReviewed) {
                        btnBg = 'bg-warning text-dark border-0';
                        labelPrefix = '★ ';
                      } else if (isVisited) {
                        btnBg = 'bg-danger text-white border-0';
                        labelPrefix = '○ ';
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          className={`btn btn-sm fw-bold transition-all ${btnBg} ${isCurrent ? 'ring-active' : ''}`}
                          onClick={() => handleJumpToQuestion(idx)}
                          style={{
                            minWidth: '46px',
                            height: '42px',
                            borderRadius: '8px',
                            boxShadow: isCurrent ? '0 0 0 3px #0d6efd' : 'none'
                          }}
                          title={`Question ${idx + 1}: ${
                            hasAnswer ? 'Answered' : isVisited ? 'Not Answered' : 'Not Visited'
                          }${isReviewed ? ' (Marked for Review)' : ''}`}
                        >
                          {labelPrefix}{idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Legend Section */}
                <div className="border-top pt-3 extra-small text-muted">
                  <div className="row g-2">
                    <div className="col-6 d-flex align-items-center gap-1">
                      <span className="badge bg-success text-white">✓ 1</span> Answered
                    </div>
                    <div className="col-6 d-flex align-items-center gap-1">
                      <span className="badge bg-danger text-white">○ 1</span> Not Answered
                    </div>
                    <div className="col-6 d-flex align-items-center gap-1">
                      <span className="badge bg-light border text-dark">1</span> Not Visited
                    </div>
                    <div className="col-6 d-flex align-items-center gap-1">
                      <span className="badge bg-warning text-dark">★ 1</span> Review
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CONFIRMATION MODAL FOR UNANSWERED QUESTIONS */}
      {showConfirmModal && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px' }}>
              <div className="modal-header bg-warning bg-opacity-10 border-0">
                <h5 className="modal-title fw-extrabold text-dark d-flex align-items-center gap-2">
                  <FaExclamationTriangle className="text-warning" /> Unanswered Questions Warning
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowConfirmModal(false)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <p className="fw-semibold text-dark mb-2">
                  You have <strong className="text-danger">{totalQuestions - answeredCount}</strong> unanswered / unvisited questions out of {totalQuestions}.
                </p>
                <p className="text-muted small mb-0">
                  Are you sure you want to submit the interview now, or would you like to return and complete your remaining answers?
                </p>
              </div>

              <div className="modal-footer border-0 bg-light p-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary fw-bold px-4"
                  onClick={() => {
                    setShowConfirmModal(false);
                    handleGoToUnanswered();
                  }}
                >
                  Continue Interview
                </button>
                <button
                  type="button"
                  className="btn btn-danger fw-bold px-4"
                  onClick={() => executeFinalSubmission(currentAnswersMap)}
                >
                  Submit Interview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL FOR STOP INTERVIEW */}
      {showStopModal && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px' }}>
              <div className="modal-header bg-danger bg-opacity-10 border-0">
                <h5 className="modal-title fw-extrabold text-dark d-flex align-items-center gap-2">
                  🛑 Stop Interview Session
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowStopModal(false)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <p className="fw-semibold text-dark mb-2">
                  Are you sure you want to stop this interview session?
                </p>
                <p className="text-muted small mb-0">
                  Stopping the interview will end your current session, stop timers/recordings, set the interview status to stopped, and exit to your student dashboard.
                </p>
              </div>

              <div className="modal-footer border-0 bg-light p-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary fw-bold px-4"
                  onClick={() => setShowStopModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger fw-bold px-4"
                  onClick={handleStopInterview}
                >
                  Stop & Exit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextInterview;
