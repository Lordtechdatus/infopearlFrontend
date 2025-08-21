import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import DefaultLogoImage from '../assets/logo1.png'; // Default logo as fallback
import { Logo } from '../assets';
import './Navbar.css';
import { getWebsiteData } from '../data/websiteData';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownStates, setDropdownStates] = useState({});
  const location = useLocation();
  const dropdownRefs = useRef({});
  const [navData, setNavData] = useState(null);
  const [headerSettings, setHeaderSettings] = useState(null);

  // Load navigation data from websiteData
  useEffect(() => {
    // 1. Load header settings from localStorage
    let loadedSettings = {};
    try {
      const savedSettings = localStorage.getItem('headerData');
      if (savedSettings) {
        loadedSettings = JSON.parse(savedSettings);
      }
    } catch (error) {
      console.error('Error loading headerData from localStorage:', error);
    }
    setHeaderSettings(loadedSettings);

    // 2. Load default nav data (especially menu items)
    const defaultNavData = getWebsiteData('navData');

    // 3. Merge data: Use settings from localStorage, fall back to defaults
    const mergedData = {
      ...defaultNavData,
      email: loadedSettings.email || defaultNavData.email,
      phone: loadedSettings.phone || defaultNavData.phone,
      logoText: loadedSettings.logoText || defaultNavData.logoText,
      logoUrl: loadedSettings.logoUrl || '',
      menuItems: defaultNavData.menuItems || [], // Always use default menu items for now
      
      // Include new header settings with defaults
      topBarBackgroundColor: loadedSettings.topBarBackgroundColor || '#051937',
      topBarTextColor: loadedSettings.topBarTextColor || '#ffffff',
      navbarBackgroundColor: loadedSettings.navbarBackgroundColor || '#004d7a',
      navbarTextColor: loadedSettings.navbarTextColor || '#ffffff',
      logoSize: loadedSettings.logoSize || '80',
      showContactInfo: loadedSettings.showContactInfo !== undefined ? loadedSettings.showContactInfo : true,
      showSocialIcons: loadedSettings.showSocialIcons !== undefined ? loadedSettings.showSocialIcons : true,
    };
    setNavData(mergedData);

    // 4. Initialize dropdown states based on the final menu items
    if (mergedData.menuItems) {
      const initialDropdownStates = {};
      mergedData.menuItems.forEach(item => {
        if (item.dropdown) {
          initialDropdownStates[item.id] = false;
        }
      });
      setDropdownStates(initialDropdownStates);
    }
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
        
        // Apply darker navbar background when scrolled
        if (navData) {
          // Get navbar container and apply slightly darker background
          const navbar = document.querySelector('.navbar.scrolled');
          if (navbar) {
            // Darken the navbar background color by 10%
            const darkenColor = (color) => {
              // For hex colors
              if (color.startsWith('#')) {
                const r = parseInt(color.slice(1, 3), 16);
                const g = parseInt(color.slice(3, 5), 16);
                const b = parseInt(color.slice(5, 7), 16);
                return `rgb(${Math.max(0, r - 25)}, ${Math.max(0, g - 25)}, ${Math.max(0, b - 25)})`;
              } 
              // For rgb colors
              else if (color.startsWith('rgb')) {
                const rgb = color.match(/\d+/g);
                if (rgb && rgb.length >= 3) {
                  return `rgb(${Math.max(0, parseInt(rgb[0]) - 25)}, ${Math.max(0, parseInt(rgb[1]) - 25)}, ${Math.max(0, parseInt(rgb[2]) - 25)})`;
                }
              }
              return color;
            };
            
            navbar.style.backgroundColor = darkenColor(navData.navbarBackgroundColor);
          }
        }
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [navData]);
  
  // Apply hamburger menu styles when data changes
  useEffect(() => {
    if (navData) {
      // Update hamburger menu color
      const hamburgerLines = document.querySelectorAll('.hamburger span');
      hamburgerLines.forEach(line => {
        line.style.backgroundColor = navData.navbarTextColor;
      });
      
      // Update dropdown item colors on mobile
      const dropdownItems = document.querySelectorAll('.dropdown-item');
      if (window.innerWidth <= 960) {
        dropdownItems.forEach(item => {
          item.style.color = navData.navbarTextColor;
        });
      }
    }
  }, [navData, isOpen, dropdownStates]);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
    
    // Close all dropdowns
    if (navData && navData.menuItems) {
      const resetDropdownStates = {};
      navData.menuItems.forEach(item => {
        if (item.dropdown) {
          resetDropdownStates[item.id] = false;
        }
      });
      setDropdownStates(resetDropdownStates);
    }
  }, [location, navData]);

  // Handle click outside of dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navData && navData.menuItems) {
        navData.menuItems.forEach(item => {
          if (item.dropdown && dropdownRefs.current[item.id] && 
              !dropdownRefs.current[item.id].contains(event.target)) {
            setDropdownStates(prev => ({
              ...prev,
              [item.id]: false
            }));
          }
        });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [navData]);

  // Toggle dropdown
  const toggleDropdown = (e, itemId) => {
    e.preventDefault();
    setDropdownStates(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));

    // Close other dropdowns
    if (navData && navData.menuItems) {
      navData.menuItems.forEach(item => {
        if (item.dropdown && item.id !== itemId) {
          setDropdownStates(prev => ({
            ...prev,
            [item.id]: false
          }));
        }
      });
    }
  };

  // Handle hover on dropdown
  const handleMouseEnter = (itemId) => {
    // Only enable hover functionality on desktop
    if (window.innerWidth > 960) {
      setDropdownStates(prev => ({
        ...prev,
        [itemId]: true
      }));
    }
  };

  const handleMouseLeave = (itemId) => {
    // Only enable hover functionality on desktop
    if (window.innerWidth > 960) {
      setDropdownStates(prev => ({
        ...prev,
        [itemId]: false
      }));
    }
  };

  // Render mega menu for services
  const renderMegaMenu = (item) => {
    return (
      <div className={`mega-menu ${dropdownStates[item.id] ? 'show' : ''}`}>
        <div className="mega-menu-container">
          {item.categories.map(category => (
            <div key={category.id} className="mega-menu-column">
              <h3 className="mega-menu-title">{category.title}</h3>
              <ul className="mega-menu-list">
                {category.items.map(menuItem => (
                  <li key={menuItem.id}>
                    <Link to={menuItem.path} className="mega-menu-item">
                      {menuItem.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!navData) {
    return null; // Or a loading indicator
  }

  return (
    <>
      {navData.showContactInfo && (
        <div className="top-bar" style={{ 
          backgroundColor: '#ffffff',
          color: '#051937',
        }}>
          <div className="container">
            <div className="top-bar-content">
              <div className="contact-info">
                <a href={`mailto:${navData.email}`} className="contact-link">
                  <i className="fas fa-envelope" style={{ color: navData.topBarTextColor }}></i>
                  <span style={{ color: navData.topBarTextColor }}>{navData.email}</span>
                </a>
                <a href={`tel:${navData.phone}`} className="contact-link" style={{ color: navData.topBarTextColor }}>
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/1200px-Flag_of_India.svg.png" 
                    alt="Indian Flag" 
                    className="phone-flag" 
                  />
                  {/* <i className="fas fa-phone" style={{ color: navData.topBarTextColor }}></i> */}
                  <span style={{ color: navData.topBarTextColor }}>{navData.phone}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} style={{ 
        backgroundColor: navData.navbarBackgroundColor,
        color: navData.navbarTextColor,
        position: 'sticky' 
      }}>
        <div className="navbar-container">
          <Link to="/" className="navbar-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '0', marginRight: '0' }}>
            <img
              src={navData.logoUrl || DefaultLogoImage}
              alt="InfoPearl Tech Logo"
              className="navbar-logo-image"
              style={{
                height: `${navData.logoSize}px`,
                width: `${navData.logoSize}px`,
                objectFit: 'contain',
              }}
            />
            <span className="logo-text" style={{ fontWeight: 'bold', fontSize: '30px', color: navData.navbarTextColor }}>
              <span className="desktop-logo-text">{navData.logoText}</span>
              <span className="mobile-logo-text">{navData.logoText}</span>
            </span>
          </Link>

          <div className="menu-icon" onClick={() => setIsOpen(!isOpen)}>
            <div className={`hamburger ${isOpen ? 'active' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>

          <motion.ul 
            className={`nav-menu ${isOpen ? 'active' : ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ color: navData.navbarTextColor }}
          >
            {navData.menuItems.map((item) => (
              <li 
                key={item.id} 
                className={`nav-item ${item.dropdown ? 'dropdown' : ''} ${item.megaMenu ? 'mega-dropdown' : ''}`}
                ref={el => item.dropdown && (dropdownRefs.current[item.id] = el)}
                onMouseEnter={() => item.dropdown && handleMouseEnter(item.id)}
                onMouseLeave={() => item.dropdown && handleMouseLeave(item.id)}
              >
                {item.dropdown ? (
                  <>
                    <Link
                      to={item.path}
                      className={
                        (location.pathname === item.path ||
                         (item.dropdownItems && item.dropdownItems.some(subItem => location.pathname === subItem.path)))
                        ? `nav-links active dropdown-toggle ${item.isButton ? 'pay-now-button' : ''} ${dropdownStates[item.id] ? 'show' : ''}`
                        : `nav-links dropdown-toggle ${item.isButton ? 'pay-now-button' : ''} ${dropdownStates[item.id] ? 'show' : ''}`
                      }
                      style={{ color: navData.navbarTextColor }}
                      onClick={e => {
                        // For Services (megaMenu), open the page and also open the menu on desktop
                        if (item.megaMenu) {
                          if (window.innerWidth > 960) {
                            e.preventDefault();
                            setDropdownStates(prev => ({ ...prev, [item.id]: !prev[item.id] }));
                            // Navigate to /services
                            window.location.href = item.path;
                          }
                          // On mobile, just navigate
                        }
                      }}
                    >
                      {item.text}
                    </Link>
                    {item.megaMenu ? (
                      renderMegaMenu(item)
                    ) : (
                      <ul className={`dropdown-menu ${dropdownStates[item.id] ? 'show' : ''}`}>
                        {item.dropdownItems && item.dropdownItems.map((subItem) => (
                          <li key={subItem.id}>
                            <Link 
                              to={subItem.path} 
                              className="dropdown-item"
                            >
                              {subItem.text}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link 
                    to={item.path} 
                    className={
                      location.pathname === item.path
                        ? `nav-links active ${item.isButton ? 'contact-btn' : ''}`
                        : `nav-links ${item.isButton ? 'contact-btn' : ''}`
                    }
                    style={{ color: navData.navbarTextColor }}
                  >
                    {item.text}
                  </Link>
                )}
              </li>
            ))}
          </motion.ul>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
