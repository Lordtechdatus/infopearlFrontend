import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LogoImage from '../assets/logo1.png'; // Import the logo
import './LoginPage.css'; // We'll create this CSS file next

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the path the user was trying to access, or default to /admin
  const from = location.state?.from?.pathname || '/admin';

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    const loggedIn = login(username, password);
    if (loggedIn) {
      // Redirect to the intended page after successful login
      navigate(from, { replace: true }); 
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <div className="login-logo"> {/* Container for logo */}
          <img src={LogoImage} alt="InfoPearl Tech Logo" />
        </div>
        <h2>Admin Login</h2>
        {error && <p className="error-message">{error}</p>}
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
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button">Login</button>
        <div className="back-link-container">
          <Link to="/" className="back-link">
            &larr; Back to Website 
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage; 