/*
 * Instagram Clone - Users Routes (Sequelize)
 * Created by Phumeh
 */

const express = require('express');
const auth = require('../middleware/auth');
const { User, Post, Follow, FollowRequest } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

// Demo users for profile viewing
const demoProfiles = {
  'phumeh': {
    _id: 'user-phumeh',
    username: 'phumeh',
    fullName: 'Phumeh Developer',
    profilePicture: 'https://picsum.photos/150/150?random=1',
    bio: 'Creator of this Instagram Clone 🚀\n💻 Full Stack Developer\n📍 South Africa',
    website: 'https://github.com/Sphile2012',
    isPrivate: false,
    isVerified: true,
    accountType: 'creator',
    followers: 12500,
    following: 890,
    posts: 156
  }
};

// Get user profile
router.get('/:username', auth, async (req, res) => {
  try {
    const user = await User.findOne({ 
      where: { username: req.params.username },
      attributes: { exclude: ['password'] }
    });
    
    if (user && user.isActive) {
      const followersCount = await Follow.count({ where: { followingId: user.id } });
      const followingCount = await Follow.count({ where: { followerId: user.id } });
      
      const posts = await Post.findAll({ 
        where: { userId: user.id, isArchived: false },
        include: [{ model: User, as: 'user', attributes: ['username', 'profilePicture'] }],
        order: [['createdAt', 'DESC']]
      });

      const isFollowing = await Follow.findOne({
        where: { followerId: req.user.id, followingId: user.id }
      });

      return res.json({
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          profilePicture: user.profilePicture,
          bio: user.bio,
          website: user.website,
          isPrivate: user.isPrivate,
          isVerified: user.isVerified,
          accountType: user.accountType,
          followers: followersCount,
          following: followingCount,
          posts: posts ? posts.length : 0
        },
        posts: posts || [],
        isFollowing: !!isFollowing,
        isOwnProfile: user.id === req.user.id
      });
    }

    if (user && !user.isActive) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Demo mode
    let profile = demoProfiles[req.params.username];
    
    if (!profile) {
      profile = {
        _id: 'user-' + req.params.username,
        username: req.params.username,
        fullName: req.params.username.charAt(0).toUpperCase() + req.params.username.slice(1),
        profilePicture: `https://picsum.photos/150/150?random=${req.params.username.length}`,
        bio: 'Instagram Clone User 📱',
        website: '',
        isPrivate: false,
        isVerified: false,
        accountType: 'personal',
        followers: Math.floor(Math.random() * 1000),
        following: Math.floor(Math.random() * 500),
        posts: Math.floor(Math.random() * 50)
      };
    }

    const isOwnProfile = req.user.username === req.params.username;

    res.json({
      user: profile,
      posts: [
        {
          _id: 'post-1',
          media: [{ url: 'https://picsum.photos/300/300?random=1', type: 'image' }],
          likes: [1, 2, 3],
          comments: []
        },
        {
          _id: 'post-2',
          media: [{ url: 'https://picsum.photos/300/300?random=2', type: 'image' }],
          likes: [1, 2],
          comments: []
        },
        {
          _id: 'post-3',
          media: [{ url: 'https://picsum.photos/300/300?random=3', type: 'image' }],
          likes: [1],
          comments: []
        }
      ],
      isFollowing: false,
      isOwnProfile
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Follow/Unfollow user
router.put('/:id/follow', auth, async (req, res) => {
  try {
    const userToFollow = await User.findByPk(req.params.id);
    
    if (!userToFollow || !userToFollow.isActive) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userToFollow.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const existingFollow = await Follow.findOne({
      where: { followerId: req.user.id, followingId: req.params.id }
    });
    
    if (existingFollow) {
      await existingFollow.destroy();
      
      const followersCount = await Follow.count({ where: { followingId: req.params.id } });
      const followingCount = await Follow.count({ where: { followerId: req.user.id } });
      
      return res.json({ 
        isFollowing: false,
        followers: followersCount,
        following: followingCount
      });
    } else {
      await Follow.create({
        followerId: req.user.id,
        followingId: parseInt(req.params.id)
      });
      
      const followersCount = await Follow.count({ where: { followingId: req.params.id } });
      const followingCount = await Follow.count({ where: { followerId: req.user.id } });
      
      return res.json({ 
        isFollowing: true,
        followers: followersCount,
        following: followingCount
      });
    }
  } catch (error) {
    console.error('Follow/unfollow error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get suggested users
router.get('/suggestions/for-you', auth, async (req, res) => {
  try {
    const followingIds = await Follow.findAll({
      where: { followerId: req.user.id },
      attributes: ['followingId']
    });
    
    const excludeIds = [req.user.id, ...followingIds.map(f => f.followingId)];
    
    const suggestions = await User.findAll({
      where: {
        id: { [Op.notIn]: excludeIds },
        isActive: true
      },
      attributes: ['id', 'username', 'fullName', 'profilePicture', 'isVerified'],
      order: [['isVerified', 'DESC']],
      limit: 20
    });

    const formatted = suggestions.map(u => ({
      _id: u.id,
      username: u.username,
      fullName: u.fullName,
      profilePicture: u.profilePicture,
      isVerified: u.isVerified
    }));

    if (formatted.length > 0) {
      return res.json(formatted);
    }

    // Demo mode
    res.json([
      { _id: '1', username: 'travel_lover', fullName: 'Travel Lover', profilePicture: 'https://picsum.photos/50/50?random=1', isVerified: true },
      { _id: '2', username: 'food_diary', fullName: 'Food Diary', profilePicture: 'https://picsum.photos/50/50?random=2', isVerified: false },
      { _id: '3', username: 'tech_news', fullName: 'Tech News', profilePicture: 'https://picsum.photos/50/50?random=3', isVerified: true },
      { _id: '4', username: 'fitness_tips', fullName: 'Fitness Tips', profilePicture: 'https://picsum.photos/50/50?random=4', isVerified: false },
      { _id: '5', username: 'art_daily', fullName: 'Art Daily', profilePicture: 'https://picsum.photos/50/50?random=5', isVerified: false }
    ]);
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Block user
router.put('/:id/block', auth, async (req, res) => {
  try {
    const currentUser = await User.findByPk(req.user.id);
    const blockedUsers = currentUser.blockedUsers || [];
    const isBlocked = blockedUsers.includes(parseInt(req.params.id));
    
    if (isBlocked) {
      currentUser.blockedUsers = blockedUsers.filter(id => id !== parseInt(req.params.id));
    } else {
      currentUser.blockedUsers = [...blockedUsers, parseInt(req.params.id)];
    }

    await currentUser.save();

    res.json({ 
      isBlocked: !isBlocked,
      message: isBlocked ? 'User unblocked' : 'User blocked'
    });
  } catch (error) {
    console.error('Block/unblock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mute user
router.put('/:id/mute', auth, async (req, res) => {
  try {
    const currentUser = await User.findByPk(req.user.id);
    const mutedUsers = currentUser.mutedUsers || [];
    const isMuted = mutedUsers.includes(parseInt(req.params.id));
    
    if (isMuted) {
      currentUser.mutedUsers = mutedUsers.filter(id => id !== parseInt(req.params.id));
    } else {
      currentUser.mutedUsers = [...mutedUsers, parseInt(req.params.id)];
    }

    await currentUser.save();

    res.json({ 
      isMuted: !isMuted,
      message: isMuted ? 'User unmuted' : 'User muted'
    });
  } catch (error) {
    console.error('Mute/unmute error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add to close friends
router.put('/:id/close-friends', auth, async (req, res) => {
  try {
    const currentUser = await User.findByPk(req.user.id);
    const closeFriends = currentUser.closeFriends || [];
    const isCloseFriend = closeFriends.includes(parseInt(req.params.id));
    
    if (isCloseFriend) {
      currentUser.closeFriends = closeFriends.filter(id => id !== parseInt(req.params.id));
    } else {
      currentUser.closeFriends = [...closeFriends, parseInt(req.params.id)];
    }

    await currentUser.save();

    res.json({ 
      isCloseFriend: !isCloseFriend,
      message: isCloseFriend ? 'Removed from close friends' : 'Added to close friends'
    });
  } catch (error) {
    console.error('Close friends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get followers
router.get('/:id/followers', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const follows = await Follow.findAll({
      where: { followingId: req.params.id },
      attributes: ['followerId']
    });

    if (follows && follows.length > 0) {
      const followerIds = follows.map(f => f.followerId);
      const followers = await User.findAll({
        where: { id: { [Op.in]: followerIds } },
        attributes: ['id', 'username', 'fullName', 'profilePicture', 'isVerified']
      });
      
      const formatted = followers.map(u => ({
        _id: u.id,
        username: u.username,
        fullName: u.fullName,
        profilePicture: u.profilePicture,
        isVerified: u.isVerified
      }));
      return res.json(formatted);
    }

    // Demo mode
    res.json([
      { _id: '1', username: 'user1', fullName: 'User One', profilePicture: 'https://picsum.photos/50/50?random=10', isVerified: false },
      { _id: '2', username: 'user2', fullName: 'User Two', profilePicture: 'https://picsum.photos/50/50?random=11', isVerified: true }
    ]);
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get following
router.get('/:id/following', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const follows = await Follow.findAll({
      where: { followerId: req.params.id },
      attributes: ['followingId']
    });

    if (follows && follows.length > 0) {
      const followingIds = follows.map(f => f.followingId);
      const following = await User.findAll({
        where: { id: { [Op.in]: followingIds } },
        attributes: ['id', 'username', 'fullName', 'profilePicture', 'isVerified']
      });
      
      const formatted = following.map(u => ({
        _id: u.id,
        username: u.username,
        fullName: u.fullName,
        profilePicture: u.profilePicture,
        isVerified: u.isVerified
      }));
      return res.json(formatted);
    }

    // Demo mode
    res.json([
      { _id: '3', username: 'user3', fullName: 'User Three', profilePicture: 'https://picsum.photos/50/50?random=12', isVerified: false },
      { _id: '4', username: 'user4', fullName: 'User Four', profilePicture: 'https://picsum.photos/50/50?random=13', isVerified: false }
    ]);
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
