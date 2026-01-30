/*
 * Instagram Clone - Enhanced Login Component
 * Cloned by Phumeh
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import config from '../config';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    identifier: '', // Can be email, phone, or username
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${config.API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(data.user, data.token);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      // Demo mode fallback when backend is unavailable
      const demoUser = {
        id: 'demo-user-1',
        username: formData.identifier || 'demo_user',
        email: 'demo@phumeh.com',
        fullName: 'Demo User',
        profilePicture: 'https://picsum.photos/150/150?random=1',
        bio: 'Demo account - Created by Phumeh',
        isVerified: true,
        followers: 1234,
        following: 567
      };
      const demoToken = 'demo-token-' + Date.now();
      onLogin(demoUser, demoToken);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h1>Instagram</h1>
        <p className="auth-subtitle">by Phumeh</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="identifier"
            placeholder="Phone number, username, or email"
            value={formData.identifier}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
          />
          
          {error && <p className="error">{error}</p>}
          
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <button className="facebook-login" disabled={loading}>
          <span>📘</span> Log in with Facebook
        </button>

        <Link to="/forgot-password" className="forgot-password">
          Forgot password?
        </Link>

        <div className="auth-switch">
          Don't have an account? <Link to="/register">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;