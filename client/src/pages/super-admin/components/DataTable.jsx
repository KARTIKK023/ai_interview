import React, { useEffect } from 'react';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import 'datatables.net-dt/css/dataTables.dataTables.css';
import { FaFileCsv, FaFileExcel, FaPrint } from 'react-icons/fa';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

// Register DataTables core module
DataTable.use(DT);

const ReusableDataTable = ({
  columns = [],
  data = [],
  loading = false,
  title = 'Data Records',
  selectedStudentIds = [],
  onStudentSelect = null,
  onSelectAllStudents = null,
  onRowSelect = null,
  onReportClick = null,
  onResumeClick = null,
  onStudentClick = null,
  onStatusToggle = null,
  onGenerateClick = null,
  options = {}
}) => {
  // Sync checkbox DOM elements whenever selectedStudentIds or data updates
  useEffect(() => {
    const currentSelectedStr = (selectedStudentIds || []).map(String);

    // Sync individual row checkboxes
    document.querySelectorAll('.student-notification-checkbox').forEach((checkbox) => {
      const id = checkbox.getAttribute('data-id');
      if (id) {
        checkbox.checked = currentSelectedStr.includes(String(id));
      }
    });

    // Sync Select All header checkbox
    const selectAllCb = document.querySelector('#select-all-students, .select-all-students-checkbox');
    if (selectAllCb) {
      const allCheckboxes = document.querySelectorAll('.student-notification-checkbox');
      if (allCheckboxes.length > 0) {
        const allChecked = Array.from(allCheckboxes).every((cb) => cb.checked);
        selectAllCb.checked = allChecked;
      } else {
        selectAllCb.checked = false;
      }
    }
  }, [selectedStudentIds, data]);

  // Export handlers
  const exportToCSV = () => {
    if (!data || data.length === 0) {
      toast.error('No data available to export');
      return;
    }
    const headers = columns.map(c => c.title || c.data).join(',');
    const rows = data.map(row =>
      columns.map(c => {
        let val;
        if (typeof c.render === 'function') {
          try {
            val = c.render(row[c.data], 'export', row);
          } catch (err) {
            val = row[c.data];
          }
        } else {
          val = row[c.data];
        }

        if (val === undefined || val === null) {
          val = '';
        }
        const clean = String(val)
          .replace(/<[^>]*>?/gm, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/"/g, '""')
          .trim();
        return `"${clean}"`;
      }).join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '_')}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${data.length} records to CSV`);
  };

const exportToExcel = () => {
  if (!data || data.length === 0) {
    toast.error('No data available to export');
    return;
  }

  // =========================================================
  // 1. FIND ONLY COLUMNS THAT SHOULD BE EXPORTED
  // =========================================================
  const exportColumns = columns.filter((column) => {
    const rawTitle = String(column.title || '');
    const plainTitle = rawTitle
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();

    // -------------------------------------------------------
    // REMOVE CHECKBOX / SELECT COLUMN
    // -------------------------------------------------------
    const hasCheckbox =
      rawTitle.includes('type="checkbox"') ||
      rawTitle.includes("type='checkbox'") ||
      rawTitle.includes('checkbox') ||
      rawTitle.includes('select-all') ||
      rawTitle.includes('select all') ||
      plainTitle === 'select';

    if (hasCheckbox) {
      return false;
    }

    // -------------------------------------------------------
    // REMOVE PERFORMANCE REPORT / VIEW COLUMN
    // -------------------------------------------------------
    if (
      plainTitle === 'performance report' ||
      plainTitle === 'performance report view' ||
      plainTitle === 'view' ||
      plainTitle.includes('performance report')
    ) {
      return false;
    }

    return true;
  });

  // =========================================================
  // 2. CONVERT HTML TO CLEAN TEXT
  // =========================================================
  const cleanText = (value) => {
    if (
      value === null ||
      value === undefined
    ) {
      return '';
    }

    const temp =
      document.createElement('div');

    temp.innerHTML = String(value);

    // Remove checkboxes and form controls
    temp
      .querySelectorAll(
        'input, select, textarea'
      )
      .forEach((element) => {
        element.remove();
      });

    // Keep only button text
    temp
      .querySelectorAll('button')
      .forEach((button) => {
        button.replaceWith(
          document.createTextNode(
            button.textContent || ''
          )
        );
      });

    // Keep only link text
    temp
      .querySelectorAll('a')
      .forEach((link) => {
        link.replaceWith(
          document.createTextNode(
            link.textContent || ''
          )
        );
      });

    return temp.textContent
      .replace(/\s+/g, ' ')
      .trim();
  };

  // =========================================================
  // 3. CREATE EXCEL ROW DATA
  // =========================================================
  const formattedData = data.map(
    (row, rowIndex) => {

      const rowObject = {};

      exportColumns.forEach(
        (column) => {

          const header =
            cleanText(
              column.title ||
              column.data
            );

          let value;

          // -------------------------------------------------
          // S.NO.
          // -------------------------------------------------
          if (
            column.data ===
            'serialNumber'
          ) {
            value =
              row.serialNumber ??
              rowIndex + 1;
          }

          // -------------------------------------------------
          // SUBSCRIPTION AMOUNT
          // -------------------------------------------------
          else if (
            column.data ===
            'subscriptionAmount'
          ) {
            const amount =
              row.subscriptionAmount;

            if (
              amount === null ||
              amount === undefined ||
              amount === ''
            ) {
              value =
                'Not Amount';
            } else {
              value =
                `₹${Number(
                  amount
                ).toLocaleString(
                  'en-IN'
                )}`;
            }
          }

          // -------------------------------------------------
          // SUBSCRIPTION STATUS
          // -------------------------------------------------
          else if (
            column.data ===
            'subscriptionStatus'
          ) {
            value = (
              row.subscriptionStatus ||
              'UNPAID'
            ).toLowerCase();
          }

          // -------------------------------------------------
          // NORMAL RENDERED COLUMN
          // -------------------------------------------------
          else if (
            typeof column.render ===
            'function'
          ) {
            try {
              value =
                column.render(
                  row[column.data],
                  'display',
                  row
                );
            } catch (error) {
              value =
                row[column.data];
            }
          }

          // -------------------------------------------------
          // NORMAL DATA
          // -------------------------------------------------
          else {
            value =
              row[column.data];
          }

          rowObject[header] =
            cleanText(value);
        }
      );

      return rowObject;
    }
  );

  // =========================================================
  // 4. CREATE WORKSHEET
  // =========================================================
  const worksheet =
    XLSX.utils.json_to_sheet(
      formattedData
    );

  // =========================================================
  // 5. AUTO COLUMN WIDTH
  // =========================================================
  worksheet['!cols'] =
    exportColumns.map(
      (column) => {

        const header =
          cleanText(
            column.title ||
            column.data
          );

        let maxLength =
          header.length;

        formattedData.forEach(
          (row) => {

            const value =
              String(
                row[header] || ''
              );

            if (
              value.length >
              maxLength
            ) {
              maxLength =
                value.length;
            }
          }
        );

        return {
          wch: Math.min(
            Math.max(
              maxLength + 3,
              12
            ),
            40
          )
        };
      }
    );

  // =========================================================
  // 6. CREATE WORKBOOK
  // =========================================================
  const workbook =
    XLSX.utils.book_new();

  const sheetName =
    title
      ? title
          .substring(0, 31)
          .replace(
            /[\/*?:\[\]]/g,
            ''
          )
      : 'Sheet1';

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    sheetName
  );

  // =========================================================
  // 7. DOWNLOAD EXCEL
  // =========================================================
  const fileName =
    `${title
      .toLowerCase()
      .replace(
        /\s+/g,
        '_'
      )}_export.xlsx`;

  XLSX.writeFile(
    workbook,
    fileName
  );

  toast.success(
    `Exported ${data.length} records to Excel (.xlsx)`
  );
};

 const handlePrint = () => {
  if (!data || data.length === 0) {
    toast.error('No data available to print');
    return;
  }

  const printWindow = window.open('', '_blank');

  if (!printWindow) {
    toast.error('Please allow popups to print.');
    return;
  }

  // Remove columns that should not appear in print
  const printableColumns = columns.filter((column) => {
    const title = String(column.title || '');

    // Remove checkbox / Select All column
    if (
      title.includes('select-all-students') ||
      title.includes('select-all-interviews')
    ) {
      return false;
    }

    // Remove Performance Report / View column
    if (
      title.toLowerCase().includes('performance report') ||
      title.toLowerCase().includes('view report')
    ) {
      return false;
    }

    return true;
  });

  // Convert HTML generated by render() into plain text
  const cleanText = (value) => {
    if (value === null || value === undefined) {
      return '';
    }

    const temp = document.createElement('div');
    temp.innerHTML = String(value);

    // Remove buttons, inputs and other controls
    temp.querySelectorAll('button, input, select, textarea').forEach((el) => {
      el.remove();
    });

    return temp.textContent
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Create table headers
  const headers = printableColumns
    .map((column) => {
      const temp = document.createElement('div');
      temp.innerHTML = String(column.title || column.data || '');

      // Remove HTML controls
      temp.querySelectorAll('button, input, select, textarea').forEach((el) => {
        el.remove();
      });

      return temp.textContent.replace(/\s+/g, ' ').trim();
    })
    .map((header) => `<th>${header}</th>`)
    .join('');

  // Create table rows
  const tableRows = data
    .map((row, rowIndex) => {
      const cells = printableColumns
        .map((column) => {
          let value;

         if (column.data === 'subscriptionAmount') {
  const amount = row.subscriptionAmount;

  if (
    amount === null ||
    amount === undefined ||
    amount === ''
  ) {
    value = 'Not Amount';
  } else {
    value = `₹${Number(amount).toLocaleString('en-IN')}`;
  }

} else if (column.data === 'subscriptionStatus') {
  value = (
    row.subscriptionStatus ||
    'UNPAID'
  ).toLowerCase();

} else if (typeof column.render === 'function') {
  try {
    value = column.render(
      row[column.data],
      'display',
      row
    );
  } catch (error) {
    value = row[column.data];
  }
} else {
  value = row[column.data];
}

          const text = cleanText(value);

          return `<td>${text || ''}</td>`;
        })
        .join('');

      return `<tr>${cells}</tr>`;
    })
    .join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            font-family: Arial, Helvetica, sans-serif;
            margin: 0;
            padding: 30px;
            color: #111827;
            background: #ffffff;
          }

          .print-header {
            margin-bottom: 20px;
            border-bottom: 2px solid #111827;
            padding-bottom: 10px;
          }

          .print-header h1 {
            margin: 0 0 6px;
            font-size: 22px;
          }

          .print-header p {
            margin: 0;
            font-size: 12px;
            color: #4B5563;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            table-layout: auto;
          }

          th {
            background: #F3F4F6;
            color: #111827;
            font-weight: 700;
            text-align: left;
            padding: 9px 10px;
            border: 1px solid #CBD5E1;
            font-size: 11px;
          }

          td {
            padding: 8px 10px;
            border: 1px solid #E2E8F0;
            color: #1E293B;
            font-size: 11px;
            vertical-align: middle;
          }

          tr {
            page-break-inside: avoid;
          }

          @media print {
            body {
              padding: 15px;
            }

            @page {
              size: landscape;
              margin: 10mm;
            }
          }
        </style>
      </head>

      <body>

        <div class="print-header">
          <h1>${title}</h1>

          <p>
            Total Records: ${data.length}
            |
            Printed: ${new Date().toLocaleString()}
          </p>
        </div>

        <table>
          <thead>
            <tr>
              ${headers}
            </tr>
          </thead>

          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <script>
          window.onload = function () {
            window.focus();
            window.print();
          };
        <\/script>

      </body>
    </html>
  `);

  printWindow.document.close();
};

  const changePaginationTextColor = () => {
    setTimeout(() => {
      document.querySelectorAll('.dt-paging button').forEach((button) => {
        if (
          button.classList.contains('current') ||
          button.getAttribute('aria-current') === 'page'
        ) {
          button.style.setProperty(
            'color',
            '#FFFFFF',
            'important'
          );

          button.style.setProperty(
            '-webkit-text-fill-color',
            '#FFFFFF',
            'important'
          );
        }
      });
    }, 300);
  };

  const defaultOptions = {
    paging: true,
    pageLength: 10,
    lengthMenu: [10, 25, 50, 100],
    searching: true,
    ordering: true,
    responsive: true,
    autoWidth: false,
    destroy: true,

    dom: '<"d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 p-3 bg-light border-bottom"<"dt-length"l><"dt-search"f>>rt<"d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 p-3 bg-light border-top"<"dt-info"i><"dt-paging"p>>',

    ...options,

    initComplete: function () {
      changePaginationTextColor();
    },

    drawCallback: function () {
      changePaginationTextColor();

      // Synchronize DOM checkbox states on table draw (pagination, sorting, searching)
      const currentSelectedStr = (selectedStudentIds || []).map(String);
      document.querySelectorAll('.student-notification-checkbox').forEach((checkbox) => {
        const id = checkbox.getAttribute('data-id');
        if (id) {
          checkbox.checked = currentSelectedStr.includes(String(id));
        }
      });

      const selectAllCb = document.querySelector('#select-all-students, .select-all-students-checkbox');
      if (selectAllCb) {
        const allCheckboxes = document.querySelectorAll('.student-notification-checkbox');
        if (allCheckboxes.length > 0) {
          const allChecked = Array.from(allCheckboxes).every((cb) => cb.checked);
          selectAllCb.checked = allChecked;
        }
      }
    }
  };

  return (
    <>
      {/* Hidden on screen, visible ONLY during printing */}
      <div className="print-only-container">
        <div className="print-table-header">
          <h2>{title}</h2>
          <p>Total Records: {data.length} | Exported: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
        </div>
        <table className="print-table">
          <thead>
            <tr>
              {columns.map((c, idx) => (
                <th key={idx}>{c.title || c.data}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={row._id || rowIndex}>
                {columns.map((c, colIndex) => {
                  let val;
                  if (typeof c.render === 'function') {
                    try {
                      val = c.render(row[c.data], 'display', row);
                    } catch (err) {
                      val = row[c.data];
                    }
                  } else {
                    val = row[c.data];
                  }

                  if (val === undefined || val === null) {
                    val = '';
                  }

                  const isHTMLString = typeof val === 'string' && /<[a-z][\s\S]*>/i.test(val);

                  return (
                    <td key={colIndex}>
                      {isHTMLString ? (
                        <span dangerouslySetInnerHTML={{ __html: val }} />
                      ) : (
                        String(val)
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card border-0 shadow-sm rounded-3 overflow-hidden custom-datatable-wrapper">
        {/* Table Toolbar Header */}
        <div className="p-3 text-white d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 border-bottom" style={{ background: '#4C1D95' }}>
          <div className="d-flex align-items-center gap-2">
            <h6 className="fw-bold mb-0 text-white me-2">{title}</h6>
            <span className="badge rounded-pill px-2.5 py-1" style={{ background: '#8B5CF6', color: '#FFFFFF', fontSize: '0.7rem' }}>
              {data.length} MongoDB Records
            </span>
          </div>

          {/* Toolbar Export Actions */}
          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-sm btn-outline-light d-flex align-items-center gap-1.5 fw-semibold" onClick={exportToCSV} title="Export to CSV">
              <FaFileCsv className="text-success" size={14} /> Export CSV
            </button>
            <button className="btn btn-sm btn-outline-light d-flex align-items-center gap-1.5 fw-semibold" onClick={exportToExcel} title="Export to Excel">
              <FaFileExcel className="text-success" size={14} /> Export Excel
            </button>
            <button className="btn btn-sm btn-outline-light d-flex align-items-center gap-1.5 fw-semibold" onClick={handlePrint} title="Print Table">
              <FaPrint className="text-warning" size={14} /> Print
            </button>
          </div>
        </div>

        {/* Main DataTable Component */}
        {loading ? (
          <div className="p-5 text-center text-muted">
            <div className="spinner-border text-purple mb-2" role="status"></div>
            <p className="mb-0">Syncing live records from database...</p>
          </div>
        ) : (
          <div
            className="table-responsive p-1"
            onClick={(e) => {
              const selectAllBtn = e.target.closest('#select-all-students, .select-all-students-checkbox');
              if (selectAllBtn) {
                if (onSelectAllStudents) {
                  onSelectAllStudents();
                }
                return;
              }
              const studentCb = e.target.closest('.student-notification-checkbox');
              if (studentCb) {
                const id = studentCb.getAttribute('data-id');
                if (id && onStudentSelect) {
                  onStudentSelect(String(id));
                }
                return;
              }
              const statusBtn = e.target.closest('.toggle-status-btn');
              if (statusBtn) {
                e.preventDefault();
                const id = statusBtn.getAttribute('data-id');
                const nextStatus = statusBtn.getAttribute('data-status');
                if (id && nextStatus && onStatusToggle) {
                  onStatusToggle(id, nextStatus);
                }
              }
              const studentBtn = e.target.closest('.view-student-profile');
              if (studentBtn) {
                e.preventDefault();
                const id = studentBtn.getAttribute('data-id');
                if (id && onStudentClick) {
                  onStudentClick(id);
                }
              }
              const reportBtn = e.target.closest('.view-report-btn');
              if (reportBtn) {
                const id = reportBtn.getAttribute('data-id');
                if (id && onReportClick) {
                  onReportClick(id);
                }
              }
              const resumeBtn = e.target.closest('.view-resume-btn');
              if (resumeBtn) {
                e.preventDefault();
                const id = resumeBtn.getAttribute('data-id');
                const name = resumeBtn.getAttribute('data-name');
                if (id && onResumeClick) {
                  onResumeClick(id, name);
                }
              }
              const genBtn = e.target.closest('.generate-cert-row-btn');
              if (genBtn) {
                e.preventDefault();
                const id = genBtn.getAttribute('data-id');
                if (id && onGenerateClick) {
                  onGenerateClick(id);
                }
              }
            }}
          >
            <DataTable
              data={data}
              columns={columns}
              options={defaultOptions}
              className="table table-hover align-middle mb-0 w-100"
            />
          </div>
        )}

        {/* Custom Scoped CSS for DataTables & Print */}
        <style>{`
          .custom-datatable-wrapper .dt-search input {
            border-radius: 20px;
            padding: 4px 12px;
            border: 1px solid #CBD5E1;
            font-size: 0.825rem;
            margin-left: 6px;
          }
          .custom-datatable-wrapper .dt-length select {
            border-radius: 6px;
            padding: 2px 8px;
            font-size: 0.825rem;
            margin: 0 4px;
          }
          .custom-datatable-wrapper table.dataTable thead th {
            background-color: #4C1D95 !important;
            color: #FFFFFF !important;
            font-weight: 700;
            font-size: 0.825rem;
            border-bottom: 2px solid rgba(255,255,255,0.2) !important;
            padding: 12px 14px;
          }
          .custom-datatable-wrapper table.dataTable tbody td {
            font-size: 0.825rem;
            padding: 10px 14px;
          }
          .custom-datatable-wrapper .view-resume-btn,
          .custom-datatable-wrapper .view-resume-btn:hover,
          .custom-datatable-wrapper .view-resume-btn:focus,
          .custom-datatable-wrapper .view-resume-btn:active {
            text-decoration: none !important;
          }
          .custom-datatable-wrapper table.dataTable tbody tr:hover {
            background-color: rgba(109, 40, 217, 0.05) !important;
          }
          .custom-datatable-wrapper .dt-paging .dt-paging-button {
            border-radius: 6px !important;
            padding: 4px 10px !important;
            margin: 0 2px !important;
            font-size: 0.8rem !important;
          }
          .custom-datatable-wrapper .dt-paging .dt-paging-button.current {
            background: #6D28D9 !important;
            color: #FFFFFF !important;
            border-color: #6D28D9 !important;
          }

          /* Print-specific CSS styles */
          @media print {
            body * {
              visibility: hidden !important;
            }

            .print-only-container,
            .print-only-container * {
              visibility: visible !important;
            }

            .print-only-container {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 20px !important;
              background: #ffffff !important;
              color: #000000 !important;
            }

            .print-table-header {
              margin-bottom: 16px;
              padding-bottom: 10px;
              border-bottom: 2px solid #111827;
            }

            .print-table-header h2 {
              margin: 0 0 4px 0;
              font-size: 20px;
              font-weight: 700;
              color: #111827;
            }

            .print-table-header p {
              margin: 0;
              font-size: 12px;
              color: #4B5563;
            }

            .print-table {
              width: 100% !important;
              border-collapse: collapse !important;
              font-size: 11px !important;
            }

            .print-table th {
              background-color: #F3F4F6 !important;
              color: #111827 !important;
              font-weight: 700 !important;
              text-align: left !important;
              padding: 8px 10px !important;
              border: 1px solid #CBD5E1 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .print-table td {
              padding: 8px 10px !important;
              border: 1px solid #E2E8F0 !important;
              color: #1E293B !important;
              vertical-align: middle !important;
            }

            .print-table td code {
              font-family: monospace;
              background: #F1F5F9 !important;
              padding: 2px 4px !important;
              border-radius: 4px;
              border: 1px solid #CBD5E1;
              color: #0F172A !important;
            }

            .print-table td .badge {
              border: 1px solid #94A3B8 !important;
              color: #0F172A !important;
              background: #F8FAFC !important;
              padding: 2px 6px !important;
              font-weight: 600;
            }

            .print-table tr {
              page-break-inside: avoid;
              break-inside: avoid;
            }
          }

          @media screen {
            .print-only-container {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default ReusableDataTable;
