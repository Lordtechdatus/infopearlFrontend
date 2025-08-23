import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Nav, Collapse } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './adminDashboard.css';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [openSubMenu, setOpenSubMenu] = useState('');

  // Check if a path is active or its children are active
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  // Toggle submenu visibility
  const toggleSubMenu = (menu) => {
    setOpenSubMenu(openSubMenu === menu ? '' : menu);
  };

  // Check authentication on component mount
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
    
    // If not authenticated, redirect to login page
    if (!isAuthenticated) {
      navigate('/admin/login');
    }

    // Set the initial open submenu based on the current path
    if (location.pathname.includes('/admin/customers')) {
      setOpenSubMenu('customers');
    } else if (location.pathname.includes('/admin/salary')) {
      setOpenSubMenu('salary');
    } else if (location.pathname.includes('/admin/users')) {
      setOpenSubMenu('users');
    } else if (location.pathname.includes('/admin/invoices')) {
      setOpenSubMenu('invoices');
    }
  }, [navigate, location.pathname]);

  const handleLogout = () => {
    logout();
    sessionStorage.removeItem('adminAuthenticated');
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      <div className="sidebar">
        <div className="sidebar-header">
          <h3>InfoPearl Admin</h3>
        </div>
        <Nav className="flex-column">
          <Nav.Link as={Link} to="/admin/dashboard" className={isActive('/admin/dashboard') ? 'active' : ''}>
            <i className="fas fa-speedometer-alt"></i> Dashboard
          </Nav.Link>
          
          <div className="sidebar-section">Content Management</div>
          {/* <Nav.Link as={Link} to="/admin/header" className={isActive('/admin/header') ? 'active' : ''}>
            <i className="fas fa-envelope"></i> Header
          </Nav.Link>
          <Nav.Link as={Link} to="/admin/footer" className={isActive('/admin/footer') ? 'active' : ''}>
            <i className="fas fa-address-card"></i> Footer
          </Nav.Link> */}
          <Nav.Link as={Link} to="/admin/logo" className={isActive('/admin/logo') ? 'active' : ''}>
            <i className="fas fa-image"></i> Logo
          </Nav.Link>
          <Nav.Link as={Link} to="/admin/gallery" className={isActive('/admin/gallery') ? 'active' : ''}>
            <i className="fas fa-images"></i> Gallery
          </Nav.Link>
          
          <div className="sidebar-section">Communication</div>
          <Nav.Link as={Link} to="/admin/contact-messages" className={isActive('/admin/contact-messages') ? 'active' : ''}>
            <i className="fas fa-envelope-open"></i> Contact Messages
          </Nav.Link>
          
          <div className="sidebar-section"> Management</div>
          
          {/* Customers dropdown */}
          <div className={`nav-item-with-submenu ${openSubMenu === 'customers' ? 'open' : ''}`}>
            <div 
              className={`nav-link ${isActive('/admin/customers') ? 'active' : ''}`} 
              onClick={() => toggleSubMenu('customers')}
            >
              <i className="fas fa-users"></i> Customers
              <i className={`fas fa-chevron-${openSubMenu === 'customers' ? 'down' : 'right'} submenu-icon`}></i>
            </div>
            <Collapse in={openSubMenu === 'customers'}>
              <div className="submenu">
                <Nav.Link as={Link} to="/admin/customers" className={location.pathname === '/admin/customers' ? 'active' : ''}>
                  <i className="fas fa-list"></i> Customer List
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/customers/add" className={location.pathname === '/admin/customers/add' ? 'active' : ''}>
                  <i className="fas fa-plus"></i> Add Customer
                </Nav.Link>
              </div>
            </Collapse>
          </div>

          {/* Employer Section */}
          <div className={`nav-item-with-submenu ${openSubMenu === 'employee' ? 'open' : ''}`}>
            <div 
              className={`nav-link ${isActive('/admin/employee') ? 'active' : ''}`} 
              onClick={() => toggleSubMenu('employee')}
            >
              <i className="fas fa-file-invoice-dollar"></i> Employee
              <i className={`fas fa-chevron-${openSubMenu === 'employee' ? 'down' : 'right'} submenu-icon`}></i>
            </div>
            <Collapse in={openSubMenu === 'employee'}>
              <div className="submenu">
                <Nav.Link as={Link} to="/admin/employee" className={location.pathname === '/admin/employee' ? 'active' : ''}>
                  <i className="fas fa-list"></i> List
                </Nav.Link>
                <Nav.Link as={Link} to="./employee/createpage" className={location.pathname === '/admin/employee/createpage' ? 'active' : ''}>
                  <i className="fas fa-plus"></i> Create
                </Nav.Link>
                {/* <Nav.Link as={Link} to="/admin/invoices/download" className={location.pathname === '/admin/invoices/download' ? 'active' : ''}>
                  <i className="fas fa-download"></i> Download Invoices
                </Nav.Link> */}
              </div>
            </Collapse>
          </div>
          
          {/* Invoices dropdown */}
          {/* <div className={`nav-item-with-submenu ${openSubMenu === 'invoices' ? 'open' : ''}`}>
            <div 
              className={`nav-link ${isActive('/admin/invoices') ? 'active' : ''}`} 
              onClick={() => toggleSubMenu('invoices')}
            >
              <i className="fas fa-file-invoice-dollar"></i> Invoices
              <i className={`fas fa-chevron-${openSubMenu === 'invoices' ? 'down' : 'right'} submenu-icon`}></i>
            </div>
            <Collapse in={openSubMenu === 'invoices'}>
              <div className="submenu">
                <Nav.Link as={Link} to="/admin/invoices" className={location.pathname === '/admin/invoices' ? 'active' : ''}>
                  <i className="fas fa-list"></i> Invoice List
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/invoices/create" className={location.pathname === '/admin/invoices/create' ? 'active' : ''}>
                  <i className="fas fa-plus"></i> Create Invoice
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/invoices/download" className={location.pathname === '/admin/invoices/download' ? 'active' : ''}>
                  <i className="fas fa-download"></i> Download Invoices
                </Nav.Link>
              </div>
            </Collapse>
          </div>
           */}
          {/* Salary dropdown */}
          {/* <div className={`nav-item-with-submenu ${openSubMenu === 'salary' ? 'open' : ''}`}>
            <div 
              className={`nav-link ${isActive('/admin/salary') ? 'active' : ''}`} 
              onClick={() => toggleSubMenu('salary')}
            >
              <i className="fas fa-money-check-alt"></i> Salary
              <i className={`fas fa-chevron-${openSubMenu === 'salary' ? 'down' : 'right'} submenu-icon`}></i>
            </div>
            <Collapse in={openSubMenu === 'salary'}>
              <div className="submenu">
                <Nav.Link as={Link} to="/admin/salary" className={location.pathname === '/admin/salary' ? 'active' : ''}>
                  <i className="fas fa-list"></i> Salary List
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/salary/slip" className={location.pathname === '/admin/salary/slip' ? 'active' : ''}>
                  <i className="fas fa-file-alt"></i> Create Salary Slip
                </Nav.Link>
              </div>
            </Collapse>
          </div> */}
          
          {/* Users dropdown */}
          <div className={`nav-item-with-submenu ${openSubMenu === 'users' ? 'open' : ''}`}>
            <div 
              className={`nav-link ${isActive('/admin/users') ? 'active' : ''}`} 
              onClick={() => toggleSubMenu('users')}
            >
              <i className="fas fa-user-shield"></i> Users
              <i className={`fas fa-chevron-${openSubMenu === 'users' ? 'down' : 'right'} submenu-icon`}></i>
            </div>
            <Collapse in={openSubMenu === 'users'}>
              <div className="submenu">
                <Nav.Link as={Link} to="/admin/users" className={location.pathname === '/admin/users' ? 'active' : ''}>
                  <i className="fas fa-list"></i> User List
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/users/add" className={location.pathname === '/admin/users/add' ? 'active' : ''}>
                  <i className="fas fa-user-plus"></i> Add User
                </Nav.Link>
              </div>
            </Collapse>
          </div>

          {/* Letters dropdown */}
          {/* <div className={`nav-item-with-submenu ${openSubMenu === 'letters' ? 'open' : ''}`}>
            <div 
              className={`nav-link ${isActive('/admin/letters') ? 'active' : ''}`} 
              onClick={() => toggleSubMenu('letters')}
            >
              <i className="fas fa-envelope"></i> Letters
              <i className={`fas fa-chevron-${openSubMenu === 'letters' ? 'down' : 'right'} submenu-icon`}></i>
            </div>
            <Collapse in={openSubMenu === 'letters'}>
              <div className="submenu">
                {/* <Nav.Link as={Link} to="/admin/letters" className={location.pathname === '/admin/letters' ? 'active' : ''}>
                  <i className="fas fa-list"></i> Letter List
                </Nav.Link> */}
                {/* <Nav.Link as={Link} to="/admin/letters/create" className={location.pathname === '/admin/letters/create' ? 'active' : ''}>
                  <i className="fas fa-plus"></i> Create Letter
                </Nav.Link>
                <Nav.Link as={Link} to="/admin/letters/download" className={location.pathname === '/admin/letters/download' ? 'active' : ''}>
                  <i className="fas fa-download"></i> Download Letters
                </Nav.Link>
              </div>
            </Collapse>
          </div> */} 
        </Nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn btn-outline-light">
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>
      
      <div className="content">
        <div className="top-bar">
          <div className="user-info">
            <i className="fas fa-user-circle"></i>
            <span>Admin</span>
          </div>
        </div>
        <Container fluid className="main-content">
          <Outlet />
        </Container>
      </div>
    </div>
  );
};

export default AdminLayout; 