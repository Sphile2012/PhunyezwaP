/*
 * Instagram Clone - Search Routes
 * Cloned by Phumeh
 */

const express = require('express');
const { User, Post } = require('../models');
const { Op } = require('sequelize');
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
    
    const users = await User.findAll({
      where: {
        id: { [Op.ne]: req.user.id },
        isActive: true,
        [Op.or]: [
          { username: { [Op.like]: `%${searchQuery}%` } },
          { fullName: { [Op.like]: `%${searchQuery}%` } }
        ]
      },
      attributes: ['id', 'username', 'fullName', 'profilePicture', 'isVerified', 'isPrivate'],
      limit: parseInt(limit),
      order: [['isVerified', 'DESC'], ['username', 'ASC']]
    });

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
    const { sequelize } = require('../models');
    
    // Get posts with matching hashtags
    const posts = await Post.findAll({
      where: {
        hashtags: { [Op.like]: `%${searchQuery}%` }
      },
      attributes: ['hashtags', 'media'],
      limit: 100
    });

    // Aggregate hashtags manually
    const hashtagCounts = {};
    const hashtagThumbnails = {};
    
    posts.forEach(post => {
      const hashtags = post.hashtags || [];
      hashtags.forEach(tag => {
        if (tag.toLowerCase().includes(searchQuery.toLowerCase())) {
          hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
          if (!hashtagThumbnails[tag] && post.media && post.media[0]) {
            hashtagThumbnails[tag] = post.media[0].url;
          }
        }
      });
    });

    const formattedHashtags = Object.entries(hashtagCounts)
      .map(([hashtag, count]) => ({
        hashtag,
        postCount: count,
        thumbnail: hashtagThumbnails[hashtag] || null
      }))
      .sort((a, b) => b.postCount - a.postCount)
      .slice(0, parseInt(limit));

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
    
    // Get posts with matching location
    const posts = await Post.findAll({
      where: {
        locationName: { [Op.like]: `%${searchQuery}%` }
      },
      attributes: ['locationName', 'locationCoordinates', 'media'],
      limit: 100
    });

    // Aggregate locations manually
    const locationData = {};
    
    posts.forEach(post => {
      const name = post.locationName;
      if (name) {
        if (!locationData[name]) {
          locationData[name] = {
            name,
            coordinates: post.locationCoordinates,
            count: 0,
            thumbnail: null
          };
        }
        locationData[name].count++;
        if (!locationData[name].thumbnail && post.media && post.media[0]) {
          locationData[name].thumbnail = post.media[0].url;
        }
      }
    });

    const formattedLocations = Object.values(locationData)
      .map(location => ({
        name: location.name,
        coordinates: location.coordinates,
        postCount: location.count,
        thumbnail: location.thumbnail
      }))
      .sort((a, b) => b.postCount - a.postCount)
      .slice(0, parseInt(limit));

    res.json(formattedLocations);
  } catch (error) {
    console.error('Search locations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get trending searches
router.get('/trending', auth, async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // Get recent posts with hashtags
    const posts = await Post.findAll({
      where: {
        createdAt: { [Op.gte]: sevenDaysAgo }
      },
      attributes: ['hashtags', 'media'],
      limit: 500
    });

    // Aggregate hashtags
    const hashtagCounts = {};
    const hashtagThumbnails = {};
    
    posts.forEach(post => {
      const hashtags = post.hashtags || [];
      hashtags.forEach(tag => {
        hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
        if (!hashtagThumbnails[tag] && post.media && post.media[0]) {
          hashtagThumbnails[tag] = post.media[0].url;
        }
      });
    });

    const trendingHashtags = Object.entries(hashtagCounts)
      .map(([hashtag, count]) => ({
        hashtag,
        postCount: count,
        thumbnail: hashtagThumbnails[hashtag] || null
      }))
      .sort((a, b) => b.postCount - a.postCount)
      .slice(0, 10);

    // Get suggested users (verified or popular)
    const suggestedUsers = await User.findAll({
      where: {
        id: { [Op.ne]: req.user.id },
        isActive: true,
        [Op.or]: [
          { isVerified: true },
          { followersCount: { [Op.gte]: 10 } }
        ]
      },
      attributes: ['id', 'username', 'fullName', 'profilePicture', 'isVerified'],
      limit: 5,
      order: [['isVerified', 'DESC'], ['followersCount', 'DESC']]
    });

    res.json({
      trendingHashtags,
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
    const user = await User.findByPk(req.user.id, {
      attributes: ['recentSearches']
    });
    res.json(user?.recentSearches || []);
  } catch (error) {
    console.error('Get recent searches error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add to recent searches
router.post('/recent', auth, async (req, res) => {
  try {
    const { type, query, userId } = req.body;
    
    const user = await User.findByPk(req.user.id);
    
    let recentSearches = user.recentSearches || [];

    // Remove if already exists
    recentSearches = recentSearches.filter(
      search => !(search.type === type && search.query === query)
    );

    // Add to beginning
    recentSearches.unshift({
      type,
      query,
      userId: userId || null,
      searchedAt: new Date()
    });

    // Keep only last 20 searches
    recentSearches = recentSearches.slice(0, 20);

    await user.update({ recentSearches });
    res.json({ message: 'Added to recent searches' });
  } catch (error) {
    console.error('Add recent search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear recent searches
router.delete('/recent', auth, async (req, res) => {
  try {
    await User.update(
      { recentSearches: [] },
      { where: { id: req.user.id } }
    );
    res.json({ message: 'Recent searches cleared' });
  } catch (error) {
    console.error('Clear recent searches error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
