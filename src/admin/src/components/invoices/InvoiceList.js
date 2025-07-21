import React, { useState, useEffect } from 'react';
import { Container, Table, Row, Col, Form, Button, InputGroup, Pagination, Badge, Alert, Modal, Dropdown } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const InvoiceList = () => {
  // State for invoices, initially empty
  const [invoices, setInvoices] = useState([]);
  const location = useLocation();

  // Function to load invoices from localStorage
  const loadInvoicesFromStorage = () => {
    try {
      const savedInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      console.log("Raw invoices from localStorage:", savedInvoices);
      
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
            customer: customerName,
            email: invoice.customerInfo?.email || '',
            issueDate: issueDate,
            dueDate: dueDate,
            type: (invoice.invoiceType || 'invoice').toLowerCase(),
            status: normalizedStatus,
            amount: amount,
            tax: tax,
            received: received,
            pending: pending
          };
        });
        
        console.log("Formatted invoices:", formattedInvoices);
        setInvoices(formattedInvoices);
      } else {
        // If no saved invoices, keep the mock data
        // This ensures the UI is populated with something
        setInvoices([
          { id: 3, customer: 'Anne B Ruch', email: 'anne@example.com', issueDate: '13/11/2021', dueDate: '15/11/2021', type: 'invoice', status: 'paid', amount: 240.50, received: 240.50, pending: 0 },
          { id: 4, customer: 'Albert M Dunford', email: 'albert@example.com', issueDate: '13/11/2021', dueDate: '17/11/2021', type: 'invoice', status: 'open', amount: 355.00, received: 100.00, pending: 255.00 },
          { id: 5, customer: 'Wendy Reilly', email: 'wendy@example.com', issueDate: '13/11/2021', dueDate: '18/11/2021', type: 'invoice', status: 'open', amount: 560.25, received: 300.00, pending: 260.25 },
          { id: 9, customer: 'Shodhyantri Engineering Services', email: 'info@shodhyantri.com', issueDate: '15/02/2023', dueDate: '16/02/2022', type: 'invoice', status: 'open', amount: 1250.00, received: 625.00, pending: 625.00 }
        ]);
      }
    } catch (error) {
      console.error("Error loading invoices from localStorage:", error);
      // Fallback to mock data if there's an error
      setInvoices([
        { id: 3, customer: 'Anne B Ruch', email: 'anne@example.com', issueDate: '13/11/2021', dueDate: '15/11/2021', type: 'invoice', status: 'paid', amount: 240.50, received: 240.50, pending: 0 },
        { id: 4, customer: 'Albert M Dunford', email: 'albert@example.com', issueDate: '13/11/2021', dueDate: '17/11/2021', type: 'invoice', status: 'open', amount: 355.00, received: 100.00, pending: 255.00 }
      ]);
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
  
  // Total number of entries
  const totalEntries = invoices.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  
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
    setDownloadInvoiceId(invoiceId);
    
    // In a real app, you would generate the PDF here
    // For now, we'll just show a success message
    setShowDownloadSuccess(true);
    
    // Hide message after 5 seconds
    setTimeout(() => {
      setShowDownloadSuccess(false);
      setDownloadInvoiceId(null);
    }, 3000);
  };
  
  // Show delete confirmation modal
  const confirmDelete = (invoice) => {
    setInvoiceToDelete(invoice);
    setShowDeleteModal(true);
  };
  
  // Delete invoice
  const deleteInvoice = () => {
    if (invoiceToDelete) {
      // Remove from state
      const updatedInvoices = invoices.filter(invoice => invoice.id !== invoiceToDelete.id);
      setInvoices(updatedInvoices);
      
      // Also remove from localStorage
      const savedInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      const updatedSavedInvoices = savedInvoices.filter(invoice => invoice.id !== invoiceToDelete.id);
      localStorage.setItem('invoices', JSON.stringify(updatedSavedInvoices));
      
      // Close modal
      setShowDeleteModal(false);
      setInvoiceToDelete(null);
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

  return (
    <Container fluid>
      <h1 className="mb-4">Invoice List</h1>
      
      {showCsvSuccess && (
        <Alert variant="success" className="d-flex justify-content-between align-items-center">
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
        <Row className="align-items-center mb-3">
          <Col>
            <Form.Group className="d-flex align-items-center">
              <Form.Label className="me-2 mb-0">Show</Form.Label>
              <Form.Select 
                className="w-auto me-2"
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(parseInt(e.target.value))}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </Form.Select>
              <span>entries</span>
            </Form.Group>
          </Col>
          
          <Col className="text-end">
            <Dropdown className="d-inline-block me-2">
              <Dropdown.Toggle variant="success" id="dropdown-monthly-csv">
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
              className="me-2"
              onClick={downloadAllTimeCSV}
            >
              <i className="bi bi-download me-1"></i> Download All Time
            </Button>
            
            <InputGroup className="w-auto ms-auto d-inline-flex" style={{ maxWidth: '300px' }}>
              <InputGroup.Text>Search:</InputGroup.Text>
              <Form.Control
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Col>
        </Row>
        
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
            {filteredInvoices.map(invoice => (
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
                    <Link to={`/invoices/edit/${invoice.id}`} className="btn btn-sm btn-primary me-1">
                      <i className="bi bi-pencil-square"></i>
                    </Link>
                    <Button 
                      variant="info" 
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
                    >
                      <i className="bi bi-download"></i>
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
            Showing 1 to {Math.min(filteredInvoices.length, entriesPerPage)} of {filteredInvoices.length} entries
          </div>
          
          <Pagination>
            <Pagination.Item 
              onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Pagination.Item>
            
            <Pagination.Item 
              active={currentPage === 1}
              onClick={() => handlePageChange(1)}
            >
              1
            </Pagination.Item>
            
            {totalPages > 1 && (
              <Pagination.Item 
                active={currentPage === 2}
                onClick={() => handlePageChange(2)}
              >
                2
              </Pagination.Item>
            )}
            
            <Pagination.Item 
              onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
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
    </Container>
  );
};

export default InvoiceList; 