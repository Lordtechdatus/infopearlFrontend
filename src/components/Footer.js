import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LogoImage from '../assets/logo1.png';
import facebook from '../assets/facebook.png';
import instagram from '../assets/insta.png';
import linkedin from '../assets/linkedin.png';
import './Footer.css';
import WhatsAppButton from './WhatsAppButton';

// Default footer data (fallback if localStorage is empty)
const defaultFooterData = {
  about: { description: '' },
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
    { id: 6, name: 'Payment', path: '/payment' },
    { id: 7, name: 'Career', path: '/career' }
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
  copyright: '© {year} InfoPearl Tech Solutions Pvt. Ltd. All Rights Reserved.'
};

const Footer = () => {
  const [footerData, setFooterData] = useState(defaultFooterData);
  useEffect(() => {
    try {
      const savedFooterData = localStorage.getItem('footerData');
      if (savedFooterData) setFooterData(JSON.parse(savedFooterData));
    } catch (error) {
      console.error('Error loading footer data from localStorage:', error);
    }
  }, []);

  const copyrightText = footerData.copyright
    ?.replace('{year}', new Date().getFullYear());

  return (
    <footer className="footer">
      <div className="footer-content container">

        {/* About & Contact Section */}
        <div className="footer-section about">
          <div className="footer-logo">
          <img
            src={footerData.contact.logoUrl || LogoImage}
            alt={LogoImage}
            style={{ height: '70px', width: '70px', objectFit: 'contain' }}
          />
            <h2>InfoPearl Tech</h2>
          </div>
          <p>{footerData.about.description}</p>
          <div className="contact">
            <span><i className="fas fa-map-marker-alt"></i> {footerData.contact.companyName}</span>
            <span><i className="fas fa-envelope"></i> {footerData.contact.email1}</span>
            {footerData.contact.email2 && (
              <span><i className="fas fa-envelope"></i> {footerData.contact.email2}</span>
            )}
            <span><i className="fas fa-phone"></i> {footerData.contact.phone}</span>
            <span><i className="fas fa-globe"></i> {footerData.contact.website}</span>

            {/* Social Icons after contact info */}
            <div className="footer-social-icons">
              <a
                href="https://www.facebook.com/infopearltech"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={facebook} alt='Facebook icon' style={{ height: '30px' }}/>
              </a>
              <a
                href="https://www.instagram.com/infopearltech"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={instagram} alt='Instagram icon' style={{ height: '30px' }}/>
              </a>
              <a
                href="https://www.linkedin.com/company/infopearltech"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={linkedin} alt='Linkedin icon' style={{ height: '30px' }}/>
              </a>
            </div>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="footer-section links">
          <h2>Quick Links</h2>
          <div className="footer-links">
            {footerData.quickLinks.map(link => (
              <Link key={link.id} to={link.path}>{link.name}</Link>
            ))}
            <Link to="/admin" className="admin-footer-link">Admin</Link>
          </div>
        </div>

        {/* Services Section */}
        <div className="footer-section services-list">
          <h2>Our Services</h2>
          <div className="footer-links">
            {footerData.services.map(service => (
              <Link key={service.id} to={service.path}>{service.name}</Link>
            ))}
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="footer-section payment-methods">
          <h2>Payment Methods</h2>
          <div className="payment-container">
            <div className="payment-row">
              {footerData.paymentMethods.showAmex && <div className="payment-card amex" />}
              {footerData.paymentMethods.showMastercard && <div className="payment-card mastercard" />}
              {footerData.paymentMethods.showVisa && <div className="payment-card visa" />}
              {footerData.paymentMethods.showRupay && <div className="payment-card rupay" />}
            </div>
            <div className="payment-row">
              {footerData.paymentMethods.showNetbanking && <div className="payment-card netbanking" />}
              {footerData.paymentMethods.showEmi && <div className="payment-card emi" />}
              {footerData.paymentMethods.showCod && <div className="payment-card cod" />}
            </div>
            <div className="payment-row">
              {footerData.paymentMethods.showPaytm && <div className="payment-card paytm" />}
              {footerData.paymentMethods.showPaypal && <div className="payment-card paypal" />}
              {footerData.paymentMethods.showMobikwik && <div className="payment-card mobikwik" />}
            </div>
            <div className="payment-row">
              {footerData.paymentMethods.showPayapp && <div className="payment-card payapp" />}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <p>{copyrightText || `© ${new Date().getFullYear()} InfoPearl Tech Solutions Pvt. Ltd. All Rights Reserved.`}</p>
      </div>
      <WhatsAppButton />
    </footer>
  );
};

export default Footer;
