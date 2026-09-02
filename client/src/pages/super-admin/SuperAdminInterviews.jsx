import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { FaBrain, FaArrowLeft, FaSearch, FaCheckCircle, FaHourglassHalf, FaTimesCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const SuperAdminInterviews = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/interviews');
      if (res.data && res.data.success) {
        setInterviews(res.data.interviews || []);
      }
    } catch (err) {
      console.error('Failed to load interviews:', err);
      toast.error('Failed to fetch AI interview sessions from server.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = interviews.filter(i => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (i.jobRole || i.title || '').toLowerCase().includes(q) ||
           (i.category || '').toLowerCase().includes(q) ||
           (i.candidateId?.fullName || i.candidateId?.name || '').toLowerCase().includes(q);
  });

  return (
    <div className="min-vh-100 bg-light d-flex flex-column" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header
        className="px-4 py-3 text-white d-flex align-items-center justify-content-between shadow-sm"
        style={{ background: 'linear-gradient(90deg, #09071B 0%, #110D33 50%, #171242 100%)' }}
      >
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-outline-light btn-sm d-flex align-items-center gap-1" onClick={() => navigate('/super-admin/dashboard')}>
            <FaArrowLeft size={12} /> Dashboard
          </button>
          <div className="d-flex align-items-center gap-2">
            <FaBrain style={{ color: '#9333EA' }} size={20} />
            <h5 className="fw-bold mb-0">AI Interview Engine Sessions ({interviews.length})</h5>
          </div>
        </div>
      </header>

      <main className="container-fluid p-4 flex-grow-1">
        <div className="card border-0 shadow-sm p-3 mb-4 rounded-3">
          <div className="row align-items-center g-3">
            <div className="col-md-6">
              <div className="position-relative">
                <FaSearch className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" size={14} />
                <input
                  type="text"
                  className="form-control ps-5"
                  placeholder="Search candidate name, job role, category..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6 text-md-end text-muted small">
              Total {interviews.length} mock interview evaluations processed
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
          {loading ? (
            <div className="p-5 text-center text-muted">
              <div className="spinner-border text-purple mb-2" role="status"></div>
              <p className="mb-0">Loading AI interview session evaluations...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-5 text-center text-muted">
              <p className="mb-0">No interview sessions found.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>Candidate</th>
                    <th>Job Role / Title</th>
                    <th>Category</th>
                    <th>Mode</th>
                    <th>Status</th>
                    <th>AI Score</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv) => (
                    <tr key={inv._id}>
                      <td className="fw-bold">{inv.candidateId?.fullName || inv.candidateId?.name || 'Candidate'}</td>
                      <td>{inv.jobRole || inv.title}</td>
                      <td><span className="badge bg-secondary">{inv.category || 'Technical'}</span></td>
                      <td><span className="badge bg-info">{inv.mode || 'Text'}</span></td>
                      <td>
                        <span className={`badge ${inv.status === 'Completed' ? 'bg-success' : 'bg-warning'}`}>
                          {inv.status || 'Pending'}
                        </span>
                      </td>
                      <td className="fw-bold text-success">
                        {inv.score ?? inv.percentage ?? 0}%
                      </td>
                      <td className="small text-muted">{new Date(inv.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SuperAdminInterviews;
