/*
 * Instagram Clone - Authentication Routes (Sequelize)
 * Created by Phumeh
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const { User, Follow } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, phone, password, fullName } = req.body;

    if (!username || !password || (!email && !phone)) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check for existing user
    const whereClause = { [Op.or]: [{ username }] };
    if (email) whereClause[Op.or].push({ email });
    if (phone) whereClause[Op.or].push({ phone });

    const existingUser = await User.findOne({ where: whereClause });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email: email || null,
      phone: phone || null,
      password: hashedPassword,
      fullName: fullName || '',
      profilePicture: `https://picsum.photos/150/150?random=${Date.now()}`
    });

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'phumeh-instagram-secret-key',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
        profilePicture: user.profilePicture,
        isPrivate: user.isPrivate,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Please provide credentials' });
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: identifier },
          { phone: identifier },
          { username: identifier }
        ]
      }
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

    // Get follower/following counts
    const followersCount = await Follow.count({ where: { followingId: user.id } });
    const followingCount = await Follow.count({ where: { followerId: user.id } });

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'phumeh-instagram-secret-key',
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
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
        followers: followersCount,
        following: followingCount
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const followersCount = await Follow.count({ where: { followingId: req.user.id } });
    const followingCount = await Follow.count({ where: { followerId: req.user.id } });

    res.json({
      id: req.user.id,
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
      followers: followersCount,
      following: followingCount
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
    
    const updates = {};
    if (fullName !== undefined) updates.fullName = fullName;
    if (bio !== undefined) updates.bio = bio;
    if (website !== undefined) updates.website = website;
    if (isPrivate !== undefined) updates.isPrivate = isPrivate;
    if (profilePicture !== undefined) updates.profilePicture = profilePicture;
    if (accountType !== undefined) updates.accountType = accountType;

    await req.user.update(updates);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: req.user.id,
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

    const isMatch = await bcrypt.compare(currentPassword, req.user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    await req.user.update({ password: hashedPassword });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout
router.post('/logout', auth, async (req, res) => {
  try {
    await req.user.update({ lastSeen: new Date() });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
