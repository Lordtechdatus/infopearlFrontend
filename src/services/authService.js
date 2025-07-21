import axios from 'axios';

// Set the base URL for API requests - adjust this based on your backend
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to set the authentication token in local storage and axios headers
const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Check for token when service is loaded
const token = localStorage.getItem('token');
if (token) {
  setAuthToken(token);
}

const authService = {
  // Login and get token
  login: async (username, password, rememberMe) => {
    try {
      // For demo purposes, we'll mock the authentication
      // In a real app, you would call your backend API
      
      // Remove any whitespace from username and password
      const trimmedUsername = username.trim().toLowerCase();
      const trimmedPassword = password.trim();
      
      // Admin login for main admin dashboard
      if (trimmedUsername === 'admin' && trimmedPassword === 'shodhyantri@123') {
        const mockUser = {
          id: 1,
          username: 'admin',
          name: 'Administrator',
          role: 'admin'
        };
        
        const mockToken = 'mock-jwt-token';
        
        // Store token and user info
        setAuthToken(mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
        
        // Also set adminAuthenticated for compatibility with existing code
        sessionStorage.setItem('adminAuthenticated', 'true');
        
        return {
          success: true,
          user: mockUser,
          token: mockToken
        };
      }
      
      return {
        success: false,
        message: 'Invalid username or password'
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  },

  // Logout user
  logout: async () => {
    // Remove token and user info
    setAuthToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Also remove adminAuthenticated from sessionStorage for compatibility
    sessionStorage.removeItem('adminAuthenticated');
    
    // In a real app, you might want to notify the backend
    // await axios.post(`${API_URL}/auth/logout`);
    
    return { success: true };
  },

  // Get current user information
  getCurrentUser: async () => {
    try {
      // Check localStorage for user info
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        // Check sessionStorage for adminAuthenticated as a fallback
        const isAdminAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
        if (isAdminAuthenticated) {
          return {
            id: 1,
            username: 'admin',
            name: 'Administrator',
            role: 'admin'
          };
        }
        return null;
      }
      
      try {
        const user = JSON.parse(userStr);
        return user;
      } catch (e) {
        console.error('Error parsing user data:', e);
        return null;
      }
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return localStorage.getItem('token') !== null || 
           sessionStorage.getItem('adminAuthenticated') === 'true';
  },

  // Register a new user (for future implementation)
  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }
};

export default authService; 