//src/pages/contact.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { contactImageBase64 } from '../assets';
import './Contact.css';

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1 } }
};

const slideUp = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
};

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // REMOVED: const [backendStatus, setBackendStatus] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('https://backend.infopearl.in/submit.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
    
      const text = await response.text();
      console.log("Raw Response:", text);
    
      const result = JSON.parse(text); // manually parse
      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        setError(result.message || 'Something went wrong.');
      }
    } catch (error) {
      console.error("Fetch error:", error); // 🔍
      setError('Network error: ' + error.message);
    }
  };

  // REMOVED: testBackendConnection function
  return (
    <div className="page-content">
      {/* Page Header */}
      <section className="page-header">
        <div className="contact-image-container">
          <img src={contactImageBase64} alt="IT Solutions Contact" className="contact-image" />
        </div>
        <div className="container">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ color: 'white' }}
          >
            Contact Us
          </motion.h1>
          <motion.div
            className="breadcrumb"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <span>Home</span> / <span className="active">Contact</span>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="container">
          <div className="contact-wrapper">
            <motion.div
              className="contact-info"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <h2>Get In Touch</h2>
              <p>
                Have questions about our services? Ready to start your research journey with us?
                Contact us today and our team will get back to you as soon as possible.
              </p>
              
              <div className="contact-details">
                <div className="contact-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <div>
                    <h4>Our Location</h4>
                    <p>
                    G1, Akansha Apartment, Patel Nagar, City Centre, Gwalior, Near Raj Rajeshwari Apartment-474002</p>
                  </div>
                </div>
                
                <div className="contact-item">
                  <i className="fas fa-envelope"></i>
                  <div>
                    <h4>Email Us</h4>
                    <p>infopearl396@gmail.com</p>
                    <p>ceo@infopearl.in</p>
                  </div>
                </div>
                
                <div className="contact-item">
                  <i className="fas fa-phone-alt"></i>
                  <div>
                    <h4>Call Us</h4>
                    <p>7000937390</p>
                  </div>
                </div>
                
                <div className="contact-item">
                  <i className="fas fa-globe"></i>
                  <div>
                    <h4>Website</h4>
                    <p>www.infopearl.in</p>
                  </div>
                </div>
              </div>

            </motion.div>


            {/* Form Details Section*/}
            <motion.div
              className="contact-form-container"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideUp}
            >
              {/* Backend connection test UI */}
              {/* REMOVED: <div style={{ marginBottom: '1em' }}>
                <button onClick={testBackendConnection}>Test Backend Connection</button>
                {backendStatus && <div>{backendStatus}</div>}
              </div> */}
              <h2>Send Us a Message</h2>
              {submitted ? (
                <div className="success-message">
                  <p>Thank you for your message! We'll get back to you soon.</p>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit}>
                  {error && (
                    <div className="error-message">
                      <p>{error}</p>
                    </div>
                  )}
                  
                  <div className="form-group">
                    <label htmlFor="name">Your Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      readOnly={loading}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Your Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      readOnly={loading}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      readOnly={loading}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="subject">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      readOnly={loading}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="message">Your Message</label>
                    <textarea
                      id="message"
                      name="message"
                      rows="5"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      readOnly={loading}
                    ></textarea>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    readOnly={loading}
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>

          {/* --- Map Section (New Position) --- */}
          <motion.div 
            className="map-container full-width-map" 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }} // Trigger animation when 20% is visible
            variants={fadeIn} // Use fadeIn animation
          >
            <h3>Our Location on Map</h3>
            {/* --- PASTE YOUR GOOGLE MAPS IFRAME CODE HERE --- */}
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3579.595122320124!2d78.18758317451262!3d26.209845877073008!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3976c41cce3cd799%3A0x184f3cb9095a386c!2zQWthbnNoYSBBcGFydG1lbnQgKOCkhuCkleCkvuCkguCktuCkviDgpIXgpKrgpL7gpLDgpY3gpJ_gpK7gpYfgpILgpJ8p!5e0!3m2!1sen!2sin!4v1754120800883!5m2!1sen!2sin"
              width="80%" 
              height="400" /* Increased height */
              style={{ border: '1px solid gray' }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="InfoPearl Location Map"
            >
            </iframe>
             {/* --- END OF IFRAME --- */}
          </motion.div>

        </div> {/* End of container */}
      </section>
    </div>
  );
};


export default Contact; 