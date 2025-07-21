import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated: contextAuth } = useAuth();
  
  // Check authentication using both methods (context and session storage)
  const isAuthenticated = contextAuth || 
                         sessionStorage.getItem('adminAuthenticated') === 'true' ||
                         authService.isAuthenticated();

  if (!isAuthenticated) {
    // Redirect to the admin login page with the intended location stored in state
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute; 