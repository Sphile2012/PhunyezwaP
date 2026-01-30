/*
 * Instagram Clone - Authentication Routes
 * Created by Phumeh
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

const router = express.Router();

// Demo users storage (in-memory for demo mode)
const demoUsers = new Map();

// Get User model safely
const getUser = () => {
  try {
    return require('../models/User');
  } catch (e) {
    return null;
  }
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, phone, password, fullName } = req.body;

    if (!username || !password || (!email && !phone)) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const User = getUser();
    
    if (User && User.db?.readyState === 1) {
      // MongoDB mode
      const existingUser = await User.findOne({ 
        $or: [
          { email: email || null }, 
          { phone: phone || null },
          { username }
        ] 
      });
      
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = new User({
        username,
        email: email || null,
        phone: phone || null,
        password: hashedPassword,
        fullName: fullName || ''
      });

      await user.save();

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'demo-secret-key',
        { expiresIn: '30d' }
      );

      return res.status(201).json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          fullName: user.fullName,
          profilePicture: user.profilePicture,
          isPrivate: user.isPrivate,
          isVerified: user.isVerified
        }
      });
    }

    // Demo mode
    if (demoUsers.has(username)) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const userId = 'demo-' + Date.now();
    const demoUser = {
      id: userId,
      _id: userId,
      username,
      email: email || null,
      phone: phone || null,
      fullName: fullName || '',
      profilePicture: `https://picsum.photos/150/150?random=${Date.now()}`,
      bio: 'Welcome to Instagram Clone by Phumeh!',
      isPrivate: false,
      isVerified: false,
      followers: [],
      following: [],
      password: await bcrypt.hash(password, 10)
    };

    demoUsers.set(username, demoUser);

    const token = jwt.sign(
      { userId: demoUser.id },
      process.env.JWT_SECRET || 'demo-secret-key',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      token,
      user: {
        id: demoUser.id,
        username: demoUser.username,
        email: demoUser.email,
        phone: demoUser.phone,
        fullName: demoUser.fullName,
        profilePicture: demoUser.profilePicture,
        isPrivate: demoUser.isPrivate,
        isVerified: demoUser.isVerified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Please provide credentials' });
    }

    const User = getUser();

    if (User && User.db?.readyState === 1) {
      // MongoDB mode
      const user = await User.findOne({ 
        $or: [
          { email: identifier },
          { phone: identifier },
          { username: identifier }
        ]
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      if (!user.isActive) {
        return res.status(400).json({ message: 'Account is deactivated' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      user.lastSeen = new Date();
      await user.save();

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'demo-secret-key',
        { expiresIn: '30d' }
      );

      return res.json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          fullName: user.fullName,
          profilePicture: user.profilePicture,
          bio: user.bio,
          website: user.website,
          isPrivate: user.isPrivate,
          isVerified: user.isVerified,
          accountType: user.accountType,
          followers: user.followers.length,
          following: user.following.length
        }
      });
    }

    // Demo mode - accept any credentials
    let demoUser = demoUsers.get(identifier);
    
    if (!demoUser) {
      // Create demo user on the fly
      const userId = 'demo-' + Date.now();
      demoUser = {
        id: userId,
        _id: userId,
        username: identifier,
        email: `${identifier}@demo.phumeh.com`,
        fullName: identifier.charAt(0).toUpperCase() + identifier.slice(1),
        profilePicture: `https://picsum.photos/150/150?random=${Date.now()}`,
        bio: 'Demo account - Created by Phumeh',
        isPrivate: false,
        isVerified: true,
        followers: [],
        following: [],
        accountType: 'personal'
      };
      demoUsers.set(identifier, demoUser);
    }

    const token = jwt.sign(
      { userId: demoUser.id },
      process.env.JWT_SECRET || 'demo-secret-key',
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: demoUser.id,
        username: demoUser.username,
        email: demoUser.email,
        fullName: demoUser.fullName,
        profilePicture: demoUser.profilePicture,
        bio: demoUser.bio,
        isPrivate: demoUser.isPrivate,
        isVerified: demoUser.isVerified,
        accountType: demoUser.accountType || 'personal',
        followers: demoUser.followers?.length || 1234,
        following: demoUser.following?.length || 567
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      id: req.user._id || req.user.id,
      username: req.user.username,
      email: req.user.email,
      phone: req.user.phone,
      fullName: req.user.fullName,
      profilePicture: req.user.profilePicture,
      bio: req.user.bio,
      website: req.user.website,
      isPrivate: req.user.isPrivate,
      isVerified: req.user.isVerified,
      accountType: req.user.accountType,
      followers: req.user.followers?.length || 0,
      following: req.user.following?.length || 0
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { fullName, bio, website, isPrivate, profilePicture, accountType } = req.body;
    
    // Update in memory
    if (fullName !== undefined) req.user.fullName = fullName;
    if (bio !== undefined) req.user.bio = bio;
    if (website !== undefined) req.user.website = website;
    if (isPrivate !== undefined) req.user.isPrivate = isPrivate;
    if (profilePicture !== undefined) req.user.profilePicture = profilePicture;
    if (accountType !== undefined) req.user.accountType = accountType;

    // Save if mongoose model
    if (req.user.save) {
      await req.user.save();
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: req.user._id || req.user.id,
        username: req.user.username,
        fullName: req.user.fullName,
        bio: req.user.bio,
        website: req.user.website,
        profilePicture: req.user.profilePicture,
        isPrivate: req.user.isPrivate,
        accountType: req.user.accountType
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (req.user.password) {
      const isMatch = await bcrypt.compare(currentPassword, req.user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    req.user.password = await bcrypt.hash(newPassword, salt);
    
    if (req.user.save) {
      await req.user.save();
    }

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout
router.post('/logout', auth, async (req, res) => {
  try {
    req.user.lastSeen = new Date();
    if (req.user.save) {
      await req.user.save();
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export demoUsers for other routes
router.demoUsers = demoUsers;

module.exports = router;
