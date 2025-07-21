import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Form, Button, Card, InputGroup } from 'react-bootstrap';
import logo from '../../assests/logo.jpg';
import signature from '../../assests/signature.png';
import './InvoiceCreate.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const InvoiceCreate = () => {
  // Add navigate for redirecting after form submission
  const navigate = useNavigate();
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // State for form data
  const [formData, setFormData] = useState({
    invoiceType: 'Invoice',
    status: 'Open',
    invoiceNumber: 'INV00001',
    invoiceDate: '',
    dueDate: '',
    customerInfo: {
      name: '',
      email: '',
      address1: '',
      town: '',
      country: '',
      phone: ''
    },
    items: [
      {
        id: 1,
        description: '',
        quantity: 1,
        price: 0,
        amount: 0
      }
    ],
    notes: '',
    subtotal: '0.00',
    cgst: '0.00',
    sgst: '0.00',
    total: '0.00'
  });

  // Reference for the form to be printed
  const printRef = useRef(null);

  // Reference for the invoice preview
  const invoiceRef = useRef(null);
  
  // Auto-fill current date when component mounts
  useEffect(() => {
    const today = new Date();
    const formattedDate = formatDate(today);
    
    // Set due date 7 days from now
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 7);
    const formattedDueDate = formatDate(dueDate);
    
    setFormData(prev => ({
      ...prev,
      invoiceDate: formattedDate,
      dueDate: formattedDueDate
    }));
  }, []);

  // Format date as DD/MM/YYYY
  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle customer info changes
  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      customerInfo: { ...prev.customerInfo, [name]: value }
    }));
  };

  // Handle item changes
  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    
    // For price field, ensure it only contains numeric values
    if (field === 'price') {
      // Allow only numbers and decimal point
      if (!/^(\d*\.?\d*)$/.test(value) && value !== '') {
        return; // Reject non-numeric input
      }
    }
    
    // Update the specific field
    newItems[index][field] = value;
    
    // Calculate amount for this item
    if (field === 'quantity' || field === 'price') {
      const quantity = parseFloat(newItems[index].quantity) || 0;
      const price = parseFloat(newItems[index].price) || 0;
      
      const itemAmount = quantity * price;
      newItems[index].amount = itemAmount.toFixed(2);
      
      console.log(`Calculated amount for item ${index}: ${quantity} × ${price} = ${itemAmount.toFixed(2)}`);
    }
    
    // Update form data with new items
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
    
    // Recalculate overall totals
    calculateTotals(newItems);
  };

  // Calculate totals from items
  const calculateTotals = (items) => {
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    const cgst = subtotal * 0.09; // 9% CGST
    const sgst = subtotal * 0.09; // 9% SGST
    const total = subtotal + cgst + sgst;
    
    setFormData(prev => ({
      ...prev,
      subtotal: subtotal.toFixed(2),
      cgst: cgst.toFixed(2),
      sgst: sgst.toFixed(2),
      total: total.toFixed(2)
    }));
  };

  // Add new item row
  const addItemRow = () => {
    const newItem = {
      id: Date.now().toString(), // Use timestamp as unique ID for reliable tracking
        description: '', 
        quantity: 1, 
      price: 0,
      amount: 0
    };
    
    const newItems = [...formData.items, newItem];
    
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  // Remove item row
  const removeItemRow = (index) => {
    if (formData.items.length > 1) {
      // Create a new array without the item at the specified index
      const newItems = [...formData.items];
      newItems.splice(index, 1); // Properly remove the item at index
      
      // Update state with new items array
      setFormData(prev => ({
        ...prev,
        items: newItems
      }));
      
      // Recalculate totals after updating items
      calculateTotals(newItems);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Enhanced validation
    // Check customer info
    if (!formData.customerInfo.name || !formData.customerInfo.email) {
      alert('Please fill in customer name and email');
      return;
    }
    
    // Check invoice items
    const emptyItems = formData.items.filter(item => !item.description || !item.price);
    if (emptyItems.length > 0) {
      alert('Please fill in all item details (description and price are required)');
      return;
    }
    
    // Check for invoice date
    if (!formData.invoiceDate) {
      alert('Please provide an invoice date');
      return;
    }
    
    console.log('Invoice form submitted:', formData);
    
    // Show invoice preview
    setShowInvoicePreview(true);
  };
  
  // Handle Print Preview
  const handlePrintPreview = () => {
    try {
      // Get the content of the invoice preview
      const printContent = document.getElementById('invoice-preview');
      if (!printContent) {
        console.error('Could not find element with id "invoice-preview"');
        return;
      }
      
      // Store the original body content
      const originalBody = document.body.innerHTML;
      
      // Create a style element to ensure proper printing
      let styleString = '';
      const styleTags = document.getElementsByTagName('style');
      const linkTags = document.getElementsByTagName('link');
      
      // Get all the styles from style tags
      for (let i = 0; i < styleTags.length; i++) {
        styleString += styleTags[i].innerHTML;
      }
      
      // Get all the styles from link tags (stylesheets)
      for (let i = 0; i < linkTags.length; i++) {
        if (linkTags[i].rel.toLowerCase() === 'stylesheet') {
          styleString += `@import url("${linkTags[i].href}");`;
        }
      }
      
      // Set the content for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow pop-ups to use the print feature.');
        return;
      }
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice #${formData.invoiceNumber}</title>
            <style>${styleString}</style>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
              }
              @media print {
                @page {
                  size: A4;
                  margin: 0.5cm;
                }
              }
            </style>
          </head>
          <body>
            ${printContent.outerHTML}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      // Wait for resources to load before printing
      printWindow.onload = function() {
        printWindow.focus();
        printWindow.print();
        
        // Handle both print completion and print cancellation
        printWindow.onafterprint = function() {
          printWindow.close();
        };
        
        // Also add a backup to detect if the print dialog is closed without printing
        setTimeout(() => {
          if (!printWindow.closed) {
            printWindow.close();
          }
        }, 1000);
      };
    } catch (error) {
      console.error('Error during print preview:', error);
      alert('There was an error preparing the invoice for printing. Please try again.');
    }
  };
  
  // Navigate back to invoice form
  const handleBackToForm = () => {
    setShowInvoicePreview(false);
  };
  
  // Navigate to invoice list
  const handleBackToList = () => {
    navigate('/invoices');
  };

  // Handle Save and PDF Download
  const handleSaveAndDownload = async () => {
    try {
      setIsGeneratingPdf(true);
      
      // Make sure calculations are up-to-date
      const subtotal = formData.items.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
      const cgst = subtotal * 0.09; // 9% CGST
      const sgst = subtotal * 0.09; // 9% SGST
      const total = subtotal + cgst + sgst;
      
      // Update formData with latest calculations
      const updatedFormData = {
        ...formData,
        subtotal: subtotal.toFixed(2),
        cgst: cgst.toFixed(2),
        sgst: sgst.toFixed(2),
        total: total.toFixed(2)
      };
      
      // First save the invoice data
      const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      
      // Create a properly formatted invoice object with all required fields
      const invoiceToSave = {
        ...updatedFormData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        // Ensure these fields are properly set for the invoice list
        invoiceNumber: updatedFormData.invoiceNumber,
        invoiceType: updatedFormData.invoiceType,
        status: updatedFormData.status,
        total: updatedFormData.total,
        subtotal: updatedFormData.subtotal,
        cgst: updatedFormData.cgst,
        sgst: updatedFormData.sgst,
        // Make sure customer info is saved
        customerInfo: {
          ...updatedFormData.customerInfo
        },
        // Make sure items are saved with all their properties
        items: updatedFormData.items.map(item => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          price: item.price,
          amount: item.amount
        }))
      };
      
      console.log("About to save invoice:", invoiceToSave);
      
      // Check if this invoice is already in the list
      const existingIndex = invoices.findIndex(inv => 
        inv.invoiceNumber === updatedFormData.invoiceNumber || inv.id === invoiceToSave.id
      );
      
      if (existingIndex >= 0) {
        // Update existing invoice
        invoices[existingIndex] = {
          ...invoiceToSave,
          updatedAt: new Date().toISOString()
        };
      } else {
        // This is a new invoice
        invoices.push(invoiceToSave);
      }
      
      // Save to localStorage
      localStorage.setItem('invoices', JSON.stringify(invoices));
      console.log("Saved invoice:", invoiceToSave); 
      console.log("All invoices in localStorage:", invoices);
      
      // Then generate and download PDF
      const invoiceElement = document.getElementById('invoice-preview');
      if (!invoiceElement) {
        console.error('Could not find element with id "invoice-preview"');
        alert('Error generating PDF. Please try again.');
        setIsGeneratingPdf(false);
        return;
      }
      
      // Use html2canvas to render the invoice to a canvas
      const canvas = await html2canvas(invoiceElement, {
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
      pdf.save(`Invoice_${updatedFormData.invoiceNumber}.pdf`);
      
      // Show success message
      alert('Invoice saved and downloaded as PDF successfully!');
      
      // Navigate back to invoice list
      navigate('/invoices');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating the PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <Container fluid>
      {!showInvoicePreview ? (
        // Invoice Creation Form
        <>
          <div className="invoice-header mb-4" style={{ 
            background: 'linear-gradient(135deg, #051937, #004d7a)',
            padding: '25px',
            borderRadius: '0',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img 
                src={logo} 
                alt="Company Logo" 
                style={{ 
                  height: '120px', 
                  width: '120px',
                  marginRight: '25px',
                  backgroundColor: 'white',
                  padding: '5px',
                  borderRadius: '0'
                }} 
              />
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
              <h1 style={{ fontSize: '72px', margin: '0', fontWeight: 'bold', color: '#ffffff' }}>INVOICE</h1>
            </div>
          </div>

          <h1 className="mb-4">Create New INVOICE</h1>
          
          <Form onSubmit={handleSubmit}>
            {/* Invoice Header */}
            <Row className="mb-4">
              <Col md={6} className="text-md-end">
                <Form.Label className="mt-2">Select Type:</Form.Label>
              </Col>
              <Col md={3}>
                <Form.Select 
                  name="invoiceType"
                  value={formData.invoiceType}
                  onChange={handleChange}
                >
                  <option value="Invoice">Invoice</option>
                  <option value="Quote">Quote</option>
                  <option value="Receipt">Receipt</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Open">Open</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </Form.Select>
              </Col>
            </Row>
            
            <Row className="mb-4">
              <Col md={4}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Invoice Number"
                    name="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={handleChange}
                  />
                  <InputGroup.Text><i className="bi bi-hash"></i></InputGroup.Text>
                </InputGroup>
              </Col>
              <Col md={4}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Invoice Date"
                    name="invoiceDate"
                    value={formData.invoiceDate}
                    onChange={handleChange}
                  />
                  <InputGroup.Text><i className="bi bi-calendar"></i></InputGroup.Text>
                </InputGroup>
              </Col>
              <Col md={4}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Due Date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                  />
                  <InputGroup.Text><i className="bi bi-calendar"></i></InputGroup.Text>
                </InputGroup>
              </Col>
            </Row>

            {/* Customer Information */}
            <Row className="mb-4">
              <Col md={12}>
                <Card>
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Customer Information</h5>
                    <Button variant="link" size="sm">OR Select Existing Customer</Button>
                  </Card.Header>
                  <Card.Body>
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Control
                          type="text"
                          placeholder="Enter Name"
                          name="name"
                          value={formData.customerInfo.name}
                          onChange={handleCustomerInfoChange}
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Control
                    type="email"
                          placeholder="Email"
                    name="email"
                          value={formData.customerInfo.email}
                          onChange={handleCustomerInfoChange}
                        />
                      </Col>
                    </Row>
                    
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Control
                    type="text"
                          placeholder="Address Line 1"
                          name="address1"
                          value={formData.customerInfo.address1}
                          onChange={handleCustomerInfoChange}
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Control
                    type="text"
                          placeholder="Town/City"
                          name="town"
                          value={formData.customerInfo.town}
                          onChange={handleCustomerInfoChange}
                        />
                      </Col>
                    </Row>
                    
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Control
                          type="text"
                          placeholder="Country"
                          name="country"
                          value={formData.customerInfo.country}
                          onChange={handleCustomerInfoChange}
                        />
                      </Col>
                      <Col md={6}>
                        <Form.Control
                          type="text"
                          placeholder="Phone Number"
                          name="phone"
                          value={formData.customerInfo.phone}
                          onChange={handleCustomerInfoChange}
                        />
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Invoice Items Section */}
            <div className="mb-4">
              <h2 className="mb-3">Item Details</h2>
              <div className="table-responsive">
                <table className="table table-bordered">
                <thead>
                    <tr>
                      <th style={{ width: '40%' }}>Description</th>
                      <th style={{ width: '15%' }}>Quantity</th>
                      <th style={{ width: '15%' }}>Price (₹)</th>
                      <th style={{ width: '15%' }}>Amount</th>
                      <th style={{ width: '15%' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                    {formData.items.map((item, index) => (
                    <tr key={item.id}>
                        <td>
                          <Form.Control
                          type="text"
                          value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        />
                      </td>
                        <td>
                          <Form.Control
                          type="number"
                          value={item.quantity}
                            min="1"
                            step="1"
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        />
                      </td>
                        <td>
                          <Form.Control
                            type="text"
                          value={item.price}
                            onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                        />
                      </td>
                        <td className="text-end">
                          ₹{item.amount || '0.00'}
                      </td>
                        <td className="text-center">
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => removeItemRow(index)}
                            disabled={formData.items.length === 1}
                            aria-label="Delete item"
                            className="delete-btn"
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
              </table>
              </div>

              <Button 
                variant="success" 
                onClick={addItemRow}
                className="mb-4"
                style={{ 
                  padding: '8px 16px',
                  borderRadius: '4px',
                  fontWeight: '500'
                }}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Add Item
              </Button>
              
              <div className="row justify-content-end">
                <div className="col-md-6">
                  <div className="table-responsive">
                    <table className="table">
                      <tbody>
                        <tr>
                          <td className="text-end fw-bold">SUBTOTAL</td>
                          <td className="text-end" style={{ width: '150px' }}>₹{formData.subtotal}</td>
                        </tr>
                        <tr>
                          <td className="text-end fw-bold">CGST (9%)</td>
                          <td className="text-end">₹{formData.cgst}</td>
                        </tr>
                        <tr>
                          <td className="text-end fw-bold">SGST (9%)</td>
                          <td className="text-end">₹{formData.sgst}</td>
                        </tr>
                        <tr className="bg-primary text-white">
                          <td className="text-end fw-bold">TOTAL</td>
                          <td className="text-end fw-bold">₹{formData.total}</td>
                        </tr>
                      </tbody>
                    </table>
                </div>
                </div>
              </div>
            </div>

            <div className="d-grid mb-5">
              <Button 
              type="submit" 
                size="lg"
              style={{ 
                  background: 'linear-gradient(to right, #3f51b5, #7b1fa2)', //color change
                border: 'none', 
                  width: '40%',
                  margin: '0 auto'
              }}
            >
              Generate Invoice
              </Button>
            </div>
          </Form>
        </>
      ) : (
        // Invoice Preview
        <div className="invoice-preview-container">
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
            id="invoice-preview" 
            className="invoice-document" 
            ref={invoiceRef}
            style={{
              maxWidth: '850px',
              margin: '0 auto',
              padding: '20px',
              backgroundColor: '#fff',
              boxShadow: '0 0 10px rgba(0,0,0,0.1)',
              border: '1px solid #ddd'
            }}
          >
            {/* Invoice Header */}
            <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
              background: 'linear-gradient(135deg, #051937, #004d7a)',
              color: '#fff',
              padding: '20px',
              marginBottom: '30px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img 
                  src={logo} 
                alt="Company Logo" 
                style={{ 
                    height: '80px', 
                    backgroundColor: '#fff',
                  padding: '5px',
                    marginRight: '15px'
                }} 
              />
              <div>
                  <h2 style={{ margin: '0', fontWeight: 'bold', fontSize: '18px' }}>Infopearl Tech Solutions Pvt Ltd</h2>
                  <p style={{ margin: '3px 0', textAlign: 'left', fontSize: '12px' }}>G1 Akansha Apartment</p>
                  <p style={{ margin: '3px 0', textAlign: 'left', fontSize: '12px' }}>Patel Nagar, City center</p>
                  <p style={{ margin: '3px 0', textAlign: 'left', fontSize: '12px' }}>7000937390</p>
                  <p style={{ margin: '3px 0', textAlign: 'left', fontSize: '12px' }}>infopearl396@gmail.com</p>
                  <p style={{ margin: '3px 0', textAlign: 'left', fontSize: '12px' }}>www.infopearl.in</p>
              </div>
            </div>
              <div>
                <h1 style={{ fontSize: '48px', fontWeight: 'bold', margin: 0 }}>INVOICE</h1>
            </div>
          </div>

            {/* Invoice & Customer Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
              <div style={{ width: '40%' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 'bold', color: '#051937',textAlign: 'left' }}>BILL TO</h3>
                <p style={{ margin: '0 0 5px 0',textAlign: 'left', fontSize: '16px', fontWeight: 'bold' }}>{formData.customerInfo.name || 'Customer Name'}</p>
                <p style={{ margin: '0 0 5px 0',textAlign: 'left', }}>{formData.customerInfo.address1 || 'Address'}</p>
                <p style={{ margin: '0 0 5px 0',textAlign: 'left', }}>{formData.customerInfo.town || 'Town/City'}</p>
                <p style={{ margin: '0 0 5px 0',textAlign: 'left', }}>{formData.customerInfo.country || 'Country'}</p>
                <p style={{ margin: '0 0 5px 0',textAlign: 'left', }}>{formData.customerInfo.phone || 'Phone'}</p>
                <p style={{ margin: '0 0 5px 0',textAlign: 'left', }}>{formData.customerInfo.email || 'Email'}</p>
              </div>
              <div style={{ width: '40%', textAlign: 'right' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <h3 style={{ margin: '0', fontSize: '16px', fontWeight: 'bold', color: '#051937' }}>INVOICE #</h3>
                  <p style={{ margin: '0', fontSize: '16px' }}>{formData.invoiceNumber}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <h3 style={{ margin: '0', fontSize: '16px', fontWeight: 'bold', color: '#051937' }}>CREATION DATE</h3>
                  <p style={{ margin: '0', fontSize: '16px' }}>{formData.invoiceDate}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h3 style={{ margin: '0', fontSize: '16px', fontWeight: 'bold', color: '#051937' }}>DUE DATE</h3>
                  <p style={{ margin: '0', fontSize: '16px' }}>{formData.dueDate}</p>
                </div>
              </div>
            </div>

            {/* Invoice Items Table */}
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse', 
              marginBottom: '30px',
              fontSize: '14px'
              
            }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #051937, #004d7a)', color: '#fff' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>DESCRIPTION</th>
                  <th style={{ padding: '10px', textAlign: 'center' }}>QTY</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>PRICE</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, index) => (
                  <tr key={index} style={{ 
                    backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#fff',
                    borderBottom: '1px solid #ddd'
                  }}>
                    <td style={{ padding: '10px', textAlign: 'left' }}>{item.description}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>₹{parseFloat(item.price).toFixed(2)}</td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>₹{item.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals & Signature */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ width: '40%' }}>
              <img 
  src={signature} 
                    alt="Authorized Signature" 
                    style={{ 
                      height: '60px',
    marginBottom: '10px',
    marginLeft: '-35%' // adjust value as needed
  }} 
/>

                <p style={{ 
                  margin: '0', 
                  borderTop: '1px solid #000', 
                  paddingTop: '5px', 
                  fontSize: '14px', 
                  fontWeight: 'bold',
                  width: '200px'
                }}>
                  Authorized Signature
                </p>
                  </div>
              
              <div style={{ width: '40%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <p style={{ margin: '0', fontWeight: 'bold', color: '#051937' }}>SUBTOTAL</p>
                  <p style={{ margin: '0' }}>₹{formData.subtotal}</p>
              </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <p style={{ margin: '0', fontWeight: 'bold', color: '#051937' }}>CGST (9%)</p>
                  <p style={{ margin: '0' }}>₹{formData.cgst}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <p style={{ margin: '0', fontWeight: 'bold', color: '#051937' }}>SGST (9%)</p>
                  <p style={{ margin: '0' }}>₹{formData.sgst}</p>
                </div>
                <div style={{ 
                      display: 'flex',
                  justifyContent: 'space-between', 
                  background: 'linear-gradient(135deg, #051937, #004d7a)',
                  color: '#fff',
                  padding: '10px',
                  fontWeight: 'bold'
                }}>
                  <p style={{ margin: '0' }}>TOTAL</p>
                  <p style={{ margin: '0' }}>₹{formData.total}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default InvoiceCreate;