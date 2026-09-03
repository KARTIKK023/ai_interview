import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { FaBrain } from 'react-icons/fa';
import toast from 'react-hot-toast';
import DataTable from './components/DataTable';
import InterviewReportContent from '../../components/InterviewReportContent';
import SuperAdminStudentProfileView from './components/SuperAdminStudentProfileView';

const SuperAdminMockInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const [selectedMonth, setSelectedMonth] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Performance Report Modal States
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    fetchInterviews();
  }, []);

 const fetchInterviews = async () => {
  try {
    setLoading(true);

    const res = await API.get('/admin/mock-interviews');

    if (res.data?.success) {

      const interviewsData =
        res.data.mockInterviews ||
        res.data.interviews ||
        [];

      const interviewsWithSerialNumber = interviewsData.map(
        (interview, index) => ({
          ...interview,
          serialNumber: index + 1
        })
      );

      setInterviews(interviewsWithSerialNumber);
    }

  } catch (err) {
    console.error('Failed to load mock interviews:', err);
    toast.error('Failed to fetch mock interview records from database.');
  } finally {
    setLoading(false);
  }
};

  const handleOpenReport = async (id) => {
    try {
      setSelectedReportId(id);
      setLoadingReport(true);
      setReportData(null);
      const res = await API.get(`/interviews/${id}`);
      if (res.data) {
        setReportData(res.data);
      } else {
        toast.error('Performance report not found');
      }
    } catch (err) {
      console.error('Failed to load interview report:', err);
      toast.error('Failed to fetch performance report for this session.');
    } finally {
      setLoadingReport(false);
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'N/A';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const strHours = String(hours).padStart(2, '0');

    return `${day}/${month}/${year}, ${strHours}:${minutes} ${ampm}`;
  };

  const filteredInterviews = interviews.filter((interview) => {
  if (!interview.createdAt) return false;

  const interviewDate = new Date(interview.createdAt);

  if (isNaN(interviewDate.getTime())) return false;

  // MONTH FILTER
  if (selectedMonth) {
    const year = interviewDate.getFullYear();

    const month = String(
      interviewDate.getMonth() + 1
    ).padStart(2, '0');

    const interviewMonth = `${year}-${month}`;

    if (interviewMonth !== selectedMonth) {
      return false;
    }
  }

  // FROM DATE FILTER
  if (startDate) {
    const start = new Date(`${startDate}T00:00:00`);

    if (interviewDate < start) {
      return false;
    }
  }

  // TO DATE FILTER
  if (endDate) {
    const end = new Date(`${endDate}T23:59:59.999`);

    if (interviewDate > end) {
      return false;
    }
  }

  return true;
});

  const columns = [
       {
  title: '<span style="display:block; width:70px; text-align:center;">S.No.</span>',
  data: 'serialNumber',
  orderable: false,
  searchable: false,
  render: (data) => `
    <span style="
      display:block;
      width:70px;
      text-align:center;
    ">
      ${data}.
    </span>
  `
},
     
    {
      title: 'Candidate Name',
      data: 'candidateId',
      render: (_data, _type, row) => {
        const name = row.candidateId?.fullName || row.candidateId?.name || row.candidateName || 'Candidate';
        const targetId = row.candidateId?._id || (typeof row.candidateId === 'string' ? row.candidateId : null) || row.createdBy?._id || row.studentId;
        return `
          <a href="#" class="view-student-profile text-decoration-none fw-bold" style="color: #6D28D9;" data-id="${targetId || ''}" title="Click to view full candidate profile">
            ${name}
          </a>
        `;
      }
    },
    {
      title: 'Job Role / Title',
      data: 'jobRole',
      render: (data, _type, row) => data || row.title || 'Scenario Evaluation'
    },
    {
      title: 'Category',
      data: 'category',
      render: (data) => `<span class="badge bg-secondary">${data || 'Technical'}</span>`
    },
    {
      title: 'Mode',
      data: 'mode',
      render: (data) => `<span class="badge bg-info">${data || 'Text'}</span>`
    },
    {
      title: 'Status',
      data: 'status',
      render: (data) => {
        const badgeClass = data === 'Completed' ? 'bg-success' : 'bg-warning';
        return `<span class="badge ${badgeClass}">${data || 'Pending'}</span>`;
      }
    },
    {
      title: 'AI Score',
      data: 'score',
      render: (data, _type, row) => {
        const val = data ?? row.percentage ?? 0;
        return `<strong class="text-success">${val}%</strong>`;
      }
    },
    {
      title: 'Date',
      data: 'createdAt',
      render: (data) => `<span class="text-nowrap font-monospace small">${formatDateTime(data)}</span>`
    },
    {
      title: 'Performance Report',
      data: '_id',
      render: (data, type, row) => {
        const id = row._id || data;
        return `<button class="btn btn-sm btn-primary d-inline-flex align-items-center gap-1.5 view-report-btn" data-id="${id}" style="background-color: #4C1D95; border-color: #4C1D95; font-size: 0.775rem; padding: 4px 12px; font-weight: 600; border-radius: 6px;">
          <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="13" width="13" xmlns="http://www.w3.org/2000/svg"><path d="M464 64H48C21.5 64 0 85.5 0 112v288c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48zM96 368c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32-32 32-14.3 32-32 32zm0-96c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32-32 32-14.3 32-32 32zm0-96c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32-32 32-14.3 32-32 32zm288 200H192c-8.8 0-16-7.2-16-16s7.2-16 16-16h192c8.8 0 16 7.2 16 16s-7.2 16-16 16zm0-96H192c-8.8 0-16-7.2-16-16s7.2-16 16-16h192c8.8 0 16 7.2 16 16s-7.2 16-16 16zm0-96H192c-8.8 0-16-7.2-16-16s7.2-16 16-16h192c8.8 0 16 7.2 16 16s-7.2 16-16 16z"></path></svg>
          View 
        </button>`;
      }
    }
  ];

  if (selectedStudentId) {
    return (
      <div className="p-3.5">
        <SuperAdminStudentProfileView
          studentId={selectedStudentId}
          onBack={() => setSelectedStudentId(null)}
          backTitle="Back to Mock Interviews"
        />
      </div>
    );
  }

  return (
    <div className="p-3.5">
      <div className="card border-0 shadow-sm p-3 mb-3 rounded-3 text-white" style={{ background: '#4C1D95' }}>
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <FaBrain className="text-white" size={22} />
            <h5 className="fw-bold mb-0 text-white">Mock Interviews ({interviews.length})</h5>
          </div>
          <span className="badge rounded-pill px-3 py-1" style={{ background: '#8B5CF6', color: '#FFFFFF' }}>
            Gemini AI Evaluations
          </span>
        </div>
      </div>

      {/* ================= MOCK INTERVIEW DATE FILTER ================= */}
<div className="card border-0 shadow-sm mb-3 rounded-3">
  <div className="card-body py-3">

    <div className="row g-3 align-items-end">

      {/* Search by Month */}
      <div className="col-md-3">
        <label className="form-label fw-semibold">
          Search by Month
        </label>

        <input
          type="month"
          className="form-control"
          value={selectedMonth}
          onChange={(e) => {
            setSelectedMonth(e.target.value);

            // Clear date range
            setStartDate('');
            setEndDate('');
          }}
        />
      </div>

      {/* From Date */}
      <div className="col-md-3">
        <label className="form-label fw-semibold">
          From Date
        </label>

        <input
          type="date"
          className="form-control"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);

            // Clear month filter
            setSelectedMonth('');

            // Prevent invalid date range
            if (endDate && e.target.value > endDate) {
              setEndDate('');
            }
          }}
        />
      </div>

      {/* To Date */}
      <div className="col-md-3">
        <label className="form-label fw-semibold">
          To Date
        </label>

        <input
          type="date"
          className="form-control"
          value={endDate}
          min={startDate}
          onChange={(e) => {
            setEndDate(e.target.value);

            // Clear month filter
            setSelectedMonth('');
          }}
        />
      </div>

      {/* Clear Filters */}
      <div className="col-md-2">
        <button
          type="button"
          className="btn btn-outline-secondary w-100"
          onClick={() => {
            setSelectedMonth('');
            setStartDate('');
            setEndDate('');
          }}
        >
          Clear Filters
        </button>
      </div>

      {/* Interview Records Count */}
      <div className="col-md-1">
        <div className="text-muted small">
          Records
        </div>

        <div className="fw-bold fs-5 text-primary">
          {filteredInterviews.length}
        </div>
      </div>

    </div>

  </div>
</div>

      <DataTable
        title="Mock Interviews Master Table"
        columns={columns}
        data={filteredInterviews}
        loading={loading}
        onReportClick={handleOpenReport}
        onStudentClick={(id) => setSelectedStudentId(id)}
      />

      {/* PERFORMANCE REPORT MODAL */}
      {selectedReportId && (
        <div className="modal show d-block bg-dark bg-opacity-60" tabIndex="-1" style={{ zIndex: 1055 }}>
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <div className="modal-header text-white" style={{ background: '#4C1D95' }}>
                <h5 className="modal-title fw-bold text-white d-flex align-items-center gap-2">
                  <FaBrain className="text-white" size={18} /> Candidate Performance Report
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => { setSelectedReportId(null); setReportData(null); }}
                ></button>
              </div>

              <div className="modal-body p-4 bg-light">
                {loadingReport ? (
                  <div className="p-5 text-center text-muted">
                    <div className="spinner-border text-purple mb-2" role="status"></div>
                    <p className="mb-0 fw-semibold">Fetching AI Performance Report from database...</p>
                  </div>
                ) : reportData ? (
                  <InterviewReportContent
                    data={reportData}
                    isModal={true}
                    onClose={() => { setSelectedReportId(null); setReportData(null); }}
                  />
                ) : (
                  <div className="p-5 text-center text-danger">
                    <p className="mb-0">Unable to load report data for this interview session.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminMockInterviews;
