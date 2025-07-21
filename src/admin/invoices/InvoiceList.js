import React, { useState, useEffect } from 'react';
import { Container, Table, Row, Col, Form, Button, InputGroup, Pagination, Badge, Alert, Modal, Dropdown } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import ShowEntries from '../../components/ShowEntries';
import './InvoiceList.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../../styles/pagination.css';

// Add saveAs for file saving
import { saveAs } from 'file-saver';

const InvoiceList = () => {
  // State for invoices, initially empty
  const [invoices, setInvoices] = useState([]);
  const location = useLocation();
  
  // State for tracking if xlsx-populate library is loaded
  const [xlsxLoaded, setXlsxLoaded] = useState(false);

  // Function to load the xlsx-populate library dynamically
  useEffect(() => {
    if (!window.XlsxPopulate) {
      // Create script elements for dependencies
      const loadJSZip = document.createElement('script');
      loadJSZip.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.7.1/jszip.min.js';
      loadJSZip.async = true;
      document.body.appendChild(loadJSZip);
      
      // Load xlsx-populate after JSZip
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
    
    // Cleanup function to remove scripts on unmount
    return () => {
      const scripts = document.querySelectorAll('script[src*="jszip"], script[src*="xlsx-populate"]');
      scripts.forEach(script => {
        if (script && script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
    };
  }, []);

  // Function to load invoices from localStorage
  const loadInvoicesFromStorage = () => {
    try {
      // First, clear any existing invoices to avoid duplicates
      setInvoices([]);
      
      const savedInvoicesString = localStorage.getItem('invoices');
      console.log("Raw invoices from localStorage:", savedInvoicesString);
      
      if (!savedInvoicesString) {
        console.log("No invoices found in localStorage");
        // No need to set mock data - stay with empty array
        return;
      }
      
      let savedInvoices;
      try {
        savedInvoices = JSON.parse(savedInvoicesString);
        // Validate that it's an array
        if (!Array.isArray(savedInvoices)) {
          console.error("Retrieved invoices is not an array:", savedInvoices);
          // Clear invalid data
          localStorage.removeItem('invoices');
          return;
        }
      } catch (parseError) {
        console.error("Failed to parse invoices JSON:", parseError);
        // Clear corrupted data
        localStorage.removeItem('invoices');
        return;
      }
      
      console.log("Number of invoices found:", savedInvoices.length);
      
      // Log each invoice ID and number for debugging
      savedInvoices.forEach((invoice, index) => {
        console.log(`Invoice ${index + 1}: ID=${invoice.id}, Number=${invoice.invoiceNumber}, Customer=${invoice.customerInfo?.name || 'Unknown'}`);
      });
      
      // If there are saved invoices, use them
      if (savedInvoices.length > 0) {
        // Transform the saved invoices to match the expected format
        const formattedInvoices = savedInvoices.map(invoice => {
          // Format dates to DD/MM/YYYY
          const formatDate = (dateStr) => {
            if (!dateStr) return '';
            try {
              const date = new Date(dateStr);
              return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
            } catch (e) {
              console.warn("Could not parse date:", dateStr, e);
              return dateStr; // Return as is if can't parse
            }
          };
          
          // Get invoice issue date (from invoiceDate or createdAt)
          const issueDate = invoice.invoiceDate ? formatDate(invoice.invoiceDate) : 
                          (invoice.createdAt ? formatDate(invoice.createdAt) : '');
          
          // Get due date if available
          const dueDate = invoice.dueDate ? formatDate(invoice.dueDate) : '';
          
          // Normalize the status to lowercase for case-insensitive comparison
          const normalizedStatus = (invoice.status || '').toLowerCase() || 'open';
          
          // Calculate totals - handle both tax and cgst/sgst for backward compatibility
          const amount = parseFloat(invoice.total || 0);
          const tax = invoice.tax ? parseFloat(invoice.tax) : 
                    (invoice.cgst ? parseFloat(invoice.cgst) + parseFloat(invoice.sgst || 0) : 0);
          
          // Set received amount based on status
          const received = normalizedStatus === 'paid' ? amount : 0;
          const pending = normalizedStatus === 'paid' ? 0 : amount;
          
          const customerName = invoice.customerInfo?.name || 'Unknown Customer';
          
          console.log(`Processing invoice ${invoice.id || invoice.invoiceNumber}: ${customerName}, amount: ${amount}`);
          
          return {
            id: invoice.id || invoice.invoiceNumber || Date.now().toString(),
            invoiceNumber: invoice.invoiceNumber,
            customer: customerName,
            email: invoice.customerInfo?.email || '',
            issueDate: issueDate,
            dueDate: dueDate,
            type: (invoice.invoiceType || 'invoice').toLowerCase(),
            status: normalizedStatus,
            amount: amount,
            tax: tax,
            received: received,
            pending: pending,
            // Store the original createdAt date for sorting
            createdAt: invoice.createdAt || '',
            // Store the timestamp part of the ID for sorting backup
            timestamp: parseInt(invoice.id) || Date.now()
          };
        });
        
        // Sort invoices by createdAt date (newest first), or by ID timestamp if createdAt is not available
        const sortedInvoices = formattedInvoices.sort((a, b) => {
          // If both have createdAt dates, use those
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          // Otherwise fall back to ID-based timestamp
          return b.timestamp - a.timestamp;
        });
        
        // Log the sorted invoices for debugging
        console.log(`Sorted ${sortedInvoices.length} invoices, first invoice: ${sortedInvoices[0]?.customer}, last invoice: ${sortedInvoices[sortedInvoices.length - 1]?.customer}`);
        
        setInvoices(sortedInvoices);
      } else {
        console.log("No invoices found in saved data");
        // Keep the array empty - don't use mock data
        setInvoices([]);
      }
    } catch (error) {
      console.error("Error loading invoices from localStorage:", error);
      // Don't use mock data - just keep the array empty and show the error
      setInvoices([]);
      alert("There was an error loading your invoices. Please check the console for details.");
    }
  };

  // Load invoices from localStorage on component mount
  useEffect(() => {
    loadInvoicesFromStorage();
  }, []);

  // Refresh data when the component is focused (e.g., after navigating back from create/edit)
  useEffect(() => {
    loadInvoicesFromStorage();
  }, [location]);

  // State for entries per page and search term
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCsvSuccess, setShowCsvSuccess] = useState(false);
  const [csvDownloadInfo, setCsvDownloadInfo] = useState({ type: '', period: '' });
  
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  
  // Download confirmation state
  const [downloadInvoiceId, setDownloadInvoiceId] = useState(null);
  const [showDownloadSuccess, setShowDownloadSuccess] = useState(false);
  
  // Email modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [invoiceToEmail, setInvoiceToEmail] = useState(null);
  const [emailDetails, setEmailDetails] = useState({
    to: '',
    subject: '',
    message: ''
  });
  const [showEmailSuccess, setShowEmailSuccess] = useState(false);
  
  // Add view modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [invoiceToView, setInvoiceToView] = useState(null);
  
  // Total number of entries
  const totalEntries = invoices.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  
  // Add these two lines:
  const indexOfLastInvoice = currentPage * entriesPerPage;
  const indexOfFirstInvoice = indexOfLastInvoice - entriesPerPage;
  
  // Calculate totals for summary
  const calculateTotals = () => {
    let totalAmount = 0;
    let totalReceived = 0;
    let totalPending = 0;
    
    filteredInvoices.forEach(invoice => {
      totalAmount += invoice.amount;
      totalReceived += invoice.received;
      totalPending += invoice.pending;
    });
    
    return {
      totalAmount: totalAmount.toFixed(2),
      totalReceived: totalReceived.toFixed(2),
      totalPending: totalPending.toFixed(2)
    };
  };
  
  // Filtered invoices based on search term
  const filteredInvoices = invoices.filter(invoice => 
    invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.id.toString().includes(searchTerm) ||
    invoice.status.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Get totals for the current filtered list
  const totals = calculateTotals();
  
  // Parse date from DD/MM/YYYY format to Date object
  const parseDate = (dateStr) => {
    const [day, month, year] = dateStr.split('/');
    return new Date(year, month - 1, day);
  };
  
  // Format date to YYYY-MM format for grouping by month
  const getYearMonth = (dateStr) => {
    const date = parseDate(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };
  
  // Format money value
  const formatMoney = (amount) => {
    return `${parseFloat(amount).toFixed(2)}`;
  };
  
  // Group invoices by month
  const getInvoiceMonths = () => {
    const months = new Set();
    invoices.forEach(invoice => {
      months.add(getYearMonth(invoice.issueDate));
    });
    
    // Convert to array, sort in reverse chronological order
    return Array.from(months).sort().reverse();
  };
  
  // Get invoices for a specific month
  const getInvoicesForMonth = (yearMonth) => {
    return invoices.filter(invoice => getYearMonth(invoice.issueDate) === yearMonth);
  };
  
  // Format yearMonth to display name
  const formatMonthDisplay = (yearMonth) => {
    const [year, month] = yearMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };
  
  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  // Get status badge
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

  // Generate and download monthly CSV
  const downloadMonthlyCSV = (yearMonth) => {
    const monthlyInvoices = getInvoicesForMonth(yearMonth);
    const monthName = formatMonthDisplay(yearMonth);
    
    // Create CSV header
    let csvContent = "Invoice,Customer,Email,Issue Date,Due Date,Total Amount,Received Amount,Pending Amount,Type,Status\n";
    
    // Add invoice data
    monthlyInvoices.forEach(invoice => {
      csvContent += `${invoice.id},${invoice.customer},${invoice.email},${invoice.issueDate},${invoice.dueDate},${formatMoney(invoice.amount)},${formatMoney(invoice.received)},${formatMoney(invoice.pending)},${invoice.type},${invoice.status}\n`;
    });
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `invoices-${yearMonth}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success message
    setCsvDownloadInfo({ type: 'monthly', period: monthName });
    setShowCsvSuccess(true);
    
    // Hide message after 5 seconds
    setTimeout(() => {
      setShowCsvSuccess(false);
    }, 5000);
  };
  
  // Generate and download all time CSV
  const downloadAllTimeCSV = () => {
    // Create CSV header
    let csvContent = "Invoice,Customer,Email,Issue Date,Due Date,Total Amount,Received Amount,Pending Amount,Type,Status\n";
    
    // Add invoice data
    invoices.forEach(invoice => {
      csvContent += `${invoice.id},${invoice.customer},${invoice.email},${invoice.issueDate},${invoice.dueDate},${formatMoney(invoice.amount)},${formatMoney(invoice.received)},${formatMoney(invoice.pending)},${invoice.type},${invoice.status}\n`;
    });
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'all-invoices.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success message
    setCsvDownloadInfo({ type: 'all-time', period: 'All Time' });
    setShowCsvSuccess(true);
    
    // Hide message after 5 seconds
    setTimeout(() => {
      setShowCsvSuccess(false);
    }, 5000);
  };

  // Handle downloading a single invoice
  const handleDownloadInvoice = (invoiceId) => {
    try {
      // Set the loading state first
      setDownloadInvoiceId(invoiceId);
      
      // Find the invoice in the localStorage data
      const savedInvoicesString = localStorage.getItem('invoices');
      if (!savedInvoicesString) {
        console.error("No invoices found in localStorage");
        alert("Error: Cannot find invoice data");
        setDownloadInvoiceId(null);
        return;
      }
      
      const savedInvoices = JSON.parse(savedInvoicesString);
      const invoiceToDownload = savedInvoices.find(invoice => invoice.id === invoiceId);
      
      if (!invoiceToDownload) {
        console.error(`Invoice with ID ${invoiceId} not found`);
        alert("Error: Invoice not found");
        setDownloadInvoiceId(null);
        return;
      }
      
      // Check if XlsxPopulate is available
      if (!window.XlsxPopulate) {
        console.log("XlsxPopulate not loaded yet, loading dependencies...");
        
        // Load JSZip first
        const loadJSZip = document.createElement('script');
        loadJSZip.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.7.1/jszip.min.js';
        loadJSZip.async = true;
        document.body.appendChild(loadJSZip);
        
        loadJSZip.onload = () => {
          console.log("JSZip loaded, now loading XlsxPopulate...");
          // Then load xlsx-populate
          const loadXlsxPopulate = document.createElement('script');
          loadXlsxPopulate.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx-populate/1.21.0/xlsx-populate.min.js';
          loadXlsxPopulate.async = true;
          
          loadXlsxPopulate.onload = () => {
            console.log("XlsxPopulate loaded successfully, continuing download...");
            // Now that both libraries are loaded, generate the Excel file
            generateAndDownloadExcel(invoiceToDownload);
          };
          
          loadXlsxPopulate.onerror = (error) => {
            console.error("Failed to load XlsxPopulate:", error);
            alert("Error loading Excel generator. Please try again later.");
            setDownloadInvoiceId(null);
          };
          
          document.body.appendChild(loadXlsxPopulate);
        };
        
        loadJSZip.onerror = (error) => {
          console.error("Failed to load JSZip:", error);
          alert("Error loading Excel generator dependencies. Please try again later.");
          setDownloadInvoiceId(null);
        };
      } else {
        console.log("XlsxPopulate already loaded, generating Excel...");
        // XlsxPopulate is already loaded, generate Excel
        generateAndDownloadExcel(invoiceToDownload);
      }
    } catch (error) {
      console.error("Error downloading invoice:", error);
      alert(`Error downloading invoice: ${error.message}`);
      setDownloadInvoiceId(null);
    }
  };
  
  // Separate function to generate and download Excel
  const generateAndDownloadExcel = (invoiceToDownload) => {
    try {
      // Create Excel file data
      let excelData = [
        // Header row with styling
        [
          { value: "Invoice Details", fontWeight: 'bold', fontSize: 14, span: 3 }, 
          null, 
          null
        ],
        [
          { value: "Invoice #:", fontWeight: 'bold' },
          { value: invoiceToDownload.invoiceNumber || invoiceToDownload.id, align: 'left' },
          { value: "Date:", fontWeight: 'bold' },
          { value: invoiceToDownload.invoiceDate || new Date().toLocaleDateString(), align: 'left' }
        ],
        [
          { value: "Customer:", fontWeight: 'bold' },
          { value: invoiceToDownload.customerInfo?.name || 'Unknown Customer', align: 'left' },
          { value: "Due Date:", fontWeight: 'bold' },
          { value: invoiceToDownload.dueDate || '', align: 'left' }
        ],
        [
          { value: "Email:", fontWeight: 'bold' },
          { value: invoiceToDownload.customerInfo?.email || '', align: 'left' },
          { value: "Status:", fontWeight: 'bold' },
          { value: invoiceToDownload.status || 'Open', align: 'left' }
        ],
        [], // Empty row for spacing
        // Items header
        [
          { value: "Description", fontWeight: 'bold', backgroundColor: '#ECECEC' },
          { value: "Quantity", fontWeight: 'bold', backgroundColor: '#ECECEC', align: 'center' },
          { value: "Price (₹)", fontWeight: 'bold', backgroundColor: '#ECECEC', align: 'right' },
          { value: "Amount (₹)", fontWeight: 'bold', backgroundColor: '#ECECEC', align: 'right' }
        ]
      ];
      
      // Add items
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
          { value: "No items" },
          { value: "", align: 'center' },
          { value: "", align: 'right' },
          { value: "", align: 'right' }
        ]);
      }
      
      // Add empty row and totals
      excelData.push([]);
      excelData.push([
        { value: "" },
        { value: "" },
        { value: "Subtotal:", fontWeight: 'bold', align: 'right' },
        { value: invoiceToDownload.subtotal || '0.00', align: 'right' }
      ]);
      excelData.push([
        { value: "" },
        { value: "" },
        { value: "CGST (9%):", fontWeight: 'bold', align: 'right' },
        { value: invoiceToDownload.cgst || '0.00', align: 'right' }
      ]);
      excelData.push([
        { value: "" },
        { value: "" },
        { value: "SGST (9%):", fontWeight: 'bold', align: 'right' },
        { value: invoiceToDownload.sgst || '0.00', align: 'right' }
      ]);
      excelData.push([
        { value: "" },
        { value: "" },
        { value: "Total:", fontWeight: 'bold', align: 'right', backgroundColor: '#ECECEC' },
        { value: invoiceToDownload.total || '0.00', align: 'right', backgroundColor: '#ECECEC', fontWeight: 'bold' }
      ]);

      // Define column widths
      const columns = [
        { width: 40 }, // Description column
        { width: 10 }, // Quantity column
        { width: 15 }, // Price column 
        { width: 15 }  // Amount column
      ];
      
      // Directly check if XlsxPopulate is properly loaded with the Workbook constructor
      if (!window.XlsxPopulate || typeof window.XlsxPopulate.Workbook !== 'function') {
        throw new Error("Excel generation library not properly loaded. Please refresh the page and try again.");
      }
      
      // Generate XLSX data using xlsx-populate approach
      console.log("Creating Excel workbook...");
      const workbook = window.XlsxPopulate.Workbook.create(); // Using create() static method instead of constructor
      const sheet = workbook.sheet(0);
      
      // Set worksheet name to invoice number
      workbook.sheet(0).name(`Invoice_${invoiceToDownload.invoiceNumber || invoiceToDownload.id}`);
      
      // Process each row in our excelData
      excelData.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (cell !== null) {
            // Set value
            const xlsxCell = sheet.cell(rowIndex + 1, colIndex + 1);
            xlsxCell.value(cell.value);
            
            // Apply styling
            if (cell.fontWeight === 'bold') {
              xlsxCell.style('bold', true);
            }
            
            if (cell.fontSize) {
              xlsxCell.style('fontSize', cell.fontSize);
            }
            
            if (cell.align === 'right') {
              xlsxCell.style('horizontalAlignment', 'right');
            } else if (cell.align === 'center') {
              xlsxCell.style('horizontalAlignment', 'center');
            } else if (cell.align === 'left') {
              xlsxCell.style('horizontalAlignment', 'left');
            }
            
            if (cell.backgroundColor) {
              xlsxCell.style('fill', cell.backgroundColor);
            }
            
            // Handle column span (merge cells)
            if (cell.span && cell.span > 1) {
              sheet.range(
                rowIndex + 1, colIndex + 1, 
                rowIndex + 1, colIndex + cell.span
              ).merged(true);
            }
          }
        });
      });
      
      // Set column widths
      columns.forEach((column, index) => {
        if (column.width) {
          sheet.column(index + 1).width(column.width);
        }
      });
      
      // Generate blob and download
      console.log("Generating Excel file blob...");
      workbook.outputAsync()
        .then(blob => {
          console.log("Excel blob generated, saving file...");
          saveAs(blob, `Invoice_${invoiceToDownload.invoiceNumber || invoiceToDownload.id}.xlsx`);
          
          // Show success message
          setShowDownloadSuccess(true);
          
          // Hide message after 3 seconds
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
  
  // Show delete confirmation modal
  const confirmDelete = (invoice) => {
    setInvoiceToDelete(invoice);
    setShowDeleteModal(true);
  };
  
  // Delete invoice
  const deleteInvoice = () => {
    if (invoiceToDelete) {
      try {
        // Remove from state
        const updatedInvoices = invoices.filter(invoice => invoice.id !== invoiceToDelete.id);
        setInvoices(updatedInvoices);
        
        // Also remove from localStorage
        const savedInvoicesString = localStorage.getItem('invoices');
        
        if (savedInvoicesString) {
          try {
            const savedInvoices = JSON.parse(savedInvoicesString);
            
            if (Array.isArray(savedInvoices)) {
              console.log(`Before deletion: ${savedInvoices.length} invoices`);
              console.log(`Attempting to delete invoice with ID: ${invoiceToDelete.id}`);
              
              // Log all IDs for debugging
              savedInvoices.forEach((invoice, idx) => {
                console.log(`Invoice ${idx}: ID=${invoice.id}, Number=${invoice.invoiceNumber}`);
              });
              
              // Find and remove the invoice by ID
              const updatedSavedInvoices = savedInvoices.filter(invoice => {
                const keepInvoice = invoice.id !== invoiceToDelete.id;
                if (!keepInvoice) {
                  console.log(`Found matching invoice to delete: ${invoice.id} / ${invoice.invoiceNumber}`);
                }
                return keepInvoice;
              });
              
              console.log(`After deletion: ${updatedSavedInvoices.length} invoices`);
              
              if (savedInvoices.length === updatedSavedInvoices.length) {
                console.warn("No invoice was removed - ID might not match exactly");
                // Try with string comparison as fallback
                const strictUpdatedInvoices = savedInvoices.filter(invoice => 
                  String(invoice.id) !== String(invoiceToDelete.id)
                );
                
                if (strictUpdatedInvoices.length < savedInvoices.length) {
                  console.log("Deletion successful with string comparison");
                  localStorage.setItem('invoices', JSON.stringify(strictUpdatedInvoices));
                } else {
                  console.error("Could not find invoice to delete");
                  alert("Warning: Could not find the exact invoice to delete. The list may be out of sync.");
                  // Save what we have anyway
                  localStorage.setItem('invoices', JSON.stringify(updatedSavedInvoices));
                }
              } else {
                // Save the updated array back to localStorage
                localStorage.setItem('invoices', JSON.stringify(updatedSavedInvoices));
              }
            } else {
              console.error("Saved invoices is not an array:", savedInvoices);
              // Reset to an empty array
              localStorage.setItem('invoices', JSON.stringify([]));
            }
          } catch (parseError) {
            console.error("Error parsing invoices from localStorage:", parseError);
            // Reset to an empty array
            localStorage.setItem('invoices', JSON.stringify([]));
          }
        }
        
        // Close modal
        setShowDeleteModal(false);
        setInvoiceToDelete(null);
      } catch (error) {
        console.error("Error deleting invoice:", error);
        alert("There was an error deleting the invoice. Please try again.");
      }
    }
  };
  
  // Open email modal
  const openEmailModal = (invoice) => {
    setInvoiceToEmail(invoice);
    setEmailDetails({
      to: invoice.email,
      subject: `Invoice #${invoice.id} from Your Company`,
      message: `Dear ${invoice.customer},\n\nPlease find attached invoice #${invoice.id} due on ${invoice.dueDate}.\n\nInvoice Amount: ${formatMoney(invoice.amount)}\nAmount Received: ${formatMoney(invoice.received)}\nAmount Pending: ${formatMoney(invoice.pending)}\n\nThank you for your business.\n\nBest regards,\nYour Company`
    });
    setShowEmailModal(true);
  };
  
  // Open view modal
  const openViewModal = (invoice) => {
    setInvoiceToView(invoice);
    setShowViewModal(true);
  };
  
  // Handle email form change
  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Send email
  const sendEmail = () => {
    // In a real app, you would send the email through your backend
    console.log('Sending email:', emailDetails);
    
    // Close modal and show success message
    setShowEmailModal(false);
    setShowEmailSuccess(true);
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      setShowEmailSuccess(false);
    }, 5000);
  };

  // Available months for the dropdown
  const availableMonths = getInvoiceMonths();

  // Function to reset all invoice data (for troubleshooting)
  const resetAllInvoiceData = () => {
    // First, display the current localStorage state
    try {
      const savedInvoicesString = localStorage.getItem('invoices');
      const countMessage = savedInvoicesString 
        ? `Currently there are ${JSON.parse(savedInvoicesString).length} invoices in localStorage.` 
        : "There are no invoices in localStorage.";
      
      const sizeMessage = savedInvoicesString
        ? `Storage size: ${Math.round(savedInvoicesString.length / 1024 * 100) / 100} KB` 
        : "";
        
      if (window.confirm(`${countMessage} ${sizeMessage}\n\nAre you sure you want to reset ALL invoice data? This cannot be undone.`)) {
        try {
          // Clear localStorage
          localStorage.removeItem('invoices');
          // Reset state
          setInvoices([]);
          console.log("All invoice data has been reset");
          alert("All invoice data has been reset successfully.");
        } catch (error) {
          console.error("Error resetting invoice data:", error);
          alert("Error resetting invoice data: " + error.message);
        }
      }
    } catch (error) {
      console.error("Error checking localStorage:", error);
      
      if (window.confirm("Error checking localStorage. Would you like to reset all data anyway?")) {
        localStorage.removeItem('invoices');
        setInvoices([]);
        alert("All invoice data has been reset.");
      }
    }
  };

  return (
    <Container fluid>
      <h1 className="mb-4">Invoice List</h1>
      
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
            <strong>Success:</strong> Email has been sent to {invoiceToEmail?.customer} ({invoiceToEmail?.email}).
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
                <h3 className="mb-0">₹{totals.totalAmount}</h3>
              </div>
            </div>
          </Col>
          <Col md={4}>
            <div className="card bg-success text-white">
              <div className="card-body">
                <h5 className="card-title">Received Amount</h5>
                <h3 className="mb-0">₹{totals.totalReceived}</h3>
              </div>
            </div>
          </Col>
          <Col md={4}>
            <div className="card bg-warning text-dark">
              <div className="card-body">
                <h5 className="card-title">Pending Amount</h5>
                <h3 className="mb-0">₹{totals.totalPending}</h3>
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
            onClick={loadInvoicesFromStorage}
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
            <i className="bi bi-trash me-1"></i> Reset All Data
          </Button>
        </div>

        {/* Use our new ShowEntries component */}
        <ShowEntries
          entriesPerPage={entriesPerPage}
          setEntriesPerPage={setEntriesPerPage}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          totalEntries={invoices.length}
          searchPlaceholder="Search by invoice #, customer, date..."
        />
        
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>
                Invoice <i className="bi bi-arrow-down-up"></i>
              </th>
              <th>
                Customer <i className="bi bi-arrow-down-up"></i>
              </th>
              <th>
                Issue Date <i className="bi bi-arrow-down-up"></i>
              </th>
              <th>
                Due Date <i className="bi bi-arrow-down-up"></i>
              </th>
              <th>
                Total Amount <i className="bi bi-arrow-down-up"></i>
              </th>
              <th>
                Received <i className="bi bi-arrow-down-up"></i>
              </th>
              <th>
                Pending <i className="bi bi-arrow-down-up"></i>
              </th>
              <th>
                Status <i className="bi bi-arrow-down-up"></i>
              </th>
              <th>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.slice(indexOfFirstInvoice, indexOfLastInvoice).map(invoice => (
              <tr key={`${invoice.id}-${invoice.customer}`}>
                <td>{invoice.id}</td>
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
                      onClick={() => handleDownloadInvoice(invoice.id)}
                      disabled={downloadInvoiceId === invoice.id}
                    >
                      {downloadInvoiceId === invoice.id ? 
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
            {filteredInvoices.length === 0 && (
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
            Showing {indexOfFirstInvoice + 1} to {Math.min(indexOfLastInvoice, filteredInvoices.length)} of {filteredInvoices.length} entries
            {searchTerm && ` (filtered from ${invoices.length} total entries)`}
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
              Are you sure you want to delete Invoice #{invoiceToDelete.id} for {invoiceToDelete.customer}?
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
              <span className="text-muted fs-6"> - Invoice #{invoiceToEmail.id} for {invoiceToEmail.customer}</span>
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
        <Modal.Header closeButton>
          <Modal.Title>
            Invoice Details
            {invoiceToView && (
              <span className="text-muted fs-6"> - Invoice #{invoiceToView.id} for {invoiceToView.customer}</span>
            )}
          </Modal.Title>
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
                  <p><strong>Invoice #:</strong> {invoiceToView.id}</p>
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
              handleDownloadInvoice(invoiceToView.id);
              setShowViewModal(false);
            }}
          >
            Download Invoice
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default InvoiceList; 