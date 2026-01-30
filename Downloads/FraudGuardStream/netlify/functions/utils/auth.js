/*
 * Instagram Clone - Auth Utility for Netlify Functions
 * Created by Phumeh
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyAuth = async (event) => {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'No token, authorization denied', status: 401 };
  }

  const token = authHeader.replace('Bearer ', '');
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return { error: 'Token is not valid', status: 401 };
    }

    return { user };
  } catch (error) {
    return { error: 'Token is not valid', status: 401 };
  }
};

module.exports = { verifyAuth };
