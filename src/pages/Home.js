import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { heroBg, heroImageBase64 } from '../assets';
import { fallbackImageUrl } from '../assets/images/features-image';
import './Home.css';
// import TeamImage from '../assets/mmmm.jpg';
import FeatureImage from '../assets/whychoose.png';
import WhyChooseUsBg from '../assets/why.jpg';
import IsoBanner from '../assets/iso-banner.jpg';
import SEO from '../components/SEO';

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1 } }
};

const slideUp = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
};

const slideRight = {
  hidden: { x: -50, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.6 } }
};

const slideLeft = {
  hidden: { x: 50, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.6 } }
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

const Home = () => {
  const [featuresImgError, setFeaturesImgError] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState({ src: '', alt: '' });
  const [galleryImages, setGalleryImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0); // Track current image index

  const allGalleryImages = galleryImages.length > 0 ? galleryImages : [
    { src: require('../assets/mmmm.jpg'), alt: 'Research Team' },
    { src: require('../assets/training.png.jpg'), alt: 'Training Session' },
    { src: require('../assets/phd-guidance.png'), alt: 'PhD Guidance' },
    { src: require('../assets/whychoose.png'), alt: 'Research Services' },
    { src: require('../assets/opop.jpg'), alt: 'Office Space' },
    { src: require('../assets/why.jpg'), alt: 'Work Environment' },
    { src: require('../assets/phd.png'), alt: 'PhD Research' },
    { src: require('../assets/it.png'), alt: 'IT Solutions' },
    { src: require('../assets/data.png'), alt: 'Data Analysis' },
    { src: require('../assets/b1.webp'), alt: 'Academic Support' },
    { src: require('../assets/b2.webp'), alt: 'Consultations' },
    { src: require('../assets/b3.webp'), alt: 'Research Documentation' },
    { src: require('../assets/b4.webp'), alt: 'Workshop Session' },
    { src: require('../assets/b5.webp'), alt: 'Team Collaboration' },
    { src: require('../assets/t1.png'), alt: 'Technical Support' },
    { src: require('../assets/t2.png'), alt: 'Conference Presentation' },
    { src: require('../assets/t3.png'), alt: 'Academic Conference' },
    { src: require('../assets/t4.jpg'), alt: 'Research Project' },
  ];

  useEffect(() => {
    // Load gallery images from localStorage
    try {
      const savedImages = localStorage.getItem('galleryImages');
      if (savedImages) {
        const parsedImages = JSON.parse(savedImages);
        if (Array.isArray(parsedImages) && parsedImages.length > 0) {
          // Ensure we have exactly 18 images
          if (parsedImages.length < 18) {
            // If there are fewer than 18 images, create additional placeholder images
            console.log(`Only ${parsedImages.length} images found in localStorage, creating additional placeholders to reach 18`);
            const additionalCount = 18 - parsedImages.length;
            // Generate additional placeholder images
            const additionalImages = Array.from({ length: additionalCount }, (_, index) => ({
              id: Date.now() + index, // Generate unique IDs
              title: `Gallery Image ${parsedImages.length + index + 1}`,
              description: `Description for gallery image ${parsedImages.length + index + 1}`,
              src: `https://picsum.photos/id/${index + 200}/300/200`, // Random placeholder images
              alt: `Gallery image ${parsedImages.length + index + 1}`,
              createdAt: new Date().toISOString()
            }));
            const fullGallery = [...parsedImages, ...additionalImages];
            setGalleryImages(fullGallery);
            
            // Also save back to localStorage to keep it in sync
            localStorage.setItem('galleryImages', JSON.stringify(fullGallery));
          } else {
            // If we have 18 or more images, use the first 18
            setGalleryImages(parsedImages.slice(0, 18));
          }
        } else {
          console.log('No valid gallery images found in localStorage');
          createDefaultGallery();
        }
      } else {
        console.log('No gallery images in localStorage');
        createDefaultGallery();
      }
    } catch (error) {
      console.error('Error loading gallery images:', error);
      createDefaultGallery();
    }
    
    // Function to create and save a default gallery
    function createDefaultGallery() {
      // Create 18 placeholder images
      const defaultGallery = Array.from({ length: 18 }, (_, index) => ({
        id: Date.now() + index,
        title: `Gallery Image ${index + 1}`,
        description: `Description for gallery image ${index + 1}`,
        src: `https://picsum.photos/id/${index + 100}/300/200`,
        alt: `Gallery image ${index + 1}`,
        createdAt: new Date().toISOString()
      }));
      setGalleryImages(defaultGallery);
      localStorage.setItem('galleryImages', JSON.stringify(defaultGallery));
    }
  }, []);

  const handleFeaturesImgError = () => {
    setFeaturesImgError(true);
  };
  
  // Use the new image directly, fallback to URL if it fails to load
  const featuresImgSrc = featuresImgError ? fallbackImageUrl : FeatureImage;

  // Function to open lightbox with the clicked image
  const openLightbox = (src, alt) => {
    const index = allGalleryImages.findIndex(img => img.src === src);
    setCurrentImage({ src, alt });
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % allGalleryImages.length;
    setCurrentIndex(nextIndex);
    setCurrentImage(allGalleryImages[nextIndex]);
  };
  
  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + allGalleryImages.length) % allGalleryImages.length;
    setCurrentIndex(prevIndex);
    setCurrentImage(allGalleryImages[prevIndex]);
  };  

  // Function to close lightbox
  const closeLightbox = () => {
    setLightboxOpen(false);
    // Re-enable scrolling when lightbox is closed
    document.body.style.overflow = 'auto';
  };

  return (
    <div className="home-page">
      <SEO 
        title="Home"
        description="InfoPearl Tech Solutions - Leading provider of academic research support, PhD guidance, web development, software solutions, and technical training. Empowering scholars and advancing research with innovative technology."
        keywords="InfoPearl, PhD guidance, research support, web development, software solutions, technical training, academic research"
        canonicalUrl="https://infopearl.in"
      />
      
      {/* Hero Section */}
      <section className="hero" style={{ 
        background: heroBg, 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '85vh'
      }}>
        <div className="hero-image-container">
          <img src={heroImageBase64} alt="InfoPearl Tech Solutions - IT and Academic Research Services" className="hero-image" />
        </div>
        <div className="hero-content">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            // style={{ color: 'rgba(0, 0, 0, 0.80)' }}
          >
            InfoPearl Tech Solutions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            // style={{ color: 'black' }}
          >
            Empowering Scholars, Advancing Research
          </motion.p>
          <motion.div
            className="hero-buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <Link to="/services" className="btn btn-secondary">Our Services</Link>
            <Link to="/contact" className="btn btn-primary">Contact Us</Link>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <motion.h2
            className="section-title"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            InfoPearl  Tech solutions pvt ltd
          </motion.h2>
          <motion.p
            className="section-subtitle"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideUp}
          >
            Innovations in Technology
          </motion.p>
          
          <div className="about-container">
            <motion.div
              className="about-content"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideRight}
            >
              <p>
                InfoPearl Tech Solutions Pvt. Ltd. is a leading company dedicated to providing comprehensive support to PhD scholars and academic researchers as well as It solutions ( Web design, Web development, Software development, Data analysis and etc ). Our primary focus is to offer expert guidance in research, PhD admissions, conference organization, and data analysis, technical training & internships, simulation work and training.
              </p>
              <p>
                Founded with the vision of bridging the gap between academia and industry, we are committed to empowering scholars to achieve academic excellence and advance their research careers.
              </p>
              <div className="about-cta">
                
              </div>
            </motion.div>
            
            <motion.div 
              className="about-image"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideLeft}
            >
              <img 
                src={require('../assets/img.png')} 
                alt="About InfoPearl Tech" 
                className="about-img"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Cards Section */}
      <section className="services-cards-section">
        <div className="container">
          <motion.h2
            className="section-title text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            Our Services
          </motion.h2>
          <motion.p
            className="section-subtitle text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideUp}
          >
            Comprehensive academic support tailored to your needs
          </motion.p>
          
          <div className="services-grid">
            <motion.div
              className="service-card"
              variants={slideUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <div className="service-icon">
                <i className="fas fa-book"></i>
              </div>
              <h3>PhD Research Guidance</h3>
              <p>Comprehensive support in formulating research proposals, selecting methodologies, and analyzing data.</p>
              <Link to="/services" className="learn-more">Learn More →</Link>
            </motion.div>
            
            <motion.div 
              className="service-card"
              initial="hidden"
              whileInView="visible"
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              viewport={{ once: true }}
              variants={slideUp}
            >
              <div className="service-icon">
                <i className="fas fa-users"></i>
              </div>
              <h3>Training and Internships</h3>
              <p>Topic-based training programs and educational seminars tailored for researchers, students, and academic institutions.</p>
              <Link to="/training" className="learn-more">Browse Topics →</Link>
            </motion.div>
            
            <motion.div 
              className="service-card"
              initial="hidden"
              whileInView="visible"
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              viewport={{ once: true }}
              variants={slideUp}
            >
              <div className="service-icon">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <h3>IT Solutions</h3>
              <p>Web design, web development, software development, data analysis,SEO,content writing,etc.</p>
              <Link to="/services" className="learn-more">Learn More →</Link>
            </motion.div>
            
            <motion.div 
              className="service-card"
              initial="hidden"
              whileInView="visible"
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              viewport={{ once: true }}
              variants={slideUp}
            >
              <div className="service-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3>Data Analysis & Simulation</h3>
              <p>Expert services in data management, statistical analysis, modeling, and simulations.</p>
              <Link to="/services" className="learn-more">Learn More →</Link>
            </motion.div>
            
            <motion.div 
              className="service-card"
              initial="hidden"
              whileInView="visible"
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              viewport={{ once: true }}
              variants={slideUp}
            >
              <div className="service-icon">
                <i className="fas fa-code"></i>
              </div>
              <h3>Web Development</h3>
              <p>Expert web design and development services creating beautiful, responsive websites tailored to your business needs.</p>
              <Link to="/services" className="learn-more">Learn More →</Link>
            </motion.div>
            
            <motion.div 
              className="service-card"
              initial="hidden"
              whileInView="visible"
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              viewport={{ once: true }}
              variants={slideUp}
            >
              <div className="service-icon">
                <i className="fas fa-file-alt"></i>
              </div>
              <h3>Thesis Writing</h3>
              <p>Professional thesis writing assistance with comprehensive research, structured formatting, and expert academic guidance.</p>
              <Link to="/services" className="learn-more">Learn More →</Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" style={{
        backgroundImage: `url(${WhyChooseUsBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: 'rgba(255, 255, 255, 0.9)', // Lighter overlay for better readability
        backgroundBlendMode: 'overlay',
        position: 'relative'
      }}>
        {/* Semi-transparent overlay for better text readability */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          zIndex: 1
        }}></div>
        
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="features-container">
            <motion.div 
              className="features-content"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.h2 
                className="section-title"
                variants={slideRight}
              >
                Why Choose Us
              </motion.h2>
              <motion.p 
                className="section-subtitle"
                variants={slideRight}
                style={{ marginBottom: "1rem" }}
              >
                Excellence in Academic Support Services
              </motion.p>
              <motion.div 
                className="feature-item featured"
                variants={slideRight}
              >
                <div className="feature-icon">
                  <i className="fas fa-users"></i>
                </div>
                <div className="feature-text">
                  <h3>Experienced Team</h3>
                  <br></br>
                  <p>Our team consists of highly qualified professionals with a deep understanding of research methodologies, data analysis, and academic publishing.</p>
                </div>
              </motion.div>
              
              <motion.div className="feature-item" variants={slideRight}>
                <div className="feature-icon">
                  <i className="fas fa-globe"></i>
                </div>
                <div className="feature-text">
                  <h3>Global Reach</h3>
                  <p>We work with scholars from all over the world, offering insights into international academic systems and research standards.</p>
                </div>
              </motion.div>
              
              <motion.div className="feature-item" variants={slideRight}>
                <div className="feature-icon">
                  <i className="fas fa-cogs"></i>
                </div>
                <div className="feature-text">
                  <h3>Tailored Services</h3>
                  <p>We understand that each research project is unique, so we customize our solutions to meet the specific needs of each scholar.</p>
                </div>
              </motion.div>
              
              <motion.div className="feature-item" variants={slideRight}>
                <div className="feature-icon">
                  <i className="fas fa-award"></i>
                </div>
                <div className="feature-text">
                  <h3>Commitment to Excellence</h3>
                  <p>We ensure the highest quality of service, aiming to exceed client expectations every time.</p>
                </div>
              </motion.div>

              <motion.div 
                className="feature-item"
                variants={slideRight}
              >
                <div className="feature-icon">
                  <i className="fas fa-flask"></i>
                </div>
                <div className="feature-text">
                  <h3>Research Methodology</h3>
                  <p>Our team has expertise in choosing appropriate research methods, including quantitative and qualitative techniques. We guide scholars in developing robust methodologies that ensure research validity and reliability.</p>
                </div>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="features-image"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideLeft}
            >
              <img 
                src={featuresImgSrc} 
                alt="Research and Data Analysis Services" 
                onError={handleFeaturesImgError}
                style={{
                  maxWidth: '150%',
                  maxHeight: '520px',
                  objectFit: 'contain',
                  background: 'transparent',
                  padding: '20px',
                  display: 'block',
                  margin: '0 auto'
                }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* What Makes Students Hire Banner */}
      <section className="student-hire-banner">
        <motion.div 
          className="container"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="student-hire-content">
            <div className="student-hire-text">
              <motion.h2
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                WHAT MAKES STUDENTS HIRE infopearl &nbsp;? GET A WINNING RESEARCH GUIDANCE UNDER ONE ROOF&nbsp;! WE HAVE,
              </motion.h2>
            </div>
            <motion.div 
              className="student-hire-benefits"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ staggerChildren: 0.1, delayChildren: 0.3 }}
            >
              <motion.div 
                className="benefit-item"
                variants={{
                  hidden: { x: 20, opacity: 0 },
                  visible: { x: 0, opacity: 1, transition: { duration: 0.5 } }
                }}
              >
                <i className="fas fa-robot"></i>
                <span>No AI Content</span>
              </motion.div>
              <motion.div 
                className="benefit-item"
                variants={{
                  hidden: { x: 20, opacity: 0 },
                  visible: { x: 0, opacity: 1, transition: { duration: 0.5 } }
                }}
              >
                <i className="fas fa-book-open"></i>
                <span>Wide Range Of Topics</span>
              </motion.div>
              <motion.div 
                className="benefit-item"
                variants={{
                  hidden: { x: 20, opacity: 0 },
                  visible: { x: 0, opacity: 1, transition: { duration: 0.5 } }
                }}
              >
                <i className="fas fa-quote-right"></i>
                <span>Free Referencing</span>
              </motion.div>
              <motion.div 
                className="benefit-item"
                variants={{
                  hidden: { x: 20, opacity: 0 },
                  visible: { x: 0, opacity: 1, transition: { duration: 0.5 } }
                }}
              >
                <i className="fas fa-check-double"></i>
                <span>Plagiarism-Free Content</span>
              </motion.div>
              <motion.div 
                className="benefit-item"
                variants={{
                  hidden: { x: 20, opacity: 0 },
                  visible: { x: 0, opacity: 1, transition: { duration: 0.5 } }
                }}
              >
                <i className="fas fa-puzzle-piece"></i>
                <span>support and guidance</span>
              </motion.div>
              <motion.div 
                className="benefit-item"
                variants={{
                  hidden: { x: 20, opacity: 0 },
                  visible: { x: 0, opacity: 1, transition: { duration: 0.5 } }
                }}
              >
                <i className="fas fa-money-bill-wave"></i>
                <span>Flexible Payment Terms</span>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Subject Areas We Served */}
      <section className="subject-areas-section">
        <div className="container">
          <motion.div
            className="subject-areas-container"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 
              className="section-title text-center"
              variants={fadeIn}
              style={{ marginTop: '30px' }}
            >
              SUBJECT AREAS WE SERVED!
            </motion.h2>
            
            <motion.p 
              className="section-description text-center"
              variants={slideUp}
            >
              We provide the best PhD assistance & guidance for all domain areas. Our team serves across various research domains such as Engineering, Technology, Management, Medicine, Arts, Literature, Science.
            </motion.p>
            
            <div className="subject-areas-cards">
              {/* Engineering Card */}
              <motion.div 
                className="subject-card"
                variants={slideUp}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
              >
                <div className="subject-header">
                  <div className="subject-icon">
                    <i className="fas fa-cogs"></i>
                  </div>
                  <h3>Engineering</h3>
                </div>
                <p>Engineering is completely based on the principles of scientific research. Here, we do your research work with the help of experts in Engineering.</p>
                <div className="topics-container">
                  <div className="topics-header">Research topics:</div>
                  <motion.ul className="topics-list">
                    <motion.li variants={slideRight}><span>Biomechanics</span></motion.li>
                    <motion.li variants={slideRight}><span>Multi-scale computation</span></motion.li>
                    <motion.li variants={slideRight}><span>Human-computer interaction</span></motion.li>
                    <motion.li variants={slideRight}><span>Wireless sensor networks</span></motion.li>
                    <motion.li variants={slideRight}><span>Network security</span></motion.li>
                  </motion.ul>
                  <Link to="/expertise" className="topics-more">and more</Link>
                </div>
              </motion.div>
              
              {/* Science Card */}
              <motion.div 
                className="subject-card"
                variants={slideUp}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
              >
                <div className="subject-header">
                  <div className="subject-icon">
                    <i className="fas fa-flask"></i>
                  </div>
                  <h3>Science</h3>
                </div>
                <p>As the best PhD guidance & assistance in India, we provide guides or mentors based on your subject category. Here, we have listed out some of the frequently engaging research topics in Science.</p>
                <div className="topics-container">
                  <div className="topics-header">Research topics:</div>
                  <motion.ul className="topics-list">
                    <motion.li variants={slideRight}><span>Artificial Intelligence</span></motion.li>
                    <motion.li variants={slideRight}><span>Blockchain</span></motion.li>
                    <motion.li variants={slideRight}><span>Machine learning</span></motion.li>
                    <motion.li variants={slideRight}><span>Data Mining</span></motion.li>
                    <motion.li variants={slideRight}><span>Cyber security</span></motion.li>
                  </motion.ul>
                  <Link to="/expertise" className="topics-more">and more</Link>
                </div>
              </motion.div>
              
              {/* Technology Card */}
              <motion.div 
                className="subject-card"
                variants={slideUp}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
              >
                <div className="subject-header">
                  <div className="subject-icon">
                    <i className="fas fa-microchip"></i>
                  </div>
                  <h3>Technology</h3>
                </div>
                <p>InfoPearl teamed up with professionals who can handle all your projects with ease & high range of professionalism. We frequently undertake research on the following topics.</p>
                <div className="topics-container">
                  <div className="topics-header">Research topics:</div>
                  <motion.ul className="topics-list">
                    <motion.li variants={slideRight}><span>Industrial IoT</span></motion.li>
                    <motion.li variants={slideRight}><span>Deep ensemble learning</span></motion.li>
                    <motion.li variants={slideRight}><span>Data stream processing</span></motion.li>
                    <motion.li variants={slideRight}><span>Time series processing</span></motion.li>
                    <motion.li variants={slideRight}><span>Dynamic neural networks</span></motion.li>
                  </motion.ul>
                  <Link to="/expertise" className="topics-more">and more</Link>
                </div>
              </motion.div>
              
              {/* Arts & Literature Card */}
              <motion.div 
                className="subject-card"
                variants={slideUp}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
              >
                <div className="subject-header">
                  <div className="subject-icon">
                    <i className="fas fa-book"></i>
                  </div>
                  <h3>Arts & Literature</h3>
                </div>
                <p>Experts in the field of arts will help you craft your excellent Art research document. Here we have included several research topics under the Arts discipline.</p>
                <div className="topics-container">
                  <div className="topics-header">Research topics:</div>
                  <motion.ul className="topics-list">
                    <motion.li variants={slideRight}><span>Postmodern literature</span></motion.li>
                    <motion.li variants={slideRight}><span>Postcolonial ecocriticism</span></motion.li>
                    <motion.li variants={slideRight}><span>Slave narratives</span></motion.li>
                    <motion.li variants={slideRight}><span>Cultural representation</span></motion.li>
                    <motion.li variants={slideRight}><span>Artistic movements</span></motion.li>
                  </motion.ul>
                  <Link to="/expertise" className="topics-more">and more</Link>
                </div>
              </motion.div>
              
              {/* Management Card */}
              <motion.div 
                className="subject-card"
                variants={slideUp}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
              >
                <div className="subject-header">
                  <div className="subject-icon">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <h3>Management</h3>
                </div>
                <p>We have a team of experts who possess sound knowledge in the field of management and have the necessary skills to handle all your challenging management-related PhD projects.</p>
                <div className="topics-container">
                  <div className="topics-header">Research topics:</div>
                  <motion.ul className="topics-list">
                    <motion.li variants={slideRight}><span>Supply chain management</span></motion.li>
                    <motion.li variants={slideRight}><span>Human resource management</span></motion.li>
                    <motion.li variants={slideRight}><span>Corporate responsibility</span></motion.li>
                    <motion.li variants={slideRight}><span>Innovation & technology</span></motion.li>
                    <motion.li variants={slideRight}><span>Social entrepreneurship</span></motion.li>
                  </motion.ul>
                  <Link to="/expertise" className="topics-more">and more</Link>
                </div>
              </motion.div>
              
              {/* Medicine Card */}
              <motion.div 
                className="subject-card"
                variants={slideUp}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
              >
                <div className="subject-header">
                  <div className="subject-icon">
                    <i className="fas fa-heartbeat"></i>
                  </div>
                  <h3>Medicine</h3>
                </div>
                <p>Our experts in the medical field are experts from various healthcare backgrounds. They only refer to published and verified articles to provide professional guidance in PhD research.</p>
                <div className="topics-container">
                  <div className="topics-header">Research topics:</div>
                  <motion.ul className="topics-list">
                    <motion.li variants={slideRight}><span>Pain medication alternatives</span></motion.li>
                    <motion.li variants={slideRight}><span>Preclinical research</span></motion.li>
                    <motion.li variants={slideRight}><span>Inequities with healthcare access</span></motion.li>
                    <motion.li variants={slideRight}><span>Genetic disorder</span></motion.li>
                    <motion.li variants={slideRight}><span>Drug development</span></motion.li>
                  </motion.ul>
                  <Link to="/expertise" className="topics-more">and more</Link>
                </div>
              </motion.div>
            </div>
            
            <motion.div 
              className="subject-areas-cta"
              variants={fadeIn}
            >
              
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="gallery-section">
        <div className="container">
          <motion.h2 
            className="section-title text-center"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Our Community Events
          </motion.h2>
          <motion.p 
            className="section-subtitle text-center"
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <b>Showcasing our achievements and activities</b>
            
            <b> ( coming soon... ) </b>
          </motion.p>
          
          <div className="gallery-container">
            {/* Dynamic Gallery Grid */}
            {galleryImages.length > 0 ? (
              <>
                {/* Row 1 */}
                <div className="gallery-row">
                  {galleryImages.slice(0, 6).map((image, index) => (
                    <motion.div 
                      key={image.id || index}
                      className="gallery-item"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                      onClick={() => openLightbox(image.src, image.title)}
                    >
                      <img src={image.src} alt={image.alt || image.title} />
                      <div className="gallery-overlay">
                        <span>{image.title}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Row 2 - Always render if we have images */}
                <div className="gallery-row">
                  {galleryImages.slice(6, 12).map((image, index) => (
                    <motion.div 
                      key={image.id || index + 6}
                      className="gallery-item"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                      onClick={() => openLightbox(image.src, image.title)}
                    >
                      <img src={image.src} alt={image.alt || image.title} />
                      <div className="gallery-overlay">
                        <span>{image.title}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Row 3 - Always render if we have images */}
                <div className="gallery-row">
                  {galleryImages.slice(12, 18).map((image, index) => (
                    <motion.div 
                      key={image.id || index + 12}
                      className="gallery-item"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                      onClick={() => openLightbox(image.src, image.title)}
                    >
                      <img src={image.src} alt={image.alt || image.title} />
                      <div className="gallery-overlay">
                        <span>{image.title}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              // Fallback to original static gallery if no images from admin panel
              <>
                {/* Row 1 */}
                <div className="gallery-row">
                  <motion.div 
                    className="gallery-item"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                    onClick={() => openLightbox(require('../assets/mmmm.jpg'), 'Research Team')}
                  >
                    <img src={require('../assets/mmmm.jpg')} alt="Research Team" />
                    <div className="gallery-overlay">
                      <span>Research Team</span>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="gallery-item"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                    onClick={() => openLightbox(require('../assets/training.png.jpg'), 'Training Session')}
                  >
                    <img src={require('../assets/training.png.jpg')} alt="Training Session" />
                    <div className="gallery-overlay">
                      <span>Training Session</span>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="gallery-item"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                    onClick={() => openLightbox(require('../assets/phd-guidance.png'), 'PhD Guidance')}
                  >
                    <img src={require('../assets/phd-guidance.png')} alt="PhD Guidance" />
                    <div className="gallery-overlay">
                      <span>PhD Guidance</span>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="gallery-item"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                    onClick={() => openLightbox(require('../assets/whychoose.png'), 'Research Services')}
                  >
                    <img src={require('../assets/whychoose.png')} alt="Research Services" />
                    <div className="gallery-overlay">
                      <span>Research Services</span>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="gallery-item"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                    onClick={() => openLightbox(require('../assets/opop.jpg'), 'Office Space')}
                  >
                    <img src={require('../assets/opop.jpg')} alt="Office Space" />
                    <div className="gallery-overlay">
                      <span>Office Space</span>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="gallery-item"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                    onClick={() => openLightbox(require('../assets/why.jpg'), 'Work Environment')}
                  >
                    <img src={require('../assets/why.jpg')} alt="Work Environment" />
                    <div className="gallery-overlay">
                      <span>Work Environment</span>
                    </div>
                  </motion.div>
                </div>
                
                {/* Row 2 */}
                <div className="gallery-row">
                  <motion.div 
                    className="gallery-item"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                    onClick={() => openLightbox(require('../assets/phd.png'), 'PhD Research')}
                  >
                    <img src={require('../assets/phd.png')} alt="PhD Research" />
                    <div className="gallery-overlay">
                      <span>PhD Research</span>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="gallery-item"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                    onClick={() => openLightbox(require('../assets/it.png'), 'IT Solutions')}
                  >
                    <img src={require('../assets/it.png')} alt="IT Solutions" />
                    <div className="gallery-overlay">
                      <span>IT Solutions</span>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="gallery-item"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                    onClick={() => openLightbox(require('../assets/data.png'), 'Data Analysis')}
                  >
                    <img src={require('../assets/data.png')} alt="Data Analysis" />
                    <div className="gallery-overlay">
                      <span>Data Analysis</span>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="gallery-item"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                    onClick={() => openLightbox(require('../assets/b1.webp'), 'Academic Support')}
                  >
                    <img src={require('../assets/b1.webp')} alt="Academic Support" />
                    <div className="gallery-overlay">
                      <span>Academic Support</span>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="gallery-item"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                    onClick={() => openLightbox(require('../assets/b2.webp'), 'Consultations')}
                  >
                    <img src={require('../assets/b2.webp')} alt="Consultations" />
                    <div className="gallery-overlay">
                      <span>Consultations</span>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="gallery-item"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                    onClick={() => openLightbox(require('../assets/b3.webp'), 'Research Documentation')}
                  >
                    <img src={require('../assets/b3.webp')} alt="Research Documentation" />
                    <div className="gallery-overlay">
                      <span>Research Documentation</span>
                    </div>
                  </motion.div>
                </div>
                
                {/* Row 3 */}
                <div className="gallery-row">
                  <motion.div 
                    className="gallery-item"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                    onClick={() => openLightbox(require('../assets/b4.webp'), 'Workshop Session')}
                  >
                    <img src={require('../assets/b4.webp')} alt="Workshop Session" />
                    <div className="gallery-overlay">
                      <span>Workshop Session</span>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="gallery-item"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                    onClick={() => openLightbox(require('../assets/b5.webp'), 'Team Collaboration')}
                  >
                    <img src={require('../assets/b5.webp')} alt="Team Collaboration" />
                    <div className="gallery-overlay">
                      <span>Team Collaboration</span>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="gallery-item"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                    onClick={() => openLightbox(require('../assets/t1.png'), 'Technical Support')}
                  >
                    <img src={require('../assets/t1.png')} alt="Technical Support" />
                    <div className="gallery-overlay">
                      <span>Technical Support</span>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="gallery-item"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                    onClick={() => openLightbox(require('../assets/t2.png'), 'Conference Presentation')}
                  >
                    <img src={require('../assets/t2.png')} alt="Conference Presentation" />
                    <div className="gallery-overlay">
                      <span>Conference Presentation</span>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="gallery-item"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                    onClick={() => openLightbox(require('../assets/t3.png'), 'Academic Conference')}
                  >
                    <img src={require('../assets/t3.png')} alt="Academic Conference" />
                    <div className="gallery-overlay">
                      <span>Academic Conference</span>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="gallery-item"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.7 }}
                    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                    onClick={() => openLightbox(require('../assets/t4.jpg'), 'Research Project')}
                  >
                    <img src={require('../assets/t4.jpg')} alt="Research Project" />
                    <div className="gallery-overlay">
                      <span>Research Project</span>
                    </div>
                  </motion.div>
                </div>
              </>
            )}
            
          </div>
        </div>
      </section>

      {/* Lightbox Component */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div 
            className="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
          >
            <motion.div 
              className="lightbox-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* <div className="lightbox-header">
                <button className="lightbox-close" onClick={closeLightbox}>×</button>
              </div> */}
              <div className="lightbox-image-container">
                <button className="lightbox-close-hover" onClick={closeLightbox}>×</button>
                <img src={currentImage.src} alt={currentImage.alt} />
              </div>
              <button className="lightbox-nav-button lightbox-prev" onClick={handlePrev}>
                ‹
              </button>
              <button className="lightbox-nav-button lightbox-next" onClick={handleNext}>
                ›
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keep in Touch Section */}
      <section className="keep-in-touch-section">
        <div className="container">
          <motion.div 
            className="keep-in-touch-container"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="keep-in-touch-image">
              <div className="image-bg">
                <div className="dots-pattern">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
                <img src={require('../assets/logo1.png')} alt="Researcher" />
                
                <div className="rectangle-element"></div>
                <div className="rectangle-element-2"></div>
              </div>
            </div>
            
            <div className="keep-in-touch-content">
              <motion.h2
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                // style={{ marginBottom: 3 }}
              >
                KEEP IN TOUCH!
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                INFOPEARL TECH SOLUTIONS provides PhD  research program and IT SOLUTIONS. You can clarify all your doubts with our team.

                <div style={{ marginTop: 25 }}>
                  <a href="tel:+917000937390" className="phone-link">
                    <i className="fas fa-phone-alt"></i> +91 7000937390
                  </a> 
                  
                  <a href="mailto:infopearl396@gmail.com" className="email-link">
                    <i className="fas fa-envelope"></i> infopearl396@gmail.com
                  </a>
                  <a href="mailto:infopearl396@gmail.com" className="email-link">
                    <i className="fas fa-envelope"></i> ceo@infopearl.in
                  </a>
                </div>
                
              </motion.p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ISO Certification Banner */}
      <section className="iso-banner-section">
        <div className="container">
          <img 
            src={IsoBanner} 
            alt="ISO Certified Company" 
            className="iso-banner-image" 
            style={{ 
              width: '100%', 
              maxHeight: '300px', 
              objectFit: 'cover', 
              borderRadius: '10px',
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)'
            }} 
          />
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="container">
          <motion.div
            className="cta-content"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2>Ready to advance your academic journey?</h2>
            <p>Contact us for expert PhD guidance and research services!</p>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
              <Link to="/contact" className="btn btn-colorful">Contact Us Today</Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home; 