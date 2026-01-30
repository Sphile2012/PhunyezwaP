/*
 * Instagram Clone Frontend - Full Backend Integration
 * Cloned by Phumeh
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MobileInstagram from './components/MobileInstagram';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import Search from './components/Search';
import Messages from './components/Messages';
import Notifications from './components/Notifications';
import config from './config';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token) {
      // Check for demo token - restore from localStorage
      if (token.startsWith('demo-token-') && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`${config.API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        // If backend unavailable but we have stored user, use demo mode
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    }
    setLoading(false);
  };

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${config.API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Instagram Clone by Phumeh</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <div className="phumeh-brand">Cloned by Phumeh</div>
        <Routes>
          <Route 
            path="/login" 
            element={!user ? <Login onLogin={login} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/register" 
            element={!user ? <Register onLogin={login} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/" 
            element={user ? <MobileInstagram user={user} onLogout={logout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/search" 
            element={user ? <Search user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/messages" 
            element={user ? <Messages user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/notifications" 
            element={user ? <Notifications user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/profile/:username" 
            element={user ? <Profile user={user} /> : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
