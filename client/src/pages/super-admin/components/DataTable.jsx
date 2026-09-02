import React, { useState, useEffect } from 'react';
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
  onRowSelect = null,
  onReportClick = null,
  onResumeClick = null,
  onStudentClick = null,
  onStatusToggle = null,
  onGenerateClick = null,
  options = {}
}) => {
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    setSelectedIds([]);
  }, [data]);

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

    const formattedData = data.map((row) => {
      const rowObj = {};
      columns.forEach((c) => {
        const header = c.title || c.data;
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

        if (typeof val === 'string') {
          val = val
            .replace(/<[^>]*>?/gm, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .trim();
        }

        rowObj[header] = val;
      });
      return rowObj;
    });

    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    // Dynamic column width calculation for clean formatting in Excel
    const colWidths = columns.map((c) => {
      const header = c.title || c.data;
      let maxLen = header.length;
      formattedData.forEach((row) => {
        const cellVal = String(row[header] || '');
        if (cellVal.length > maxLen) {
          maxLen = cellVal.length;
        }
      });
      return { wch: Math.min(Math.max(maxLen + 3, 12), 40) };
    });
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    const sheetName = title ? title.substring(0, 31).replace(/[\/*?:\[\]]/g, '') : 'Sheet1';
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const fileName = `${title.toLowerCase().replace(/\s+/g, '_')}_export.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast.success(`Exported ${data.length} records to Excel (.xlsx)`);
  };

  const handlePrint = () => {
    if (!data || data.length === 0) {
      toast.error('No data available to print');
      return;
    }
    window.print();
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
    ...options
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
