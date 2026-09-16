import React, { useState, useEffect } from 'react';
import {
  FaUserShield,
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaPowerOff,
  FaCheck,
  FaUndo,
  FaSearch,
  FaShieldAlt
} from 'react-icons/fa';
import API from '../../services/api';
import toast from 'react-hot-toast';

const AVAILABLE_FEATURES = [
  // { id: 'dashboard', label: 'Dashboard' },
  { id: 'students', label: 'Students Records' },
  { id: 'registrations', label: 'Registration Records' },
  { id: 'ats-analysis', label: 'ATS Analysis History' },
  { id: 'resumes', label: 'Resume Records' },
  { id: 'target-jobs', label: 'Target Jobs Records' },
  { id: 'mock-interviews', label: 'Mock Interviews' },
  { id: 'certificates', label: 'Certificates' },
  { id: 'inquiries', label: 'Inquiry Details' }
];

const AssignRole = () => {
  // Form State
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Admin'
  });
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Table State
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editFormData, setEditFormData] = useState({
    username: '',
    email: '',
    role: 'Admin',
    permissions: []
  });
  const [updating, setUpdating] = useState(false);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/assigned-admins');
      if (res.data && res.data.success) {
        setAdmins(res.data.admins || []);
      }
    } catch (err) {
      console.error('Failed to fetch admins:', err);
      toast.error('Failed to load assigned admins list');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFeatureToggle = (featureId) => {
    setSelectedPermissions((prev) =>
      prev.includes(featureId)
        ? prev.filter((id) => id !== featureId)
        : [...prev, featureId]
    );
  };

  const handleSelectAllFeatures = () => {
    if (selectedPermissions.length === AVAILABLE_FEATURES.length) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(AVAILABLE_FEATURES.map((f) => f.id));
    }
  };

  const handleResetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'Admin'
    });
    setSelectedPermissions([]);
  };

  // Create Admin Submit
  const handleAssignAdminSubmit = async (e) => {
    e.preventDefault();

    // Frontend Validations
    if (!formData.username.trim()) {
      toast.error('Username is required');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!formData.password) {
      toast.error('Password is required');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Confirm password does not match password');
      return;
    }
    if (!formData.role) {
      toast.error('Role is required');
      return;
    }
    if (selectedPermissions.length === 0) {
      toast.error('Please select at least one assigned feature');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role.toLowerCase(),
        permissions: selectedPermissions
      };

      const res = await API.post('/admin/assign-role', payload);
      if (res.data && res.data.success) {
        toast.success(res.data.message || 'Admin assigned successfully!');
        handleResetForm();
        fetchAdmins();
      } else {
        toast.error(res.data?.message || 'Failed to assign admin');
      }
    } catch (err) {
      console.error('Assign admin error:', err);
      toast.error(err.response?.data?.message || 'Failed to assign admin');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Active Status
  const handleToggleStatus = async (adminId, currentStatus) => {
    try {
      const res = await API.put(`/admin/assigned-admins/${adminId}/toggle-status`);
      if (res.data && res.data.success) {
        toast.success(res.data.message);
        fetchAdmins();
      }
    } catch (err) {
      console.error('Toggle status error:', err);
      toast.error(err.response?.data?.message || 'Failed to update admin status');
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (admin) => {
    setEditingAdmin(admin);
    setEditFormData({
      username: admin.username || '',
      email: admin.email || '',
      role: 'Admin',
      permissions: admin.permissions || []
    });
    setEditModalOpen(true);
  };

  const handleEditFeatureToggle = (featureId) => {
    setEditFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(featureId)
        ? prev.permissions.filter((id) => id !== featureId)
        : [...prev.permissions, featureId]
    }));
  };

  const handleUpdateAdminSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.username.trim()) {
      toast.error('Username is required');
      return;
    }
    if (!editFormData.email.trim()) {
      toast.error('Email is required');
      return;
    }
    if (editFormData.permissions.length === 0) {
      toast.error('Please select at least one feature permission');
      return;
    }

    try {
      setUpdating(true);
      const res = await API.put(`/admin/assigned-admins/${editingAdmin._id}`, {
        username: editFormData.username.trim(),
        email: editFormData.email.trim(),
        role: editFormData.role.toLowerCase(),
        permissions: editFormData.permissions
      });

      if (res.data && res.data.success) {
        toast.success('Admin permissions updated successfully!');
        setEditModalOpen(false);
        setEditingAdmin(null);
        fetchAdmins();
      }
    } catch (err) {
      console.error('Update admin error:', err);
      toast.error(err.response?.data?.message || 'Failed to update admin');
    } finally {
      setUpdating(false);
    }
  };

  // Open Delete Modal
  const handleOpenDeleteModal = (admin) => {
    setAdminToDelete(admin);
    setDeleteModalOpen(true);
  };

  const handleDeleteAdminConfirm = async () => {
    if (!adminToDelete) return;
    try {
      setDeleting(true);
      const res = await API.delete(`/admin/assigned-admins/${adminToDelete._id}`);
      if (res.data && res.data.success) {
        toast.success('Admin deleted successfully!');
        setDeleteModalOpen(false);
        setAdminToDelete(null);
        fetchAdmins();
      }
    } catch (err) {
      console.error('Delete admin error:', err);
      toast.error(err.response?.data?.message || 'Failed to delete admin');
    } finally {
      setDeleting(false);
    }
  };

  // Filter admins
  const filteredAdmins = admins.filter((adm) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (adm.adminId || '').toLowerCase().includes(q) ||
      (adm.username || '').toLowerCase().includes(q) ||
      (adm.email || '').toLowerCase().includes(q)
    );
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'N/A';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getFeatureLabel = (featureId) => {
    const found = AVAILABLE_FEATURES.find((f) => f.id === featureId);
    return found ? found.label : featureId;
  };

  return (
    <div className="container-fluid p-4" style={{ background: '#F9FAFB', minHeight: '100vh' }}>
      {/* HEADER PAGE BANNER */}
      <div
        className="rounded-3 p-4 mb-4 text-white shadow-sm d-flex align-items-center justify-content-between"
        style={{ background: 'linear-gradient(135deg, #4C1D95 0%, #6D28D9 100%)' }}
      >
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <FaUserShield size={24} className="text-warning" />
            <h3 className="fw-bold mb-0 text-white">Assign Admin Role & Feature Permissions</h3>
          </div>
          <p className="mb-0 text-white-50 small">
            Create new Admin accounts, assign module features, and manage server-enforced access controls.
          </p>
        </div>
        <span className="badge bg-white bg-opacity-20 text-black border border-white border-opacity-25 px-3 py-2 font-monospace">
          HireSmart AI Super Admin
        </span>
      </div>

      {/* SECTION 1: ASSIGN ADMIN FORM CARD */}
      <div className="card border-0 shadow-sm rounded-3 mb-5">
        <div
          className="card-header border-bottom py-3 px-4 d-flex align-items-center justify-content-between"
          style={{ background: '#FFFFFF' }}
        >
          <div className="d-flex align-items-center gap-2">
            <FaUserPlus className="text-purple" style={{ color: '#6D28D9' }} size={18} />
            <h5 className="fw-bold mb-0" style={{ color: '#374151' }}>
              Create & Assign New Admin
            </h5>
          </div>
          <span className="text-muted small">All permissions are saved securely in MongoDB</span>
        </div>

        <div className="card-body p-4">
          <form onSubmit={handleAssignAdminSubmit}>
            <div className="row g-3 mb-4">
              {/* Username */}
              <div className="col-md-6 col-lg-3">
                <label className="form-label fw-semibold text-dark small mb-1">
                  Username <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  className="form-control form-control-sm border-secondary-subtle"
                  placeholder="e.g. aman"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Email */}
              <div className="col-md-6 col-lg-3">
                <label className="form-label fw-semibold text-dark small mb-1">
                  Gmail / Email <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  className="form-control form-control-sm border-secondary-subtle"
                  placeholder="e.g. aman@gmail.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Password */}
              <div className="col-md-6 col-lg-2">
                <label className="form-label fw-semibold text-dark small mb-1">
                  Password <span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  className="form-control form-control-sm border-secondary-subtle"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Confirm Password */}
              <div className="col-md-6 col-lg-2">
                <label className="form-label fw-semibold text-dark small mb-1">
                  Confirm Password <span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-control form-control-sm border-secondary-subtle"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Role */}
              <div className="col-md-6 col-lg-2">
                <label className="form-label fw-semibold text-dark small mb-1">
                  Role <span className="text-danger">*</span>
                </label>
                <select
                  name="role"
                  className="form-select form-select-sm border-secondary-subtle fw-semibold"
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            {/* ASSIGN FEATURES CHECKBOXES SECTION */}
            <div className="p-3.5 bg-light border rounded-3 mb-4" style={{ backgroundColor: '#F9FAFB' }}>
              <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                <div className="d-flex align-items-center gap-2">
                  <FaShieldAlt style={{ color: '#6D28D9' }} size={16} />
                  <span className="fw-bold text-dark fs-6">Assign Features</span>
                  <span className="badge bg-purple text-white px-2 py-0.5 small" style={{ background: '#6D28D9' }}>
                    {selectedPermissions.length} selected
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-link text-decoration-none fw-semibold p-0"
                  style={{ color: '#6D28D9', fontSize: '0.8rem' }}
                  onClick={handleSelectAllFeatures}
                >
                  {selectedPermissions.length === AVAILABLE_FEATURES.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="row g-3">
                {AVAILABLE_FEATURES.map((feature) => {
                  const isChecked = selectedPermissions.includes(feature.id);
                  return (
                    <div key={feature.id} className="col-md-6 col-lg-4">
                      <div
                        className={`card border transition-all p-2.5 rounded-3 cursor-pointer ${
                          isChecked ? 'border-purple shadow-sm' : 'border-light-subtle'
                        }`}
                        style={{
                          borderColor: isChecked ? '#6D28D9' : '#E5E7EB',
                          background: isChecked ? '#F3E8FF' : '#FFFFFF'
                        }}
                        onClick={() => handleFeatureToggle(feature.id)}
                      >
                        <div className="form-check d-flex align-items-center gap-2 mb-0">
                          <input
                            type="checkbox"
                            className="form-check-input mt-0"
                            id={`feature-${feature.id}`}
                            checked={isChecked}
                            onChange={() => {}} // Handled by parent container click
                            style={{ cursor: 'pointer', accentColor: '#6D28D9' }}
                          />
                          <label
                            className="form-check-label fw-semibold text-dark text-truncate small mb-0"
                            htmlFor={`feature-${feature.id}`}
                            style={{ cursor: 'pointer' }}
                          >
                            {feature.label}
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* FORM ACTION BUTTONS */}
            <div className="d-flex align-items-center gap-2">
              <button
                type="submit"
                className="btn text-white fw-bold px-4 py-2 rounded-3 shadow-sm d-flex align-items-center gap-2"
                style={{ background: '#4C1D95' }}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Assigning Admin...
                  </>
                ) : (
                  <>
                    <FaCheck size={14} />
                    Assign Admin
                  </>
                )}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary fw-semibold px-4 py-2 rounded-3 d-flex align-items-center gap-2"
                onClick={handleResetForm}
                disabled={submitting}
              >
                <FaUndo size={13} />
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* SECTION 2: ASSIGNED ADMINS MANAGEMENT TABLE */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-header border-bottom py-3 px-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 bg-white">
          <div>
            <h5 className="fw-bold mb-0 text-dark">Assigned Admins Records</h5>
            <p className="mb-0 text-muted small">List of created Admin accounts and their server-enforced feature permissions</p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <div className="input-group input-group-sm" style={{ width: '250px' }}>
              <span className="input-group-text bg-light border-end-0">
                <FaSearch className="text-muted" size={12} />
              </span>
              <input
                type="text"
                className="form-control border-start-0 bg-light"
                placeholder="Search admin, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="btn btn-sm btn-outline-purple" onClick={fetchAdmins} title="Refresh">
              Refresh
            </button>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="text-uppercase small text-muted font-monospace">
                  <th className="ps-4">Admin ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Assigned Features</th>
                  <th className="text-center">Status</th>
                  <th>Created Date</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      <div className="spinner-border text-purple mb-2" role="status"></div>
                      <p className="mb-0 small">Loading assigned admins...</p>
                    </td>
                  </tr>
                ) : filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      No admin accounts found. Fill out the form above to assign an admin.
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map((adm) => {
                    const isOnlineStatus = adm.isActive !== false;
                    const perms = adm.permissions || [];

                    return (
                      <tr key={adm._id}>
                        <td className="ps-4 fw-bold font-monospace text-purple" style={{ color: '#6D28D9' }}>
                          {adm.adminId || 'ADM-00001'}
                        </td>
                        <td className="fw-semibold text-dark">{adm.username || adm.fullName || adm.name || 'Admin'}</td>
                        <td className="text-muted small">{adm.email}</td>
                        <td>
                          <span className="badge bg-purple bg-opacity-10 text-black fw-bold border border-purple border-opacity-25 px-2.5 py-1">
                            {adm.role ? adm.role.toUpperCase() : 'ADMIN'}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-1" style={{ maxWidth: '300px' }}>
                            {perms.length === 0 ? (
                              <span className="text-muted small">No permissions</span>
                            ) : (
                              perms.map((pKey) => (
                                <span
                                  key={pKey}
                                  className="badge bg-light text-dark border px-2 py-0.5 fw-medium"
                                  style={{ fontSize: '0.7rem' }}
                                >
                                  {getFeatureLabel(pKey)}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="text-center">
                          {isOnlineStatus ? (
                            <span className="badge bg-success bg-opacity-10 text-success fw-bold border border-success border-opacity-25 px-2.5 py-1">
                              Active
                            </span>
                          ) : (
                            <span className="badge bg-danger bg-opacity-10 text-danger fw-bold border border-danger border-opacity-25 px-2.5 py-1">
                              Deactivated
                            </span>
                          )}
                        </td>
                        <td className="text-muted small font-monospace">{formatDate(adm.createdAt)}</td>
                        <td className="text-end pe-4">
                          <div className="btn-group btn-group-sm" role="group">
                            {/* EDIT BUTTON */}
                            <button
                              type="button"
                              className="btn btn-outline-primary"
                              onClick={() => handleOpenEditModal(adm)}
                              title="Edit Admin Permissions"
                            >
                              <FaEdit size={13} />
                            </button>

                            {/* ACTIVATE / DEACTIVATE BUTTON */}
                            <button
                              type="button"
                              className={`btn ${isOnlineStatus ? 'btn-outline-warning' : 'btn-outline-success'}`}
                              onClick={() => handleToggleStatus(adm._id, isOnlineStatus)}
                              title={isOnlineStatus ? 'Deactivate Admin' : 'Activate Admin'}
                            >
                              <FaPowerOff size={13} />
                            </button>

                            {/* DELETE BUTTON */}
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              onClick={() => handleOpenDeleteModal(adm)}
                              title="Delete Admin Account"
                            >
                              <FaTrash size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* EDIT ADMIN PERMISSIONS MODAL */}
      {editModalOpen && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header text-white" style={{ background: '#4C1D95' }}>
                <h5 className="modal-title fw-bold">Edit Admin Permissions</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setEditModalOpen(false)}
                ></button>
              </div>

              <form onSubmit={handleUpdateAdminSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Username</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={editFormData.username}
                        onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Email</label>
                      <input
                        type="email"
                        className="form-control form-control-sm"
                        value={editFormData.email}
                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark small mb-2">Assigned Features</label>
                    <div className="row g-2">
                      {AVAILABLE_FEATURES.map((feature) => {
                        const isChecked = editFormData.permissions.includes(feature.id);
                        return (
                          <div key={feature.id} className="col-md-6">
                            <div
                              className={`p-2.5 border rounded-3 cursor-pointer d-flex align-items-center gap-2 ${
                                isChecked ? 'bg-purple bg-opacity-10 border-purple' : 'bg-light border-light-subtle'
                              }`}
                              onClick={() => handleEditFeatureToggle(feature.id)}
                            >
                              <input
                                type="checkbox"
                                className="form-check-input mt-0"
                                checked={isChecked}
                                onChange={() => {}}
                              />
                              <span className="small fw-semibold text-dark">{feature.label}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn text-white btn-sm px-4 fw-bold" style={{ background: '#4C1D95' }} disabled={updating}>
                    {updating ? 'Saving Changes...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && adminToDelete && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title fw-bold">Delete Admin Account</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setDeleteModalOpen(false)}></button>
              </div>
              <div className="modal-body p-4 text-center">
                <FaTrash size={36} className="text-danger mb-3" />
                <h6 className="fw-bold text-dark">Are you sure you want to delete this Admin?</h6>
                <p className="text-muted small mb-0">
                  You are about to delete <strong>{adminToDelete.username || adminToDelete.email}</strong> ({adminToDelete.adminId}).
                </p>
              </div>
              <div className="modal-footer bg-light justify-content-center">
                <button type="button" className="btn btn-secondary btn-sm px-4" onClick={() => setDeleteModalOpen(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger btn-sm px-4 fw-bold" onClick={handleDeleteAdminConfirm} disabled={deleting}>
                  {deleting ? 'Deleting...' : 'Delete Admin'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignRole;
