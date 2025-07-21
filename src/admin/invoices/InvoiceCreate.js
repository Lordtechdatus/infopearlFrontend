import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Form, Button, Card, InputGroup, Table, Alert, Modal, ListGroup } from 'react-bootstrap';
import logo from '../../assets/logo1.png';
import signature from '../../admin/signature.png';
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
  const [successMessage, setSuccessMessage] = useState('');
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // State for form data
  const [formData, setFormData] = useState({
    invoiceType: 'Invoice',
    status: 'Open',
    invoiceNumber: '', // This will be auto-generated based on ID
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
    total: '0.00',
    nextId: '0' // Added field for auto-filled ID
  });

  // Reference for the form to be printed
  const printRef = useRef(null);

  // Reference for the invoice preview
  const invoiceRef = useRef(null);
  
  // Auto-fill current date and calculate next ID when component mounts
  useEffect(() => {
    // Calculate date information
    const today = new Date();
    const formattedDate = formatDate(today);
    
    // Set due date 7 days from now
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 7);
    const formattedDueDate = formatDate(dueDate);
    
    // Get the next invoice ID from dedicated localStorage entry
    let nextId = 1; // Default to 1 if not found
    try {
      // Try to get the next_invoice_id from localStorage
      const storedNextId = localStorage.getItem('next_invoice_id');
      
      if (storedNextId) {
        // If it exists, parse it
        const parsedId = parseInt(storedNextId);
        if (!isNaN(parsedId) && parsedId >= 1) {
          nextId = parsedId;
        } else {
          // If invalid, reset to 1 and update localStorage
          localStorage.setItem('next_invoice_id', '1');
        }
      } else {
        // If it doesn't exist, check if we have existing invoices
        const savedInvoicesString = localStorage.getItem('invoices');
        
        if (savedInvoicesString) {
          const savedInvoices = JSON.parse(savedInvoicesString);
          
          if (Array.isArray(savedInvoices) && savedInvoices.length > 0) {
            // Find the highest existing invoice ID
            const numericIds = savedInvoices
              .map(inv => {
                // Try to extract the numeric part from invoice number if available
                if (inv.invoiceNumber && inv.invoiceNumber.startsWith('INV')) {
                  const numPart = inv.invoiceNumber.replace('INV', '');
                  return parseInt(numPart);
                }
                // Otherwise use ID if it's numeric
                const idNum = parseInt(inv.id);
                return isNaN(idNum) ? 0 : idNum;
              })
              .filter(id => !isNaN(id));
              
            if (numericIds.length > 0) {
              // Get the maximum ID and add 1 for the next ID
              nextId = Math.max(...numericIds, 1) + 1;
            }
          }
        }
        
        // Initialize next_invoice_id in localStorage
        localStorage.setItem('next_invoice_id', nextId.toString());
      }
      
      console.log("Using invoice ID for new invoice:", nextId);
    } catch (error) {
      console.error("Error determining next invoice ID:", error);
      // In case of any error, use 1 and reset localStorage
      localStorage.setItem('next_invoice_id', '1');
    }
    
    // Format invoice number based on ID (e.g., INV0001)
    const formattedInvoiceNumber = `INV${nextId.toString().padStart(4, '0')}`;
    
    // Update form data with dates and next ID
    setFormData(prev => ({
      ...prev,
      invoiceDate: formattedDate,
      dueDate: formattedDueDate,
      nextId: nextId.toString(),
      invoiceNumber: formattedInvoiceNumber
    }));
  }, []);

  // Load existing customers
  useEffect(() => {
    try {
      const savedCustomers = localStorage.getItem('customers');
      if (savedCustomers) {
        const parsedCustomers = JSON.parse(savedCustomers);
        if (Array.isArray(parsedCustomers)) {
          setCustomers(parsedCustomers);
        }
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    }
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
    
    // Validate invoice number format
    const invoiceNumber = formData.invoiceNumber;
    if (!invoiceNumber) {
      alert('Please provide an invoice number');
      return;
    }
    
    // Ensure invoice number starts with INV and has a numeric part
    if (!invoiceNumber.startsWith('INV') || !/\d+/.test(invoiceNumber)) {
      alert('Invoice number must start with "INV" followed by numbers (e.g., INV0001)');
      return;
    }
    
    console.log('Invoice form submitted:', formData);
    
    // Show invoice preview
    setShowInvoicePreview(true);
  };
  
  // Navigate back to invoice form
  const handleBackToForm = () => {
    setShowInvoicePreview(false);
  };
  
  // Navigate back to a blank invoice form (after saving)
  const handleBackToNewForm = () => {
    // Calculate date information for new invoice
    const today = new Date();
    const formattedDate = formatDate(today);
    
    // Set due date 7 days from now
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 7);
    const formattedDueDate = formatDate(dueDate);
    
    // Get the next invoice ID from localStorage
    let nextId = 1;
    try {
      const storedNextId = localStorage.getItem('next_invoice_id');
      if (storedNextId) {
        const parsedId = parseInt(storedNextId);
        if (!isNaN(parsedId) && parsedId >= 1) {
          nextId = parsedId;
        }
      }
    } catch (error) {
      console.error("Error getting next invoice ID:", error);
    }
    
    // Format invoice number based on ID (e.g., INV0001)
    const formattedInvoiceNumber = `INV${nextId.toString().padStart(4, '0')}`;
    
    // Reset form data for a new invoice
    setFormData({
      invoiceType: 'Invoice',
      status: 'Open',
      invoiceNumber: formattedInvoiceNumber,
      invoiceDate: formattedDate,
      dueDate: formattedDueDate,
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
          id: Date.now().toString(),
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
      total: '0.00',
      nextId: nextId.toString()
    });
    
    // Return to form view
    setShowInvoicePreview(false);
    setSuccessMessage('');
  };

  // Handle Print Preview
  const handlePrintPreview = () => {
    try {
      // First save the invoice data to ensure it appears in the invoice list
      saveInvoiceData();
      
      // Get the content of the invoice preview
      const printContent = document.getElementById('invoice-preview');
      if (!printContent) {
        console.error('Could not find element with id "invoice-preview"');
        return;
      }
      
      // Create a hidden iframe in the current page instead of opening a new tab
      let iframe = document.createElement('iframe');
      iframe.style.visibility = 'hidden';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      
      // Add the iframe to the page
      document.body.appendChild(iframe);
      
      // Write the invoice content to the iframe
      iframe.contentDocument.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice #${formData.invoiceNumber}</title>
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
                body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
              }
              /* Add styles to match the invoice preview */
              table {
                width: 100%;
                border-collapse: collapse;
              }
              th, td {
                padding: 8px;
              }
              th {
                background-color: #051937;
                color: white;
              }
              .invoice-header {
                display: flex;
                justify-content: space-between;
                background: linear-gradient(135deg, #051937, #004d7a);
                color: white;
                padding: 20px;
                margin-bottom: 30px;
              }
              .signature-section {
                text-align: center;
              }
              .total-row {
                background: linear-gradient(135deg, #051937, #004d7a);
                color: white;
                font-weight: bold;
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      
      iframe.contentDocument.close();
      
      // Focus the iframe window for printing
      iframe.focus();
      
      // Print after a short delay to ensure content is loaded
      setTimeout(() => {
        // Print the iframe content
        iframe.contentWindow.print();
        
        // Remove the iframe after printing is done
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 500);
      }, 500);
    } catch (error) {
      console.error('Error during print preview:', error);
    }
  };
  
  // Helper function to save invoice data
  const saveInvoiceData = () => {
    try {
      console.log("Starting saveInvoiceData function");
      
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
      
      // Get existing invoices from localStorage with detailed error handling
      let invoices = [];
      try {
        const savedInvoicesString = localStorage.getItem('invoices');
        console.log("Raw localStorage 'invoices' value:", savedInvoicesString);
        
        if (savedInvoicesString) {
          const parsedData = JSON.parse(savedInvoicesString);
          console.log("Parsed invoices from localStorage:", parsedData);
          
          // Verify invoices is an array
          if (Array.isArray(parsedData)) {
            invoices = parsedData;
          } else {
            console.error("Invoices from localStorage is not an array. Resetting to empty array.");
            invoices = [];
            // Clear the invalid data
            localStorage.removeItem('invoices');
          }
        } else {
          console.log("No invoices found in localStorage. Starting with empty array.");
        }
      } catch (parseError) {
        console.error("Error parsing invoices from localStorage:", parseError);
        // If there was an error parsing, reset to empty array
        invoices = [];
        // Clear the corrupted data
        localStorage.removeItem('invoices');
      }
      
      // Get current ID from form state
      const currentId = parseInt(formData.nextId);
      console.log("Using invoice ID for this invoice:", currentId);
      
      // Create a properly formatted invoice object with all required fields
      const invoiceToSave = {
        ...updatedFormData,
        id: currentId.toString(),
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
      
      console.log("Invoice to save:", invoiceToSave);
      console.log("Number of existing invoices before update:", invoices.length);
      
      // We'll add the new invoice to the array unless it's a duplicate invoice number
      let shouldAddInvoice = true;
      
      // Check if this invoice number already exists (for updating existing invoices)
      const existingIndex = invoices.findIndex(inv => 
        inv.invoiceNumber === updatedFormData.invoiceNumber
      );
      
      // Create a new array of invoices to save
      let updatedInvoices = [...invoices];
      
      if (existingIndex >= 0) {
        console.log(`Found existing invoice with same invoice number at index ${existingIndex}`);
        
        // Ask user if they want to update or create new
        if (window.confirm(`Invoice number ${updatedFormData.invoiceNumber} already exists. Would you like to update it? Click Cancel to create a new invoice instead.`)) {
          console.log(`Updating existing invoice at index ${existingIndex}`);
          // Update existing invoice but keep the original ID
          updatedInvoices[existingIndex] = {
            ...invoiceToSave,
            id: invoices[existingIndex].id, // Keep the original ID
            updatedAt: new Date().toISOString()
          };
          shouldAddInvoice = false;
        } else {
          // User chose to create new, so we'll continue with adding
          console.log("User chose to create a new invoice instead of updating");
          shouldAddInvoice = true;
        }
      }
      
      if (shouldAddInvoice) {
        console.log("Adding new invoice to the array");
        // This is a new invoice
        updatedInvoices.push(invoiceToSave);
        
        // Increment next_invoice_id in localStorage
        const nextId = currentId + 1;
        localStorage.setItem('next_invoice_id', nextId.toString());
        console.log("Updated next_invoice_id to:", nextId);
      }
      
      console.log("Number of invoices after update:", updatedInvoices.length);
      
      // Triple-check the updated array is valid
      if (!Array.isArray(updatedInvoices)) {
        console.error("Updated invoices is not an array!");
        throw new Error("Invoice array is invalid");
      }
      
      // Save to localStorage - use a completely separate variable to avoid any reference issues
      const invoicesToStore = JSON.stringify(updatedInvoices);
      localStorage.setItem('invoices', invoicesToStore);
      console.log("Saved invoices to localStorage:", updatedInvoices);
      
      return invoiceToSave;
    } catch (error) {
      console.error("Error in saveInvoiceData:", error);
      // Show error message to user
      alert(`Error saving invoice: ${error.message}`);
      return null;
    }
  };

  // Handle Save and PDF Download
  const handleSaveAndDownload = async () => {
    try {
      setIsGeneratingPdf(true);
      setSuccessMessage(''); // Clear any previous success message
      
      // Save the invoice data first
      const invoiceToSave = saveInvoiceData();
      
      // If invoice saving failed, stop the process
      if (!invoiceToSave) {
        setIsGeneratingPdf(false);
        setSuccessMessage('Failed to save invoice. Please try again.');
        return;
      }
      
      // Then generate and download PDF
      const invoiceElement = document.getElementById('invoice-preview');
      if (!invoiceElement) {
        console.error('Could not find element with id "invoice-preview"');
        setSuccessMessage('Error generating PDF. Could not find invoice preview element.');
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
      pdf.save(`Invoice_${invoiceToSave.invoiceNumber}.pdf`);
      
      // Show success message on the same page
      setSuccessMessage('Invoice saved and PDF downloaded successfully! Your invoice has been added to the invoice list.');
      
      // Get the next invoice ID from localStorage
      let nextId = 1;
      const storedNextId = localStorage.getItem('next_invoice_id');
      if (storedNextId) {
        const parsedId = parseInt(storedNextId);
        if (!isNaN(parsedId) && parsedId >= 1) {
          nextId = parsedId;
        }
      }
      
      // Generate invoice number based on next ID (formatted as INV0001)
      const nextInvoiceNumber = `INV${nextId.toString().padStart(4, '0')}`;
      console.log("Resetting form with next invoice ID:", nextId, "and number:", nextInvoiceNumber);
      
      // Get current date for the new invoice
      const today = new Date();
      const formattedDate = formatDate(today);
      
      // Set due date 7 days from now
      const dueDate = new Date();
      dueDate.setDate(today.getDate() + 7);
      const formattedDueDate = formatDate(dueDate);
      
      // Reset to default state but with incremented invoice number - COMPLETELY NEW STATE
      setFormData({
        // Do NOT include any ID field here
        invoiceType: 'Invoice',
        status: 'Open',
        invoiceNumber: nextInvoiceNumber, // Use the auto-generated invoice number
        invoiceDate: formattedDate,
        dueDate: formattedDueDate,
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
            id: Date.now().toString(),
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
        total: '0.00',
        nextId: nextId.toString() // Set the next ID
      });
      
      console.log("Form completely reset for new invoice with number:", nextInvoiceNumber);
      
      // Optional: Show a confirmation that we're ready for a new invoice
      setTimeout(() => {
        setSuccessMessage(prev => prev + ' You can now create a new invoice.');
      }, 1000);
      
      // Stay on the same page (don't navigate away)
    } catch (error) {
      console.error('Error generating PDF:', error);
      setSuccessMessage(`Error: ${error.message || 'There was a problem generating the PDF. Please try again.'}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Debug function for developers
  const debugInvoiceStorage = () => {
    try {
      const savedInvoicesString = localStorage.getItem('invoices');
      if (!savedInvoicesString) {
        console.log("No invoices in localStorage");
        alert("No invoices found in localStorage");
        return;
      }
      
      const savedInvoices = JSON.parse(savedInvoicesString);
      console.log("Current invoices in localStorage:", savedInvoices);
      alert(`Found ${savedInvoices.length} invoices in localStorage. Check console for details.`);
    } catch (error) {
      console.error("Error checking localStorage:", error);
      alert(`Error checking localStorage: ${error.message}`);
    }
  };

  // Handle customer selection
  const handleSelectCustomer = (customer) => {
    setFormData(prev => ({
      ...prev,
      customerInfo: {
        name: customer.name || '',
        email: customer.email || '',
        address1: customer.address || customer.address1 || '',
        town: customer.city || customer.town || '',
        country: customer.country || '',
        phone: customer.phone || customer.phoneNumber || ''
      }
    }));
    setShowCustomerModal(false);
  };

  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer => 
    (customer.name && customer.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Container fluid>
      {!showInvoicePreview ? (
        // Invoice Creation Form
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h1 className="mb-0">Create New INVOICE</h1>
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={debugInvoiceStorage}
              style={{ fontSize: '0.8rem' }}
            >
              Debug Storage
            </Button>
          </div>
          
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
                    className="invoice-number-input"
                  />
                  <InputGroup.Text><i className="bi bi-hash"></i></InputGroup.Text>
                </InputGroup>
                <Form.Text className="text-muted">
                  Auto-generated but can be edited if needed
                </Form.Text>
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
                    <Button 
                      variant="link" 
                      size="sm"
                      onClick={() => setShowCustomerModal(true)}
                    >
                      OR Select Existing Customer
                    </Button>
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

          {/* Customer Selection Modal */}
          <Modal 
            show={showCustomerModal} 
            onHide={() => setShowCustomerModal(false)}
            centered
            size="lg"
          >
            <Modal.Header closeButton>
              <Modal.Title>Select Customer</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Control
                type="text"
                placeholder="Search customers by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-3"
              />
              
              {filteredCustomers.length > 0 ? (
                <ListGroup>
                  {filteredCustomers.map((customer, index) => (
                    <ListGroup.Item 
                      key={index} 
                      action 
                      onClick={() => handleSelectCustomer(customer)}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <div><strong>{customer.name}</strong></div>
                        <div className="text-muted small">{customer.email}</div>
                      </div>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectCustomer(customer);
                        }}
                      >
                        Select
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="text-center p-3">
                  {searchTerm ? 'No matching customers found' : 'No customers found in the system'}
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowCustomerModal(false)}>
                Cancel
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      ) : (
        // Invoice Preview
        <div className="invoice-preview-container">
          {successMessage && (
            <Alert 
              variant="success" 
              onClose={() => setSuccessMessage('')} 
              dismissible
              className="mb-4"
            >
              <i className="bi bi-check-circle-fill me-2"></i>
              {successMessage}
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
                <i className="bi bi-pencil-square me-2"></i>Edit
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
              <div style={{ width: '40%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img 
                  src={signature} 
                  alt="Authorized Signature" 
                  style={{ 
                    height: '60px',
                    marginBottom: '10px',
                    display: 'block',
                    marginLeft: 'auto',
                    marginRight: 'auto'
                  }} 
                />

                <p style={{ 
                  margin: '0', 
                  borderTop: '1px solid #000', 
                  paddingTop: '5px', 
                  fontSize: '14px', 
                  fontWeight: 'bold',
                  width: '200px',
                  textAlign: 'center'
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