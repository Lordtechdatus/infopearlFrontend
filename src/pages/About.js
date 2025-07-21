import React from 'react';
import { motion } from 'framer-motion';
import './About.css';
import SEO from '../components/SEO';

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1 } }
};

const slideUp = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
};

const About = () => {
  return (
    <div className="about-page">
      <SEO 
        title="About Us"
        description="Learn about InfoPearl Tech Solutions - our vision, mission, values, and journey in providing academic research support and innovative IT solutions."
        keywords="about InfoPearl, company history, vision, mission, values, team, academic research, IT solutions"
        canonicalUrl="https://yourwebsite.com/about"
      />
      
    <div className="page-content">
      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            About Us
          </motion.h1>
          <motion.div
            className="breadcrumb"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <span>Home</span> / <span className="active">About</span>
          </motion.div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="about-company">
        <div className="container">
          <div className="about-grid">
            <motion.div
              className="about-text"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideUp}
            >
              <h2>Company Overview</h2>
              <p>
                InfoPearl Tech Solutions Pvt. Ltd. is a leading company dedicated to providing comprehensive
                support to PhD scholars and academic researchers. Our primary focus is to offer expert guidance in
                research, PhD admissions, conference organization, and data analysis.
              </p>
              <p>
                Founded with the vision of bridging the gap between academia and industry, we are committed to
                empowering scholars to achieve academic excellence and advance their research careers.
              </p>
              <p>
                With an experienced team of researchers, consultants, and academic professionals, InfoPearl Tech
                Solutions offers tailored solutions to meet the unique needs of each scholar. We are proud to be a
                trusted partner for scholars and institutions, providing high-quality support every step of the way.
              </p>
            </motion.div>
            <motion.div
              className="about-image"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <img src={require('../assets/opop.png')} alt="Company Overview" className="company-image" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="our-values">
        <div className="container">
          <motion.h2
            className="section-title"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            Our Expertise and Values
          </motion.h2>
          <motion.p
            className="section-subtitle"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideUp}
          >
            At InfoPearl Tech Solutions, we pride ourselves on our commitment to excellence
          </motion.p>

          <div className="values-grid grid-2">
            <motion.div
              className="card value-card"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={slideUp}
            >
              <div className="card-icon">
                <i className="fas fa-flask"></i>
              </div>
              <h3>Research Methodology</h3>
              <p>
                Our team has expertise in choosing appropriate research methods, including quantitative and qualitative 
                techniques. We guide scholars in developing robust methodologies that ensure research validity and reliability.
              </p>
            </motion.div>

            <motion.div
              className="card value-card"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={slideUp}
            >
              <div className="card-icon">
                <i className="fas fa-database"></i>
              </div>
              <h3>IT Solutions</h3>
              <p>
                we develop software,applications and websites for your business join us and promote your brand and business to next level.
              </p>
            </motion.div>

            <motion.div
              className="card value-card"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={slideUp}
            >
              <div className="card-icon">
                <i className="fas fa-code"></i>
              </div>
              <h3>Web Development</h3>
              <p>
                Expert services in creating modern, responsive websites and web applications. We deliver custom solutions tailored to your business needs with beautiful designs and powerful functionality.
              </p>
            </motion.div>

            <motion.div
              className="card value-card"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={slideUp}
            >
              <div className="card-icon">
                <i className="fas fa-laptop-code"></i>
              </div>
              <h3>Simulations & Modeling</h3>
              <p>
                Our team offers assistance with advanced simulation work in fields such as engineering, healthcare, and 
                technology. We employ cutting-edge tools and techniques to create accurate models and simulations.
              </p>
            </motion.div>

            <motion.div
              className="card value-card"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={slideUp}
            >
              <div className="card-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3>Data Analysis</h3>
              <p>
                Expert services in data management, statistical analysis, modeling, and simulations. We help extract meaningful insights from complex datasets to drive informed decision-making.
              </p>
            </motion.div>

            <motion.div
              className="card value-card"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={slideUp}
            >
              <div className="card-icon">
                <i className="fas fa-users"></i>
              </div>
              <h3>Training and Seminar</h3>
              <p>
                We provide topic-focused training and educational seminars for researchers and students.
                Our experienced team ensures engaging learning experiences that develop valuable skills and knowledge.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-choose-us">
        <div className="container">
          <motion.h2
            className="section-title"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            Why Choose InfoPearl Tech?
          </motion.h2>

          <div className="features-grid grid-3 md:grid-3 sm:grid-1">
            <motion.div
              className="feature-item"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideUp}
            >
              <div className="flex flex-col md:flex-row items-center p-4 md:p-6 bg-[#f9fcfd] rounded-2xl shadow-md">
                <div className="mb-4 md:mb-0 md:mr-6">
    <img src={require('../assets/t1.png')} alt="Experienced Team" className="w-14" />
  </div>
                <div className="text-center md:text-left">
                  <h3 className="font-bold text-xl text-slate-800 mb-2">Experienced<br className="hidden md:block" />Team</h3>
    <p className="text-gray-700 max-w-xs leading-relaxed">
      Our team consists of highly qualified professionals with a deep understanding of research methodologies, data analysis, and academic publishing.
    </p>
  </div>
</div>
            </motion.div>

            <motion.div
              className="feature-item"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideUp}
            >
              <div className="flex flex-col md:flex-row items-center p-4 md:p-6 bg-[#f9fcfd] rounded-2xl shadow-md">
                <div className="mb-4 md:mb-0 md:mr-6">
                  <img src={require('../assets/t1.png')} alt="Global Reach" className="w-14" />
                </div>
                <div className="text-center md:text-left">
                  <h3 className="font-bold text-xl text-slate-800 mb-2">Global<br className="hidden md:block" />Reach</h3>
                  <p className="text-gray-700 max-w-xs leading-relaxed">
                  We work with scholars from all over the world, offering insights into international academic systems
                  and research standards.
                </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="feature-item"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideUp}
            >
              <div className="flex flex-col md:flex-row items-center p-4 md:p-6 bg-[#f9fcfd] rounded-2xl shadow-md">
                <div className="mb-4 md:mb-0 md:mr-6">
                  <img src={require('../assets/t1.png')} alt="Tailored Services" className="w-14" />
              </div>
                <div className="text-center md:text-left">
                  <h3 className="font-bold text-xl text-slate-800 mb-2">Tailored<br className="hidden md:block" />Services</h3>
                  <p className="text-gray-700 max-w-xs leading-relaxed">
                We understand that each research project is unique, so we customize our solutions to meet the specific
                needs of each scholar.
              </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Our Team Section */}
<section className="our-team">
  <div className="container">
    <motion.h2
      className="section-title"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeIn}
    >
    Meet our clients
    </motion.h2>
    <motion.p
      className="section-subtitle"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={slideUp}
    >
      Dedicated experts committed to supporting your academic journey
    </motion.p>

    <div className="team-grid grid-3">
      {/* Team Member 1 */}
      <motion.div
        className="team-card"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={slideUp}
      >
        <img src={require('../assets/t1.png')} alt="Dr. A Sharma" className="team-photo" />
        <h4>Dr. A Sharma</h4>
        <p>Research Advisor & Data Analyst</p>
      </motion.div>

      {/* Team Member 2 */}
      <motion.div
        className="team-card"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={slideUp}
      >
        <img src={require('../assets/t2.png')} alt="Ms. B Patel" className="team-photo" />
        <h4>Ms. B Patel</h4>
        <p>Academic Consultant</p>
      </motion.div>

      {/* Team Member 3 */}
      <motion.div
        className="team-card"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={slideUp}
      >
        <img src={require('../assets/t3.png')} alt="Mr. C Verma" className="team-photo" />
        <h4>Mr. C Verma</h4>
        <p>Web Developer & Tech Support</p>
      </motion.div>
      {/* Team Member 4 */}
      <motion.div
        className="team-card"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={slideUp}
      >
        <img src={require('../assets/t4.jpg')} alt="Mr. C Verma" className="team-photo" />
        <h4>Mr. C Verma</h4>
        <p>Web Developer & Tech Support</p>
      </motion.div>
      {/* Team Member 5 */}
      <motion.div
        className="team-card"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={slideUp}
      >
        <img src={require('../assets/t4.jpg')} alt="Mr. C Verma" className="team-photo" />
        <h4>Mr. C Verma</h4>
        <p>Web Developer & Tech Support</p>
      </motion.div>
      {/* Team Member 6 */}
      <motion.div
        className="team-card"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}   
        variants={slideUp}
      >
        <img src={require('../assets/t4.jpg')} alt="Mr. C Verma" className="team-photo" />
        <h4>Mr. C Verma</h4>
        <p>Web Developer & Tech Support</p>
      </motion.div> 
      
    </div>
  </div>
</section>

      </div>
    </div>
  );
};

export default About;