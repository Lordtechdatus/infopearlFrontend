import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Expertise from './pages/Expertise';
import Contact from './pages/Contact';
import TrainingTopics from './pages/TrainingTopics';
import TeamMembers from './pages/TeamMembers';
// import UPI from './pages/UPI';
import Payment from './pages/Payment';
import LoginPage from './pages/LoginPage';
import Careerpage from './pages/Careerpage';
import './PopModel.css';

// Admin Components & Pages
import AdminLayout from './admin/AdminLayout';
// import HeaderSettings from './admin/ContentManagement/HeaderSettings';
// import FooterSettings from './admin/ContentManagement/FooterSettings';
import GallerySettings from './admin/ContentManagement/GallerySettings';
import AdminPage from './admin/employee/Createpage';
import InvoiceList from './admin/invoices/InvoiceList';
import InvoiceCreate from './admin/invoices/InvoiceCreate';
import InvoiceDownload from './admin/invoices/InvoiceDownload';
import AdminDashboard from './admin/adminDashboard';
import AdminLogin from './admin/AdminLogin';
import CustomerList from './admin/customers/CustomerList';
import CustomerAdd from './admin/customers/CustomerAdd';
import CustomerEdit from './admin/customers/CustomerEdit';
import ManageSalary from './admin/salaryslip/ManageSalary';
import SalarySlip from './admin/salaryslip/createSalarySlip';
import UserList from './admin/users/UserList';
import UserAdd from './admin/users/UserAdd';
import LogoSettings from './admin/ContentManagement/LogoSettings';
import ContactMessages from './admin/ContactMessages';
import LetterCreate from './admin/letters/LetterCreate';
import LetterDownload from './admin/letters/LetterList';

// Helper Components
import ProtectedRoute from './components/ProtectedRoute';
import AdminList from 'admin/employee/list';

const PopupModal = ({ onClose }) => (
  <div
    className="popup-overlay"
    // This will intercept outside clicks and do nothing
    onClick={(e) => e.stopPropagation()}
  >
    <div
      className="popup-content"
      // Prevent overlay clicks when clicking inside modal content
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        className="close-btn"
        style={{ backgroundColor: 'transparent' }}
      >
        <i className="fas fa-times"></i>
      </button>
      <h2>Welcome to InfoPearl!</h2>
      <p>Explore our career opportunities and get in touch with us.</p>
    </div>
  </div>
);


function App() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const hasShownPopup = sessionStorage.getItem('hasShownPopup');

    if (!hasShownPopup) {
      setShowPopup(true);
      sessionStorage.setItem('hasShownPopup', 'true');
    }
  }, []);

  useEffect(() => {
    if (showPopup) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }

    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [showPopup]);

  return (
    <>
      {showPopup && <PopupModal onClose={() => setShowPopup(false)} />}

      <Router>
        <ScrollToTop />
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<><Navbar /><Home /><Footer /></>} />
            <Route path="/about" element={<><Navbar /><About /><Footer /></>} />
            <Route path="/team-members" element={<><Navbar /><TeamMembers /><Footer /></>} />
            <Route path="/services" element={<><Navbar /><Services /><Footer /></>} />
            <Route path="/expertise" element={<><Navbar /><Expertise /><Footer /></>} />
            <Route path="/contact" element={<><Navbar /><Contact /><Footer /></>} />
            <Route path="/training-topics" element={<><Navbar /><TrainingTopics /><Footer /></>} />
            {/* <Route path="/upi" element={<><Navbar /><UPI /><Footer /></>} /> */}
            <Route path="/payment" element={<><Navbar /><Payment /><Footer /></>} />
            <Route path="/career" element={<><Navbar /><Careerpage /><Footer /></>} />

            {/* Login */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin Protected */}
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              {/* <Route path="header" element={<HeaderSettings />} />
              <Route path="footer" element={<FooterSettings />} /> */}
              <Route path="logo" element={<LogoSettings />} />
              <Route path="gallery" element={<GallerySettings />} />
              <Route path="contact-messages" element={<ContactMessages />} />
              <Route path="customers" element={<CustomerList />} />
              <Route path="customers/add" element={<CustomerAdd />} />
              <Route path="customers/edit/:id" element={<CustomerEdit />} />
              <Route path="employee/createpage" element={<AdminPage />} />
              <Route path="employee" element={<AdminList />} />
              <Route path="invoices" element={<InvoiceList />} />
              <Route path="invoices/create" element={<InvoiceCreate />} />
              <Route path="invoices/download" element={<InvoiceDownload />} />
              <Route path="salary" element={<ManageSalary />} />
              <Route path="salary/slip" element={<SalarySlip />} />
              <Route path="users" element={<UserList />} />
              <Route path="users/add" element={<UserAdd />} />
              {/* <Route path="letters" element={<LetterList />} /> */}
              <Route path="letters/create" element={<LetterCreate />} />
              <Route path="letters/download" element={<LetterDownload />} />
            </Route>
          </Routes>

          {/* <StickyMessage message="🚀 We are hiring INTERNS! Apply now." /> */}
        </div>
      </Router>
    </>
  );
}

export default App;
