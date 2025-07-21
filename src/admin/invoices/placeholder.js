import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import './placeholder.css';
import InvoiceListComponent from './InvoiceList';
import InvoiceDownloadComponent from './InvoiceDownload';

// Real implementation of InvoiceEdit that supports sequential IDs
const InvoiceEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Load invoice data from localStorage
  useEffect(() => {
    try {
      const savedInvoicesString = localStorage.getItem('invoices');
      if (!savedInvoicesString) {
        setError("No invoices found in storage");
        setLoading(false);
        return;
      }

      const savedInvoices = JSON.parse(savedInvoicesString);
      if (!Array.isArray(savedInvoices)) {
        setError("Invalid invoice data format");
        setLoading(false);
        return;
      }

      // Find the invoice with the matching ID
      const invoice = savedInvoices.find(inv => inv.id === id);
      if (!invoice) {
        setError(`Invoice with ID ${id} not found`);
        setLoading(false);
        return;
      }

      // Set the form data
      setFormData(invoice);
      setLoading(false);
    } catch (error) {
      console.error("Error loading invoice data:", error);
      setError(`Error loading invoice: ${error.message}`);
      setLoading(false);
    }
  }, [id]);

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
    
    // Update the specific field
    newItems[index][field] = value;
    
    // Calculate amount for this item
    if (field === 'quantity' || field === 'price') {
      const quantity = parseFloat(newItems[index].quantity) || 0;
      const price = parseFloat(newItems[index].price) || 0;
      
      const itemAmount = quantity * price;
      newItems[index].amount = itemAmount.toFixed(2);
    }
    
    // Update form data with new items
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
    
    // Recalculate totals
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
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      price: 0,
      amount: '0.00'
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
      const newItems = [...formData.items];
      newItems.splice(index, 1);
      
      setFormData(prev => ({
        ...prev,
        items: newItems
      }));
      
      calculateTotals(newItems);
    }
  };

  // Save the updated invoice
  const handleSave = () => {
    try {
      // Get existing invoices from localStorage
      const savedInvoicesString = localStorage.getItem('invoices');
      if (!savedInvoicesString) {
        setError("No invoices found in storage");
        return;
      }

      const savedInvoices = JSON.parse(savedInvoicesString);
      if (!Array.isArray(savedInvoices)) {
        setError("Invalid invoice data format");
        return;
      }

      // Find the index of the invoice with the same ID
      const invoiceIndex = savedInvoices.findIndex(inv => inv.id === id);
      if (invoiceIndex === -1) {
        setError(`Invoice with ID ${id} not found`);
        return;
      }

      // Important: Preserve the original ID and invoice number
      const originalId = savedInvoices[invoiceIndex].id;
      const originalInvoiceNumber = savedInvoices[invoiceIndex].invoiceNumber;

      // Update the invoice in the array - KEEP THE SAME ID and invoice number
      const updatedInvoice = {
        ...formData,
        id: originalId, // Preserve the original sequential ID
        invoiceNumber: originalInvoiceNumber, // Preserve the original invoice number
        updatedAt: new Date().toISOString()
      };

      savedInvoices[invoiceIndex] = updatedInvoice;

      // Save back to localStorage
      localStorage.setItem('invoices', JSON.stringify(savedInvoices));
      
      // Show success message
      setSuccessMessage('Invoice updated successfully!');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error("Error saving invoice:", error);
      setError(`Error saving invoice: ${error.message}`);
    }
  };

  // Return to invoice list
  const handleCancel = () => {
    navigate("/admin/invoices");
  };

  if (loading) {
    return <Container className="mt-4"><Alert variant="info">Loading invoice data...</Alert></Container>;
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={() => navigate("/admin/invoices")}>Back to Invoice List</Button>
      </Container>
    );
  }

  if (!formData) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">Invoice not found</Alert>
        <Button variant="secondary" onClick={() => navigate("/admin/invoices")}>Back to Invoice List</Button>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2>Edit Invoice #{formData.invoiceNumber}</h2>
      
      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      
      <Form>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Invoice Number</Form.Label>
              <Form.Control
                type="text"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                readOnly
                className="bg-light"
              />
              <Form.Text className="text-muted">
                Invoice number cannot be changed to maintain sequential ordering
              </Form.Text>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Open">Open</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Invoice Date</Form.Label>
              <Form.Control
                type="text"
                name="invoiceDate"
                value={formData.invoiceDate}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Due Date</Form.Label>
              <Form.Control
                type="text"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>
        
        <Row className="mb-3">
          <Col>
            <h4>Customer Information</h4>
            <Form.Group className="mb-2">
              <Form.Label>Customer Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.customerInfo?.name || ''}
                onChange={handleCustomerInfoChange}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.customerInfo?.email || ''}
                onChange={handleCustomerInfoChange}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                name="address1"
                value={formData.customerInfo?.address1 || ''}
                onChange={handleCustomerInfoChange}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Town/City</Form.Label>
              <Form.Control
                type="text"
                name="town"
                value={formData.customerInfo?.town || ''}
                onChange={handleCustomerInfoChange}
              />
            </Form.Group>
          </Col>
        </Row>
        
        <div className="mt-4 mb-3">
          <h4>Invoice Items</h4>
          {formData.items && formData.items.map((item, index) => (
            <Row key={item.id || index} className="mb-2 align-items-center">
              <Col md={5}>
                <Form.Control
                  type="text"
                  placeholder="Description"
                  value={item.description || ''}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                />
              </Col>
              <Col md={2}>
                <Form.Control
                  type="number"
                  placeholder="Quantity"
                  value={item.quantity || ''}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                />
              </Col>
              <Col md={2}>
                <Form.Control
                  type="number"
                  placeholder="Price"
                  value={item.price || ''}
                  onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                />
              </Col>
              <Col md={2}>
                <Form.Control
                  type="text"
                  placeholder="Amount"
                  value={item.amount || ''}
                  readOnly
                />
              </Col>
              <Col md={1} className="text-center">
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => removeItemRow(index)}
                  disabled={formData.items.length === 1}
                >
                  <i className="bi bi-trash"></i>
                </Button>
              </Col>
            </Row>
          ))}
          
          <Button 
            variant="success" 
            size="sm" 
            className="mt-2"
            onClick={addItemRow}
          >
            <i className="bi bi-plus-circle me-1"></i> Add Item
          </Button>
        </div>
        
        <Row className="justify-content-end mt-4">
          <Col md={4}>
            <div className="d-flex justify-content-between">
              <span>Subtotal:</span>
              <span>₹{formData.subtotal}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span>CGST (9%):</span>
              <span>₹{formData.cgst}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span>SGST (9%):</span>
              <span>₹{formData.sgst}</span>
            </div>
            <div className="d-flex justify-content-between fw-bold mt-2">
              <span>Total:</span>
              <span>₹{formData.total}</span>
            </div>
          </Col>
        </Row>
        
        <div className="mt-4 d-flex justify-content-between">
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </Form>
    </Container>
  );
};

// Create a placeholder for InvoiceView
const InvoiceView = ({ match }) => {
  return (
    <div className="container mt-4">
      <h2>View Invoice</h2>
      <p>This feature is coming soon. Invoice ID: {match?.params?.id}</p>
    </div>
  );
};

// Export the components
export const InvoiceList = InvoiceListComponent;
export const InvoiceDownload = InvoiceDownloadComponent;
export { InvoiceEdit, InvoiceView };
