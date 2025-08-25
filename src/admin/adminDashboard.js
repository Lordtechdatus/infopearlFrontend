import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import './adminDashboard.css';
import SEO from '../components/SEO';

// Import management components
// import HeaderSettings from './ContentManagement/HeaderSettings';
import LogoSettings from './ContentManagement/LogoSettings';
// import FooterSettings from './ContentManagement/FooterSettings';
import InvoiceList from './invoices/InvoiceList';

// Import customer, salary, and user management components
import CustomerList from './customers/CustomerList';  
import ManageSalary from './salaryslip/ManageSalary';
import UserList from './users/UserList';

const AdminDashboard = () => {
  const adminInfo = {
    name: "Admin User",
    id: "ADM001"
  };

  // Create dashboard card component for reuse
  const DashboardCard = ({ icon, title, description, href }) => {
    const handleClick = () => {
      if (href) {
        window.location.href = href;
      }
    };
    
    return (
      <div className="card" onClick={handleClick}>
        <i className={`fas ${icon} card-icon`}></i>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    );
  };

  return (
    <div className="home-section">
      <SEO 
        title="Dashboard"
        description="Learn about InfoPearl Tech Solutions - our vision, mission, values, and journey in providing academic research support and innovative IT solutions."
        keywords="about InfoPearl, company history, vision, mission, values, team, academic research, IT solutions"
        canonicalUrl="https://infopearl.in/dashboard"
      />
      <h1>Welcome to Admin Dashboard</h1>
      <div className="mb-4">
        <h5 className="border-bottom pb-2 mb-3">Content Management</h5>
        <div className="cards-container">
          {/* <DashboardCard 
            icon="fa-envelope"
            title="Header Settings"
            description="Update email and phone"
            href="/admin/header"
          /> */}
          <DashboardCard 
            icon="fa-image"
            title="Logo Management"
            description="Change website logo"
            href="/admin/logo"
          />
          {/* <DashboardCard 
            icon="fa-address-card"
            title="Footer Settings"
            description="Update contact information"
            href="/admin/footer"
          /> */}
          <DashboardCard 
            icon="fa-images"
            title="Gallery Management"
            description="Add, edit, or remove gallery images"
            href="/admin/gallery"
          />
        </div>
      </div>

      <div className="mb-4">
        <h5 className="border-bottom pb-2 mb-3">Communication</h5>
        <div className="cards-container">
          <DashboardCard 
            icon="fa-users"
            title="Contact Management"
            description="Manage all your Contacts data in one place"
            href="/admin/contact-messages"
            to="/admin/contact-messages"
          />
        </div>
      </div>
      
      <div className="mb-4">
        <h5 className="border-bottom pb-2 mb-3">Management</h5>
        <div className="cards-container">
          <DashboardCard 
            icon="fa-users"
            title="Customer Management"
            description="Manage all your customer data in one place"
            href="/admin/customers"
          />
           <DashboardCard 
            icon="fa-file-invoice-dollar"
            title="Employees"
            description="Handle customer invoices"
            href="/admin/employee"
          />
          <DashboardCard 
            icon="fa-user-shield"
            title="User Management"
            description="Manage admin users and permissions"
            href="/admin/users"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
