import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../../services/api';
import { FaBrain, FaPaperPlane } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import DataTable from './components/DataTable';
import InterviewReportContent from '../../components/InterviewReportContent';
import SuperAdminStudentProfileView from './components/SuperAdminStudentProfileView';

const SuperAdminMockInterviews = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const [selectedInterviewIds, setSelectedInterviewIds] = useState([]);
  const [sendingNotification, setSendingNotification] =
  useState(false);

  const [selectedMonth, setSelectedMonth] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || '');

  // Performance Report Modal States
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    fetchInterviews();
  }, []);

  useEffect(() => {
    const statusFromUrl = searchParams.get('status') || '';
    setSelectedStatus(statusFromUrl);
  }, [searchParams]);

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
    // STATUS FILTER
    if (selectedStatus) {
      const st = selectedStatus.toLowerCase();
      const invStatus = (interview.status || 'Pending').toLowerCase();
      if (st === 'completed') {
        if (invStatus !== 'completed') return false;
      } else if (st === 'pending') {
        if (invStatus === 'completed') return false;
      } else {
        if (invStatus !== st) return false;
      }
    }

    // DATE FILTERS (only run when a date/month filter is actively set)
    if (selectedMonth || startDate || endDate) {
      if (!interview.createdAt) return false;
      const interviewDate = new Date(interview.createdAt);
      if (isNaN(interviewDate.getTime())) return false;

      // MONTH FILTER
      if (selectedMonth) {
        const year = interviewDate.getFullYear();
        const month = String(interviewDate.getMonth() + 1).padStart(2, '0');
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
    }

    return true;
  });

  // ==========================================
  // SELECT ALL INTERVIEWS IN FILTERED SET
  // ==========================================
  const handleSelectAllInterviews = () => {
    const allFilteredIds = filteredInterviews
      .map((inv) => String(inv._id))
      .filter(Boolean);

    const currentSelectedStr = selectedInterviewIds.map(String);

    const allSelected =
      allFilteredIds.length > 0 &&
      allFilteredIds.every((id) => currentSelectedStr.includes(id));

    if (allSelected) {
      setSelectedInterviewIds((previousIds) =>
        previousIds.map(String).filter((id) => !allFilteredIds.includes(id))
      );
    } else {
      setSelectedInterviewIds((previousIds) => [
        ...new Set([...previousIds.map(String), ...allFilteredIds])
      ]);
    }
  };

  const handleSelectInterview = (id) => {
    if (!id) return;
    const targetId = String(id);
    setSelectedInterviewIds((previousIds) => {
      const stringIds = (previousIds || []).map(String);
      if (stringIds.includes(targetId)) {
        return stringIds.filter((item) => item !== targetId);
      }
      return [...stringIds, targetId];
    });
  };

  // ==========================================
  // SYNC DOM CHECKBOXES & HEADER INDETERMINATE STATE
  // ==========================================
  useEffect(() => {
    const currentStr = selectedInterviewIds.map(String);
    const filteredIds = filteredInterviews.map((inv) => String(inv._id)).filter(Boolean);
    const selectedCount = filteredIds.filter((id) => currentStr.includes(id)).length;

    const isAllSelected = filteredIds.length > 0 && selectedCount === filteredIds.length;
    const isPartiallySelected = selectedCount > 0 && !isAllSelected;

    // Sync row checkboxes
    document.querySelectorAll('.student-notification-checkbox, .select-interview-checkbox').forEach((cb) => {
      const id = cb.getAttribute('data-id');
      if (id) {
        cb.checked = currentStr.includes(String(id));
      }
    });

    // Sync header select-all checkbox
    const headerCb = document.querySelector('#select-all-students, #select-all-interviews, .select-all-students-checkbox, .select-all-interviews');
    if (headerCb) {
      headerCb.checked = isAllSelected;
      headerCb.indeterminate = isPartiallySelected;
    }
  }, [selectedInterviewIds, filteredInterviews]);
const getScoreBasedTemplate = (scoreVal) => {
  const numericScore = Number(scoreVal) || 0;
  if (numericScore === 0) {
    return {
      subject : 'Your Interview Comeback Starts Today! 🔥',
      message: 'Don’t let one result stop you. Practice with AI-powered interviews and improve your skills with every attempt.\n\n🎁 Special Offer: Get 20% OFF'
    };
  } else if (numericScore < 50) {
    return {
      subject: 'Your Next Score Can Be Better! 🚀',
      message: 'You’ve started your journey — now it’s time to level up. Practice more AI interviews and turn your weak areas into strengths.\n\n🎁 Get 15% OFF Your Subscription'
    };
  } else if (numericScore < 90) {
    return {
      subject: 'You’re Getting Closer! 💪',
      message: 'Your performance is improving. Take your preparation to the next level with advanced AI interviews and personalized feedback.\n\n🎁 Get 10% OFF'
    };
  } else {
    return {
      subject: '90%+ Accuracy! You’re Interview Ready! 🏆',
      message: 'Your performance is outstanding! Now challenge yourself with advanced interviews and get closer to your dream job.\n\n🔥 Unlock Elite Preparation & Get 15% OFF'
    };
  }
};

//send mail with score-based dynamic template
const handleSendScoreNotification = async (targetIds = null) => {
  const idsToSend = Array.isArray(targetIds) && targetIds.length > 0
    ? targetIds
    : selectedInterviewIds;

  if (idsToSend.length === 0) {
    toast.error('Please select at least one mock interview to send a message.');
    return;
  }

  const selectedList = interviews.filter(inv => idsToSend.includes(String(inv._id)));
  let formValues = null;

  if (idsToSend.length === 1 && selectedList.length === 1) {
    const singleInv = selectedList[0];
    const candidateName = singleInv.candidateId?.fullName || singleInv.candidateId?.name || singleInv.candidateName || 'Candidate';
    const scoreVal = Number(singleInv.score ?? singleInv.percentage ?? 0);
    const template = getScoreBasedTemplate(scoreVal);
    const badgeColor = scoreVal >= 90 ? '#10B981' : scoreVal >= 50 ? '#3B82F6' : scoreVal > 0 ? '#F59E0B' : '#EF4444';

    const { value } = await Swal.fire({
      title: `<span style="color:#4C1D95; font-weight:700;">Send Score-Based Email Message</span>`,
      html: `
        <div style="text-align:left;">
          <div style="background:#F3E8FF; border:1px solid #E9D5FF; border-radius:8px; padding:10px 14px; margin-bottom:14px; display:flex; align-items:center; justify-content:space-between;">
            <div>
              <strong style="color:#4C1D95; font-size:0.95rem;">${candidateName}</strong>
              <div style="font-size:0.775rem; color:#6B7280;">Mock Interview Performance Score</div>
            </div>
            <span class="badge" style="background-color:${badgeColor}; font-size:0.9rem; padding:6px 12px; font-weight:700; border-radius:6px; color:#ffffff;">
              ${scoreVal}%
            </span>
          </div>

          <label style="font-weight:600; font-size:0.875rem; margin-bottom:4px; display:block;">Email Subject</label>
          <input id="swal-subject" class="swal2-input" style="width:100%; margin:0 0 14px 0; font-size:0.9rem;" value="${template.subject}" placeholder="Enter email subject..." />

          <label style="font-weight:600; font-size:0.875rem; margin-bottom:4px; display:block;">Email Message</label>
          <textarea id="swal-message" class="swal2-textarea" style="width:100%; margin:0 0 10px 0; font-size:0.9rem; min-height:100px;" placeholder="Enter email message content...">${template.message}</textarea>
          
          <div style="font-size:0.775rem; color:#6B7280; font-style:italic; margin-top:6px;">
            💡 Note: Template content is auto-filled based on candidate's score bracket (${scoreVal}%). You can customize subject or message above.
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: '#6D28D9',
      cancelButtonColor: '#6B7280',
      confirmButtonText: `Send Performance Email`,
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const subject = document.getElementById('swal-subject').value.trim();
        const message = document.getElementById('swal-message').value.trim();
        if (!subject || !message) {
          Swal.showValidationMessage('Please provide both subject and message.');
          return false;
        }
        return { subject, message };
      }
    });

    if (!value) return;
    formValues = value;
  } else {
    // Bulk distribution summary
    const scoreCounts = { zero: 0, low: 0, mid: 0, high: 0 };
    selectedList.forEach(inv => {
      const s = Number(inv.score ?? inv.percentage ?? 0);
      if (s === 0) scoreCounts.zero++;
      else if (s < 50) scoreCounts.low++;
      else if (s < 90) scoreCounts.mid++;
      else scoreCounts.high++;
    });

    const { value } = await Swal.fire({
      title: `<span style="color:#4C1D95; font-weight:700;">Send Score-Based Email Messages</span>`,
      html: `
        <p class="text-muted small mb-3">Sending score-personalized performance emails to <strong>${idsToSend.length}</strong> selected candidate(s).</p>
        <div style="text-align:left;">
          <div style="background:#F9FAFB; padding:12px; border-radius:8px; border:1px solid #E5E7EB; margin-bottom:14px;">
            <div style="font-weight:600; font-size:0.85rem; margin-bottom:8px; color:#374151;">Score Distribution Breakdown:</div>
            <div style="display:flex; flex-wrap:wrap; gap:6px;">
              <span class="badge bg-danger" style="padding:6px 10px; font-size:0.8rem;">🔴 0%: ${scoreCounts.zero}</span>
              <span class="badge bg-warning text-dark" style="padding:6px 10px; font-size:0.8rem;">🟠 1-49%: ${scoreCounts.low}</span>
              <span class="badge bg-primary" style="padding:6px 10px; font-size:0.8rem;">🟢 50-89%: ${scoreCounts.mid}</span>
              <span class="badge bg-success" style="padding:6px 10px; font-size:0.8rem;">🏆 90%+: ${scoreCounts.high}</span>
            </div>
          </div>
          <p style="font-size:0.825rem; color:#4B5563; line-height:1.5; margin:0;">
            ✨ Each candidate will automatically receive a customized email notification tailored specifically to their individual mock interview score.
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: '#6D28D9',
      cancelButtonColor: '#6B7280',
      confirmButtonText: `Send Personalized Emails (${idsToSend.length})`,
      cancelButtonText: 'Cancel'
    });

    if (!value) return;
  }

  try {
    setSendingNotification(true);
    const payload = { interviewIds: idsToSend };
    if (formValues) {
      payload.subject = formValues.subject;
      payload.message = formValues.message;
    }

    const res = await API.post('/notifications/send-score-notification', payload);

    if (res.data?.success) {
      Swal.fire({
        title: 'Emails Sent!',
        text: res.data.message || `Performance message sent successfully to ${res.data.successCount} student(s).`,
        icon: 'success',
        confirmButtonColor: '#6D28D9'
      });
      setSelectedInterviewIds([]);
    } else {
      toast.error(res.data?.message || 'Failed to send performance notification.');
    }
  } catch (error) {
    console.error('Score notification error:', error);
    toast.error(error.response?.data?.message || 'Failed to send performance notification email.');
  } finally {
    setSendingNotification(false);
  }
};

  const allFilteredIds = filteredInterviews
    .map((inv) => String(inv._id))
    .filter(Boolean);

  const currentSelectedStr = (selectedInterviewIds || []).map(String);
  const selectedInFilteredCount = allFilteredIds.filter((id) => currentSelectedStr.includes(id)).length;
  const isAllSelected = allFilteredIds.length > 0 && selectedInFilteredCount === allFilteredIds.length;

  const columns = [
    //checkbox
   {
  title: `
    <div style="text-align:center;">
      <input
        type="checkbox"
        id="select-all-students"
        class="select-all-students-checkbox select-all-interviews"
        ${isAllSelected ? 'checked' : ''}
      />
    </div>
  `,
  data: '_id',
  orderable: false,
  searchable: false,

  render: (data, _type, row) => {
    const rowId = String(row._id || data);
    const checked = currentSelectedStr.includes(rowId)
      ? 'checked'
      : '';

    return `
      <div style="text-align:center;">
        <input
          type="checkbox"
          class="student-notification-checkbox select-interview-checkbox"
          data-id="${rowId}"
          ${checked}
        />
      </div>
    `;
  }
},
 //serial number
 {
  title: 'S.No.',
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
//candiName     
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
    //Job Role
    {
      title: 'Job Role / Title',
      data: 'jobRole',
      render: (data, _type, row) => data || row.title || 'Scenario Evaluation'
    },
    // Category
    // {
    //   title: 'Category',
    //   data: 'category',
    //   render: (data) => `<span class="badge bg-secondary">${data || 'Technical'}</span>`
    // },
    // Mode
    {
      title: 'Mode',
      data: 'mode',
      render: (data) => `<span class="badge bg-info">${data || 'Text'}</span>`
    },
    //Status
    {
      title: 'Status',
      data: 'status',
      render: (data) => {
        const badgeClass = data === 'Completed' ? 'bg-success' : 'bg-warning';
        return `<span class="badge ${badgeClass}">${data || 'Pending'}</span>`;
      }
    },
    //Ai Score
    {
      title: 'AI Score',
      data: 'score',
      render: (data, _type, row) => {
        const val = data ?? row.percentage ?? 0;
        return `<strong class="text-success">${val}%</strong>`;
      }
    },
    //Date
    {
      title: 'Date',
      data: 'createdAt',
      render: (data) => `<span class="text-nowrap font-monospace small">${formatDateTime(data)}</span>`
    },
    // Performance
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
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <FaBrain className="text-white" size={22} />
            <h5 className="fw-bold mb-0 text-white">Mock Interviews ({interviews.length})</h5>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-light fw-bold d-flex align-items-center gap-2 px-3 py-1.5 rounded-pill shadow-sm"
              style={{ color: '#4C1D95', opacity: selectedInterviewIds.length === 0 ? 0.7 : 1 }}
              disabled={selectedInterviewIds.length === 0 || sendingNotification}
              onClick={() => handleSendScoreNotification()}
            >
              {sendingNotification ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Sending...
                </>
              ) : (
                <>
                  <FaPaperPlane size={14} style={{ color: '#4C1D95' }} />
                  Send Message {selectedInterviewIds.length > 0 && `(${selectedInterviewIds.length})`}
                </>
              )}
            </button>

            <span className="badge rounded-pill px-3 py-1" style={{ background: '#8B5CF6', color: '#FFFFFF' }}>
              Gemini AI Evaluations
            </span>
          </div>
        </div>
      </div>

      {/* ================= MOCK INTERVIEW FILTER BAR ================= */}
<div className="card border-0 shadow-sm mb-3 rounded-3">
  <div className="card-body py-3">

    <div className="row g-2 align-items-end">

      {/* Filter by Status */}
      <div className="col-12 col-md-2">
        <label className="form-label fw-semibold mb-1" style={{ fontSize: '0.8rem' }}>
          Filter Status
        </label>
        <select
          className="form-select form-select-sm"
          value={selectedStatus}
          onChange={(e) => {
            const val = e.target.value;
            setSelectedStatus(val);
            if (val) {
              setSearchParams({ status: val });
            } else {
              setSearchParams({});
            }
          }}
        >
          <option value="">All Statuses</option>
          <option value="Completed">Completed Only</option>
          <option value="Pending">Pending Only</option>
        </select>
      </div>

      {/* Search by Month */}
      <div className="col-12 col-md-2">
        <label className="form-label fw-semibold mb-1" style={{ fontSize: '0.8rem' }}>
          Search by Month
        </label>
        <input
          type="month"
          className="form-control form-control-sm"
          value={selectedMonth}
          onChange={(e) => {
            setSelectedMonth(e.target.value);
            setStartDate('');
            setEndDate('');
          }}
        />
      </div>

      {/* From Date */}
      <div className="col-12 col-md-2">
        <label className="form-label fw-semibold mb-1" style={{ fontSize: '0.8rem' }}>
          From Date
        </label>
        <input
          type="date"
          className="form-control form-control-sm"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
            setSelectedMonth('');
            if (endDate && e.target.value > endDate) {
              setEndDate('');
            }
          }}
        />
      </div>

      {/* To Date */}
      <div className="col-12 col-md-2">
        <label className="form-label fw-semibold mb-1" style={{ fontSize: '0.8rem' }}>
          To Date
        </label>
        <input
          type="date"
          className="form-control form-control-sm"
          value={endDate}
          min={startDate}
          onChange={(e) => {
            setEndDate(e.target.value);
            setSelectedMonth('');
          }}
        />
      </div>

      {/* Clear Filters */}
      <div className="col-12 col-md-2">
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary w-100"
          onClick={() => {
            setSelectedMonth('');
            setStartDate('');
            setEndDate('');
            setSelectedStatus('');
            setSearchParams({});
          }}
        >
          Clear Filters
        </button>
      </div>

      {/* Interview Records Count */}
      <div className="col-12 col-md-2 text-md-end">
        <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
          Records Found
        </div>
        <div className="fw-bold fs-6 text-primary">
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
        selectedStudentIds={selectedInterviewIds}
        onStudentSelect={handleSelectInterview}
        onSelectAllStudents={handleSelectAllInterviews}
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
