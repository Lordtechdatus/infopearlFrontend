// This file contains the editable content of the website
// The admin panel will modify this data

// Navigation data
export const navData = {
  logo: "/logo1.png",
  logoText: "InfoPearl",
  email: "infopearl396@gmail.com",
  phone: "+91 70009 37390",
  menuItems: [
    { id: 1, text: "Home", path: "/", dropdown: false },
    { 
      id: 2, 
      text: "About", 
      path: "#", 
      dropdown: true,
      dropdownItems: [
        { id: 21, text: "About Us", path: "/about" },
        { id: 22, text: "Team Members", path: "/team-members" }
      ]
    },
    { 
      id: 3, 
      text: "Services", 
      path: "/services", 
      dropdown: true,
      megaMenu: true,
      categories: [
        {
          id: 31,
          title: "WEBSITES",
          items: [
            { id: 311, text: "Website Designing" },
            { id: 312, text: "Website Development" }
          ]
        },
        {
          id: 32,
          title: "MOBILE APPLICATION",
          items: [
            { id: 321, text: "App Designing & Development" }
          ]
        },
        {
          id: 33,
          title: "DIGITAL MARKETING",
          items: [
            { id: 331, text: "Digital Marketing Package" },
            { id: 332, text: "Search Engine Optimization" },
            { id: 333, text: "Social Media Marketing" },
            { id: 334, text: "Affiliate Marketing" },
            { id: 335, text: "SMS Marketing" },
            { id: 336, text: "Email Marketing" }
          ]
        },
        {
          id: 34,
          title: "GRAPHICS DESIGN",
          items: [
            { id: 341, text: "Logo Designing" },
            { id: 342, text: "Company Branding" },
            { id: 343, text: "Business PDF" },
            { id: 344, text: "Business Poster / Banner" },
            { id: 345, text: "Business Booklet"}
          ]
        }
      ]
    },
    { id: 4, text: "Expertise", path: "/expertise", dropdown: false },
    { id: 5, text: "Training", path: "/training-topics", dropdown: false },
    { 
      id: 6, 
      text: "PAY NOW", 
      path: "/payment", 
      dropdown: false,
      isButton: false,
      dropdownItems: [
        { id: 61, text: "UPI", path: "/upi" },
        { id: 62, text: "Payment", path: "/payment" }
      ]
    },
    { id: 7, text: "Contact", path: "/contact", dropdown: false, isButton: true },
    { id: 8, text: "Career", path: "/career", dropdown: false, isButton: true }
  ]
};

// Homepage data
export const homeData = {
  hero: {
    title: "InfoPearl Tech Solutions",
    subtitle: "Empowering Scholars, Advancing Research",
    buttonPrimary: {
      text: "Contact Us",
      link: "/contact"
    },
    buttonSecondary: {
      text: "Our Services",
      link: "/services"
    },
    backgroundImage: "heroBg" // Reference to the imported asset
  },
  
  about: {
    title: "InfoPearl Tech solutions pvt ltd",
    subtitle: "Innovations in Technology",
    description: [
      "InfoPearl Tech Solutions Pvt. Ltd. is a leading company dedicated to providing comprehensive support to PhD scholars and academic researchers as well as It solutions(web design,web development,software development,data analysis,etc). Our primary focus is to offer expert guidance in research, PhD admissions, conference organization, and data analysis, technical training & internships, simulation work and training.",
      "Founded with the vision of bridging the gap between academia and industry, we are committed to empowering scholars to achieve academic excellence and advance their research careers."
    ],
    image: "../assets/about.png"
  },
  
  services: {
    title: "Our Services",
    subtitle: "Comprehensive academic support tailored to your needs",
    items: [
      {
        id: 1,
        icon: "fas fa-book",
        title: "PhD Research Guidance",
        description: "Comprehensive support in formulating research proposals, selecting methodologies, and analyzing data.",
        link: "/services"
      },
      {
        id: 2,
        icon: "fas fa-users",
        title: "Training and Internships",
        description: "Topic-based training programs and educational seminars tailored for researchers, students, and academic institutions.",
        link: "/training"
      },
      {
        id: 3,
        icon: "fas fa-graduation-cap",
        title: "IT Solutions",
        description: "Web design, web development, software development, data analysis,SEO,content writing,etc.",
        link: "/services"
      },
      {
        id: 4,
        icon: "fas fa-chart-line",
        title: "Data Analysis & Simulation",
        description: "Expert services in data management, statistical analysis, modeling, and simulations.",
        link: "/services"
      },
      {
        id: 5,
        icon: "fas fa-code",
        title: "Web Development",
        description: "Expert services in creating modern, responsive websites and web applications. We deliver custom solutions tailored to your business needs with beautiful designs and powerful functionality.",
        link: "/services"
      },
      {
        id: 6,
        icon: "fas fa-file-alt",
        title: "Thesis Writing",
        description: "Professional thesis writing assistance with comprehensive research, structured formatting, and expert academic guidance.",
        link: "/services"
      }
    ]
  },
  
  whyChooseUs: {
    title: "Why Choose Us",
    subtitle: "Excellence in Academic Support Services",
    features: [
      {
        id: 1,
        icon: "fas fa-users",
        title: "Experienced Team",
        description: "Our team consists of highly qualified professionals with a deep understanding of research methodologies, data analysis, and academic publishing."
      },
      {
        id: 2,
        icon: "fas fa-globe",
        title: "Global Reach",
        description: "We work with scholars from all over the world, offering insights into international academic systems and research standards."
      },
      {
        id: 3,
        icon: "fas fa-cogs",
        title: "Tailored Services",
        description: "We understand that each research project is unique, so we customize our solutions to meet the specific needs of each scholar."
      },
      {
        id: 4,
        icon: "fas fa-award",
        title: "Commitment to Excellence",
        description: "We ensure the highest quality of service, aiming to exceed client expectations every time."
      },
      {
        id: 5,
        icon: "fas fa-flask",
        title: "Research Methodology",
        description: "Our team has expertise in choosing appropriate research methods, including quantitative and qualitative techniques. We guide scholars in developing robust methodologies that ensure research validity and reliability."
      }
    ]
  },
  
  // Add more sections as needed
};

// Footer data
export const footerData = {
  companyName: "InfoPearl Tech Solutions",
  description: "InfoPearl Technology is your one-stop destination for expert IT consulting and services, on-site/off-site software, web, mobile app development and more.",
  address: "InfoPearl Technology" ,
  email: "infopearl396@gmail.com",
  phone: "+91 70009 37390",
  socialLinks: [,
    { icon: "fab fa-facebook-f", url: "https://facebook.com/infopearltechsolutions" },
    { icon: "fab fa-twitter", url: "https://twitter.com/infopearl" },
    { icon: "fab fa-linkedin-in", url: "https://linkedin.com/company/infopearltechsolutions" },
    { icon: "fab fa-instagram", url: "https://instagram.com/infopearl" }
  ],
  quickLinks: [
    { text: "Home", path: "/" },
    { text: "About Us", path: "/about" },
    { text: "Services", path: "/services" },
    { text: "Expertise", path: "/expertise" },
    { text: "Contact", path: "/contact" },
    { text: "Career", path: "/career" }
  ],
  services: [
    { text: "PhD Research Guidance", path: "/services" },
    { text: "Data Analysis", path: "/services" },
    { text: "Web Development", path: "/services" },
    { text: "Training & Workshops", path: "/training-topics" },
    { text: "Software Development", path: "/services" }
  ],
  copyrightText: "InfoPearl Technologies LLP. All rights reserved.",
  bottomLinks: [
    { text: "Privacy Policy", path: "/privacy-policy" },
    { text: "Terms of Service", path: "/terms-of-service" }
  ]
};

// Function to save updated data to localStorage
export const saveWebsiteData = (dataType, newData) => {
  let currentData = {};
  
  // Load existing data
  try {
    const savedData = localStorage.getItem('websiteData');
    currentData = savedData ? JSON.parse(savedData) : {};
  } catch (error) {
    console.error('Error loading website data:', error);
    currentData = {};
  }
  
  // Update the specific section
  currentData[dataType] = newData;
  
  // Save updated data
  try {
    localStorage.setItem('websiteData', JSON.stringify(currentData));
    return true;
  } catch (error) {
    console.error('Error saving website data:', error);
    return false;
  }
};

// Function to get the latest data (from localStorage if available, or default)
export const getWebsiteData = (dataType) => {
  try {
    const savedData = localStorage.getItem('websiteData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      if (parsedData && parsedData[dataType]) {
        return parsedData[dataType];
      }
    }
  } catch (error) {
    console.error('Error retrieving website data:', error);
  }
  
  // Return default data if no saved data or an error occurred
  switch(dataType) {
    case 'navData':
      return navData;
    case 'homeData':
      return homeData;
    case 'footerData':
      return footerData;
    default:
      return null;
  }
}; 