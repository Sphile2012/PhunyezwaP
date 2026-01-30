/*
 * Instagram Clone - Reels Routes
 * Cloned by Phumeh
 */

const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { User, Reel, Like, Comment } = require('../models');
const { Op } = require('sequelize');
const auth = require('../middleware/auth');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Create reel
router.post('/', auth, upload.single('video'), async (req, res) => {
  try {
    const { caption, hashtags, mentions, audio, effects, audience } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Video file is required' });
    }

    // Upload video to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'video',
      eager: [
        { width: 300, height: 300, crop: 'thumb', gravity: 'center', format: 'jpg' }
      ]
    });

    const reel = await Reel.create({
      userId: req.user.id,
      videoUrl: result.secure_url,
      videoThumbnail: result.eager[0].secure_url,
      videoDuration: result.duration,
      caption: caption || '',
      hashtags: hashtags ? JSON.parse(hashtags) : [],
      mentions: mentions ? JSON.parse(mentions) : [],
      audio: audio ? JSON.parse(audio) : null,
      effects: effects ? JSON.parse(effects) : [],
      audience: audience || 'public'
    });

    const reelWithUser = await Reel.findByPk(reel.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'profilePicture', 'isVerified'] }]
    });

    res.status(201).json(reelWithUser);
  } catch (error) {
    console.error('Create reel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reels feed (explore/trending)
router.get('/feed', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const reels = await Reel.findAll({
      where: { audience: 'public' },
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'profilePicture', 'isVerified'] }],
      order: [['createdAt', 'DESC'], ['views', 'DESC']],
      offset,
      limit: parseInt(limit)
    });

    res.json(reels);
  } catch (error) {
    console.error('Get reels feed error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's reels
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    const reels = await Reel.findAll({
      where: { userId },
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'profilePicture', 'isVerified'] }],
      order: [['createdAt', 'DESC']],
      offset,
      limit: parseInt(limit)
    });

    res.json(reels);
  } catch (error) {
    console.error('Get user reels error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single reel
router.get('/:id', auth, async (req, res) => {
  try {
    const reel = await Reel.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'profilePicture', 'isVerified'] },
        { 
          model: Comment, 
          as: 'comments',
          include: [{ model: User, as: 'user', attributes: ['id', 'username', 'profilePicture'] }]
        },
        { model: Like, as: 'likes' }
      ]
    });

    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    // Increment view count
    await reel.increment('views');

    res.json(reel);
  } catch (error) {
    console.error('Get reel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike reel
router.put('/:id/like', auth, async (req, res) => {
  try {
    const reel = await Reel.findByPk(req.params.id);
    
    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    const existingLike = await Like.findOne({
      where: { userId: req.user.id, reelId: req.params.id }
    });

    if (existingLike) {
      await existingLike.destroy();
      const likeCount = await Like.count({ where: { reelId: req.params.id } });
      res.json({ likes: likeCount, isLiked: false });
    } else {
      await Like.create({ userId: req.user.id, reelId: req.params.id });
      const likeCount = await Like.count({ where: { reelId: req.params.id } });
      res.json({ likes: likeCount, isLiked: true });
    }
  } catch (error) {
    console.error('Like reel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Comment on reel
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const reel = await Reel.findByPk(req.params.id);
    
    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    if (reel.commentsDisabled) {
      return res.status(403).json({ message: 'Comments are disabled for this reel' });
    }

    const comment = await Comment.create({
      userId: req.user.id,
      reelId: req.params.id,
      text
    });

    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'profilePicture'] }]
    });

    res.json(commentWithUser);
  } catch (error) {
    console.error('Comment on reel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Share reel
router.post('/:id/share', auth, async (req, res) => {
  try {
    const reel = await Reel.findByPk(req.params.id);
    
    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    await reel.increment('shares');

    res.json({ message: 'Reel shared', shares: reel.shares + 1 });
  } catch (error) {
    console.error('Share reel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create remix/duet
router.post('/:id/remix', auth, upload.single('video'), async (req, res) => {
  try {
    const originalReel = await Reel.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['username'] }]
    });
    
    if (!originalReel) {
      return res.status(404).json({ message: 'Original reel not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Video file is required' });
    }

    // Upload new video
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'video',
      eager: [
        { width: 300, height: 300, crop: 'thumb', gravity: 'center', format: 'jpg' }
      ]
    });

    const { caption, hashtags } = req.body;

    const remixReel = await Reel.create({
      userId: req.user.id,
      videoUrl: result.secure_url,
      videoThumbnail: result.eager[0].secure_url,
      videoDuration: result.duration,
      caption: caption || `Remix of @${originalReel.user.username}'s reel`,
      hashtags: hashtags ? JSON.parse(hashtags) : [],
      audio: originalReel.audio,
      isOriginalAudio: false,
      audience: 'public',
      originalReelId: originalReel.id
    });

    const remixWithUser = await Reel.findByPk(remixReel.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'profilePicture', 'isVerified'] }]
    });

    res.status(201).json(remixWithUser);
  } catch (error) {
    console.error('Create remix error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get trending audio
router.get('/audio/trending', auth, async (req, res) => {
  try {
    const { sequelize } = require('../models');
    const trendingAudio = await Reel.findAll({
      where: {
        audio: { [Op.ne]: null }
      },
      attributes: [
        'audio',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['audio'],
      order: [[sequelize.literal('count'), 'DESC']],
      limit: 20
    });

    res.json(trendingAudio);
  } catch (error) {
    console.error('Get trending audio error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete reel
router.delete('/:id', auth, async (req, res) => {
  try {
    const reel = await Reel.findByPk(req.params.id);
    
    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    if (reel.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await reel.destroy();
    res.json({ message: 'Reel deleted' });
  } catch (error) {
    console.error('Delete reel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle comments on reel
router.put('/:id/comments/toggle', auth, async (req, res) => {
  try {
    const reel = await Reel.findByPk(req.params.id);
    
    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    if (reel.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    reel.commentsDisabled = !reel.commentsDisabled;
    await reel.save();

    res.json({ 
      message: `Comments ${reel.commentsDisabled ? 'disabled' : 'enabled'}`,
      commentsDisabled: reel.commentsDisabled 
    });
  } catch (error) {
    console.error('Toggle comments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
