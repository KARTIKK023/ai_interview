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

  const renderLastLoginDuration = (user) => {
    const lastLogin = user.lastLogin;
    const loginStartedAt = user.loginStartedAt;
    const lastLogout = user.lastLogout;
    const loginDuration = Number(user.loginDuration) || 0;

    if (!lastLogin) {
      return <span className="text-muted small">No Login Recorded</span>;
    }

    const date = new Date(lastLogin);
    if (isNaN(date.getTime())) {
      return <span className="text-muted small">N/A</span>;
    }

    // Determine online status accurately
    let isOnline = user.isOnline === true || user.isOnline === 'true';
    if (!isOnline && lastLogin) {
      const loginTime = date.getTime();
      const logoutTime = lastLogout ? new Date(lastLogout).getTime() : 0;
      if (!lastLogout || loginTime > logoutTime) {
        isOnline = true;
      }
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const strHours = String(hours).padStart(2, '0');

    const time = `${strHours}:${minutes} ${ampm}`;

    // Calculate duration for offline sessions
    let totalSeconds = loginDuration;
    if (!totalSeconds && loginStartedAt && lastLogout) {
      const start = new Date(loginStartedAt).getTime();
      const end = new Date(lastLogout).getTime();
      if (end > start) {
        totalSeconds = Math.floor((end - start) / 1000);
      }
    }

    const durationHours = Math.floor(totalSeconds / 3600);
    const durationMinutes = Math.floor((totalSeconds % 3600) / 60);
    const durationSeconds = totalSeconds % 60;

    let durationText = '';
    if (durationHours > 0) {
      durationText = `${durationHours}h ${durationMinutes}m ${durationSeconds}s`;
    } else if (durationMinutes > 0) {
      durationText = `${durationMinutes}m ${durationSeconds}s`;
    } else {
      durationText = `${durationSeconds}s`;
    }

    return (
      <div className="text-center text-nowrap">
        <div className="small fw-semibold text-dark" style={{ lineHeight: '1.4' }}>
          {day}/{month}/{year}, {time}
        </div>
        <div className="small fw-semibold mt-1" style={{ color: isOnline ? '#16a34a' : '#6b7280', lineHeight: '1.4' }}>
          {isOnline ? (
            '● Active'
          ) : (
            <>
              ● Offline{' '}
              <span style={{ color: '#2563eb' }}>
                • Duration: {durationText}
              </span>
            </>
          )}
        </div>
      </div>
    );
  };

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
                    <th className="text-center">Last Login / Duration</th>
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
                      <td>{renderLastLoginDuration(u)}</td>
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
