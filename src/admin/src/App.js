import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Sidebar from './components/layout/Sidebar';

// Auth Components
import Login from './components/auth/Login';
import PrivateRoute from './components/auth/PrivateRoute';

// Dashboard
import Dashboard from './components/Dashboard';

// Customer Components
import { CustomerList, CustomerAdd, CustomerEdit } from './components/customers';

//Employee Components
import AdminList from '../employee/list';
import AdminPage from '../employee/Createpage';

// Invoice Components
import InvoiceCreate from './components/invoices/InvoiceCreate';
import { InvoiceList, InvoiceDownload, InvoiceEdit, InvoiceView } from './components/invoices/placeholder';

// Salary Slip Component
import SalarySlip from './components/salaryslip/SalarySlip';
import ManageSalary from './components/salaryslip/ManageSalary';

// User Components
import { UserList, UserAdd } from './components/users';

function App() {
  // Add listener for the custom download-csv event
  React.useEffect(() => {
    const handleDownloadCsv = () => {
      // Get the InvoiceDownload component to show success message
      const downloadEvent = new CustomEvent('trigger-download-csv');
      document.dispatchEvent(downloadEvent);
    };

    document.addEventListener('download-csv', handleDownloadCsv);
    return () => {
      document.removeEventListener('download-csv', handleDownloadCsv);
    };
  }, []);

  return (
    <Router>
      <div className="App">
        <Header />
        <div style={{ display: 'flex' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="*"
              element={
                <PrivateRoute>
                  <div style={{ display: 'flex', width: '100%' }}>
                    <Sidebar />
                    <Container fluid className="mt-4 mb-4">
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        
                        {/* Customer Routes */}
                        <Route path="/customers" element={<Navigate to="/customers/list" replace />} />
                        <Route path="/customers/list" element={<CustomerList />} />
                        <Route path="/customers/add" element={<CustomerAdd />} />
                        <Route path="/customers/edit/:id" element={<CustomerEdit />} />

                        {/* Employer Routes */}
                        <Route path="/employee" element={<AdminList />} />
                        <Route path="/employee/create" element={<AdminPage />} />
                        
                        {/* Invoice Routes */}
                        <Route path="/invoices" element={<InvoiceList />} />
                        <Route path="/invoices/create" element={<InvoiceCreate />} />
                        <Route path="/invoices/download" element={<InvoiceDownload />} />
                        <Route path="/invoices/edit/:id" element={<InvoiceEdit />} />
                        <Route path="/invoices/view/:id" element={<InvoiceView />} />
                        
                        {/* Salary Slip Routes */}
                        <Route path="/salaryslip" element={<ManageSalary />} />
                        <Route path="/salaryslip/create" element={<SalarySlip />} />
                        
                        {/* User Routes */}
                        <Route path="/users" element={<Navigate to="/users/list" replace />} />
                        <Route path="/users/list" element={<UserList />} />
                        <Route path="/users/add" element={<UserAdd />} />
                        
                        {/* Redirect any unknown routes to Dashboard */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </Container>
                  </div>
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
