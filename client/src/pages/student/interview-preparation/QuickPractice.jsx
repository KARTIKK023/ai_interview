import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import StudentLayout from '../../../components/StudentLayout';
import API from '../../../services/api';

import {
  FaClock,
  FaBolt,
  FaPlay,
  FaExclamationCircle,
  FaBriefcase,
  FaBuilding,
  FaPlus,
  FaHistory,
  FaEye,
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
    'developer',
    'software',
    'engineer',
    'data',
    'python',
    'java',
    'react',
    'node',
    'tech',
    'ai',
    'ml',
    'qa',
    'testing',
    'code',
    'frontend',
    'backend',
    'full stack',
    'cloud',
    'devops',
    'cybersecurity',
    'database',
    'web',
    'architect',
    'mobile',
    'android',
    'ios',
    'flutter',
  ];

  const isTech = techKeywords.some((keyword) =>
    combined.includes(keyword)
  );

  return isTech ? 'Technical' : 'Non-Technical';
};

const QuickPractice = () => {
  const navigate = useNavigate();

  // Target Job state
  const [category, setCategory] = useState('Technical');
  const [targetJobs, setTargetJobs] = useState([]);
  const [selectedTargetJobId, setSelectedTargetJobId] = useState('');
  const [selectedTargetJob, setSelectedTargetJob] = useState(null);
  const [detectedDomain, setDetectedDomain] = useState('Technical');

  // Page state
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  // History state
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch target jobs when page loads
  useEffect(() => {
    fetchMyTargetJobs();
  }, []);

  // Fetch student's saved target jobs
  const fetchMyTargetJobs = async () => {
    try {
      setLoadingJobs(true);
      setError('');

      const res = await API.get('/target-jobs');

      if (
        res.data &&
        res.data.targetJobs &&
        res.data.targetJobs.length > 0
      ) {
        const jobs = res.data.targetJobs;

        setTargetJobs(jobs);

        // Automatically select the first saved Target Job
        const firstJob = jobs[0];

        setSelectedTargetJobId(firstJob._id);
        setSelectedTargetJob(firstJob);

        // Automatically detect Technical / Non-Technical
        const detected = detectDomainCategory(firstJob);

        setDetectedDomain(detected);
        setCategory(detected);
      } else {
        setTargetJobs([]);
        setSelectedTargetJobId('');
        setSelectedTargetJob(null);
      }
    } catch (err) {
      console.error('Error fetching target jobs:', err);

      setError('Failed to load your Target Jobs.');
      toast.error('Failed to load target jobs');
    } finally {
      setLoadingJobs(false);
    }
  };

  // Handle Target Job selection
  const handleSelectJobChange = (jobId) => {
    setSelectedTargetJobId(jobId);

    const job = targetJobs.find((item) => item._id === jobId);

    if (job) {
      setSelectedTargetJob(job);

      const detected = detectDomainCategory(job);

      setDetectedDomain(detected);
      setCategory(detected);
    }
  };

  // Fetch interview history
  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);

      const res = await API.get('/interviews');

      if (res.data && res.data.interviews) {
        // Only show Practice interviews
        const practiceHistory = res.data.interviews.filter(
          (item) => item.purpose === 'Practice'
        );

        setHistory(practiceHistory);
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error('Failed to fetch interview history:', err);
      toast.error('Failed to load practice history');
    } finally {
      setLoadingHistory(false);
    }
  };

  // Toggle history section
  const handleToggleHistory = () => {
    const nextState = !showHistory;

    setShowHistory(nextState);

    if (nextState) {
      fetchHistory();
    }
  };

  // Start Quick Practice session
  const handleStartQuickSession = async (e) => {
    e.preventDefault();

    if (!selectedTargetJob) {
      setError('Please select or add a Target Job first.');
      return;
    }

    try {
      setStarting(true);
      setError('');

      const res = await API.post('/interviews', {
        title: `Quick 5-Min Practice - ${selectedTargetJob.target_job_role}`,
        targetJobId: selectedTargetJob._id,
        category: detectedDomain,
        jobRole: selectedTargetJob.target_job_role,
        purpose: 'Practice',
        mode: 'Text',
        difficulty: 'Intermediate',
        level: 3,
        questionCount: 20,
        duration: 5,
      });

      if (res.data.interview) {
        const interviewId = res.data.interview._id;

        toast.success('Quick Practice session created!');

        navigate(`/student/interview-text/${interviewId}`);
      } else {
        setError('Interview was not created. Please try again.');
        setStarting(false);
      }
    } catch (err) {
      console.error('Error starting Quick Practice:', err);

      setError(
        err.response?.data?.message ||
          'Failed to launch Quick Practice session'
      );

      setStarting(false);
    }
  };

  return (
    <StudentLayout>
      <div className="mx-auto" style={{ maxWidth: '750px' }}>
        <div className="card card-custom p-4 shadow-sm text-center">

          {/* Header */}
          <div className="d-flex justify-content-end mb-2">
            <Link
              type="button"
              className="btn btn-outline-secondary btn-sm fw-semibold d-flex align-items-center gap-2"
              to="/student/interviews"
              
            >
              <FaHistory />
               View All Interviews
            
            </Link>
          </div>

          <span className="badge bg-warning bg-opacity-10 text-dark border border-warning px-3 py-1 rounded-pill mx-auto mb-2">
            <FaBolt className="me-1 text-warning" />
            Rapid Warm-up Session
          </span>

          <h3 className="fw-extrabold text-dark">
            Quick 5-Min Practice
          </h3>

          <p className="text-muted small mb-4">
            Test your readiness with 20 fast-paced questions and instant AI
            feedback in just 5 minutes.
          </p>

          

          {/* Error */}
          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 small mb-3 text-start">
              <FaExclamationCircle />
              {error}
            </div>
          )}

          {/* Loading Target Jobs */}
          {loadingJobs ? (
            <div className="p-5 text-center">
              <div className="spinner-border text-warning" role="status">
                <span className="visually-hidden">
                  Loading Target Jobs...
                </span>
              </div>

              <p className="text-muted small mt-2 mb-0">
                Loading your saved Target Jobs...
              </p>
            </div>
          ) : targetJobs.length === 0 ? (
            /* No Target Jobs */
            <div className="p-4 text-center bg-warning bg-opacity-10 border border-warning rounded">
              <FaBriefcase className="text-warning fs-1 mb-3" />

              <h5 className="fw-bold text-dark">
                No Target Jobs Found
              </h5>

              <p className="text-muted small mb-4">
                You haven't added any Target Jobs yet. Add a Target Job first
                so Quick Practice can generate personalized questions.
              </p>

              <Link
                to="/student/target-jobs"
                className="btn btn-warning d-inline-flex align-items-center gap-2 px-4 py-2 fw-bold"
              >
                <FaPlus />
                Add Target Job Now
              </Link>
            </div>
          ) : (
            /* Target Job Available */
            <form onSubmit={handleStartQuickSession} className="text-start">

              {/* Category */}
              <div className="mb-4">
                <label className="form-label fw-bold small text-muted text-uppercase">
                  Interview Category
                </label>

                <div className="d-flex gap-3">
                  <button
                    type="button"
                    className={`btn flex-fill py-3 fw-bold ${
                      category === 'Technical'
                        ? 'btn-primary'
                        : 'btn-outline-secondary'
                    }`}
                    onClick={() => {
                      setCategory('Technical');
                      setDetectedDomain('Technical');
                    }}
                  >
                    💻 Technical
                  </button>

                  <button
                    type="button"
                    className={`btn flex-fill py-3 fw-bold ${
                      category === 'Non-Technical'
                        ? 'btn-success'
                        : 'btn-outline-secondary'
                    }`}
                    onClick={() => {
                      setCategory('Non-Technical');
                      setDetectedDomain('Non-Technical');
                    }}
                  >
                    💼 Non-Technical
                  </button>
                </div>
              </div>

              {/* Target Job */}
              <div className="mb-4">
                <label className="form-label fw-bold small text-muted text-uppercase">
                  Select Target Job ({targetJobs.length} Saved)
                </label>

                {targetJobs.length > 1 ? (
                  <select
                    className="form-select form-select-lg fw-semibold"
                    value={selectedTargetJobId}
                    onChange={(e) =>
                      handleSelectJobChange(e.target.value)
                    }
                  >
                    {targetJobs.map((job) => (
                      <option key={job._id} value={job._id}>
                        🎯 {job.target_job_role}
                        {job.target_company
                          ? ` - ${job.target_company}`
                          : ''}
                        {` (${job.target_industry || 'Industry'})`}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-primary bg-opacity-10 border border-primary rounded d-flex align-items-center gap-3">
                    <FaBriefcase className="text-primary fs-4" />

                    <div>
                      <div className="extra-small text-muted text-uppercase fw-bold">
                        Active Target Job
                      </div>

                      <div className="fw-extrabold text-primary">
                        {selectedTargetJob?.target_job_role}
                      </div>

                      {selectedTargetJob?.target_company && (
                        <small className="text-muted">
                          {selectedTargetJob.target_company}
                        </small>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Target Job Context */}
              {selectedTargetJob && (
                <div className="mb-4 p-3 bg-light rounded border">
                  <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                    <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                      <FaBuilding className="text-primary" />
                      Target Job Context
                    </h6>

                    <span
                      className={`badge ${
                        detectedDomain === 'Technical'
                          ? 'bg-primary'
                          : 'bg-success'
                      }`}
                    >
                      Domain: {detectedDomain}
                    </span>
                  </div>

                  <div className="row g-3 small">
                    <div className="col-md-6">
                      <div className="text-muted extra-small">
                        Target Job Role
                      </div>

                      <div className="fw-bold text-dark">
                        {selectedTargetJob.target_job_role}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="text-muted extra-small">
                        Target Company
                      </div>

                      <div className="fw-bold text-dark">
                        {selectedTargetJob.target_company ||
                          'Not Specified'}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="text-muted extra-small">
                        Target Industry
                      </div>

                      <div className="fw-bold text-dark">
                        {selectedTargetJob.target_industry ||
                          'Not Specified'}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="text-muted extra-small">
                        Experience Level
                      </div>

                      <div className="fw-semibold text-dark">
                        {selectedTargetJob.experience || 'Fresher'}
                      </div>
                    </div>

                    {selectedTargetJob.required_skills &&
                      selectedTargetJob.required_skills.length > 0 && (
                        <div className="col-12 border-top pt-2">
                          <div className="text-muted extra-small mb-1">
                            Required Skills for Questions:
                          </div>

                          <div className="d-flex flex-wrap gap-1">
                            {selectedTargetJob.required_skills.map(
                              (skill, index) => (
                                <span
                                  key={index}
                                  className="badge bg-secondary extra-small"
                                >
                                  {skill}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* Quick Practice Details */}
              <div className="p-3 bg-light rounded border mb-4 d-flex align-items-center justify-content-around text-center">
                <div>
                  <div className="fw-extrabold text-primary fs-4">
                    20
                  </div>

                  <div className="extra-small text-muted">
                    Rapid Questions
                  </div>
                </div>

                <div className="border-end h-100"></div>

                <div>
                  <div className="fw-extrabold text-warning fs-4">
                    <FaClock /> 5 Mins
                  </div>

                  <div className="extra-small text-muted">
                    Time Limit
                  </div>
                </div>

                <div className="border-end h-100"></div>

                <div>
                  <div className="fw-extrabold text-success fs-4">
                    Instant
                  </div>

                  <div className="extra-small text-muted">
                    AI Score & Feedback
                  </div>
                </div>
              </div>

              {/* Start Button */}
              <button
                type="submit"
                className="btn btn-warning w-100 py-3 fw-bold fs-5 text-dark d-flex align-items-center justify-content-center gap-2"
                disabled={starting}
              >
                <FaPlay />

                {starting
                  ? 'Preparing Session...'
                  : 'Start 5-Min Practice Now'}
              </button>
            </form>
          )}
        </div>
      </div>
    </StudentLayout>
  );
};

export default QuickPractice;

