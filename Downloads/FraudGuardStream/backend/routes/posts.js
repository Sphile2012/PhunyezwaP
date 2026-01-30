/*
 * Instagram Clone - Posts Routes
 * Created by Phumeh
 */

const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// Demo posts storage
const demoPosts = [
  {
    _id: 'post-1',
    user: {
      _id: 'user-1',
      username: 'phumeh',
      profilePicture: 'https://picsum.photos/150/150?random=100',
      isVerified: true
    },
    media: [{ url: 'https://picsum.photos/600/600?random=1', type: 'image' }],
    caption: 'Welcome to Instagram Clone! 🚀 Created by Phumeh',
    likes: [],
    comments: [],
    createdAt: new Date().toISOString()
  },
  {
    _id: 'post-2',
    user: {
      _id: 'user-2',
      username: 'nature_lover',
      profilePicture: 'https://picsum.photos/150/150?random=101',
      isVerified: false
    },
    media: [{ url: 'https://picsum.photos/600/600?random=2', type: 'image' }],
    caption: 'Beautiful sunset 🌅 #nature #photography',
    likes: [{ user: 'user-1' }, { user: 'user-3' }],
    comments: [
      { _id: 'c1', user: { username: 'traveler' }, text: 'Amazing!', createdAt: new Date() }
    ],
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    _id: 'post-3',
    user: {
      _id: 'user-3',
      username: 'foodie_adventures',
      profilePicture: 'https://picsum.photos/150/150?random=102',
      isVerified: false
    },
    media: [{ url: 'https://picsum.photos/600/600?random=3', type: 'image' }],
    caption: 'Delicious brunch today! 🥞 #food #yummy',
    likes: [{ user: 'user-1' }],
    comments: [],
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    _id: 'post-4',
    user: {
      _id: 'user-4',
      username: 'tech_enthusiast',
      profilePicture: 'https://picsum.photos/150/150?random=103',
      isVerified: true
    },
    media: [{ url: 'https://picsum.photos/600/600?random=4', type: 'image' }],
    caption: 'New setup complete! 💻 #tech #coding',
    likes: [],
    comments: [],
    createdAt: new Date(Date.now() - 10800000).toISOString()
  },
  {
    _id: 'post-5',
    user: {
      _id: 'user-5',
      username: 'fitness_journey',
      profilePicture: 'https://picsum.photos/150/150?random=104',
      isVerified: false
    },
    media: [{ url: 'https://picsum.photos/600/600?random=5', type: 'image' }],
    caption: 'Morning workout done! 💪 #fitness #motivation',
    likes: [{ user: 'user-1' }, { user: 'user-2' }, { user: 'user-3' }],
    comments: [],
    createdAt: new Date(Date.now() - 14400000).toISOString()
  }
];

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

// Get all posts (feed)
router.get('/', auth, async (req, res) => {
  try {
    const Post = getPost();
    
    if (Post) {
      const posts = await Post.find()
        .populate('user', 'username profilePicture isVerified')
        .populate('comments.user', 'username')
        .sort({ createdAt: -1 });
      return res.json(posts);
    }

    // Demo mode
    res.json(demoPosts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create post
router.post('/', auth, async (req, res) => {
  try {
    const { caption, media, type, hashtags, location } = req.body;
    
    const Post = getPost();
    
    if (Post) {
      const post = new Post({
        user: req.user._id,
        media: media || [],
        type: type || 'photo',
        caption: caption || '',
        hashtags: hashtags || [],
        location: location || null
      });

      await post.save();
      await post.populate('user', 'username profilePicture');
      return res.status(201).json(post);
    }

    // Demo mode
    const newPost = {
      _id: 'post-' + Date.now(),
      user: {
        _id: req.user._id || req.user.id,
        username: req.user.username,
        profilePicture: req.user.profilePicture,
        isVerified: req.user.isVerified
      },
      media: media || [{ url: 'https://picsum.photos/600/600?random=' + Date.now(), type: 'image' }],
      caption: caption || '',
      likes: [],
      comments: [],
      createdAt: new Date().toISOString()
    };

    demoPosts.unshift(newPost);
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike post
router.put('/:id/like', auth, async (req, res) => {
  try {
    const Post = getPost();
    
    if (Post) {
      const post = await Post.findById(req.params.id);
      
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      const likeIndex = post.likes.findIndex(
        like => like.user && like.user.toString() === req.user._id.toString()
      );
      
      if (likeIndex > -1) {
        post.likes.splice(likeIndex, 1);
      } else {
        post.likes.push({ user: req.user._id });
      }

      await post.save();
      return res.json({ likes: post.likes.length, isLiked: likeIndex === -1 });
    }

    // Demo mode
    const post = demoPosts.find(p => p._id === req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user._id || req.user.id;
    const likeIndex = post.likes.findIndex(l => l.user === userId);
    
    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push({ user: userId });
    }

    res.json({ likes: post.likes.length, isLiked: likeIndex === -1 });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    
    const Post = getPost();
    
    if (Post) {
      const post = await Post.findById(req.params.id);
      
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      const comment = { user: req.user._id, text };
      post.comments.push(comment);
      await post.save();
      await post.populate('comments.user', 'username');

      return res.json(post.comments[post.comments.length - 1]);
    }

    // Demo mode
    const post = demoPosts.find(p => p._id === req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = {
      _id: 'comment-' + Date.now(),
      user: { _id: req.user._id || req.user.id, username: req.user.username },
      text,
      createdAt: new Date()
    };

    post.comments.push(newComment);
    res.json(newComment);
  } catch (error) {
    console.error('Comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete post
router.delete('/:id', auth, async (req, res) => {
  try {
    const Post = getPost();
    
    if (Post) {
      const post = await Post.findById(req.params.id);
      
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      if (post.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      await Post.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Post deleted' });
    }

    // Demo mode
    const index = demoPosts.findIndex(p => p._id === req.params.id);
    if (index > -1) {
      demoPosts.splice(index, 1);
    }
    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save/Unsave post
router.put('/:id/save', auth, async (req, res) => {
  try {
    const isSaved = req.user.savedPosts?.includes(req.params.id);
    
    if (isSaved) {
      req.user.savedPosts = req.user.savedPosts.filter(p => p.toString() !== req.params.id);
    } else {
      if (!req.user.savedPosts) req.user.savedPosts = [];
      req.user.savedPosts.push(req.params.id);
    }

    if (req.user.save) await req.user.save();

    res.json({ isSaved: !isSaved, message: isSaved ? 'Post unsaved' : 'Post saved' });
  } catch (error) {
    console.error('Save post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
