import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Payment.css';

const Payment = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    amount: '',
    purpose: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    agreeTerms: false
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    
    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    // Phone validation
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }

    // Amount validation
    if (!formData.amount.trim()) {
      errors.amount = 'Amount is required';
    } else if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Please enter a valid amount';
    }

    if (!formData.purpose.trim()) errors.purpose = 'Purpose is required';

    // Card validation
    if (!formData.cardNumber.trim()) {
      errors.cardNumber = 'Card number is required';
    } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
      errors.cardNumber = 'Please enter a valid 16-digit card number';
    }

    if (!formData.expiryDate.trim()) {
      errors.expiryDate = 'Expiry date is required';
    } else if (!/^(0[1-9]|1[0-2])\/([2-9]\d)$/.test(formData.expiryDate)) {
      errors.expiryDate = 'Please use MM/YY format';
    }

    if (!formData.cvv.trim()) {
      errors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      errors.cvv = 'Please enter a valid CVV';
    }

    if (!formData.nameOnCard.trim()) errors.nameOnCard = 'Name on card is required';
    if (!formData.agreeTerms) errors.agreeTerms = 'You must agree to the terms';

    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      setIsSubmitting(true);
      
      // Simulate payment processing
      setTimeout(() => {
        setIsSubmitting(false);
        setPaymentSuccess(true);
      }, 2000);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="payment-container">
        <div className="payment-success">
          <div className="success-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <h2>Payment Successful!</h2>
          <p>Thank you for your payment. A confirmation has been sent to your email.</p>
          <div className="payment-details">
            <div className="detail-row">
              <span>Amount Paid:</span>
              <span>₹{formData.amount}</span>
            </div>
            <div className="detail-row">
              <span>Transaction ID:</span>
              <span>TX{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
            </div>
            <div className="detail-row">
              <span>Date & Time:</span>
              <span>{new Date().toLocaleString()}</span>
            </div>
          </div>
          <div className="success-actions">
            <Link to="/" className="btn-home">Return to Home</Link>
            <button className="btn-download" onClick={() => window.print()}>
              <i className="fas fa-download"></i> Download Receipt
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <div className="payment-options">
        <div className="payment-header">
          <h1>Payment Options</h1>
          <p>Choose your preferred payment method</p>
        </div>
        
        <div className="payment-tabs">
          <Link to="/payment" className="tab active">
            <i className="fas fa-credit-card"></i> Bank Transfer
          </Link>
          <Link to="/upi" className="tab">
            <i className="fas fa-mobile-alt"></i> UPI Payment
          </Link>
        </div>
        
        <div className="bank-account-container">
          <h2>Bank Account Details</h2>
          <p>Please use the following details to make a direct bank transfer</p>
          
          <table className="bank-details-table">
            <tbody>
              <tr>
                <th>Account Holder</th>
                <td>INFOPEARL TECH SOLUTIONS PVT LTD</td>
              </tr>
              <tr>
                <th>Account Number</th>
                <td>50200108035544</td>
              </tr>
              <tr>
                <th>IFSC</th>
                <td>HDFC0006581</td>
              </tr>
              <tr>
                <th>Branch</th>
                <td>THATIPUR</td>
              </tr>
              <tr>
                <th>Account Type</th>
                <td>CURRENT</td>
              </tr>
            </tbody>
          </table>
          
          <div className="bank-transfer-note">
            <p><i className="fas fa-info-circle"></i> After completing the transfer, please send the transaction details to <a href="mailto:infopearl396@gmail.com">infopearl396@gmail.com</a> or contact us at <a href="tel:+917000937390">+91 70009 37390</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment; 