// // src/pages/CareerPage.jsx
// import React, { useState } from 'react';
// import { motion } from 'framer-motion';
// import './Careerpage.css';

// const fadeIn = {
//   hidden: { opacity: 0 },
//   visible: { opacity: 1, transition: { duration: 1 } }
// };

// const slideUp = {
//   hidden: { y: 50, opacity: 0 },
//   visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
// };

// const CareerPage = () => {
//   const [submitted, setSubmitted] = useState(false);
//   const [error, setError] = useState('');
  
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     position: '',
//     cv_filename: null
//   });

//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     const { name, value, files } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: files ? files[0] : value
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     // const form = new FormData();
//     // form.append('name', formData.name);
//     // form.append('email', formData.email);
//     // form.append('phone', formData.phone);
//     // form.append('position', formData.position);
//     // form.append('cv', formData.cv_filename);  // File field
    
//     try {
//       const response = await fetch('https://backend.infopearl.in/career-submit.php', {
//         method: 'POST',
//         body: formData  // Send form data with file
//       });

//       const text = await response.text();
//       console.log("Raw Response:", text);

//       const result = text;
//       if (response.ok) {
//         setSubmitted(true);
//         setFormData({ name: '', email: '', phone: '', position: '', cv_filename: null });
//         setTimeout(() => setSubmitted(false), 3000);
//         console.log('Application submitted:', result);
//       } else {
//         setError(result.message || 'Something went wrong.');
//         console.error('Error:', result.message);
//       }
//     } catch (error) {
//       console.error('Network error:', error);
//       setError('Network errors: ' + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <motion.div 
//         className="career-banner"
//         initial="hidden"
//         whileInView="visible"
//         viewport={{ once: true }}
//         variants={fadeIn}
//       >
//         <h1>Career</h1>
//       </motion.div>

//       <motion.div 
//         className="career-container"
//         initial="hidden"
//         whileInView="visible"
//         viewport={{ once: true }}
//         variants={slideUp}
//        >
//         <h2>Enter Your Details</h2>
//         <motion.div className="career-form-container" >
//           <form className="career-form" onSubmit={handleSubmit}>
//             <div className="form-group">
//               <label htmlFor="name">Name</label>
//               <input 
//                 id="name"
//                 type="text"
//                 name="name"
//                 placeholder="Your Name"
//                 value={formData.name}
//                 onChange={handleChange}
//                 required 
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="email">Email</label>
//               <input 
//                 id="email"
//                 type="email"
//                 name="email"
//                 placeholder="Your Email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 required 
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="phone">Contact</label>
//               <input 
//                 id="phone"
//                 type="phone"
//                 name="phone"
//                 placeholder="Your Phone"
//                 value={formData.phone}
//                 onChange={handleChange}
//                 required 
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="position">Select Position</label>
//               <input 
//                 id="position"
//                 type="text"
//                 name="position"
//                 placeholder="Enter your desired position"
//                 value={formData.position}
//                 onChange={handleChange}
//                 required
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="cv">Upload CV (only PDF)</label>
//               <input 
//                 id="cv"
//                 type="file"
//                 name="cv_filename"
//                 accept=".pdf"
//                 onChange={handleChange}
//                 required
//               />
//             </div>

//             {error && <div className="error-message"><p>{error}</p></div>}

//             {submitted && <div className="success-message"><p>Application submitted successfully!</p></div>}

//             <button 
//               type="submit" 
//               className="submit-btn"
//               disabled={loading}
//             >
//               {loading ? 'Submitting...' : 'Submit'}
//             </button>
//           </form>
//         </motion.div>
//       </motion.div>
//     </>
//   );
// };

// export default CareerPage;



// src/pages/CareerPage.jsx
import React, { useState, useRef } from 'react';
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

const MAX_FILE_BYTES = 1 * 1024 * 1024; // 1MB

const CareerPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // NOTE: rename cv_filename -> cv (matches backend)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    cv: null
  });

  const fileRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, files, type } = e.target;

    if (type === 'file') {
      const file = files && files[0] ? files[0] : null;
      setFormData(prev => ({ ...prev, [name]: file }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!formData.name || !formData.email || !formData.position) {
      return 'Please fill name, email and position.';
    }
    if (!formData.cv) {
      return 'Please upload your CV (PDF).';
    }
    const file = formData.cv;
    const extOk = /\.pdf$/i.test(file.name);
    if (!extOk) return 'Only PDF files are allowed.';
    if (file.size > MAX_FILE_BYTES) return 'File too large (max 10 MB).';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    // Build FormData for multipart/form-data
    const form = new FormData();
    form.append('name', formData.name);
    form.append('email', formData.email);
    form.append('phone', formData.phone || '');      // optional
    form.append('position', formData.position);
    form.append('cv', formData.cv);                  // IMPORTANT: field name must be 'cv'

    try {
      const response = await fetch('https://backend.infopearl.in/career-submit.php', {
        method: 'POST',
        body: form, // Do NOT set Content-Type header manually
      });

      const raw = await response.text();
      let result;
      try {
        result = JSON.parse(raw);
      } catch {
        result = { status: 'unknown', raw };
      }

      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', position: '', cv: null });
        if (fileRef.current) fileRef.current.value = ''; // clear <input type="file" />
        setTimeout(() => setSubmitted(false), 3000);
      } else {
        setError(result?.message || 'Something went wrong while submitting your application.');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
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
        <motion.div className="career-form-container">
          <form className="career-form" onSubmit={handleSubmit} noValidate>
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
                type="tel"
                name="phone"
                placeholder="Your Phone (optional)"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="position">Select Position</label>
              <input
                id="position"
                type="text"
                name="position"
                placeholder="Enter your desired position"
                value={formData.position}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="cv">Upload CV (only PDF, max 1MB)</label>
              <input
                id="cv"
                type="file"
                name="cv"               
                accept=".pdf"
                ref={fileRef}
                onChange={handleChange}
                required
              />
            </div>

            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}

            {submitted && (
              <div className="success-message">
                <p>Application submitted successfully!</p>
              </div>
            )}

            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </>
  );
};

export default CareerPage;
