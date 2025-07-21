import React, { useState } from 'react';
import { Container, Form, Button, Card, Row, Col, ProgressBar, InputGroup, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './UserAdd.css'; // We'll create this CSS file

const UserAdd = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    role: 'User' // Added role field
  });
  
  const [passwordStrength, setPasswordStrength] = useState({
    label: 'Weak',
    score: 0,
    variant: 'danger'
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState('');
  
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
  
  // Handle cancel button click
  const handleCancel = () => {
    navigate('/admin/users');
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleFocus = (field) => {
    setFocused(field);
  };
  
  const handleBlur = () => {
    setFocused('');
  };

  // Get password criteria checks
  const getPasswordCriteria = () => {
    const { password } = formData;
    return [
      { met: password.length >= 8, text: 'At least 8 characters' },
      { met: /[A-Z]/.test(password), text: 'Uppercase letter' },
      { met: /[a-z]/.test(password), text: 'Lowercase letter' },
      { met: /[0-9]/.test(password), text: 'Number' },
      { met: /[^A-Za-z0-9]/.test(password), text: 'Special character' }
    ];
  };
  
  const passwordCriteria = getPasswordCriteria();
  
  return (
    <Container fluid className="user-add-container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="page-title">
          <h1 className="mb-0 d-flex align-items-center">
            <div className="title-icon">
              <i className="bi bi-person-plus"></i>
            </div>
            <span>Add New User</span>
          </h1>
          <p className="text-muted mb-0 mt-1">Create a new user account with credentials</p>
        </div>
        <Button 
          variant="outline-primary" 
          onClick={handleCancel}
          className="back-button"
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Users
        </Button>
      </div>
      
      <Card className="form-card">
        <Card.Header>
          <h5 className="mb-0">User Information</h5>
          <Badge bg="primary" className="role-badge">New Account</Badge>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-4">
              <Col md={12}>
                <Form.Group className="form-group">
                  <Form.Label className={focused === 'name' ? 'focused-label' : ''}>
                    Full Name <span className="required-asterisk">*</span>
                  </Form.Label>
                  <InputGroup className={focused === 'name' ? 'focused-input' : ''}>
                    <InputGroup.Text>
                      <i className="bi bi-person-badge"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Enter user's full name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => handleFocus('name')}
                      onBlur={handleBlur}
                      required
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group className="form-group">
                  <Form.Label className={focused === 'username' ? 'focused-label' : ''}>
                    Username <span className="required-asterisk">*</span>
                  </Form.Label>
                  <InputGroup className={focused === 'username' ? 'focused-input' : ''}>
                    <InputGroup.Text>
                      <i className="bi bi-at"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Enter username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      onFocus={() => handleFocus('username')}
                      onBlur={handleBlur}
                      required
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="form-group">
                  <Form.Label className={focused === 'email' ? 'focused-label' : ''}>
                    Email Address <span className="required-asterisk">*</span>
                  </Form.Label>
                  <InputGroup className={focused === 'email' ? 'focused-input' : ''}>
                    <InputGroup.Text>
                      <i className="bi bi-envelope"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="email"
                      placeholder="Enter user's email address"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => handleFocus('email')}
                      onBlur={handleBlur}
                      required
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group className="form-group">
                  <Form.Label className={focused === 'phone' ? 'focused-label' : ''}>
                    Phone Number
                  </Form.Label>
                  <InputGroup className={focused === 'phone' ? 'focused-input' : ''}>
                    <InputGroup.Text>
                      <i className="bi bi-telephone"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="tel"
                      placeholder="Enter user's phone number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onFocus={() => handleFocus('phone')}
                      onBlur={handleBlur}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="form-group">
                  <Form.Label className={focused === 'role' ? 'focused-label' : ''}>
                    User Role <span className="required-asterisk">*</span>
                  </Form.Label>
                  <InputGroup className={focused === 'role' ? 'focused-input' : ''}>
                    <InputGroup.Text>
                      <i className="bi bi-shield-lock"></i>
                    </InputGroup.Text>
                    <Form.Select 
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      onFocus={() => handleFocus('role')}
                      onBlur={handleBlur}
                      required
                    >
                      <option value="User">Standard User</option>
                      <option value="Admin">Administrator</option>
                      <option value="Manager">Manager</option>
                    </Form.Select>
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-4">
              <Col md={12}>
                <Form.Group className="form-group">
                  <Form.Label className={focused === 'password' ? 'focused-label' : ''}>
                    Password <span className="required-asterisk">*</span>
                  </Form.Label>
                  <InputGroup className={focused === 'password' ? 'focused-input' : ''}>
                    <InputGroup.Text>
                      <i className="bi bi-lock"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter user's password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => handleFocus('password')}
                      onBlur={handleBlur}
                      required
                    />
                    <Button 
                      variant="outline-secondary"
                      onClick={togglePasswordVisibility}
                      className="show-password-btn"
                    >
                      <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                    </Button>
                  </InputGroup>
                  
                  <div className="password-strength-container">
                    <div className="strength-meter-text">
                      <span>Password Strength:</span>
                      <span className={`strength-label strength-${passwordStrength.variant}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <ProgressBar 
                      variant={passwordStrength.variant}
                      now={passwordStrength.score} 
                      className="strength-meter"
                    />
                    
                    <div className="password-criteria">
                      {passwordCriteria.map((criterion, index) => (
                        <div key={index} className={`criterion ${criterion.met ? 'met' : 'unmet'}`}>
                          <i className={`bi ${criterion.met ? 'bi-check-circle-fill' : 'bi-circle'}`}></i>
                          <span>{criterion.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Form.Group>
              </Col>
            </Row>
            
            <div className="form-actions">
              <Button 
                variant="light" 
                className="cancel-btn" 
                onClick={handleCancel}
              >
                <i className="bi bi-x-lg me-1"></i>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                className="submit-btn"
              >
                <i className="bi bi-person-plus-fill me-1"></i>
                Create User
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UserAdd; 