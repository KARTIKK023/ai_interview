import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { FaShieldAlt, FaUsers, FaArrowLeft, FaSearch, FaUserTag, FaEnvelope, FaCalendarAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

const SuperAdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/users');
      if (res.data && res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
      toast.error('Failed to fetch users from server.');
    } finally {
      setLoading(false);
    }
  };
  const students = users.filter(
  (user) => user.role?.toLowerCase() === 'student'
);

  const filtered = students.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (u.name || u.fullName || '').toLowerCase().includes(q) ||
           (u.email || '').toLowerCase().includes(q) ||
           (u.role || '').toLowerCase().includes(q);
  });

  return (
    <div className="min-vh-100 bg-light d-flex flex-column" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* HEADER */}
      <header
        className="px-4 py-3 text-white d-flex align-items-center justify-content-between shadow-sm"
        style={{ background: 'linear-gradient(90deg, #09071B 0%, #110D33 50%, #171242 100%)' }}
      >
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-outline-light btn-sm d-flex align-items-center gap-1" onClick={() => navigate('/super-admin/dashboard')}>
            <FaArrowLeft size={12} /> Dashboard
          </button>
          <div className="d-flex align-items-center gap-2">
            <FaUsers className="text-primary" size={20} />
            <h5 className="fw-bold mb-0">
                Total Students ({students.length})
            </h5>
          </div>
        </div>
      </header>

      {/* CONTENT CONTAINER */}
      <main className="container-fluid p-4 flex-grow-1">
        <div className="card border-0 shadow-sm p-3 mb-4 rounded-3">
          <div className="row align-items-center g-3">
            <div className="col-md-6">
              <div className="position-relative">
                <FaSearch className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" size={14} />
                <input
                  type="text"
                  className="form-control ps-5"
                  placeholder="Search user name, email, or role..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6 text-md-end text-muted small">
              Showing {filtered.length} of {students.length} total students
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
          {loading ? (
            <div className="p-5 text-center text-muted">
              <div className="spinner-border text-primary mb-2" role="status"></div>
              <p className="mb-0">Loading registered candidates and user records...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-5 text-center text-muted">
              <p className="mb-0">No user accounts found.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>User Name</th>
                    <th>Email Address</th>
                    <th>Role</th>
                    <th>Student ID</th>
                    <th>Registered Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u._id}>
                      <td className="fw-bold">{u.fullName || u.name || 'User'}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge ${u.role?.toLowerCase() === 'student' ? 'bg-primary' : 'bg-purple'} text-capitalize`}>
                          {u.role || 'student'}
                        </span>
                      </td>
                      <td><code>{u.studentId || u._id.substring(0, 8)}</code></td>
                      <td className="small text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-20">
                          Active
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

export default SuperAdminUsers;
