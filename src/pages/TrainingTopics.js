import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import trainingTopics from '../data/trainingTopics';
import { contactImageBase64 } from 'assets';
import './TrainingTopics.css';

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1 } }
};

const slideUp = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const TrainingTopics = () => {
  const [activeCategory, setActiveCategory] = useState('researchMethodology');
  const categories = Object.keys(trainingTopics);

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
          >
            Training and Seminar Topics
          </motion.h1>
          <motion.div
            className="breadcrumb"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <span>Home</span> / <span className="active">Training and Seminar Topics</span>
          </motion.div>
        </div>
      </section>

      {/* Topics Overview */}
      <section className="topics-overview">
        <div className="container">
          <motion.h2
            className="section-title"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            Browse Our Training Sessions by Topic
          </motion.h2>
          <motion.p
            className="section-subtitle"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideUp}
          >
            Specialized training programs and seminars tailored to your research needs
          </motion.p>

          {/* Category Navigation */}
          <motion.div 
            className="category-nav"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {categories.map((category) => (
              <motion.button
                key={category}
                className={`category-btn ${activeCategory === category ? 'active' : ''}`}
                onClick={() => setActiveCategory(category)}
                variants={slideUp}
              >
                {trainingTopics[category].title}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Topics Detail */}
      <section className="topics-detail">
        <div className="container">
          <motion.div
            className="active-category-info"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2>{trainingTopics[activeCategory].title}</h2>
            <p>{trainingTopics[activeCategory].description}</p>
          </motion.div>

          <motion.div
            className="topics-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {trainingTopics[activeCategory].topics.map((topic) => (
              <motion.div 
                key={topic.id}
                className="topic-card"
                variants={slideUp}
              >
                <h3>{topic.title}</h3>
                <p className="topic-description">{topic.description}</p>
                
                {/* Optional details - only show if they exist */}
                {(topic.duration || topic.level || topic.targetAudience) && (
                  <div className="topic-details">
                    {topic.duration && (
                      <div className="detail-item">
                        <span className="detail-label">Duration:</span>
                        <span className="detail-value">{topic.duration}</span>
                      </div>
                    )}
                    
                    {topic.level && (
                      <div className="detail-item">
                        <span className="detail-label">Level:</span>
                        <span className="detail-value">{topic.level}</span>
                      </div>
                    )}
                    
                    {topic.targetAudience && (
                      <div className="detail-item">
                        <span className="detail-label">For:</span>
                        <span className="detail-value">{topic.targetAudience}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Only show upcoming sessions if they exist and are not empty strings */}
                {topic.upcomingSessions && 
                 topic.upcomingSessions.length > 0 && 
                 topic.upcomingSessions.some(session => session.trim() !== '') && (
                  <div className="upcoming-sessions">
                    <h4>Upcoming Sessions</h4>
                    <ul>
                      {topic.upcomingSessions       
                        .filter(session => session.trim() !== '')
                        .map((session, index) => (
                          <li key={index}>{session}</li>
                        ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
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
            <h2>Can't find what you're looking for?</h2>
            <p>We offer custom training programs tailored to your specific needs!</p>
            <Link to="/contact" className="btn btn-secondary">Contact Us</Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default TrainingTopics; 