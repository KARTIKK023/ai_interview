import React, { useEffect, useState } from 'react';
import { FaEnvelope,   FaEye, FaEyeSlash, FaLock, FaSave, FaShieldAlt, FaUser } from 'react-icons/fa';
import toast from 'react-hot-toast';
import API from '../../services/api';

const emptyForm = {
  fullName: '',
  email: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
};

const SuperAdminProfile = () => {
  const [user, setUser] = useState({});
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  

  useEffect(() => {
    API.get('/admin/profile')
      .then((res) => {
        const nextUser = res.data?.user || {};
        setUser(nextUser);
        setForm((current) => ({ ...current, fullName: nextUser.fullName || nextUser.name || '', email: nextUser.email || '' }));
      })
      .catch((error) => toast.error(error.response?.data?.message || 'Unable to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const saveProfile = async (event, updateType = 'profile') => {
    event.preventDefault();
    const emailChanged = updateType === 'email';
    const passwordChanged = updateType === 'password';

    if ((emailChanged || passwordChanged) && !form.currentPassword) {
      toast.error('Current password is required for email or password changes');
      return;
    }
    if (passwordChanged && form.newPassword !== form.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setSaving(true);
      const response = await API.put('/admin/profile', {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        currentPassword: form.currentPassword || undefined,
        newPassword: passwordChanged ? form.newPassword : undefined,
        confirmPassword: passwordChanged ? form.confirmPassword : undefined
      });
      const updatedUser = { ...user, ...(response.data?.user || {}), fullName: form.fullName.trim(), name: form.fullName.trim(), email: form.email.trim().toLowerCase() };
      setUser(updatedUser);
      setForm({ ...emptyForm, fullName: updatedUser.fullName, email: updatedUser.email });
      localStorage.setItem('superAdminUser', JSON.stringify(updatedUser));
      toast.success('Profile updated successfully');
      setActiveModal(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update profile');
    } finally {
      setSaving(false);
    }
  };

  const statusLabel = user.isActive === false ? 'Inactive' : (user.serviceStatus || 'Active');
  const formattedDate = (date) => date ? new Date(date).toLocaleString() : 'Not available';

  if (loading) {
    return <div className="p-4 text-muted">Loading profile...</div>;
  }

  return (
    <div className="p-4 p-md-4" style={{ background: '#f7f7ff', minHeight: '100%' ,width: '100%'}}>
     <div className="mb-4" style={{ width: "100%" }}>
  <div
    style={{
      width: "100%",
      boxSizing: "border-box",
      background: "linear-gradient(135deg, #5420a8, #742ce0)",
      borderRadius: "10px",
      padding: "24px 28px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      color: "#fff",
      boxShadow: "0 4px 12px rgba(0,0,0,0.12)"
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px"
      }}
    >
      <div
        style={{
          width: "52px",
          height: "52px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255,255,255,0.2)",
          borderRadius: "10px",
          fontSize: "24px"
        }}
      >
        👤
      </div>

      <div>
        <h1
          style={{
            margin: 0,
            fontSize: "28px",
            fontWeight: 700
          }}
        >
          My Profile
        </h1>

        <p
          style={{
            margin: "5px 0 0",
            fontSize: "15px",
            opacity: 0.85
          }}
        >
          View and manage your account information
        </p>
      </div>
    </div>
  </div>
</div>

      <form onSubmit={saveProfile}>
        <div className="row g-3">
          <div className="col-xl-5">
            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '10px' }}>
              <div className="card-body p-4">
                <h6 className="fw-bold mb-1" style={{ color: '#17133d' }}>Profile Information</h6>
                <p className="text-muted small mb-4">Your account details and status</p>
                <div className="text-center mb-4">
                  <div className="rounded-circle d-inline-flex align-items-center justify-content-center fw-bold" style={{ width: 66, height: 66, background: '#e9ddff', color: '#6337e8', fontSize: '1.45rem' }}>
                    {(user.fullName || user.name || 'SA').slice(0, 2).toUpperCase()}
                  </div>
                  <h5 className="mt-2 mb-1 fw-bold">{user.fullName || user.name || 'Super Admin'}</h5>
                  <span className="badge rounded-pill" style={{ background: '#6337e8' }}>{user.role || 'SUPER_ADMIN'}</span>
                  <div className="mt-2"><span className="badge rounded-pill bg-success-subtle text-success">● {statusLabel}</span></div>
                </div>
                <div className="p-3 rounded-3" style={{ background: '#f5f5ff' }}>
                  <InfoRow icon={FaUser} label="Full Name" value={user.fullName || user.name || 'Not available'} />
                  <InfoRow icon={FaEnvelope} label="Email" value={user.email || 'Not available'} />
                  <InfoRow icon={FaLock} label="Password" value="************" />
                  <InfoRow icon={FaShieldAlt} label="Role" value={user.role || 'SUPER_ADMIN'} />
                  <InfoRow icon={FaShieldAlt} label="Member Since" value={formattedDate(user.createdAt)} />
                  <InfoRow icon={FaShieldAlt} label="Last Login" value={formattedDate(user.lastLogin)} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-7">
            <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: '10px' }}>
              <div className="card-body p-4">
                <SectionTitle icon={FaUser} title="Update Profile" subtitle="Update your name" />
                <label className="form-label small fw-semibold">Full Name <span className="text-danger">*</span></label>
                <div className="input-group mb-3">
                  <span className="input-group-text bg-white"><FaUser className="text-muted" /></span>
                  <input className="form-control" name="fullName" value={form.fullName} onChange={updateField} required />
                </div>
                <button className="btn btn-sm text-white float-end" type="button" disabled={saving} style={{ background: '#5b2be0' }} onClick={() => setActiveModal('name')}><FaSave className="me-2" />Update Name</button>
                <div className="clearfix" />
              </div>
            </div>

            <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: '10px' }}>
              <div className="card-body p-4">
                <SectionTitle icon={FaEnvelope} title="Change Email" subtitle="Update your email address" />
                <div className="row g-3">
                  <div className="col-md-6"><PasswordInput label="Current Password" name="currentPassword" value={form.currentPassword} onChange={updateField} placeholder="Enter current password" /></div>
                  <div className="col-md-6"><label className="form-label small fw-semibold">New Email <span className="text-danger">*</span></label><div className="input-group"><span className="input-group-text bg-white"><FaEnvelope className="text-muted" /></span><input type="email" className="form-control" name="email" value={form.email} onChange={updateField} required /></div></div>
                </div>
                <button className="btn btn-sm text-white float-end mt-3" type="button" disabled={saving} style={{ background: '#5b2be0' }} onClick={() => setActiveModal('email')}><FaSave className="me-2" />Update Email</button>
                <div className="clearfix" />
              </div>
            </div>

            <div className="card border-0 shadow-sm" style={{ borderRadius: '10px' }}>
              <div className="card-body p-4">
                <SectionTitle icon={FaLock} title="Change Password" subtitle="Set a new password for your account" />
                <div className="row g-3">
                  <div className="col-md-4"><PasswordInput label="Current Password" name="currentPassword" value={form.currentPassword} onChange={updateField} placeholder="Current password" /></div>
                  <div className="col-md-4"><PasswordInput label="New Password" name="newPassword" value={form.newPassword} onChange={updateField} placeholder="New password" /></div>
                  <div className="col-md-4"><PasswordInput label="Confirm New Password" name="confirmPassword" value={form.confirmPassword} onChange={updateField} placeholder="Confirm password" /></div>
                </div>
                <button className="btn btn-sm text-white float-end mt-3" type="button" disabled={saving} style={{ background: '#5b2be0' }} onClick={() => setActiveModal('password')}><FaSave className="me-2" />Update Password</button>
                <div className="clearfix" />
              </div>
            </div>
          </div>
        </div>
      </form>

      {activeModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: 'rgba(15, 23, 42, 0.58)', zIndex: 1050, padding: '16px' }}
        >
          <div className="card border-0 shadow-lg" style={{ width: '100%', maxWidth: '520px', borderRadius: '12px' }}>
            <div className="card-header text-white d-flex align-items-center justify-content-between" style={{ background: 'linear-gradient(135deg, #5420a8, #742ce0)', borderRadius: '12px 12px 0 0' }}>
              <h5 className="mb-0 fw-bold">
                {activeModal === 'name' ? 'Update Name' : activeModal === 'email' ? 'Update Email' : 'Update Password'}
              </h5>
              <button type="button" className="btn-close btn-close-white" onClick={() => setActiveModal(null)} disabled={saving} aria-label="Close" />
            </div>

            <form onSubmit={(event) => saveProfile(event, activeModal)}>
              <div className="card-body p-4">
                {activeModal === 'name' && (
                  <div>
                    <label className="form-label small fw-semibold">Full Name <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <span className="input-group-text bg-white"><FaUser className="text-muted" /></span>
                      <input className="form-control" name="fullName" value={form.fullName} onChange={updateField} required autoFocus />
                    </div>
                  </div>
                )}

                {activeModal === 'email' && (
                  <div className="row g-3">
                    <div className="col-12">
                      <PasswordInput label="Current Password" name="currentPassword" value={form.currentPassword} onChange={updateField} placeholder="Enter current password" />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">New Email <span className="text-danger">*</span></label>
                      <div className="input-group">
                        <span className="input-group-text bg-white"><FaEnvelope className="text-muted" /></span>
                        <input type="email" className="form-control" name="email" value={form.email} onChange={updateField} required autoFocus />
                      </div>
                    </div>
                  </div>
                )}

                {activeModal === 'password' && (
                  <div className="d-flex flex-column gap-3">
                    <PasswordInput label="Current Password" name="currentPassword" value={form.currentPassword} onChange={updateField} placeholder="Enter current password" />
                    <PasswordInput label="New Password" name="newPassword" value={form.newPassword} onChange={updateField} placeholder="Enter new password" />
                    <PasswordInput label="Confirm New Password" name="confirmPassword" value={form.confirmPassword} onChange={updateField} placeholder="Confirm new password" />
                  </div>
                )}
              </div>
              <div className="card-footer bg-light d-flex justify-content-end gap-2" style={{ borderRadius: '0 0 12px 12px' }}>
                <button type="button" className="btn btn-outline-secondary btn-sm px-4" onClick={() => setActiveModal(null)} disabled={saving}>Cancel</button>
                <button type="submit" className="btn btn-sm text-white px-4" style={{ background: '#5b2be0' }} disabled={saving}>
                  {saving ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const SectionTitle = ({ icon: Icon, title, subtitle }) => <div className="d-flex align-items-center gap-2 mb-3"><span className="rounded-3 p-2" style={{ color: '#6337e8', background: '#eee8ff' }}><Icon /></span><div><h6 className="mb-0 fw-bold">{title}</h6><span className="text-muted small">{subtitle}</span></div></div>;
const InfoRow = ({ icon: Icon, label, value }) => <div className="d-flex align-items-center gap-2 mb-3 small"><Icon className="text-muted" /><span className="text-muted" style={{ width: 105 }}>{label}</span><strong className="text-break">{value}</strong></div>;
const PasswordInput = ({
  label,
  name,
  value,
  onChange,
  placeholder
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <label className="form-label small fw-semibold">
        {label} <span className="text-danger">*</span>
      </label>

      <div className="input-group">
        <span className="input-group-text bg-white">
          <FaLock className="text-muted" />
        </span>

        <input
          type={showPassword ? "text" : "password"}
          className="form-control"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="current-password"
          required
        />

        <button
          type="button"
          className="input-group-text bg-white"
          onClick={() => setShowPassword(!showPassword)}
          style={{
            border: "1px solid #dee2e6",
            cursor: "pointer"
          }}
        >
          {showPassword ? (
            <FaEye className="text-muted" />
          ) : (
            <FaEyeSlash className="text-muted" />
          )}
        </button>
      </div>
    </>
  );
};

export default SuperAdminProfile;
