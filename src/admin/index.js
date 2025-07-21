// Main entry point for admin components
import AdminDashboard from './adminDashboard';

// Customer Management
import CustomerList from './customers/CustomerList';
import CustomerAdd from './customers/CustomerAdd';
import CustomerEdit from './customers/CustomerEdit';

// Invoice Management - now from ContentManagement
import InvoiceList from './ContentManagement/InvoiceList';
import InvoiceCreate from './ContentManagement/InvoiceCreate';
import InvoiceDownload from './ContentManagement/InvoiceDownload';

// Salary Management
import ManageSalary from './salaryslip/ManageSalary';
import SalarySlip from './salaryslip/createSalarySlip';

// User Management
import UserList from './users/UserList';
import UserAdd from './users/UserAdd';

// Content Management
import HeaderSettings from './ContentManagement/HeaderSettings';
import LogoSettings from './ContentManagement/LogoSettings';
import FooterSettings from './ContentManagement/FooterSettings';

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
  HeaderSettings,
  LogoSettings,
  FooterSettings
}; 