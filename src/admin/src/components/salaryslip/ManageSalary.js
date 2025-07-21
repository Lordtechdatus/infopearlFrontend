import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button, Card, Badge, Dropdown, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';

const ManageSalary = () => {
  // State for salary records
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('issueDate');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Load salary records from localStorage on component mount
  useEffect(() => {
    const storedSlips = JSON.parse(localStorage.getItem('salarySlips') || '[]');
    setSalaryRecords(storedSlips);
  }, []);
  
  // Handle sort column click
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Get sort indicator
  const getSortIndicator = (field) => {
    if (sortField !== field) return '↕';
    return sortDirection === 'asc' ? '↑' : '↓';
  };
  
  // Filter and sort records
  const filteredRecords = salaryRecords
    .filter(record => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        record.employeeId.toLowerCase().includes(searchTermLower) ||
        record.employeeName.toLowerCase().includes(searchTermLower) ||
        record.month.toLowerCase().includes(searchTermLower) ||
        record.year.toLowerCase().includes(searchTermLower)
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'employeeId') {
        comparison = a.employeeId.localeCompare(b.employeeId);
      } else if (sortField === 'employeeName') {
        comparison = a.employeeName.localeCompare(b.employeeName);
      } else if (sortField === 'issueDate') {
        // Sort by year and month
        const aDate = `${a.year}-${getMonthNumber(a.month)}`;
        const bDate = `${b.year}-${getMonthNumber(b.month)}`;
        comparison = aDate.localeCompare(bDate);
      } else if (sortField === 'totalAmount') {
        comparison = parseFloat(a.netSalary) - parseFloat(b.netSalary);
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  
  // Helper to convert month name to number for sorting
  const getMonthNumber = (monthName) => {
    const months = {
      'January': '01', 'February': '02', 'March': '03', 'April': '04',
      'May': '05', 'June': '06', 'July': '07', 'August': '08',
      'September': '09', 'October': '10', 'November': '11', 'December': '12'
    };
    return months[monthName] || '00';
  };
  
  // Pagination
  const indexOfLastRecord = currentPage * entriesPerPage;
  const indexOfFirstRecord = indexOfLastRecord - entriesPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredRecords.length / entriesPerPage);
  
  // Delete a salary record
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this salary record?')) {
      const updatedRecords = salaryRecords.filter(record => record.id !== id);
      setSalaryRecords(updatedRecords);
      localStorage.setItem('salarySlips', JSON.stringify(updatedRecords));
    }
  };
  
  // View/Print a salary slip
  const handleViewSlip = (id) => {
    // Navigate to view page or open print dialog
    window.location.href = `/salary/view/${id}`;
  };
  
  // Download as PDF
  const handleDownloadPDF = (id) => {
    // Logic to generate and download PDF would go here
    // For now, we'll just show an alert
    alert(`Download PDF for salary slip ${id}`);
  };
  
  // Send Salary Slip via Email
  const handleSendEmail = (id) => {
    // Logic to send email would go here
    // For now, we'll just show an alert
    alert(`Send email for salary slip ${id}`);
  };
  
  return (
    <Container fluid className="mt-4">
      <h1 className="mb-4">Manage Salary Slips</h1>
      
      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center h-100 border-0 shadow-sm text-white" style={{ background: 'linear-gradient(135deg, #051937, #004d7a)', borderColor: '#051937' }}>
            <Card.Body className="d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Card.Title>Total Records</Card.Title>
                <div 
                  className="text-white rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: '50px', height: '50px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                >
                  <i className="bi bi-file-earmark-text fs-4"></i>
                </div>
              </div>
              <h2 className="mb-0">{salaryRecords.length}</h2>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="text-center h-100 border-0 shadow-sm text-white" style={{ background: 'linear-gradient(135deg, yellow, #004d7a)', borderColor: '#051937' }}>
            <Card.Body className="d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Card.Title>Current Month</Card.Title>
                <div 
                  className="text-white rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: '50px', height: '50px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                >
                  <i className="bi bi-calendar-check fs-4"></i>
                </div>
              </div>
              <h2 className="mb-0">
                {salaryRecords.filter(record => {
                  const today = new Date();
                  const currentMonth = today.toLocaleString('default', { month: 'long' });
                  const currentYear = today.getFullYear().toString();
                  return record.month === currentMonth && record.year === currentYear;
                }).length}
              </h2>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="text-center h-100 border-0 shadow-sm text-white" style={{ background: 'linear-gradient(135deg, green, #004d7a)', borderColor: '#051937' }}>
            <Card.Body className="d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Card.Title>Total Employees</Card.Title>
                <div 
                  className="text-white rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: '50px', height: '50px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                >
                  <i className="bi bi-people fs-4"></i>
                </div>
              </div>
              <h2 className="mb-0">
                {new Set(salaryRecords.map(record => record.employeeId)).size}
              </h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Control Row - Search and Actions */}
      <Row className="mb-3 align-items-center">
        <Col md={6} className="mb-2 mb-md-0">
          <InputGroup>
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search by employee ID, name, or month..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={6} className="d-flex justify-content-md-end">
          <Link to="/salary/create" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>
            Create New Salary Slip
          </Link>
        </Col>
      </Row>
      
      {/* Salary Records Table */}
      <div className="table-responsive">
        <Table bordered hover className="shadow-sm">
          <thead className="bg-light">
            <tr>
              <th style={{ cursor: 'pointer', backgroundColor: '#f5f5f5', borderBottom: '2px solid #dee2e6' }} onClick={() => handleSort('employeeId')}>
                Employee ID {getSortIndicator('employeeId')}
              </th>
              <th style={{ cursor: 'pointer', backgroundColor: '#f5f5f5', borderBottom: '2px solid #dee2e6' }} onClick={() => handleSort('employeeName')}>
                Employee Name {getSortIndicator('employeeName')}
              </th>
              <th style={{ cursor: 'pointer', backgroundColor: '#f5f5f5', borderBottom: '2px solid #dee2e6' }} onClick={() => handleSort('issueDate')}>
                Issue Date {getSortIndicator('issueDate')}
              </th>
              <th style={{ cursor: 'pointer', backgroundColor: '#f5f5f5', borderBottom: '2px solid #dee2e6' }} onClick={() => handleSort('totalAmount')}>
                Total Amount {getSortIndicator('totalAmount')}
              </th>
              <th className="text-center" style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #dee2e6' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.length > 0 ? (
              currentRecords.map((record) => (
                <tr key={record.id}>
                  <td>{record.employeeId}</td>
                  <td>{record.employeeName}</td>
                  <td>{record.month} {record.year}</td>
                  <td>₹{parseFloat(record.netSalary).toFixed(2)}</td>
                  <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="me-1"
                      onClick={() => handleViewSlip(record.id)}
                      title="View/Print"
                      style={{ 
                        backgroundColor: '#007bff', 
                        borderColor: '#007bff',
                        width: '32px',
                        height: '32px',
                        padding: '0',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px'
                      }}
                    >
                      <i className="bi bi-eye-fill"></i>
                    </Button>
                    <Button 
                      variant="info" 
                      size="sm" 
                      className="me-1"
                      onClick={() => handleSendEmail(record.id)}
                      title="Send Email"
                      style={{ 
                        backgroundColor: '#17a2b8', 
                        borderColor: '#17a2b8',
                        width: '32px',
                        height: '32px',
                        padding: '0',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px'
                      }}
                    >
                      <i className="bi bi-envelope-fill"></i>
                    </Button>
                    <Button 
                      variant="success" 
                      size="sm" 
                      className="me-1"
                      onClick={() => handleDownloadPDF(record.id)}
                      title="Download PDF"
                      style={{ 
                        backgroundColor: '#28a745', 
                        borderColor: '#28a745',
                        width: '32px',
                        height: '32px',
                        padding: '0',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px'
                      }}
                    >
                      <i className="bi bi-download"></i>
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => handleDelete(record.id)}
                      title="Delete"
                      style={{ 
                        backgroundColor: '#dc3545', 
                        borderColor: '#dc3545',
                        width: '32px',
                        height: '32px',
                        padding: '0',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px'
                      }}
                    >
                      <i className="bi bi-trash-fill"></i>
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  <i className="bi bi-inbox fs-1 d-block text-muted mb-2"></i>
                  No salary records found
                  {searchTerm && (
                    <span className="d-block mt-2">
                      Try clearing your search or create a new salary slip
                    </span>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
      
      {/* Pagination Controls */}
      {filteredRecords.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
          <div className="d-flex align-items-center mb-2 mb-sm-0">
            <div className="me-2">Show</div>
            <Form.Select 
              className="d-inline-block w-auto me-2"
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </Form.Select>
            <div>entries</div>
          </div>
          
          <div className="d-flex">
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="me-1"
            >
              <i className="bi bi-chevron-left"></i>
            </Button>
            <div className="d-flex align-items-center mx-2">
              <span>Page {currentPage} of {totalPages}</span>
            </div>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <i className="bi bi-chevron-right"></i>
            </Button>
          </div>
        </div>
      )}
    </Container>
  );
};

export default ManageSalary; 