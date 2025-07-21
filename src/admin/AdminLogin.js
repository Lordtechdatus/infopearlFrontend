import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './adminDashboard.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Fixed admin credentials
  const ADMIN_USERNAME = "admin";
  const ADMIN_PASSWORD = "infopearl@123";

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Store authentication in session storage
      sessionStorage.setItem('adminAuthenticated', 'true');
      
      // Navigate to dashboard
      navigate('/admin');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-form">
        <div className="login-header">
          <h2>Admin Login</h2>
          <img src="/logo1.png" alt="Company Logo" className="login-logo" />
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group password-field">
            <label htmlFor="password">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <i className="fas fa-eye-slash"></i>
              ) : (
                <i className="fas fa-eye"></i>
              )}
            </button>
          </div>
          
          <button type="submit" className="login-button">Login</button>
        </form>
        
        <div className="back-to-site">
          <a href="/">← Back to Website</a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 