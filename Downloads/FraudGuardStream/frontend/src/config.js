/*
 * Instagram Clone - Configuration
 * Cloned by Phumeh
 */

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const config = {
  API_URL: process.env.REACT_APP_API_URL || (isLocalhost ? 'http://localhost:5000/api' : '/api')
};

export default config;
