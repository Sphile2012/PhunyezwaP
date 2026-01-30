/*
 * Instagram Clone - Reels Routes
 * Cloned by Phumeh
 */

const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Reel = require('../models/Reel');
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

    const reel = new Reel({
      user: req.user._id,
      video: {
        url: result.secure_url,
        thumbnail: result.eager[0].secure_url,
        duration: result.duration
      },
      caption: caption || '',
      hashtags: hashtags ? JSON.parse(hashtags) : [],
      mentions: mentions ? JSON.parse(mentions) : [],
      audio: audio ? JSON.parse(audio) : undefined,
      effects: effects ? JSON.parse(effects) : [],
      audience: audience || 'public'
    });

    await reel.save();
    await reel.populate('user', 'username profilePicture isVerified');

    res.status(201).json(reel);
  } catch (error) {
    console.error('Create reel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reels feed (explore/trending)
router.get('/feed', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const reels = await Reel.find({ audience: 'public' })
      .populate('user', 'username profilePicture isVerified')
      .sort({ createdAt: -1, views: -1 }) // Sort by recent and popular
      .skip(skip)
      .limit(parseInt(limit));

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
    const skip = (page - 1) * limit;

    const reels = await Reel.find({ user: userId })
      .populate('user', 'username profilePicture isVerified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json(reels);
  } catch (error) {
    console.error('Get user reels error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single reel
router.get('/:id', auth, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id)
      .populate('user', 'username profilePicture isVerified')
      .populate('comments.user', 'username profilePicture')
      .populate('comments.replies.user', 'username profilePicture');

    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    // Increment view count
    reel.views += 1;
    await reel.save();

    res.json(reel);
  } catch (error) {
    console.error('Get reel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike reel
router.put('/:id/like', auth, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    
    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    const isLiked = reel.likes.some(
      like => like.user.toString() === req.user._id.toString()
    );

    if (isLiked) {
      reel.likes = reel.likes.filter(
        like => like.user.toString() !== req.user._id.toString()
      );
    } else {
      reel.likes.push({ user: req.user._id });
    }

    await reel.save();
    res.json({ likes: reel.likes.length, isLiked: !isLiked });
  } catch (error) {
    console.error('Like reel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Comment on reel
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const reel = await Reel.findById(req.params.id);
    
    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    if (reel.commentsDisabled) {
      return res.status(403).json({ message: 'Comments are disabled for this reel' });
    }

    const comment = {
      user: req.user._id,
      text,
      likes: [],
      replies: []
    };

    reel.comments.push(comment);
    await reel.save();
    await reel.populate('comments.user', 'username profilePicture');

    const newComment = reel.comments[reel.comments.length - 1];
    res.json(newComment);
  } catch (error) {
    console.error('Comment on reel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Share reel
router.post('/:id/share', auth, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    
    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    const alreadyShared = reel.shares.some(
      share => share.user.toString() === req.user._id.toString()
    );

    if (!alreadyShared) {
      reel.shares.push({ user: req.user._id });
      await reel.save();
    }

    res.json({ message: 'Reel shared', shares: reel.shares.length });
  } catch (error) {
    console.error('Share reel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create remix/duet
router.post('/:id/remix', auth, upload.single('video'), async (req, res) => {
  try {
    const originalReel = await Reel.findById(req.params.id);
    
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

    const remixReel = new Reel({
      user: req.user._id,
      video: {
        url: result.secure_url,
        thumbnail: result.eager[0].secure_url,
        duration: result.duration
      },
      caption: caption || `Remix of @${originalReel.user.username}'s reel`,
      hashtags: hashtags ? JSON.parse(hashtags) : [],
      audio: originalReel.audio, // Use original audio
      isOriginalAudio: false,
      audience: 'public'
    });

    await remixReel.save();

    // Add to original reel's remixes
    originalReel.remixes.push({
      user: req.user._id,
      reel: remixReel._id
    });
    await originalReel.save();

    await remixReel.populate('user', 'username profilePicture isVerified');
    res.status(201).json(remixReel);
  } catch (error) {
    console.error('Create remix error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get trending audio
router.get('/audio/trending', auth, async (req, res) => {
  try {
    const trendingAudio = await Reel.aggregate([
      { $match: { 'audio.title': { $exists: true } } },
      {
        $group: {
          _id: '$audio.title',
          count: { $sum: 1 },
          audio: { $first: '$audio' },
          recentReel: { $first: '$_id' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    res.json(trendingAudio);
  } catch (error) {
    console.error('Get trending audio error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete reel
router.delete('/:id', auth, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    
    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    if (reel.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Reel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Reel deleted' });
  } catch (error) {
    console.error('Delete reel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle comments on reel
router.put('/:id/comments/toggle', auth, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    
    if (!reel) {
      return res.status(404).json({ message: 'Reel not found' });
    }

    if (reel.user.toString() !== req.user._id.toString()) {
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