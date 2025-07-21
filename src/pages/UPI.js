import React, { useState } from 'react';
import '../styles/UPI.css';

const UPI = () => {
  const [copyStatus, setCopyStatus] = useState('');
  const [copyAccountStatus, setCopyAccountStatus] = useState('');
  const [copyIfscStatus, setCopyIfscStatus] = useState('');

  const upiDetails = {
    id: 'infopearl396@ybl',
    name: 'InfoPearl Tech Solutions',
    accountHolder: 'INFOPEARL TECH SOLUTIONS PVT LTD',
    accountNumber: '50200108035544',
    ifsc: 'HDFC0006581',
    qrCode: require('../assets/QR2.png')
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiDetails.id)
      .then(() => {
        setCopyStatus('UPI ID copied!');
        setTimeout(() => setCopyStatus(''), 3000);
      })
      .catch(() => {
        setCopyStatus('Failed to copy');
        setTimeout(() => setCopyStatus(''), 3000);
      });
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(upiDetails.accountNumber)
      .then(() => {
        setCopyAccountStatus('Account number copied!');
        setTimeout(() => setCopyAccountStatus(''), 3000);
      })
      .catch(() => {
        setCopyAccountStatus('Failed to copy');
        setTimeout(() => setCopyAccountStatus(''), 3000);
      });
  };

  const handleCopyIFSC = () => {
    navigator.clipboard.writeText(upiDetails.ifsc)
      .then(() => {
        setCopyIfscStatus('IFSC code copied!');
        setTimeout(() => setCopyIfscStatus(''), 3000);
      })
      .catch(() => {
        setCopyIfscStatus('Failed to copy');
        setTimeout(() => setCopyIfscStatus(''), 3000);
      });
  };

  return (
    <div className="upi-container">
      <div className="upi-card">
        <h1>UPI Payment</h1>
        <p className="upi-subtitle">Quick, secure payments via UPI</p>
        
        <div className="qr-container">
          <img src={upiDetails.qrCode} alt="UPI QR Code" className="qr-code" />
          <p>Scan this QR code with any UPI app</p>
        </div>

        <div className="upi-details">
          <h3>Payment Details</h3>
          
          <table className="payment-details-table">
            <tbody>
              <tr>
                <td>Account Holder:</td>
                <td>{upiDetails.accountHolder}</td>
                <td></td>
              </tr>
              <tr>
                <td>Account Number:</td>
                <td>{upiDetails.accountNumber}</td>
                <td>
                  <button className="copy-button" onClick={handleCopyAccount}>
                    <i className="fas fa-copy"></i>
                  </button>
                </td>
              </tr>
              {copyAccountStatus && (
                <tr className="copy-status-row">
                  <td></td>
                  <td colSpan="2" className="copy-status">{copyAccountStatus}</td>
                </tr>
              )}
              <tr>
                <td>IFSC:</td>
                <td>{upiDetails.ifsc}</td>
                <td>
                  <button className="copy-button" onClick={handleCopyIFSC}>
                    <i className="fas fa-copy"></i>
                  </button>
                </td>
              </tr>
              {copyIfscStatus && (
                <tr className="copy-status-row">
                  <td></td>
                  <td colSpan="2" className="copy-status">{copyIfscStatus}</td>
                </tr>
              )}
              <tr>
                <td>UPI ID:</td>
                <td>{upiDetails.id}</td>
                <td>
                  <button className="copy-button" onClick={handleCopyUPI}>
                    <i className="fas fa-copy"></i>
                  </button>
                </td>
              </tr>
              {copyStatus && (
                <tr className="copy-status-row">
                  <td></td>
                  <td colSpan="2" className="copy-status">{copyStatus}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="upi-instructions">
          
        </div>

        <div className="upi-apps">
          <h3>Pay using your favorite UPI app</h3>
          <div className="app-icons">
            <a href="https://pay.google.com/" target="_blank" rel="noopener noreferrer" className="app-icon">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Google_Pay_Logo_%282020%29.svg/2560px-Google_Pay_Logo_%282020%29.svg.png" alt="Google Pay" />
            </a>
            <a href="https://www.phonepe.com/" target="_blank" rel="noopener noreferrer" className="app-icon">
              <img src="https://download.logo.wine/logo/PhonePe/PhonePe-Logo.wine.png" alt="PhonePe" />
            </a>
            <a href="https://paytm.com/" target="_blank" rel="noopener noreferrer" className="app-icon">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/2560px-Paytm_Logo_%28standalone%29.svg.png" alt="Paytm" />
            </a>
           
          </div>
        </div>

        <div className="contact-support">
          <p>Having trouble with payment? Contact us:</p>
          <a href="tel:+917000937390">+91 70009 37390</a> | <a href="mailto:infopearl396@gmail.com">infopearl396@gmail.com</a>
        </div>
      </div>
    </div>
  );
};

export default UPI; 