import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { FaBuilding, FaArrowLeft, FaSearch, FaUserTie, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const SuperAdminOrganizations = () => {
  const navigate = useNavigate();
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchOrgs();
  }, []);

  const fetchOrgs = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/organizations');
      if (res.data && res.data.success) {
        setOrgs(res.data.organizations || []);
      }
    } catch (err) {
      console.error('Failed to load organizations:', err);
      toast.error('Failed to fetch partner organization data.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = orgs.filter(o => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (o.name || o.fullName || '').toLowerCase().includes(q) ||
           (o.email || '').toLowerCase().includes(q) ||
           (o.profile?.companyName || '').toLowerCase().includes(q);
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
            <FaBuilding className="text-success" size={20} />
            <h5 className="fw-bold mb-0">Organizations & Partners ({orgs.length})</h5>
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
                  placeholder="Search company or HR partner..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6 text-md-end text-muted small">
              {orgs.length} total partner organization / HR account(s) registered
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
          {loading ? (
            <div className="p-5 text-center text-muted">
              <div className="spinner-border text-success mb-2" role="status"></div>
              <p className="mb-0">Loading organization records...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-5 text-center text-muted">
              <p className="mb-0">No enterprise partner or organization accounts registered yet.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>Organization / Partner</th>
                    <th>Admin / HR Name</th>
                    <th>Email Address</th>
                    <th>Account Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => (
                    <tr key={o._id}>
                      <td className="fw-bold">{o.profile?.companyName || 'HireSmart Enterprise Partner'}</td>
                      <td>{o.fullName || o.name || 'Admin'}</td>
                      <td>{o.email}</td>
                      <td>
                        <span className="badge bg-success text-uppercase">{o.role || 'HR'}</span>
                      </td>
                      <td>
                        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-20 d-inline-flex align-items-center gap-1">
                          <FaCheckCircle size={10} /> Verified
                        </span>
                      </td>
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

export default SuperAdminOrganizations;
