import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { FaBriefcase, FaArrowLeft, FaSearch, FaCheckCircle, FaLaptopCode } from 'react-icons/fa';
import toast from 'react-hot-toast';

const SuperAdminJobs = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ jobRoles: [], targetJobs: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('predefined');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/jobs');
      if (res.data && res.data.success) {
        setData({
          jobRoles: res.data.jobRoles || [],
          targetJobs: res.data.targetJobs || []
        });
      }
    } catch (err) {
      console.error('Failed to load active jobs:', err);
      toast.error('Failed to fetch job specifications from server.');
    } finally {
      setLoading(false);
    }
  };

  const filteredJobRoles = (data.jobRoles || []).filter(j => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (j.name || j.roleName || '').toLowerCase().includes(q) ||
           (j.category || '').toLowerCase().includes(q);
  });

  const filteredTargetJobs = (data.targetJobs || []).filter(tj => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (tj.target_job_role || '').toLowerCase().includes(q) ||
           (tj.target_company || '').toLowerCase().includes(q);
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
            <FaBriefcase className="text-info" size={20} />
            <h5 className="fw-bold mb-0">
              Active Job Specifications ({data.jobRoles.length + data.targetJobs.length})
            </h5>
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
                  placeholder="Search job title or category..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6 text-md-end">
              <div className="btn-group btn-group-sm">
                <button
                  className={`btn ${activeTab === 'predefined' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setActiveTab('predefined')}
                >
                  Predefined Roles ({data.jobRoles.length})
                </button>
                <button
                  className={`btn ${activeTab === 'target' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setActiveTab('target')}
                >
                  Candidate Target Jobs ({data.targetJobs.length})
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
          {loading ? (
            <div className="p-5 text-center text-muted">
              <div className="spinner-border text-info mb-2" role="status"></div>
              <p className="mb-0">Loading active job profiles and target specs...</p>
            </div>
          ) : activeTab === 'predefined' ? (
            filteredJobRoles.length === 0 ? (
              <div className="p-5 text-center text-muted"><p className="mb-0">No predefined job roles found.</p></div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th>Job Role Title</th>
                      <th>Category</th>
                      <th>Predefined</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobRoles.map((j) => (
                      <tr key={j._id}>
                        <td className="fw-bold">{j.roleName || j.name}</td>
                        <td><span className="badge bg-info bg-opacity-10 text-info">{j.category}</span></td>
                        <td>{j.isPredefined ? 'Yes' : 'Custom'}</td>
                        <td><span className="badge bg-success">Active</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            filteredTargetJobs.length === 0 ? (
              <div className="p-5 text-center text-muted"><p className="mb-0">No candidate target jobs recorded yet.</p></div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th>Target Role</th>
                      <th>Target Company</th>
                      <th>Experience</th>
                      <th>Job Type</th>
                      <th>Date Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTargetJobs.map((tj) => (
                      <tr key={tj._id}>
                        <td className="fw-bold">{tj.target_job_role}</td>
                        <td>{tj.target_company || 'Any Industry'}</td>
                        <td><span className="badge bg-secondary">{tj.experience || 'Fresher'}</span></td>
                        <td>{tj.job_type || 'Full Time'}</td>
                        <td className="small text-muted">{new Date(tj.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
};

export default SuperAdminJobs;
