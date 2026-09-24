import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import toast from 'react-hot-toast';
import DataTable from './components/DataTable';
import {
  FaCreditCard,
  FaRupeeSign,
  FaReceipt,
  FaTags,
  FaCalendarAlt,
  FaChartLine,
  FaFilter
} from 'react-icons/fa';

const PURPOSE_LABELS = {
  MOCK_LEVELS: 'Mock Interviews',
  ATS_PRO: 'ATS Pro',
  SUPER_PACK: 'Super Pack'
};

const PURPOSE_COLORS = {
  MOCK_LEVELS: '#4F46E5',
  ATS_PRO: '#0891B2',
  SUPER_PACK: '#7C3AED'
};

const SuperAdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [purposeFilter, setPurposeFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paymentsRes, analyticsRes] = await Promise.all([
        API.get('/admin/payments').catch(() => ({ data: { payments: [] } })),
        API.get('/admin/payments/analytics').catch(() => ({ data: { totals: {}, revenueByDay: [], revenueByPurpose: [], revenueByMethod: [], couponReport: [] } }))
      ]);
      setPayments(paymentsRes.data.payments || []);
      setAnalytics(analyticsRes.data || {});
    } catch (err) {
      toast.error('Failed to fetch payment records.');
    } finally {
      setLoading(false);
    }
  };

  const applyDateFilter = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (fromDate) params.set('from', fromDate);
      if (toDate) params.set('to', toDate);
      const qs = params.toString();
      const res = await API.get(`/admin/payments/analytics${qs ? `?${qs}` : ''}`);
      setAnalytics(res.data || {});
    } catch (err) {
      toast.error('Failed to fetch analytics.');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const fmtRs = (paise) => `₹${((paise || 0) / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  const filteredPayments = purposeFilter
    ? payments.filter((p) => p.purpose === purposeFilter)
    : payments;

  const columns = [
    { title: 'Student', data: 'student', render: (data) => `<strong>${data?.name || data?.fullName || 'N/A'}</strong><span class="d-block text-muted" style="font-size:0.8rem;">${data?.email || ''}</span>` },
    {
      title: 'Plan',
      data: 'purpose',
      render: (data) => {
        const label = PURPOSE_LABELS[data] || (data || '').replace(/_/g, ' ');
        const color = PURPOSE_COLORS[data] || '#6B7280';
        return `<span class="badge" style="background:${color};color:#fff;">${label}</span>`;
      }
    },
    { title: 'Paid', data: 'payableAmountPaise', render: (data) => `<strong>${fmtRs(data)}</strong>` },
    { title: 'Discount', data: 'discountPaise', render: (data) => (data ? `<span class="text-success">−${fmtRs(data)}</span>` : '—') },
    { title: 'Coupon', data: 'coupon', render: (data) => (data?.code ? `<span class="badge" style="background:#F59E0B;color:#fff;">${data.code}</span>` : '—') },
    { title: 'Method', data: 'method', render: (data) => (data ? data.toUpperCase() : '—') },
    {
      title: 'Status',
      data: 'status',
      render: (data) => {
        const color = data === 'PAID' ? 'success' : data === 'FAILED' ? 'danger' : data === 'REFUNDED' ? 'warning' : 'secondary';
        return `<span class="badge bg-${color}">${data}</span>`;
      }
    },
    { title: 'Date & Time', data: 'createdAt', render: (data) => formatDateTime(data) }
  ];

  const totals = analytics?.totals || { totalRevenuePaise: 0, totalDiscountPaise: 0, totalOrders: 0, avgOrderPaise: 0 };

  return (
    <div className="p-3.5">
      {/* Top Banner Header */}
      <div className="card border-0 shadow-sm p-3 mb-3 rounded-3 text-white" style={{ background: '#4C1D95' }}>
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2.5">
            <FaCreditCard className="text-warning" size={24} />
            <div>
              <h5 className="fw-bold mb-0 text-white">Payments &amp; Revenue Analytics</h5>
              <span className="text-white-50 extra-small">Razorpay · Descriptive revenue view · Coupon economics</span>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-outline-light btn-sm fw-semibold" onClick={fetchData}>
              <FaChartLine className="me-1" /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="row g-3 mb-3">
        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm p-3 rounded-3 h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted small text-uppercase fw-semibold">Total Revenue</div>
                <div className="fs-3 fw-extrabold text-success">{fmtRs(totals.totalRevenuePaise)}</div>
              </div>
              <FaRupeeSign className="text-success" size={28} />
            </div>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm p-3 rounded-3 h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted small text-uppercase fw-semibold">Total Orders</div>
                <div className="fs-3 fw-extrabold">{totals.totalOrders}</div>
              </div>
              <FaReceipt className="text-primary" size={28} />
            </div>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm p-3 rounded-3 h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted small text-uppercase fw-semibold">Avg Order</div>
                <div className="fs-3 fw-extrabold">{fmtRs(totals.avgOrderPaise)}</div>
              </div>
              <FaChartLine className="text-info" size={28} />
            </div>
          </div>
        </div>
        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm p-3 rounded-3 h-100">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted small text-uppercase fw-semibold">Coupons Given</div>
                <div className="fs-3 fw-extrabold text-warning">{fmtRs(totals.totalDiscountPaise)}</div>
              </div>
              <FaTags className="text-warning" size={28} />
            </div>
          </div>
        </div>
      </div>

      {/* COUPON ECONOMICS SUMMARY */}
      <div className="card border-0 shadow-sm mb-3 rounded-3">
        <div className="card-body py-3">
          <h6 className="fw-bold mb-2 d-flex align-items-center gap-2"><FaTags className="text-warning" /> Coupon Economics — discounts given vs revenue earned</h6>
          {analytics?.couponReport?.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-sm align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Code</th>
                    <th className="text-end">Redemptions</th>
                    <th className="text-end">Discount Given</th>
                    <th className="text-end">Revenue Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.couponReport.map((c, i) => (
                    <tr key={String(c._id) || i}>
                      <td><span className="badge" style={{ background: '#F59E0B', color: '#fff' }}>{c.code || '—'}</span></td>
                      <td className="text-end">{c.redemptions}</td>
                      <td className="text-end text-danger">−{fmtRs(c.discounts)}</td>
                      <td className="text-end fw-bold text-success">{fmtRs(c.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-muted small">No coupon redemptions yet.</div>
          )}
        </div>
      </div>

      {/* DATE FILTER */}
      <div className="card border-0 shadow-sm mb-3 rounded-3">
        <div className="card-body py-3">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label fw-semibold d-flex align-items-center gap-1"><FaCalendarAlt /> From Date</label>
              <input type="date" className="form-control" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold d-flex align-items-center gap-1"><FaCalendarAlt /> To Date</label>
              <input type="date" className="form-control" value={toDate} min={fromDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold d-flex align-items-center gap-1"><FaFilter /> Plan</label>
              <select className="form-select" value={purposeFilter} onChange={(e) => setPurposeFilter(e.target.value)}>
                <option value="">All Plans</option>
                {Object.entries(PURPOSE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3 d-flex gap-2">
              <button type="button" className="btn btn-primary btn-sm fw-bold px-4" onClick={applyDateFilter}>
                Apply Filter
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm fw-bold px-4"
                onClick={() => {
                  setFromDate('');
                  setToDate('');
                  setPurposeFilter('');
                  fetchData();
                }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PAYMENTS MASTER TABLE */}
      <DataTable
        title="Payment Records"
        columns={columns}
        data={filteredPayments}
        loading={loading}
        options={{ order: [[7, 'desc']] }}
      />
    </div>
  );
};

export default SuperAdminPayments;