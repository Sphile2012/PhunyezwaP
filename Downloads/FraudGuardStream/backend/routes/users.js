/*
 * Instagram Clone - Users Routes
 * Created by Phumeh
 */

const express = require('express');
const auth = require('../middleware/auth');

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

// Get User model safely
const getUser = () => {
  try {
    const User = require('../models/User');
    if (User.db?.readyState === 1) return User;
    return null;
  } catch (e) {
    return null;
  }
};

// Get Post model safely
const getPost = () => {
  try {
    const Post = require('../models/Post');
    if (Post.db?.readyState === 1) return Post;
    return null;
  } catch (e) {
    return null;
  }
};

// Get user profile
router.get('/:username', auth, async (req, res) => {
  try {
    const User = getUser();
    const Post = getPost();
    
    if (User) {
      const user = await User.findOne({ username: req.params.username })
        .select('-password')
        .populate('followers', 'username profilePicture isVerified')
        .populate('following', 'username profilePicture isVerified');
      
      if (!user || !user.isActive) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.blockedUsers.includes(req.user._id)) {
        return res.status(403).json({ message: 'Access denied' });
      }

      let posts = [];
      if (Post) {
        posts = await Post.find({ user: user._id, isArchived: false })
          .populate('user', 'username profilePicture')
          .sort({ createdAt: -1 });
      }

      const isFollowing = user.followers.some(f => f._id.toString() === req.user._id.toString());

      return res.json({
        user: {
          id: user._id,
          username: user.username,
          fullName: user.fullName,
          profilePicture: user.profilePicture,
          bio: user.bio,
          website: user.website,
          isPrivate: user.isPrivate,
          isVerified: user.isVerified,
          accountType: user.accountType,
          followers: user.followers.length,
          following: user.following.length,
          posts: posts.length
        },
        posts,
        isFollowing,
        isOwnProfile: user._id.toString() === req.user._id.toString()
      });
    }

    // Demo mode
    let profile = demoProfiles[req.params.username];
    
    if (!profile) {
      // Create demo profile
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
    const User = getUser();
    
    if (User) {
      const userToFollow = await User.findById(req.params.id);
      const currentUser = await User.findById(req.user._id);
      
      if (!userToFollow || !userToFollow.isActive) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (userToFollow._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: 'Cannot follow yourself' });
      }

      const isFollowing = currentUser.following.includes(req.params.id);
      
      if (isFollowing) {
        currentUser.following = currentUser.following.filter(
          id => id.toString() !== req.params.id
        );
        userToFollow.followers = userToFollow.followers.filter(
          id => id.toString() !== req.user._id.toString()
        );
      } else {
        currentUser.following.push(req.params.id);
        userToFollow.followers.push(req.user._id);
      }

      await currentUser.save();
      await userToFollow.save();

      return res.json({ 
        isFollowing: !isFollowing,
        followers: userToFollow.followers.length,
        following: currentUser.following.length
      });
    }

    // Demo mode
    res.json({ 
      isFollowing: true,
      followers: 1235,
      following: 568,
      message: 'Following!'
    });
  } catch (error) {
    console.error('Follow/unfollow error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get suggested users
router.get('/suggestions/for-you', auth, async (req, res) => {
  try {
    const User = getUser();
    
    if (User) {
      const currentUser = await User.findById(req.user._id);
      
      const suggestions = await User.aggregate([
        {
          $match: {
            _id: { $nin: [...currentUser.following, ...currentUser.blockedUsers, req.user._id] },
            isActive: true
          }
        },
        { $sort: { isVerified: -1 } },
        { $limit: 20 },
        {
          $project: {
            username: 1,
            fullName: 1,
            profilePicture: 1,
            isVerified: 1
          }
        }
      ]);

      return res.json(suggestions);
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
    const isBlocked = req.user.blockedUsers?.includes(req.params.id);
    
    if (isBlocked) {
      req.user.blockedUsers = req.user.blockedUsers.filter(
        id => id.toString() !== req.params.id
      );
    } else {
      if (!req.user.blockedUsers) req.user.blockedUsers = [];
      req.user.blockedUsers.push(req.params.id);
    }

    if (req.user.save) await req.user.save();

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
    const isMuted = req.user.mutedUsers?.includes(req.params.id);
    
    if (isMuted) {
      req.user.mutedUsers = req.user.mutedUsers.filter(
        id => id.toString() !== req.params.id
      );
    } else {
      if (!req.user.mutedUsers) req.user.mutedUsers = [];
      req.user.mutedUsers.push(req.params.id);
    }

    if (req.user.save) await req.user.save();

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
    const isCloseFriend = req.user.closeFriends?.includes(req.params.id);
    
    if (isCloseFriend) {
      req.user.closeFriends = req.user.closeFriends.filter(
        id => id.toString() !== req.params.id
      );
    } else {
      if (!req.user.closeFriends) req.user.closeFriends = [];
      req.user.closeFriends.push(req.params.id);
    }

    if (req.user.save) await req.user.save();

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
    const User = getUser();
    
    if (User) {
      const user = await User.findById(req.params.id)
        .populate('followers', 'username fullName profilePicture isVerified');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.json(user.followers);
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
    const User = getUser();
    
    if (User) {
      const user = await User.findById(req.params.id)
        .populate('following', 'username fullName profilePicture isVerified');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.json(user.following);
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
