import React, { useState } from 'react';
import { Nav, Collapse } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const [invoicesOpen, setInvoicesOpen] = useState(location.pathname.includes('/invoices'));
  const [customersOpen, setCustomersOpen] = useState(location.pathname.includes('/customers'));
  const [usersOpen, setUsersOpen] = useState(location.pathname.includes('/users'));
  const [salarySlipOpen, setSalarySlipOpen] = useState(location.pathname.includes('/salaryslip'));
  
  // Function to handle CSV download from sidebar
  const handleDownloadCSV = (e) => {
    e.preventDefault();
    // Dispatch the custom event
    const event = new Event('download-csv');
    document.dispatchEvent(event);
  };
  
  return (
    <div className="sidebar bg-dark text-white" style={{ minHeight: '100vh', width: '200px' }}>
      <div className="sidebar-sticky">
        <Nav className="flex-column">
          <Nav.Link 
            as={Link} 
            to="/" 
            className={`text-white ${location.pathname === '/' ? 'active' : ''}`}
          >
            <i className="bi bi-speedometer2 me-2"></i> Dashboard
          </Nav.Link>
          
          {/* Invoices with submenu */}
          <Nav.Item>
            <Nav.Link
              onClick={() => setInvoicesOpen(!invoicesOpen)}
              className={`text-white ${location.pathname.includes('/invoices') ? 'active' : ''}`}
              style={{ cursor: 'pointer' }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <span>
                  <i className="bi bi-file-text me-2"></i> Invoices
                </span>
                <i className={`bi bi-chevron-${invoicesOpen ? 'down' : 'right'} small`}></i>
              </div>
            </Nav.Link>
            
            <Collapse in={invoicesOpen}>
              <div>
                <Nav className="flex-column">
                  <Nav.Link
                    as={Link}
                    to="/invoices/create"
                    className={`text-white ms-3 ${location.pathname === '/invoices/create' ? 'active bg-secondary' : ''}`}
                  >
                    <i className="bi bi-plus-circle me-2"></i> Create Invoice
                  </Nav.Link>
                  
                  <Nav.Link
                    as={Link}
                    to="/invoices"
                    className={`text-white ms-3 ${location.pathname === '/invoices' && !location.pathname.includes('/create') && !location.pathname.includes('/download') ? 'active bg-secondary' : ''}`}
                  >
                    <i className="bi bi-list me-2"></i> Manage Invoices
                  </Nav.Link>
                  
                  <Nav.Link
                    as={Link}
                    to="/invoices/download"
                    className={`text-white ms-3 ${location.pathname === '/invoices/download' ? 'active bg-secondary' : ''}`}
                    onClick={(e) => {
                      // This will navigate to the download page but also let the user visit the page
                      if (location.pathname === '/invoices/download') {
                        e.preventDefault();
                        handleDownloadCSV(e);
                      }
                    }}
                  >
                    <i className="bi bi-download me-2"></i> Download CSV
                  </Nav.Link>
                </Nav>
              </div>
            </Collapse>
          </Nav.Item>
          
          {/* Salary Slip with submenu */}
          <Nav.Item>
            <Nav.Link
              onClick={() => setSalarySlipOpen(!salarySlipOpen)}
              className={`text-white ${location.pathname.includes('/salaryslip') ? 'active' : ''}`}
              style={{ cursor: 'pointer' }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <span>
                  <i className="bi bi-cash-stack me-2"></i> Salary Slips
                </span>
                <i className={`bi bi-chevron-${salarySlipOpen ? 'down' : 'right'} small`}></i>
              </div>
            </Nav.Link>
            
            <Collapse in={salarySlipOpen}>
              <div>
                <Nav className="flex-column">
                  <Nav.Link
                    as={Link}
                    to="/salaryslip/create"
                    className={`text-white ms-3 ${location.pathname === '/salaryslip/create' ? 'active bg-secondary' : ''}`}
                  >
                    <i className="bi bi-plus-circle me-2"></i> Create Salary Slip
                  </Nav.Link>
                  
                  <Nav.Link
                    as={Link}
                    to="/salaryslip"
                    className={`text-white ms-3 ${location.pathname === '/salaryslip' && !location.pathname.includes('/create') ? 'active bg-secondary' : ''}`}
                  >
                    <i className="bi bi-list me-2"></i> Manage Salary Slips
                  </Nav.Link>
                </Nav>
              </div>
            </Collapse>
          </Nav.Item>
          
          {/* Customers with submenu */}
          <Nav.Item>
            <Nav.Link
              onClick={() => setCustomersOpen(!customersOpen)}
              className={`text-white ${location.pathname.includes('/customers') ? 'active' : ''}`}
              style={{ cursor: 'pointer' }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <span>
                  <i className="bi bi-people me-2"></i> Customers
                </span>
                <i className={`bi bi-chevron-${customersOpen ? 'down' : 'right'} small`}></i>
              </div>
            </Nav.Link>
            
            <Collapse in={customersOpen}>
              <div>
                <Nav className="flex-column">
                  <Nav.Link
                    as={Link}
                    to="/customers/list"
                    className={`text-white ms-3 ${location.pathname === '/customers/list' || location.pathname === '/customers' ? 'active bg-secondary' : ''}`}
                  >
                    <i className="bi bi-list me-2"></i> Customer List
                  </Nav.Link>
                  
                  <Nav.Link
                    as={Link}
                    to="/customers/add"
                    className={`text-white ms-3 ${location.pathname === '/customers/add' ? 'active bg-secondary' : ''}`}
                  >
                    <i className="bi bi-plus-circle me-2"></i> Add Customer
                  </Nav.Link>
                </Nav>
              </div>
            </Collapse>
          </Nav.Item>
          
          {/* System Users with submenu */}
          <Nav.Item>
            <Nav.Link
              onClick={() => setUsersOpen(!usersOpen)}
              className={`text-white ${location.pathname.includes('/users') ? 'active' : ''}`}
              style={{ cursor: 'pointer' }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <span>
                  <i className="bi bi-person-badge me-2"></i> System Users
                </span>
                <i className={`bi bi-chevron-${usersOpen ? 'down' : 'right'} small`}></i>
              </div>
            </Nav.Link>
            
            <Collapse in={usersOpen}>
              <div>
                <Nav className="flex-column">
                  <Nav.Link
                    as={Link}
                    to="/users/list"
                    className={`text-white ms-3 ${location.pathname === '/users/list' || location.pathname === '/users' ? 'active bg-secondary' : ''}`}
                  >
                    <i className="bi bi-list me-2"></i> User List
                  </Nav.Link>
                  
                  <Nav.Link
                    as={Link}
                    to="/users/add"
                    className={`text-white ms-3 ${location.pathname === '/users/add' ? 'active bg-secondary' : ''}`}
                  >
                    <i className="bi bi-plus-circle me-2"></i> Add User
                  </Nav.Link>
                </Nav>
              </div>
            </Collapse>
          </Nav.Item>
        </Nav>
      </div>
    </div>
  );
};

export default Sidebar; 