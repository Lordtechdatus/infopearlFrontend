import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button, Card, Badge, Dropdown, Form, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import ShowEntries from '../../components/ShowEntries';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './ManageSalary.css';
import '../../styles/pagination.css';

const ManageSalary = () => {
  // State for salary records
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('issueDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const navigate = useNavigate();
  
  // Helper to convert month name to number for sorting
  const getMonthNumber = (monthName) => {
    const months = {
      'January': '01', 'February': '02', 'March': '03', 'April': '04',
      'May': '05', 'June': '06', 'July': '07', 'August': '08',
      'September': '09', 'October': '10', 'November': '11', 'December': '12'
    };
    return months[monthName] || '00';
  };
  
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
  
  // Pagination
  const indexOfLastRecord = currentPage * entriesPerPage;
  const indexOfFirstRecord = indexOfLastRecord - entriesPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredRecords.length / entriesPerPage);
  
  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
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
  
  // Calculate totals
  const calculateTotalEarnings = () => {
    return salaryRecords.reduce((total, record) => {
      // Check if the earnings property exists and is a valid number
      const earnings = record.earnings ? parseFloat(record.earnings) : 0;
      return total + (isNaN(earnings) ? 0 : earnings);
    }, 0);
  };
  
  const calculateTotalDeductions = () => {
    return salaryRecords.reduce((total, record) => {
      // Check if the deductions property exists and is a valid number
      const deductions = record.deductions ? parseFloat(record.deductions) : 0;
      return total + (isNaN(deductions) ? 0 : deductions);
    }, 0);
  };
  
  const calculateNetSalary = () => {
    return salaryRecords.reduce((total, record) => {
      // Check if the netSalary property exists and is a valid number
      const netSalary = record.netSalary ? parseFloat(record.netSalary) : 0;
      return total + (isNaN(netSalary) ? 0 : netSalary);
    }, 0);
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
          <Card className="text-center h-100 border-0 shadow-sm text-white" style={{ background: 'linear-gradient(135deg, #FBBC05, #EA4335)', borderColor: '#051937' }}>
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
                {/* Count unique employee IDs */}
                {new Set(salaryRecords.map(record => record.employeeId)).size}
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
            <Link to="/admin/createsalaryslip" className="btn btn-primary">
              <i className="bi bi-plus-lg me-2"></i>
              Create New Salary Slip
            </Link>
          </div>
          
          {/* Use our new ShowEntries component */}
          <ShowEntries
            entriesPerPage={entriesPerPage}
            setEntriesPerPage={setEntriesPerPage}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            totalEntries={salaryRecords.length}
            searchPlaceholder="Search employee, ID, month..."
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
                <th onClick={() => handleSort('issueDate')} style={{ cursor: 'pointer' }}>
                  Month/Year {getSortIndicator('issueDate')}
                </th>
                <th onClick={() => handleSort('totalAmount')} style={{ cursor: 'pointer' }}>
                  Net Salary {getSortIndicator('totalAmount')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.length > 0 ? (
                currentRecords.map(record => (
                  <tr key={record.id}>
                    <td>{record.employeeId}</td>
                    <td>{record.employeeName}</td>
                    <td>{record.month} {record.year}</td>
                    <td>₹ {parseFloat(record.netSalary).toLocaleString('en-IN')}</td>
                    <td>
                      <div className="d-flex">
                        <Button variant="info" size="sm" className="me-1" onClick={() => handleViewSlip(record.id)}>
                          <i className="bi bi-eye"></i>
                        </Button>
                        <Button variant="success" size="sm" className="me-1" onClick={() => handleDownloadPDF(record.id)}>
                          <i className="bi bi-download"></i>
                        </Button>
                        <Button variant="primary" size="sm" className="me-1" onClick={() => handleSendEmail(record.id)}>
                          <i className="bi bi-envelope"></i>
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(record.id)}>
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
              {filteredRecords.length > 0 ? (
                <span>
                  Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredRecords.length)} of {filteredRecords.length} entries
                  {searchTerm && ` (filtered from ${salaryRecords.length} total entries)`}
                </span>
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
                      disabled={currentPage === totalPages}
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
    </Container>
  );
};

export default ManageSalary; 