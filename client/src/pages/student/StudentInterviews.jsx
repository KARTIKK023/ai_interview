import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout';
import API from '../../services/api';
import { FaLaptopCode, FaUserTie, FaVideo, FaFont, FaCheckCircle, FaHourglassHalf, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

const StudentInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterviewToDelete, setSelectedInterviewToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const res = await API.get('/interviews');
      if (res.data.interviews) {
        setInterviews(res.data.interviews);
      }
    } catch (err) {
      console.error('Failed to fetch interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteInterview = async () => {
    if (!selectedInterviewToDelete) return;
    try {
      setDeleting(true);
      await API.delete(`/interviews/${selectedInterviewToDelete}`);
      setInterviews(interviews.filter(item => item._id !== selectedInterviewToDelete));
      toast.success('Interview session deleted successfully');
      setSelectedInterviewToDelete(null);
    } catch (err) {
      console.error('Failed to delete interview:', err);
      toast.error(err.response?.data?.message || 'Failed to delete interview. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <StudentLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-extrabold mb-1">My Interview History</h3>
          <p className="text-muted small mb-0">Track and manage all your AI practice sessions and HR recruitment interviews</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/student/interview-preparation/ai-mock" className="btn btn-primary-custom">Start New Practice</Link>
          <Link to="/student/interview-preparation/quick-practice" className="btn btn-primary-custom">Quick 5-Min Practice</Link>
        </div>
      </div>

      <div className="card card-custom p-4 shadow-sm flex-grow-1">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Student</th>
                <th>Job Role</th>
                <th>Category</th>
                <th>Purpose</th>
                <th>Mode</th>
                <th>Score</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {interviews.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center text-muted py-4">No interviews found in your history.</td>
                </tr>
              ) : (
                interviews.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="fw-bold text-dark">{item.candidateId?.fullName || item.candidateId?.name || user?.fullName || user?.name || 'Student'}</div>
                      <small className="text-muted extra-small font-monospace">{item.candidateId?.studentId || item.candidateId?.student_id || item.student_id || user?.studentId || user?.student_id || ''}</small>
                    </td>
                    <td className="fw-bold text-dark">{item.jobRole}</td>
                    <td>
                      <span
                        className="badge px-2.5 py-1"
                        style={{
                          backgroundColor: item.category === 'Technical' ? '#eff6ff' : '#f8fafc',
                          color: item.category === 'Technical' ? '#2563eb' : '#475569',
                          border: `1px solid ${item.category === 'Technical' ? '#bfdbfe' : '#e2e8f0'}`
                        }}
                      >
                        {item.category}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${item.purpose === 'Recruitment' ? 'bg-danger bg-opacity-10 text-danger border border-danger-subtle' : 'bg-secondary bg-opacity-10 text-secondary border border-secondary-subtle'}`}>
                        {item.purpose}
                      </span>
                    </td>
                    <td>
                      <span
                        className="badge px-2.5 py-1"
                        style={{
                          backgroundColor: item.mode === 'Video' ? '#fef2f2' : '#ecfeff',
                          color: item.mode === 'Video' ? '#dc2626' : '#0891b2',
                          border: `1px solid ${item.mode === 'Video' ? '#fecaca' : '#a5f3fc'}`
                        }}
                      >
                        {item.mode}
                      </span>
                    </td>
                    <td className="fw-bold">
                      {item.status === 'Completed' ? (
                        <span style={{ color: '#16a34a' }}>{item.percentage ?? item.score ?? 0}%</span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      {item.status === 'Completed' ? (
                        <span className="badge" style={{ backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>Completed</span>
                      ) : item.status === 'Stopped' ? (
                        <span className="badge" style={{ backgroundColor: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' }}>Stopped</span>
                      ) : (
                        <span className="badge" style={{ backgroundColor: '#faf5ff', color: '#9333ea', border: '1px solid #e9d5ff' }}>In Progress</span>
                      )}
                    </td>
                    <td className="small text-muted">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        {item.status === 'Completed' ? (
                          <Link
                            to={`/student/result/${item._id}`}
                            className="btn btn-sm fw-semibold"
                            style={{ backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '6px' }}
                          >
                            View Report
                          </Link>
                        ) : (
                          <Link
                            to={item.mode === 'Video' ? `/student/interview-video/${item._id}` : `/student/interview-text/${item._id}`}
                            className="btn btn-sm fw-bold text-white"
                            style={{ backgroundColor: '#2563eb', borderColor: '#2563eb', borderRadius: '6px' }}
                          >
                            Continue
                          </Link>
                        )}

                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => setSelectedInterviewToDelete(item._id)}
                          title="Delete Interview Session"
                        >
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      {selectedInterviewToDelete && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1" role="dialog" style={{ zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered" role="document" style={{ maxWidth: '440px' }}>
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
              <div className="modal-body p-4 text-center">
                <div className="d-inline-flex align-items-center justify-content-center bg-danger bg-opacity-10 text-danger rounded-circle p-3 mb-3" style={{ width: '64px', height: '64px' }}>
                  <FaTrash className="fs-3" />
                </div>

                <h5 className="fw-extrabold text-dark mb-2">Delete Interview History?</h5>
                <p className="text-muted small mb-1">
                  Are you sure you want to delete this interview session from your history?
                </p>
                <p className="text-danger extra-small fw-semibold mb-4">
                  This action cannot be undone.
                </p>

                <div className="d-flex justify-content-center gap-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4 py-2 fw-bold rounded-3"
                    onClick={() => setSelectedInterviewToDelete(null)}
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger px-4 py-2 fw-bold rounded-3 d-flex align-items-center gap-2"
                    onClick={confirmDeleteInterview}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <>Deleting...</>
                    ) : (
                      <>
                        <FaTrash /> Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  );
};

export default StudentInterviews;
