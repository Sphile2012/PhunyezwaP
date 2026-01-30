/*
 * Instagram Clone - Authentication Middleware
 * Created by Phumeh
 */

const jwt = require('jsonwebtoken');

// Demo users storage reference
let demoUsers = null;

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret-key');
    
    // Try to get User model
    let user = null;
    try {
      const User = require('../models/User');
      if (User.db?.readyState === 1) {
        user = await User.findById(decoded.userId).select('-password');
      }
    } catch (e) {
      // MongoDB not available
    }

    if (!user) {
      // Demo mode - get from auth route's demoUsers or create demo user
      try {
        const authRoute = require('./auth');
        demoUsers = authRoute.demoUsers;
      } catch (e) {}

      if (demoUsers) {
        for (const [username, u] of demoUsers) {
          if (u.id === decoded.userId || u._id === decoded.userId) {
            user = u;
            break;
          }
        }
      }

      // Create demo user if still not found
      if (!user) {
        user = {
          _id: decoded.userId,
          id: decoded.userId,
          username: 'demo_user',
          email: 'demo@phumeh.com',
          fullName: 'Demo User',
          profilePicture: 'https://picsum.photos/150/150?random=1',
          bio: 'Demo account - Created by Phumeh',
          isPrivate: false,
          isVerified: true,
          followers: [],
          following: [],
          closeFriends: [],
          blockedUsers: [],
          mutedUsers: [],
          savedPosts: [],
          accountType: 'personal',
          isActive: true
        };
      }
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;
