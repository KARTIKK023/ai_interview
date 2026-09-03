import React, { useEffect, useState } from 'react';

import {
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';

import StudentLayout from '../../components/StudentLayout';
import API from '../../services/api';

import {
  FaArrowLeft,
  FaCheckCircle,
  FaQuestionCircle,
  FaTimesCircle,
  FaLightbulb,
  FaBookOpen,
} from 'react-icons/fa';

import toast from 'react-hot-toast';

const StudentInterviewQuestions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const questionType =
    searchParams.get('type') === 'unattended'
      ? 'unattended'
      : 'attempted';

  const [interview, setInterview] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // FETCH INTERVIEW QUESTIONS + CORRECT ANSWERS
  // ============================================================

  useEffect(() => {
    fetchInterview();
  }, [id]);

  const fetchInterview = async () => {
    try {
      setLoading(true);

      const res = await API.get(
         `/interviews/${id}?includeCorrectAnswers=true`
      );

      if (res.data?.success) {
        setInterview(res.data.interview || null);
        setAnswers(res.data.answers || []);
      }
    } catch (err) {
      console.error(
        'Failed to load interview questions:',
        err
      );

      toast.error(
        err.response?.data?.message ||
          'Failed to load interview questions.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // HELPERS
  // ============================================================

  const getQuestionText = (question) => {
    if (!question) {
      return 'Question unavailable';
    }

    if (typeof question === 'string') {
      return question;
    }

    return (
      question.questionText ||
      question.question ||
      question.text ||
      question.question_title ||
      'Question unavailable'
    );
  };

  const getCorrectAnswer = (question) => {
    if (!question || typeof question === 'string') {
      return '';
    }

    return String(
      question.correctAnswer ||
        question.correct_answer ||
        question.expectedAnswer ||
        ''
    ).trim();
  };

  const getAnswerText = (answer) => {
    if (!answer) {
      return '';
    }

    return String(
      answer.answerText ||
        answer.answer ||
        ''
    ).trim();
  };

  const isAnswered = (answer) => {
    const answerText = getAnswerText(answer)
      .toLowerCase()
      .trim();

    if (!answerText) {
      return false;
    }

    const unansweredValues = [
      'no answer provided',
      'no answer provided.',
      'no answer',
      'unanswered',
    ];

    return !unansweredValues.includes(answerText);
  };

  // ============================================================
  // BUILD QUESTION / ANSWER MAP
  // ============================================================

  const getAnswerForQuestion = (questionIndex) => {
    const exactMatch = answers.find(
      (answer) =>
        Number(answer?.questionIndex) ===
        Number(questionIndex)
    );

    if (exactMatch) {
      return exactMatch;
    }

    // Fallback for old data where questionIndex
    // may have been saved as 1-based.
    const oneBasedMatch = answers.find(
      (answer) =>
        Number(answer?.questionIndex) ===
        Number(questionIndex) + 1
    );

    return oneBasedMatch || null;
  };

  // ============================================================
  // FILTER QUESTIONS
  // ============================================================

  const allQuestions = Array.isArray(interview?.questions)
    ? interview.questions
    : [];

  const questionItems = allQuestions
    .map((question, index) => {
      const answer = getAnswerForQuestion(index);

      return {
        question,
        answer,
        index,
        isAttempted: isAnswered(answer),
      };
    })
    .filter((item) => {
      if (questionType === 'unattended') {
        return !item.isAttempted;
      }

      return item.isAttempted;
    });

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <StudentLayout>
        <div className="container-fluid py-5">
          <div className="d-flex justify-content-center align-items-center">
            <div
              className="spinner-border text-primary"
              role="status"
            >
              <span className="visually-hidden">
                Loading...
              </span>
            </div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  // ============================================================
  // INTERVIEW NOT FOUND
  // ============================================================

  if (!interview) {
    return (
      <StudentLayout>
        <div className="container-fluid py-5">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body text-center py-5">
              <FaQuestionCircle
                size={45}
                className="text-muted mb-3"
              />

              <h4 className="fw-bold">
                Interview not found
              </h4>

              <p className="text-muted mb-4">
                We could not find the requested interview.
              </p>

              <button
                type="button"
                className="btn btn-primary rounded-3 px-4"
                onClick={() => navigate(-1)}
              >
                <FaArrowLeft className="me-2" />
                Go Back
              </button>
            </div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <StudentLayout>
      <div className="container-fluid py-4 px-3 px-md-4">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

          <div>
            <button
              type="button"
              className="btn btn-light border rounded-3 mb-3"
              onClick={() => navigate(-1)}
            >
              <FaArrowLeft className="me-2" />
              Back
            </button>

            <h2 className="fw-bold mb-1">
              Interview Questions
            </h2>

            <p className="text-muted mb-0">
              {interview.title ||
                `${interview.jobRole || 'Interview'} Questions`}
            </p>
          </div>

          <div className="d-flex flex-wrap gap-2">

            {interview.jobRole && (
              <span className="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle px-3 py-2">
                {interview.jobRole}
              </span>
            )}

            {interview.difficulty && (
              <span className="badge bg-secondary bg-opacity-10 text-secondary border px-3 py-2">
                {interview.difficulty}
              </span>
            )}

            <span className="badge bg-info bg-opacity-10 text-info border border-info-subtle px-3 py-2">
              {allQuestions.length} Questions
            </span>

          </div>
        </div>

        {/* =====================================================
            STUDY MODE NOTICE
        ====================================================== */}

        <div className="alert alert-primary border-0 rounded-4 d-flex align-items-start gap-3 mb-4">
          <FaBookOpen
            size={20}
            className="mt-1 flex-shrink-0"
          />

          <div>
            <div className="fw-bold mb-1">
              Interview Preparation
            </div>

            <div className="small">
              Review the questions along with the ideal
              reference answers to prepare for future interviews.
            </div>
          </div>
        </div>

        {/* =====================================================
            EMPTY STATE
        ====================================================== */}

        {questionItems.length === 0 ? (
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body text-center py-5">

              {questionType === 'attempted' ? (
                <>
                  <FaCheckCircle
                    size={45}
                    className="text-success mb-3"
                  />

                  <h4 className="fw-bold">
                    No attempted questions
                  </h4>

                  <p className="text-muted mb-0">
                    There are no attempted questions for this
                    interview.
                  </p>
                </>
              ) : (
                <>
                  <FaCheckCircle
                    size={45}
                    className="text-success mb-3"
                  />

                  <h4 className="fw-bold">
                    No unattended questions
                  </h4>

                  <p className="text-muted mb-0">
                    All questions were attempted.
                  </p>
                </>
              )}

            </div>
          </div>
        ) : (
          <div className="d-flex flex-column gap-4">

            {questionItems.map((item) => {
              const question = item.question;

              const questionText =
                getQuestionText(question);

              const correctAnswer =
                getCorrectAnswer(question);

              return (
                <div
                  key={
                    question?._id ||
                    `${item.index}-${questionText}`
                  }
                  className="card border-0 shadow-sm rounded-4 overflow-hidden"
                >

                  <div className="card-body p-4">

                    {/* =================================================
                        QUESTION HEADER
                    ================================================== */}

                    <div className="d-flex justify-content-between align-items-start gap-3">

                      <div className="d-flex align-items-start">

                        <div
                          className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${
                            item.isAttempted
                              ? 'bg-success bg-opacity-10 text-success'
                              : 'bg-danger bg-opacity-10 text-danger'
                          }`}
                          style={{
                            minWidth: '40px',
                            width: '40px',
                            height: '40px',
                          }}
                        >
                          {item.isAttempted ? (
                            <FaCheckCircle size={18} />
                          ) : (
                            <FaTimesCircle size={18} />
                          )}
                        </div>

                        <div>
                          <div className="small text-muted mb-1">
                            Question {item.index + 1}
                          </div>

                          <h5 className="fw-bold mb-0">
                            {questionText}
                          </h5>
                        </div>

                      </div>

                      <span
                        className={`badge ${
                          item.isAttempted
                            ? 'bg-success bg-opacity-10 text-success border border-success-subtle'
                            : 'bg-danger bg-opacity-10 text-danger border border-danger-subtle'
                        }`}
                      >
                        {item.isAttempted
                          ? 'Attempted'
                          : 'Unattended'}
                      </span>

                    </div>

                    {/* =================================================
                        QUESTION METADATA
                    ================================================== */}

                    <div className="d-flex flex-wrap gap-2 mt-3">

                      {question?.questionType && (
                        <span className="badge bg-light text-dark border">
                          {question.questionType}
                        </span>
                      )}

                      {question?.difficulty && (
                        <span className="badge bg-light text-dark border">
                          {question.difficulty}
                        </span>
                      )}

                    </div>

                    {/* =================================================
                        YOUR ANSWER
                    ================================================== */}

                    {item.isAttempted && (
                      <div className="mt-4">

                        <div className="small fw-bold text-muted mb-2">
                          Your Answer
                        </div>

                        <div
                          className="p-3 rounded-3 bg-light border"
                          style={{
                            whiteSpace: 'pre-wrap',
                            lineHeight: '1.6',
                          }}
                        >
                          {getAnswerText(item.answer) ||
                            'No answer provided.'}
                        </div>

                      </div>
                    )}

                    {/* =================================================
                        UNATTENDED
                    ================================================== */}

                    {!item.isAttempted && (
                      <div
                        className="mt-4 p-3 rounded-3 border border-danger-subtle bg-danger bg-opacity-10"
                      >
                        <div className="d-flex align-items-center">

                          <FaTimesCircle
                            className="text-danger me-2"
                          />

                          <span className="text-danger fw-semibold">
                            This question was not attempted.
                          </span>

                        </div>
                      </div>
                    )}

                    {/* =================================================
                        CORRECT / IDEAL ANSWER
                    ================================================== */}

                    <div className="mt-4">

                      <div className="d-flex align-items-center mb-2">

                        <FaLightbulb
                          className="text-warning me-2"
                        />

                        <div className="small fw-bold text-muted">
                          Correct / Ideal Answer
                        </div>

                      </div>

                      {correctAnswer ? (
                        <div
                          className="p-3 p-md-4 rounded-3 border bg-white"
                          style={{
                            whiteSpace: 'pre-wrap',
                            lineHeight: '1.7',
                          }}
                        >
                          {correctAnswer}
                        </div>
                      ) : (
                        <div className="p-3 rounded-3 bg-light border text-muted">
                          <span className="small">
                            A reference answer is not available
                            for this question.
                          </span>
                        </div>
                      )}

                    </div>

                    {/* =================================================
                        EVALUATION CRITERIA
                    ================================================== */}

                    {Array.isArray(
                      question?.evaluationCriteria
                    ) &&
                      question.evaluationCriteria.length > 0 && (
                        <div className="mt-4">

                          <div className="small fw-bold text-muted mb-2">
                            Evaluation Criteria
                          </div>

                          <div className="d-flex flex-wrap gap-2">
                            {question.evaluationCriteria.map(
                              (criterion, criterionIndex) => (
                                <span
                                  key={`${criterion}-${criterionIndex}`}
                                  className="badge bg-light text-dark border"
                                >
                                  {criterion}
                                </span>
                              )
                            )}
                          </div>

                        </div>
                      )}

                    {/* =================================================
                        EXPECTED COMPETENCIES
                    ================================================== */}

                    {Array.isArray(
                      question?.expectedCompetencies
                    ) &&
                      question.expectedCompetencies.length > 0 && (
                        <div className="mt-4">

                          <div className="small fw-bold text-muted mb-2">
                            Expected Competencies
                          </div>

                          <div className="d-flex flex-wrap gap-2">
                            {question.expectedCompetencies.map(
                              (competency, competencyIndex) => (
                                <span
                                  key={`${competency}-${competencyIndex}`}
                                  className="badge bg-light text-dark border"
                                >
                                  {competency}
                                </span>
                              )
                            )}
                          </div>

                        </div>
                      )}

                  </div>
                </div>
              );
            })}

          </div>
        )}

      </div>
    </StudentLayout>
  );
};

export default StudentInterviewQuestions;