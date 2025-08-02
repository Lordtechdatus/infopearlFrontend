import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';

// Default footer data (used if localStorage is empty)
const defaultFooterData = {
  about: {
    description: '' //'Innovations in Technology. We provide comprehensive support to PhD scholars and academic researchers with expert guidance in research, PhD admissions, conference organization, and data analysis.'
  },
  contact: {
    companyName: 'InfoPearl Tech Solutions Pvt. Ltd.',
    email1: 'infopearl396@gmail.com',
    email2: 'ceo@infopearl.in',
    phone: '+91 70009 37390',
    website: 'www.infopearl.in'
  },
  quickLinks: [
    { id: 1, name: 'Home', path: '/' },
    { id: 2, name: 'About', path: '/about' },
    { id: 3, name: 'Services', path: '/services' },
    { id: 4, name: 'Expertise', path: '/expertise' },
    { id: 5, name: 'Contact', path: '/contact' },
    { id: 6, name: 'Payment', path: '/payment' }
  ],
  services: [
    { id: 1, name: 'PhD Research Guidance', path: '/services' },
    { id: 2, name: 'Training and Seminar', path: '/services' },
    { id: 3, name: 'PhD Admissions Support', path: '/services' },
    { id: 4, name: 'Data Analysis & Simulations', path: '/services' }
  ],
  paymentMethods: {
    showAmex: true,
    showMastercard: true,
    showVisa: true,
    showRupay: true,
    showNetbanking: true,
    showEmi: true,
    showCod: true,
    showPaytm: true,
    showPaypal: true,
    showMobikwik: true,
    showPayapp: true
  },
  copyright: `© ${new Date().getFullYear()} InfoPearl Tech Solutions Pvt. Ltd. All Rights Reserved.`
};

const FooterSettings = () => {
  const [footerData, setFooterData] = useState(defaultFooterData);
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [newQuickLink, setNewQuickLink] = useState({ name: '', path: '' });
  const [newService, setNewService] = useState({ name: '', path: '' });

  // Load footer data from localStorage on component mount
  useEffect(() => {
    const fetchFooterData = () => {
      try {
        const savedFooterData = localStorage.getItem('footerData');
        if (savedFooterData) {
          setFooterData(JSON.parse(savedFooterData));
        } else {
          // If nothing in localStorage, use the default data
          setFooterData(defaultFooterData);
        }
      } catch (error) {
        console.error('Error loading footer data from localStorage:', error);
        // Fallback to default data in case of parsing errors
        setFooterData(defaultFooterData);
      }
    };
    
    fetchFooterData();
  }, []);

  const handleInputChange = (e, section, field) => {
    const { value } = e.target;
    
    if (section) {
      setFooterData({
        ...footerData,
        [section]: {
          ...footerData[section],
          [field]: value
        }
      });
    } else {
      setFooterData({
        ...footerData,
        [field]: value
      });
    }
  };

  const handlePaymentMethodToggle = (method) => {
    setFooterData({
      ...footerData,
      paymentMethods: {
        ...footerData.paymentMethods,
        [method]: !footerData.paymentMethods[method]
      }
    });
  };

  const handleNewLinkChange = (e, type) => {
    const { name, value } = e.target;
    if (type === 'quickLink') {
      setNewQuickLink({
        ...newQuickLink,
        [name]: value
      });
    } else if (type === 'service') {
      setNewService({
        ...newService,
        [name]: value
      });
    }
  };

  const addNewLink = (type) => {
    if (type === 'quickLink' && newQuickLink.name && newQuickLink.path) {
      setFooterData({
        ...footerData,
        quickLinks: [
          ...footerData.quickLinks,
          {
            id: Date.now(),
            name: newQuickLink.name,
            path: newQuickLink.path
          }
        ]
      });
      setNewQuickLink({ name: '', path: '' });
    } else if (type === 'service' && newService.name && newService.path) {
      setFooterData({
        ...footerData,
        services: [
          ...footerData.services,
          {
            id: Date.now(),
            name: newService.name,
            path: newService.path
          }
        ]
      });
      setNewService({ name: '', path: '' });
    }
  };

  const removeLink = (id, type) => {
    if (type === 'quickLink') {
      setFooterData({
        ...footerData,
        quickLinks: footerData.quickLinks.filter(link => link.id !== id)
      });
    } else if (type === 'service') {
      setFooterData({
        ...footerData,
        services: footerData.services.filter(service => service.id !== id)
      });
    }
  };

  const resetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all header settings to defaults?')) {
      setFooterData(defaultFooterData);
      setSuccessMessage('Settings reset to defaults. Click Save Changes to apply.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      // Save footer data to localStorage
      localStorage.setItem('footerData', JSON.stringify(footerData));
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSuccessMessage('Footer information updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating footer information:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="content-management-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Footer Settings</h2>
          <p>Update the information displayed in the website footer</p>
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
        <div className="success-message">
          <i className="fas fa-check-circle"></i> {successMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="management-form">
        <div className="form-section">
          <h3>About Section</h3>
          <div className="form-group">
            <label htmlFor="about-description">Company Description</label>
            <textarea
              id="about-description"
              value={footerData.about.description}
              onChange={(e) => handleInputChange(e, 'about', 'description')}
              rows={4}
            />
          </div>
        </div>
        
        <div className="form-section">
          <h3>Contact Information</h3>
          <div className="form-group">
            <label htmlFor="company-name">Company Name</label>
            <input
              type="text"
              id="company-name"
              value={footerData.contact.companyName}
              onChange={(e) => handleInputChange(e, 'contact', 'companyName')}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email1">Primary Email</label>
            <input
              type="email"
              id="email1"
              value={footerData.contact.email1}
              onChange={(e) => handleInputChange(e, 'contact', 'email1')}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email2">Secondary Email</label>
            <input
              type="email"
              id="email2"
              value={footerData.contact.email2}
              onChange={(e) => handleInputChange(e, 'contact', 'email2')}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="text"
              id="phone"
              value={footerData.contact.phone}
              onChange={(e) => handleInputChange(e, 'contact', 'phone')}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="website">Website</label>
            <input
              type="text"
              id="website"
              value={footerData.contact.website}
              onChange={(e) => handleInputChange(e, 'contact', 'website')}
              required
            />
          </div>
        </div>
        
        <div className="form-section">
          <h3>Quick Links</h3>
          <div className="links-container">
            {footerData.quickLinks.map((link) => (
              <div key={link.id} className="link-item">
                <span>{link.name} - {link.path}</span>
                <button 
                  type="button" 
                  className="remove-link-btn"
                  onClick={() => removeLink(link.id, 'quickLink')}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
          </div>
          
          <div className="add-link-form">
            <div className="form-group">
              <label htmlFor="new-link-name">Link Text</label>
              <input
                type="text"
                id="new-link-name"
                name="name"
                value={newQuickLink.name}
                onChange={(e) => handleNewLinkChange(e, 'quickLink')}
                placeholder="e.g. About Us"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="new-link-path">Link Path</label>
              <input
                type="text"
                id="new-link-path"
                name="path"
                value={newQuickLink.path}
                onChange={(e) => handleNewLinkChange(e, 'quickLink')}
                placeholder="e.g. /about"
              />
            </div>
            
            <button 
              type="button" 
              className="add-link-btn"
              onClick={() => addNewLink('quickLink')}
              disabled={!newQuickLink.name || !newQuickLink.path}
            >
              <i className="fas fa-plus"></i> Add Link
            </button>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Services</h3>
          <div className="links-container">
            {footerData.services.map((service) => (
              <div key={service.id} className="link-item">
                <span>{service.name} - {service.path}</span>
                <button 
                  type="button" 
                  className="remove-link-btn"
                  onClick={() => removeLink(service.id, 'service')}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
          </div>
          
          <div className="add-link-form">
            <div className="form-group">
              <label htmlFor="new-service-name">Service Name</label>
              <input
                type="text"
                id="new-service-name"
                name="name"
                value={newService.name}
                onChange={(e) => handleNewLinkChange(e, 'service')}
                placeholder="e.g. PhD Research Guidance"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="new-service-path">Service Path</label>
              <input
                type="text"
                id="new-service-path"
                name="path"
                value={newService.path}
                onChange={(e) => handleNewLinkChange(e, 'service')}
                placeholder="e.g. /services"
              />
            </div>
            
            <button 
              type="button" 
              className="add-link-btn"
              onClick={() => addNewLink('service')}
              disabled={!newService.name || !newService.path}
            >
              <i className="fas fa-plus"></i> Add Service
            </button>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Payment Methods</h3>
          <p>Select which payment methods to display in the footer:</p>
          
          <div className="payment-toggle-container">
            <div className="payment-option">
              <input
                type="checkbox"
                id="amex"
                checked={footerData.paymentMethods.showAmex}
                onChange={() => handlePaymentMethodToggle('showAmex')}
              />
              <label htmlFor="amex">American Express</label>
            </div>
            
            <div className="payment-option">
              <input
                type="checkbox"
                id="mastercard"
                checked={footerData.paymentMethods.showMastercard}
                onChange={() => handlePaymentMethodToggle('showMastercard')}
              />
              <label htmlFor="mastercard">Mastercard</label>
            </div>
            
            <div className="payment-option">
              <input
                type="checkbox"
                id="visa"
                checked={footerData.paymentMethods.showVisa}
                onChange={() => handlePaymentMethodToggle('showVisa')}
              />
              <label htmlFor="visa">Visa</label>
            </div>
            
            <div className="payment-option">
              <input
                type="checkbox"
                id="rupay"
                checked={footerData.paymentMethods.showRupay}
                onChange={() => handlePaymentMethodToggle('showRupay')}
              />
              <label htmlFor="rupay">RuPay</label>
            </div>
            
            <div className="payment-option">
              <input
                type="checkbox"
                id="netbanking"
                checked={footerData.paymentMethods.showNetbanking}
                onChange={() => handlePaymentMethodToggle('showNetbanking')}
              />
              <label htmlFor="netbanking">Net Banking</label>
            </div>
            
            <div className="payment-option">
              <input
                type="checkbox"
                id="emi"
                checked={footerData.paymentMethods.showEmi}
                onChange={() => handlePaymentMethodToggle('showEmi')}
              />
              <label htmlFor="emi">EMI</label>
            </div>
            
            <div className="payment-option">
              <input
                type="checkbox"
                id="cod"
                checked={footerData.paymentMethods.showCod}
                onChange={() => handlePaymentMethodToggle('showCod')}
              />
              <label htmlFor="cod">Cash on Delivery</label>
            </div>
            
            <div className="payment-option">
              <input
                type="checkbox"
                id="paytm"
                checked={footerData.paymentMethods.showPaytm}
                onChange={() => handlePaymentMethodToggle('showPaytm')}
              />
              <label htmlFor="paytm">Paytm</label>
            </div>
            
            <div className="payment-option">
              <input
                type="checkbox"
                id="paypal"
                checked={footerData.paymentMethods.showPaypal}
                onChange={() => handlePaymentMethodToggle('showPaypal')}
              />
              <label htmlFor="paypal">PayPal</label>
            </div>
            
            <div className="payment-option">
              <input
                type="checkbox"
                id="mobikwik"
                checked={footerData.paymentMethods.showMobikwik}
                onChange={() => handlePaymentMethodToggle('showMobikwik')}
              />
              <label htmlFor="mobikwik">MobiKwik</label>
            </div>
            
            <div className="payment-option">
              <input
                type="checkbox"
                id="payapp"
                checked={footerData.paymentMethods.showPayapp}
                onChange={() => handlePaymentMethodToggle('showPayapp')}
              />
              <label htmlFor="payapp">Other Payment Apps</label>
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Copyright Text</h3>
          <div className="form-group">
            <label htmlFor="copyright">Copyright Statement</label>
            <input
              type="text"
              id="copyright"
              value={footerData.copyright}
              onChange={(e) => handleInputChange(e, null, 'copyright')}
              required
            />
            <small>Use {new Date().getFullYear()} for the current year, which will update automatically.</small>
          </div>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="save-btn" disabled={isUpdating}>
            {isUpdating ? 'Updating...' : 'Save Changes'}
          </button>
        </div>
      </form>
      
      <div className="preview-container">
        <h3>Footer Preview</h3>
        <div className="footer-preview">
          <div className="preview-section">
            <h4>About InfoPearl</h4>
            <p>{footerData.about.description}</p>
          </div>
          
          <div className="preview-section">
            <h4>Contact Us</h4>
            <p>
              <i className="fas fa-map-marker-alt"></i> {footerData.contact.companyName}<br />
              <i className="fas fa-envelope"></i> {footerData.contact.email1}<br />
              {footerData.contact.email2 && <><i className="fas fa-envelope"></i> {footerData.contact.email2}<br /></>}
              <i className="fas fa-phone"></i> {footerData.contact.phone}<br />
              <i className="fas fa-globe"></i> {footerData.contact.website}
            </p>
          </div>
          
          <div className="preview-section">
            <h4>Quick Links</h4>
            <ul className="footer-links-preview">
              {footerData.quickLinks.map(link => (
                <li key={link.id}><a href="/">{link.name}</a></li>
              ))}
            </ul>
          </div>
          
          <div className="preview-section">
            <h4>Services</h4>
            <ul className="footer-links-preview">
              {footerData.services.map(service => (
                <li key={service.id}><a href="/">{service.name}</a></li>
              ))}
            </ul>
          </div>
          
          <div className="preview-section">
            <h4>Payment Methods</h4>
            <div className="payment-preview">
              <div className="payment-row-preview">
                {footerData.paymentMethods.showAmex && <div className="payment-icon">Amex</div>}
                {footerData.paymentMethods.showMastercard && <div className="payment-icon">MC</div>}
                {footerData.paymentMethods.showVisa && <div className="payment-icon">Visa</div>}
                {footerData.paymentMethods.showRupay && <div className="payment-icon">RuPay</div>}
              </div>
              <div className="payment-row-preview">
                {footerData.paymentMethods.showNetbanking && <div className="payment-icon">NetB</div>}
                {footerData.paymentMethods.showEmi && <div className="payment-icon">EMI</div>}
                {footerData.paymentMethods.showCod && <div className="payment-icon">COD</div>}
              </div>
              <div className="payment-row-preview">
                {footerData.paymentMethods.showPaytm && <div className="payment-icon">Paytm</div>}
                {footerData.paymentMethods.showPaypal && <div className="payment-icon">PayPal</div>}
                {footerData.paymentMethods.showMobikwik && <div className="payment-icon">MobiK</div>}
              </div>
              <div className="payment-row-preview">
                {footerData.paymentMethods.showPayapp && <div className="payment-icon">Others</div>}
              </div>
            </div>
          </div>
        </div>
        
        <div className="copyright-preview">
          <p>{footerData.copyright.replace('2023', new Date().getFullYear())}</p>
        </div>
      </div>
    </div>
  );
};

export default FooterSettings; 