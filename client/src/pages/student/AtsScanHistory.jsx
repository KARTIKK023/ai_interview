import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaArrowRight,
  FaCalendarAlt,
  FaChartLine,
  FaClock,
  FaFileAlt,
  FaHistory,
  FaSearch,
  FaSpinner,
  FaTimesCircle,
} from "react-icons/fa";

import api from "../../services/api";

const scoreColor = (score) => {
  if (score >= 80) return "success";
  if (score >= 60) return "warning";
  return "danger";
};

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const AtsScanHistory = () => {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/ats/scans");

      const data = response?.data?.data || response?.data || [];

      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("ATS history error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load ATS analysis history."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return history;

    return history.filter((item) => {
      const jobTitle =
        item.jobTitle ||
        item.targetJob?.jobTitle ||
        item.targetJob?.role ||
        "";

      const companyName =
        item.companyName ||
        item.targetJob?.companyName ||
        "";

      const resumeName =
        item.resumeName ||
        item.resume?.originalName ||
        item.resume?.fileName ||
        "";

      return (
        jobTitle.toLowerCase().includes(value) ||
        companyName.toLowerCase().includes(value) ||
        resumeName.toLowerCase().includes(value)
      );
    });
  }, [history, search]);

  const openScan = (scan) => {
    if (!scan?._id) return;

    navigate(`/student/ats-scanner?scan=${scan._id}`);
  };

  const averageScore = useMemo(() => {
    if (!history.length) return 0;

    const total = history.reduce((sum, item) => {
      return (
        sum +
        Number(item.overallScore || item.score || 0)
      );
    }, 0);

    return Math.round(total / history.length);
  }, [history]);

  const highestScore = useMemo(() => {
    if (!history.length) return 0;

    return Math.max(
      ...history.map((item) =>
        Number(item.overallScore || item.score || 0)
      )
    );
  }, [history]);

  return (
    <div className="container-fluid bg-light min-vh-100 py-4">
      <div className="container">
        {/* HEADER */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <button
              className="btn btn-link text-decoration-none text-dark p-0 mb-2"
              onClick={() =>
                navigate("/student/ats-scanner")
              }
            >
              <FaArrowLeft className="me-2" />
              Back to ATS Scanner
            </button>

            <h2 className="fw-bold mb-1">
              ATS Analysis History
            </h2>

            <p className="text-muted mb-0">
              View your previous resume analyses and scores.
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={() =>
              navigate("/student/ats-scanner")
            }
          >
            New ATS Analysis
            <FaArrowRight className="ms-2" />
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="alert alert-danger d-flex align-items-start">
            <FaTimesCircle className="me-2 mt-1" />
            <div>{error}</div>
          </div>
        )}

        {/* SUMMARY */}
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1">
                      Total Analyses
                    </p>

                    <h2 className="fw-bold mb-0">
                      {history.length}
                    </h2>
                  </div>

                  <FaHistory
                    size={32}
                    className="text-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1">
                      Average Score
                    </p>

                    <h2 className="fw-bold mb-0">
                      {averageScore}
                    </h2>
                  </div>

                  <FaChartLine
                    size={32}
                    className="text-success"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1">
                      Highest Score
                    </p>

                    <h2 className="fw-bold mb-0">
                      {highestScore}
                    </h2>
                  </div>

                  <FaChartLine
                    size={32}
                    className="text-warning"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-3">
            <div className="input-group">
              <span className="input-group-text bg-white">
                <FaSearch />
              </span>

              <input
                type="text"
                className="form-control"
                placeholder="Search by job role, company, or resume..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </div>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-5">
              <FaSpinner
                className="animate-spin text-primary mb-3"
                size={30}
              />

              <p className="text-muted mb-0">
                Loading analysis history...
              </p>
            </div>
          </div>
        )}

        {/* EMPTY */}
        {!loading && filteredHistory.length === 0 && (
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-5">
              <FaFileAlt
                size={45}
                className="text-muted mb-3"
              />

              <h5 className="fw-bold">
                {search
                  ? "No matching analyses found"
                  : "No ATS analyses yet"}
              </h5>

              <p className="text-muted">
                {search
                  ? "Try a different search term."
                  : "Run your first ATS analysis to see it here."}
              </p>

              {!search && (
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    navigate("/student/ats-scanner")
                  }
                >
                  Check ATS Score
                </button>
              )}
            </div>
          </div>
        )}

        {/* DESKTOP TABLE */}
        {!loading && filteredHistory.length > 0 && (
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="px-4 py-3">
                        Target Job
                      </th>

                      <th>Company</th>

                      <th>Resume</th>

                      <th>ATS Score</th>

                      <th>Analysis Date</th>

                      <th className="text-end px-4">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredHistory.map((scan) => {
                      const score = Number(
                        scan.overallScore ||
                          scan.score ||
                          0
                      );

                      const jobTitle =
                        scan.jobTitle ||
                        scan.targetJob?.jobTitle ||
                        scan.targetJob?.role ||
                        "Target Job";

                      const company =
                        scan.companyName ||
                        scan.targetJob?.companyName ||
                        "-";

                      const resumeName =
                        scan.resumeName ||
                        scan.resume?.originalName ||
                        scan.resume?.fileName ||
                        "Resume";

                      return (
                        <tr
                          key={scan._id}
                          style={{
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            openScan(scan)
                          }
                        >
                          <td className="px-4">
                            <div className="fw-semibold">
                              {jobTitle}
                            </div>
                          </td>

                          <td>
                            <span className="text-muted">
                              {company}
                            </span>
                          </td>

                          <td>
                            <div className="d-flex align-items-center">
                              <FaFileAlt className="text-primary me-2" />

                              <span>
                                {resumeName}
                              </span>
                            </div>
                          </td>

                          <td>
                            <span
                              className={`badge bg-${scoreColor(
                                score
                              )} px-3 py-2`}
                            >
                              {score}/100
                            </span>
                          </td>

                          <td>
                            <span className="text-muted">
                              <FaCalendarAlt className="me-2" />
                              {formatDate(
                                scan.createdAt ||
                                  scan.updatedAt
                              )}
                            </span>
                          </td>

                          <td className="text-end px-4">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                openScan(scan);
                              }}
                            >
                              View Analysis
                              <FaArrowRight className="ms-2" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MOBILE CARDS */}
        {!loading && filteredHistory.length > 0 && (
          <div className="d-md-none mt-4">
            {filteredHistory.map((scan) => {
              const score = Number(
                scan.overallScore || scan.score || 0
              );

              const jobTitle =
                scan.jobTitle ||
                scan.targetJob?.jobTitle ||
                scan.targetJob?.role ||
                "Target Job";

              const company =
                scan.companyName ||
                scan.targetJob?.companyName ||
                "-";

              const resumeName =
                scan.resumeName ||
                scan.resume?.originalName ||
                scan.resume?.fileName ||
                "Resume";

              return (
                <div
                  key={scan._id}
                  className="card border-0 shadow-sm mb-3"
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h6 className="fw-bold mb-1">
                          {jobTitle}
                        </h6>

                        <small className="text-muted">
                          {company}
                        </small>
                      </div>

                      <span
                        className={`badge bg-${scoreColor(
                          score
                        )}`}
                      >
                        {score}/100
                      </span>
                    </div>

                    <div className="small text-muted mb-2">
                      <FaFileAlt className="me-2" />
                      {resumeName}
                    </div>

                    <div className="small text-muted mb-3">
                      <FaClock className="me-2" />
                      {formatDate(
                        scan.createdAt ||
                          scan.updatedAt
                      )}
                    </div>

                    <button
                      className="btn btn-outline-primary w-100"
                      onClick={() => openScan(scan)}
                    >
                      View Analysis
                      <FaArrowRight className="ms-2" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AtsScanHistory;