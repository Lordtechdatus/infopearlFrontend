import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app startup
    const checkAuthStatus = async () => {
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Value object that will be provided to consumers
  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    login: async (username, password, rememberMe) => {
      const response = await authService.login(username, password, rememberMe);
      if (response.success) {
        setCurrentUser(response.user);
      }
      return response;
    },
    logout: async () => {
      await authService.logout();
      setCurrentUser(null);
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 