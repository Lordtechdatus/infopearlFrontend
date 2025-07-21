import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './Services.css';

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1 } }
};

const slideUp = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
};

// eslint-disable-next-line no-unused-vars
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const Services = () => {
  return (
    <div className="page-content">
      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Our Services
          </motion.h1>
          <motion.div
            className="breadcrumb"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <span>Home</span> / <span className="active">Services</span>
          </motion.div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="services-overview">
        <div className="container">
          <motion.h2
            className="section-title"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            Comprehensive Academic Support
          </motion.h2>
          <motion.p
            className="section-subtitle"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideUp}
          >
            We offer tailored solutions to meet the unique needs of each scholar
          </motion.p>
        </div>
      </section>

      {/* Services Detail */}
      <section className="services-detail">
        <div className="container">
          <div className="service-item">
            <motion.div
              className="service-content"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideUp}
            >
              <h3>PhD Research Guidance</h3>
              <p>
                Our PhD research guidance service provides comprehensive support to scholars at every stage of their 
                research journey. We offer:
              </p>
              <ul className="service-features">
                <li>Assistance in formulating research proposals that are methodologically sound and academically relevant</li>
                <li>Guidance on selecting appropriate research methodologies aligned with research objectives</li>
                <li>Expert support in data analysis and interpretation of research findings</li>
                <li>Help with writing academic papers, reviews, and thesis development</li>
                <li>Advice on publishing research in top-tier journals and increasing research impact</li>
              </ul>
            </motion.div>
            <motion.div
              className="service-image"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <img src={require('../assets/phd-guidance.png')} alt="PhD Guidance" className="service-img" />
            </motion.div>
          </div>

          <div className="service-item reverse">
            <motion.div
              className="service-content"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideUp}
            >
              <h3>Training and Seminar</h3>
              <p>
                We provide comprehensive training programs and educational seminars tailored to academic institutions and research 
                organizations. Our training and seminar services include:
              </p>
              <ul className="service-features">
                <li>Topic-based specialized training sessions for researchers and students</li>
                <li>Organizing academic seminars and workshops based on current research topics</li>
                <li>Expert speaker coordination and interactive learning experiences</li>
                <li>Training material development and participant management</li>
                <li>Post-training support and knowledge assessment</li>
              </ul>
              <Link to="/training-topics" className="btn btn-primary">Browse Training Topics</Link>
            </motion.div>
            <motion.div
              className="service-image"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <div className="image-placeholder service-img-2"></div>
            </motion.div>
          </div>

          <div className="service-item">
            <motion.div
              className="service-content"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideUp}
            >
              <h3>PhD Research Support</h3>
              <p>
                Our PhD admissions support service helps candidates navigate the complex process of applying to 
                doctoral programs. We provide:
              </p>
              <ul className="service-features">
                <li>Personalized consultation on the application process for PhD programs</li>
                <li>Assistance in selecting the right university and research program based on interests and career goals</li>
                <li>Guidance with writing compelling research proposals that stand out to admissions committees</li>
                <li>Help with preparing for interviews and entrance examinations</li>
                <li>Support with scholarship and funding applications</li>
              </ul>
            </motion.div>
            <motion.div
              className="service-image"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <div className="image-placeholder service-img-3"></div>
            </motion.div>
          </div>

          <div className="service-item reverse">
            <motion.div
              className="service-content"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideUp}
            >
                <h3>IT Solutions</h3>
              <p>
                WE DEVELOP software ,applications and websites for your business join us and promote your brand and business to next level. 
                We provide:
              </p>
              <ul className="service-features">
                <li>Website Design(html,css,javascript,react,nodejs,mongodb,mysql)</li>
                <li>mobile development(android,ios)</li>
                <li>app development(flutter,react native)</li>
                <li>training,seminar and internships</li>
                <li>Support with SEO and marketing</li>
              </ul>
            </motion.div>
            <motion.div
              className="service-image"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <div className="image-placeholder service-img-5"></div>
            </motion.div>
          </div>

          <div className="service-item">
            <motion.div
              className="service-content"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideUp}
            >
              <h3>Data Analysis</h3>
              <p>
                Our data analysis services provide expert solutions for managing complex datasets and extracting meaningful insights.
                We offer:
              </p>
              <ul className="service-features">
                <li>Expert services in data management and organization</li>
                <li>Advanced statistical analysis using industry-standard tools</li>
                <li>Data modeling and predictive analytics</li>
                <li>Complex simulations and scenario testing</li>
                <li>Data visualization and interactive dashboards</li>
                <li>Interpretation of results and actionable recommendations</li>
              </ul>
            </motion.div>
            <motion.div
              className="service-image"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <img 
                src={require('../assets/data.png')} 
                alt="Data Analysis" 
                className="service-img" 
                style={{
                  width: '100%',
                  height: '400px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              />
            </motion.div>
          </div>

          <div className="service-item">
            <motion.div
              className="service-content"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideUp}
            >
              <h3>Website Design & Development</h3>
              <p>
                We create beautiful, functional websites that help businesses establish their online presence and reach their target audience.
                Our web design & development services include:
              </p>
              <ul className="service-features">
                <li>Responsive business website that works perfectly on all devices</li>
                <li>Customized design tailored to your brand identity</li>
                <li>Premium logo design to establish your brand</li>
                <li>Website analytics to track visitor behavior and performance</li>
                <li>Website testimonial carousel to showcase client feedback</li>
                <li>SSL security to protect your website and visitors</li>
                <li>Website SEO to improve your search engine rankings</li>
                <li>Web Maintenance to keep your site updated and secure</li>
              </ul>
              
            </motion.div>
            <motion.div
              className="service-image"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <img 
                src={require('../assets/web.png')} 
                alt="Web Design & Development" 
                className="service-img" 
                style={{
                  width: '100%',
                  height: '400px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              />
            </motion.div>
          </div>

          <div className="service-item reverse">
            <motion.div
              className="service-content"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideUp}
            >
              <h3>Data Analysis and Simulations</h3>
              <p>
                Our expert data analysis services help researchers extract meaningful insights from complex datasets. 
                We offer:
              </p>
              <ul className="service-features">
                <li>Comprehensive data management, cleaning, and preprocessing</li>
                <li>Advanced statistical analysis using tools like SPSS, R, and Python</li>
                <li>Complex modeling and simulations using MATLAB, Simulink, and other specialized software</li>
                <li>Data visualization and presentation of research findings</li>
                <li>Interpretation of results and actionable insights to enhance research outcomes</li>
              </ul>
            </motion.div>
            <motion.div
              className="service-image"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <div className="image-placeholder service-img-4"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="container">
          <motion.div
            className="cta-content"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2>Ready to get started with our services?</h2>
            <p>Contact us for expert PhD guidance and research services!</p>
            <Link to="/contact" className="btn btn-secondary">Get in Touch</Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Services; 