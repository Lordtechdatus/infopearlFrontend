import React, { useState, useEffect } from 'react';
import { Container, Table, Row, Col, Form, Button, Pagination, Badge, Alert, Modal, Dropdown } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import ShowEntries from '../../components/ShowEntries';
import './InvoiceList.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../../styles/pagination.css';
import { saveAs } from 'file-saver';

// ====== CONFIG ======
const API_BASE = 'https://backend.infopearl.in'; // adjust if needed
const DELETE_ENDPOINTS = ['/invoice-delete.php']; // try both (name varies)

const InvoiceList = () => {
  // State for invoices, initially empty
  const [invoices, setInvoices] = useState([]);
  const [isServerData, setIsServerData] = useState(false);
  const [serverTotalPages, setServerTotalPages] = useState(0);
  const [serverTotalCount, setServerTotalCount] = useState(0);

  const location = useLocation();
  
  // xlsx-populate loading state
  const [xlsxLoaded, setXlsxLoaded] = useState(false);

  // load xlsx-populate dynamically
  useEffect(() => {
    if (!window.XlsxPopulate) {
      const loadJSZip = document.createElement('script');
      loadJSZip.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.7.1/jszip.min.js';
      loadJSZip.async = true;
      document.body.appendChild(loadJSZip);
      
      loadJSZip.onload = () => {
        const loadXlsxPopulate = document.createElement('script');
        loadXlsxPopulate.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx-populate/1.21.0/xlsx-populate.min.js';
        loadXlsxPopulate.async = true;
        loadXlsxPopulate.onload = () => setXlsxLoaded(true);
        document.body.appendChild(loadXlsxPopulate);
      };
    } else {
      setXlsxLoaded(true);
    }
    
    return () => {
      const scripts = document.querySelectorAll('script[src*="jszip"], script[src*="xlsx-populate"]');
      scripts.forEach(script => {
        if (script && script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
    };
  }, []);

  // ========= BACKEND LOADER =========
  const fetchInvoicesFromServer = async (page, limit, search, status = 'all') => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        status,
      });
      if (search && search.trim()) params.append('search', search.trim());

      const res = await fetch(`${API_BASE}/show-invoices.php?${params.toString()}`, {
        method: 'GET',
        credentials: 'omit',
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const json = await res.json();

      // expect { data: { invoices: [...] }, pagination: { current_page, total_pages, total_count, limit } }
      const serverInvoices = (json?.data?.invoices || []).map(row => {
        // Normalize to UI shape
        const toFloat = (v) => {
          const n = typeof v === 'string' ? parseFloat(v) : (v || 0);
          return isNaN(n) ? 0 : n;
        };

        const invoiceNumber = row.invoice_no || row.id || '';
        const issueDateFmt  = row.invoice_date_formatted || (row.invoice_date ? formatYmdToDmy(row.invoice_date) : '');
        const dueDateFmt    = row.due_date_formatted || (row.due_date ? formatYmdToDmy(row.due_date) : '');

        return {
          id: invoiceNumber || '',                 // UI id shows invoice number
          serverId: row.id ?? null,               // keep actual DB id separately for delete API
          invoiceNumber,                           // keep explicit
          customer: row.customer_name || 'Unknown Customer',
          email: '',                               // not provided by backend
          issueDate: issueDateFmt,
          dueDate: dueDateFmt,
          type: 'invoice',
          status: (row.status || 'open').toLowerCase(),
          amount: toFloat(row.total_amount),
          tax: 0,                                  // not provided by backend
          received: toFloat(row.received_amount),  // currently 0 unless you add it server-side
          pending: toFloat(row.pending_amount),
          createdAt: row.created_at || '',
          timestamp: Date.now(),                   // fallback
          // PDF links from backend
          pdfUrl: row.pdf_url || null,            // open/view URL
          pdfDownloadUrl: row.pdf_download_url || null, // proxy "force download" URL
          pdfFilename: row.pdf_filename || row.invoices_pdf || null
        };
      });

      setInvoices(serverInvoices);
      setIsServerData(true);
      setServerTotalPages(json?.pagination?.total_pages || 0);
      setServerTotalCount(json?.pagination?.total_count || 0);
    } catch (err) {
      console.error('Failed to load from backend:', err);
      // fallback to localStorage
      setIsServerData(false);
      loadInvoicesFromStorage();
    }
  };

  // ========= LOCALSTORAGE FALLBACK =========
  const loadInvoicesFromStorage = () => {
    try {
      setInvoices([]);
      const savedInvoicesString = localStorage.getItem('invoices');
      if (!savedInvoicesString) return;

      let savedInvoices = [];
      try {
        savedInvoices = JSON.parse(savedInvoicesString);
        if (!Array.isArray(savedInvoices)) {
          localStorage.removeItem('invoices');
          return;
        }
      } catch {
        localStorage.removeItem('invoices');
        return;
      }

      if (savedInvoices.length > 0) {
        const formattedInvoices = savedInvoices.map(invoice => {
          const formatDate = (dateStr) => {
            if (!dateStr) return '';
            try {
              const date = new Date(dateStr);
              return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
            } catch {
              return dateStr;
            }
          };

          const issueDate = invoice.invoiceDate ? formatDate(invoice.invoiceDate) : 
                            (invoice.createdAt ? formatDate(invoice.createdAt) : '');
          const dueDate   = invoice.dueDate ? formatDate(invoice.dueDate) : '';
          const normalizedStatus = (invoice.status || '').toLowerCase() || 'open';
          const amount = parseFloat(invoice.total || 0);
          const tax = invoice.tax ? parseFloat(invoice.tax) : 
                      (invoice.cgst ? parseFloat(invoice.cgst) + parseFloat(invoice.sgst || 0) : 0);
          const received = normalizedStatus === 'paid' ? amount : 0;
          const pending  = normalizedStatus === 'paid' ? 0 : amount;
          const customerName = invoice.customerInfo?.name || 'Unknown Customer';

          return {
            id: invoice.id || invoice.invoiceNumber || Date.now().toString(),
            serverId: null, // not available from local data
            invoiceNumber: invoice.invoiceNumber,
            customer: customerName,
            email: invoice.customerInfo?.email || '',
            issueDate,
            dueDate,
            type: (invoice.invoiceType || 'invoice').toLowerCase(),
            status: normalizedStatus,
            amount,
            tax,
            received,
            pending,
            createdAt: invoice.createdAt || '',
            timestamp: parseInt(invoice.id) || Date.now(),
            pdfUrl: invoice.pdfUrl || null,               // if you stored the server link when creating
            pdfDownloadUrl: invoice.pdfDownloadUrl || null, // if you stored proxy link locally
            items: invoice.items || [],
            subtotal: invoice.subtotal,
            cgst: invoice.cgst,
            sgst: invoice.sgst,
            total: invoice.total,
          };
        });

        const sortedInvoices = formattedInvoices.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          return b.timestamp - a.timestamp;
        });

        setInvoices(sortedInvoices);
      } else {
        setInvoices([]);
      }
    } catch (error) {
      console.error("Error loading invoices from localStorage:", error);
      setInvoices([]);
      alert("There was an error loading your invoices. Please check the console for details.");
    }
  };

  // ====== UI state ======
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCsvSuccess, setShowCsvSuccess] = useState(false);
  const [csvDownloadInfo, setCsvDownloadInfo] = useState({ type: '', period: '' });
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  
  const [downloadInvoiceId, setDownloadInvoiceId] = useState(null);
  const [showDownloadSuccess, setShowDownloadSuccess] = useState(false);

  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [invoiceToEmail, setInvoiceToEmail] = useState(null);
  const [emailDetails, setEmailDetails] = useState({ to: '', subject: '', message: '' });
  const [showEmailSuccess, setShowEmailSuccess] = useState(false);
  
  const [showViewModal, setShowViewModal] = useState(false);
  const [invoiceToView, setInvoiceToView] = useState(null);

  // ====== LOAD DATA ======
  useEffect(() => {
    // Try server first
    fetchInvoicesFromServer(currentPage, entriesPerPage, searchTerm, 'all');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, entriesPerPage, searchTerm]);

  useEffect(() => {
    // When navigating back to this page, refresh from server
    fetchInvoicesFromServer(currentPage, entriesPerPage, searchTerm, 'all');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  // ====== PAGINATION HELPERS ======
  const totalEntries = isServerData ? serverTotalCount : invoices.length;
  const totalPages = isServerData ? serverTotalPages : Math.ceil(totalEntries / entriesPerPage);

  const indexOfLastInvoice = currentPage * entriesPerPage;
  const indexOfFirstInvoice = indexOfLastInvoice - entriesPerPage;

  // ====== FILTER (local only) ======
  const localFilteredInvoices = !isServerData ? invoices.filter(invoice => 
    (invoice.customer || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (invoice.invoiceNumber || invoice.id || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    (invoice.status || '').toLowerCase().includes(searchTerm.toLowerCase())
  ) : invoices;

  const visibleInvoices = isServerData
    ? invoices // server already applied search + pagination
    : localFilteredInvoices.slice(indexOfFirstInvoice, indexOfLastInvoice);

  // ====== SUMMARY TOTALS (over visible set) ======
  const calculateTotals = () => {
    let totalAmount = 0;
    let totalReceived = 0;
    let totalPending = 0;
    (isServerData ? invoices : localFilteredInvoices).forEach(invoice => {
      totalAmount += parseFloat(invoice.amount || 0);
      totalReceived += parseFloat(invoice.received || 0);
      totalPending += parseFloat(invoice.pending || 0);
    });
    return {
      totalAmount: totalAmount.toFixed(2),
      totalReceived: totalReceived.toFixed(2),
      totalPending: totalPending.toFixed(2)
    };
  };
  const totals = calculateTotals();

  // ====== DATE/CSV HELPERS ======
  const parseDate = (dateStr) => {
    if (!dateStr) return new Date('Invalid');
    const [day, month, year] = dateStr.split('/');
    return new Date(year, month - 1, day);
  };
  const getYearMonth = (dateStr) => {
    const date = parseDate(dateStr);
    if (isNaN(date)) return '0000-00';
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };
  const formatMoney = (amount) => `${parseFloat(amount || 0).toFixed(2)}`;
  const formatMonthDisplay = (yearMonth) => {
    const [year, month] = yearMonth.split('-');
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };
  const formatYmdToDmy = (ymd) => {
    try {
      const [y,m,d] = ymd.split('-');
      return `${d}/${m}/${y}`;
    } catch {
      return ymd;
    }
  };

  const getInvoiceMonths = () => {
    // Based on currently loaded invoices (page-only for server data)
    const months = new Set();
    invoices.forEach(inv => {
      if (inv.issueDate) months.add(getYearMonth(inv.issueDate));
    });
    return Array.from(months).sort().reverse();
  };
  const getInvoicesForMonth = (yearMonth) => {
    return invoices.filter(inv => getYearMonth(inv.issueDate) === yearMonth);
  };
  const availableMonths = getInvoiceMonths();

  // ====== STATUS BADGE ======
  const getStatusBadge = (status) => {
    switch(status) {
      case 'paid':
        return <Badge bg="success">paid</Badge>;
      case 'open':
        return <Badge bg="info">open</Badge>;
      case 'overdue':
        return <Badge bg="danger">overdue</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  // ====== CSV DOWNLOADS ======
  const downloadMonthlyCSV = (yearMonth) => {
    const monthlyInvoices = getInvoicesForMonth(yearMonth);
    const monthName = formatMonthDisplay(yearMonth);
    let csvContent = "Invoice,Customer,Email,Issue Date,Due Date,Total Amount,Received Amount,Pending Amount,Type,Status\n";
    monthlyInvoices.forEach(inv => {
      csvContent += `${inv.invoiceNumber || inv.id},${inv.customer},${inv.email || ''},${inv.issueDate},${inv.dueDate},${formatMoney(inv.amount)},${formatMoney(inv.received)},${formatMoney(inv.pending)},${inv.type},${inv.status}\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices-${yearMonth}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setCsvDownloadInfo({ type: 'monthly', period: monthName });
    setShowCsvSuccess(true);
    setTimeout(() => setShowCsvSuccess(false), 5000);
  };

  const downloadAllTimeCSV = () => {
    let csvContent = "Invoice,Customer,Email,Issue Date,Due Date,Total Amount,Received Amount,Pending Amount,Type,Status\n";
    invoices.forEach(inv => {
      csvContent += `${inv.invoiceNumber || inv.id},${inv.customer},${inv.email || ''},${inv.issueDate},${inv.dueDate},${formatMoney(inv.amount)},${formatMoney(inv.received)},${formatMoney(inv.pending)},${inv.type},${inv.status}\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'all-invoices.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setCsvDownloadInfo({ type: 'all-time', period: 'All Time' });
    setShowCsvSuccess(true);
    setTimeout(() => setShowCsvSuccess(false), 5000);
  };

  // ====== PDF DOWNLOAD (SERVER) + XLSX FALLBACK ======
  const downloadPdfFromUrl = async (url, filename) => {
    try {
      const res = await fetch(url, { method: 'GET', credentials: 'omit' });
      if (!res.ok) throw new Error(`Download failed (${res.status})`);
      const blob = await res.blob();
      saveAs(blob, filename);
      return true;
    } catch (e) {
      console.error('PDF download error:', e);
      return false;
    }
  };

  // older local xlsx fallback expects a full invoice record from localStorage
  const generateAndDownloadExcel = (invoiceToDownload) => {
    try {
      // Minimal protection
      if (!window.XlsxPopulate || typeof window.XlsxPopulate.Workbook !== 'function') {
        throw new Error("Excel generation library not properly loaded. Please refresh the page and try again.");
      }

      let excelData = [
        [{ value: "Invoice Details", fontWeight: 'bold', fontSize: 14, span: 3 }, null, null],
        [
          { value: "Invoice #:", fontWeight: 'bold' },
          { value: invoiceToDownload.invoiceNumber || invoiceToDownload.id, align: 'left' },
          { value: "Date:", fontWeight: 'bold' },
          { value: invoiceToDownload.invoiceDate || new Date().toLocaleDateString(), align: 'left' }
        ],
        [
          { value: "Customer:", fontWeight: 'bold' },
          { value: invoiceToDownload.customerInfo?.name || invoiceToDownload.customer || 'Unknown Customer', align: 'left' },
          { value: "Due Date:", fontWeight: 'bold' },
          { value: invoiceToDownload.dueDate || '', align: 'left' }
        ],
        [
          { value: "Email:", fontWeight: 'bold' },
          { value: invoiceToDownload.customerInfo?.email || invoiceToDownload.email || '', align: 'left' },
          { value: "Status:", fontWeight: 'bold' },
          { value: (invoiceToDownload.status || 'Open'), align: 'left' }
        ],
        [],
        [
          { value: "Description", fontWeight: 'bold', backgroundColor: '#ECECEC' },
          { value: "Quantity", fontWeight: 'bold', backgroundColor: '#ECECEC', align: 'center' },
          { value: "Price (₹)", fontWeight: 'bold', backgroundColor: '#ECECEC', align: 'right' },
          { value: "Amount (₹)", fontWeight: 'bold', backgroundColor: '#ECECEC', align: 'right' }
        ]
      ];

      if (invoiceToDownload.items && invoiceToDownload.items.length > 0) {
        invoiceToDownload.items.forEach(item => {
          excelData.push([
            { value: item.description || 'Item' },
            { value: item.quantity || 1, align: 'center' },
            { value: item.price || 0, align: 'right' },
            { value: item.amount || 0, align: 'right' }
          ]);
        });
      } else {
        excelData.push([
          { value: "No items" }, { value: "", align: 'center' }, { value: "", align: 'right' }, { value: "", align: 'right' }
        ]);
      }

      excelData.push([]);
      excelData.push([{ value: "" }, { value: "" }, { value: "Subtotal:", fontWeight: 'bold', align: 'right' }, { value: invoiceToDownload.subtotal || '0.00', align: 'right' }]);
      excelData.push([{ value: "" }, { value: "" }, { value: "CGST (9%):", fontWeight: 'bold', align: 'right' }, { value: invoiceToDownload.cgst || '0.00', align: 'right' }]);
      excelData.push([{ value: "" }, { value: "" }, { value: "SGST (9%):", fontWeight: 'bold', align: 'right' }, { value: invoiceToDownload.sgst || '0.00', align: 'right' }]);
      excelData.push([{ value: "" }, { value: "" }, { value: "Total:", fontWeight: 'bold', align: 'right', backgroundColor: '#ECECEC' }, { value: invoiceToDownload.total || '0.00', align: 'right', backgroundColor: '#ECECEC', fontWeight: 'bold' }]);

      const columns = [{ width: 40 }, { width: 10 }, { width: 15 }, { width: 15 }];

      const workbook = window.XlsxPopulate.Workbook.create();
      const sheet = workbook.sheet(0);
      workbook.sheet(0).name(`Invoice_${invoiceToDownload.invoiceNumber || invoiceToDownload.id}`);

      excelData.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (cell !== null) {
            const xlsxCell = sheet.cell(rowIndex + 1, colIndex + 1);
            xlsxCell.value(cell.value);
            if (cell.fontWeight === 'bold') xlsxCell.style('bold', true);
            if (cell.fontSize) xlsxCell.style('fontSize', cell.fontSize);
            if (cell.align === 'right') xlsxCell.style('horizontalAlignment', 'right');
            else if (cell.align === 'center') xlsxCell.style('horizontalAlignment', 'center');
            else if (cell.align === 'left') xlsxCell.style('horizontalAlignment', 'left');
            if (cell.backgroundColor) xlsxCell.style('fill', cell.backgroundColor);
            if (cell.span && cell.span > 1) {
              sheet.range(rowIndex + 1, colIndex + 1, rowIndex + 1, colIndex + cell.span).merged(true);
            }
          }
        });
      });

      columns.forEach((column, index) => {
        if (column.width) sheet.column(index + 1).width(column.width);
      });

      workbook.outputAsync()
        .then(blob => {
          saveAs(blob, `Invoice_${invoiceToDownload.invoiceNumber || invoiceToDownload.id}.xlsx`);
          setShowDownloadSuccess(true);
          setTimeout(() => {
            setShowDownloadSuccess(false);
            setDownloadInvoiceId(null);
          }, 3000);
        })
        .catch(error => {
          console.error("Error generating Excel:", error);
          alert(`Error generating Excel: ${error.message}`);
          setDownloadInvoiceId(null);
        });
    } catch (error) {
      console.error("Error in generateAndDownloadExcel:", error);
      alert(`Error generating Excel: ${error.message}`);
      setDownloadInvoiceId(null);
    }
  };

  // Unified handler: prefer server proxy PDF, then direct PDF; fallback to local XLSX
  const handleDownloadInvoice = async (invoice) => {
    const invId = invoice.invoiceNumber || invoice.id;
    setDownloadInvoiceId(invId);
    try {
      // 1) Try proxy downloader (download-invoice.php) — best for CORS/headers
      if (invoice.pdfDownloadUrl) {
        const ok = await downloadPdfFromUrl(invoice.pdfDownloadUrl, `Invoice_${invId}.pdf`);
        if (ok) {
          setShowDownloadSuccess(true);
          setTimeout(() => {
            setShowDownloadSuccess(false);
            setDownloadInvoiceId(null);
          }, 3000);
          return;
        }
      }

      // 2) Fallback: try public direct file URL
      if (invoice.pdfUrl) {
        const ok = await downloadPdfFromUrl(invoice.pdfUrl, `Invoice_${invId}.pdf`);
        if (ok) {
          setShowDownloadSuccess(true);
          setTimeout(() => {
            setShowDownloadSuccess(false);
            setDownloadInvoiceId(null);
          }, 3000);
          return;
        }
      }

      // 3) Last resort: try to find detailed invoice from localStorage to generate XLSX
      const savedStr = localStorage.getItem('invoices');
      const saved = savedStr ? JSON.parse(savedStr) : [];
      const match = saved.find(inv =>
        inv.invoiceNumber === invoice.invoiceNumber ||
        inv.invoiceNumber === invoice.id ||
        inv.id === invoice.invoiceNumber ||
        inv.id === invoice.id
      );

      if (match) {
        generateAndDownloadExcel(match);
      } else {
        alert('No server PDF found for this invoice and no detailed data in your browser to generate Excel.');
        setDownloadInvoiceId(null);
      }
    } catch (e) {
      console.error('Download error:', e);
      alert(e.message || 'Download failed.');
      setDownloadInvoiceId(null);
    }
  };

  // Delete confirmation modal
  const confirmDelete = (invoice) => {
    setInvoiceToDelete(invoice);
    setShowDeleteModal(true);
  };

  // Delete invoice: prefer server delete; fallback to local-only when not server data
  const deleteInvoice = async () => {
    if (!invoiceToDelete) return;

    try {
      if (isServerData) {
        // Prepare payload: prefer server numeric id; else invoice_no
        const payload = invoiceToDelete.serverId
          ? { id: invoiceToDelete.serverId }
          : { invoice_no: invoiceToDelete.invoiceNumber || invoiceToDelete.id };

        let lastError = null;
        let success = false;

        // Try known endpoints (naming may vary)
        for (const ep of DELETE_ENDPOINTS) {
          try {
            const res = await fetch(`${API_BASE}${ep}`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              credentials: 'omit',
              body: JSON.stringify(payload)
            });

            const maybeJson = await res.json().catch(() => null);

            if (res.ok && maybeJson?.status === 'success') {
              success = true;
              // Remove from UI
              const updated = invoices.filter(inv => 
                (inv.invoiceNumber || inv.id) !== (invoiceToDelete.invoiceNumber || invoiceToDelete.id)
              );
              setInvoices(updated);
              setDeleteMessage(`Invoice #${invoiceToDelete.invoiceNumber || invoiceToDelete.id} deleted successfully.`);
              setShowDeleteSuccess(true);
              setTimeout(() => setShowDeleteSuccess(false), 4000);
              break;
            } else {
              lastError = new Error(maybeJson?.message || `Delete failed (${res.status})`);
            }
          } catch (e) {
            lastError = e;
          }
        }

        if (!success) {
          throw lastError || new Error('Delete failed.');
        }
      } else {
        // Local-only delete (no server data)
        const updatedInvoices = invoices.filter(inv => 
          (inv.invoiceNumber || inv.id) !== (invoiceToDelete.invoiceNumber || invoiceToDelete.id)
        );
        setInvoices(updatedInvoices);
        // Also clean from localStorage if present
        const savedInvoicesString = localStorage.getItem('invoices');
        if (savedInvoicesString) {
          try {
            const savedInvoices = JSON.parse(savedInvoicesString);
            if (Array.isArray(savedInvoices)) {
              const strictUpdated = savedInvoices.filter(inv => 
                String(inv.invoiceNumber) !== String(invoiceToDelete.invoiceNumber || invoiceToDelete.id) &&
                String(inv.id) !== String(invoiceToDelete.invoiceNumber || invoiceToDelete.id)
              );
              localStorage.setItem('invoices', JSON.stringify(strictUpdated));
            }
          } catch {}
        }
        setDeleteMessage(`Invoice #${invoiceToDelete.invoiceNumber || invoiceToDelete.id} deleted (local).`);
        setShowDeleteSuccess(true);
        setTimeout(() => setShowDeleteSuccess(false), 4000);
      }
    } catch (error) {
      console.error("Error deleting invoice:", error);
      alert(error?.message || "There was an error deleting the invoice. Please try again.");
    } finally {
      setShowDeleteModal(false);
      setInvoiceToDelete(null);
    }
  };

  // Email modal
  const openEmailModal = (invoice) => {
    setInvoiceToEmail(invoice);
    setEmailDetails({
      to: invoice.email || '',
      subject: `Invoice #${invoice.invoiceNumber || invoice.id} from Your Company`,
      message: `Dear ${invoice.customer},\n\nPlease find attached invoice #${invoice.invoiceNumber || invoice.id} due on ${invoice.dueDate}.\n\nInvoice Amount: ${formatMoney(invoice.amount)}\nAmount Received: ${formatMoney(invoice.received)}\nAmount Pending: ${formatMoney(invoice.pending)}\n\nThank you for your business.\n\nBest regards,\nYour Company`
    });
    setShowEmailModal(true);
  };

  const openViewModal = (invoice) => {
    setInvoiceToView(invoice);
    setShowViewModal(true);
  };

  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailDetails(prev => ({ ...prev, [name]: value }));
  };

  const sendEmail = () => {
    console.log('Sending email:', emailDetails);
    setShowEmailModal(false);
    setShowEmailSuccess(true);
    setTimeout(() => setShowEmailSuccess(false), 5000);
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1) return;
    if (isServerData) {
      if (serverTotalPages && pageNumber > serverTotalPages) return;
    } else {
      const localTotalPages = Math.ceil((localFilteredInvoices.length || 0) / entriesPerPage);
      if (pageNumber > localTotalPages) return;
    }
    setCurrentPage(pageNumber);
  };

  // Refresh button -> re-hit backend
  const handleRefresh = () => {
    fetchInvoicesFromServer(currentPage, entriesPerPage, searchTerm, 'all');
  };

  // Reset localStorage helper
  const resetAllInvoiceData = () => {
    try {
      const savedInvoicesString = localStorage.getItem('invoices');
      const countMessage = savedInvoicesString 
        ? `Currently there are ${JSON.parse(savedInvoicesString).length} invoices in localStorage.` 
        : "There are no invoices in localStorage.";
      const sizeMessage = savedInvoicesString
        ? `Storage size: ${Math.round(savedInvoicesString.length / 1024 * 100) / 100} KB` 
        : "";
      if (window.confirm(`${countMessage} ${sizeMessage}\n\nAre you sure you want to reset ALL invoice data in your browser? This cannot be undone.`)) {
        localStorage.removeItem('invoices');
        if (!isServerData) setInvoices([]);
        alert("All local invoice data has been reset.");
      }
    } catch (error) {
      console.error("Error checking localStorage:", error);
      if (window.confirm("Error checking localStorage. Would you like to reset all data anyway?")) {
        localStorage.removeItem('invoices');
        if (!isServerData) setInvoices([]);
        alert("All local invoice data has been reset.");
      }
    }
  };

  return (
    <Container fluid>
      <h1 className="mb-4">Invoice List</h1>

      {showDeleteSuccess && (
        <Alert variant="success" className="d-flex justify-content-between align-items-center">
          <span><strong>Success:</strong> {deleteMessage}</span>
          <Button 
            variant="outline-success" 
            size="sm" 
            onClick={() => setShowDeleteSuccess(false)}
            className="ms-2"
          >
            <i className="bi bi-x-lg"></i>
          </Button>
        </Alert>
      )}
      
      {showCsvSuccess && (
        <Alert variant="success" className="d-flex justify-content-between align-items-center csv-success-alert">
          <span>
            <strong>Success:</strong> {csvDownloadInfo.type === 'monthly' ? 
              `CSV for ${csvDownloadInfo.period} has been downloaded to your device.` : 
              'All invoice data has been downloaded to your device.'
            }
          </span>
          <Button 
            variant="outline-success" 
            size="sm" 
            onClick={() => setShowCsvSuccess(false)}
            className="ms-2"
          >
            <i className="bi bi-x-lg"></i>
          </Button>
        </Alert>
      )}
      
      {showDownloadSuccess && (
        <Alert variant="success" className="d-flex justify-content-between align-items-center">
          <span>
            <strong>Success:</strong> Invoice #{downloadInvoiceId} has been downloaded to your device.
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
            <strong>Success:</strong> Email has been sent to {invoiceToEmail?.customer} ({invoiceToEmail?.email || 'N/A'}).
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
      
      <div className="bg-light p-4 mb-4">
        <h3>Manage Invoices</h3>
        
        <Row className="mt-3">
          <Col md={4}>
            <div className="card bg-primary text-white" style={{ background: 'linear-gradient(135deg, #051937, #004d7a)', borderColor: '#051937' }}>
              <div className="card-body">
                <h5 className="card-title">Total Amount</h5>
                <h3 className="mb-0" style={{ color: 'black'}}>₹{totals.totalAmount}</h3>
              </div>
            </div>
          </Col>
          <Col md={4}>
            <div className="card bg-success text-white">
              <div className="card-body">
                <h5 className="card-title">Received Amount</h5>
                <h3 className="mb-0" style={{ color: 'black'}}>₹{totals.totalReceived}</h3>
              </div>
            </div>
          </Col>
          <Col md={4}>
            <div className="card bg-warning text-dark">
              <div className="card-body">
                <h5 className="card-title">Pending Amount</h5>
                <h3 className="mb-0" style={{ color: 'black'}}>₹{totals.totalPending}</h3>
              </div>
            </div>
          </Col>
        </Row>
      </div>
      
      <div className="mb-4">
        {/* Action buttons and controls */}
        <div className="mb-3 text-end">
          <Button 
            variant="info" 
            className="me-2"
            onClick={handleRefresh}
          >
            <i className="bi bi-arrow-clockwise me-1"></i> Refresh List
          </Button>
          
          <Dropdown className="d-inline-block me-2 monthly-dropdown">
            <Dropdown.Toggle variant="success" id="dropdown-monthly-csv" className="download-btn">
              <i className="bi bi-download me-1"></i> Download Monthly
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {availableMonths.map(month => (
                <Dropdown.Item 
                  key={month} 
                  onClick={() => downloadMonthlyCSV(month)}
                >
                  {formatMonthDisplay(month)}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          
          <Button 
            variant="primary" 
            className="me-2 download-btn"
            onClick={downloadAllTimeCSV}
          >
            <i className="bi bi-download me-1"></i> Download All Time
          </Button>
          
          <Button 
            variant="danger" 
            className="reset-btn"
            onClick={resetAllInvoiceData}
            size="sm"
          >
            <i className="bi bi-trash me-1"></i> Reset Local Data
          </Button>
        </div>

        <ShowEntries
          entriesPerPage={entriesPerPage}
          setEntriesPerPage={setEntriesPerPage}
          searchTerm={searchTerm}
          setSearchTerm={(v) => { setCurrentPage(1); setSearchTerm(v); }}
          totalEntries={totalEntries}
          searchPlaceholder="Search by invoice #, customer, date..."
        />
        
        <Table hover responsive>
          <thead>
            <tr>
              <th>Invoice <i className="bi bi-arrow-down-up"></i></th>
              <th>Customer <i className="bi bi-arrow-down-up"></i></th>
              <th>Issue Date <i className="bi bi-arrow-down-up"></i></th>
              <th>Due Date <i className="bi bi-arrow-down-up"></i></th>
              <th>Total Amount <i className="bi bi-arrow-down-up"></i></th>
              <th>Received <i className="bi bi-arrow-down-up"></i></th>
              <th>Pending <i className="bi bi-arrow-down-up"></i></th>
              <th>Status <i className="bi bi-arrow-down-up"></i></th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleInvoices.map(invoice => (
              <tr key={`${invoice.invoiceNumber || invoice.id}-${invoice.customer}`}>
                <td>{invoice.invoiceNumber || invoice.id}</td>
                <td>{invoice.customer}</td>
                <td>{invoice.issueDate}</td>
                <td>{invoice.dueDate}</td>
                <td className="text-end">{formatMoney(invoice.amount)}</td>
                <td className="text-end text-success">{formatMoney(invoice.received)}</td>
                <td className="text-end text-warning">{formatMoney(invoice.pending)}</td>
                <td>{getStatusBadge(invoice.status)}</td>
                <td>
                  <div className="d-flex">
                    <Button
                      variant="info"
                      size="sm"
                      className="me-1"
                      onClick={() => openViewModal(invoice)}
                    >
                      <i className="bi bi-eye"></i>
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="me-1"
                      onClick={() => openEmailModal(invoice)}
                    >
                      <i className="bi bi-envelope"></i>
                    </Button>
                    <Button
                      variant="success"
                      size="sm"
                      className="me-1"
                      onClick={() => handleDownloadInvoice(invoice)}
                      disabled={downloadInvoiceId === (invoice.invoiceNumber || invoice.id)}
                      title={invoice.pdfDownloadUrl || invoice.pdfUrl ? 'Download PDF' : 'Generate Excel'}
                    >
                      {downloadInvoiceId === (invoice.invoiceNumber || invoice.id) ? 
                        <span className="spinner-border spinner-border-sm download-spinner" role="status" aria-hidden="true"></span> : 
                        <i className="bi bi-download"></i>
                      }
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => confirmDelete(invoice)}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {visibleInvoices.length === 0 && (
              <tr>
                <td colSpan="9" className="text-center">No matching records found</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="fw-bold">
              <td colSpan="4" className="text-end">Totals:</td>
              <td className="text-end">₹{totals.totalAmount}</td>
              <td className="text-end text-success">₹{totals.totalReceived}</td>
              <td className="text-end text-warning">₹{totals.totalPending}</td>
              <td colSpan="2"></td>
            </tr>
          </tfoot>
        </Table>
        
        <div className="d-flex justify-content-between align-items-center">
          <div>
            {isServerData ? (
              <>
                Showing {(serverTotalCount === 0) ? 0 : ((currentPage - 1) * entriesPerPage + 1)} to {Math.min(currentPage * entriesPerPage, serverTotalCount)} of {serverTotalCount} entries
              </>
            ) : (
              <>
                Showing {Math.min(indexOfFirstInvoice + 1, localFilteredInvoices.length)} to {Math.min(indexOfLastInvoice, localFilteredInvoices.length)} of {localFilteredInvoices.length} entries
                {searchTerm && ` (filtered from ${invoices.length} total entries)`}
              </>
            )}
          </div>
          
          <Pagination>
            <Pagination.Item 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="me-1"
            >
              Previous
            </Pagination.Item>
            
            {[...Array(totalPages).keys()].map(number => (
              <Pagination.Item
                key={number + 1}
                active={number + 1 === currentPage}
                onClick={() => handlePageChange(number + 1)}
                className="me-1"
              >
                {number + 1}
              </Pagination.Item>
            ))}
            
            <Pagination.Item 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
            </Pagination.Item>
          </Pagination>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {invoiceToDelete && (
            <p>
              Are you sure you want to delete Invoice #{invoiceToDelete.invoiceNumber || invoiceToDelete.id} for {invoiceToDelete.customer}?
              <br />
              <br />
              <strong>This action cannot be undone.</strong>
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={deleteInvoice}>
            Delete Invoice
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Email Modal */}
      <Modal show={showEmailModal} onHide={() => setShowEmailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Send Invoice Email
            {invoiceToEmail && (
              <span className="text-muted fs-6"> - Invoice #{invoiceToEmail.invoiceNumber || invoiceToEmail.id} for {invoiceToEmail.customer}</span>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>To:</Form.Label>
              <Form.Control
                type="email"
                name="to"
                value={emailDetails.to}
                onChange={handleEmailChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Subject:</Form.Label>
              <Form.Control
                type="text"
                name="subject"
                value={emailDetails.subject}
                onChange={handleEmailChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Message:</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                name="message"
                value={emailDetails.message}
                onChange={handleEmailChange}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Attach invoice as PDF"
                checked={true}
                readOnly
              />
            </Form.Group>
          </Form>
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
      
      {/* View Invoice Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header >
          <Modal.Title>
            Invoice Details
            {invoiceToView && (
              <span className="text-muted fs-6"> - Invoice #{invoiceToView.invoiceNumber || invoiceToView.id} for {invoiceToView.customer}</span>
            )}
          </Modal.Title>
          <Button onClick={() => setShowViewModal(false)} className="X-button">X</Button>
        </Modal.Header>
        <Modal.Body>
          {invoiceToView && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <h5>Customer Information</h5>
                  <p><strong>Name:</strong> {invoiceToView.customer}</p>
                  <p><strong>Email:</strong> {invoiceToView.email || 'N/A'}</p>
                </Col>
                <Col md={6}>
                  <h5>Invoice Information</h5>
                  <p><strong>Invoice #:</strong> {invoiceToView.invoiceNumber || invoiceToView.id}</p>
                  <p><strong>Issue Date:</strong> {invoiceToView.issueDate}</p>
                  <p><strong>Due Date:</strong> {invoiceToView.dueDate}</p>
                  <p><strong>Status:</strong> {getStatusBadge(invoiceToView.status)}</p>
                </Col>
              </Row>
              <hr />
              <h5>Financial Details</h5>
              <Table striped bordered>
                <thead>
                  <tr>
                    <th>Total Amount</th>
                    <th>Received Amount</th>
                    <th>Pending Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>₹{formatMoney(invoiceToView.amount)}</td>
                    <td className="text-success">₹{formatMoney(invoiceToView.received)}</td>
                    <td className="text-warning">₹{formatMoney(invoiceToView.pending)}</td>
                  </tr>
                </tbody>
              </Table>
              {invoiceToView.pdfUrl && (
                <div className="mt-2">
                  <a href={invoiceToView.pdfUrl} target="_blank" rel="noreferrer">Open PDF</a>
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
              handleDownloadInvoice(invoiceToView);
              setShowViewModal(false);
            }}
          >
            {(invoiceToView?.pdfDownloadUrl || invoiceToView?.pdfUrl) ? 'Download PDF' : 'Download (Excel)'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default InvoiceList;

// ===== helper (top-level scope for mapping) =====
function formatYmdToDmy(ymd) {
  try {
    const [y, m, d] = ymd.split('-');
    return `${d}/${m}/${y}`;
  } catch {
    return ymd;
  }
}
