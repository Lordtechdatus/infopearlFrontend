import React, { useState } from 'react';
import { Container, Form, Row, Col, Button, Card, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './CustomerAdd.css';

const CustomerAdd = () => {
  const navigate = useNavigate();
  
  const [customerData, setCustomerData] = useState({
    customerInfo: {
      name: '',
      email: '',
      address1: '',
      townCity: '',
      country: '',
      phoneNumber: ''
    }
  });

  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    setCustomerData(prevData => ({
      ...prevData,
      customerInfo: {
        ...prevData.customerInfo,
        [name]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!customerData.customerInfo.name || !customerData.customerInfo.email) {
      alert('Please fill in customer name and email');
      return;
    }
    
    // Get existing customers from localStorage
    const existingCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
    
    // Create new customer object
    const newCustomer = {
      id: Date.now().toString(), // Generate unique ID
      name: customerData.customerInfo.name,
      email: customerData.customerInfo.email,
      phone: customerData.customerInfo.phoneNumber || '',
      // Store additional customer data if needed
      address1: customerData.customerInfo.address1 || '',
      townCity: customerData.customerInfo.townCity || '',
      country: customerData.customerInfo.country || ''
    };
    
    // Add to existing customers array
    const updatedCustomers = [...existingCustomers, newCustomer];
    
    // Save to localStorage
    localStorage.setItem('customers', JSON.stringify(updatedCustomers));
    
    // Navigate back to customer list
    alert('Customer added successfully!');
    navigate('/admin/customers');
  };

  // Handle cancel button click
  const handleCancel = () => {
    navigate('/admin/customers');
  };

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">
          Add New Customer
          <Badge bg="success" className="ms-2 fs-6">New</Badge>
        </h1>
        <Button variant="outline-secondary" onClick={handleCancel}>
          <i className="bi bi-arrow-left me-1"></i> Back to List
        </Button>
      </div>
      
      <Form onSubmit={handleSubmit}>
        <Card className="shadow-sm mb-4 border-0">
          <Card.Header className="bg-success text-white">
            <div className="d-flex align-items-center">
              <i className="bi bi-person-plus-fill fs-4 me-2"></i>
              <h5 className="mb-0">Customer Information</h5>
            </div>
          </Card.Header>
          <Card.Body className="p-4">
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Name"
                    name="name"
                    value={customerData.customerInfo.name}
                    onChange={handleCustomerInfoChange}
                    required
                    className="shadow-sm"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">Email Address</Form.Label>
                  <div className="input-group shadow-sm">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-envelope-fill text-success"></i>
                    </span>
                    <Form.Control
                      type="email"
                      placeholder="Email"
                      name="email"
                      value={customerData.customerInfo.email}
                      onChange={handleCustomerInfoChange}
                      required
                    />
                  </div>
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">Address</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Street address"
                    name="address1"
                    value={customerData.customerInfo.address1}
                    onChange={handleCustomerInfoChange}
                    className="shadow-sm"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">Phone Number</Form.Label>
                  <div className="input-group shadow-sm">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-telephone-fill text-success"></i>
                    </span>
                    <Form.Control
                      type="text"
                      placeholder="Phone Number"
                      name="phoneNumber"
                      value={customerData.customerInfo.phoneNumber}
                      onChange={handleCustomerInfoChange}
                    />
                  </div>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">Town/City</Form.Label>
                  <div className="input-group shadow-sm">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-building text-success"></i>
                    </span>
                    <Form.Control
                      type="text"
                      placeholder="Town/City"
                      name="townCity"
                      value={customerData.customerInfo.townCity}
                      onChange={handleCustomerInfoChange}
                    />
                  </div>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">Country</Form.Label>
                  <div className="input-group shadow-sm">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-globe text-success"></i>
                    </span>
                    <Form.Control
                      type="text"
                      placeholder="Country"
                      name="country"
                      value={customerData.customerInfo.country}
                      onChange={handleCustomerInfoChange}
                    />
                  </div>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>
        
        <div className="d-flex justify-content-end gap-3 mb-5">
          <Button 
            variant="outline-secondary" 
            className="px-4" 
            onClick={handleCancel}
          >
            <i className="bi bi-x-circle me-2"></i>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="success" 
            className="px-4 fw-bold"
          >
            <i className="bi bi-person-plus me-2"></i>
            Add Customer
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default CustomerAdd; 