import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Form, Button, Card, InputGroup, Table, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'bootstrap-icons/font/bootstrap-icons.css';
import logo from '../../assets/logo1.png';
import './SalarySlip.css';

const SalarySlip = () => {
  // Add navigate for redirecting after form submission
  const navigate = useNavigate();
  const [showSalarySlipPreview, setShowSalarySlipPreview] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [savedSlipId, setSavedSlipId] = useState(null);

  // Reference for the slip to be printed
  const printRef = useRef(null);

  // Reference for the slip preview
  const slipRef = useRef(null);

  // State for form data
  // const [formData, setFormData] = useState({
  //   employeeId: 'EMP001',
  //   employeeName: '',
  //   designation: '',
  //   department: '',
  //   payPeriod: '',  // New field
  //   paidDays: '',   // New field
  //   lossOfPayDays: '',  // New field
  //   payDate: '',    // New field
  //   companyInfo: {
  //     name: 'Infopearl Tech Solutions Pvt Ltd',
  //     address1: 'G1 Akansha Apartment',
  //     address2: 'Patel Nagar, City center',
  //     phone: '7000937390',
  //     email: 'infopearl396@gmail.com',
  //     website: 'www.infopearl.in'
  //   },
  //   additionalFields: [],  // For custom fields added by the user
  //   earnings: [/* ... */],
  //   deductions: [/* ... */],
  //   totalEarnings: '0.00',
  //   totalDeductions: '0.00',
  //   netSalary: '0.00',
  // });
  
  const [formData, setFormData] = useState({
    employeeId: 'EMP001',
    employeeName: '',
    designation: '',
    department: '',
    payPeriod: '',  // New field
    paidDays: '',   // New field
    lossOfPayDays: '',  // New field
    payDate: '',    // New field
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
    ],
    deductions: [
      
      {
        id: Date.now().toString() + 4,
        description: 'Income Tax',
        amount: 0,
        isPercentage: false,
        percentage: 0
      },
      {
        id: Date.now().toString() + 5,
        description: 'PF',
        amount: 0,
        isPercentage: false,
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
    
    // Get or initialize the next employee ID
    let nextEmpId = 1;
    try {
      const storedNextEmpId = localStorage.getItem('next_employee_id');
      if (storedNextEmpId) {
        const parsedId = parseInt(storedNextEmpId);
        if (!isNaN(parsedId) && parsedId >= 1) {
          nextEmpId = parsedId;
        }
      } else {
        // If it doesn't exist, check if we have existing salary slips
        const savedSlipsString = localStorage.getItem('salarySlips');
        if (savedSlipsString) {
          const savedSlips = JSON.parse(savedSlipsString);
          if (Array.isArray(savedSlips) && savedSlips.length > 0) {
            // Find the highest existing employee ID
            const numericIds = savedSlips
              .map(slip => {
                if (slip.employeeId && slip.employeeId.startsWith('EMP')) {
                  const numPart = slip.employeeId.replace('EMP', '');
                  return parseInt(numPart);
                }
                return 0;
              })
              .filter(id => !isNaN(id));
              
            if (numericIds.length > 0) {
              // Get the maximum ID and add 1 for the next ID
              nextEmpId = Math.max(...numericIds, 0) + 1;
            }
          }
        }
        
        // Initialize next_employee_id in localStorage
        localStorage.setItem('next_employee_id', nextEmpId.toString());
      }
    } catch (error) {
      console.error("Error determining initial employee ID:", error);
      // In case of any error, use 1 and reset localStorage
      localStorage.setItem('next_employee_id', '1');
      nextEmpId = 1;
    }
    
    // Format employee ID with padding (e.g., EMP0001)
    const formattedEmployeeId = `EMP${nextEmpId.toString().padStart(4, '0')}`;
    
    setFormData(prev => ({
      ...prev,
      employeeId: formattedEmployeeId,
      month: currentMonth
    }));
    
    // Don't increment the counter here since we don't know if the user will actually save this slip
  }, []);

  // Format date as DD/MM/YYYY
  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Function to add a new custom field
  const handleAddField = () => {
    setFormData(prev => ({
      ...prev,
      additionalFields: [...prev.additionalFields, { name: '', value: '' }]
    }));
  };

  // Function to handle changes to the custom field
  const handleCustomFieldChange = (index, field, value) => {
    const updatedFields = [...formData.additionalFields];
    updatedFields[index][field] = value;
    setFormData(prev => ({
      ...prev,
      additionalFields: updatedFields
    }));
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
    setShowSuccessMessage(false);
  };
  
  // Navigate back to form with reset (after saving)
  const handleBackToNewForm = () => {
    // Reset form data to defaults
    const currentDate = new Date();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonth = monthNames[currentDate.getMonth()];
    
    // Get the next employee ID from localStorage
    let nextEmpId = 1;
    try {
      const storedNextEmpId = localStorage.getItem('next_employee_id');
      if (storedNextEmpId) {
        const parsedId = parseInt(storedNextEmpId);
        if (!isNaN(parsedId) && parsedId >= 1) {
          nextEmpId = parsedId;
        }
      } else {
        // If it doesn't exist, check if we have existing salary slips
        const savedSlipsString = localStorage.getItem('salarySlips');
        if (savedSlipsString) {
          const savedSlips = JSON.parse(savedSlipsString);
          if (Array.isArray(savedSlips) && savedSlips.length > 0) {
            // Find the highest existing employee ID
            const numericIds = savedSlips
              .map(slip => {
                if (slip.employeeId && slip.employeeId.startsWith('EMP')) {
                  const numPart = slip.employeeId.replace('EMP', '');
                  return parseInt(numPart);
                }
                return 0;
              })
              .filter(id => !isNaN(id));
              
            if (numericIds.length > 0) {
              // Get the maximum ID and add 1 for the next ID
              nextEmpId = Math.max(...numericIds, 0) + 1;
            }
          }
        }
        
        // Initialize next_employee_id in localStorage
        localStorage.setItem('next_employee_id', nextEmpId.toString());
      }
    } catch (error) {
      console.error("Error determining next employee ID:", error);
      // In case of any error, use 1 and reset localStorage
      localStorage.setItem('next_employee_id', '1');
      nextEmpId = 1;
    }
    
    // Format employee ID with padding (e.g., EMP0001)
    const formattedEmployeeId = `EMP${nextEmpId.toString().padStart(4, '0')}`;
    
    // Increment for next time
    localStorage.setItem('next_employee_id', (nextEmpId + 1).toString());
    
    setFormData({
      employeeId: formattedEmployeeId,
      employeeName: '',
      designation: '',
      department: '',
      month: currentMonth,
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
          id: Date.now().toString() + 4,
          description: 'Income Tax',
          amount: 0,
          isPercentage: false,
          percentage: 0
        },
        {
          id: Date.now().toString() + 5,
          description: 'PF',
          amount: 0,
          isPercentage: false,
        }
      ],
      totalEarnings: '0.00',
      totalDeductions: '0.00',
      netSalary: '0.00'
    });
    
    // Go back to form view
    setShowSalarySlipPreview(false);
    setShowSuccessMessage(false);
  };
  
  // Navigate to home
  const handleBackToHome = () => {
    navigate('/');
  };

  // Navigate to salary dashboard
  const handleBackToDashboard = () => {
    navigate('/manage-salary');
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
      
      let isNewSlip = false;
      
      if (existingIndex >= 0) {
        // Update existing slip
        salarySlips[existingIndex] = {
          ...slipToSave,
          updatedAt: new Date().toISOString()
        };
      } else {
        // This is a new salary slip
        salarySlips.push(slipToSave);
        isNewSlip = true;
      }
      
      // Save to localStorage
      localStorage.setItem('salarySlips', JSON.stringify(salarySlips));
      console.log("Saved salary slip:", slipToSave);
      
      // If it's a new slip, increment the next employee ID
      if (isNewSlip) {
        try {
          const currentId = parseInt(localStorage.getItem('next_employee_id') || '1');
          localStorage.setItem('next_employee_id', (currentId + 1).toString());
        } catch (error) {
          console.error('Error updating next employee ID:', error);
        }
      }
      
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
      
      // Store saved slip ID for editing
      setSavedSlipId(slipToSave.id);
      
      // Show success message instead of alert
      setShowSuccessMessage(true);
      
      // Stay on the same page instead of navigating to home
      // navigate('/'); - commented out
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating the PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  function numberToWords(num) {
    const ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
    const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
    const units = ["", "thousand", "million", "billion"];
  
    if (num === 0) return "zero";
  
    function convertBelowThousand(n) {
      if (n < 20) return ones[n];
      if (n < 100) {
        return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? "-" + ones[n % 10] : "");
      }
      return ones[Math.floor(n / 100)] + " hundred" + (n % 100 !== 0 ? " and " + convertBelowThousand(n % 100) : "");
    }
  
    let words = "";
    let i = 0;
    while (num > 0) {
      if (num % 1000 !== 0) {
        words = convertBelowThousand(num % 1000) + " " + units[i] + " " + words;
      }
      num = Math.floor(num / 1000);
      i++;
    }
    return words.trim();
  }
  
  // Example usage:
  console.log(numberToWords(123));     // "one hundred and twenty-three"
  console.log(numberToWords(1500));    // "one thousand five hundred"
  console.log(numberToWords(1234567)); // "one million two hundred thirty-four thousand five hundred sixty-seven"
  

  return (
    <Container fluid>
      <h1 className="mb-4">Create Salary Slip</h1>
      {!showSalarySlipPreview ? (
        // Salary Slip Creation Form
        <>
          <div className="salary-slip-header mb-4" style={{ 
            background: 'white',
            padding: '25px',
            borderRadius: '0',
            color: '#004d7a',
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
                <p style={{ margin: '5px 0', textAlign: 'left', fontSize: '14px' }}>www.infopearl.in</p>
              </div>
            </div>
            <div style={{ marginRight: '70px' }}>
            <p style={{ margin: '5px 0', textAlign: 'left', fontSize: '14px' }}>G1 Akansha Apartment</p>
                <p style={{ margin: '5px 0', textAlign: 'left', fontSize: '14px' }}>Patel Nagar, City center</p>
                <p style={{ margin: '5px 0', textAlign: 'left', fontSize: '14px' }}>7000937390</p>
                <p style={{ margin: '5px 0', textAlign: 'left', fontSize: '14px' }}>infopearl396@gmail.com</p>
            </div>
          </div>
          
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
                      <Form.Label style={{ color: 'black' }}>Employee ID</Form.Label>
                      <Form.Control
                        type="text"
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleChange}
                        required
                      />
                      <Form.Text className="text-muted">
                        Auto-generated but can be edited if needed
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label style={{ color: 'black' }}>Employee Name</Form.Label>
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
                      <Form.Label style={{ color: 'black' }}>Designation</Form.Label>
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
                      <Form.Label style={{ color: 'black' }}>Department</Form.Label>
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
                      <Form.Label style={{ color: 'black' }}>Joining Date</Form.Label>
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
                      <Form.Label style={{ color: 'black' }}>Pay Period</Form.Label>
                      <Form.Control
                        type="text"
                        name="payPeriod"
                        value={formData.payPeriod}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row className="mb-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label style={{ color: 'black' }}>Paid Days</Form.Label>
                      <Form.Control
                        type="number"
                        name="paidDays"
                        value={formData.paidDays}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label style={{ color: 'black' }}>Loss of Pay Days</Form.Label>
                      <Form.Control
                        type="number"
                        name="lossOfPayDays"
                        value={formData.lossOfPayDays}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label style={{ color: 'black' }}>Pay Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="payDate"
                        value={formData.payDate}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Add Custom Fields Button */}
                {/* <Button variant="secondary" onClick={handleAddField}>
                  Add Custom Field
                </Button> */}

                {/* Render Custom Fields */}
                {/* {formData.additionalFields.map((field, index) => (
                  <Row key={index} className="mb-3">
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label style={{ color: 'black' }}>Field Name</Form.Label>
                        <Form.Control
                          type="text"
                          name={`customFieldName${index}`}
                          value={field.name}
                          onChange={(e) => handleCustomFieldChange(index, 'name', e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label style={{ color: 'black' }}>Field Value</Form.Label>
                        <Form.Control
                          type="text"
                          name={`customFieldValue${index}`}
                          value={field.value}
                          onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                )
              )
              } */}

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
                  <Col md={6} className="mx-auto text-center">
                    <Table bordered>
                      <tbody>
                        <tr>
                          <td className="text-end fw-bold">Total Earnings</td>
                          <td className="text-end" style={{ width: '750px' }}>₹{formData.totalEarnings}</td>
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
          {showSuccessMessage && (
            <Alert 
              variant="success" 
              className="d-flex justify-content-between align-items-center mb-4"
              style={{ 
                backgroundColor: '#d1e7dd', 
                borderColor: '#badbcc',
                borderRadius: '4px',
                padding: '15px 20px'
              }}
            >
              <div className="d-flex align-items-center">
                <i className="bi bi-check-circle-fill me-2" style={{ fontSize: '1.25rem', color: '#0f5132' }}></i>
                <span style={{ color: '#0f5132', fontWeight: 'bold' }}>Salary Slip saved and downloaded successfully!</span>
              </div>
              <Button variant="outline-success" size="sm" onClick={() => setShowSuccessMessage(false)}>
                <i className="bi bi-x-lg"></i>
              </Button>
            </Alert>
          )}
          
          <div className="d-flex justify-content-between mb-4 p-2" style={{ 
            backgroundColor: '#f8f9fa', 
            borderRadius: '4px',
            borderLeft: '4px solid #051937'
          }}>
            <div>
              <Button 
                variant="outline-secondary" 
                onClick={handleBackToNewForm}
                className="d-flex align-items-center me-2"
              >
                <i className="bi bi-arrow-left me-2"></i>Back
              </Button>
              <Button 
                variant="outline-primary" 
                onClick={handleBackToForm}
                className="d-flex align-items-center"
              >
                <i className="bi bi-pencil me-2"></i>Edit
              </Button>
            </div>
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
              padding: '20px',
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
              background: 'white',
              color: '#004d7a',
              padding: '20px',
              marginBottom: '30px',
              borderBottom: '2px solid #004d7a',
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                  height: '80px', 
                  width: '80px',
                  marginRight: '15px',
                  backgroundColor: 'white',
                  padding: '5px',
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
                  <p style={{ margin: '3px 0', textAlign: 'left', fontSize: '12px' }}>www.infopearl.in</p>
                </div>
              </div>
              <div style={{ marginRight: '50px' }}>
              <p style={{ margin: '3px 0', textAlign: 'left', fontSize: '12px' }}>G1 Akansha Apartment</p>
                  <p style={{ margin: '3px 0', textAlign: 'left', fontSize: '12px' }}>Patel Nagar, City center</p>
                  <p style={{ margin: '3px 0', textAlign: 'left', fontSize: '12px' }}>7000937390</p>
                  <p style={{ margin: '3px 0', textAlign: 'left', fontSize: '12px' }}>infopearl396@gmail.com</p>
              </div>
            </div>

            {/* Employee & Salary Information */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '10px', 
                marginBottom: '15px',
                borderLeft: '4px solid #051937'
              }}>
                <h3 style={{ 
                  margin: '0', 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  color: '#051937'
                }}>
                  Pay Slip for {formData.month} {formData.year}
                </h3>
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}>
                <div style={{ flex: '1 1 300px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '5px 0', fontWeight: 'bold', width: '150px' }}>Employee ID:</td>
                        <td style={{ padding: '5px 0' }}>{formData.employeeId}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '5px 0', fontWeight: 'bold' }}>Employee Name:</td>
                        <td style={{ padding: '5px 0' }}>{formData.employeeName}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '5px 0', fontWeight: 'bold' }}>Designation:</td>
                        <td style={{ padding: '5px 0' }}>{formData.designation}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '5px 0', fontWeight: 'bold' }}>Department:</td>
                        <td style={{ padding: '5px 0' }}>{formData.department}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div style={{ flex: '1 1 300px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '5px 0', fontWeight: 'bold', width: '150px' }}>Pay Period:</td>
                        <td style={{ padding: '5px 0' }}>{formData.payPeriod}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '5px 0', fontWeight: 'bold' }}>Paid Days:</td>
                        <td style={{ padding: '5px 0' }}>{formData.paidDays}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '5px 0', fontWeight: 'bold' }}>LOP Days:</td>
                        <td style={{ padding: '5px 0' }}>{formData.lossOfPayDays}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '5px 0', fontWeight: 'bold' }}>Pay Date:</td>
                        <td style={{ padding: '5px 0' }}>{formData.payDate}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Earnings & Deductions Table */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
              {/* Earnings */}
              <div style={{ flex: 1 }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse', 
                  border: '1px solid #ddd'
                }}>
                  <thead>
                    <tr style={{ background: 'white', color: '#051937' }}>
                      <th colSpan="2" style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #051937' }}>EARNINGS</th>
                    </tr>
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                      <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Description</th>
                      <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.earnings.map((earning, index) => (
                      <tr key={earning.id} style={{ 
                        borderBottom: index < formData.earnings.length - 1 ? '1px solid #ddd' : 'none'
                      }}>
                        <td style={{ padding: '8px', textAlign: 'left' }}>{earning.description}</td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>₹{parseFloat(earning.amount).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>
                      <td style={{ padding: '8px', textAlign: 'left', borderTop: '1px solid #ddd' }}>Total Earnings</td>
                      <td style={{ padding: '8px', textAlign: 'right', borderTop: '1px solid #ddd' }}>₹{formData.totalEarnings}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              {/* Deductions */}
              <div style={{ flex: 1 }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse', 
                  border: '1px solid #ddd'
                }}>
                  <thead>
                    <tr style={{ background: 'white', color: '#051937' }}>
                      <th colSpan="2" style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #051937' }}>DEDUCTIONS</th>
                    </tr>
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                      <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Description</th>
                      <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.deductions.map((deduction, index) => (
                      <tr key={deduction.id} style={{ 
                        borderBottom: index < formData.deductions.length - 1 ? '1px solid #ddd' : 'none'
                      }}>
                        <td style={{ padding: '8px', textAlign: 'left' }}>{deduction.description} {deduction.isPercentage ? `(${deduction.percentage}%)` : ''}</td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>₹{parseFloat(deduction.amount).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>
                      <td style={{ padding: '8px', textAlign: 'left', borderTop: '1px solid #ddd' }}>Total Deductions</td>
                      <td style={{ padding: '8px', textAlign: 'right', borderTop: '1px solid #ddd' }}>₹{formData.totalDeductions}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Net Salary Section - Centered */}
            <div style={{ 
              width: '50%', 
              margin: '0 auto 30px auto',
              background: 'white',
              color: '#051937',
              padding: '15px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontWeight: 'bold',
              fontSize: '18px',
              border: '1px solid #051937',
              borderRadius: '4px'
            }}>
              <span>Net Salary</span>
              <span>₹{formData.netSalary}</span>
              {/* <br />
              <span className="text-end fw-bold">
                ₹{formData.netSalary} ({numberToWords(parseInt(formData.netSalary))} Rupees)
              </span> */}
            </div>

            <div style={{ 
              width: '80%', 
              margin: '0 auto 30px auto',
              background: 'white',
              color: '#051937',
              padding: 'auto',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              // fontWeight: 'bold',
              fontSize: '18px',
              border: '1px solid #051937',
              borderRadius: '4px'
            }}>
              {/* <span>NET SALARY</span>
              <span>₹{formData.netSalary}</span> */}
              <span className="text-end fw-bold">
                Net Salary in word: {numberToWords(parseInt(formData.netSalary)).charAt(0).toUpperCase() + numberToWords(parseInt(formData.netSalary)).slice(1)} Rupees
              </span>
            </div>

            {/* Footer and Signature */}
            <div style={{ 
              borderTop: '1px dashed #ddd',
              paddingTop: '20px',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <div>
                <p style={{ fontSize: '12px', margin: '0 0 10px 0' }}>Infopearl Tech Solutions Pvt Ltd</p>
                <p style={{ fontSize: '12px', margin: '0' }}>innovation in technology</p>
              </div>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center'
              }}>
                <div style={{ 
                  height: '30px',
                  marginBottom: '5px',
                  fontStyle: 'italic',
                  fontWeight: 'bold'
                }}>
                  Authorized Signature
                </div>
                <div style={{ 
                  borderBottom: '1px solid black',
                  width: '150px',
                  textAlign: 'center',
                  marginLeft: '-35%'
                }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default SalarySlip; 