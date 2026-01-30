/*
 * Instagram Clone - Search Routes
 * Cloned by Phumeh
 */

const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const auth = require('../middleware/auth');

const router = express.Router();

// Search users
router.get('/users', auth, async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    
    if (!q || q.trim().length < 1) {
      return res.json([]);
    }

    const searchQuery = q.trim();
    
    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } }, // Exclude current user
        { isActive: true },
        {
          $or: [
            { username: { $regex: searchQuery, $options: 'i' } },
            { fullName: { $regex: searchQuery, $options: 'i' } }
          ]
        }
      ]
    })
    .select('username fullName profilePicture isVerified isPrivate')
    .limit(parseInt(limit))
    .sort({ isVerified: -1, username: 1 });

    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search hashtags
router.get('/hashtags', auth, async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    
    if (!q || q.trim().length < 1) {
      return res.json([]);
    }

    const searchQuery = q.trim().replace('#', '');
    
    // Aggregate hashtags from posts
    const hashtags = await Post.aggregate([
      { $match: { hashtags: { $regex: searchQuery, $options: 'i' } } },
      { $unwind: '$hashtags' },
      { $match: { hashtags: { $regex: searchQuery, $options: 'i' } } },
      {
        $group: {
          _id: '$hashtags',
          count: { $sum: 1 },
          recentPost: { $first: '$media' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) }
    ]);

    const formattedHashtags = hashtags.map(tag => ({
      hashtag: tag._id,
      postCount: tag.count,
      thumbnail: tag.recentPost?.[0]?.url || null
    }));

    res.json(formattedHashtags);
  } catch (error) {
    console.error('Search hashtags error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search locations
router.get('/locations', auth, async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    
    if (!q || q.trim().length < 1) {
      return res.json([]);
    }

    const searchQuery = q.trim();
    
    // Aggregate locations from posts
    const locations = await Post.aggregate([
      { $match: { 'location.name': { $regex: searchQuery, $options: 'i' } } },
      {
        $group: {
          _id: '$location.name',
          coordinates: { $first: '$location.coordinates' },
          count: { $sum: 1 },
          recentPost: { $first: '$media' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) }
    ]);

    const formattedLocations = locations.map(location => ({
      name: location._id,
      coordinates: location.coordinates,
      postCount: location.count,
      thumbnail: location.recentPost?.[0]?.url || null
    }));

    res.json(formattedLocations);
  } catch (error) {
    console.error('Search locations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get trending searches
router.get('/trending', auth, async (req, res) => {
  try {
    // Get trending hashtags
    const trendingHashtags = await Post.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
      { $unwind: '$hashtags' },
      {
        $group: {
          _id: '$hashtags',
          count: { $sum: 1 },
          recentPost: { $first: '$media' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get suggested users (verified or popular)
    const suggestedUsers = await User.find({
      $and: [
        { _id: { $ne: req.user._id } },
        { isActive: true },
        {
          $or: [
            { isVerified: true },
            { 'followers.10': { $exists: true } } // Users with at least 10 followers
          ]
        }
      ]
    })
    .select('username fullName profilePicture isVerified')
    .limit(5)
    .sort({ isVerified: -1, followers: -1 });

    res.json({
      trendingHashtags: trendingHashtags.map(tag => ({
        hashtag: tag._id,
        postCount: tag.count,
        thumbnail: tag.recentPost?.[0]?.url || null
      })),
      suggestedUsers
    });
  } catch (error) {
    console.error('Get trending error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent searches
router.get('/recent', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('recentSearches');
    res.json(user.recentSearches || []);
  } catch (error) {
    console.error('Get recent searches error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add to recent searches
router.post('/recent', auth, async (req, res) => {
  try {
    const { type, query, userId } = req.body; // type: 'user', 'hashtag', 'location'
    
    const user = await User.findById(req.user._id);
    
    if (!user.recentSearches) {
      user.recentSearches = [];
    }

    // Remove if already exists
    user.recentSearches = user.recentSearches.filter(
      search => !(search.type === type && search.query === query)
    );

    // Add to beginning
    user.recentSearches.unshift({
      type,
      query,
      userId: userId || null,
      searchedAt: new Date()
    });

    // Keep only last 20 searches
    user.recentSearches = user.recentSearches.slice(0, 20);

    await user.save();
    res.json({ message: 'Added to recent searches' });
  } catch (error) {
    console.error('Add recent search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear recent searches
router.delete('/recent', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { recentSearches: [] });
    res.json({ message: 'Recent searches cleared' });
  } catch (error) {
    console.error('Clear recent searches error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;