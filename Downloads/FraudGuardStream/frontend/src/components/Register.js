/*
 * Instagram Clone - Enhanced Register Component
 * Cloned by Phumeh
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import config from '../config';

const Register = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    username: '',
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
      const response = await fetch(`${config.API_URL}/auth/register`, {
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
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      // Demo mode fallback when backend is unavailable
      const demoUser = {
        id: 'demo-user-' + Date.now(),
        username: formData.username || 'new_user',
        email: formData.email,
        fullName: formData.fullName || 'New User',
        profilePicture: 'https://picsum.photos/150/150?random=' + Date.now(),
        bio: 'Welcome to Instagram Clone by Phumeh!',
        isVerified: false,
        followers: 0,
        following: 0
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
        <p className="signup-text">Sign up to see photos and videos from your friends.</p>
        
        <button className="facebook-signup" disabled={loading}>
          <span>📘</span> Sign up with Facebook
        </button>

        <div className="auth-divider">
          <span>OR</span>
        </div>
        
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
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
            minLength="6"
            disabled={loading}
          />
          
          {error && <p className="error">{error}</p>}
          
          <button type="submit" disabled={loading}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <p className="terms-text">
          By signing up, you agree to our Terms, Data Policy and Cookies Policy.
        </p>

        <div className="auth-switch">
          Have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;