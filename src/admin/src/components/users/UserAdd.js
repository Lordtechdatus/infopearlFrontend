import React, { useState } from 'react';
import { Container, Form, Button, Card, Row, Col, ProgressBar } from 'react-bootstrap';

const UserAdd = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: ''
  });
  
  const [passwordStrength, setPasswordStrength] = useState({
    label: 'Weak',
    score: 0,
    variant: 'danger'
  });
  
  // Improved password strength evaluation
  const evaluatePasswordStrength = (password) => {
    // Start with a base score
    let score = 0;
    let label = 'Weak';
    let variant = 'danger';
    
    // No password
    if (!password) {
      return { label, score, variant };
    }
    
    // Length check
    if (password.length >= 8) {
      score += 25;
    } else if (password.length >= 6) {
      score += 10;
    }
    
    // Character variety checks
    if (/[A-Z]/.test(password)) {
      score += 20; // Has uppercase
    }
    
    if (/[a-z]/.test(password)) {
      score += 15; // Has lowercase
    }
    
    if (/[0-9]/.test(password)) {
      score += 20; // Has number
    }
    
    if (/[^A-Za-z0-9]/.test(password)) {
      score += 20; // Has special character
    }
    
    // Set label and variant based on final score
    if (score >= 80) {
      label = 'Strong';
      variant = 'success';
    } else if (score >= 50) {
      label = 'Medium';
      variant = 'warning';
    } else {
      label = 'Weak';
      variant = 'danger';
    }
    
    return { label, score, variant };
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Update password strength if password field is changed
    if (name === 'password') {
      setPasswordStrength(evaluatePasswordStrength(value));
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if password is strong enough
    if (passwordStrength.score < 50) {
      alert("Please use a stronger password. Your password should include a mix of uppercase and lowercase letters, numbers, and special characters.");
      return;
    }
    
    console.log('Form submitted:', formData);
    // Here you would typically send the data to your backend
    alert("User added successfully!");
  };
  
  return (
    <Container fluid>
      <h1 className="mb-4">Add User</h1>
      
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">User Information</h5>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter user's full name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Username <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter user's email address"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="Enter user's phone number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Password <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter user's password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <span className={`text-${passwordStrength.variant}`}>
                      {passwordStrength.label}
                    </span>
                    <small className="text-muted">
                      {passwordStrength.score < 50 ? 
                        "Use 8+ characters with uppercase, lowercase, numbers and symbols" : 
                        ""}
                    </small>
                  </div>
                  <ProgressBar 
                    variant={passwordStrength.variant}
                    now={passwordStrength.score} 
                    className="mt-1"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <div className="d-flex justify-content-end mt-4">
              <Button variant="secondary" className="me-2">
                Cancel
              </Button>
              <Button variant="success" type="submit">
                Add User
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UserAdd; 