import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import DataTable from './components/DataTable';
import toast from 'react-hot-toast';

import {
  FaTimes,
  FaPaperPlane,
  FaUser,
  FaInfoCircle
} from 'react-icons/fa';

const InquiryDetails = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // FILTER STATES
  // =========================

  const [selectedMonth, setSelectedMonth] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // =========================
  // REPLY MODAL STATES
  // =========================

  const [replyModal, setReplyModal] = useState({
    open: false,
    inquiry: null
  });

  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // =========================
  // FETCH INQUIRIES
  // =========================

  const fetchInquiries = async () => {
    try {
      setLoading(true);

      const response = await API.get('/support/messages');

      console.log(
        'Inquiry API Response:',
        response.data
      );

      const records = response.data.data || [];

      const formattedData = records.map(
        (item, index) => ({
          ...item,
          serialNumber: index + 1
        })
      );

      setInquiries(formattedData);

    } catch (error) {
      console.error(
        'Fetch inquiries error:',
        error
      );

      toast.error(
        error.response?.data?.message ||
        'Failed to fetch inquiry details'
      );

      setInquiries([]);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  // =========================
  // FILTER DATA
  // =========================

  const filteredInquiries = inquiries.filter(
    (inquiry) => {

      if (!inquiry.createdAt) {
        return false;
      }

      const inquiryDate =
        new Date(inquiry.createdAt);

      // SEARCH BY MONTH
      if (selectedMonth) {

        const [year, month] =
          selectedMonth.split('-');

        const inquiryYear =
          inquiryDate.getFullYear();

        const inquiryMonth =
          String(
            inquiryDate.getMonth() + 1
          ).padStart(2, '0');

        if (
          inquiryYear !== Number(year) ||
          inquiryMonth !== month
        ) {
          return false;
        }
      }

      // FROM DATE
      if (fromDate) {

        const startDate =
          new Date(fromDate);

        startDate.setHours(
          0,
          0,
          0,
          0
        );

        if (inquiryDate < startDate) {
          return false;
        }
      }

      // TO DATE
      if (toDate) {

        const endDate =
          new Date(toDate);

        endDate.setHours(
          23,
          59,
          59,
          999
        );

        if (inquiryDate > endDate) {
          return false;
        }
      }

      return true;
    }
  );

  // =========================
  // CLEAR FILTERS
  // =========================

  const handleClearFilters = () => {

    setSelectedMonth('');
    setFromDate('');
    setToDate('');

  };

  // =========================
  // OPEN REPLY MODAL
  // =========================

  const openReplyModal = (inquiry) => {

    setReplyModal({
      open: true,
      inquiry
    });

setReplyMessage(
`Hello ${inquiry.studentName},

  Thank you for contacting the HireSmart AI Support Team.

  We have reviewed your inquiry regarding your ${inquiry.subject || 'support request'} and have addressed the issue.

  Please try again and let us know if you experience any further problems.

  You can access HireSmart AI here:
  http://localhost:5173/

  If you need any additional assistance, simply reply to this email. We're happy to help.

  Best regards,
  HireSmart AI Support Team
  HireSmart AI`
); 
  };

  // =========================
  // CLOSE REPLY MODAL
  // =========================

  const closeReplyModal = () => {

    if (sendingReply) {
      return;
    }

    setReplyModal({
      open: false,
      inquiry: null
    });

    setReplyMessage('');
  };

  // =========================
  // DATA TABLE REPLY CLICK
  // =========================

  useEffect(() => {

    const handleReplyClick = (event) => {

      const button =
        event.target.closest(
          '.inquiry-reply-btn'
        );

      if (!button) {
        return;
      }

      const inquiryId =
        button.dataset.id;

      const selectedInquiry =
        inquiries.find(
          (item) =>
            String(item._id) ===
            String(inquiryId)
        );

      if (!selectedInquiry) {
        return;
      }

      openReplyModal(selectedInquiry);
    };

    document.addEventListener(
      'click',
      handleReplyClick
    );

    return () => {

      document.removeEventListener(
        'click',
        handleReplyClick
      );

    };

  }, [inquiries]);

  // =========================
  // SEND REPLY
  // =========================

  const sendReply = async () => {
  if (!replyMessage.trim()) {
    toast.error('Please enter your reply');
    return;
  }

  const inquiry = replyModal.inquiry;

  if (!inquiry) {
    return;
  }

  try {
    setSendingReply(true);

    const response = await API.post(
      '/support/messages/reply',
      {
        inquiryId: inquiry._id,
        email: inquiry.studentEmail,
        name: inquiry.studentName,
        subject: inquiry.subject,
        reply: replyMessage.trim()
      }
    );

    console.log(
      'Reply response:',
      response.data
    );

    // =========================
    // UPDATE TABLE STATUS
    // =========================

    setInquiries((previousInquiries) =>
      previousInquiries.map((item) =>
        String(item._id) ===
        String(inquiry._id)
          ? {
              ...item,
              status: 'Resolved'
            }
          : item
      )
    );

    toast.success(
      `Reply sent to ${inquiry.studentEmail}`
    );

    closeReplyModal();

  } catch (error) {

    console.error(
      'Send reply error:',
      error
    );

    toast.error(
      error.response?.data?.message ||
      'Failed to send reply'
    );

  } finally {
    setSendingReply(false);
  }
};

  // =========================
  // TABLE COLUMNS
  // =========================

  const columns = [

    {
      title: 'S.No.',
      data: 'serialNumber',
      orderable: false,
      searchable: false,
      className: 'text-center',
      width: '60px',
      render: (data) =>
        `${data}.`
    },

    {
      title: 'Student Name',
      data: 'studentName',
      defaultContent: '-'
    },

    {
      title: 'Email',
      data: 'studentEmail',
      defaultContent: '-'
    },

    {
      title: 'Subject',
      data: 'subject',
      defaultContent: '-'
    },

 {
  title: 'Message',
  data: 'message',
  defaultContent: '-',

  render: (data) => {
    if (!data) {
      return '-';
    }

    const message = String(data);

    const preview =
      message.length > 35
        ? `${message.substring(0, 35)}...`
        : message;

    return `
      <span
        title="${message
          .replace(/&/g, '&amp;')
          .replace(/"/g, '&quot;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
        }"
        style="
          display: inline-block;
          max-width: 250px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #B8860B;
          font-weight: 600;
          font-size: 13px;
          cursor: help;
        "
      >
        ${preview}
      </span>
    `;
  }
},

    {
      title: 'Date',
      data: 'createdAt',
      defaultContent: '-',

      render: (data) => {

        if (!data) {
          return '-';
        }

        return new Date(
          data
        ).toLocaleDateString('en-IN');

      }
    },

{
  title: 'Status',
  data: 'status',
  defaultContent: 'Pending',

  render: (data) => {
    const status = data || 'Pending';

    const isResolved =
      status.toLowerCase() === 'resolved';

    return `
      <span
        class="badge"
        style="
          font-size: 0.7rem;
          padding: 5px 8px;
          background-color: ${isResolved ? '#DCFCE7' : '#FEF3C7'};
          color: ${isResolved ? '#15803D' : '#92400E'};
          border: 1px solid ${isResolved ? '#86EFAC' : '#FCD34D'};
          font-weight: 600;
        "
      >
        ${status}
      </span>
    `;
  }
},

    // =========================
    // REPLY BUTTON
    // =========================

    {
      title: 'Action',
      data: null,
      orderable: false,
      searchable: false,

      render: (
        _data,
        _type,
        row
      ) => {

        return `
          <button
            type="button"
            class="inquiry-reply-btn"
            data-id="${row._id}"
            style="
              border: none;
              background: #2563EB;
              color: #fff;
              padding: 6px 14px;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 600;
              cursor: pointer;
            "
          >
            Reply
          </button>
        `;
      }
    }

  ];

  return (
    <div className="p-3">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div
        className="card border-0 shadow-sm p-3 text-white"
        style={{
          background: '#4C1D95'
        }}
      >

        <div className="d-flex justify-content-between align-items-center">

          <h5 className="fw-bold mb-0">
            📋 Inquiry Details (
            {filteredInquiries.length}
            )
          </h5>

          <span
            className="badge rounded-pill px-3 py-2"
            style={{
              background: '#8B5CF6',
              color: '#FFFFFF'
            }}
          >
            Support Inquiries
          </span>

        </div>

      </div>


      {/* =========================
          FILTER SECTION
      ========================= */}

      <div className="card border-0 shadow-sm mt-3 mb-3">

        <div className="card-body">

          <div className="row g-3 align-items-end">

            {/* SEARCH BY MONTH */}

            <div className="col-md-3">

              <label className="form-label fw-semibold">
                Search by Month
              </label>

              <input
                type="month"
                className="form-control"
                value={selectedMonth}
                onChange={(e) => {

                  setSelectedMonth(
                    e.target.value
                  );

                  setFromDate('');
                  setToDate('');

                }}
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
                value={fromDate}
                onChange={(e) => {

                  setFromDate(
                    e.target.value
                  );

                  setSelectedMonth('');

                }}
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
                value={toDate}
                min={
                  fromDate || undefined
                }
                onChange={(e) => {

                  setToDate(
                    e.target.value
                  );

                  setSelectedMonth('');

                }}
              />

            </div>


            {/* CLEAR FILTERS */}

            <div className="col-md-2">

              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={
                  handleClearFilters
                }
              >
                Clear Filters
              </button>

            </div>


            {/* RECORDS */}

            <div className="col-md-1">

              <div
                className="text-muted"
                style={{
                  fontSize: '0.85rem'
                }}
              >
                Records
              </div>

              <div
                className="fw-bold"
                style={{
                  color: '#0d6efd',
                  fontSize: '1.2rem'
                }}
              >
                {
                  filteredInquiries.length
                }
              </div>

            </div>

          </div>

        </div>

      </div>


      {/* =========================
          DATA TABLE
      ========================= */}

      <div className="card border-0 shadow-sm">

        <DataTable
          columns={columns}
          data={filteredInquiries}
          loading={loading}
          title="Inquiry Details"
        />

      </div>


      {/* ==================================================
          REPLY MODAL
      ================================================== */}

      {replyModal.open &&
        replyModal.inquiry && (

          <div
            style={{
              position: 'fixed',
              inset: 0,
              background:
                'rgba(0, 0, 0, 0.55)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '20px'
            }}
          >

            <div
              style={{
                width: '100%',
                maxWidth: '570px',
                background: '#fff',
                borderRadius: '12px',
                boxShadow:
                  '0 15px 50px rgba(0,0,0,0.3)',
                overflow: 'hidden'
              }}
            >

              {/* =========================
                  MODAL HEADER
              ========================= */}

              <div
                style={{
                  background: '#4C1D95',
                  color: '#fff',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >

                <h5
                  className="mb-0 fw-bold"
                  style={{
                    fontSize: '18px'
                  }}
                >
                  Reply to Student
                </h5>

                <button
                  type="button"
                  onClick={
                    closeReplyModal
                  }
                  disabled={
                    sendingReply
                  }
                  style={{
                    border: 'none',
                    background:
                      'transparent',
                    color: '#fff',
                    fontSize: '18px',
                    cursor: 'pointer'
                  }}
                >
                  <FaTimes />
                </button>

              </div>


              {/* =========================
                  MODAL BODY
              ========================= */}

              <div
                style={{
                  padding: '18px'
                }}
              >

                {/* STUDENT INFO */}

                <div
                  style={{
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '14px'
                  }}
                >

                  {/* USER ICON */}

                  <div
                    style={{
                      width: '45px',
                      height: '45px',
                      minWidth: '45px',
                      borderRadius: '50%',
                      background: '#e9ecef',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <FaUser
                      style={{
                        color: '#495057',
                        fontSize: '20px'
                      }}
                    />
                  </div>


                  {/* NAME + EMAIL */}

                  <div
                    style={{
                      flex: 1,
                      minWidth: 0
                    }}
                  >

                    <div
                      className="fw-bold"
                      style={{
                        fontSize: '15px'
                      }}
                    >
                      {
                        replyModal
                          .inquiry
                          .studentName
                      }
                    </div>

                    <div
                      style={{
                        fontSize: '12px',
                        color: '#6c757d',
                        wordBreak:
                          'break-word'
                      }}
                    >
                      {
                        replyModal
                          .inquiry
                          .studentEmail
                      }
                    </div>

                  </div>


                  {/* SUBJECT */}

                  <div
                    style={{
                      borderLeft:
                        '1px solid #ddd',
                      paddingLeft: '15px',
                      minWidth: '90px'
                    }}
                  >

                    <div
                      style={{
                        fontSize: '11px',
                        color: '#6c757d'
                      }}
                    >
                      Subject
                    </div>

                    <div
                      className="fw-semibold"
                      style={{
                        fontSize: '12px'
                      }}
                    >
                      {
                        replyModal
                          .inquiry
                          .subject
                      }
                    </div>

                  </div>


                  {/* RECEIVED DATE */}

                  <div
                    style={{
                      borderLeft:
                        '1px solid #ddd',
                      paddingLeft: '15px',
                      minWidth: '85px'
                    }}
                  >

                    <div
                      style={{
                        fontSize: '11px',
                        color: '#6c757d'
                      }}
                    >
                      Received On
                    </div>

                    <div
                      className="fw-semibold"
                      style={{
                        fontSize: '12px'
                      }}
                    >
                      {
                        new Date(
                          replyModal
                            .inquiry
                            .createdAt
                        ).toLocaleDateString(
                          'en-IN'
                        )
                      }
                    </div>

                  </div>

                </div>


                {/* ORIGINAL MESSAGE */}

                <label
                  className="fw-bold mb-2 d-block"
                  style={{
                    fontSize: '14px'
                  }}
                >
                  Message
                </label>

                <div
                  style={{
                    background: '#f1f3f5',
                    borderRadius: '7px',
                    padding: '12px',
                    marginBottom: '14px',
                    fontSize: '13px',
                    minHeight: '50px',
                    whiteSpace:
                      'pre-wrap',
                    wordBreak:
                      'break-word'
                  }}
                >
                  {
                    replyModal
                      .inquiry
                      .message || '-'
                  }
                </div>


                {/* REPLY TEXTAREA */}

                <label
                  className="fw-bold mb-2 d-block"
                  style={{
                    fontSize: '14px'
                  }}
                >
                  Your Reply

                  <span
                    style={{
                      color: '#dc3545'
                    }}
                  >
                    {' '}*
                  </span>
                </label>

                <textarea
                  value={
                    replyMessage
                  }
                  onChange={(e) =>
                    setReplyMessage(
                      e.target.value
                    )
                  }
                  rows={6}
                  placeholder="Write your reply..."
                  disabled={
                    sendingReply
                  }
                  style={{
                    width: '100%',
                    border:
                      '1px solid #ced4da',
                    borderRadius: '7px',
                    padding: '11px',
                    fontSize: '13px',
                    resize: 'vertical',
                    outline: 'none',
                    fontFamily:
                      'inherit'
                  }}
                />


                {/* EMAIL NOTICE */}

                <div
                  style={{
                    marginTop: '12px',
                    padding: '10px 12px',
                    background: '#ede9fe',
                    color: '#5b21b6',
                    borderRadius: '7px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >

                  <FaInfoCircle />

                  <span>
                    This reply will be
                    sent to the student's
                    registered email
                    address.
                  </span>

                </div>

              </div>


              {/* =========================
                  MODAL FOOTER
              ========================= */}

              <div
                style={{
                  padding:
                    '0 18px 18px',
                  display: 'flex',
                  justifyContent:
                    'flex-end',
                  gap: '10px'
                }}
              >

                {/* CANCEL */}

                <button
                  type="button"
                  onClick={
                    closeReplyModal
                  }
                  disabled={
                    sendingReply
                  }
                  style={{
                    border: 'none',
                    background: '#e9ecef',
                    color: '#343a40',
                    padding:
                      '10px 20px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>


                {/* SEND */}

                <button
                  type="button"
                  onClick={
                    sendReply
                  }
                  disabled={
                    sendingReply ||
                    !replyMessage.trim()
                  }
                  style={{
                    border: 'none',
                    background:
                      '#4C1D95',
                    color: '#fff',
                    padding:
                      '10px 20px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor:
                      sendingReply ||
                      !replyMessage.trim()
                        ? 'not-allowed'
                        : 'pointer',
                    opacity:
                      sendingReply ||
                      !replyMessage.trim()
                        ? 0.7
                        : 1,
                    display: 'flex',
                    alignItems:
                      'center',
                    gap: '7px'
                  }}
                >

                  <FaPaperPlane />

                  {sendingReply
                    ? 'Sending...'
                    : 'Send Reply'}

                </button>

              </div>

            </div>

          </div>
        )}

    </div>
  );
};

export default InquiryDetails;