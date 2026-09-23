import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import {
  FaBoxOpen,
  FaUserGraduate,
  FaMicrophone,
  FaFileAlt,
  FaLayerGroup,
  FaSyncAlt,
  FaLink
} from 'react-icons/fa';
import DataTable from './components/DataTable';

const PLAN_META = {
  mock: {
    label: 'Mock Interviews',
    short: 'Mock',
    color: '#4F46E5'
  },
  ats: {
    label: 'ATS Pro',
    short: 'ATS Pro',
    color: '#0891B2'
  },
  superPack: {
    label: 'Super Pack (Both)',
    short: 'Super Pack',
    color: '#7C3AED'
  },
  none: {
    label: 'No Plan',
    short: 'None',
    color: '#64748B'
  }
};

const SuperAdminPlans = () => {
  const [entitlements, setEntitlements] = useState([]);
  const [planCounts, setPlanCounts] = useState({
    total: 0, mock: 0, atsPro: 0, superPack: 0, none: 0
  });
  const [loading, setLoading] = useState(true);
  const [planFilter, setPlanFilter] = useState('');
  const [grantOnly, setGrantOnly] = useState(false);
  const [revokeOnly, setRevokeOnly] = useState(false);

  useEffect(() => {
    fetchEntitlements();
  }, []);

  const fetchEntitlements = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/entitlements');
      if (res.data && res.data.success) {
        const list = (res.data.entitlements || []).map((e, index) => ({
          ...e,
          serialNumber: index + 1
        }));
        setEntitlements(list);
        setPlanCounts(res.data.planCounts || { total: 0, mock: 0, atsPro: 0, superPack: 0, none: 0 });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load plans data.');
    } finally {
      setLoading(false);
    }
  };

  const getPlanKind = (row) => {
    const mock = Boolean(row.mockLevelsUnlocked);
    const ats = Boolean(row.atsProUnlocked);
    if (mock && ats) return 'superPack';
    if (mock) return 'mock';
    if (ats) return 'ats';
    return 'none';
  };

  const handleToggle = async (studentId, part, grant) => {
    const partLabel = part === 'mock' ? 'Mock Interviews' : 'ATS Pro';
    const actionText = grant ? 'grant' : 'revoke';

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to ${actionText} ${partLabel} access for this student?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, ${actionText}`,
      confirmButtonColor: grant ? '#16A34A' : '#DC2626',
      cancelButtonColor: '#6B7280',
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    try {
      toast.loading('Updating feature access...', { id: 'plan-update' });
      const body = {};
      if (part === 'mock') body.mockLevelsUnlocked = grant;
      if (part === 'ats') body.atsProUnlocked = grant;

      const res = await API.put(`/admin/students/${studentId}/entitlements`, body);
      if (res.data && res.data.success) {
        toast.success(`${partLabel} access ${actionText}ed.`, { id: 'plan-update' });
        fetchEntitlements();
      } else {
        toast.error('Failed to update feature access.', { id: 'plan-update' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update feature access.', { id: 'plan-update' });
    }
  };

  const handleBulkAction = async (action) => {
    const isGrant = action === 'grant';
    const grantSet = grantOnly;
    const revokeSet = revokeOnly;
    if (!grantSet && !revokeSet) {
      toast.warning('Select at least one plan to target.');
      return;
    }

    const plansToTarget = [];
    if (grantSet.mock) plansToTarget.push('Mock Interviews');
    if (grantSet.ats) plansToTarget.push('ATS Pro');

    const result = await Swal.fire({
      title: `Bulk ${isGrant ? 'Grant' : 'Revoke'}?`,
      html: `This will ${isGrant ? 'grant' : 'revoke'} <strong>${plansToTarget.join(' + ') || 'All plans'}</strong> to <strong>all students</strong> currently without the plan.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, ${isGrant ? 'Grant' : 'Revoke'} All`,
      cancelButtonText: 'Cancel',
      confirmButtonColor: isGrant ? '#16A34A' : '#DC2626',
      cancelButtonColor: '#6B7280',
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    try {
      toast.loading('Applying to all students...', { id: 'plan-bulk' });
      const res = await API.put('/admin/entitlements/bulk', { action, plans: { mock: grantSet.mock, ats: grantSet.ats } });
      if (res.data && res.data.success) {
        toast.success(res.data.message || 'Bulk update completed.', { id: 'plan-bulk' });
        fetchEntitlements();
      } else {
        toast.error('Bulk update failed.', { id: 'plan-bulk' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk update failed.', { id: 'plan-bulk' });
    }
  };

  const filteredEntitlements = (() => {
    let list = entitlements;
    if (planFilter) {
      list = list.filter((e) => getPlanKind(e) === planFilter);
    }
    return list;
  })();

  const columns = [
    {
      title: 'S.No.',
      data: 'serialNumber',
      orderable: false,
      searchable: false,
      render: (data) => `<span style="width:70px;display:block;text-align:center;">${data}.</span>`
    },
    {
      title: 'Student',
      data: 'fullName',
      render: (_data, _type, row) => `
        <div>
          <a href="/super-admin/students" class="text-decoration-none fw-bold" style="color:#6D28D9;">${row.fullName || 'Student'}</a>
          ${row.email ? `<span class="d-block text-muted" style="font-size:0.8rem;">${row.email}</span>` : ''}
        </div>
      `
    },
    {
      title: 'Plans',
      data: 'accessUnlocked',
      orderable: false,
      render: (_data, _type, row) => {
        const kind = getPlanKind(row);
        const meta = PLAN_META[kind];
        return `<span class="badge" style="background:${meta.color};color:#fff;">${meta.short}</span>`;
      }
    },
    {
      title: 'Unlocked On',
      data: 'createdAt',
      render: (_data, _type, row) => {
        const date = row.accessUnlocked ? row.unlockedAt || row.createdAt : null;
        if (!date) return '<span class="text-muted small">—</span>';
        const d = new Date(date);
        return `<span class="text-muted small">${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>`;
      }
    },
    {
      title: 'Actions',
      data: '_id',
      orderable: false,
      searchable: false,
      render: (_data, _type, row) => `
        <div style="white-space:nowrap;">
          <a href="#" class="entitlement-toggle-link text-decoration-none me-2" style="color:#6D28D9;" data-id="${row._id}" data-part="mock" data-grant="${!row.mockLevelsUnlocked ? 'true' : 'false'}">
            ${row.mockLevelsUnlocked ? 'Revoke Mock' : 'Grant Mock'}
          </a>
          <a href="#" class="entitlement-toggle-link text-decoration-none" style="color:#0E7490;" data-id="${row._id}" data-part="ats" data-grant="${!row.atsProUnlocked ? 'true' : 'false'}">
            ${row.atsProUnlocked ? 'Revoke ATS' : 'Grant ATS'}
          </a>
        </div>
      `
    }
  ];

  useEffect(() => {
    const handleToggleClick = (event) => {
      const link = event.target.closest('.entitlement-toggle-link');
      if (!link) return;
      event.preventDefault();
      handleToggle(link.dataset.id, link.dataset.part, link.dataset.grant === 'true');
    };

    document.addEventListener('click', handleToggleClick);
    return () => {
      document.removeEventListener('click', handleToggleClick);
    };
  }, [entitlements]);

  const statCards = [
    { label: 'Total Students', value: planCounts.total, color: '#2563EB', icon: FaUserGraduate },
    { label: 'Mock Interviews', value: planCounts.mock, color: PLAN_META.mock.color, icon: FaMicrophone },
    { label: 'ATS Pro', value: planCounts.atsPro, color: PLAN_META.ats.color, icon: FaFileAlt },
    { label: 'Super Pack', value: planCounts.superPack, color: PLAN_META.superPack.color, icon: FaLayerGroup },
    { label: 'No Plan', value: planCounts.none, color: PLAN_META.none.color, icon: FaBoxOpen }
  ];

  return (
    <div className="p-3 p-lg-4">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <div>
          <h4 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <FaBoxOpen style={{ color: '#7C3AED' }} /> Plans & Feature Access
          </h4>
          <p className="text-muted mb-0 small">
            Manage paid feature access (Mock Interviews / ATS Pro) for students. Linked to Student Records.
          </p>
        </div>
        <button type="button" className="btn btn-outline-secondary btn-sm fw-semibold" onClick={fetchEntitlements} disabled={loading}>
          <FaSyncAlt className="me-2" />Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="row g-3 mb-3">
        {statCards.map((card) => {
          const IconComp = card.icon;
          return (
            <div key={card.label} className="col-6 col-md-4 col-xl-2">
              <div className="card border-0 shadow-sm rounded-3 h-100">
                <div className="card-body py-3">
                  <div className="d-flex align-items-center gap-2">
                    <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px', background: `${card.color}1A`, color: card.color }}>
                      <IconComp size={16} />
                    </div>
                    <div className="fw-bold fs-5">{card.value}</div>
                  </div>
                  <div className="small text-muted mt-2">{card.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="row g-3 align-items-end mb-3">
        <div className="col-md-3">
          <label className="form-label fw-semibold small mb-1">Filter by Plan</label>
          <select className="form-select" value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}>
            <option value="">All Plans</option>
            {Object.entries(PLAN_META).map(([key, meta]) => (
              <option key={key} value={key}>{meta.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk actions */}
      <div className={`card mb-3 rounded-3 ${loading ? 'opacity-50 pointer-events-none' : ''}`} style={{ borderLeft: '4px solid #7C3AED' }}>
        <div className="card-body py-3">
          <div className="d-flex flex-wrap align-items-center gap-3">
            <div className="fw-semibold small">Bulk update:</div>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="checkbox" id="bulk-mock" checked={grantOnly.mock} onChange={(e) => setGrantOnly((prev) => ({ ...prev, mock: e.target.checked }))} />
              <label className="form-check-label small" htmlFor="bulk-mock">Mock Interviews</label>
            </div>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="checkbox" id="bulk-ats" checked={grantOnly.ats} onChange={(e) => setGrantOnly((prev) => ({ ...prev, ats: e.target.checked }))} />
              <label className="form-check-label small" htmlFor="bulk-ats">ATS Pro</label>
            </div>
            <div className="d-flex gap-2 ms-auto">
              <button type="button" className="btn btn-success btn-sm fw-semibold px-3" onClick={() => handleBulkAction('grant')} disabled={loading}>
                Grant to all
              </button>
              <button type="button" className="btn btn-outline-danger btn-sm fw-semibold px-3" onClick={() => handleBulkAction('revoke')} disabled={loading}>
                Revoke from all
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Plans table */}
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body">
          <DataTable
            columns={columns}
            data={filteredEntitlements}
            loading={loading}
            title="Plans"
          />
        </div>
      </div>
    </div>
  );
};

export default SuperAdminPlans;