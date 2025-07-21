import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        setIsAuthenticated(!!user);
        setUser(user);
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Improved login with authService
  const login = async (username, password) => {
    const response = await authService.login(username, password);
    
    if (response.success) {
      setIsAuthenticated(true);
      setUser(response.user);
      return true; 
    }
    
    return false; 
  };

  // Improved logout with authService
  const logout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  // Provide authentication functions and state
  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      login, 
      logout,
      loading
    }}>
      {!loading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
}; 