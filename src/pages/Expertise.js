import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { contactImageBase64 } from 'assets';
import './Expertise.css';
import SEO from '../components/SEO';

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1 } }
};

const slideUp = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
};

const Expertise = () => {
  return (
    <div className="page-content">
      <SEO 
        title="Expertise"
        description="Learn about InfoPearl Tech Solutions - our vision, mission, values, and journey in providing academic research support and innovative IT solutions."
        keywords="about InfoPearl, company history, vision, mission, values, team, academic research, IT solutions"
        canonicalUrl="https://infopearl.in/expertise"
      />
      {/* Page Header */}
      <section className="page-header">
        <div className="contact-image-container">
          <img src={contactImageBase64} alt="IT Solutions Contact" className="contact-image" />
        </div>
        <div className="container" style={{ backgroundColor: 'transparent' }}>
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ color: 'white' }}
          >
            Our Expertise
          </motion.h1>
          <motion.div
            className="breadcrumb"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <span>Home</span> / <span className="active">Expertise</span>
          </motion.div>
        </div>
      </section>

      {/* Expertise Overview */}
      <section className="expertise-overview">
        <div className="container">
          <motion.h2
            className="section-title"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            What Sets Us Apart
          </motion.h2>
          <motion.p
            className="section-subtitle"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideUp}
          >
            At InfoPearl Tech Solutions, we pride ourselves on our ability to offer:
          </motion.p>

          <div className="expertise-content">
            <motion.div
              className="expertise-text"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideUp}
            >
              <p>
                Our team of experts brings years of experience and specialized knowledge to every project we undertake.
                We combine academic rigor with practical insights to deliver exceptional results for our clients.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Expertise Areas */}
      <section className="expertise-areas">
        <div className="container">
          <motion.h2
            className="section-title"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            Our Core Expertise Areas
          </motion.h2>

          <div className="expertise-grid grid-2">
            <motion.div
              className="expertise-card"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideUp}
            >
              <div className="expertise-icon">
                <i className="fas fa-clipboard-check"></i>
              </div>
              <h3>Customized Research Support</h3>
              <p>
                Every scholar's journey is unique, and we provide tailored services based on individual needs.
                Our customized approach ensures that each research project receives the specific guidance and
                support it requires to succeed.
              </p>
              <ul>
                <li>Personalized research methodology design</li>
                <li>Customized data collection strategies</li>
                <li>Tailored analysis approaches for unique research questions</li>
                <li>Individual guidance on publication strategies</li>
              </ul>
            </motion.div>

            <motion.div
              className="expertise-card"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideUp}
            >
              <div className="expertise-icon">
                <i className="fas fa-user-graduate"></i>
              </div>
              <h3>Expert Consultancy</h3>
              <p>
                Our team has in-depth knowledge of global academic standards, ensuring the highest quality of guidance.
                We stay updated with the latest developments in research methodologies and academic publishing
                to provide cutting-edge advice.
              </p>
              <ul>
                <li>PhD-qualified consultants with research experience</li>
                <li>Subject matter experts across diverse disciplines</li>
                <li>Publication specialists with journal editorial experience</li>
                <li>Academic writing and communication experts</li>
              </ul>
            </motion.div>

            <motion.div
              className="expertise-card"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideUp}
            >
              <div className="expertise-icon">
                <i className="fas fa-chart-bar"></i>
              </div>
              <h3>Data-Driven Solutions</h3>
              <p>
                From data cleaning to advanced statistical analysis, we help scholars interpret complex data
                to enhance research validity. Our expertise in data management ensures that your research
                is built on a solid empirical foundation.
              </p>
              <ul>
                <li>Advanced statistical analysis using SPSS, R, Python</li>
                <li>Qualitative data analysis with NVivo and similar tools</li>
                <li>Data visualization and presentation</li>
                <li>Mixed methods research approaches</li>
              </ul>
            </motion.div>

            <motion.div
              className="expertise-card"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideUp}
            >
              <div className="expertise-icon">
                <i className="fas fa-calendar-check"></i>
              </div>
              <h3>Problem Solving Expertise</h3>
              <p>
                We ensure the seamless execution of conferences, seminars, and academic events that foster
                knowledge sharing. Our event management team handles all aspects of academic conferences,
                from planning to post-event publications.
              </p>
              <ul>
                <li>End-to-end conference organization</li>
                <li>Virtual and hybrid academic event management</li>
                <li>Speaker coordination and program development</li>
                <li>Publication of conference proceedings</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="our-approach">
        <div className="container">
          <motion.h2
            className="section-title"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            Our Approach
          </motion.h2>
          
          <div className="approach-steps">
            <motion.div
              className="approach-step"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideUp}
            >
              <div className="step-number">01</div>
              <div className="step-content">
                <h3>Understand</h3>
                <p>
                  We begin by thoroughly understanding your research goals, challenges, and requirements.
                  This in-depth understanding allows us to tailor our approach to your specific needs.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              className="approach-step"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideUp}
            >
              <div className="step-number">02</div>
              <div className="step-content">
                <h3>Plan</h3>
                <p>
                  Based on our understanding, we develop a comprehensive plan that outlines the methodology,
                  timeline, and deliverables for your project. This ensures clarity and alignment from the start.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              className="approach-step"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideUp}
            >
              <div className="step-number">03</div>
              <div className="step-content">
                <h3>Execute</h3>
                <p>
                  Our team of experts implements the plan with precision, applying their specialized knowledge
                  and skills to deliver high-quality results. We maintain regular communication throughout this phase.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              className="approach-step"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideUp}
            >
              <div className="step-number">04</div>
              <div className="step-content">
                <h3>Refine</h3>
                <p>
                  We continuously refine our approach based on feedback and emerging insights, ensuring
                  that the final outcome exceeds expectations and meets the highest academic standards.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="container" style={{ backgroundColor: 'transparent' }}>
          <motion.div
            className="cta-content"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2>Ready to leverage our expertise for your academic success?</h2>
            <p>Contact us today to discuss how we can support your research journey!</p>
            <Link to="/contact" className="btn btn-secondary">Contact Us Today</Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Expertise; 