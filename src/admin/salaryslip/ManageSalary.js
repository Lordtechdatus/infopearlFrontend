// import React, { useState, useEffect } from 'react';
// import { Container, Row, Col, Table, Button, Card, Modal, Alert } from 'react-bootstrap';
// import { Link, useNavigate } from 'react-router-dom';
// import ShowEntries from '../../components/ShowEntries';
// import 'bootstrap-icons/font/bootstrap-icons.css';
// import './ManageSalary.css';
// import '../../styles/pagination.css';
// import { saveAs } from 'file-saver';

// const API_BASE = 'https://backend.infopearl.in'; // backend base (same as invoices page)

// const ManageSalary = () => {
//   // ====== DATA ======
//   const [salaryRecords, setSalaryRecords] = useState([]);
//   const [isServerData, setIsServerData] = useState(false);
//   const [serverTotalPages, setServerTotalPages] = useState(0);
//   const [serverTotalCount, setServerTotalCount] = useState(0);

//   // ====== UI state ======
//   const [searchTerm, setSearchTerm] = useState('');
//   const [entriesPerPage, setEntriesPerPage] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);

//   const [sortField, setSortField] = useState('payPeriod');
//   const [sortDirection, setSortDirection] = useState('desc');

//   const [showDownloadSuccess, setShowDownloadSuccess] = useState(false);
//   const [downloadSlipId, setDownloadSlipId] = useState(null);

//   const [showViewModal, setShowViewModal] = useState(false);
//   const [slipToView, setSlipToView] = useState(null);

//   const [showEmailModal, setShowEmailModal] = useState(false);
//   const [slipToEmail, setSlipToEmail] = useState(null);
//   const [emailDetails, setEmailDetails] = useState({ to: '', subject: '', message: '' });
//   const [showEmailSuccess, setShowEmailSuccess] = useState(false);

//   const navigate = useNavigate();

//   // ====== HELPERS ======
//   const getMonthNumber = (monthName) => {
//     const months = {
//       'January': '01', 'February': '02', 'March': '03', 'April': '04',
//       'May': '05', 'June': '06', 'July': '07', 'August': '08',
//       'September': '09', 'October': '10', 'November': '11', 'December': '12'
//     };
//     return months[monthName] || '00';
//   };

//   const formatYmdToDmy = (ymd) => {
//     try {
//       if (!ymd) return '';
//       const [y, m, d] = ymd.split('-');
//       if (!y || !m || !d) return ymd;
//       return `${d}/${m}/${y}`;
//     } catch {
//       return ymd;
//     }
//   };

//   const parsePayPeriodToSortable = (payPeriod) => {
//     // Expect "Month YYYY" -> "YYYY-MM"
//     if (!payPeriod) return '0000-00';
//     const parts = payPeriod.trim().split(/\s+/);
//     if (parts.length < 2) return payPeriod;
//     const month = getMonthNumber(parts[0]);
//     const year = parts[1];
//     return `${year}-${month}`;
//   };

//   // ====== SERVER LOAD ======
//   const fetchSalaryFromServer = async (page, limit, search) => {
//     try {
//       const params = new URLSearchParams({
//         page: String(page),
//         limit: String(limit)
//       });
//       if (search && search.trim()) params.append('search', search.trim());

//       const res = await fetch(`${API_BASE}/show-salaryslips.php?${params.toString()}`, {
//         method: 'GET',
//         headers: { 'Accept': 'application/json' },
//         credentials: 'omit'
//       });
//       if (!res.ok) throw new Error(`Server returned ${res.status}`);
//       const json = await res.json();

//       // Expect shape: { data: { salaryslips: [...] }, pagination: { total_pages, total_count, ... } }
//       const rows = (json?.data?.salaryslips || []).map((r) => {
//         const net = typeof r.net_salary === 'string' ? parseFloat(r.net_salary) : (r.net_salary || 0);
//         return {
//           id: r.id || r.slip_id || r.emp_id || String(Date.now()),
//           employeeId: r.emp_id || '',
//           employeeName: r.emp_name || '',
//           designation: r.designation || '',
//           department: r.department || '',
//           joiningDate: r.joining_date_formatted || formatYmdToDmy(r.joining_date || ''),
//           payPeriod: r.pay_period || '',
//           paidDays: r.paid_days ?? '',
//           lopDays: r.lop_days ?? '',
//           payDate: r.pay_date_formatted || formatYmdToDmy(r.pay_date || ''),
//           netSalary: isNaN(net) ? 0 : net,
//           createdAt: r.created_at || '',
//           // PDF info from backend
//           pdfFilename: r.salaryslip_pdf || null,
//           pdfUrl: r.pdf_url || null,
//           pdfDownloadUrl: r.pdf_download_url || null
//         };
//       });

//       setSalaryRecords(rows);
//       setIsServerData(true);
//       setServerTotalPages(json?.pagination?.total_pages || 0);
//       setServerTotalCount(json?.pagination?.total_count || 0);
//     } catch (e) {
//       console.error('Failed to load salary slips from server:', e);
//       // fallback to localStorage
//       setIsServerData(false);
//       loadSalaryFromStorage();
//     }
//   };

//   // ====== LOCAL FALLBACK ======
//   const loadSalaryFromStorage = () => {
//     try {
//       const savedStr = localStorage.getItem('salarySlips');
//       if (!savedStr) {
//         setSalaryRecords([]);
//         return;
//       }
//       let saved = [];
//       try {
//         saved = JSON.parse(savedStr);
//         if (!Array.isArray(saved)) {
//           localStorage.removeItem('salarySlips');
//           setSalaryRecords([]);
//           return;
//         }
//       } catch {
//         localStorage.removeItem('salarySlips');
//         setSalaryRecords([]);
//         return;
//       }

//       const mapped = saved.map((rec) => {
//         const net = typeof rec.netSalary === 'string' ? parseFloat(rec.netSalary) : (rec.netSalary || 0);
//         const pp = rec.payPeriod || (rec.month && rec.year ? `${rec.month} ${rec.year}` : '');

//         return {
//           id: rec.id || String(Date.now()),
//           employeeId: rec.employeeId || '',
//           employeeName: rec.employeeName || '',
//           designation: rec.designation || '',
//           department: rec.department || '',
//           joiningDate: rec.joiningDate ? formatYmdToDmy(rec.joiningDate) : '',
//           payPeriod: pp,
//           paidDays: rec.paidDays ?? '',
//           lopDays: rec.lossOfPayDays ?? rec.lopDays ?? '',
//           payDate: rec.payDate ? formatYmdToDmy(rec.payDate) : '',
//           netSalary: isNaN(net) ? 0 : net,
//           createdAt: rec.createdAt || '',
//           // local data usually won’t have server files
//           pdfFilename: rec.salaryslip_pdf || null,
//           pdfUrl: rec.pdfUrl || null,
//           pdfDownloadUrl: rec.pdfDownloadUrl || null
//         };
//       });

//       // Sort newest first (by createdAt fallback)
//       const sorted = mapped.sort((a, b) => {
//         if (a.createdAt && b.createdAt) {
//           return new Date(b.createdAt) - new Date(a.createdAt);
//         }
//         return 0;
//       });

//       setSalaryRecords(sorted);
//     } catch (e) {
//       console.error('Error reading salary slips from localStorage:', e);
//       setSalaryRecords([]);
//     }
//   };

//   // ====== EFFECTS ======
//   useEffect(() => {
//     fetchSalaryFromServer(currentPage, entriesPerPage, searchTerm);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [currentPage, entriesPerPage, searchTerm]);

//   // ====== SORTING (local-only; server already sorted) ======
//   const handleSort = (field) => {
//     if (sortField === field) {
//       setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
//     } else {
//       setSortField(field);
//       setSortDirection('asc');
//     }
//   };

//   const getSortIndicator = (field) => {
//     if (sortField !== field) return '↕';
//     return sortDirection === 'asc' ? '↑' : '↓';
//   };

//   const localFilteredAndSorted = !isServerData
//     ? salaryRecords
//         .filter(r => {
//           const q = (searchTerm || '').toLowerCase();
//           return (
//             (r.employeeId || '').toLowerCase().includes(q) ||
//             (r.employeeName || '').toLowerCase().includes(q) ||
//             (r.payPeriod || '').toLowerCase().includes(q)
//           );
//         })
//         .sort((a, b) => {
//           let cmp = 0;
//           if (sortField === 'employeeId') {
//             cmp = (a.employeeId || '').localeCompare(b.employeeId || '');
//           } else if (sortField === 'employeeName') {
//             cmp = (a.employeeName || '').localeCompare(b.employeeName || '');
//           } else if (sortField === 'payPeriod') {
//             const aKey = parsePayPeriodToSortable(a.payPeriod);
//             const bKey = parsePayPeriodToSortable(b.payPeriod);
//             cmp = aKey.localeCompare(bKey);
//           } else if (sortField === 'netSalary') {
//             cmp = (parseFloat(a.netSalary || 0) - parseFloat(b.netSalary || 0));
//           }
//           return sortDirection === 'asc' ? cmp : -cmp;
//         })
//     : salaryRecords; // server already filtered/sorted/paginated

//   // ====== PAGINATION (local-only) ======
//   const indexOfLast = currentPage * entriesPerPage;
//   const indexOfFirst = indexOfLast - entriesPerPage;

//   const totalEntries = isServerData ? serverTotalCount : localFilteredAndSorted.length;
//   const totalPages = isServerData ? serverTotalPages : Math.ceil(totalEntries / entriesPerPage);

//   const visibleRecords = isServerData
//     ? salaryRecords // server data already page-limited
//     : localFilteredAndSorted.slice(indexOfFirst, indexOfLast);

//   const handlePageChange = (pageNum) => {
//     if (pageNum < 1) return;
//     if (isServerData) {
//       if (serverTotalPages && pageNum > serverTotalPages) return;
//     } else {
//       const localPages = Math.ceil((localFilteredAndSorted.length || 0) / entriesPerPage);
//       if (pageNum > localPages) return;
//     }
//     setCurrentPage(pageNum);
//   };

//   // ====== ACTIONS ======
//   const handleDelete = (id) => {
//     // local-only delete (no server delete endpoint)
//     if (window.confirm('Are you sure you want to delete this salary record?')) {
//       // Remove from current list
//       const updated = salaryRecords.filter(r => r.id !== id);
//       setSalaryRecords(updated);

//       // Remove from localStorage if present
//       try {
//         const savedStr = localStorage.getItem('salarySlips');
//         if (savedStr) {
//           const saved = JSON.parse(savedStr);
//           if (Array.isArray(saved)) {
//             const updatedLocal = saved.filter(r => String(r.id) !== String(id));
//             localStorage.setItem('salarySlips', JSON.stringify(updatedLocal));
//           }
//         }
//       } catch {}

//       // If you later add a server delete endpoint, call it here similarly.
//     }
//   };

//   const openViewModal = (record) => {
//     setSlipToView(record);
//     setShowViewModal(true);
//   };

//   const openEmailModal = (record) => {
//     setSlipToEmail(record);
//     setEmailDetails({
//       to: '', // fill if you store emails per employee
//       subject: `Salary Slip - ${record.employeeName} (${record.payPeriod})`,
//       message: `Dear ${record.employeeName},\n\nPlease find attached your salary slip for ${record.payPeriod}.\n\nNet Salary: ₹${Number(record.netSalary || 0).toFixed(2)}\n\nBest regards,\nInfopearl Tech Solutions Pvt Ltd`
//     });
//     setShowEmailModal(true);
//   };

//   const handleEmailChange = (e) => {
//     const { name, value } = e.target;
//     setEmailDetails(prev => ({ ...prev, [name]: value }));
//   };

//   const sendEmail = () => {
//     // No backend email endpoint provided; keep client-side confirmation like InvoiceList
//     setShowEmailModal(false);
//     setShowEmailSuccess(true);
//     setTimeout(() => setShowEmailSuccess(false), 5000);
//   };

//   const downloadPdfFromUrl = async (url, filename) => {
//     try {
//       const res = await fetch(url, { method: 'GET', credentials: 'omit' });
//       if (!res.ok) throw new Error(`Download failed (${res.status})`);
//       const blob = await res.blob();
//       saveAs(blob, filename);
//       return true;
//     } catch (e) {
//       console.error('PDF download error:', e);
//       return false;
//     }
//   };

//   const handleDownloadPDF = async (record) => {
//     const invId = record.id || record.employeeId || `${record.employeeName}_${record.payPeriod}`.replace(/\s+/g, '_');
//     setDownloadSlipId(invId);
//     try {
//       // 1) Prefer proxy downloader (download-salaryslips.php) — best for CORS and headers
//       if (record.pdfDownloadUrl) {
//         const ok = await downloadPdfFromUrl(record.pdfDownloadUrl, `SalarySlip_${invId}.pdf`);
//         if (ok) {
//           setShowDownloadSuccess(true);
//           setTimeout(() => {
//             setShowDownloadSuccess(false);
//             setDownloadSlipId(null);
//           }, 3000);
//           return;
//         }
//       }

//       // 2) Fallback: direct public URL
//       if (record.pdfUrl) {
//         const ok = await downloadPdfFromUrl(record.pdfUrl, `SalarySlip_${invId}.pdf`);
//         if (ok) {
//           setShowDownloadSuccess(true);
//           setTimeout(() => {
//             setShowDownloadSuccess(false);
//             setDownloadSlipId(null);
//           }, 3000);
//           return;
//         }
//       }

//       alert('No server PDF found for this salary slip.');
//       setDownloadSlipId(null);
//     } catch (e) {
//       console.error('Download error:', e);
//       alert(e.message || 'Download failed.');
//       setDownloadSlipId(null);
//     }
//   };

//   const handleViewSlip = (record) => {
//     openViewModal(record);
//   };

//   const handleRefresh = () => {
//     fetchSalaryFromServer(currentPage, entriesPerPage, searchTerm);
//   };

//   // ====== RENDER ======
//   return (
//     <Container fluid className="mt-4">
//       <h1 className="mb-4">Manage Salary Slips</h1>

//       {/* Success alerts */}
//       {showDownloadSuccess && (
//         <Alert variant="success" className="d-flex justify-content-between align-items-center">
//           <span>
//             <strong>Success:</strong> Salary slip has been downloaded to your device.
//           </span>
//           <Button
//             variant="outline-success"
//             size="sm"
//             onClick={() => setShowDownloadSuccess(false)}
//             className="ms-2"
//           >
//             <i className="bi bi-x-lg"></i>
//           </Button>
//         </Alert>
//       )}

//       {showEmailSuccess && (
//         <Alert variant="success" className="d-flex justify-content-between align-items-center">
//           <span>
//             <strong>Success:</strong> Email has been sent{slipToEmail ? ` for ${slipToEmail.employeeName}` : ''}.
//           </span>
//           <Button
//             variant="outline-success"
//             size="sm"
//             onClick={() => setShowEmailSuccess(false)}
//             className="ms-2"
//           >
//             <i className="bi bi-x-lg"></i>
//           </Button>
//         </Alert>
//       )}

//       {/* Summary Cards */}
//       <Row className="mb-4">
//         <Col md={4}>
//           <Card className="text-center h-100 border-0 shadow-sm text-white" style={{ background: 'linear-gradient(135deg, #051937, #004d7a)', borderColor: '#051937' }}>
//             <div
//               className="text-white rounded-circle d-flex align-items-center justify-content-center"
//               style={{ width: '50px', height: '50px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
//             >
//               <i className="bi bi-file-earmark-text fs-4"></i>
//             </div>
//             <Card.Body className="d-flex flex-column">
//               <div className="d-flex justify-content-between align-items-center mb-2">
//                 <Card.Title>Total Records</Card.Title>
//               </div>
//               <h2 className="mb-0">{totalEntries}</h2>
//             </Card.Body>
//           </Card>
//         </Col>

//         <Col md={4}>
//           <Card className="text-center h-100 border-0 shadow-sm text-white" style={{ background: 'linear-gradient(135deg, #FBBC05, #EA4335)', borderColor: '#051937' }}>
//             <div
//               className="text-white rounded-circle d-flex align-items-center justify-content-center"
//               style={{ width: '50px', height: '50px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
//             >
//               <i className="bi bi-calendar-check fs-4"></i>
//             </div>
//             <Card.Body className="d-flex flex-column">
//               <div className="d-flex justify-content-between align-items-center mb-2">
//                 <Card.Title>Current Month</Card.Title>
//               </div>
//               {(() => {
//                 const today = new Date();
//                 const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
//                   'July', 'August', 'September', 'October', 'November', 'December'];
//                 const currentMonth = monthNames[today.getMonth()];
//                 return (
//                   <h3 className="mb-0" style={{ color: 'white', fontWeight: 'bold' }}>{currentMonth}</h3>
//                 );
//               })()}
//             </Card.Body>
//           </Card>
//         </Col>

//         <Col md={4}>
//           <Card className="text-center h-100 border-0 shadow-sm text-white" style={{ background: 'linear-gradient(135deg, #34A853, #1E8E3E)', borderColor: '#051937' }}>
//             <div
//               className="text-white rounded-circle d-flex align-items-center justify-content-center"
//               style={{ width: '50px', height: '50px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
//             >
//               <i className="bi bi-people fs-4"></i>
//             </div>
//             <Card.Body className="d-flex flex-column">
//               <div className="d-flex justify-content-between align-items-center mb-2">
//                 <Card.Title>Total Employees</Card.Title>
//               </div>
//               <h2 className="mb-0">
//                 {new Set(salaryRecords.map(record => record.employeeId || '')).size}
//               </h2>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       {/* Main content - Salary Records */}
//       <div className="bg-white rounded shadow-sm mb-4">
//         <div className="p-3">
//           <div className="d-flex justify-content-between align-items-center mb-3">
//             <h3 className="mb-0">Salary Records</h3>
//             <div className="d-flex">
//               <Button variant="info" className="me-2" onClick={handleRefresh}>
//                 <i className="bi bi-arrow-clockwise me-1"></i> Refresh List
//               </Button>
//               <Link to="/admin/employee/createpage" className="btn btn-primary">
//                 <i className="bi bi-plus-lg me-2"></i>
//                 Create New Salary Slip
//               </Link>
//             </div>
//           </div>

//           <ShowEntries
//             entriesPerPage={entriesPerPage}
//             setEntriesPerPage={setEntriesPerPage}
//             searchTerm={searchTerm}
//             setSearchTerm={(v) => { setCurrentPage(1); setSearchTerm(v); }}
//             totalEntries={totalEntries}
//             searchPlaceholder="Search employee, ID, pay period..."
//           />

//           <Table hover responsive className="mt-3">
//             <thead>
//               <tr>
//                 <th onClick={() => handleSort('employeeId')} style={{ cursor: 'pointer' }}>
//                   Employee ID {getSortIndicator('employeeId')}
//                 </th>
//                 <th onClick={() => handleSort('employeeName')} style={{ cursor: 'pointer' }}>
//                   Employee Name {getSortIndicator('employeeName')}
//                 </th>
//                 <th onClick={() => handleSort('payPeriod')} style={{ cursor: 'pointer' }}>
//                   Pay Period {getSortIndicator('payPeriod')}
//                 </th>
//                 <th onClick={() => handleSort('netSalary')} style={{ cursor: 'pointer' }}>
//                   Net Salary {getSortIndicator('netSalary')}
//                 </th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {visibleRecords.length > 0 ? (
//                 visibleRecords.map(record => (
//                   <tr key={record.id}>
//                     <td>{record.employeeId}</td>
//                     <td>{record.employeeName}</td>
//                     <td>{record.payPeriod}</td>
//                     <td>₹ {Number(record.netSalary || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
//                     <td>
//                       <div className="d-flex">
//                         <Button
//                           variant="info"
//                           size="sm"
//                           className="me-1"
//                           onClick={() => handleViewSlip(record)}
//                           title="View details"
//                         >
//                           <i className="bi bi-eye"></i>
//                         </Button>
//                         <Button
//                           variant="success"
//                           size="sm"
//                           className="me-1"
//                           onClick={() => handleDownloadPDF(record)}
//                           disabled={downloadSlipId === (record.id || record.employeeId)}
//                           title={record.pdfDownloadUrl || record.pdfUrl ? 'Download PDF' : 'No PDF on server'}
//                         >
//                           {downloadSlipId === (record.id || record.employeeId)
//                             ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
//                             : <i className="bi bi-download"></i>
//                           }
//                         </Button>
//                         <Button
//                           variant="primary"
//                           size="sm"
//                           className="me-1"
//                           onClick={() => openEmailModal(record)}
//                           title="Send email"
//                         >
//                           <i className="bi bi-envelope"></i>
//                         </Button>
//                         <Button
//                           variant="danger"
//                           size="sm"
//                           onClick={() => handleDelete(record.id)}
//                           title="Delete (local only)"
//                         >
//                           <i className="bi bi-trash"></i>
//                         </Button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="5" className="text-center py-4">
//                     {searchTerm ? (
//                       <div>
//                         <i className="bi bi-search text-muted mb-2" style={{ fontSize: '2rem' }}></i>
//                         <p className="mb-0">No matching records found</p>
//                         <small className="text-muted">Try adjusting your search terms</small>
//                       </div>
//                     ) : (
//                       <div>
//                         <i className="bi bi-file-earmark-text text-muted mb-2" style={{ fontSize: '2rem' }}></i>
//                         <p className="mb-0">No salary records found</p>
//                         <small className="text-muted">Click "Create New Salary Slip" to add one</small>
//                       </div>
//                     )}
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </Table>

//           {/* Pagination */}
//           <div className="d-flex justify-content-between align-items-center mt-3">
//             <div>
//               {totalEntries > 0 ? (
//                 isServerData ? (
//                   <span>
//                     Showing {(serverTotalCount === 0) ? 0 : ((currentPage - 1) * entriesPerPage + 1)} to {Math.min(currentPage * entriesPerPage, serverTotalCount)} of {serverTotalCount} entries
//                   </span>
//                 ) : (
//                   <span>
//                     Showing {Math.min(indexOfFirst + 1, localFilteredAndSorted.length)} to {Math.min(indexOfLast, localFilteredAndSorted.length)} of {localFilteredAndSorted.length} entries
//                     {searchTerm && ` (filtered from ${salaryRecords.length} total entries)`}
//                   </span>
//                 )
//               ) : (
//                 <span>No entries to show</span>
//               )}
//             </div>

//             {totalPages > 0 && (
//               <div>
//                 <ul className="pagination mb-0">
//                   <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
//                     <Button
//                       variant="link"
//                       className="page-link"
//                       onClick={() => handlePageChange(currentPage - 1)}
//                       disabled={currentPage === 1}
//                     >
//                       Previous
//                     </Button>
//                   </li>

//                   {[...Array(totalPages).keys()].map(number => (
//                     <li
//                       key={number + 1}
//                       className={`page-item ${currentPage === number + 1 ? 'active' : ''}`}
//                     >
//                       <Button
//                         variant="link"
//                         className="page-link"
//                         onClick={() => handlePageChange(number + 1)}
//                       >
//                         {number + 1}
//                       </Button>
//                     </li>
//                   ))}

//                   <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
//                     <Button
//                       variant="link"
//                       className="page-link"
//                       onClick={() => handlePageChange(currentPage + 1)}
//                       disabled={currentPage === totalPages || totalPages === 0}
//                     >
//                       Next
//                     </Button>
//                   </li>
//                 </ul>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* View Modal */}
//       <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
//         <Modal.Header closeButton>
//           <Modal.Title>
//             Salary Slip Details
//             {slipToView && (
//               <span className="text-muted fs-6"> — {slipToView.employeeName} ({slipToView.employeeId})</span>
//             )}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {slipToView && (
//             <div>
//               <Row className="mb-3">
//                 <Col md={6}>
//                   <h5>Employee</h5>
//                   <p><strong>ID:</strong> {slipToView.employeeId}</p>
//                   <p><strong>Name:</strong> {slipToView.employeeName}</p>
//                   <p><strong>Designation:</strong> {slipToView.designation || '-'}</p>
//                   <p><strong>Department:</strong> {slipToView.department || '-'}</p>
//                   <p><strong>Joining Date:</strong> {slipToView.joiningDate || '-'}</p>
//                 </Col>
//                 <Col md={6}>
//                   <h5>Pay Info</h5>
//                   <p><strong>Pay Period:</strong> {slipToView.payPeriod || '-'}</p>
//                   <p><strong>Paid Days:</strong> {slipToView.paidDays || '-'}</p>
//                   <p><strong>LOP Days:</strong> {slipToView.lopDays || '-'}</p>
//                   <p><strong>Pay Date:</strong> {slipToView.payDate || '-'}</p>
//                   <p><strong>Net Salary:</strong> ₹{Number(slipToView.netSalary || 0).toFixed(2)}</p>
//                 </Col>
//               </Row>
//               {slipToView.pdfUrl && (
//                 <div className="mt-2">
//                   <a href={slipToView.pdfUrl} target="_blank" rel="noreferrer">Open PDF</a>
//                 </div>
//               )}
//             </div>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowViewModal(false)}>
//             Close
//           </Button>
//           <Button
//             variant="success"
//             onClick={() => {
//               if (slipToView) handleDownloadPDF(slipToView);
//               setShowViewModal(false);
//             }}
//           >
//             {(slipToView?.pdfDownloadUrl || slipToView?.pdfUrl) ? 'Download PDF' : 'Download (No File)'}
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Email Modal */}
//       <Modal show={showEmailModal} onHide={() => setShowEmailModal(false)} size="lg">
//         <Modal.Header closeButton>
//           <Modal.Title>
//             Send Salary Slip Email
//             {slipToEmail && (
//               <span className="text-muted fs-6"> — {slipToEmail.employeeName} ({slipToEmail.employeeId})</span>
//             )}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <form>
//             <div className="mb-3">
//               <label className="form-label">To:</label>
//               <input
//                 type="email"
//                 name="to"
//                 className="form-control"
//                 value={emailDetails.to}
//                 onChange={handleEmailChange}
//                 placeholder="employee@example.com"
//                 required
//               />
//             </div>
//             <div className="mb-3">
//               <label className="form-label">Subject:</label>
//               <input
//                 type="text"
//                 name="subject"
//                 className="form-control"
//                 value={emailDetails.subject}
//                 onChange={handleEmailChange}
//                 required
//               />
//             </div>
//             <div className="mb-3">
//               <label className="form-label">Message:</label>
//               <textarea
//                 name="message"
//                 rows={6}
//                 className="form-control"
//                 value={emailDetails.message}
//                 onChange={handleEmailChange}
//               />
//             </div>
//             <div className="mb-3 form-check">
//               <input type="checkbox" className="form-check-input" checked readOnly id="attachPdfChk" />
//               <label htmlFor="attachPdfChk" className="form-check-label">Attach salary slip as PDF</label>
//             </div>
//           </form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowEmailModal(false)}>
//             Cancel
//           </Button>
//           <Button variant="primary" onClick={sendEmail}>
//             Send Email
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </Container>
//   );
// };

// export default ManageSalary;




import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button, Card, Modal, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ShowEntries from '../../components/ShowEntries';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './ManageSalary.css';
import '../../styles/pagination.css';
import { saveAs } from 'file-saver';

const API_BASE = 'https://backend.infopearl.in'; // backend base (same as invoices page)
const SALARY_PUBLIC_BASE = `${API_BASE}/uploads/salary_slips`;
const SALARY_DOWNLOAD = `${API_BASE}/download-salaryslips.php`;
const SALARY_DELETE = `${API_BASE}/salary-delete.php`;

const ManageSalary = () => {
  // ====== DATA ======
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [isServerData, setIsServerData] = useState(false);
  const [serverTotalPages, setServerTotalPages] = useState(0);
  const [serverTotalCount, setServerTotalCount] = useState(0);

  // ====== UI state ======
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [sortField, setSortField] = useState('payPeriod');
  const [sortDirection, setSortDirection] = useState('desc');

  const [showDownloadSuccess, setShowDownloadSuccess] = useState(false);
  const [downloadSlipId, setDownloadSlipId] = useState(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [slipToView, setSlipToView] = useState(null);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [slipToEmail, setSlipToEmail] = useState(null);
  const [emailDetails, setEmailDetails] = useState({ to: '', subject: '', message: '' });
  const [showEmailSuccess, setShowEmailSuccess] = useState(false);

  // ====== HELPERS ======
  const getMonthNumber = (monthName) => {
    const months = {
      'January': '01', 'February': '02', 'March': '03', 'April': '04',
      'May': '05', 'June': '06', 'July': '07', 'August': '08',
      'September': '09', 'October': '10', 'November': '11', 'December': '12'
    };
    return months[monthName] || '00';
  };

  const formatYmdToDmy = (ymd) => {
    try {
      if (!ymd) return '';
      const [y, m, d] = ymd.split('-');
      if (!y || !m || !d) return ymd;
      return `${d}/${m}/${y}`;
    } catch {
      return ymd;
    }
  };

  const parsePayPeriodToSortable = (payPeriod) => {
    // Expect "Month YYYY" -> "YYYY-MM"
    if (!payPeriod) return '0000-00';
    const parts = payPeriod.trim().split(/\s+/);
    if (parts.length < 2) return payPeriod;
    const month = getMonthNumber(parts[0]);
    const year = parts[1];
    return `${year}-${month}`;
  };

  // ====== SERVER LOAD ======
  const fetchSalaryFromServer = async (page, limit, search) => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit)
      });
      if (search && search.trim()) params.append('search', search.trim());

      const res = await fetch(`${API_BASE}/show-salaryslips.php?${params.toString()}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        credentials: 'omit'
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const json = await res.json();

      // Expect shape: { data: { salaryslips: [...] }, pagination: { total_pages, total_count, ... } }
      const rows = (json?.data?.salaryslips || []).map((r) => {
        const net = typeof r.net_salary === 'string' ? parseFloat(r.net_salary) : (r.net_salary || 0);
        const pdfFilename = r.salaryslip_pdf || r.pdf_filename || null;
        // Build URLs if backend didn’t send them
        const fallbackPdfUrl = pdfFilename ? `${SALARY_PUBLIC_BASE}/${encodeURIComponent(pdfFilename)}` : null;
        const fallbackPdfDownloadUrl = pdfFilename ? `${SALARY_DOWNLOAD}?file=${encodeURIComponent(pdfFilename)}` : null;

        return {
          id: r.id || r.slip_id || r.emp_id || String(Date.now()),
          employeeId: r.emp_id || '',
          employeeName: r.emp_name || '',
          designation: r.designation || '',
          department: r.department || '',
          joiningDate: r.joining_date_formatted || formatYmdToDmy(r.joining_date || ''),
          payPeriod: r.pay_period || '',
          paidDays: r.paid_days ?? '',
          lopDays: r.lop_days ?? '',
          payDate: r.pay_date_formatted || formatYmdToDmy(r.pay_date || ''),
          netSalary: isNaN(net) ? 0 : net,
          createdAt: r.created_at || '',
          // PDF info from backend or fallback
          pdfFilename,
          pdfUrl: r.pdf_url || fallbackPdfUrl,
          pdfDownloadUrl: r.pdf_download_url || fallbackPdfDownloadUrl
        };
      });

      setSalaryRecords(rows);
      setIsServerData(true);
      setServerTotalPages(json?.pagination?.total_pages || 0);
      setServerTotalCount(json?.pagination?.total_count || 0);
    } catch (e) {
      console.error('Failed to load salary slips from server:', e);
      // fallback to localStorage
      setIsServerData(false);
      loadSalaryFromStorage();
    }
  };

  // ====== LOCAL FALLBACK ======
  const loadSalaryFromStorage = () => {
    try {
      const savedStr = localStorage.getItem('salarySlips');
      if (!savedStr) {
        setSalaryRecords([]);
        return;
      }
      let saved = [];
      try {
        saved = JSON.parse(savedStr);
        if (!Array.isArray(saved)) {
          localStorage.removeItem('salarySlips');
          setSalaryRecords([]);
          return;
        }
      } catch {
        localStorage.removeItem('salarySlips');
        setSalaryRecords([]);
        return;
      }

      const mapped = saved.map((rec) => {
        const net = typeof rec.netSalary === 'string' ? parseFloat(rec.netSalary) : (rec.netSalary || 0);
        const pp = rec.payPeriod || (rec.month && rec.year ? `${rec.month} ${rec.year}` : '');
        const pdfFilename = rec.salaryslip_pdf || rec.pdfFilename || null;
        const fallbackPdfUrl = pdfFilename ? `${SALARY_PUBLIC_BASE}/${encodeURIComponent(pdfFilename)}` : null;
        const fallbackPdfDownloadUrl = pdfFilename ? `${SALARY_DOWNLOAD}?file=${encodeURIComponent(pdfFilename)}` : null;

        return {
          id: rec.id || String(Date.now()),
          employeeId: rec.employeeId || '',
          employeeName: rec.employeeName || '',
          designation: rec.designation || '',
          department: rec.department || '',
          joiningDate: rec.joiningDate ? formatYmdToDmy(rec.joiningDate) : '',
          payPeriod: pp,
          paidDays: rec.paidDays ?? '',
          lopDays: rec.lossOfPayDays ?? rec.lopDays ?? '',
          payDate: rec.payDate ? formatYmdToDmy(rec.payDate) : '',
          netSalary: isNaN(net) ? 0 : net,
          createdAt: rec.createdAt || '',
          pdfFilename,
          pdfUrl: rec.pdfUrl || fallbackPdfUrl,
          pdfDownloadUrl: rec.pdfDownloadUrl || fallbackPdfDownloadUrl
        };
      });

      // Sort newest first (by createdAt fallback)
      const sorted = mapped.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return 0;
      });

      setSalaryRecords(sorted);
    } catch (e) {
      console.error('Error reading salary slips from localStorage:', e);
      setSalaryRecords([]);
    }
  };

  // ====== EFFECTS ======
  useEffect(() => {
    fetchSalaryFromServer(currentPage, entriesPerPage, searchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, entriesPerPage, searchTerm]);

  // ====== SORTING (local-only; server already sorted) ======
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIndicator = (field) => {
    if (sortField !== field) return '↕';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const localFilteredAndSorted = !isServerData
    ? salaryRecords
        .filter(r => {
          const q = (searchTerm || '').toLowerCase();
          return (
            (r.employeeId || '').toLowerCase().includes(q) ||
            (r.employeeName || '').toLowerCase().includes(q) ||
            (r.payPeriod || '').toLowerCase().includes(q)
          );
        })
        .sort((a, b) => {
          let cmp = 0;
          if (sortField === 'employeeId') {
            cmp = (a.employeeId || '').localeCompare(b.employeeId || '');
          } else if (sortField === 'employeeName') {
            cmp = (a.employeeName || '').localeCompare(b.employeeName || '');
          } else if (sortField === 'payPeriod') {
            const aKey = parsePayPeriodToSortable(a.payPeriod);
            const bKey = parsePayPeriodToSortable(b.payPeriod);
            cmp = aKey.localeCompare(bKey);
          } else if (sortField === 'netSalary') {
            cmp = (parseFloat(a.netSalary || 0) - parseFloat(b.netSalary || 0));
          }
          return sortDirection === 'asc' ? cmp : -cmp;
        })
    : salaryRecords; // server already filtered/sorted/paginated

  // ====== PAGINATION (local-only) ======
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;

  const totalEntries = isServerData ? serverTotalCount : localFilteredAndSorted.length;
  const totalPages = isServerData ? serverTotalPages : Math.ceil(totalEntries / entriesPerPage);

  const visibleRecords = isServerData
    ? salaryRecords // server data already page-limited
    : localFilteredAndSorted.slice(indexOfFirst, indexOfLast);

  const handlePageChange = (pageNum) => {
    if (pageNum < 1) return;
    if (isServerData) {
      if (serverTotalPages && pageNum > serverTotalPages) return;
    } else {
      const localPages = Math.ceil((localFilteredAndSorted.length || 0) / entriesPerPage);
      if (pageNum > localPages) return;
    }
    setCurrentPage(pageNum);
  };

  // ====== ACTIONS ======
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this salary record?')) return;

    // Find the record to build a robust payload (prefer id; fallbacks provided)
    const rec = salaryRecords.find(r => String(r.id) === String(id));
    const payload =
      rec?.id ? { id: rec.id }
      : (rec?.employeeId && rec?.payPeriod) ? { emp_id: rec.employeeId, pay_period: rec.payPeriod }
      : rec?.pdfFilename ? { filename: rec.pdfFilename }
      : { id }; // final fallback

    try {
      const res = await fetch(SALARY_DELETE, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'omit',
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = data?.message || `Delete failed (${res.status})`;
        alert(msg);
        return;
      }

      // Remove from current list
      const updated = salaryRecords.filter(r => String(r.id) !== String(id));
      setSalaryRecords(updated);

      // Remove from localStorage if present
      try {
        const savedStr = localStorage.getItem('salarySlips');
        if (savedStr) {
          const saved = JSON.parse(savedStr);
          if (Array.isArray(saved)) {
            const updatedLocal = saved.filter(r => String(r.id) !== String(id));
            localStorage.setItem('salarySlips', JSON.stringify(updatedLocal));
          }
        }
      } catch {}

      alert('Salary slip deleted successfully.');
    } catch (err) {
      console.error('Delete error:', err);
      alert(err.message || 'Delete failed.');
    }
  };

  const openViewModal = (record) => {
    setSlipToView(record);
    setShowViewModal(true);
  };

  const openEmailModal = (record) => {
    setSlipToEmail(record);
    setEmailDetails({
      to: '', // fill if you store emails per employee
      subject: `Salary Slip - ${record.employeeName} (${record.payPeriod})`,
      message: `Dear ${record.employeeName},\n\nPlease find attached your salary slip for ${record.payPeriod}.\n\nNet Salary: ₹${Number(record.netSalary || 0).toFixed(2)}\n\nBest regards,\nInfopearl Tech Solutions Pvt Ltd`
    });
    setShowEmailModal(true);
  };

  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailDetails(prev => ({ ...prev, [name]: value }));
  };

  const sendEmail = () => {
    // No backend email endpoint provided; keep client-side confirmation like InvoiceList
    setShowEmailModal(false);
    setShowEmailSuccess(true);
    setTimeout(() => setShowEmailSuccess(false), 5000);
  };

  // Prefer proxy downloader; if fetch CORS blocks, try "anchor click" fallback.
  const downloadViaAnchor = (url) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    a.rel = 'noreferrer';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadPdfFromUrl = async (url, filename) => {
    try {
      const res = await fetch(url, { method: 'GET', credentials: 'omit' });
      if (!res.ok) throw new Error(`Download failed (${res.status})`);
      const blob = await res.blob();
      saveAs(blob, filename);
      return true;
    } catch (e) {
      console.error('PDF download error (fetch):', e);
      return false;
    }
  };

  const handleDownloadPDF = async (record) => {
    const invId = record.id || record.employeeId || `${record.employeeName}_${record.payPeriod}`.replace(/\s+/g, '_');
    setDownloadSlipId(invId);
    try {
      // 1) Prefer proxy downloader (download-salaryslips.php) — best for headers/filename
      if (record.pdfDownloadUrl) {
        // Try fetch+FileSaver
        const okFetch = await downloadPdfFromUrl(record.pdfDownloadUrl, `SalarySlip_${invId}.pdf`);
        if (!okFetch) {
          // Fallback to anchor navigation (lets browser handle download/cors)
          downloadViaAnchor(record.pdfDownloadUrl);
        }
        setShowDownloadSuccess(true);
        setTimeout(() => {
          setShowDownloadSuccess(false);
          setDownloadSlipId(null);
        }, 1500);
        return;
      }

      // 2) Fallback: direct public URL
      if (record.pdfUrl) {
        const ok = await downloadPdfFromUrl(record.pdfUrl, `SalarySlip_${invId}.pdf`);
        if (!ok) {
          downloadViaAnchor(record.pdfUrl);
        }
        setShowDownloadSuccess(true);
        setTimeout(() => {
          setShowDownloadSuccess(false);
          setDownloadSlipId(null);
        }, 1500);
        return;
      }

      alert('No server PDF found for this salary slip.');
      setDownloadSlipId(null);
    } catch (e) {
      console.error('Download error:', e);
      alert(e.message || 'Download failed.');
      setDownloadSlipId(null);
    }
  };

  const handleViewSlip = (record) => {
    openViewModal(record);
  };

  const handleRefresh = () => {
    fetchSalaryFromServer(currentPage, entriesPerPage, searchTerm);
  };

  // ====== RENDER ======
  return (
    <Container fluid className="mt-4">
      <h1 className="mb-4">Manage Salary Slips</h1>

      {/* Success alerts */}
      {showDownloadSuccess && (
        <Alert variant="success" className="d-flex justify-content-between align-items-center">
          <span>
            <strong>Success:</strong> Salary slip has been sent to your browser to download.
          </span>
          <Button
            variant="outline-success"
            size="sm"
            onClick={() => setShowDownloadSuccess(false)}
            className="ms-2"
          >
            <i className="bi bi-x-lg"></i>
          </Button>
        </Alert>
      )}

      {showEmailSuccess && (
        <Alert variant="success" className="d-flex justify-content-between align-items-center">
          <span>
            <strong>Success:</strong> Email has been sent{slipToEmail ? ` for ${slipToEmail.employeeName}` : ''}.
          </span>
          <Button
            variant="outline-success"
            size="sm"
            onClick={() => setShowEmailSuccess(false)}
            className="ms-2"
          >
            <i className="bi bi-x-lg"></i>
          </Button>
        </Alert>
      )}

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center h-100 border-0 shadow-sm text-white" style={{ background: 'linear-gradient(135deg, #051937, #004d7a)', borderColor: '#051937' }}>
            <div
              className="text-white rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '50px', height: '50px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              <i className="bi bi-file-earmark-text fs-4"></i>
            </div>
            <Card.Body className="d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Card.Title>Total Records</Card.Title>
              </div>
              <h2 className="mb-0">{totalEntries}</h2>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="text-center h-100 border-0 shadow-sm text-white" style={{ background: 'linear-gradient(135deg, #FBBC05, #EA4335)', borderColor: '#051937' }}>
            <div
              className="text-white rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '50px', height: '50px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              <i className="bi bi-calendar-check fs-4"></i>
            </div>
            <Card.Body className="d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Card.Title>Current Month</Card.Title>
              </div>
              {(() => {
                const today = new Date();
                const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
                const currentMonth = monthNames[today.getMonth()];
                return (
                  <h3 className="mb-0" style={{ color: 'white', fontWeight: 'bold' }}>{currentMonth}</h3>
                );
              })()}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="text-center h-100 border-0 shadow-sm text-white" style={{ background: 'linear-gradient(135deg, #34A853, #1E8E3E)', borderColor: '#051937' }}>
            <div
              className="text-white rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '50px', height: '50px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              <i className="bi bi-people fs-4"></i>
            </div>
            <Card.Body className="d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Card.Title>Total Employees</Card.Title>
              </div>
              <h2 className="mb-0">
                {new Set(salaryRecords.map(record => record.employeeId || '')).size}
              </h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main content - Salary Records */}
      <div className="bg-white rounded shadow-sm mb-4">
        <div className="p-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="mb-0">Salary Records</h3>
            <div className="d-flex">
              <Button variant="info" className="me-2" onClick={handleRefresh}>
                <i className="bi bi-arrow-clockwise me-1"></i> Refresh List
              </Button>
              <Link to="/admin/employee/createpage" className="btn btn-primary">
                <i className="bi bi-plus-lg me-2"></i>
                Create New Salary Slip
              </Link>
            </div>
          </div>

          <ShowEntries
            entriesPerPage={entriesPerPage}
            setEntriesPerPage={setEntriesPerPage}
            searchTerm={searchTerm}
            setSearchTerm={(v) => { setCurrentPage(1); setSearchTerm(v); }}
            totalEntries={totalEntries}
            searchPlaceholder="Search employee, ID, pay period..."
          />

          <Table hover responsive className="mt-3">
            <thead>
              <tr>
                <th onClick={() => handleSort('employeeId')} style={{ cursor: 'pointer' }}>
                  Employee ID {getSortIndicator('employeeId')}
                </th>
                <th onClick={() => handleSort('employeeName')} style={{ cursor: 'pointer' }}>
                  Employee Name {getSortIndicator('employeeName')}
                </th>
                <th onClick={() => handleSort('payPeriod')} style={{ cursor: 'pointer' }}>
                  Pay Period {getSortIndicator('payPeriod')}
                </th>
                <th onClick={() => handleSort('netSalary')} style={{ cursor: 'pointer' }}>
                  Net Salary {getSortIndicator('netSalary')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleRecords.length > 0 ? (
                visibleRecords.map(record => (
                  <tr key={record.id}>
                    <td>{record.employeeId}</td>
                    <td>{record.employeeName}</td>
                    <td>{record.payPeriod}</td>
                    <td>₹ {Number(record.netSalary || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>
                      <div className="d-flex">
                        <Button
                          variant="info"
                          size="sm"
                          className="me-1"
                          onClick={() => handleViewSlip(record)}
                          title="View details"
                        >
                          <i className="bi bi-eye"></i>
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          className="me-1"
                          onClick={() => handleDownloadPDF(record)}
                          disabled={downloadSlipId === (record.id || record.employeeId)}
                          title={record.pdfDownloadUrl || record.pdfUrl ? 'Download PDF' : 'No PDF on server'}
                        >
                          {downloadSlipId === (record.id || record.employeeId)
                            ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            : <i className="bi bi-download"></i>
                          }
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          className="me-1"
                          onClick={() => openEmailModal(record)}
                          title="Send email"
                        >
                          <i className="bi bi-envelope"></i>
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(record.id)}
                          title="Delete"
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    {searchTerm ? (
                      <div>
                        <i className="bi bi-search text-muted mb-2" style={{ fontSize: '2rem' }}></i>
                        <p className="mb-0">No matching records found</p>
                        <small className="text-muted">Try adjusting your search terms</small>
                      </div>
                    ) : (
                      <div>
                        <i className="bi bi-file-earmark-text text-muted mb-2" style={{ fontSize: '2rem' }}></i>
                        <p className="mb-0">No salary records found</p>
                        <small className="text-muted">Click "Create New Salary Slip" to add one</small>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div>
              {totalEntries > 0 ? (
                isServerData ? (
                  <span>
                    Showing {(serverTotalCount === 0) ? 0 : ((currentPage - 1) * entriesPerPage + 1)} to {Math.min(currentPage * entriesPerPage, serverTotalCount)} of {serverTotalCount} entries
                  </span>
                ) : (
                  <span>
                    Showing {Math.min(indexOfFirst + 1, localFilteredAndSorted.length)} to {Math.min(indexOfLast, localFilteredAndSorted.length)} of {localFilteredAndSorted.length} entries
                    {searchTerm && ` (filtered from ${salaryRecords.length} total entries)`}
                  </span>
                )
              ) : (
                <span>No entries to show</span>
              )}
            </div>

            {totalPages > 0 && (
              <div>
                <ul className="pagination mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <Button
                      variant="link"
                      className="page-link"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                  </li>

                  {[...Array(totalPages).keys()].map(number => (
                    <li
                      key={number + 1}
                      className={`page-item ${currentPage === number + 1 ? 'active' : ''}`}
                    >
                      <Button
                        variant="link"
                        className="page-link"
                        onClick={() => handlePageChange(number + 1)}
                      >
                        {number + 1}
                      </Button>
                    </li>
                  ))}

                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <Button
                      variant="link"
                      className="page-link"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || totalPages === 0}
                    >
                      Next
                    </Button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Salary Slip Details
            {slipToView && (
              <span className="text-muted fs-6"> — {slipToView.employeeName} ({slipToView.employeeId})</span>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {slipToView && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <h5>Employee</h5>
                  <p><strong>ID:</strong> {slipToView.employeeId}</p>
                  <p><strong>Name:</strong> {slipToView.employeeName}</p>
                  <p><strong>Designation:</strong> {slipToView.designation || '-'}</p>
                  <p><strong>Department:</strong> {slipToView.department || '-'}</p>
                  <p><strong>Joining Date:</strong> {slipToView.joiningDate || '-'}</p>
                </Col>
                <Col md={6}>
                  <h5>Pay Info</h5>
                  <p><strong>Pay Period:</strong> {slipToView.payPeriod || '-'}</p>
                  <p><strong>Paid Days:</strong> {slipToView.paidDays || '-'}</p>
                  <p><strong>LOP Days:</strong> {slipToView.lopDays || '-'}</p>
                  <p><strong>Pay Date:</strong> {slipToView.payDate || '-'}</p>
                  <p><strong>Net Salary:</strong> ₹{Number(slipToView.netSalary || 0).toFixed(2)}</p>
                </Col>
              </Row>
              {slipToView.pdfUrl && (
                <div className="mt-2">
                  <a href={slipToView.pdfUrl} target="_blank" rel="noreferrer">Open PDF</a>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
          <Button
            variant="success"
            onClick={() => {
              if (slipToView) handleDownloadPDF(slipToView);
              setShowViewModal(false);
            }}
          >
            {(slipToView?.pdfDownloadUrl || slipToView?.pdfUrl) ? 'Download PDF' : 'Download (No File)'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Email Modal */}
      <Modal show={showEmailModal} onHide={() => setShowEmailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Send Salary Slip Email
            {slipToEmail && (
              <span className="text-muted fs-6"> — {slipToEmail.employeeName} ({slipToEmail.employeeId})</span>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="mb-3">
              <label className="form-label">To:</label>
              <input
                type="email"
                name="to"
                className="form-control"
                value={emailDetails.to}
                onChange={handleEmailChange}
                placeholder="employee@example.com"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Subject:</label>
              <input
                type="text"
                name="subject"
                className="form-control"
                value={emailDetails.subject}
                onChange={handleEmailChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Message:</label>
              <textarea
                name="message"
                rows={6}
                className="form-control"
                value={emailDetails.message}
                onChange={handleEmailChange}
              />
            </div>
            <div className="mb-3 form-check">
              <input type="checkbox" className="form-check-input" checked readOnly id="attachPdfChk" />
              <label htmlFor="attachPdfChk" className="form-check-label">Attach salary slip as PDF</label>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEmailModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={sendEmail}>
            Send Email
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ManageSalary;
