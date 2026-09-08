
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle,
  FaMagic,
  FaTrash,
  FaChartLine,
  FaLightbulb,
  FaTags,
  FaFileAlt,
  FaShieldAlt,
  FaLock,
  FaTimes,
  FaChevronDown,
  FaChevronRight,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import StudentLayout from '../../../components/StudentLayout';
import { atsApi, errorMessage, normalizeScan } from './atsApi';

const scoreClass = (score) =>
  score >= 80 ? 'success' : score >= 60 ? 'warning' : 'danger';

const formatLabel = (key) =>
  key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase());

const AtsAnalysis = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const [premiumUnlocked, setPremiumUnlocked] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  const [openSections, setOpenSections] = useState({
    recommendations: false,
    scoreReasoning: false,
    evidence: false,
    claimVerification: false,
  });

  useEffect(() => {
    atsApi
      .getScan(id)
      .then((response) => setScan(normalizeScan(response.data?.scan)))
      .catch((error) =>
        toast.error(errorMessage(error, 'Unable to load this analysis.'))
      )
      .finally(() => setLoading(false));
  }, [id]);

  const deleteAnalysis = async () => {
    if (!window.confirm('Delete this ATS analysis and its tailored resume?')) {
      return;
    }

    try {
      setDeleting(true);
      await atsApi.deleteScan(id);
      toast.success('ATS analysis deleted.');
      navigate('/student/ats-scanner/history');
    } catch (error) {
      toast.error(
        errorMessage(error, 'Unable to delete this analysis.')
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleUnlock = () => {
    if (premiumUnlocked) {
      return;
    }

    setShowUnlockModal(true);
  };

  const continueWithDemo = () => {
    setPremiumUnlocked(true);
    setShowUnlockModal(false);
  };

  const toggleSection = (section) => {
    setOpenSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  };

  const handleTailorResume = () => {
    // if (!premiumUnlocked) {
    //   setShowUnlockModal(true);
    //   return;
    // }

    navigate(`/student/ats-scanner/analysis/${id}/resume`);
  };

  const renderLockedOverlay = (label) => {
    if (premiumUnlocked) {
      return null;
    }

    return (
      <div
        className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center rounded-4"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.76)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          zIndex: 2,
        }}
      >
        <button
          type="button"
          className="btn btn-primary px-4 py-2 rounded-3 fw-semibold shadow-sm"
          onClick={handleUnlock}
        >
          <FaLock className="me-2" />
          {label}
        </button>
      </div>
    );
  };

  const renderRecommendation = (item, index) => {
    const title =
      item?.title ||
      item?.name ||
      item?.text ||
      `Recommendation ${index + 1}`;

    const description =
      item?.description ||
      item?.action ||
      item?.reason ||
      item?.text ||
      item;

    return (
      <div
        key={index}
        className="py-4 border-bottom"
      >
        <div className="d-flex align-items-start gap-3">
          <div
            className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 fw-semibold"
            style={{
              width: '36px',
              height: '36px',
              backgroundColor: '#edf3ff',
              color: '#0d6efd',
              fontSize: '0.85rem',
            }}
          >
            {index + 1}
          </div>

          <div className="flex-grow-1">
            <div className="fw-semibold mb-2">
              {title}
            </div>

            <p className="text-secondary mb-0 lh-lg">
              {description}
            </p>

            {item?.evidence && (
              <div
                className="mt-3 p-3 rounded-3 small"
                style={{
                  backgroundColor: '#f7f7f8',
                }}
              >
                <span className="fw-semibold">
                  Evidence:
                </span>{' '}
                <span className="text-secondary">
                  {item.evidence}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderScoreRationale = (item, index) => {
    const color = scoreClass(item?.score ?? 0);

    return (
      <div
        key={index}
        className="py-4 border-bottom"
      >
        <div className="d-flex justify-content-between align-items-center gap-3 mb-2">
          <strong>
            {item?.category || `Score Category ${index + 1}`}
          </strong>

          <span className={`text-${color} fw-semibold`}>
            {item?.score ?? 0}/100
          </span>
        </div>

        <p className="text-secondary mb-2 lh-lg">
          {item?.reason || 'No detailed reasoning provided.'}
        </p>

        {item?.evidence && (
          <div
            className="small px-3 py-3 rounded-3"
            style={{
              backgroundColor: '#f7f7f8',
            }}
          >
            <span className="fw-semibold">
              Evidence:
            </span>{' '}
            <span className="text-secondary">
              {item.evidence}
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderEvidence = (item, index) => (
    <div
      key={index}
      className="py-4 border-bottom"
    >
      <div className="fw-semibold mb-3">
        {item?.category || `Evidence ${index + 1}`}
      </div>

      {item?.quote && (
        <div
          className="p-4 rounded-4 mb-3"
          style={{
            backgroundColor: '#f7f7f8',
            borderLeft: '3px solid #0d6efd',
          }}
        >
          <p className="mb-0 fst-italic text-secondary lh-lg">
            “{item.quote}”
          </p>
        </div>
      )}

      {item?.interpretation && (
        <p className="text-secondary mb-0 lh-lg">
          {item.interpretation}
        </p>
      )}
    </div>
  );

  if (loading) {
    return (
      <StudentLayout>
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="text-center">
            <div
              className="spinner-border text-primary mb-3"
              style={{
                width: '2.25rem',
                height: '2.25rem',
              }}
            />
            <p className="text-secondary mb-0">
              Loading analysis...
            </p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (!scan) {
    return (
      <StudentLayout>
        <div className="container-fluid px-0">
          <div className="alert alert-danger border-0 rounded-4 shadow-sm">
            This ATS analysis is unavailable.
          </div>
        </div>
      </StudentLayout>
    );
  }

  const target = scan.targetJob || {};
  const overallColor = scoreClass(scan.overallScore);

  const matchedSkills = scan.matchedSkills || [];
  const missingSkills = scan.missingSkills || [];
  const matchedKeywords = scan.matchedKeywords || [];
  const missingKeywords = scan.missingKeywords || [];
  const strengths = scan.strengths || [];
  const weaknesses = scan.weaknesses || [];
  const improvements = scan.improvements || [];
  const scoreRationales = scan.scoreRationales || [];
  const evidence = scan.evidence || [];
  const unsupportedClaimWarnings =
    scan.unsupportedClaimWarnings || [];

  return (
    <StudentLayout>
      <div
        className="container-fluid px-0"
        style={{
          maxWidth: '1380px',
          margin: '0 auto',
        }}
      >
        <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
          <div>
            <Link
              to="/student/ats-scanner/history"
              className="text-decoration-none text-secondary small fw-medium"
            >
              <FaArrowLeft className="me-2" />
              Back to History
            </Link>

            <h2
              className="fw-bold mb-1 mt-3"
              style={{
                letterSpacing: '-0.8px',
              }}
            >
              ATS Analysis
            </h2>

            <p className="text-secondary mb-0">
              {target.target_job_role || 'Target Job'}
              {target.target_company
                ? ` · ${target.target_company}`
                : ''}
            </p>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-light border px-3"
              onClick={deleteAnalysis}
              disabled={deleting}
            >
              {deleting ? (
                <span className="spinner-border spinner-border-sm me-2" />
              ) : (
                <FaTrash className="me-2 text-danger" />
              )}

              {deleting ? 'Deleting...' : 'Delete'}
            </button>

            <button
              type="button"
              className="btn btn-primary px-4"
              onClick={handleTailorResume}
            >
              <FaMagic className="me-2" />
              Tailor Resume
            </button>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
          <div className="card-body p-4 p-lg-5">
            <div className="row align-items-center g-4">
              <div className="col-lg-5">
                <div className="d-flex align-items-center gap-4">
                  <div
                    className={`border border-4 border-${overallColor} rounded-circle d-flex align-items-center justify-content-center flex-shrink-0`}
                    style={{
                      width: '132px',
                      height: '132px',
                    }}
                  >
                    <div className="text-center">
                      <div
                        className={`fw-bold text-${overallColor}`}
                        style={{
                          fontSize: '2.8rem',
                          lineHeight: 1,
                          letterSpacing: '-2px',
                        }}
                      >
                        {scan.overallScore}
                      </div>

                      <small className="text-secondary">
                        / 100
                      </small>
                    </div>
                  </div>

                  <div>
                    <div className="text-uppercase small text-secondary fw-semibold mb-2">
                      Overall Score
                    </div>

                    <h4 className="fw-bold mb-2">
                      {scan.overallScore >= 80
                        ? 'Strong Match'
                        : scan.overallScore >= 60
                        ? 'Good Potential'
                        : 'Needs Improvement'}
                    </h4>

                    <p className="text-secondary mb-0 small">
                      Your resume's overall compatibility with this target
                      position.
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-lg-7">
                <div
                  className="p-4 rounded-4"
                  style={{
                    backgroundColor: '#f7f7f8',
                  }}
                >
                  <div className="d-flex align-items-center mb-3">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-3 me-3"
                      style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: '#e9f2ff',
                        color: '#0d6efd',
                      }}
                    >
                      <FaShieldAlt />
                    </div>

                    <div>
                      <div className="fw-semibold">
                        Recruiter Summary
                      </div>

                      <small className="text-secondary">
                        AI-powered resume assessment
                      </small>
                    </div>
                  </div>

                  <p className="text-secondary mb-0 lh-lg">
                    {scan.recruiterSummary ||
                      'AI analysis completed for this target job.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4 p-lg-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h5 className="fw-bold mb-1">
                      Score Breakdown
                    </h5>

                    <small className="text-secondary">
                      How your resume performed across key areas
                    </small>
                  </div>

                  <FaChartLine className="text-primary fs-5" />
                </div>

                {Object.entries(scan.scores || {}).map(
                  ([key, value], index) => {
                    const color = scoreClass(value);

                    return (
                      <div
                        key={key}
                        className={index !== 0 ? 'mt-4' : ''}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-medium">
                            {formatLabel(key)}
                          </span>

                          <span
                            className={`fw-semibold text-${color}`}
                          >
                            {value}/100
                          </span>
                        </div>

                        <div
                          className="progress"
                          style={{
                            height: '7px',
                            backgroundColor: '#ececef',
                          }}
                        >
                          <div
                            className={`progress-bar bg-${color}`}
                            style={{
                              width: `${Math.min(
                                Math.max(value || 0, 0),
                                100
                              )}%`,
                              borderRadius: '10px',
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4 p-lg-5">
                <div className="d-flex align-items-center mb-4">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-3 me-3"
                    style={{
                      width: '42px',
                      height: '42px',
                      backgroundColor: '#f2f2f7',
                    }}
                  >
                    <FaTags className="text-primary" />
                  </div>

                  <div>
                    <h5 className="fw-bold mb-1">
                      Skills & Keywords
                    </h5>

                    <small className="text-secondary">
                      What matches your target job
                    </small>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="small text-secondary fw-semibold mb-2">
                    MATCHED SKILLS
                  </div>

                  <div className="d-flex flex-wrap gap-2">
                    {matchedSkills.length ? (
                      matchedSkills.map((item, index) => (
                        <span
                          key={index}
                          className="badge rounded-pill fw-medium px-3 py-2"
                          style={{
                            backgroundColor: '#eaf7ee',
                            color: '#198754',
                          }}
                        >
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="small text-secondary">
                        None detected
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-4 position-relative">
                  <div className="small text-secondary fw-semibold mb-2">
                    MISSING SKILLS
                  </div>

                  <div className="d-flex flex-wrap gap-2">
                    {(premiumUnlocked
                      ? missingSkills
                      : missingSkills.slice(0, 3)
                    ).map((item, index) => (
                      <span
                        key={index}
                        className="badge rounded-pill fw-medium px-3 py-2"
                        style={{
                          backgroundColor: '#fff4df',
                          color: '#a66a00',
                        }}
                      >
                        {item}
                      </span>
                    ))}

                    {!premiumUnlocked && missingSkills.length > 3 && (
                      <button
                        type="button"
                        className="badge border-0 rounded-pill px-3 py-2 fw-semibold"
                        style={{
                          backgroundColor: '#f2f2f7',
                          color: '#0d6efd',
                        }}
                        onClick={handleUnlock}
                      >
                        <FaLock className="me-1" />
                        +{missingSkills.length - 3} more
                      </button>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="small text-secondary fw-semibold mb-2">
                    MATCHED KEYWORDS
                  </div>

                  <div className="d-flex flex-wrap gap-2">
                    {matchedKeywords.length ? (
                      matchedKeywords.map((item, index) => (
                        <span
                          key={index}
                          className="badge rounded-pill fw-medium px-3 py-2"
                          style={{
                            backgroundColor: '#edf3ff',
                            color: '#0d6efd',
                          }}
                        >
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="small text-secondary">
                        None detected
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="small text-secondary fw-semibold mb-2">
                    MISSING KEYWORDS
                  </div>

                  <div className="d-flex flex-wrap gap-2">
                    {(premiumUnlocked
                      ? missingKeywords
                      : missingKeywords.slice(0, 3)
                    ).map((item, index) => (
                      <span
                        key={index}
                        className="badge rounded-pill fw-medium px-3 py-2"
                        style={{
                          backgroundColor: '#fff0f0',
                          color: '#dc3545',
                        }}
                      >
                        {item}
                      </span>
                    ))}

                    {!premiumUnlocked && missingKeywords.length > 3 && (
                      <button
                        type="button"
                        className="badge border-0 rounded-pill px-3 py-2 fw-semibold"
                        style={{
                          backgroundColor: '#f2f2f7',
                          color: '#0d6efd',
                        }}
                        onClick={handleUnlock}
                      >
                        <FaLock className="me-1" />
                        +{missingKeywords.length - 3} more
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4 p-lg-5">
                <div className="d-flex align-items-center mb-4">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-3 me-3"
                    style={{
                      width: '42px',
                      height: '42px',
                      backgroundColor: '#eaf7ee',
                    }}
                  >
                    <FaCheckCircle className="text-success" />
                  </div>

                  <div>
                    <h5 className="fw-bold mb-1">
                      Strengths
                    </h5>

                    <small className="text-secondary">
                      What is already working well
                    </small>
                  </div>
                </div>

                {(strengths.length
                  ? strengths
                  : ['No strengths returned.']
                ).map((item, index) => (
                  <div
                    key={index}
                    className="d-flex align-items-start py-3 border-bottom"
                  >
                    <FaCheckCircle
                      className="text-success mt-1 me-3 flex-shrink-0"
                      size={14}
                    />

                    <p className="mb-0 text-secondary lh-lg">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4 p-lg-5">
                <div className="d-flex align-items-center mb-4">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-3 me-3"
                    style={{
                      width: '42px',
                      height: '42px',
                      backgroundColor: '#fff4df',
                    }}
                  >
                    <FaExclamationTriangle className="text-warning" />
                  </div>

                  <div>
                    <h5 className="fw-bold mb-1">
                      Weaknesses
                    </h5>

                    <small className="text-secondary">
                      Areas that could improve your score
                    </small>
                  </div>
                </div>

                {(weaknesses.length
                  ? weaknesses
                  : ['No major weaknesses returned.']
                ).map((item, index) => (
                  <div
                    key={index}
                    className="d-flex align-items-start py-3 border-bottom"
                  >
                    <FaExclamationTriangle
                      className="text-warning mt-1 me-3 flex-shrink-0"
                      size={14}
                    />

                    <p className="mb-0 text-secondary lh-lg">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <section className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
          <div className="card-body p-0 position-relative">
            <button
              type="button"
              className="btn w-100 text-start border-0 bg-white p-4 p-lg-5"
              onClick={() => toggleSection('recommendations')}
            >
              <div className="d-flex align-items-center justify-content-between gap-3">
                <div className="d-flex align-items-center">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-3 me-3"
                    style={{
                      width: '42px',
                      height: '42px',
                      backgroundColor: '#fff8e7',
                    }}
                  >
                    <FaLightbulb className="text-warning" />
                  </div>

                  <div>
                    <h5 className="fw-bold mb-1">
                      AI Recommendations
                    </h5>

                    <small className="text-secondary">
                      Practical improvements based on your analysis
                    </small>
                  </div>
                </div>

                {openSections.recommendations ? (
                  <FaChevronDown className="text-secondary" />
                ) : (
                  <FaChevronRight className="text-secondary" />
                )}
              </div>
            </button>

            {openSections.recommendations && (
              <div className="border-top p-4 p-lg-5">
                <div
                  className="position-relative"
                  style={{
                    minHeight: improvements.length ? '260px' : '120px',
                  }}
                >
                  {improvements.length ? (
                    improvements.map(renderRecommendation)
                  ) : (
                    <p className="text-secondary mb-0">
                      No recommendations returned.
                    </p>
                  )}

                  {renderLockedOverlay(
                    'Unlock Full Recommendations'
                  )}
                </div>

                {unsupportedClaimWarnings.length > 0 && (
                  <div
                    className="mt-4 p-3 rounded-4 d-flex align-items-start"
                    style={{
                      backgroundColor: '#fff8e7',
                      color: '#765500',
                    }}
                  >
                    <FaExclamationTriangle className="mt-1 me-3 flex-shrink-0" />

                    <div>
                      <div className="fw-semibold mb-1">
                        Verify before editing
                      </div>

                      <div className="small">
                        {unsupportedClaimWarnings.join(' ')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {scoreRationales.length > 0 && (
          <section className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
            <div className="card-body p-0 position-relative">
              <button
                type="button"
                className="btn w-100 text-start border-0 bg-white p-4 p-lg-5"
                onClick={() => toggleSection('scoreReasoning')}
              >
                <div className="d-flex align-items-center justify-content-between gap-3">
                  <div className="d-flex align-items-center">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-3 me-3"
                      style={{
                        width: '42px',
                        height: '42px',
                        backgroundColor: '#edf3ff',
                      }}
                    >
                      <FaChartLine className="text-primary" />
                    </div>

                    <div>
                      <h5 className="fw-bold mb-1">
                        Why These Scores?
                      </h5>

                      <small className="text-secondary">
                        The reasoning behind each category
                      </small>
                    </div>
                  </div>

                  {openSections.scoreReasoning ? (
                    <FaChevronDown className="text-secondary" />
                  ) : (
                    <FaChevronRight className="text-secondary" />
                  )}
                </div>
              </button>

              {openSections.scoreReasoning && (
                <div className="border-top p-4 p-lg-5">
                  <div
                    className="position-relative"
                    style={{
                      minHeight: '260px',
                    }}
                  >
                    {scoreRationales.map(renderScoreRationale)}

                    {renderLockedOverlay(
                      'Unlock Score Reasoning'
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {evidence.length > 0 && (
          <section className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
            <div className="card-body p-0 position-relative">
              <button
                type="button"
                className="btn w-100 text-start border-0 bg-white p-4 p-lg-5"
                onClick={() => toggleSection('evidence')}
              >
                <div className="d-flex align-items-center justify-content-between gap-3">
                  <div className="d-flex align-items-center">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-3 me-3"
                      style={{
                        width: '42px',
                        height: '42px',
                        backgroundColor: '#f2f2f7',
                      }}
                    >
                      <FaFileAlt className="text-secondary" />
                    </div>

                    <div>
                      <h5 className="fw-bold mb-1">
                        Resume Evidence
                      </h5>

                      <small className="text-secondary">
                        Resume content considered during the analysis
                      </small>
                    </div>
                  </div>

                  {openSections.evidence ? (
                    <FaChevronDown className="text-secondary" />
                  ) : (
                    <FaChevronRight className="text-secondary" />
                  )}
                </div>
              </button>

              {openSections.evidence && (
                <div className="border-top p-4 p-lg-5">
                  <div
                    className="position-relative"
                    style={{
                      minHeight: '240px',
                    }}
                  >
                    {evidence.map(renderEvidence)}

                    {renderLockedOverlay(
                      'Unlock Resume Evidence'
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {unsupportedClaimWarnings.length > 0 && (
          <section className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
            <div className="card-body p-0 position-relative">
              <button
                type="button"
                className="btn w-100 text-start border-0 bg-white p-4 p-lg-5"
                onClick={() =>
                  toggleSection('claimVerification')
                }
              >
                <div className="d-flex align-items-center justify-content-between gap-3">
                  <div className="d-flex align-items-center">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-3 me-3"
                      style={{
                        width: '42px',
                        height: '42px',
                        backgroundColor: '#fff4df',
                      }}
                    >
                      <FaExclamationTriangle className="text-warning" />
                    </div>

                    <div>
                      <h5 className="fw-bold mb-1">
                        Claim Verification
                      </h5>

                      <small className="text-secondary">
                        Review claims that may need verification
                      </small>
                    </div>
                  </div>

                  {openSections.claimVerification ? (
                    <FaChevronDown className="text-secondary" />
                  ) : (
                    <FaChevronRight className="text-secondary" />
                  )}
                </div>
              </button>

              {openSections.claimVerification && (
                <div className="border-top p-4 p-lg-5">
                  <div
                    className="position-relative"
                    style={{
                      minHeight: '180px',
                    }}
                  >
                    <div>
                      {unsupportedClaimWarnings.map(
                        (warning, index) => (
                          <div
                            key={index}
                            className="p-4 rounded-4 mb-3 border"
                            style={{
                              backgroundColor: '#fffaf0',
                            }}
                          >
                            <div className="d-flex align-items-start">
                              <FaExclamationTriangle className="text-warning mt-1 me-3 flex-shrink-0" />

                              <p className="mb-0 text-secondary lh-lg">
                                {warning}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>

                    {renderLockedOverlay(
                      'Unlock Claim Verification'
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        <div
          className="card border-0 rounded-4 mb-5"
          style={{
            backgroundColor: premiumUnlocked
              ? '#eaf7ee'
              : '#f7f7f8',
          }}
        >
          <div className="card-body p-4">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div className="d-flex align-items-center gap-3">
                <div
                  className={`rounded-circle d-flex align-items-center justify-content-center ${
                    premiumUnlocked
                      ? 'bg-success text-white'
                      : 'bg-primary text-white'
                  }`}
                  style={{
                    width: '42px',
                    height: '42px',
                  }}
                >
                  {premiumUnlocked ? (
                    <FaCheckCircle />
                  ) : (
                    <FaLock />
                  )}
                </div>

                <div>
                  <div className="fw-bold">
                    {premiumUnlocked
                      ? 'Full Analysis Unlocked'
                      : 'More detailed analysis available'}
                  </div>

                  <small className="text-secondary">
                    {premiumUnlocked
                      ? 'You can now view all premium analysis details.'
                      : 'Unlock the detailed recommendations, reasoning and evidence.'}
                  </small>
                </div>
              </div>

              {!premiumUnlocked && (
                <button
                  type="button"
                  className="btn btn-primary rounded-3 px-4 fw-semibold"
                  onClick={handleUnlock}
                >
                  <FaLock className="me-2" />
                  Unlock Full Analysis
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showUnlockModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.35)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 1060,
            padding: '20px',
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowUnlockModal(false);
            }
          }}
        >
          <div
            className="bg-white rounded-4 shadow-lg"
            style={{
              width: '100%',
              maxWidth: '410px',
            }}
          >
            <div className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center"
                    style={{
                      width: '44px',
                      height: '44px',
                      backgroundColor: '#edf3ff',
                      color: '#0d6efd',
                    }}
                  >
                    <FaLock />
                  </div>

                  <div>
                    <div
                      className="small fw-bold text-primary"
                      style={{
                        letterSpacing: '0.5px',
                      }}
                    >
                      PREMIUM PREVIEW
                    </div>

                    <h5 className="fw-bold mb-0 mt-1">
                      Unlock this analysis
                    </h5>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-light rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: '32px',
                    height: '32px',
                  }}
                  onClick={() => setShowUnlockModal(false)}
                >
                  <FaTimes size={12} />
                </button>
              </div>

              <p className="text-secondary mb-4 lh-lg">
                Continue to view the complete ATS analysis, including
                detailed recommendations, score reasoning, resume evidence
                and all remaining details.
              </p>

              <div className="d-flex align-items-center gap-3 mb-4">
                <FaCheckCircle className="text-success flex-shrink-0" />
                <span className="small text-secondary">
                  Full recommendations
                </span>
              </div>

              <div className="d-flex align-items-center gap-3 mb-4">
                <FaCheckCircle className="text-success flex-shrink-0" />
                <span className="small text-secondary">
                  Detailed score reasoning
                </span>
              </div>

              <div className="d-flex align-items-center gap-3 mb-4">
                <FaCheckCircle className="text-success flex-shrink-0" />
                <span className="small text-secondary">
                  Complete resume evidence
                </span>
              </div>

              <button
                type="button"
                className="btn btn-primary w-100 rounded-3 py-2 fw-semibold"
                onClick={continueWithDemo}
              >
                Continue
                <FaChevronRight className="ms-2" size={12} />
              </button>

              <div className="text-center mt-3">
                <small className="text-muted">
                  Demo access is enabled while premium billing is being
                  implemented.
                </small>
              </div>
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  );
};

export default AtsAnalysis;

