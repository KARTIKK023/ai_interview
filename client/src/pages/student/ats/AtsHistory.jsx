
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaEye,
  FaTrash,
  FaChartLine,
  FaFileAlt,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import StudentLayout from '../../../components/StudentLayout';
import { atsApi, errorMessage, normalizeScan } from './atsApi';

const scoreClass = (score) =>
  score >= 80 ? 'success' : score >= 60 ? 'warning' : 'danger';

const AtsHistory = () => {
  const navigate = useNavigate();

  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState('');

  const load = () =>
    atsApi
      .getScans()
      .then((response) =>
        setScans(
          (response.data?.scans || []).map(normalizeScan)
        )
      )
      .catch((error) =>
        toast.error(
          errorMessage(error, 'Unable to load ATS history.')
        )
      )
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (
      !window.confirm(
        'Delete this analysis and its tailored resume?'
      )
    ) {
      return;
    }

    try {
      setDeleting(id);

      await atsApi.deleteScan(id);

      setScans((current) =>
        current.filter((scan) => scan._id !== id)
      );

      toast.success('Analysis deleted.');
    } catch (error) {
      toast.error(
        errorMessage(error, 'Unable to delete analysis.')
      );
    } finally {
      setDeleting('');
    }
  };

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
              to="/student/ats-scanner"
              className="text-decoration-none text-secondary small fw-medium"
            >
              <FaArrowLeft className="me-2" />
              Back to Scanner
            </Link>

            <div className="d-flex align-items-center mt-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-3 me-3"
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#f2f2f7',
                }}
              >
                <FaChartLine
                  className="text-primary"
                  size={20}
                />
              </div>

              <div>
                <h2
                  className="fw-bold mb-1"
                  style={{ letterSpacing: '-0.8px' }}
                >
                  ATS Analysis History
                </h2>

                <p className="text-secondary mb-0">
                  Review your previous resume analyses and scores.
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/student/ats-scanner"
            className="btn btn-primary px-4"
          >
            New Analysis
          </Link>
        </div>

        {loading ? (
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body py-5">
              <div className="text-center">
                <div
                  className="spinner-border text-primary mb-3"
                  style={{
                    width: '2.25rem',
                    height: '2.25rem',
                  }}
                />
                <p className="text-secondary mb-0">
                  Loading your analysis history...
                </p>
              </div>
            </div>
          </div>
        ) : scans.length ? (
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead>
                    <tr
                      style={{
                        backgroundColor: '#f7f7f8',
                      }}
                    >
                      <th className="border-0 px-4 py-3">
                        <span className="small text-secondary fw-semibold">
                          TARGET JOB
                        </span>
                      </th>

                      <th className="border-0 py-3">
                        <span className="small text-secondary fw-semibold">
                          COMPANY
                        </span>
                      </th>

                      <th className="border-0 py-3">
                        <span className="small text-secondary fw-semibold">
                          ATS SCORE
                        </span>
                      </th>

                      <th className="border-0 py-3">
                        <span className="small text-secondary fw-semibold">
                          ANALYZED
                        </span>
                      </th>

                      <th className="border-0 px-4 py-3 text-end">
                        <span className="small text-secondary fw-semibold">
                          ACTIONS
                        </span>
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {scans.map((scan) => {
                      const score = scan.overallScore ?? 0;
                      const color = scoreClass(score);

                      return (
                        <tr key={scan._id}>
                          <td className="px-4 py-4">
                            <div className="d-flex align-items-center">
                              <div
                                className="d-flex align-items-center justify-content-center rounded-3 me-3 flex-shrink-0"
                                style={{
                                  width: '42px',
                                  height: '42px',
                                  backgroundColor: '#f2f2f7',
                                }}
                              >
                                <FaFileAlt
                                  className="text-secondary"
                                  size={16}
                                />
                              </div>

                              <div>
                                <div className="fw-semibold">
                                  {scan.targetJob
                                    ?.target_job_role ||
                                    'Target Job'}
                                </div>

                                <div className="small text-secondary mt-1">
                                  Resume analysis
                                </div>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="text-secondary">
                              {scan.targetJob
                                ?.target_company || '—'}
                            </span>
                          </td>

                          <td>
                            <div className="d-flex align-items-center gap-3">
                              <div
                                className="progress"
                                style={{
                                  width: '90px',
                                  height: '6px',
                                  backgroundColor: '#ececef',
                                }}
                              >
                                <div
                                  className={`progress-bar bg-${color}`}
                                  style={{
                                    width: `${Math.min(
                                      Math.max(score, 0),
                                      100
                                    )}%`,
                                  }}
                                />
                              </div>

                              <span
                                className={`fw-semibold text-${color}`}
                              >
                                {score}/100
                              </span>
                            </div>
                          </td>

                          <td>
                            <span className="text-secondary">
                              {scan.createdAt
                                ? new Date(
                                    scan.createdAt
                                  ).toLocaleDateString(
                                    undefined,
                                    {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    }
                                  )
                                : '—'}
                            </span>
                          </td>

                          <td className="px-4 text-end">
                            <div className="d-flex justify-content-end gap-2">
                              <button
                                type="button"
                                className="btn btn-light border btn-sm px-3"
                                onClick={() =>
                                  navigate(
                                    `/student/ats-scanner/analysis/${scan._id}`
                                  )
                                }
                              >
                                <FaEye className="me-2 text-primary" />
                                View
                              </button>

                              <button
                                type="button"
                                className="btn btn-light border btn-sm"
                                style={{
                                  width: '36px',
                                  height: '36px',
                                }}
                                disabled={
                                  deleting === scan._id
                                }
                                onClick={() =>
                                  remove(scan._id)
                                }
                                title="Delete analysis"
                              >
                                {deleting === scan._id ? (
                                  <span className="spinner-border spinner-border-sm text-danger" />
                                ) : (
                                  <FaTrash className="text-danger" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-5">
              <div
                className="text-center mx-auto"
                style={{ maxWidth: '560px' }}
              >
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-4"
                  style={{
                    width: '78px',
                    height: '78px',
                    backgroundColor: '#f2f2f7',
                  }}
                >
                  <FaChartLine
                    className="text-primary"
                    size={28}
                  />
                </div>

                <h3
                  className="fw-bold mb-2"
                  style={{ letterSpacing: '-0.5px' }}
                >
                  No analyses yet
                </h3>

                <p className="text-secondary lh-lg mb-4">
                  Run your first ATS analysis to see how well your
                  resume matches a target job and keep track of your
                  results here.
                </p>

                <Link
                  to="/student/ats-scanner"
                  className="btn btn-primary px-4"
                >
                  Start Your First Analysis
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default AtsHistory;

