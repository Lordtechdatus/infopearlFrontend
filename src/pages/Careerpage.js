// src/pages/CareerPage.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './Careerpage.css';

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1 } }
};

const slideUp = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
};

const CareerPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    cv: null
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert("Application submitted successfully!");
    // Clear form
    setFormData({
      name: '',
      email: '',
      phone: '',
      position: '',
      cv: null
    });
  };

  return (
    <>
      <motion.div 
        className="career-banner"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <h1>Career</h1>
      </motion.div>

      <motion.div 
        className="career-container"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={slideUp}
       >
        <h2>Enter Your Details</h2>
        <motion.div className="career-form-container" >
          <form className="career-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input 
                id="name"
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                id="email"
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Contact</label>
              <input 
                id="phone"
                type="text"
                name="phone"
                placeholder="Your Phone"
                value={formData.phone}
                onChange={handleChange}
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="position">Select Position</label>
              <select 
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
              >
                <option value="">-- Select --</option>
                <option value="accounting">Accounting</option>
                <option value="backend">Backend Developer</option>
                <option value="content">Content Writer</option>
                <option value="customer">Customer Service</option>
                <option value="frontend">Frontend Developer</option>
                <option value="fullstack">Full Stack Developer</option>
                <option value="graphic">Graphic Designer</option>
                <option value="hr">HR</option>
                <option value="legal">Legal</option>
                <option value="marketing">Marketing</option>
                <option value="research">Research Analyst</option>
                <option value="sales">Sales</option>
                <option value="seo">SEO Specialist</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="cv">Upload CV (PDF/DOC)</label>
              <input 
                id="cv"
                type="file"
                name="cv"
                accept=".pdf,.doc,.docx"
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="submit-btn">Submit</button>
          </form>
        </motion.div>
      </motion.div>
    </>
  );
};

export default CareerPage;
