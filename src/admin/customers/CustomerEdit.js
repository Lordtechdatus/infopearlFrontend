import React, { useState, useEffect } from 'react';
import { Container, Form, Row, Col, Button, Card, Alert, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import './CustomerEdit.css';

const CustomerEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  // Load customer data from localStorage
  useEffect(() => {
    // Get customers from localStorage
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    
    // Find the customer with the matching ID
    const customer = customers.find(c => c.id.toString() === id);
    
    if (customer) {
      // Transform customer data to match our form structure
      const formattedCustomer = {
        customerInfo: {
          name: customer.name || '',
          email: customer.email || '',
          address1: customer.address1 || '',
          townCity: customer.townCity || '',
          country: customer.country || '',
          phoneNumber: customer.phone || ''
        }
      };
      
      setCustomerData(formattedCustomer);
      setLoading(false);
    } else {
      setError('Customer not found. Please check the customer ID and try again.');
      setLoading(false);
    }
  }, [id]);

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
    
    // Get existing customers
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    
    // Find the index of the customer to update
    const customerIndex = customers.findIndex(c => c.id.toString() === id);
    
    if (customerIndex !== -1) {
      // Create updated customer object
      const updatedCustomer = {
        ...customers[customerIndex],
        name: customerData.customerInfo.name,
        email: customerData.customerInfo.email,
        phone: customerData.customerInfo.phoneNumber,
        address1: customerData.customerInfo.address1,
        townCity: customerData.customerInfo.townCity,
        country: customerData.customerInfo.country,
      };
      
      // Update the customer in the array
      customers[customerIndex] = updatedCustomer;
      
      // Save back to localStorage
      localStorage.setItem('customers', JSON.stringify(customers));
      
      // Show success message and navigate back
      alert('Customer information updated successfully!');
      navigate('/admin/customers');
    } else {
      setError('Failed to update customer. Customer not found.');
    }
  };

  const handleCancel = () => {
    navigate('/admin/customers');
  };

  if (loading) {
    return (
      <Container fluid>
        <div className="text-center my-5 py-5">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-primary fw-bold">Loading customer data...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid>
        <Alert variant="danger" className="my-4 shadow-sm">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
        <Button variant="secondary" onClick={handleCancel} className="px-4">
          <i className="bi bi-arrow-left me-2"></i>
          Back to Customer List
        </Button>
      </Container>
    );
  }

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">
          Edit Customer
          <Badge bg="info" className="ms-2 fs-6">ID: {id}</Badge>
        </h1>
        <Button variant="outline-secondary" onClick={handleCancel}>
          <i className="bi bi-arrow-left me-1"></i> Back to List
        </Button>
      </div>
      
      <Form onSubmit={handleSubmit}>
        <Card className="shadow-sm mb-4 border-0">
          <Card.Header className="bg-primary text-white">
            <div className="d-flex align-items-center">
              <i className="bi bi-person-circle fs-4 me-2"></i>
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
                      <i className="bi bi-envelope-fill text-primary"></i>
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
                      <i className="bi bi-telephone-fill text-primary"></i>
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
                      <i className="bi bi-building text-primary"></i>
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
                      <i className="bi bi-globe text-primary"></i>
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
            variant="primary" 
            className="px-4 fw-bold"
          >
            <i className="bi bi-check2-circle me-2"></i>
            Save Changes
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default CustomerEdit; 