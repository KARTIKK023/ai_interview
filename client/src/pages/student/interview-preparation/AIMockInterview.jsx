import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import StudentLayout from '../../../components/StudentLayout';
import API from '../../../services/api';
import {
  FaRobot,
  FaFont,
  FaVideo,
  FaPlay,
  FaExclamationCircle,
  FaBriefcase,
  FaBuilding,
  FaGraduationCap,
  FaMapMarkerAlt,
  FaClock,
  FaPlus,
  FaLayerGroup
} from 'react-icons/fa';
import toast from 'react-hot-toast';

// Helper to auto-detect domain category
const detectDomainCategory = (job) => {
  if (!job) return 'Technical';
  const roleLower = (job.target_job_role || '').toLowerCase();
  const skillsStr = (job.required_skills || []).join(' ').toLowerCase();
  const descStr = (job.job_description || '').toLowerCase();
  const combined = `${roleLower} ${skillsStr} ${descStr}`;

  const techKeywords = [
    'developer', 'software', 'engineer', 'data', 'python', 'java', 'react', 'node',
    'tech', 'ai', 'ml', 'qa', 'testing', 'code', 'frontend', 'backend', 'full stack',
    'cloud', 'devops', 'cybersecurity', 'database', 'web', 'architect', 'mobile',
    'android', 'ios', 'flutter'
  ];

  const isTech = techKeywords.some((kw) => combined.includes(kw));
  return isTech ? 'Technical' : 'Non-Technical';
};

const AIMockInterview = () => {
  const [searchParams] = useSearchParams();
  const rawLevel = parseInt(searchParams.get('level')) || 1;
  const level = Math.min(Math.max(rawLevel, 1), 10);
  const questionCount = 10 + (level - 1) * 5;

  const [targetJobs, setTargetJobs] = useState([]);
  const [selectedTargetJobId, setSelectedTargetJobId] = useState('');
  const [selectedTargetJob, setSelectedTargetJob] = useState(null);
  const [detectedDomain, setDetectedDomain] = useState('Technical');

  const defaultDifficulty = level <= 2 ? 'Beginner' : level <= 5 ? 'Intermediate' : 'Advanced';
  const [difficulty, setDifficulty] = useState(defaultDifficulty);
  const [mode, setMode] = useState('Text');

  const [loadingJobs, setLoadingJobs] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Fetch student's target jobs on mount
  useEffect(() => {
    fetchMyTargetJobs();
  }, []);

  const fetchMyTargetJobs = async () => {
    try {
      setLoadingJobs(true);
      setError('');
      const res = await API.get('/target-jobs');
      if (res.data && res.data.targetJobs && res.data.targetJobs.length > 0) {
        setTargetJobs(res.data.targetJobs);
        const firstJob = res.data.targetJobs[0];
        setSelectedTargetJobId(firstJob._id);
        setSelectedTargetJob(firstJob);
        setDetectedDomain(detectDomainCategory(firstJob));
      } else {
        setTargetJobs([]);
        setSelectedTargetJobId('');
        setSelectedTargetJob(null);
      }
    } catch (err) {
      console.error('Error fetching target jobs:', err);
      toast.error('Failed to load target jobs');
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleSelectJobChange = (jobId) => {
    setSelectedTargetJobId(jobId);
    const job = targetJobs.find((j) => j._id === jobId);
    if (job) {
      setSelectedTargetJob(job);
      setDetectedDomain(detectDomainCategory(job));
    }
  };

  const handleStartInterview = async (e) => {
    e.preventDefault();
    if (!selectedTargetJob) {
      setError('Please select or add a Target Job first.');
      return;
    }

    try {
      setStarting(true);
      setError('');

      const res = await API.post('/interviews', {
        title: `AI Mock Level ${level} - ${selectedTargetJob.target_job_role}`,
        targetJobId: selectedTargetJob._id,
        category: detectedDomain,
        jobRole: selectedTargetJob.target_job_role,
        purpose: 'Practice',
        mode,
        difficulty,
        level,
        questionCount
      });

      if (res.data.interview) {
        const interviewId = res.data.interview._id;
        toast.success('AI Questions generated successfully!');
        if (mode === 'Video') {
          navigate(`/student/interview-video/${interviewId}`);
        } else {
          navigate(`/student/interview-text/${interviewId}`);
        }
      }
    } catch (err) {
      console.error('Error starting interview:', err);
      setError(err.response?.data?.message || 'Failed to start AI Mock Interview. Please try again.');
      setStarting(false);
    }
  };

  return (
    <StudentLayout>
      <div className="max-w-700 mx-auto" style={{ maxWidth: '820px' }}>
              <div className="card card-custom p-4 shadow-sm">
                <div className="text-center mb-4">
                  <span className="badge bg-primary bg-opacity-10 text-primary border border-primary px-3 py-1 rounded-pill mb-2">
                    <FaRobot className="me-1" /> Personalized AI Mock Interview
                  </span>
                  <h3 className="fw-extrabold text-dark">Target Job AI Mock Interview</h3>
                  <p className="text-muted small">
                    AI automatically generates interview questions based strictly on your saved Target Job preferences and required skills.
                  </p>
                </div>

                {error && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 small mb-3">
                    <FaExclamationCircle /> {error}
                  </div>
                )}

                {loadingJobs ? (
                  <div className="p-5 text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading Target Jobs...</span>
                    </div>
                    <p className="text-muted small mt-2">Loading your saved Target Jobs from MongoDB...</p>
                  </div>
                ) : targetJobs.length === 0 ? (
                  /* NO TARGET JOBS FOUND */
                  <div className="p-4 text-center bg-warning bg-opacity-10 border border-warning rounded">
                    <FaBriefcase className="text-warning fs-1 mb-3" />
                    <h5 className="fw-bold text-dark">No Target Jobs Found</h5>
                    <p className="text-muted small mb-4">
                      You haven’t added any Target Jobs yet. Add a Target Job to generate personalized AI interview questions for your preferred roles and companies.
                    </p>
                    <Link to="/student/target-jobs" className="btn btn-primary d-inline-flex align-items-center gap-2 px-4 py-2">
                      <FaPlus /> Add Target Job Now
                    </Link>
                  </div>
                ) : (
                  /* TARGET JOBS AVAILABLE FORM */
                  <form onSubmit={handleStartInterview}>
                    {/* 1. SELECT TARGET JOB (If Multiple) */}
                    {targetJobs.length > 1 ? (
                      <div className="mb-4">
                        <label className="form-label fw-bold small text-muted text-uppercase">
                          1. Select Target Job ({targetJobs.length} Saved)
                        </label>
                        <select
                          className="form-select form-select-lg fw-semibold"
                          value={selectedTargetJobId}
                          onChange={(e) => handleSelectJobChange(e.target.value)}
                        >
                          {targetJobs.map((job) => (
                            <option key={job._id} value={job._id}>
                              🎯 {job.target_job_role} {job.target_company ? `- ${job.target_company}` : ''} ({job.target_industry || 'Industry'})
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="mb-4 d-flex align-items-center justify-content-between bg-primary bg-opacity-10 p-3 rounded border border-primary">
                        <div className="d-flex align-items-center gap-2">
                          <FaBriefcase className="text-primary fs-4" />
                          <div>
                            <span className="extra-small text-uppercase text-muted fw-bold d-block">Target Job Auto-Selected</span>
                            <h6 className="fw-extrabold text-primary mb-0">{selectedTargetJob?.target_job_role}</h6>
                          </div>
                        </div>
                        <span className="badge bg-primary px-3 py-2">Active Target Job</span>
                      </div>
                    )}

                    {/* 2. TARGET JOB CONTEXT SUMMARY CARD */}
                    {selectedTargetJob && (
                      <div className="mb-4 p-3 bg-light rounded border">
                        <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                          <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                            <FaBuilding className="text-primary" /> Target Job Context
                          </h6>
                          <span className={`badge ${detectedDomain === 'Technical' ? 'bg-primary' : 'bg-success'}`}>
                            Domain: {detectedDomain}
                          </span>
                        </div>

                        <div className="row g-3 small">
                          <div className="col-md-4">
                            <div className="text-muted extra-small">Target Job Role</div>
                            <div className="fw-bold text-dark">{selectedTargetJob.target_job_role}</div>
                          </div>
                          <div className="col-md-4">
                            <div className="text-muted extra-small">Target Company</div>
                            <div className="fw-bold text-dark">{selectedTargetJob.target_company || 'Not Specified'}</div>
                          </div>
                          <div className="col-md-4">
                            <div className="text-muted extra-small">Target Industry</div>
                            <div className="fw-bold text-dark">{selectedTargetJob.target_industry || 'Not Specified'}</div>
                          </div>
                          <div className="col-md-4">
                            <div className="text-muted extra-small">Experience Level</div>
                            <div className="fw-semibold text-dark">{selectedTargetJob.experience || 'Fresher'}</div>
                          </div>
                          <div className="col-md-4">
                            <div className="text-muted extra-small">Preferred Location</div>
                            <div className="fw-semibold text-dark">{selectedTargetJob.preferred_location || 'Flexible'}</div>
                          </div>
                          <div className="col-md-4">
                            <div className="text-muted extra-small">Job Type</div>
                            <div className="fw-semibold text-dark">{selectedTargetJob.job_type || 'Full Time'}</div>
                          </div>
                          {selectedTargetJob.required_skills && selectedTargetJob.required_skills.length > 0 && (
                            <div className="col-12 border-top pt-2">
                              <div className="text-muted extra-small mb-1">Required Skills for Questions:</div>
                              <div className="d-flex flex-wrap gap-1">
                                {selectedTargetJob.required_skills.map((skill, idx) => (
                                  <span key={idx} className="badge bg-secondary extra-small">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 3. INTERVIEW LEVEL */}
                    <div className="mb-4">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <label className="form-label fw-bold small text-muted text-uppercase mb-0">Interview Level</label>
                        <Link to="/student/interview-preparation/ai-mock" className="extra-small text-primary fw-bold text-decoration-none">
                          Change Level
                        </Link>
                      </div>
                      <div className="card bg-primary bg-opacity-10 border border-primary p-3">
                        <div className="d-flex align-items-center justify-content-between">
                          <span className="fw-extrabold text-primary fs-5 d-flex align-items-center gap-2">
                            <FaLayerGroup /> Level {level}
                          </span>
                          <span className="badge bg-primary px-3 py-2 fw-bold">Active Level</span>
                        </div>
                      </div>
                    </div>

                    {/* 4. NUMBER OF QUESTIONS (READ-ONLY) */}
                    <div className="mb-4">
                      <label className="form-label fw-bold small text-muted text-uppercase">Number of Questions</label>
                      <div className="card bg-light border p-3">
                        <div className="d-flex align-items-center justify-content-between">
                          <span className="fw-extrabold text-dark fs-5">{questionCount} Questions</span>
                          <span className="badge bg-dark px-3 py-2 fw-bold">Calculated for Level {level}</span>
                        </div>
                        <small className="text-muted extra-small mt-1 d-block">
                          Question count is automatically set by Level {level} (10 + ({level} - 1) × 5 = {questionCount} Questions).
                        </small>
                      </div>
                    </div>

                    {/* 5. RESPONSE MODE */}
                    <div className="mb-4">
                      <label className="form-label fw-bold small text-muted text-uppercase">Response Mode</label>
                      <div className="row g-3">
                        <div className="col-6">
                          <div
                            className={`card card-custom p-3 text-center ${mode === 'Text' ? 'border-primary bg-primary bg-opacity-10' : ''}`}
                            onClick={() => setMode('Text')}
                            style={{ cursor: 'pointer' }}
                          >
                            <FaFont size={24} className={mode === 'Text' ? 'text-primary' : 'text-muted'} />
                            <h6 className="fw-bold mt-2 mb-0">Text Response</h6>
                            <small className="text-muted">Type answers in real-time</small>
                          </div>
                        </div>
                        <div className="col-6">
                          <div
                            className={`card card-custom p-3 text-center ${mode === 'Video' ? 'border-danger bg-danger bg-opacity-10' : ''}`}
                            onClick={() => setMode('Video')}
                            style={{ cursor: 'pointer' }}
                          >
                            <FaVideo size={24} className={mode === 'Video' ? 'text-danger' : 'text-muted'} />
                            <h6 className="fw-bold mt-2 mb-0">Video & Voice</h6>
                            <small className="text-muted">Camera & AI Speech-to-Text</small>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary-custom w-100 py-3 fw-bold fs-5 d-flex align-items-center justify-content-center gap-2"
                      disabled={starting}
                    >
                      <FaPlay size={16} /> {starting ? 'Generating AI Questions from Target Job...' : 'Start AI Mock Interview'}
                    </button>
                  </form>
                )}
              </div>
            </div>
    </StudentLayout>
  );
};

export default AIMockInterview;
