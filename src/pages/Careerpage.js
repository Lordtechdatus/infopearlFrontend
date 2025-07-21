// src/pages/CareerPage.jsx
import React from 'react';
import './Careerpage.css';

const CareerPage = () => (
  <>
    <div className="career-banner">
      <h1>Career</h1>
    </div>

    <div className="career-container">
      <h2>Enter Your Details</h2>
      <form className="career-form">
        <div className="form-group">
          <label>Name</label>
          <input type="text" name="name" placeholder="Your Name" required />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" placeholder="Your Email" required />
        </div>

        <div className="form-group">
          <label>Contact</label>
          <input type="text" name="phone" placeholder="Your Phone" required />
        </div>

        <div className="form-group">
          <label>Select Position</label>
          <select name="position" required>
            <option value="">-- Select --</option>
            <option value="frontend">Frontend Developer</option>
            <option value="backend">Backend Developer</option>
            <option value="fullstack">Full Stack Developer</option>
            <option value="graphic">Graphic Designer</option>
            
          <option value="seo">SEO</option>
            
            <option value="content">Content Writer</option>
      
            <option value="research"> research analyst</option>  
            <option value="hr">HR</option>
            <option value="sales">Sales</option>
            <option value="marketing">Marketing</option>
            <option value="accounting">Accounting</option>
            <option value="legal">Legal</option>
            <option value="customer">Customer Service</option>
          </select>
        </div>

        <div className="form-group">
          <label>Upload CV (PDF/DOC)</label>
          <input type="file" name="cv" accept=".pdf,.doc,.docx" />
        </div>

        <button type="submit" className="submit-btn">Submit</button>
      </form>
    </div>
  </>
);

export default CareerPage;
