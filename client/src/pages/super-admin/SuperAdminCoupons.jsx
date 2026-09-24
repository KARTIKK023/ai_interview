import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import toast from 'react-hot-toast';
import DataTable from './components/DataTable';
import {
  FaTags,
  FaPlus,
  FaUsers,
  FaCalendarAlt,
  FaPercentage,
  FaRupeeSign,
  FaSpinner
} from 'react-icons/fa';

const SuperAdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    code: '',
    discountType: 'PERCENT',
    discountValue: '',
    scope: 'ALL',
    studentIds: [],
    groupIds: [],
    validFrom: '',
    validUntil: '',
    perUserLimit: 1,
    maxRedemptions: 0,
    active: true
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [couponRes, groupRes, studentRes] = await Promise.all([
        API.get('/admin/payments/coupons').catch(() => ({ data: { coupons: [] } })),
        API.get('/admin/payments/groups').catch(() => ({ data: { groups: [] } })),
        API.get('/admin/students').catch(() => ({ data: { students: [] } }))
      ]);
      setCoupons(couponRes.data.coupons || []);
      setGroups(groupRes.data.groups || []);
      setStudents(studentRes.data.students || studentRes.data.users || []);
    } catch (err) {
      toast.error('Failed to fetch coupon data.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.code || form.discountValue === '') {
      toast.error('Code and discount value are required.');
      return;
    }
    if (!form.validFrom || !form.validUntil) {
      toast.error('Validity window is required.');
      return;
    }
    if (new Date(form.validUntil) <= new Date(form.validFrom)) {
      toast.error('validUntil must be after validFrom.');
      return;
    }
    try {
      setSaving(true);
      await API.post('/admin/payments/coupons', form);
      toast.success('Coupon created successfully.');
      setShowCreateModal(false);
      setForm({
        code: '',
        discountType: 'PERCENT',
        discountValue: '',
        scope: 'ALL',
        studentIds: [],
        groupIds: [],
        validFrom: '',
        validUntil: '',
        perUserLimit: 1,
        maxRedemptions: 0,
        active: true
      });
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create coupon.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      await API.put(`/admin/payments/coupons/${coupon._id}`, { active: !coupon.active });
      toast.success(coupon.active ? 'Coupon deactivated.' : 'Coupon activated.');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update coupon.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/admin/payments/coupons/${id}`);
      toast.success('Coupon deleted.');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete coupon.');
    }
  };

  const formatWindow = (c) => {
    const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '?');
    return `${fmt(c.validFrom)} → ${fmt(c.validUntil)}`;
  };

  const columns = [
    {
      title: 'Code',
      data: 'code',
      render: (data, type, row) => `<span class="badge" style="background:${row.active ? '#F59E0B' : '#94A3B8'};color:#fff;font-size:0.85rem;">${data}</span>`
    },
    {
      title: 'Discount',
      data: 'discountValue',
      render: (data, type, row) => (row.discountType === 'PERCENT' ? `<strong>${data}%</strong>` : `<strong>₹${data}</strong>`)
    },
    {
      title: 'Scope',
      data: 'scope',
      render: (data) => `<span class="badge bg-secondary">${data}</span>`
    },
    { title: 'Validity Window', data: 'validFrom', render: (data, type, row) => formatWindow(row) },
    { title: 'Per User', data: 'perUserLimit', render: (data) => data },
    {
      title: 'Redemptions',
      data: 'redemptions',
      render: (data, type, row) => {
        const max = row.maxRedemptions;
        return max ? `${data} / ${max}` : `${data} / ∞`;
      }
    },
    {
      title: 'Status',
      data: 'active',
      render: (data) => `<span class="badge ${data ? 'bg-success' : 'bg-secondary'}">${data ? 'Active' : 'Inactive'}</span>`
    },
    {
      title: 'Actions',
      data: '_id',
      render: (data, type, row) => `
        <div class="d-flex gap-1">
          <button class="btn btn-sm btn-outline-primary toggle-status-btn fw-semibold" data-id="${data}" data-status="${row.active ? 1 : 0}">${row.active ? 'Deactivate' : 'Activate'}</button>
          <button class="btn btn-sm btn-outline-danger datatable-delete-btn fw-semibold" data-id="${data}">Delete</button>
        </div>
      `
    }
  ];

  const isAll = form.scope === 'ALL';
  const isGroup = form.scope === 'GROUP';
  const isStudents = form.scope === 'STUDENTS';

  return (
    <div className="p-3.5">
      {/* Top Banner Header */}
      <div className="card border-0 shadow-sm p-3 mb-3 rounded-3 text-white" style={{ background: '#4C1D95' }}>
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2.5">
            <FaTags className="text-warning" size={24} />
            <div>
              <h5 className="fw-bold mb-0 text-white">Super Admin Coupon Engine</h5>
              <span className="text-white-50 extra-small">Discounts scoped to ALL students · a group · selected students, valid in a time window</span>
            </div>
          </div>
          <button className="btn btn-warning btn-sm fw-bold d-flex align-items-center gap-2 rounded-pill px-3 shadow-sm text-dark" onClick={() => setShowCreateModal(true)}>
            <FaPlus size={12} /> Create Coupon
          </button>
        </div>
      </div>

      <DataTable
        title="Coupon Records"
        columns={columns}
        data={coupons}
        loading={loading}
        deleteEndpoint="/admin/payments/coupons"
        onDeleteSuccess={() => fetchAll()}
        onStatusToggle={(id) => {
          const c = coupons.find((x) => String(x._id) === String(id));
          if (c) handleToggleActive(c);
        }}
      />

      {/* CREATE COUPON MODAL */}
      {showCreateModal && (
        <div className="modal show d-block bg-dark bg-opacity-65" tabIndex="-1" style={{ zIndex: 1055 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <div className="modal-header text-white" style={{ background: '#4C1D95' }}>
                <h5 className="modal-title fw-bold text-white d-flex align-items-center gap-2">
                  <FaTags className="text-warning" size={20} /> Create Working Coupon
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowCreateModal(false)}></button>
              </div>

              <form onSubmit={handleCreate}>
                <div className="modal-body p-3 p-md-4 bg-light">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Coupon Code</label>
                      <input
                        type="text"
                        className="form-control text-uppercase"
                        placeholder="e.g. FEST2026ALL"
                        value={form.code}
                        onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Discount Type</label>
                      <div className="input-group">
                        <span className="input-group-text">{form.discountType === 'PERCENT' ? <FaPercentage /> : <FaRupeeSign />}</span>
                        <select
                          className="form-select"
                          value={form.discountType}
                          onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                        >
                          <option value="PERCENT">Percent (%)</option>
                          <option value="FIXED">Fixed (₹)</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Discount Value</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        placeholder={form.discountType === 'PERCENT' ? 'e.g. 20 → 20% off' : 'e.g. 100 → ₹100 off'}
                        value={form.discountValue}
                        onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Scope</label>
                      <select
                        className="form-select"
                        value={form.scope}
                        onChange={(e) => setForm({ ...form, scope: e.target.value })}
                      >
                        <option value="ALL">All students (everyone)</option>
                        <option value="STUDENTS">Selected students</option>
                        <option value="GROUP">A group of students</option>
                      </select>
                    </div>

                    {isStudents && (
                      <div className="col-12">
                        <label className="form-label fw-semibold d-flex align-items-center gap-1"><FaUsers /> Select Students</label>
                        <select
                          multiple
                          className="form-select"
                          style={{ minHeight: '120px' }}
                          value={form.studentIds.map(String)}
                          onChange={(e) => setForm({ ...form, studentIds: Array.from(e.target.selectedOptions, (o) => o.value) })}
                        >
                          {(students || []).map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.name || s.fullName || s.email} {s.studentId ? `(${s.studentId})` : ''}
                            </option>
                          ))}
                        </select>
                        <div className="form-text">Hold Ctrl/Cmd to select multiple students.</div>
                      </div>
                    )}

                    {isGroup && (
                      <div className="col-12">
                        <label className="form-label fw-semibold d-flex align-items-center gap-1"><FaUsers /> Select Group</label>
                        <select
                          className="form-select"
                          value={form.groupIds[0] || ''}
                          onChange={(e) => setForm({ ...form, groupIds: e.target.value ? [e.target.value] : [] })}
                        >
                          <option value="">— Select a group —</option>
                          {(groups || []).map((g) => (
                            <option key={g._id} value={g._id}>{g.name}</option>
                          ))}
                        </select>
                        {groups.length === 0 && <div className="form-text text-warning">No groups yet. Create one via the API or add to Mongo.</div>}
                      </div>
                    )}

                    <div className="col-md-6">
                      <label className="form-label fw-semibold d-flex align-items-center gap-1"><FaCalendarAlt /> Valid From</label>
                      <input type="datetime-local" className="form-control" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold d-flex align-items-center gap-1"><FaCalendarAlt /> Valid Until</label>
                      <input type="datetime-local" className="form-control" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Per User Limit</label>
                      <input type="number" min="1" className="form-control" value={form.perUserLimit} onChange={(e) => setForm({ ...form, perUserLimit: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Max Total Redemptions (0 = unlimited)</label>
                      <input type="number" min="0" className="form-control" value={form.maxRedemptions} onChange={(e) => setForm({ ...form, maxRedemptions: e.target.value })} />
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-0 bg-white p-3">
                  <button type="button" className="btn btn-outline-secondary fw-bold px-4" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn fw-bold px-4 text-white" style={{ background: '#4F46E5' }} disabled={saving}>
                    {saving ? <FaSpinner className="fa-spin me-2" /> : <FaPlus className="me-2" />}Create Coupon
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminCoupons;