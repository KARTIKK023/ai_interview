import React, { useState, useEffect } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import StudentLayout from '../../components/StudentLayout';

import API from '../../services/api';

import DataTable from '../super-admin/components/DataTable';

import { FaTrash } from 'react-icons/fa';

import toast from 'react-hot-toast';

const StudentInterviews = () => {
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedInterviewToDelete, setSelectedInterviewToDelete] =
    useState(null);

  const [deleting, setDeleting] = useState(false);

  // ============================================================
  // FILTER STATE
  // ============================================================

  const [selectedMonth, setSelectedMonth] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // ============================================================
  // FETCH INTERVIEWS
  // ============================================================

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);

      const res = await API.get('/interviews');

      setInterviews(res.data?.interviews || []);
    } catch (err) {
      console.error('Failed to fetch interviews:', err);

      toast.error(
        err.response?.data?.message ||
          'Failed to load interviews.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // SOURCE LOGIC
  // ============================================================

  const getInterviewSource = (interview) => {
    /*
      5 minute interview has priority.

      Example:
      duration = 5
      total_questions = 20
      Source = 5 min

      NOT L3
    */

    if (Number(interview?.duration) === 5) {
      return '5 min';
    }

    const levelMap = {
      10: 'L1',
      15: 'L2',
      20: 'L3',
      25: 'L4',
      30: 'L5',
      35: 'L6',
      40: 'L7',
      45: 'L8',
      50: 'L9',
      55: 'L10',
    };

    return (
      levelMap[Number(interview?.total_questions)] ||
      'N/A'
    );
  };

  // ============================================================
  // QUESTION COUNTS
  // ============================================================

  const getAttemptedQuestions = (interview) => {
    return Math.max(
      Number(interview?.answered_questions || 0),
      0
    );
  };

  const getUnattendedQuestions = (interview) => {
    const totalQuestions = Number(
      interview?.total_questions ||
        interview?.questions?.length ||
        0
    );

    const attemptedQuestions =
      getAttemptedQuestions(interview);

    return Math.max(
      totalQuestions - attemptedQuestions,
      0
    );
  };

  // ============================================================
  // FILTER LOGIC
  // ============================================================

  const filteredInterviews = interviews.filter((interview) => {
    const rawDate =
      interview?.createdAt ||
      interview?.completedAt ||
      interview?.startedAt;

    if (!rawDate) {
      return false;
    }

    const interviewDate = new Date(rawDate);

    if (Number.isNaN(interviewDate.getTime())) {
      return false;
    }

    // ----------------------------------------------------------
    // MONTH FILTER
    // ----------------------------------------------------------

    if (selectedMonth) {
      const interviewMonth = `${interviewDate.getFullYear()}-${String(
        interviewDate.getMonth() + 1
      ).padStart(2, '0')}`;

      if (interviewMonth !== selectedMonth) {
        return false;
      }
    }

    // ----------------------------------------------------------
    // START DATE FILTER
    // ----------------------------------------------------------

    if (startDate) {
      const start = new Date(`${startDate}T00:00:00`);

      if (interviewDate < start) {
        return false;
      }
    }

    // ----------------------------------------------------------
    // END DATE FILTER
    // ----------------------------------------------------------

    if (endDate) {
      const end = new Date(`${endDate}T23:59:59.999`);

      if (interviewDate > end) {
        return false;
      }
    }

    return true;
  });

  // ============================================================
  // FILTER HANDLERS
  // ============================================================

  const handleMonthChange = (e) => {
    const value = e.target.value;

    setSelectedMonth(value);

    // Month and date range are mutually exclusive
    setStartDate('');
    setEndDate('');
  };

  const handleStartDateChange = (e) => {
    const value = e.target.value;

    setStartDate(value);

    // Date range and month are mutually exclusive
    setSelectedMonth('');

    // If new From Date is after current To Date,
    // clear the To Date.
    if (endDate && value > endDate) {
      setEndDate('');
    }
  };

  const handleEndDateChange = (e) => {
    const value = e.target.value;

    setEndDate(value);

    // Date range and month are mutually exclusive
    setSelectedMonth('');
  };

  const clearFilters = () => {
    setSelectedMonth('');
    setStartDate('');
    setEndDate('');
  };

  // ============================================================
  // DELETE
  // ============================================================

  const confirmDeleteInterview = async () => {
    if (!selectedInterviewToDelete) {
      return;
    }

    try {
      setDeleting(true);

      await API.delete(
        `/interviews/${selectedInterviewToDelete}`
      );

      setInterviews((previousInterviews) =>
        previousInterviews.filter(
          (item) =>
            item._id !== selectedInterviewToDelete
        )
      );

      toast.success(
        'Interview session deleted successfully'
      );

      setSelectedInterviewToDelete(null);
    } catch (err) {
      console.error(
        'Failed to delete interview:',
        err
      );

      toast.error(
        err.response?.data?.message ||
          'Failed to delete interview. Please try again.'
      );
    } finally {
      setDeleting(false);
    }
  };

  // ============================================================
  // HANDLE TABLE CLICK
  // ============================================================

  const handleTableClick = (event) => {
    // ----------------------------------------------------------
    // QUESTION COUNT CLICK
    // ----------------------------------------------------------

    const questionLink = event.target.closest(
      '.question-count-link'
    );

    if (questionLink) {
      event.preventDefault();

      const interviewId =
        questionLink.getAttribute('data-id');

      const questionType =
        questionLink.getAttribute('data-type');

      if (interviewId && questionType) {
        navigate(
          `/student/interviews/${interviewId}/questions?type=${questionType}`
        );
      }

      return;
    }

    // ----------------------------------------------------------
    // DELETE CLICK
    // ----------------------------------------------------------

    const deleteButton = event.target.closest(
      '.delete-interview-btn'
    );

    if (!deleteButton) {
      return;
    }

    const interviewId =
      deleteButton.getAttribute('data-id');

    if (interviewId) {
      setSelectedInterviewToDelete(interviewId);
    }
  };

  // ============================================================
  // TABLE COLUMNS
  // ============================================================

  const columns = [
    // ----------------------------------------------------------
    // STUDENT
    // ----------------------------------------------------------

    {
      title: 'Student',
      data: 'candidateId',

      render: (candidateId, type, row) => {
        const studentName =
          candidateId?.fullName ||
          candidateId?.name ||
          'Student';

        const studentId =
          candidateId?.studentId ||
          candidateId?.student_id ||
          row?.student_id ||
          '';

        return `
          <div>
            <div class="fw-bold text-dark">
              ${studentName}
            </div>

            ${
              studentId
                ? `
                  <small class="text-muted extra-small font-monospace">
                    ${studentId}
                  </small>
                `
                : ''
            }
          </div>
        `;
      },
    },

    // ----------------------------------------------------------
    // JOB ROLE
    // ----------------------------------------------------------

    {
      title: 'Job Role',
      data: 'jobRole',

      render: (data) => `
        <span class="fw-bold text-dark">
          ${data || 'N/A'}
        </span>
      `,
    },

    // ----------------------------------------------------------
    // PURPOSE
    // ----------------------------------------------------------

    {
      title: 'Purpose',
      data: 'purpose',

      render: (data) => {
        const isRecruitment =
          data === 'Recruitment';

        return `
          <span
            class="badge ${
              isRecruitment
                ? 'bg-danger bg-opacity-10 text-danger border border-danger-subtle'
                : 'bg-secondary bg-opacity-10 text-secondary border border-secondary-subtle'
            }"
          >
            ${data || 'Practice'}
          </span>
        `;
      },
    },

    // ----------------------------------------------------------
    // MODE
    // ----------------------------------------------------------

    {
      title: 'Mode',
      data: 'mode',

      render: (data) => {
        const isVideo = data === 'Video';

        return `
          <span
            class="badge px-2.5 py-1"
            style="
              background-color: ${
                isVideo
                  ? '#fff1f2'
                  : '#ecfeff'
              };
              color: ${
                isVideo
                  ? '#e11d48'
                  : '#0891b2'
              };
              border: 1px solid ${
                isVideo
                  ? '#fecdd3'
                  : '#a5f3fc'
              };
            "
          >
            ${data || 'Text'}
          </span>
        `;
      },
    },

    // ----------------------------------------------------------
    // SOURCE
    // ----------------------------------------------------------

    {
      title: 'Source',
      data: 'total_questions',

      render: (data, type, row) => {
        const source =
          getInterviewSource(row);

        const isFiveMinute =
          source === '5 min';

        return `
          <span
            class="badge px-2.5 py-1"
            style="
              background-color: ${
                isFiveMinute
                  ? '#fff7ed'
                  : '#f5f3ff'
              };
              color: ${
                isFiveMinute
                  ? '#c2410c'
                  : '#6d28d9'
              };
              border: 1px solid ${
                isFiveMinute
                  ? '#fed7aa'
                  : '#ddd6fe'
              };
              font-weight: 700;
            "
          >
            ${source}
          </span>
        `;
      },
    },

    // ----------------------------------------------------------
    // ATTEMPTED QUESTIONS
    // ----------------------------------------------------------

    {
      title: 'Attempted Questions',
      data: 'answered_questions',

      render: (data, type, row) => {
        const attempted =
          getAttemptedQuestions(row);

        if (type === 'export') {
          return attempted;
        }

        return `
          <a
            href="/student/interviews/${row?._id}/questions?type=attempted"
            class="question-count-link fw-bold text-primary"
            data-id="${row?._id || ''}"
            data-type="attempted"
            style="
              text-decoration: none;
              cursor: pointer;
            "
            title="View attempted questions"
          >
            ${attempted}
          </a>
        `;
      },
    },

    // ----------------------------------------------------------
    // UNATTENDED QUESTIONS
    // ----------------------------------------------------------

    {
      title: 'Unattended Questions',
      data: 'total_questions',

      render: (data, type, row) => {
        const unattended =
          getUnattendedQuestions(row);

        if (type === 'export') {
          return unattended;
        }

        return `
          <a
            href="/student/interviews/${row?._id}/questions?type=unattended"
            class="question-count-link fw-bold text-danger"
            data-id="${row?._id || ''}"
            data-type="unattended"
            style="
              text-decoration: none;
              cursor: pointer;
            "
            title="View unattended questions"
          >
            ${unattended}
          </a>
        `;
      },
    },

    // ----------------------------------------------------------
    // SCORE
    // ----------------------------------------------------------

    {
      title: 'Score',
      data: 'percentage',

      render: (data, type, row) => {
        if (row?.status !== 'Completed') {
          return `
            <span class="text-muted">
              -
            </span>
          `;
        }

        const percentage =
          row?.percentage ??
          row?.score ??
          0;

        return `
          <span class="fw-bold text-success">
            ${percentage}%
          </span>
        `;
      },
    },

    // ----------------------------------------------------------
    // STATUS
    // ----------------------------------------------------------

    {
      title: 'Status',
      data: 'status',

      render: (data) => {
        let statusClass =
          'bg-primary bg-opacity-10 text-primary border border-primary-subtle';

        if (data === 'Completed') {
          statusClass =
            'bg-success bg-opacity-10 text-success border border-success-subtle';
        } else if (data === 'Stopped') {
          statusClass =
            'bg-warning bg-opacity-10 text-warning border border-warning-subtle';
        } else if (data === 'Expired') {
          statusClass =
            'bg-danger bg-opacity-10 text-danger border border-danger-subtle';
        } else if (data === 'Pending') {
          statusClass =
            'bg-info bg-opacity-10 text-info border border-info-subtle';
        }

        return `
          <span class="badge ${statusClass}">
            ${data || 'Pending'}
          </span>
        `;
      },
    },

    // ----------------------------------------------------------
    // DATE
    // ----------------------------------------------------------

    {
      title: 'Date',
      data: 'createdAt',

      render: (data) => {
        if (!data) {
          return 'N/A';
        }

        const date = new Date(data);

        if (Number.isNaN(date.getTime())) {
          return 'N/A';
        }

        return date.toLocaleDateString();
      },
    },

    // ----------------------------------------------------------
    // ACTIONS
    // ----------------------------------------------------------

    {
      title: 'Actions',
      data: '_id',
      orderable: false,
      searchable: false,

      render: (id, type, row) => {
        if (!id) {
          return '';
        }

        // ------------------------------------------------------
        // COMPLETED
        // ------------------------------------------------------

        if (row?.status === 'Completed') {
          return `
            <div class="d-flex align-items-center gap-2">

              <a
                href="/student/result/${id}"
                class="btn btn-sm fw-semibold view-report-btn"
                style="
                  background-color: #eff6ff;
                  color: #2563eb;
                  border: 1px solid #bfdbfe;
                  border-radius: 6px;
                  text-decoration: none;
                "
              >
                View Report
              </a>

              <button
                type="button"
                class="btn btn-outline-danger btn-sm delete-interview-btn"
                data-id="${id}"
                title="Delete Interview Session"
              >
                <i class="fa fa-trash"></i>
                Delete
              </button>

            </div>
          `;
        }

        // ------------------------------------------------------
        // INCOMPLETE
        // ------------------------------------------------------

        const interviewUrl =
          row?.mode === 'Video'
            ? `/student/interview-video/${id}`
            : `/student/interview-text/${id}`;

        return `
          <div class="d-flex align-items-center gap-2">

            <a
              href="${interviewUrl}"
              class="
                btn
                btn-sm
                fw-bold
                text-white
                view-resume-btn
              "
              style="
                background-color: #2563eb;
                border-color: #2563eb;
                border-radius: 6px;
                text-decoration: none;
              "
            >
              Continue
            </a>

            <button
              type="button"
              class="btn btn-outline-danger btn-sm delete-interview-btn"
              data-id="${id}"
              title="Delete Interview Session"
            >
              <i class="fa fa-trash"></i>
              Delete
            </button>

          </div>
        `;
      },
    },
  ];

  // ============================================================
  // DATATABLE OPTIONS
  // ============================================================

  const tableOptions = {
    paging: true,
    pageLength: 10,
    lengthMenu: [10, 25, 50, 100],
    searching: true,
    ordering: true,
    responsive: true,
    autoWidth: false,
    destroy: true,

    language: {
      search: '',
      searchPlaceholder: 'Search interviews...',
      lengthMenu: 'Show _MENU_',
      info:
        'Showing _START_ to _END_ of _TOTAL_ interviews',
      emptyTable:
        'No interviews found in your history.',
      zeroRecords:
        'No matching interviews found.',
    },

    columnDefs: [
      {
        targets: '_all',
        className: 'align-middle',
      },
    ],
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <StudentLayout>

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h3 className="fw-extrabold mb-1">
            My Interview History
          </h3>

          <p className="text-muted small mb-0">
            Track and manage all your AI practice sessions
            and HR recruitment interviews
          </p>
        </div>

        <div className="d-flex gap-2">

          <Link
            to="/student/interview-preparation/ai-mock"
            className="btn btn-primary-custom"
          >
            Start New Practice
          </Link>

          <Link
            to="/student/interview-preparation/quick-practice"
            className="btn btn-primary-custom"
          >
            Quick 5-Min Practice
          </Link>

        </div>
      </div>

      {/* ======================================================
          FILTER SECTION
      ====================================================== */}

      <div className="card card-custom shadow-sm border-0 mb-4">

        <div className="card-body p-4">

          <div className="row g-3 align-items-end">

            {/* MONTH */}

            <div className="col-md-3">

              <label className="form-label fw-semibold">
                Select Month
              </label>

              <input
                type="month"
                className="form-control"
                value={selectedMonth}
                onChange={handleMonthChange}
              />

            </div>

            {/* FROM DATE */}

            <div className="col-md-3">

              <label className="form-label fw-semibold">
                From Date
              </label>

              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={handleStartDateChange}
              />

            </div>

            {/* TO DATE */}

            <div className="col-md-3">

              <label className="form-label fw-semibold">
                To Date
              </label>

              <input
                type="date"
                className="form-control"
                value={endDate}
                min={startDate || undefined}
                onChange={handleEndDateChange}
              />

            </div>

            {/* CLEAR */}

            <div className="col-md-3">

              <button
                type="button"
                className="btn btn-outline-secondary w-100 fw-semibold"
                onClick={clearFilters}
              >
                Clear Filters
              </button>

            </div>

          </div>

          {/* RECORD COUNT */}

          <div className="mt-3">

            <span className="text-muted small">
              Records:{' '}
              <strong className="text-dark">
                {filteredInterviews.length}
              </strong>
            </span>

          </div>

        </div>
      </div>

      {/* ======================================================
          TABLE CARD
      ====================================================== */}

      <div className="card card-custom p-4 shadow-sm flex-grow-1">

        <div
          className="custom-datatable-wrapper table-responsive p-1"
          onClick={handleTableClick}
        >

          <DataTable
            title="Interview History"
            data={filteredInterviews}
            columns={columns}
            loading={loading}
            options={tableOptions}
            className="table table-hover align-middle mb-0 w-100"
          />

        </div>
      </div>

      {/* ======================================================
          DELETE CONFIRMATION MODAL
      ====================================================== */}

      {selectedInterviewToDelete && (

        <div
          className="
            modal
            show
            d-block
            bg-dark
            bg-opacity-50
          "
          tabIndex="-1"
          role="dialog"
          style={{ zIndex: 1050 }}
        >

          <div
            className="
              modal-dialog
              modal-dialog-centered
            "
            role="document"
            style={{ maxWidth: '440px' }}
          >

            <div
              className="
                modal-content
                border-0
                shadow-lg
              "
              style={{
                borderRadius: '16px',
              }}
            >

              <div className="modal-body p-4 text-center">

                {/* ICON */}

                <div
                  className="
                    d-inline-flex
                    align-items-center
                    justify-content-center
                    bg-danger
                    bg-opacity-10
                    text-danger
                    rounded-circle
                    p-3
                    mb-3
                  "
                  style={{
                    width: '64px',
                    height: '64px',
                  }}
                >
                  <FaTrash className="fs-3" />
                </div>

                {/* TITLE */}

                <h5 className="fw-extrabold text-dark mb-2">
                  Delete Interview History?
                </h5>

                {/* DESCRIPTION */}

                <p className="text-muted small mb-1">
                  Are you sure you want to delete this
                  interview session from your history?
                </p>

                <p className="text-danger extra-small fw-semibold mb-4">
                  This action cannot be undone.
                </p>

                {/* BUTTONS */}

                <div className="d-flex justify-content-center gap-3">

                  <button
                    type="button"
                    className="
                      btn
                      btn-outline-secondary
                      px-4
                      py-2
                      fw-bold
                      rounded-3
                    "
                    onClick={() =>
                      setSelectedInterviewToDelete(null)
                    }
                    disabled={deleting}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="
                      btn
                      btn-danger
                      px-4
                      py-2
                      fw-bold
                      rounded-3
                      d-flex
                      align-items-center
                      gap-2
                    "
                    onClick={confirmDeleteInterview}
                    disabled={deleting}
                  >

                    {deleting ? (
                      <>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <FaTrash />
                        Delete
                      </>
                    )}

                  </button>

                </div>

              </div>

            </div>
          </div>

        </div>
      )}

    </StudentLayout>
  );
};

export default StudentInterviews;