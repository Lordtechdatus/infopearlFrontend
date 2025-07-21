import React, { useState } from 'react';
import { Table, Button, Card, Form, InputGroup, Row, Col, Modal, Alert } from 'react-bootstrap';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logo from '../assets/logo.jpg';
import signature from '../assets/signature.png';

const ManageSalary = () => {
  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: 'Rahul Sharma',
      position: 'Senior Accountant',
      joinDate: '2022-05-10',
      basicSalary: 45000,
      lastPayment: '2025-04-01'
    },
    {
      id: 2,
      name: 'Priya Patel',
      position: 'Tax Consultant',
      joinDate: '2022-07-15',
      basicSalary: 38000,
      lastPayment: '2025-04-01'
    },
    {
      id: 3,
      name: 'Amit Kumar',
      position: 'Financial Advisor',
      joinDate: '2023-01-05',
      basicSalary: 52000,
      lastPayment: '2025-04-01'
    },
    {
      id: 4,
      name: 'Neha Singh',
      position: 'Junior Accountant',
      joinDate: '2023-08-12',
      basicSalary: 32000,
      lastPayment: '2025-04-01'
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [salarySlipData, setSalarySlipData] = useState({
    month: new Date().toISOString().slice(0, 7), // Default to current month (YYYY-MM)
    basic: 0,
    hra: 0,
    da: 0,
    conveyance: 0,
    medical: 0,
    special: 0,
    pf: 0,
    tds: 0,
    professional: 0,
    loanDeduction: 0
  });
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  
  // Filter employees based on search term
  const filteredEmployees = employees.filter(employee => {
    return (
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      employee.position.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  // Open salary slip modal for an employee
  const handleGenerateSalarySlip = (employee) => {
    setSelectedEmployee(employee);
    setSalarySlipData({
      ...salarySlipData,
      basic: employee.basicSalary,
      hra: Math.round(employee.basicSalary * 0.4),
      da: Math.round(employee.basicSalary * 0.1),
      conveyance: 1600,
      medical: 1250,
      special: Math.round(employee.basicSalary * 0.05),
      pf: Math.round(employee.basicSalary * 0.12),
      tds: Math.round(employee.basicSalary * 0.05),
      professional: 200,
      loanDeduction: 0
    });
    setShowSalaryModal(true);
  };
  
  // Handle input changes in the salary slip form
  const handleSalaryInputChange = (e) => {
    const { name, value } = e.target;
    setSalarySlipData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };
  
  // Calculate salary totals
  const calculateTotals = () => {
    const totalEarnings = 
      salarySlipData.basic + 
      salarySlipData.hra + 
      salarySlipData.da + 
      salarySlipData.conveyance + 
      salarySlipData.medical + 
      salarySlipData.special;
    
    const totalDeductions = 
      salarySlipData.pf + 
      salarySlipData.tds + 
      salarySlipData.professional + 
      salarySlipData.loanDeduction;
    
    const netSalary = totalEarnings - totalDeductions;
    
    return { totalEarnings, totalDeductions, netSalary };
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Download salary slip as PDF
  const downloadSalarySlip = () => {
    const element = document.getElementById('salary-slip-print');
    
    // Make the element visible for html2canvas to capture it
    element.classList.remove('d-none');
    element.classList.add('d-block');
    
    html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: true,
      allowTaint: true
    }).then(canvas => {
      // Hide the element again
      element.classList.remove('d-block');
      element.classList.add('d-none');
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`salary-slip-${selectedEmployee.name.replace(/\s+/g, '-')}-${salarySlipData.month}.pdf`);
      
      setShowSalaryModal(false);
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
    }).catch(error => {
      console.error('Error generating PDF:', error);
      alert('There was an error generating the PDF. Please try again.');
    });
  };
  
  const { totalEarnings, totalDeductions, netSalary } = calculateTotals();
  
  return (
    <div className="content-section">
      <h2>Salary Management</h2>
      <p className="mb-4">Generate and manage employee salary slips</p>
      
      {showSuccessAlert && (
        <Alert 
          variant="success" 
          onClose={() => setShowSuccessAlert(false)} 
          dismissible
        >
          Salary slip generated and downloaded successfully!
        </Alert>
      )}
      
      <Card className="mb-4">
        <Card.Body>
          <Row className="mb-3 align-items-center">
            <Col md={6}>
              <InputGroup>
                <Form.Control
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={6} className="text-md-end mt-3 mt-md-0">
              <Button variant="outline-primary">
                Add New Employee
              </Button>
            </Col>
          </Row>
          
          <Table responsive hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Position</th>
                <th>Join Date</th>
                <th>Basic Salary</th>
                <th>Last Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map(employee => (
                  <tr key={employee.id}>
                    <td>{employee.id}</td>
                    <td>{employee.name}</td>
                    <td>{employee.position}</td>
                    <td>{employee.joinDate}</td>
                    <td>{formatCurrency(employee.basicSalary)}</td>
                    <td>{employee.lastPayment}</td>
                    <td>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => handleGenerateSalarySlip(employee)}
                      >
                        Generate Salary Slip
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    No employees found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
      
      {/* Salary Slip Modal */}
      <Modal 
        show={showSalaryModal} 
        onHide={() => setShowSalaryModal(false)}
        size="lg"
        dialogClassName="salary-slip-modal"
      >
        <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #051937, #004d7a)', color: 'white' }}>
          <Modal.Title>Generate Salary Slip</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedEmployee && (
            <>
              <Form className="mb-4">
                <Row className="mb-4">
                  <Col md={12} className="d-flex align-items-center mb-4">
                    <div style={{ width: '100px', marginRight: '20px' }}>
                      <img 
                        src={logo} 
                        alt="Company Logo" 
                        style={{ maxWidth: '100%' }} 
                      />
                    </div>
                    <div>
                      <h4 className="mb-1">Infopearl Tech Solutions Pvt Ltd</h4>
                      <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                        G1 Akansha Apartment, Patel Nagar, City center
                      </p>
                      <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                        Phone: 7000937390 | Email: infopearl396@gmail.com
                      </p>
                    </div>
                  </Col>
                </Row>

                <div className="bg-light p-3 rounded mb-4">
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label><strong>Employee</strong></Form.Label>
                        <Form.Control
                          type="text"
                          value={selectedEmployee.name}
                          readOnly
                          className="bg-white"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label><strong>Month</strong></Form.Label>
                        <Form.Control
                          type="month"
                          name="month"
                          value={salarySlipData.month}
                          onChange={handleSalaryInputChange}
                          className="bg-white"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
                
                <Row>
                  <Col md={6}>
                    <div className="border rounded p-3 h-100">
                      <h5 className="mb-3 border-bottom pb-2 text-primary">Earnings</h5>
                    
                      <Form.Group className="mb-3">
                        <Form.Label>Basic Salary</Form.Label>
                        <Form.Control
                          type="number"
                          name="basic"
                          value={salarySlipData.basic}
                          onChange={handleSalaryInputChange}
                          className="bg-light"
                        />
                      </Form.Group>
                    
                      <Form.Group className="mb-3">
                        <Form.Label>HRA</Form.Label>
                        <Form.Control
                          type="number"
                          name="hra"
                          value={salarySlipData.hra}
                          onChange={handleSalaryInputChange}
                          className="bg-light"
                        />
                      </Form.Group>
                    
                      <Form.Group className="mb-3">
                        <Form.Label>DA</Form.Label>
                        <Form.Control
                          type="number"
                          name="da"
                          value={salarySlipData.da}
                          onChange={handleSalaryInputChange}
                          className="bg-light"
                        />
                      </Form.Group>
                    
                      <Form.Group className="mb-3">
                        <Form.Label>Conveyance</Form.Label>
                        <Form.Control
                          type="number"
                          name="conveyance"
                          value={salarySlipData.conveyance}
                          onChange={handleSalaryInputChange}
                          className="bg-light"
                        />
                      </Form.Group>
                    
                      <Form.Group className="mb-3">
                        <Form.Label>Medical Allowance</Form.Label>
                        <Form.Control
                          type="number"
                          name="medical"
                          value={salarySlipData.medical}
                          onChange={handleSalaryInputChange}
                          className="bg-light"
                        />
                      </Form.Group>
                    
                      <Form.Group className="mb-3">
                        <Form.Label>Special Allowance</Form.Label>
                        <Form.Control
                          type="number"
                          name="special"
                          value={salarySlipData.special}
                          onChange={handleSalaryInputChange}
                          className="bg-light"
                        />
                      </Form.Group>
                    </div>
                  </Col>
                  
                  <Col md={6}>
                    <div className="border rounded p-3 h-100">
                      <h5 className="mb-3 border-bottom pb-2 text-danger">Deductions</h5>
                    
                      <Form.Group className="mb-3">
                        <Form.Label>Provident Fund</Form.Label>
                        <Form.Control
                          type="number"
                          name="pf"
                          value={salarySlipData.pf}
                          onChange={handleSalaryInputChange}
                          className="bg-light"
                        />
                      </Form.Group>
                    
                      <Form.Group className="mb-3">
                        <Form.Label>TDS</Form.Label>
                        <Form.Control
                          type="number"
                          name="tds"
                          value={salarySlipData.tds}
                          onChange={handleSalaryInputChange}
                          className="bg-light"
                        />
                      </Form.Group>
                    
                      <Form.Group className="mb-3">
                        <Form.Label>Professional Tax</Form.Label>
                        <Form.Control
                          type="number"
                          name="professional"
                          value={salarySlipData.professional}
                          onChange={handleSalaryInputChange}
                          className="bg-light"
                        />
                      </Form.Group>
                    
                      <Form.Group className="mb-3">
                        <Form.Label>Loan Deduction</Form.Label>
                        <Form.Control
                          type="number"
                          name="loanDeduction"
                          value={salarySlipData.loanDeduction}
                          onChange={handleSalaryInputChange}
                          className="bg-light"
                        />
                      </Form.Group>
                    
                      <div className="border p-3 rounded mt-4 bg-light">
                        <div className="d-flex justify-content-between mb-2">
                          <strong>Total Earnings:</strong>
                          <span className="text-primary">{formatCurrency(totalEarnings)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <strong>Total Deductions:</strong>
                          <span className="text-danger">{formatCurrency(totalDeductions)}</span>
                        </div>
                        <hr className="my-2" />
                        <div className="d-flex justify-content-between fw-bold">
                          <strong>Net Salary:</strong>
                          <span className="text-success">{formatCurrency(netSalary)}</span>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Form>
              
              {/* Printable Salary Slip */}
              <div id="salary-slip-print" className="d-none p-4 border" style={{ 
                width: '800px', 
                backgroundColor: 'white',
                margin: '0 auto',
                position: 'absolute',
                left: '-9999px',
                top: 0,
                zIndex: -1
              }}>
                <div className="d-flex align-items-center mb-4">
                  <div style={{ 
                    width: '100px', 
                    height: '100px', 
                    marginRight: '20px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden'
                  }}>
                    <img 
                      src={logo} 
                      alt="Company Logo" 
                      style={{ maxWidth: '100%', maxHeight: '100%' }} 
                    />
                  </div>
                  <div>
                    <h2 className="mb-1">Infopearl Tech Solutions Pvt Ltd</h2>
                    <p className="mb-1">G1 Akansha Apartment, Patel Nagar, City center</p>
                    <p className="mb-1">Phone: 7000937390 | Email: infopearl396@gmail.com</p>
                  </div>
                </div>
                
                <div className="text-center mb-4" style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px' }}>
                  <h3 className="mb-2">Salary Slip</h3>
                  <p className="mb-0">For the Month of {new Date(salarySlipData.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                </div>
                
                <div className="row mb-4 p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                  <div className="col-6">
                    <p><strong>Employee Name:</strong> {selectedEmployee.name}</p>
                    <p><strong>Position:</strong> {selectedEmployee.position}</p>
                  </div>
                  <div className="col-6 text-end">
                    <p><strong>Employee ID:</strong> EMP-{selectedEmployee.id.toString().padStart(3, '0')}</p>
                    <p><strong>Join Date:</strong> {selectedEmployee.joinDate}</p>
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-6">
                    <div className="card mb-4">
                      <div className="card-header bg-primary text-white">
                        <h5 className="mb-0">Earnings</h5>
                      </div>
                      <div className="card-body p-0">
                        <table className="table table-striped mb-0">
                          <tbody>
                            <tr>
                              <td>Basic Salary</td>
                              <td className="text-end">{formatCurrency(salarySlipData.basic)}</td>
                            </tr>
                            <tr>
                              <td>HRA</td>
                              <td className="text-end">{formatCurrency(salarySlipData.hra)}</td>
                            </tr>
                            <tr>
                              <td>DA</td>
                              <td className="text-end">{formatCurrency(salarySlipData.da)}</td>
                            </tr>
                            <tr>
                              <td>Conveyance</td>
                              <td className="text-end">{formatCurrency(salarySlipData.conveyance)}</td>
                            </tr>
                            <tr>
                              <td>Medical Allowance</td>
                              <td className="text-end">{formatCurrency(salarySlipData.medical)}</td>
                            </tr>
                            <tr>
                              <td>Special Allowance</td>
                              <td className="text-end">{formatCurrency(salarySlipData.special)}</td>
                            </tr>
                            <tr className="table-primary fw-bold">
                              <td>Total Earnings</td>
                              <td className="text-end">{formatCurrency(totalEarnings)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-6">
                    <div className="card mb-4">
                      <div className="card-header bg-danger text-white">
                        <h5 className="mb-0">Deductions</h5>
                      </div>
                      <div className="card-body p-0">
                        <table className="table table-striped mb-0">
                          <tbody>
                            <tr>
                              <td>Provident Fund</td>
                              <td className="text-end">{formatCurrency(salarySlipData.pf)}</td>
                            </tr>
                            <tr>
                              <td>TDS</td>
                              <td className="text-end">{formatCurrency(salarySlipData.tds)}</td>
                            </tr>
                            <tr>
                              <td>Professional Tax</td>
                              <td className="text-end">{formatCurrency(salarySlipData.professional)}</td>
                            </tr>
                            <tr>
                              <td>Loan Deduction</td>
                              <td className="text-end">{formatCurrency(salarySlipData.loanDeduction)}</td>
                            </tr>
                            <tr className="table-danger fw-bold">
                              <td>Total Deductions</td>
                              <td className="text-end">{formatCurrency(totalDeductions)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="row mt-2">
                  <div className="col-12">
                    <div className="card bg-success text-white">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                          <h5 className="mb-0">Net Salary:</h5>
                          <h5 className="mb-0" style={{ fontWeight: 'bold', color: '#222' }}>{formatCurrency(netSalary)}</h5>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="row mt-5 pt-4 border-top">
                  <div className="col-6">
                    <p className="mb-0">Employee Signature</p>
                    <div style={{ borderTop: '1px solid #000', width: '60%', marginTop: '50px' }}></div>
                  </div>
                  <div className="col-6 text-end">
                    <p className="mb-0">Authorized Signature</p>
                    <img src={signature} alt="Authorized Signature" style={{ width: '120px', marginTop: '10px', marginLeft: 'auto', display: 'block' }} />
                  </div>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer style={{ background: '#f8f9fa' }}>
          <Button variant="secondary" onClick={() => setShowSalaryModal(false)}>
            <i className="bi bi-x-circle me-1"></i> Cancel
          </Button>
          <Button variant="success" onClick={downloadSalarySlip}>
            <i className="bi bi-file-earmark-pdf me-1"></i> Generate PDF
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageSalary; 