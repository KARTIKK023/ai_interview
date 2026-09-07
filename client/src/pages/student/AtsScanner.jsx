import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout';
import API from '../../services/api';
import toast from 'react-hot-toast';
import {
  FaArrowLeft,
  FaBriefcase,
  FaBuilding,
  FaCheckCircle,
  FaChevronDown,
  FaClock,
  FaDownload,
  FaEye,
  FaFilePdf,
  FaHistory,
  FaKey,
  FaLightbulb,
  FaMagic,
  
  FaSearch,
  FaShieldAlt,
  FaStar,
  FaUpload,
  FaExclamationTriangle,
  FaTimes,
} from 'react-icons/fa';

/*
|--------------------------------------------------------------------------
| ATS API CONTRACT
|--------------------------------------------------------------------------
| Existing endpoints used by this page:
|   GET  /resume/my-resume
|   GET  /resume/file/:id
|   GET  /target-jobs
|
| ATS endpoints below are the backend contract we will add:
|   GET  /ats/scans
|       -> student's ATS scan history
|
|   POST /ats/scan
|       body: { resumeId, targetJobId }
|       -> creates a new scan OR returns the existing scan for the same
|          resume version + target job
|
|   GET  /ats/scans/:scanId
|       -> returns one complete ATS analysis
|
|   POST /ats/scans/:scanId/optimize
|       -> generates target-job-specific optimized resume
|
|   GET /ats/scans/:scanId/optimized-resume
|       -> downloads/streams optimized PDF
|
| IMPORTANT:
| The existing repository currently has no dedicated ATS backend route.
| Do not silently replace these URLs with interview/resume endpoints.
|--------------------------------------------------------------------------
*/

const ATS_ENDPOINTS = {
  scans: '/ats/scans',
  scan: '/ats/scan',
  scanById: (id) => `/ats/scans/${id}`,
  optimize: (id) => `/ats/scans/${id}/optimize`,
  optimizedResume: (id) => `/ats/scans/${id}/optimized-resume`,
};

const scoreLabel = (score) => {
  if (score >= 85) return { label: 'Excellent Match', className: 'text-success' };
  if (score >= 70) return { label: 'Strong Match', className: 'text-primary' };
  if (score >= 55) return { label: 'Moderate Match', className: 'text-warning' };
  return { label: 'Needs Improvement', className: 'text-danger' };
};

const scoreBarClass = (score) => {
  if (score >= 85) return 'bg-success';
  if (score >= 70) return 'bg-primary';
  if (score >= 55) return 'bg-warning';
  return 'bg-danger';
};

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const normalizeScan = (scan) => {
  const score = scan?.scores || {};
  return {
    ...scan,
    overallScore: scan?.overallScore ?? scan?.score ?? 0,
    scores: {
      atsCompatibility: score.atsCompatibility ?? scan?.atsCompatibilityScore ?? 0,
      keywordMatch: score.keywordMatch ?? scan?.keywordMatchScore ?? 0,
      skillsMatch: score.skillsMatch ?? scan?.skillsMatchScore ?? 0,
      experience: score.experience ?? scan?.experienceScore ?? 0,
      education: score.education ?? scan?.educationScore ?? 0,
      formatting: score.formatting ?? scan?.formattingScore ?? 0,
    },
    matchedSkills: scan?.matchedSkills || scan?.skills?.matched || [],
    missingSkills: scan?.missingSkills || scan?.skills?.missing || [],
    matchedKeywords: scan?.matchedKeywords || scan?.keywords?.matched || [],
    missingKeywords: scan?.missingKeywords || scan?.keywords?.missing || [],
    criticalKeywords: scan?.criticalKeywords || [],
    strengths: scan?.strengths || [],
    weaknesses: scan?.weaknesses || [],
    improvements: scan?.improvements || [],
    optimization: scan?.optimization || null,
  };
};

const AtsScanner = () => {
  const [resume, setResume] = useState(null);
  const [targetJobs, setTargetJobs] = useState([]);
  const [selectedTargetJobId, setSelectedTargetJobId] = useState('');

  const [loadingResume, setLoadingResume] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [history, setHistory] = useState([]);
  const [analysis, setAnalysis] = useState(null);

  const [checking, setChecking] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showHistory, setShowHistory] = useState(true);
  const [error, setError] = useState('');

  const selectedTargetJob = useMemo(
    () => targetJobs.find((job) => job._id === selectedTargetJobId) || null,
    [targetJobs, selectedTargetJobId]
  );

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (resume && targetJobs.length > 0) {
      fetchHistory();
    }
  }, [resume?._id, targetJobs.length]);

  const loadInitialData = async () => {
    await Promise.all([fetchResume(), fetchTargetJobs()]);
  };

  const fetchResume = async () => {
    try {
      setLoadingResume(true);
      const res = await API.get('/resume/my-resume');
      setResume(res?.data?.resume || null);
    } catch (err) {
      console.error('ATS resume fetch error:', err);
      setResume(null);
      toast.error(err.response?.data?.message || 'Failed to load your resume');
    } finally {
      setLoadingResume(false);
    }
  };

  const fetchTargetJobs = async () => {
    try {
      setLoadingJobs(true);
      const res = await API.get('/target-jobs');
      const jobs = res?.data?.targetJobs || [];

      setTargetJobs(jobs);

      if (jobs.length > 0) {
        setSelectedTargetJobId((current) => current || jobs[0]._id);
      }
    } catch (err) {
      console.error('ATS target jobs fetch error:', err);
      setTargetJobs([]);
      toast.error(err.response?.data?.message || 'Failed to load Target Jobs');
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchHistory = async () => {
    if (!resume) return;

    try {
      setLoadingHistory(true);

      /*
       * Backend contract:
       * GET /ats/scans
       *
       * The backend should return scans belonging to the authenticated student.
       * Prefer returning all recent scans; frontend can display the selected
       * resume's history.
       */
      const res = await API.get(ATS_ENDPOINTS.scans);
      const scans = (res?.data?.scans || []).map(normalizeScan);

      const resumeScans = scans.filter(
        (scan) =>
          String(scan.resume?._id || scan.resumeId || scan.resume) ===
            String(resume._id) ||
          String(scan.resumeHash || '') === String(resume.resumeHash || '')
      );

      setHistory(resumeScans);
    } catch (err) {
      /*
       * ATS backend is not present in the current repository yet.
       * Keep the page usable instead of showing a hard error on initial load.
       */
      console.warn('ATS history endpoint is not available yet:', err);
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleTargetJobChange = async (e) => {
    const jobId = e.target.value;
    setSelectedTargetJobId(jobId);
    setAnalysis(null);
    setActiveTab('overview');

    /*
     * When the backend exists, this can immediately load an existing scan
     * for Resume + Target Job instead of requiring another analysis.
     */
    if (resume && jobId) {
      await loadExistingScan(jobId);
    }
  };

  const loadExistingScan = async (jobId = selectedTargetJobId) => {
    if (!resume || !jobId) return;

    try {
      setLoadingHistory(true);

      const res = await API.get(ATS_ENDPOINTS.scans, {
        params: {
          resumeId: resume._id,
          targetJobId: jobId,
        },
      });

      const scans = (res?.data?.scans || []).map(normalizeScan);

      if (scans.length > 0) {
        const latest = scans[0];
        setAnalysis(latest);
        setHistory((current) => {
          const merged = [latest, ...current.filter((item) => item._id !== latest._id)];
          return merged;
        });
      } else {
        setAnalysis(null);
      }
    } catch (err) {
      console.warn('Could not load existing ATS scan:', err);
      setAnalysis(null);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCheckScore = async () => {
    if (!resume) {
      toast.error('Please upload your resume first.');
      return;
    }

    if (!selectedTargetJob) {
      toast.error('Please select a Target Job first.');
      return;
    }

    try {
      setChecking(true);
      setError('');

      /*
       * IMPORTANT:
       * The backend should make Resume + Resume Version/Hash + Target Job
       * the idempotency key.
       *
       * Therefore clicking this button again for the same resume and target
       * job must return the existing scan instead of creating another scan.
       */
      const res = await API.post(ATS_ENDPOINTS.scan, {
        resumeId: resume._id,
        targetJobId: selectedTargetJob._id,
      });

      if (!res?.data?.scan) {
        throw new Error('No ATS analysis was returned.');
      }

      const result = normalizeScan(res.data.scan);

      setAnalysis(result);
      setHistory((current) => [
        result,
        ...current.filter((item) => item._id !== result._id),
      ]);
      setActiveTab('overview');

      toast.success(
        res?.data?.cached
          ? 'Existing ATS analysis loaded'
          : 'ATS score generated successfully'
      );
    } catch (err) {
      console.error('ATS analysis error:', err);

      const message =
        err.response?.data?.message ||
        'ATS analysis could not be completed. Please try again.';

      setError(message);
      toast.error(message);
    } finally {
      setChecking(false);
    }
  };

  const handleViewHistory = async (scan) => {
    if (!scan?._id) return;

    try {
      const res = await API.get(ATS_ENDPOINTS.scanById(scan._id));
      setAnalysis(normalizeScan(res?.data?.scan || scan));
      setActiveTab('overview');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('ATS history detail error:', err);
      setAnalysis(scan);
      setActiveTab('overview');
    }
  };

  const handleOptimize = async () => {
    if (!analysis?._id) {
      toast.error('Please generate an ATS analysis first.');
      return;
    }

    try {
      setOptimizing(true);

      const res = await API.post(ATS_ENDPOINTS.optimize(analysis._id));

      const updated = normalizeScan({
        ...analysis,
        ...(res?.data?.scan || {}),
        optimization:
          res?.data?.optimization || analysis.optimization,
      });

      setAnalysis(updated);
      setActiveTab('optimization');
      toast.success('Target-job optimized resume generated');
    } catch (err) {
      console.error('ATS optimization error:', err);
      toast.error(
        err.response?.data?.message ||
          'Resume optimization could not be completed'
      );
    } finally {
      setOptimizing(false);
    }
  };

  const handleDownloadOptimized = async () => {
    if (!analysis?._id) return;

    try {
      const response = await API.get(
        ATS_ENDPOINTS.optimizedResume(analysis._id),
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], {
        type: 'application/pdf',
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = `ATS-Optimized-${selectedTargetJob?.target_job_role || 'Resume'}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Optimized resume download error:', err);
      toast.error(
        err.response?.data?.message ||
          'Failed to download optimized resume'
      );
    }
  };

  const handleViewOriginalResume = async () => {
    if (!resume?._id) return;

    try {
      const response = await API.get(`/resume/file/${resume._id}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: 'application/pdf',
      });

      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      console.error('Resume preview error:', err);
      toast.error('Failed to open resume');
    }
  };

  const renderScore = (score) => {
    const meta = scoreLabel(score);

    return (
      <div className="text-center">
        <div
          className="mx-auto d-flex align-items-center justify-content-center rounded-circle border border-5"
          style={{
            width: 170,
            height: 170,
            borderColor: 'rgba(13, 110, 253, 0.15)',
            background:
              'radial-gradient(circle, rgba(13,110,253,.08), rgba(255,255,255,1))',
          }}
        >
          <div>
            <div className="display-4 fw-bold text-primary">{score}</div>
            <div className="small text-muted fw-semibold">OUT OF 100</div>
          </div>
        </div>

        <h5 className={`fw-bold mt-3 mb-1 ${meta.className}`}>
          {meta.label}
        </h5>

        <p className="small text-muted mb-0">
          Based on your resume against the selected Target Job
        </p>
      </div>
    );
  };

  const renderMetric = (label, score, icon) => (
    <div className="p-3 bg-light rounded-3 border h-100">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="small fw-semibold text-muted">{label}</span>
        <span className="text-primary">{icon}</span>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="fw-bold fs-5">{score}/100</span>
      </div>

      <div className="progress" style={{ height: 7 }}>
        <div
          className={`progress-bar ${scoreBarClass(score)}`}
          style={{ width: `${Math.max(0, Math.min(score, 100))}%` }}
        />
      </div>
    </div>
  );

  const renderList = (items, emptyText, type = 'default') => {
    if (!items?.length) {
      return (
        <div className="text-muted small py-3">
          {emptyText}
        </div>
      );
    }

    return (
      <div className="d-flex flex-column gap-2">
        {items.map((item, index) => {
          const value =
            typeof item === 'string'
              ? item
              : item?.name || item?.keyword || item?.text || item?.suggestion || JSON.stringify(item);

          return (
            <div
              key={`${value}-${index}`}
              className="d-flex align-items-start gap-2 p-2 rounded-3 border bg-white"
            >
              {type === 'missing' ? (
                <FaExclamationTriangle className="text-warning mt-1 flex-shrink-0" />
              ) : type === 'matched' ? (
                <FaCheckCircle className="text-success mt-1 flex-shrink-0" />
              ) : (
                <span className="text-primary mt-1">•</span>
              )}

              <span className="small text-dark">{value}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderAnalysisContent = () => {
    if (!analysis) return null;

    const normalized = normalizeScan(analysis);
    const score = normalized.overallScore;

    return (
      <div className="mt-4">
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="card-body p-4 p-lg-5">
            <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
              <div>
                <span className="badge bg-primary bg-opacity-10 text-primary border border-primary px-3 py-2 rounded-pill">
                  ATS Analysis
                </span>

                <h4 className="fw-bold mt-2 mb-1">
                  {selectedTargetJob?.target_job_role ||
                    normalized.jobTitle ||
                    'Target Job'}
                </h4>

                <p className="text-muted small mb-0">
                  {selectedTargetJob?.target_company ||
                    normalized.company ||
                    'Company not specified'}
                  {' • '}
                  Analyzed {formatDate(normalized.createdAt)}
                </p>
              </div>

              {normalized.accessSnapshot?.isPremium ? (
                <span className="badge bg-warning text-dark px-3 py-2">
                  <FaStar className="me-1" /> Premium
                </span>
              ) : (
                <span className="badge bg-secondary px-3 py-2">
                  Free Plan
                </span>
              )}
            </div>

            <div className="row g-4 align-items-center">
              <div className="col-lg-4">{renderScore(score)}</div>

              <div className="col-lg-8">
                <div className="row g-3">
                  <div className="col-md-6">
                    {renderMetric(
                      'ATS Compatibility',
                      normalized.scores.atsCompatibility,
                      <FaShieldAlt />
                    )}
                  </div>

                  <div className="col-md-6">
                    {renderMetric(
                      'Keyword Match',
                      normalized.scores.keywordMatch,
                      <FaKey />
                    )}
                  </div>

                  <div className="col-md-6">
                    {renderMetric(
                      'Skills Match',
                      normalized.scores.skillsMatch,
                      <FaStar />
                    )}
                  </div>

                  <div className="col-md-6">
                    {renderMetric(
                      'Experience Relevance',
                      normalized.scores.experience,
                      <FaBriefcase />
                    )}
                  </div>

                  <div className="col-md-6">
                    {renderMetric(
                      'Education',
                      normalized.scores.education,
                      <FaCheckCircle />
                    )}
                  </div>

                  <div className="col-md-6">
                    {renderMetric(
                      'Formatting',
                      normalized.scores.formatting,
                      <FaFilePdf />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-top mt-5 pt-4">
              <div className="d-flex flex-wrap gap-2">
                {[
                  ['overview', 'Overview'],
                  ['skills', 'Skills'],
                  ['keywords', 'Keywords'],
                  ['improvements', 'Improvements'],
                  ['optimization', 'Resume Optimization'],
                  ['download', 'Download'],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                      activeTab === key
                        ? 'btn-primary'
                        : 'btn-outline-secondary'
                    }`}
                    onClick={() => setActiveTab(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === 'overview' && (
              <div className="row g-4 mt-1">
                <div className="col-lg-6">
                  <div className="h-100 p-4 rounded-4 border bg-light">
                    <h6 className="fw-bold mb-3">
                      <FaCheckCircle className="text-success me-2" />
                      Strengths
                    </h6>
                    {renderList(
                      normalized.strengths,
                      'No strengths were returned yet.',
                      'matched'
                    )}
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="h-100 p-4 rounded-4 border bg-light">
                    <h6 className="fw-bold mb-3">
                      <FaExclamationTriangle className="text-warning me-2" />
                      Areas to Improve
                    </h6>
                    {renderList(
                      normalized.weaknesses,
                      'No major weaknesses were returned.'
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="row g-4 mt-1">
                <div className="col-lg-6">
                  <div className="p-4 rounded-4 border h-100">
                    <h6 className="fw-bold mb-3 text-success">
                      <FaCheckCircle className="me-2" />
                      Matched Skills
                    </h6>

                    {renderList(
                      normalized.matchedSkills,
                      'No matched skills found.',
                      'matched'
                    )}
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="p-4 rounded-4 border h-100">
                    <h6 className="fw-bold mb-3 text-warning">
                      <FaExclamationTriangle className="me-2" />
                      Missing / Weak Skills
                    </h6>

                    <p className="small text-muted">
                      These are skills that were not sufficiently detected in
                      your resume for this Target Job. They do not automatically
                      mean you do not have the skill.
                    </p>

                    {renderList(
                      normalized.missingSkills,
                      'No missing skills were identified.',
                      'missing'
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'keywords' && (
              <div className="row g-4 mt-1">
                <div className="col-lg-6">
                  <div className="p-4 rounded-4 border h-100">
                    <h6 className="fw-bold mb-3 text-success">
                      <FaCheckCircle className="me-2" />
                      Matched Keywords
                    </h6>

                    {renderList(
                      normalized.matchedKeywords,
                      'No matched keywords found.',
                      'matched'
                    )}
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="p-4 rounded-4 border h-100">
                    <h6 className="fw-bold mb-3 text-warning">
                      <FaKey className="me-2" />
                      Missing Keywords
                    </h6>

                    {renderList(
                      normalized.missingKeywords,
                      'No missing keywords identified.',
                      'missing'
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'improvements' && (
              <div className="mt-3">
                <div className="p-4 rounded-4 border bg-light">
                  <h6 className="fw-bold mb-3">
                    <FaLightbulb className="text-warning me-2" />
                    Recommended Resume Improvements
                  </h6>

                  {renderList(
                    normalized.improvements,
                    'No improvement suggestions were returned.'
                  )}
                </div>
              </div>
            )}

            {activeTab === 'optimization' && (
              <div className="mt-3">
                {!normalized.optimization ? (
                  <div className="p-5 text-center rounded-4 border bg-light">
                    <FaMagic className="text-primary fs-1 mb-3" />

                    <h5 className="fw-bold">
                      Optimize Your Resume for This Job
                    </h5>

                    <p className="text-muted small mx-auto" style={{ maxWidth: 600 }}>
                      Generate an AI-optimized version of your resume using the
                      selected Target Job while preserving your real experience
                      and qualifications.
                    </p>

                    <button
                      type="button"
                      className="btn btn-primary px-4 py-2 fw-semibold"
                      onClick={handleOptimize}
                      disabled={optimizing}
                    >
                      <FaMagic className="me-2" />
                      {optimizing
                        ? 'Generating Optimized Resume...'
                        : 'Generate Optimized Resume'}
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-4 border bg-light">
                    <div className="d-flex align-items-start gap-3">
                      <div className="rounded-circle bg-success bg-opacity-10 p-3">
                        <FaCheckCircle className="text-success fs-4" />
                      </div>

                      <div className="flex-grow-1">
                        <h5 className="fw-bold mb-1">
                          Optimized Resume Ready
                        </h5>

                        <p className="text-muted small mb-3">
                          Your resume has been optimized specifically for{' '}
                          <strong>
                            {selectedTargetJob?.target_job_role}
                          </strong>
                          .
                        </p>

                        <div className="d-flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="btn btn-primary fw-semibold"
                            onClick={handleDownloadOptimized}
                          >
                            <FaDownload className="me-2" />
                            Download Optimized Resume
                          </button>

                          <button
                            type="button"
                            className="btn btn-outline-secondary fw-semibold"
                            onClick={() => setActiveTab('download')}
                          >
                            View Download Options
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'download' && (
              <div className="row g-4 mt-3">
                <div className="col-md-6">
                  <div className="p-4 rounded-4 border h-100">
                    <FaFilePdf className="text-danger fs-2 mb-3" />
                    <h6 className="fw-bold">Original Resume</h6>
                    <p className="small text-muted">
                      Open your currently uploaded resume.
                    </p>

                    <button
                      type="button"
                      className="btn btn-outline-primary fw-semibold"
                      onClick={handleViewOriginalResume}
                    >
                      <FaEye className="me-2" />
                      View Original Resume
                    </button>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="p-4 rounded-4 border h-100">
                    <FaMagic className="text-primary fs-2 mb-3" />
                    <h6 className="fw-bold">AI-Optimized Resume</h6>
                    <p className="small text-muted">
                      Download the version optimized for the selected Target Job.
                    </p>

                    {normalized.optimization ? (
                      <button
                        type="button"
                        className="btn btn-primary fw-semibold"
                        onClick={handleDownloadOptimized}
                      >
                        <FaDownload className="me-2" />
                        Download Optimized Resume
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-outline-primary fw-semibold"
                        onClick={() => setActiveTab('optimization')}
                      >
                        <FaMagic className="me-2" />
                        Generate First
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <StudentLayout>
      <div className="container-fluid px-3 px-lg-4 py-3">
        <div className="mx-auto" style={{ maxWidth: 1100 }}>
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
              <Link
                to="/student/dashboard"
                className="text-decoration-none small fw-semibold text-muted"
              >
                <FaArrowLeft className="me-2" />
                Back to Dashboard
              </Link>

              <h2 className="fw-bold mt-2 mb-1">
                ATS Resume Checker
              </h2>

              <p className="text-muted mb-0">
                Check how well your resume matches a specific Target Job.
              </p>
            </div>

            <div className="d-flex gap-2">
              <Link
                to="/student/resume"
                className="btn btn-outline-secondary btn-sm fw-semibold"
              >
                <FaUpload className="me-2" />
                Manage Resume
              </Link>

              <Link
                to="/student/target-jobs"
                className="btn btn-outline-primary btn-sm fw-semibold"
              >
                <FaBriefcase className="me-2" />
                Target Jobs
              </Link>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2">
              <FaExclamationTriangle />
              <span className="small">{error}</span>

              <button
                type="button"
                className="btn-close ms-auto"
                onClick={() => setError('')}
              />
            </div>
          )}

          {loadingResume ? (
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-5 text-center">
                <div className="spinner-border text-primary" />
                <p className="text-muted small mt-3 mb-0">
                  Loading your resume...
                </p>
              </div>
            </div>
          ) : !resume ? (
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-5 text-center">
                <div
                  className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-danger bg-opacity-10"
                  style={{ width: 90, height: 90 }}
                >
                  <FaFilePdf className="text-danger fs-1" />
                </div>

                <h4 className="fw-bold">Upload Your Resume First</h4>

                <p
                  className="text-muted small mx-auto mb-4"
                  style={{ maxWidth: 560 }}
                >
                  ATS analysis uses your uploaded resume and compares it
                  against the Target Job you select.
                </p>

                <Link
                  to="/student/resume"
                  className="btn btn-primary px-4 py-2 fw-semibold"
                >
                  <FaUpload className="me-2" />
                  Upload Resume
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="card border-0 shadow-sm rounded-4 mb-4">
                <div className="card-body p-4">
                  <div className="row g-4 align-items-end">
                    <div className="col-lg-5">
                      <label className="form-label fw-bold small text-uppercase text-muted">
                        Your Resume
                      </label>

                      <div className="p-3 rounded-3 border bg-light d-flex align-items-center gap-3">
                        <div className="rounded-3 bg-danger bg-opacity-10 p-3">
                          <FaFilePdf className="text-danger fs-4" />
                        </div>

                        <div className="min-w-0 flex-grow-1">
                          <div className="fw-bold text-dark text-truncate">
                            {resume.resume_file?.fileName || 'Resume.pdf'}
                          </div>

                          <div className="small text-muted">
                            Uploaded {formatDate(resume.createdAt)}
                          </div>
                        </div>

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary flex-shrink-0"
                          onClick={handleViewOriginalResume}
                        >
                          <FaEye className="me-1" />
                          View
                        </button>
                      </div>
                    </div>

                    <div className="col-lg-5">
                      <label className="form-label fw-bold small text-uppercase text-muted">
                        Select Target Job
                      </label>

                      {loadingJobs ? (
                        <div className="form-control text-muted">
                          Loading Target Jobs...
                        </div>
                      ) : targetJobs.length === 0 ? (
                        <div className="p-3 rounded-3 border border-warning bg-warning bg-opacity-10">
                          <div className="fw-bold small">
                            No Target Jobs Found
                          </div>

                          <div className="small text-muted mb-2">
                            Add a Target Job before checking your ATS score.
                          </div>

                          <Link
                            to="/student/target-jobs"
                            className="btn btn-sm btn-warning fw-semibold"
                          >
                            <FaBriefcase className="me-1" />
                            Add Target Job
                          </Link>
                        </div>
                      ) : (
                        <div className="position-relative">
                          <select
                            className="form-select form-select-lg fw-semibold"
                            value={selectedTargetJobId}
                            onChange={handleTargetJobChange}
                          >
                            {targetJobs.map((job) => (
                              <option key={job._id} value={job._id}>
                                🎯 {job.target_job_role}
                                {job.target_company
                                  ? ` — ${job.target_company}`
                                  : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="col-lg-2">
                      <button
                        type="button"
                        className="btn btn-primary btn-lg w-100 fw-bold"
                        onClick={handleCheckScore}
                        disabled={
                          checking ||
                          loadingJobs ||
                          !resume ||
                          !selectedTargetJob
                        }
                      >
                        {checking ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Checking...
                          </>
                        ) : (
                          <>
                            <FaSearch className="me-2" />
                            Check ATS
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {selectedTargetJob && (
                    <div className="mt-4 p-3 rounded-3 bg-light border">
                      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                        <h6 className="fw-bold mb-0">
                          <FaBuilding className="text-primary me-2" />
                          Target Job Context
                        </h6>

                        <span className="badge bg-success">
                          {selectedTargetJob.target_industry || 'Industry'}
                        </span>
                      </div>

                      <div className="row g-3 small">
                        <div className="col-md-4">
                          <div className="text-muted">Role</div>
                          <div className="fw-bold">
                            {selectedTargetJob.target_job_role || '—'}
                          </div>
                        </div>

                        <div className="col-md-4">
                          <div className="text-muted">Company</div>
                          <div className="fw-bold">
                            {selectedTargetJob.target_company || 'Not Specified'}
                          </div>
                        </div>

                        <div className="col-md-4">
                          <div className="text-muted">Experience</div>
                          <div className="fw-bold">
                            {selectedTargetJob.experience || 'Fresher'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {analysis ? (
                renderAnalysisContent()
              ) : (
                <div className="card border-0 shadow-sm rounded-4 mb-4">
                  <div className="card-body p-5 text-center">
                    <div
                      className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10"
                      style={{ width: 90, height: 90 }}
                    >
                      <FaSearch className="text-primary fs-1" />
                    </div>

                    <h4 className="fw-bold">
                      Ready to Check Your ATS Score?
                    </h4>

                    <p
                      className="text-muted small mx-auto mb-0"
                      style={{ maxWidth: 620 }}
                    >
                      Select a Target Job above and click{' '}
                      <strong>Check ATS</strong>. If an analysis already exists
                      for this same resume and Target Job, the saved result will
                      be loaded instead of analyzing the resume again.
                    </p>
                  </div>
                </div>
              )}

              <div className="card border-0 shadow-sm rounded-4 mt-4">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center justify-content-between gap-3">
                    <div>
                      <h5 className="fw-bold mb-1">
                        <FaHistory className="text-primary me-2" />
                        ATS Analysis History
                      </h5>

                      <p className="text-muted small mb-0">
                        Previous analyses for your uploaded resume.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary fw-semibold"
                      onClick={() => {
                        const next = !showHistory;
                        setShowHistory(next);
                        if (next) fetchHistory();
                      }}
                    >
                      <FaChevronDown
                        className="me-1"
                        style={{
                          transform: showHistory
                            ? 'rotate(180deg)'
                            : 'rotate(0deg)',
                          transition: 'transform .2s',
                        }}
                      />
                      {showHistory ? 'Hide' : 'Show'}
                    </button>
                  </div>

                  {showHistory && (
                    <div className="mt-4">
                      {loadingHistory ? (
                        <div className="text-center py-4">
                          <div className="spinner-border spinner-border-sm text-primary" />
                          <div className="small text-muted mt-2">
                            Loading history...
                          </div>
                        </div>
                      ) : history.length === 0 ? (
                        <div className="p-4 rounded-3 bg-light border text-center">
                          <FaHistory className="text-muted fs-2 mb-2" />

                          <div className="fw-semibold">
                            No previous ATS analysis
                          </div>

                          <div className="small text-muted">
                            Your first completed analysis will appear here.
                          </div>
                        </div>
                      ) : (
                        <div className="table-responsive">
                          <table className="table align-middle mb-0">
                            <thead>
                              <tr className="small text-muted">
                                <th>Target Job</th>
                                <th>Company</th>
                                <th>Score</th>
                                <th>Analyzed</th>
                                <th className="text-end">Action</th>
                              </tr>
                            </thead>

                            <tbody>
                              {history.map((scan) => {
                                const scanJob =
                                  scan.targetJob ||
                                  scan.target_job ||
                                  {};

                                const scanScore = scan.overallScore || 0;

                                return (
                                  <tr key={scan._id}>
                                    <td>
                                      <div className="fw-semibold">
                                        {scanJob.target_job_role ||
                                          scan.jobTitle ||
                                          'Target Job'}
                                      </div>
                                    </td>

                                    <td className="text-muted small">
                                      {scanJob.target_company ||
                                        scan.company ||
                                        '—'}
                                    </td>

                                    <td>
                                      <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2">
                                        {scanScore}/100
                                      </span>
                                    </td>

                                    <td className="text-muted small">
                                      {formatDate(scan.createdAt)}
                                    </td>

                                    <td className="text-end">
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-primary fw-semibold"
                                        onClick={() =>
                                          handleViewHistory(scan)
                                        }
                                      >
                                        <FaEye className="me-1" />
                                        View
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </StudentLayout>
  );
};

export default AtsScanner;
