/*
 * Instagram Clone - Posts Routes (Sequelize)
 * Created by Phumeh
 */

const express = require('express');
const auth = require('../middleware/auth');
const { User, Post, Comment, Like, Follow } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

// Helper function to format post for API response
const formatPost = (post) => {
  const postJson = post.toJSON ? post.toJSON() : post;
  return {
    _id: postJson.id,
    id: postJson.id,
    user: postJson.user ? {
      _id: postJson.user.id,
      id: postJson.user.id,
      username: postJson.user.username,
      profilePicture: postJson.user.profilePicture,
      isVerified: postJson.user.isVerified
    } : null,
    media: postJson.media || [],
    caption: postJson.caption,
    type: postJson.type,
    hashtags: postJson.hashtags || [],
    location: postJson.locationName ? {
      name: postJson.locationName,
      lat: postJson.locationLat,
      lng: postJson.locationLng
    } : null,
    likes: postJson.likes || [],
    comments: (postJson.comments || []).map(c => ({
      _id: c.id,
      id: c.id,
      user: c.user ? {
        _id: c.user.id,
        id: c.user.id,
        username: c.user.username
      } : null,
      text: c.text,
      createdAt: c.createdAt
    })),
    createdAt: postJson.createdAt
  };
};

// Get all posts (feed)
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        { 
          model: User, 
          as: 'user', 
          attributes: ['id', 'username', 'profilePicture', 'isVerified'] 
        },
        {
          model: Comment,
          as: 'comments',
          include: [{ model: User, as: 'user', attributes: ['id', 'username'] }],
          order: [['createdAt', 'ASC']]
        },
        {
          model: Like,
          as: 'likes',
          attributes: ['id', 'userId']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const formattedPosts = posts.map(formatPost);
    res.json(formattedPosts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single post
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [
        { 
          model: User, 
          as: 'user', 
          attributes: ['id', 'username', 'profilePicture', 'isVerified'] 
        },
        {
          model: Comment,
          as: 'comments',
          include: [{ model: User, as: 'user', attributes: ['id', 'username'] }],
          order: [['createdAt', 'ASC']]
        },
        {
          model: Like,
          as: 'likes',
          attributes: ['id', 'userId']
        }
      ]
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(formatPost(post));
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create post
router.post('/', auth, async (req, res) => {
  try {
    const { caption, media, type, hashtags, location } = req.body;
    
    const userId = req.user.id || req.user._id;
    
    const post = await Post.create({
      userId: userId,
      media: media || [],
      type: type || 'photo',
      caption: caption || '',
      hashtags: hashtags || [],
      locationName: location?.name || null,
      locationLat: location?.lat || null,
      locationLng: location?.lng || null
    });

    const postWithUser = await Post.findByPk(post.id, {
      include: [
        { 
          model: User, 
          as: 'user', 
          attributes: ['id', 'username', 'profilePicture', 'isVerified'] 
        }
      ]
    });

    res.status(201).json(formatPost(postWithUser));
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike post
router.put('/:id/like', auth, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.user.id || req.user._id;

    const post = await Post.findByPk(postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const existingLike = await Like.findOne({
      where: { postId: postId, userId: userId }
    });

    let isLiked;
    if (existingLike) {
      await existingLike.destroy();
      isLiked = false;
    } else {
      await Like.create({ postId: postId, userId: userId });
      isLiked = true;
    }

    const likeCount = await Like.count({ where: { postId: postId } });

    res.json({ likes: likeCount, isLiked: isLiked });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const postId = parseInt(req.params.id);
    const userId = req.user.id || req.user._id;

    const post = await Post.findByPk(postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = await Comment.create({
      postId: postId,
      userId: userId,
      text: text
    });

    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'username'] }]
    });

    res.json({
      _id: commentWithUser.id,
      id: commentWithUser.id,
      user: {
        _id: commentWithUser.user.id,
        id: commentWithUser.user.id,
        username: commentWithUser.user.username
      },
      text: commentWithUser.text,
      createdAt: commentWithUser.createdAt
    });
  } catch (error) {
    console.error('Comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete comment
router.delete('/:postId/comment/:commentId', auth, async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const commentId = parseInt(req.params.commentId);
    const userId = req.user.id || req.user._id;

    const comment = await Comment.findOne({
      where: { id: commentId, postId: postId }
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await comment.destroy();
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete post
router.delete('/:id', auth, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.user.id || req.user._id;

    const post = await Post.findByPk(postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Like.destroy({ where: { postId: postId } });
    await Comment.destroy({ where: { postId: postId } });
    await post.destroy();

    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save/Unsave post
router.put('/:id/save', auth, async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.user.id || req.user._id;

    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const post = await Post.findByPk(postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    let savedPosts = user.savedPosts || [];
    const isSaved = savedPosts.includes(postId);

    if (isSaved) {
      savedPosts = savedPosts.filter(p => p !== postId);
    } else {
      savedPosts.push(postId);
    }

    await user.update({ savedPosts: savedPosts });

    res.json({ isSaved: !isSaved, message: isSaved ? 'Post unsaved' : 'Post saved' });
  } catch (error) {
    console.error('Save post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's posts
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const posts = await Post.findAll({
      where: { userId: userId },
      include: [
        { 
          model: User, 
          as: 'user', 
          attributes: ['id', 'username', 'profilePicture', 'isVerified'] 
        },
        {
          model: Like,
          as: 'likes',
          attributes: ['id', 'userId']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const formattedPosts = posts.map(formatPost);
    res.json(formattedPosts);
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
