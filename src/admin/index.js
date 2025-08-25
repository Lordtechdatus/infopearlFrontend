// Main entry point for admin components
import AdminDashboard from './adminDashboard.js';

// Customer Management
import CustomerList from './customers/CustomerList.js';
import CustomerAdd from './customers/CustomerAdd.js';
import CustomerEdit from './customers/CustomerEdit.js';

// Invoice Management - now from ContentManagement
import InvoiceList from './ContentManagement/InvoiceList.js';
import InvoiceCreate from './ContentManagement/InvoiceCreate.js';
import InvoiceDownload from './ContentManagement/InvoiceDownload.js';

// Salary Management
import ManageSalary from './salaryslip/ManageSalary.js';
import SalarySlip from './salaryslip/createSalarySlip.js';

// User Management
import UserList from './users/UserList.js';
import UserAdd from './users/UserAdd.js';

// Content Management
// import HeaderSettings from './ContentManagement/HeaderSettings';
import LogoSettings from './ContentManagement/LogoSettings.js';
// import FooterSettings from './ContentManagement/FooterSettings';

export {
  // Dashboard
  AdminDashboard,
  
  // Customer Management
  CustomerList,
  CustomerAdd,
  CustomerEdit,
  
  // Invoice Management
  InvoiceList,
  InvoiceCreate,
  InvoiceDownload,
  
  // Salary Management
  ManageSalary,
  SalarySlip,
  
  // User Management
  UserList,
  UserAdd,
  
  // Content Management
  // HeaderSettings,
  LogoSettings,
  // FooterSettings
}; 