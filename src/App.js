import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';


// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
// import StickyMessage from './components/StickyMessage';  // <-- Imported StickyMessage

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Expertise from './pages/Expertise';
import Contact from './pages/Contact';
import TrainingTopics from './pages/TrainingTopics';
import TeamMembers from './pages/TeamMembers';
import UPI from './pages/UPI';
import Payment from './pages/Payment';
import LoginPage from './pages/LoginPage';
import Careerpage from './pages/Careerpage';

// Admin Components & Pages
import AdminLayout from './admin/AdminLayout';
import HeaderSettings from './admin/ContentManagement/HeaderSettings';
import FooterSettings from './admin/ContentManagement/FooterSettings';
import GallerySettings from './admin/ContentManagement/GallerySettings';
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

// Helper Components
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            <>
              <Navbar />
              <Home />
              <Footer />
            </>
          } />
          <Route path="/about" element={
            <>
              <Navbar />
              <About />
              <Footer />
            </>
          } />
          <Route path="/team-members" element={
            <>
              <Navbar />
              <TeamMembers />
              <Footer />
            </>
          } />
          <Route path="/services" element={
            <>
              <Navbar />
              <Services />
              <Footer />
            </>
          } />
          <Route path="/expertise" element={
            <>
              <Navbar />
              <Expertise />
              <Footer />
            </>
          } />
          <Route path="/contact" element={
            <>
              <Navbar />
              <Contact />
              <Footer />
            </>
          } />
          <Route path="/training-topics" element={
            <>
              <Navbar />
              <TrainingTopics />
              <Footer />
            </>
          } />
          <Route path="/upi" element={
            <>
              <Navbar />
              <UPI />
              <Footer />
            </>
          } />
          <Route path="/payment" element={
            <>
              <Navbar />
              <Payment />
              <Footer />
            </>
          } />
          <Route path="/career" element={
            <>
              <Navbar />
              <Careerpage />
              <Footer />
            </>
          } />

          {/* Login Page Route */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Routes - Protected */}
          <Route 
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="header" element={<HeaderSettings />} />
            <Route path="footer" element={<FooterSettings />} />
            <Route path="logo" element={<LogoSettings />} />
            <Route path="gallery" element={<GallerySettings />} />
            <Route path="customers" element={<CustomerList />} />
            <Route path="customers/add" element={<CustomerAdd />} />
            <Route path="customers/edit/:id" element={<CustomerEdit />} />
            <Route path="invoices" element={<InvoiceList />} />
            <Route path="invoices/create" element={<InvoiceCreate />} />
            <Route path="invoices/download" element={<InvoiceDownload />} />
            <Route path="salary" element={<ManageSalary />} />
            <Route path="salary/slip" element={<SalarySlip />} />
            <Route path="users" element={<UserList />} />
            <Route path="users/add" element={<UserAdd />} />
          </Route>
        </Routes>

        {/* Sticky running message at bottom */}
        {/* <StickyMessage message="🚀 Welcome! . We are hiring INTERNS for various positions. Apply now!" /> */}
      </div>
    </Router>
  );
}

export default App;
