import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Form, Button, Card, InputGroup, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'bootstrap-icons/font/bootstrap-icons.css';
import logo from '../assets/logo.jpg';

const SalarySlip = () => {
  // Add navigate for redirecting after form submission
  const navigate = useNavigate();
  const [showSalarySlipPreview, setShowSalarySlipPreview] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Reference for the slip to be printed
  const printRef = useRef(null);

  // Reference for the slip preview
  const slipRef = useRef(null);

  // State for form data
  const [formData, setFormData] = useState({
    employeeId: 'EMP001',
    employeeName: '',
    designation: '',
    department: '',
    month: '',
    year: new Date().getFullYear().toString(),
    bankAccount: '',
    bankName: '',
    panNumber: '',
    joiningDate: '',
    companyInfo: {
      name: 'Infopearl Tech Solutions Pvt Ltd',
      address1: 'G1 Akansha Apartment',
      address2: 'Patel Nagar, City center',
      phone: '7000937390',
      email: 'infopearl396@gmail.com',
      website: 'www.infopearl.in'
    },
    earnings: [
      {
        id: Date.now().toString(),
        description: 'Basic Salary',
        amount: 0
      },
      {
        id: Date.now().toString() + 1,
        description: 'HRA',
        amount: 0
      },
      {
        id: Date.now().toString() + 2,
        description: 'Conveyance Allowance',
        amount: 0
      }
    ],
    deductions: [
      {
        id: Date.now().toString() + 3,
        description: 'Professional Tax',
        amount: 0,
        isPercentage: false,
        percentage: 0
      },
      {
        id: Date.now().toString() + 4,
        description: 'Income Tax',
        amount: 0,
        isPercentage: false,
        percentage: 0
      }
    ],
    totalEarnings: '0.00',
    totalDeductions: '0.00',
    netSalary: '0.00'
  });

  // Auto-fill current month when component mounts
  useEffect(() => {
    const currentDate = new Date();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonth = monthNames[currentDate.getMonth()];
    
    setFormData(prev => ({
      ...prev,
      month: currentMonth
    }));
  }, []);

  // Format date as DD/MM/YYYY
  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Handle input changes for basic fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle earnings changes
  const handleEarningChange = (index, field, value) => {
    const newEarnings = [...formData.earnings];
    
    // For amount field, ensure it only contains numeric values
    if (field === 'amount') {
      // Allow only numbers and decimal point
      if (!/^(\d*\.?\d*)$/.test(value) && value !== '') {
        return; // Reject non-numeric input
      }
    }
    
    newEarnings[index][field] = value;
    
    // Update form data with new earnings
    setFormData(prev => ({
      ...prev,
      earnings: newEarnings
    }));
    
    // Recalculate totals
    calculateTotals(newEarnings, formData.deductions);
  };

  // Handle deductions changes
  const handleDeductionChange = (index, field, value) => {
    const newDeductions = [...formData.deductions];
    
    if (field === 'amount') {
      // Allow only numbers and decimal point
      if (!/^(\d*\.?\d*)$/.test(value) && value !== '') {
        return; // Reject non-numeric input
      }
      
      newDeductions[index][field] = value;
      
      // If this is a percentage-based deduction, update the amount based on percentage
      if (newDeductions[index].isPercentage) {
        const percentage = parseFloat(newDeductions[index].percentage || 0);
        const totalEarnings = parseFloat(formData.totalEarnings);
        newDeductions[index].amount = ((percentage / 100) * totalEarnings).toFixed(2);
      }
    } else if (field === 'percentage') {
      // Allow only numbers and decimal point
      if (!/^(\d*\.?\d*)$/.test(value) && value !== '') {
        return; // Reject non-numeric input
      }
      
      newDeductions[index].percentage = value;
      
      // If this is a percentage-based deduction, update the amount based on percentage
      if (newDeductions[index].isPercentage) {
        const percentage = parseFloat(value || 0);
        const totalEarnings = parseFloat(formData.totalEarnings);
        newDeductions[index].amount = ((percentage / 100) * totalEarnings).toFixed(2);
      }
    } else if (field === 'isPercentage') {
      newDeductions[index].isPercentage = value;
      
      // If switching to percentage, initialize with current percentage calculation
      if (value) {
        const totalEarnings = parseFloat(formData.totalEarnings);
        if (totalEarnings > 0) {
          const currentAmount = parseFloat(newDeductions[index].amount || 0);
          const calculatedPercentage = (currentAmount / totalEarnings) * 100;
          newDeductions[index].percentage = calculatedPercentage.toFixed(2);
        } else {
          newDeductions[index].percentage = "0";
        }
      }
    } else {
      newDeductions[index][field] = value;
    }
    
    // Update form data with new deductions
    setFormData(prev => ({
      ...prev,
      deductions: newDeductions
    }));
    
    // Recalculate totals
    calculateTotals(formData.earnings, newDeductions);
  };

  // Calculate totals based on earnings and deductions
  const calculateTotals = (earnings, deductions) => {
    const totalEarnings = earnings.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    
    // Calculate deductions, applying percentages where needed
    const totalDeductions = deductions.reduce((sum, item) => {
      let deductionAmount = parseFloat(item.amount || 0);
      
      // Recalculate percentage-based deductions based on total earnings
      if (item.isPercentage) {
        const percentage = parseFloat(item.percentage || 0);
        deductionAmount = (percentage / 100) * totalEarnings;
      }
      
      return sum + deductionAmount;
    }, 0);
    
    const netSalary = totalEarnings - totalDeductions;
    
    setFormData(prev => ({
      ...prev,
      totalEarnings: totalEarnings.toFixed(2),
      totalDeductions: totalDeductions.toFixed(2),
      netSalary: netSalary.toFixed(2)
    }));
  };

  // Add new earning row
  const addEarningRow = () => {
    const newEarning = {
      id: Date.now().toString(),
      description: '',
      amount: 0
    };
    
    const newEarnings = [...formData.earnings, newEarning];
    
    setFormData(prev => ({
      ...prev,
      earnings: newEarnings
    }));
  };

  // Add new deduction row
  const addDeductionRow = () => {
    const newDeduction = {
      id: Date.now().toString(),
      description: '',
      amount: 0,
      isPercentage: false,
      percentage: 0
    };
    
    const newDeductions = [...formData.deductions, newDeduction];
    
    setFormData(prev => ({
      ...prev,
      deductions: newDeductions
    }));
  };

  // Remove earning row
  const removeEarningRow = (index) => {
    if (formData.earnings.length > 1) {
      const newEarnings = [...formData.earnings];
      newEarnings.splice(index, 1);
      
      setFormData(prev => ({
        ...prev,
        earnings: newEarnings
      }));
      
      calculateTotals(newEarnings, formData.deductions);
    }
  };

  // Remove deduction row
  const removeDeductionRow = (index) => {
    if (formData.deductions.length > 1) {
      const newDeductions = [...formData.deductions];
      newDeductions.splice(index, 1);
      
      setFormData(prev => ({
        ...prev,
        deductions: newDeductions
      }));
      
      calculateTotals(formData.earnings, newDeductions);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.employeeName) {
      alert('Please enter employee name');
      return;
    }
    
    console.log('Salary slip form submitted:', formData);
    
    // Show salary slip preview
    setShowSalarySlipPreview(true);
  };

  // Handle Print Preview
  const handlePrintPreview = () => {
    try {
      const printContent = document.getElementById('salary-slip-preview');
      if (!printContent) {
        console.error('Could not find element with id "salary-slip-preview"');
        return;
      }

      // Create a new window
      const printWindow = window.open('', '', 'width=900,height=650');
      if (!printWindow) {
        console.error('Failed to open print window');
        return;
      }

      // Write only the salary slip content into the new window
      printWindow.document.write(`
        <html>
          <head>
            <title>Salary Slip Preview</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
              }
              table, th, td {
                border: 1px solid black;
                border-collapse: collapse;
                padding: 8px;
                width: 100%;
              }
              .slip-container {
                max-width: 800px;
                margin: auto;
              }
            </style>
          </head>
          <body>
            <div class="slip-container">
              ${printContent.innerHTML}
            </div>
          </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();

      // Print and close after a short delay
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
      
    } catch (error) {
      console.error('Error while trying to print:', error);
    }
  };
  
  // Navigate back to form
  const handleBackToForm = () => {
    setShowSalarySlipPreview(false);
  };
  
  // Navigate to home
  const handleBackToHome = () => {
    navigate('/');
  };

  // Handle Save and PDF Download
  const handleSaveAndDownload = async () => {
    try {
      setIsGeneratingPdf(true);
      
      // First save the salary slip data
      const salarySlips = JSON.parse(localStorage.getItem('salarySlips') || '[]');
      
      // Create a properly formatted salary slip object
      const slipToSave = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      
      // Check if this slip is already in the list
      const existingIndex = salarySlips.findIndex(slip => 
        slip.employeeId === formData.employeeId && 
        slip.month === formData.month && 
        slip.year === formData.year
      );
      
      if (existingIndex >= 0) {
        // Update existing slip
        salarySlips[existingIndex] = {
          ...slipToSave,
          updatedAt: new Date().toISOString()
        };
      } else {
        // This is a new salary slip
        salarySlips.push(slipToSave);
      }
      
      // Save to localStorage
      localStorage.setItem('salarySlips', JSON.stringify(salarySlips));
      console.log("Saved salary slip:", slipToSave);
      
      // Then generate and download PDF
      const slipElement = document.getElementById('salary-slip-preview');
      if (!slipElement) {
        console.error('Could not find element with id "salary-slip-preview"');
        alert('Error generating PDF. Please try again.');
        setIsGeneratingPdf(false);
        return;
      }
      
      // Use html2canvas to render the slip to a canvas
      const canvas = await html2canvas(slipElement, {
        scale: 2, // Higher scale for better quality
        useCORS: true, // Allow loading external images
        logging: false
      });
      
      // Create PDF from canvas
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`SalarySlip_${formData.employeeName}_${formData.month}_${formData.year}.pdf`);
      
      // Show success message
      alert('Salary slip saved and downloaded as PDF successfully!');
      
      // Navigate back to home
      navigate('/');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating the PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <Container fluid>
      {!showSalarySlipPreview ? (
        // Salary Slip Creation Form
        <>
          <div className="salary-slip-header mb-4" style={{ 
            background: 'linear-gradient(135deg, #051937, #004d7a)',
            padding: '25px',
            borderRadius: '0',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                height: '120px', 
                width: '120px',
                marginRight: '25px',
                backgroundColor: 'white',
                padding: '5px',
                borderRadius: '0',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <img 
                  src={logo} 
                  alt="Company Logo" 
                  style={{ maxWidth: '100%', maxHeight: '100%' }} 
                />
              </div>
              <div>
                <h2 style={{ margin: '0', fontWeight: 'bold', fontSize: '24px' }}>Infopearl Tech Solutions Pvt Ltd</h2>
                <p style={{ margin: '5px 0', textAlign: 'left', fontSize: '14px' }}>G1 Akansha Apartment</p>
                <p style={{ margin: '5px 0', textAlign: 'left', fontSize: '14px' }}>Patel Nagar, City center</p>
                <p style={{ margin: '5px 0', textAlign: 'left', fontSize: '14px' }}>7000937390</p>
                <p style={{ margin: '5px 0', textAlign: 'left', fontSize: '14px' }}>infopearl396@gmail.com</p>
                <p style={{ margin: '5px 0', textAlign: 'left', fontSize: '14px' }}>www.infopearl.in</p>
              </div>
            </div>
            <div>
              <h1 style={{ fontSize: '48px', margin: '0', fontWeight: 'bold', color: '#ffffff' }}>SALARY SLIP</h1>
            </div>
          </div>

          <h1 className="mb-4">Create Salary Slip</h1>
          
          <Form onSubmit={handleSubmit}>
            {/* Employee Information */}
            <Card className="mb-4">
              <Card.Header className="bg-light">
                <h5 className="mb-0">Employee Information</h5>
              </Card.Header>
              <Card.Body>
                <Row className="mb-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Employee ID</Form.Label>
                      <Form.Control
                        type="text"
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Employee Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="employeeName"
                        value={formData.employeeName}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Designation</Form.Label>
                      <Form.Control
                        type="text"
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row className="mb-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Department</Form.Label>
                      <Form.Control
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Joining Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="joiningDate"
                        value={formData.joiningDate}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>PAN Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="panNumber"
                        value={formData.panNumber}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row className="mb-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Bank Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Bank Account</Form.Label>
                      <Form.Control
                        type="text"
                        name="bankAccount"
                        value={formData.bankAccount}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Month</Form.Label>
                      <Form.Select
                        name="month"
                        value={formData.month}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Month</option>
                        <option value="January">January</option>
                        <option value="February">February</option>
                        <option value="March">March</option>
                        <option value="April">April</option>
                        <option value="May">May</option>
                        <option value="June">June</option>
                        <option value="July">July</option>
                        <option value="August">August</option>
                        <option value="September">September</option>
                        <option value="October">October</option>
                        <option value="November">November</option>
                        <option value="December">December</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Year</Form.Label>
                      <Form.Control
                        type="text"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Earnings Section */}
            <Card className="mb-4">
              <Card.Header className="bg-light">
                <h5 className="mb-0">Earnings</h5>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <Table bordered>
                    <thead className="bg-light">
                      <tr>
                        <th style={{ width: '70%' }}>Description</th>
                        <th style={{ width: '20%' }}>Amount (₹)</th>
                        <th style={{ width: '10%' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.earnings.map((earning, index) => (
                        <tr key={earning.id}>
                          <td>
                            <Form.Control
                              type="text"
                              value={earning.description}
                              onChange={(e) => handleEarningChange(index, 'description', e.target.value)}
                              required
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="text"
                              value={earning.amount}
                              onChange={(e) => handleEarningChange(index, 'amount', e.target.value)}
                              required
                            />
                          </td>
                          <td className="text-center">
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => removeEarningRow(index)}
                              disabled={formData.earnings.length === 1}
                              aria-label="Delete earning"
                              style={{ 
                                width: "32px", 
                                height: "32px", 
                                padding: "0",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "4px"
                              }}
                            >
                              <i className="bi bi-trash-fill"></i>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
                
                <Button 
                  variant="success" 
                  onClick={addEarningRow}
                  className="mb-3"
                  size="sm"
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Add Earning
                </Button>
              </Card.Body>
            </Card>

            {/* Deductions Section */}
            <Card className="mb-4">
              <Card.Header className="bg-light">
                <h5 className="mb-0">Deductions</h5>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <Table bordered>
                    <thead className="bg-light">
                      <tr>
                        <th style={{ width: '50%' }}>Description</th>
                        <th style={{ width: '15%' }}>Type</th>
                        <th style={{ width: '15%' }}>Value</th>
                        <th style={{ width: '10%' }}>Amount (₹)</th>
                        <th style={{ width: '10%' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.deductions.map((deduction, index) => (
                        <tr key={deduction.id}>
                          <td>
                            <Form.Control
                              type="text"
                              value={deduction.description}
                              onChange={(e) => handleDeductionChange(index, 'description', e.target.value)}
                              required
                            />
                          </td>
                          <td>
                            <Form.Select
                              value={deduction.isPercentage ? "percentage" : "fixed"}
                              onChange={(e) => handleDeductionChange(index, 'isPercentage', e.target.value === "percentage")}
                            >
                              <option value="fixed">Fixed</option>
                              <option value="percentage">Percentage</option>
                            </Form.Select>
                          </td>
                          <td>
                            {deduction.isPercentage ? (
                              <InputGroup>
                                <Form.Control
                                  type="text"
                                  value={deduction.percentage}
                                  onChange={(e) => handleDeductionChange(index, 'percentage', e.target.value)}
                                  required
                                />
                                <InputGroup.Text>%</InputGroup.Text>
                              </InputGroup>
                            ) : (
                              <Form.Control
                                type="text"
                                value={deduction.amount}
                                onChange={(e) => handleDeductionChange(index, 'amount', e.target.value)}
                                required
                              />
                            )}
                          </td>
                          <td className="text-end">
                            {deduction.isPercentage ? (
                              <span>₹{parseFloat(deduction.amount).toFixed(2)}</span>
                            ) : (
                              <span>₹{parseFloat(deduction.amount).toFixed(2)}</span>
                            )}
                          </td>
                          <td className="text-center">
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => removeDeductionRow(index)}
                              disabled={formData.deductions.length === 1}
                              aria-label="Delete deduction"
                              style={{ 
                                width: "32px", 
                                height: "32px", 
                                padding: "0",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "4px"
                              }}
                            >
                              <i className="bi bi-trash-fill"></i>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
                
                <Button 
                  variant="success" 
                  onClick={addDeductionRow}
                  className="mb-3"
                  size="sm"
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Add Deduction
                </Button>
              </Card.Body>
            </Card>

            {/* Summary Section */}
            <Card className="mb-4">
              <Card.Header className="bg-light">
                <h5 className="mb-0">Summary</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6} className="offset-md-6">
                    <Table bordered>
                      <tbody>
                        <tr>
                          <td className="text-end fw-bold">Total Earnings</td>
                          <td className="text-end" style={{ width: '150px' }}>₹{formData.totalEarnings}</td>
                        </tr>
                        <tr>
                          <td className="text-end fw-bold">Total Deductions</td>
                          <td className="text-end">₹{formData.totalDeductions}</td>
                        </tr>
                        <tr className="bg-primary text-white">
                          <td className="text-end fw-bold">Net Salary</td>
                          <td className="text-end fw-bold">₹{formData.netSalary}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
            
            <div className="d-grid mb-5">
              <Button 
                type="submit" 
                size="lg"
                style={{ 
                  background: 'linear-gradient(135deg, #051937, #004d7a)',
                  border: 'none',
                  width: '40%',
                  margin: '0 auto'
                }}
              >
                Generate Salary Slip
              </Button>
            </div>
          </Form>
        </>
      ) : (
        // Salary Slip Preview
        <div className="salary-slip-preview-container">
          <div className="d-flex justify-content-between mb-4 p-2" style={{ 
            backgroundColor: '#f8f9fa', 
            borderRadius: '4px',
            borderLeft: '4px solid #051937'
          }}>
            <Button 
              variant="outline-secondary" 
              onClick={handleBackToForm}
              className="d-flex align-items-center"
            >
              <i className="bi bi-arrow-left me-2"></i>Back to Edit
            </Button>
            <div>
              <Button 
                variant="outline-primary" 
                className="me-2"
                onClick={handlePrintPreview}
                style={{ borderColor: '#051937', color: '#051937' }}
              >
                <i className="bi bi-printer me-2"></i>Print
              </Button>
              <Button 
                variant="success"
                onClick={handleSaveAndDownload}
                disabled={isGeneratingPdf}
                style={{ background: 'linear-gradient(135deg, #051937, #004d7a)', borderColor: '#051937' }}
              >
                {isGeneratingPdf ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>Save
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div 
            id="salary-slip-preview" 
            className="salary-slip-document" 
            ref={slipRef}
            style={{
              maxWidth: '850px',
              margin: '0 auto',
              padding: '0',
              backgroundColor: '#fff',
              boxShadow: '0 0 10px rgba(0,0,0,0.1)',
              border: '1px solid #ddd'
            }}
          >
            {/* Salary Slip Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #051937, #004d7a)',
              color: '#fff',
              padding: '15px 20px',
              marginBottom: '0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                  height: '70px', 
                  width: '70px',
                  marginRight: '15px',
                  backgroundColor: 'white',
                  padding: '2px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <img 
                    src={logo} 
                    alt="Company Logo" 
                    style={{ maxWidth: '100%', maxHeight: '100%' }} 
                  />
                </div>
                <div>
                  <h2 style={{ margin: '0', fontWeight: 'bold', fontSize: '18px' }}>Infopearl Tech Solutions Pvt Ltd</h2>
                  <p style={{ margin: '2px 0', fontSize: '11px' }}>G1 Akansha Apartment</p>
                  <p style={{ margin: '2px 0', fontSize: '11px' }}>Patel Nagar, City center</p>
                  <p style={{ margin: '2px 0', fontSize: '11px' }}>7000937390</p>
                  <p style={{ margin: '2px 0', fontSize: '11px' }}>infopearl396@gmail.com</p>
                  <p style={{ margin: '2px 0', fontSize: '11px' }}>www.infopearl.in</p>
                </div>
              </div>
              <div>
                <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>SALARY SLIP</h1>
              </div>
            </div>

            {/* Create Salary Slip Title */}
            <div style={{ 
              textAlign: 'center', 
              padding: '15px 0', 
              borderBottom: '1px solid #e0e0e0' 
            }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Create Salary Slip</h3>
            </div>

            {/* Employee Information Section */}
            <div style={{ padding: '15px 20px' }}>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '8px 15px', 
                marginBottom: '10px',
                borderBottom: '1px solid #e0e0e0',
                borderTop: '1px solid #e0e0e0'
              }}>
                <h4 style={{ 
                  margin: '0', 
                  fontSize: '14px', 
                  fontWeight: 'bold'
                }}>
                  Employee Information
                </h4>
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0', marginBottom: '10px' }}>
                <div style={{ flex: '1 1 33%', padding: '5px 10px' }}>
                  <div style={{ fontSize: '13px', color: '#666' }}>Employee ID</div>
                  <div style={{ marginTop: '3px' }}>{formData.employeeId}</div>
                </div>
                <div style={{ flex: '1 1 33%', padding: '5px 10px' }}>
                  <div style={{ fontSize: '13px', color: '#666' }}>Employee Name</div>
                  <div style={{ marginTop: '3px' }}>{formData.employeeName}</div>
                </div>
                <div style={{ flex: '1 1 33%', padding: '5px 10px' }}>
                  <div style={{ fontSize: '13px', color: '#666' }}>Designation</div>
                  <div style={{ marginTop: '3px' }}>{formData.designation}</div>
                </div>
                </div>
                
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0', marginBottom: '10px' }}>
                <div style={{ flex: '1 1 33%', padding: '5px 10px' }}>
                  <div style={{ fontSize: '13px', color: '#666' }}>Department</div>
                  <div style={{ marginTop: '3px' }}>{formData.department}</div>
                </div>
                <div style={{ flex: '1 1 33%', padding: '5px 10px' }}>
                  <div style={{ fontSize: '13px', color: '#666' }}>Joining Date</div>
                  <div style={{ marginTop: '3px' }}>{formData.joiningDate}</div>
                </div>
                <div style={{ flex: '1 1 33%', padding: '5px 10px' }}>
                  <div style={{ fontSize: '13px', color: '#666' }}>PAN Number</div>
                  <div style={{ marginTop: '3px' }}>{formData.panNumber}</div>
              </div>
            </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0' }}>
                <div style={{ flex: '1 1 33%', padding: '5px 10px' }}>
                  <div style={{ fontSize: '13px', color: '#666' }}>Bank Name</div>
                  <div style={{ marginTop: '3px' }}>{formData.bankName}</div>
                </div>
                <div style={{ flex: '1 1 33%', padding: '5px 10px' }}>
                  <div style={{ fontSize: '13px', color: '#666' }}>Bank Account</div>
                  <div style={{ marginTop: '3px' }}>{formData.bankAccount}</div>
                </div>
                <div style={{ flex: '1 1 16.5%', padding: '5px 10px' }}>
                  <div style={{ fontSize: '13px', color: '#666' }}>Month</div>
                  <div style={{ marginTop: '3px' }}>{formData.month}</div>
                </div>
                <div style={{ flex: '1 1 16.5%', padding: '5px 10px' }}>
                  <div style={{ fontSize: '13px', color: '#666' }}>Year</div>
                  <div style={{ marginTop: '3px' }}>{formData.year}</div>
                </div>
              </div>
            </div>

            {/* Earnings Section */}
            <div style={{ padding: '0 20px 15px 20px' }}>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '8px 15px', 
                marginBottom: '10px',
                borderBottom: '1px solid #e0e0e0',
                borderTop: '1px solid #e0e0e0'
              }}>
                <h4 style={{ 
                  margin: '0', 
                  fontSize: '14px', 
                  fontWeight: 'bold'
                }}>
                  Earnings
                </h4>
              </div>
              
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse', 
                marginBottom: '20px'
                }}>
                  <thead>
                  <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '13px', fontWeight: 'bold', width: '70%' }}>Description</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold', width: '15%' }}>Amount (₹)</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', fontSize: '13px', fontWeight: 'bold', width: '15%' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.earnings.map((earning, index) => (
                      <tr key={earning.id} style={{ 
                      borderBottom: '1px solid #f0f0f0'
                      }}>
                      <td style={{ padding: '8px 10px', textAlign: 'left', fontSize: '13px' }}>{earning.description}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontSize: '13px' }}>{parseFloat(earning.amount).toFixed(2)}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                        <button style={{ 
                          border: 'none', 
                          background: '#dc3545', 
                          color: 'white', 
                          borderRadius: '3px',
                          padding: '3px 7px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
            {/* Deductions Section */}
            <div style={{ padding: '0 20px 15px 20px' }}>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '8px 15px', 
                marginBottom: '10px',
                borderBottom: '1px solid #e0e0e0',
                borderTop: '1px solid #e0e0e0'
              }}>
                <h4 style={{ 
                  margin: '0', 
                  fontSize: '14px', 
                  fontWeight: 'bold'
                }}>
                  Deductions
                </h4>
              </div>
              
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse', 
                marginBottom: '20px'
                }}>
                  <thead>
                  <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '13px', fontWeight: 'bold', width: '40%' }}>Description</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', fontSize: '13px', fontWeight: 'bold', width: '20%' }}>Type</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', fontSize: '13px', fontWeight: 'bold', width: '15%' }}>Value</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold', width: '15%' }}>Amount (₹)</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', fontSize: '13px', fontWeight: 'bold', width: '10%' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.deductions.map((deduction, index) => (
                      <tr key={deduction.id} style={{ 
                      borderBottom: '1px solid #f0f0f0'
                    }}>
                      <td style={{ padding: '8px 10px', textAlign: 'left', fontSize: '13px' }}>{deduction.description}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', fontSize: '13px' }}>
                        <div style={{ 
                          border: '1px solid #ced4da', 
                          borderRadius: '4px', 
                          padding: '4px 8px', 
                          fontSize: '12px' 
                      }}>
                          Fixed
                        </div>
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', fontSize: '13px' }}>
                        {deduction.isPercentage ? `${deduction.percentage}%` : '0'}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontSize: '13px' }}>{parseFloat(deduction.amount).toFixed(2)}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                        <button style={{ 
                          border: 'none', 
                          background: '#dc3545', 
                          color: 'white', 
                          borderRadius: '3px',
                          padding: '3px 7px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>

            {/* Summary Section */}
            <div style={{ padding: '0 20px 20px 20px' }}>
            <div style={{ 
                background: '#f8f9fa', 
                padding: '8px 15px', 
                marginBottom: '10px',
                borderBottom: '1px solid #e0e0e0',
                borderTop: '1px solid #e0e0e0'
              }}>
                <h4 style={{ 
                  margin: '0', 
                  fontSize: '14px', 
                  fontWeight: 'bold'
            }}>
                  Summary
                </h4>
            </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <table style={{ 
                  width: '300px', 
                  borderCollapse: 'collapse',
                  marginTop: '10px'
                }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '5px 10px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold' }}>Total Earnings</td>
                      <td style={{ padding: '5px 10px', textAlign: 'right', fontSize: '13px', width: '100px' }}>₹{formData.totalEarnings}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '5px 10px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold' }}>Total Deductions</td>
                      <td style={{ padding: '5px 10px', textAlign: 'right', fontSize: '13px' }}>₹{formData.totalDeductions}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '5px 10px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold' }}>Net Salary</td>
                      <td style={{ padding: '5px 10px', textAlign: 'right', fontSize: '13px', fontWeight: 'bold' }}>₹{formData.netSalary}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Generate Button */}
              <div style={{ 
                display: 'flex', 
              justifyContent: 'center', 
              padding: '10px 20px 30px 20px' 
              }}>
              <button style={{ 
                background: 'linear-gradient(135deg, #051937, #004d7a)',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                fontWeight: 'bold',
                width: '250px',
                cursor: 'pointer'
              }}>
                Generate Salary Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default SalarySlip; 