import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { FaUserGraduate } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import DataTable from './components/DataTable';
import SuperAdminStudentProfileView from './components/SuperAdminStudentProfileView';
import { FaWhatsapp } from 'react-icons/fa';

const SuperAdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const [selectedMonth, setSelectedMonth] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Login Session Modal & Live Ticker States
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [modalSessionData, setModalSessionData] = useState(null);
  const [sessionModalLoading, setSessionModalLoading] = useState(false);
  const [nowTimestamp, setNowTimestamp] = useState(Date.now());

  useEffect(() => {
    fetchStudents();

    // 1-second live duration ticker
    const timer = setInterval(() => {
      setNowTimestamp(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds) => {
    const totalSec = Math.max(0, Number(seconds) || 0);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;

    return `${h}h ${m}m ${s}s`;
  };

  const fetchStudents = async () => {
  try {
    setLoading(true);

    const res = await API.get('/admin/students');

    if (res.data && res.data.success) {
      const studentsWithSerialNumber = (res.data.students || []).map(
        (student, index) => ({
          ...student,
          serialNumber: index + 1
        })
      );

      setStudents(studentsWithSerialNumber);
    }
  } catch (err) {
    console.error('Failed to load students:', err);
    toast.error('Failed to fetch student records from database.');
  } finally {
    setLoading(false);
  }
};

  const handleStatusToggle = async (studentId, currentStatus) => {
  const isCurrentlyInactive = (currentStatus || '')
    .toLowerCase()
    .includes('inactive');

  const nextStatus = isCurrentlyInactive
    ? 'Active'
    : 'Services Inactive';

  const actionText = isCurrentlyInactive
    ? 'activate'
    : 'deactivate';

  const result = await Swal.fire({
    title: `Are you sure?`,
    text: `Do you want to ${actionText} service access for this student?`,
    icon: 'warning',

    showCancelButton: true,

    confirmButtonText: `Yes, ${actionText}`,
    cancelButtonText: 'Cancel',

    confirmButtonColor: isCurrentlyInactive
      ? '#16A34A'
      : '#DC2626',

    cancelButtonColor: '#6B7280',

    reverseButtons: true
  });

  if (!result.isConfirmed) {
    return;
  }

  try {
    toast.loading('Updating service access...', {
      id: 'status-update'
    });

    const res = await API.put(
      `/admin/students/${studentId}/service-status`,
      {
        serviceStatus: nextStatus
      }
    );

    if (res.data && res.data.success) {

      toast.success(
        `Service access set to ${nextStatus}`,
        {
          id: 'status-update'
        }
      );

      setStudents(prev =>
        prev.map(student =>
          student._id === studentId
            ? {
                ...student,
                serviceStatus: nextStatus
              }
            : student
        )
      );

      Swal.fire({
        icon: 'success',
        title: 'Updated Successfully',
        text: `Student service access is now ${nextStatus}`,
        timer: 1800,
        showConfirmButton: false
      });
    }

  } catch (err) {

    console.error(
      'Failed to update service status:',
      err
    );

    toast.error(
      'Failed to update service status.',
      {
        id: 'status-update'
      }
    );

    Swal.fire({
      icon: 'error',
      title: 'Update Failed',
      text: 'Unable to update student service access.'
    });
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

  const filteredStudents = students.filter((student) => {
  if (!student.createdAt) return false;

  const registrationDate = new Date(student.createdAt);

  if (isNaN(registrationDate.getTime())) return false;

  // =========================
  // MONTH FILTER
  // =========================
  if (selectedMonth) {
    const year = registrationDate.getFullYear();
    const month = String(
      registrationDate.getMonth() + 1
    ).padStart(2, '0');

    const studentMonth = `${year}-${month}`;

    if (studentMonth !== selectedMonth) {
      return false;
    }
  }

  // =========================
  // FROM DATE FILTER
  // =========================
  if (startDate) {
    const start = new Date(`${startDate}T00:00:00`);

    if (registrationDate < start) {
      return false;
    }
  }

  // =========================
  // TO DATE FILTER
  // =========================
  if (endDate) {
    const end = new Date(`${endDate}T23:59:59.999`);

    if (registrationDate > end) {
      return false;
    }
  }

  return true;
});

useEffect(() => {
  const handleWhatsAppClick = (event) => {
    const button = event.target.closest('.whatsapp-message-btn');

    if (!button) return;

    const phone = button.dataset.phone;
    const studentName = button.dataset.name;

    const cleanNumber = phone.replace(/\D/g, '');

    const whatsappNumber =
      cleanNumber.length === 10
        ? `91${cleanNumber}`
        : cleanNumber;

    const message = `Hello ${studentName}, 👋

This is a message from HireSmart AI.

We are happy to have you with us. You can access your AI-powered interview preparation and continue improving your interview skills.

Best regards,
HireSmart AI Team 🚀`;

    const whatsappUrl =
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
  };

  document.addEventListener('click', handleWhatsAppClick);

  return () => {
    document.removeEventListener('click', handleWhatsAppClick);
  };
}, []);

  const handleOpenLoginSessionModal = async (studentId) => {
    try {
      setSessionModalLoading(true);
      setSessionModalOpen(true);

      const res = await API.get(`/admin/students/${studentId}/login-history`);
      if (res.data && res.data.success) {
        setModalSessionData(res.data);
      } else {
        const localStudent = students.find((s) => String(s._id) === String(studentId) || s.studentId === studentId);
        if (localStudent) {
          const isOnline = Boolean(localStudent.isOnline);
          const loginAt = localStudent.lastLogin || localStudent.loginStartedAt;
          const logoutAt = isOnline ? null : localStudent.lastLogout;
          let duration = localStudent.loginDuration || 0;
          if (isOnline && loginAt) {
            duration = Math.max(0, Math.floor((Date.now() - new Date(loginAt).getTime()) / 1000));
          }
          setModalSessionData({
            student: {
              name: localStudent.fullName || localStudent.name || 'Student',
              studentId: localStudent.studentId || localStudent.student_id || (localStudent._id ? String(localStudent._id).substring(0, 8) : 'N/A')
            },
            history: loginAt ? [{ loginAt, logoutAt, duration, isOnline }] : []
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch login history session:', err);
      const localStudent = students.find((s) => String(s._id) === String(studentId) || s.studentId === studentId);
      if (localStudent) {
        const isOnline = Boolean(localStudent.isOnline);
        const loginAt = localStudent.lastLogin || localStudent.loginStartedAt;
        const logoutAt = isOnline ? null : localStudent.lastLogout;
        let duration = localStudent.loginDuration || 0;
        if (isOnline && loginAt) {
          duration = Math.max(0, Math.floor((Date.now() - new Date(loginAt).getTime()) / 1000));
        }
        setModalSessionData({
          student: {
            name: localStudent.fullName || localStudent.name || 'Student',
            studentId: localStudent.studentId || localStudent.student_id || (localStudent._id ? String(localStudent._id).substring(0, 8) : 'N/A')
          },
          history: loginAt ? [{ loginAt, logoutAt, duration, isOnline }] : []
        });
      } else {
        toast.error('Unable to fetch login session details.');
      }
    } finally {
      setSessionModalLoading(false);
    }
  };

  useEffect(() => {
    const handleLoginSessionClick = (event) => {
      const link = event.target.closest('.view-login-session-btn');
      if (!link) return;
      event.preventDefault();
      const studentId = link.dataset.id;
      if (studentId) {
        handleOpenLoginSessionModal(studentId);
      }
    };

    document.addEventListener('click', handleLoginSessionClick);
    return () => {
      document.removeEventListener('click', handleLoginSessionClick);
    };
  }, [students]);

  const columns = [
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
  {
    title: 'Student Name',
    data: 'fullName',
    render: (_data, _type, row) => {
      const name = row.fullName || row.name || 'Student';

      return `
        <a
          href="#"
          class="view-student-profile text-decoration-none fw-bold"
          style="color: #6D28D9;"
          data-id="${row._id}"
          title="Click to view full student profile"
        >
          ${name}
        </a>
      `;
    }
  },

  {
    title: 'Email Address',
    data: 'email'
  },

{
  title: 'Phone Number',
  data: null,
  orderable: false,

  render: (_data, _type, row) => {
    const phone =
      row.mobileNumber ||
      row.profile?.phone ||
      row.phone ||
      row.phoneNumber;

    if (!phone) {
      return `
        <span class="text-muted">
          No Number
        </span>
      `;
    }

    return `
      <div
        style="
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        "
      >
       <!-- WhatsApp Button -->
        <button
          type="button"
          class="whatsapp-message-btn"
          data-phone="${phone}"
          data-name="${row.fullName || row.name || 'Student'}"
          title="Send WhatsApp Message"
          style="
            border: none;
            background: transparent;
            padding: 0;
            margin: 0;
            cursor: pointer;
          "
        >
          <i
            class="fab fa-whatsapp"
            style="
              color: #25D366;
              font-size: 22px;
            "
          ></i>
        </button>

        <!-- Phone Number -->
        <span>
          ${phone}
        </span>

       
      </div>
    `;
  }
},



  {
    title: 'Role',
    data: 'role',
    render: (data) =>
      `<span class="badge bg-primary text-uppercase">${data || 'STUDENT'}</span>`
  },

  {
    title: 'Student ID',
    data: 'studentId',
    render: (data, _type, row) => {
      const studentId =
        data || (row._id ? row._id.substring(0, 8) : 'N/A');

      return `<span class="small fw-medium text-danger text-nowrap">${studentId}</span>`;
    }
  },

  {
    title: 'Registration Date',
    data: 'createdAt',
    render: (data) =>
      `<span class="text-nowrap font-monospace small">${formatDateTime(data)}</span>`
  },

{
  title: 'Last Login / Duration',
  data: 'lastLogin',
  width: '210px',
  className: 'text-center',

  render: (data, type, row) => {
    const lastLogin = row.lastLogin || row.loginStartedAt;
    const loginStartedAt = row.loginStartedAt || row.lastLogin;
    const lastLogout = row.lastLogout;
    const loginDuration = Number(row.loginDuration) || 0;

    if (!lastLogin) {
      return `
        <div style="width:100%; text-align:center; white-space:nowrap;">
          <span class="text-muted small">No Login Recorded</span>
        </div>
      `;
    }

    const date = new Date(lastLogin);
    if (isNaN(date.getTime())) {
      return `
        <div style="width:100%; text-align:center; white-space:nowrap;">
          <span class="text-muted small">No Login Recorded</span>
        </div>
      `;
    }

    if (type === 'sort' || type === 'type') {
      return date.getTime();
    }

    // Determine online status
    const isOnline = Boolean(row.isOnline);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const strHours = String(hours).padStart(2, '0');

    const formattedDateTime = `${day}/${month}/${year}, ${strHours}:${minutes} ${ampm}`;

    // Calculate session duration
    let totalSeconds = 0;
    if (isOnline) {
      const startMs = loginStartedAt ? new Date(loginStartedAt).getTime() : date.getTime();
      if (!isNaN(startMs)) {
        totalSeconds = Math.max(0, Math.floor((nowTimestamp - startMs) / 1000));
      }
    } else {
      totalSeconds = loginDuration;
      if (!totalSeconds && loginStartedAt && lastLogout) {
        const startMs = new Date(loginStartedAt).getTime();
        const endMs = new Date(lastLogout).getTime();
        if (endMs > startMs) {
          totalSeconds = Math.floor((endMs - startMs) / 1000);
        }
      }
    }

    const durationText = formatDuration(totalSeconds);

    return `
      <div style="width:100%; text-align:center; white-space:nowrap;">
        <a
          href="#"
          class="view-login-session-btn text-decoration-none fw-bold"
          style="color:#6D28D9; cursor:pointer;"
          data-id="${row._id}"
          title="Click to view latest login session details"
        >
          ${formattedDateTime}
        </a>
        <div class="small fw-semibold mt-1" style="color:${isOnline ? '#16a34a' : '#6b7280'}; line-height:1.4;">
          ${isOnline ? `● Active` : `● Offline <span style="color:#6b7280;">• Duration: ${durationText}</span>`}
        </div>
      </div>
    `;
  }
},  


 {
  title: 'Subscription Amount',
  data: 'subscriptionAmount',

  render: (data, _type, row) => {
    const amount = data ?? row.subscriptionAmount;

    // No amount
    if (
      amount === null ||
      amount === undefined ||
      amount === ''
    ) {
      return `
        <button
          type="button"
          class="btn btn-sm"
          style="
            font-size: 10px;
            font-weight: 600;
            border-radius: 5px;
            padding: 4px 10px;
            background-color: #FEF2F2;
            color: #DC2626;
            border: 1px solid #EF4444;
          "
        >
          No Amount
        </button>
      `;
    }

    // Amount exists
    return `
      <button
        type="button"
        class="btn btn-sm"
        style="
          font-size: 10px;
          font-weight: 600;
          border-radius: 5px;
          padding: 4px 10px;
          background-color: #FEF2F2;
          color: #DC2626;
          border: 1px solid #EF4444;
        "
      >
        ₹${Number(amount).toLocaleString('en-IN')}
      </button>
    `;
  }
},

  {
  title: 'Subscription',
  data: 'subscriptionStatus',
  render: (data, _type, row) => {
    // Default subscription status is UNPAID
    const subscriptionStatus = (
      data ||
      row.subscriptionStatus ||
      'UNPAID'
    ).toLowerCase();

    let badgeClass = '';

    if (subscriptionStatus === 'PAID') {
      badgeClass =
        'bg-success bg-opacity-10 text-success border border-success border-opacity-25';
    } 
    else if (subscriptionStatus === 'TRIAL') {
      badgeClass =
        'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25';
    } 
    else {
      // Default UNPAID
      badgeClass =
        'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25';
    }

    return `
      <span
        class="badge ${badgeClass} px-2 py-1 fw-bold"
        style="
          font-size: 0.70rem;
          min-width: 55px;
        "
      >
        ${subscriptionStatus}
      </span>
    `;
  }
},

  {
    title: 'Status',
    data: 'serviceStatus',
    render: (data, _type, row) => {
      const statusVal = data || row.serviceStatus || 'Active';
      const isInactive = statusVal.toLowerCase().includes('inactive');

      const displayText = isInactive
        ? 'Services Inactive'
        : 'Active';

      const badgeClass = isInactive
        ? 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-20'
        : 'bg-success bg-opacity-10 text-success border border-success border-opacity-20';

      return `
        <span
          class="badge ${badgeClass} toggle-status-btn cursor-pointer"
          data-id="${row._id}"
          data-status="${statusVal}"
          title="Click to toggle HireSmart AI service access"
        >
          ${displayText}
        </span>
      `;
    }
  }
];

  if (selectedStudentId) {
    return (
      <div className="p-3.5">
        <SuperAdminStudentProfileView
          studentId={selectedStudentId}
          onBack={() => setSelectedStudentId(null)}
          backTitle="Back to Students Records"
        />
      </div>
    );
  }

  return (
    <div className="p-3.5">
      <div className="card border-0 shadow-sm p-3 mb-3 rounded-3 text-white" style={{ background: '#4C1D95' }}>
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <FaUserGraduate className="text-white" size={22} />
            <h5 className="fw-bold mb-0 text-white">Students Records ({students.length})</h5>
          </div>
          <span className="badge rounded-pill px-3 py-1" style={{ background: '#8B5CF6', color: '#FFFFFF' }}>
            Live MongoDB Sync
          </span>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-3 rounded-3">
  <div className="card-body py-3">

    <div className="row g-3 align-items-end">

      {/* Month-wise Filter */}
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

            // Prevent invalid range
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


      {/* Clear Button */}
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


      {/* Records Count */}
      <div className="col-md-1">
        <div className="text-muted small">
          Records
        </div>

        <div className="fw-bold fs-5 text-primary">
          {filteredStudents.length}
        </div>
      </div>

    </div>

  </div>
</div>

      <DataTable
        title="Students Master Table"
        columns={columns}
        data={filteredStudents}
        loading={loading}
        onStudentClick={(id) => setSelectedStudentId(id)}
        onStatusToggle={handleStatusToggle}
      />

      {/* Login Activity — Last 24 Hours Modal */}
      {sessionModalOpen && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header text-white" style={{ background: '#4C1D95' }}>
                <div>
                  <h5 className="modal-title fw-bold mb-0">Login Activity — Last 24 Hours</h5>
                  <p className="mb-0 small text-white-50">Student session history for the last 24 hours</p>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setSessionModalOpen(false);
                    setModalSessionData(null);
                  }}
                  aria-label="Close"
                ></button>
              </div>

              <div className="modal-body p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {sessionModalLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-purple" role="status"></div>
                    <p className="mt-2 text-muted mb-0">Fetching 24-hour login history...</p>
                  </div>
                ) : modalSessionData ? (
                  <div className="d-flex flex-column gap-3">
                    <div className="p-3 bg-light rounded-3 border">
                      <div className="row g-2">
                        <div className="col-6">
                          <span className="text-muted small d-block">Student Name</span>
                          <span className="fw-bold text-dark fs-6">{modalSessionData.student?.name || modalSessionData.student?.fullName || modalSessionData.studentName || 'Student'}</span>
                        </div>
                        <div className="col-6">
                          <span className="text-muted small d-block">Student ID</span>
                          <span className="fw-bold text-danger font-monospace fs-6">{modalSessionData.student?.studentId || modalSessionData.studentId || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {(modalSessionData.history && modalSessionData.history.length > 0) ? (
                      modalSessionData.history.map((sess, idx) => {
                        const isActiveSession = Boolean(sess.isOnline) || (sess.logoutAt === null && idx === 0 && modalSessionData.student?.isOnline);
                        
                        let currentSec = sess.duration || 0;
                        if (isActiveSession && sess.loginAt) {
                          const startMs = new Date(sess.loginAt).getTime();
                          if (!isNaN(startMs)) {
                            currentSec = Math.max(0, Math.floor((nowTimestamp - startMs) / 1000));
                          }
                        }

                        return (
                          <div key={sess._id || idx} className="border rounded-3 p-3 bg-white shadow-sm">
                            <div className="row g-3 align-items-center">
                              <div className="col-md-6">
                                <span className="text-muted small d-block mb-1">Login Date & Time</span>
                                <span className="fw-semibold text-dark font-monospace small">
                                  {formatDateTime(sess.loginAt)}
                                </span>
                              </div>

                              <div className="col-md-6">
                                <span className="text-muted small d-block mb-1">Logout Date & Time</span>
                                {isActiveSession ? (
                                  <span className="badge bg-success bg-opacity-10 text-success fw-bold px-2.5 py-1">
                                    Currently Active
                                  </span>
                                ) : (
                                  <span className="fw-semibold text-dark font-monospace small">
                                    {formatDateTime(sess.logoutAt)}
                                  </span>
                                )}
                              </div>

                              <div className="col-md-6">
                                <span className="text-muted small d-block mb-1">Duration</span>
                                <span className="fw-bold text-primary fs-6">
                                  {formatDuration(currentSec)}
                                </span>
                              </div>

                              <div className="col-md-6">
                                <span className="text-muted small d-block mb-1">Status</span>
                                {isActiveSession ? (
                                  <span className="badge bg-success text-white fw-bold px-2.5 py-1">
                                    ● Active
                                  </span>
                                ) : (
                                  <span className="badge bg-secondary text-white fw-bold px-2.5 py-1">
                                    ● Offline
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-4 text-muted bg-light rounded-3 border">
                        No login activity recorded in the last 24 hours.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted">
                    No login history found.
                  </div>
                )}
              </div>

              <div className="modal-footer bg-light">
                <button
                  type="button"
                  className="btn btn-secondary px-4 fw-semibold"
                  onClick={() => {
                    setSessionModalOpen(false);
                    setModalSessionData(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminStudents;
