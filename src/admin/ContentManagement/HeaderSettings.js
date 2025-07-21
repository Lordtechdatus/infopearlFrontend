import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert, Tabs, Tab } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './ContentManagement.css';

const HeaderSettings = () => {
  const defaultHeaderData = {
    email: 'infopearl396@gmail.com',
    phone: '+91 70009 37390',
    logoText: 'InfoPearl',
    logoUrl: '',
    topBarBackgroundColor: '#051937',
    topBarTextColor: '#ffffff',
    navbarBackgroundColor: '#004d7a',
    navbarTextColor: '#ffffff',
    logoSize: '80',
    showContactInfo: true,
    showSocialIcons: false
  };
  
  const [headerData, setHeaderData] = useState(defaultHeaderData);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [key, setKey] = useState('general');

  useEffect(() => {
    setIsLoading(true);
    try {
      const savedHeaderData = localStorage.getItem('headerData');
      if (savedHeaderData) {
        // Keep any default properties that might not be in saved data
        setHeaderData({ ...defaultHeaderData, ...JSON.parse(savedHeaderData) });
      } else {
        setHeaderData(defaultHeaderData);
      }
    } catch (error) {
      console.error('Error loading header data from localStorage:', error);
      setErrorMessage('Failed to load header settings.');
      setHeaderData(defaultHeaderData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    // For checkboxes, use the checked property instead of value
    const newValue = type === 'checkbox' ? checked : value;
    
    setHeaderData({
      ...headerData,
      [name]: newValue
    });
  };

  const handleColorChange = (name, value) => {
    setHeaderData({
      ...headerData,
      [name]: value
    });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeaderData({
          ...headerData,
          logoUrl: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const resetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all header settings to defaults?')) {
      setHeaderData(defaultHeaderData);
      setSuccessMessage('Settings reset to defaults. Click Save Changes to apply.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      if (!headerData.email || !headerData.phone || !headerData.logoText) {
        throw new Error('Contact email, phone, and logo text are required.');
      }
      
      localStorage.setItem('headerData', JSON.stringify(headerData));
      
      // Simulate network delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSuccessMessage('Header settings updated successfully! Refresh the main website to see changes.');
      
      // Clear success message after a few seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (error) { 
      console.error('Error updating header information:', error);
      setErrorMessage(error.message || 'Failed to update header settings. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading Header Settings...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4 content-management-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Header Settings</h2>
          <p className="text-muted mb-0">Customize the appearance and content of your website header</p>
        </div>
        <div>
          <Button 
            variant="outline-secondary" 
            size="sm"
            onClick={resetToDefaults}
            className="me-2"
          >
            <i className="bi bi-arrow-counterclockwise me-1"></i>
            Reset to Defaults
          </Button>
        </div>
      </div>
      
      {successMessage && (
        <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>
          <i className="bi bi-check-circle-fill me-2"></i> {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert variant="danger" onClose={() => setErrorMessage('')} dismissible>
          <i className="bi bi-exclamation-triangle-fill me-2"></i> {errorMessage}
        </Alert>
      )}
      
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Tabs
            id="header-settings-tabs"
            activeKey={key}
            onSelect={(k) => setKey(k)}
            className="mb-4"
          >
            <Tab eventKey="general" title="General Settings">
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="email">
                      <Form.Label>Contact Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={headerData.email}
                        onChange={handleInputChange}
                        placeholder="Enter contact email"
                        required
                      />
                      <Form.Text className="text-muted">
                        Displayed in the top bar for contact purposes.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="phone">
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="phone"
                        value={headerData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter contact phone number"
                        required
                      />
                      <Form.Text className="text-muted">
                        Displayed in the top bar for contact purposes.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="logoText">
                      <Form.Label>Logo Text</Form.Label>
                      <Form.Control
                        type="text"
                        name="logoText"
                        value={headerData.logoText}
                        onChange={handleInputChange}
                        placeholder="Enter text displayed next to the logo"
                        required
                      />
                      <Form.Text className="text-muted">
                        The text that appears next to the logo in the navigation bar.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="logoUpload">
                      <Form.Label>Upload Logo</Form.Label>
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                      />
                      <Form.Text className="text-muted">
                        Upload a logo image (PNG or JPG format recommended).
                      </Form.Text>
                      {headerData.logoUrl && (
                        <div className="mt-2 logo-preview">
                          <img 
                            src={headerData.logoUrl} 
                            alt="Logo Preview" 
                            style={{ 
                              maxHeight: '80px', 
                              maxWidth: '100%',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              padding: '5px'
                            }} 
                          />
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="logoSize">
                      <Form.Label>Logo Size (px)</Form.Label>
                      <Form.Control
                        type="number"
                        name="logoSize"
                        min="40"
                        max="150"
                        value={headerData.logoSize}
                        onChange={handleInputChange}
                        placeholder="Enter logo size in pixels"
                      />
                      <Form.Text className="text-muted">
                        Adjust the size of the logo image (40px - 150px).
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Check 
                        type="checkbox"
                        id="showContactInfo"
                        name="showContactInfo"
                        label="Show contact information in top bar"
                        checked={headerData.showContactInfo}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Check 
                        type="checkbox"
                        id="showSocialIcons"
                        name="showSocialIcons"
                        label="Show social media icons in top bar"
                        checked={headerData.showSocialIcons}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <div className="text-end">
                  <Button variant="primary" type="submit" disabled={isUpdating}>
                    {isUpdating ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                        Updating...
                      </>
                    ) : (
                      <><i className="bi bi-save me-2"></i> Save Changes</>
                    )}
                  </Button>
                </div>
              </Form>
            </Tab>
            
            <Tab eventKey="appearance" title="Colors & Appearance">
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="topBarBackgroundColor">
                      <Form.Label>Top Bar Background Color</Form.Label>
                      <div className="d-flex">
                        <Form.Control
                          type="color"
                          name="topBarBackgroundColor"
                          value={headerData.topBarBackgroundColor}
                          onChange={handleInputChange}
                          className="me-2"
                          style={{ width: '50px', height: '38px' }}
                        />
                        <Form.Control
                          type="text"
                          value={headerData.topBarBackgroundColor}
                          onChange={(e) => handleColorChange('topBarBackgroundColor', e.target.value)}
                          placeholder="e.g. #000000 or rgb(0,0,0)"
                        />
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="topBarTextColor">
                      <Form.Label>Top Bar Text Color</Form.Label>
                      <div className="d-flex">
                        <Form.Control
                          type="color"
                          name="topBarTextColor"
                          value={headerData.topBarTextColor}
                          onChange={handleInputChange}
                          className="me-2"
                          style={{ width: '50px', height: '38px' }}
                        />
                        <Form.Control
                          type="text"
                          value={headerData.topBarTextColor}
                          onChange={(e) => handleColorChange('topBarTextColor', e.target.value)}
                          placeholder="e.g. #ffffff or rgb(255,255,255)"
                        />
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="navbarBackgroundColor">
                      <Form.Label>Navigation Bar Background Color</Form.Label>
                      <div className="d-flex">
                        <Form.Control
                          type="color"
                          name="navbarBackgroundColor"
                          value={headerData.navbarBackgroundColor}
                          onChange={handleInputChange}
                          className="me-2"
                          style={{ width: '50px', height: '38px' }}
                        />
                        <Form.Control
                          type="text"
                          value={headerData.navbarBackgroundColor}
                          onChange={(e) => handleColorChange('navbarBackgroundColor', e.target.value)}
                          placeholder="e.g. #004d7a or rgb(0,77,122)"
                        />
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="navbarTextColor">
                      <Form.Label>Navigation Bar Text Color</Form.Label>
                      <div className="d-flex">
                        <Form.Control
                          type="color"
                          name="navbarTextColor"
                          value={headerData.navbarTextColor}
                          onChange={handleInputChange}
                          className="me-2"
                          style={{ width: '50px', height: '38px' }}
                        />
                        <Form.Control
                          type="text"
                          value={headerData.navbarTextColor}
                          onChange={(e) => handleColorChange('navbarTextColor', e.target.value)}
                          placeholder="e.g. #ffffff or rgb(255,255,255)"
                        />
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
                
                <div className="text-end">
                  <Button variant="primary" type="submit" disabled={isUpdating}>
                    {isUpdating ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                        Updating...
                      </>
                    ) : (
                      <><i className="bi bi-save me-2"></i> Save Changes</>
                    )}
                  </Button>
                </div>
              </Form>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
      
      <Card className="shadow-sm">
        <Card.Header>
          <h3 className="mb-0">Preview</h3>
        </Card.Header>
        <Card.Body>
          {/* Top Bar Preview */}
          <div className="mb-4">
            <small className="text-muted d-block mb-2">Top Bar:</small>
            <div 
              className="preview-top-bar" 
              style={{ 
                backgroundColor: headerData.topBarBackgroundColor,
                color: headerData.topBarTextColor,
                padding: '10px 20px',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              {headerData.showContactInfo && (
                <div className="contact-preview">
                  <span style={{ marginRight: '15px' }}>
                    <i className="bi bi-envelope me-1"></i> {headerData.email}
                  </span>
                  <span>
                    <i className="bi bi-telephone me-1"></i> {headerData.phone}
                  </span>
                </div>
              )}
              
              {headerData.showSocialIcons && (
                <div className="social-preview">
                  <i className="bi bi-facebook me-2"></i>
                  <i className="bi bi-twitter me-2"></i>
                  <i className="bi bi-instagram me-2"></i>
                  <i className="bi bi-linkedin"></i>
                </div>
              )}
            </div>
          </div>
          
          {/* Navbar Preview */}
          <div>
            <small className="text-muted d-block mb-2">Navigation Bar:</small>
            <div 
              className="preview-navbar" 
              style={{ 
                backgroundColor: headerData.navbarBackgroundColor,
                color: headerData.navbarTextColor,
                padding: '10px 20px',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {headerData.logoUrl ? (
                  <img 
                    src={headerData.logoUrl}
                    alt="Logo Preview"
                    style={{ 
                      width: `${headerData.logoSize}px`, 
                      height: `${headerData.logoSize}px`,
                      objectFit: 'contain',
                      marginRight: '15px'
                    }}
                  />
                ) : (
                  <div style={{ 
                    width: `${headerData.logoSize}px`, 
                    height: `${headerData.logoSize}px`,
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px',
                    marginRight: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    color: '#777'
                  }}>
                    Logo
                  </div>
                )}
                <span style={{ 
                  fontWeight: 'bold', 
                  fontSize: '24px',
                  color: headerData.navbarTextColor
                }}>
                  {headerData.logoText}
                </span>
              </div>
              
              <div style={{ color: headerData.navbarTextColor }}>
                <span style={{ margin: '0 10px' }}>Home</span>
                <span style={{ margin: '0 10px' }}>About</span>
                <span style={{ margin: '0 10px' }}>Services</span>
                <span style={{ margin: '0 10px' }}>Contact</span>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default HeaderSettings; 