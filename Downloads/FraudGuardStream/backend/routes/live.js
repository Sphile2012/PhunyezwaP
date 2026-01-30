/*
 * Instagram Clone - Live Video Routes
 * Created by Phumeh
 */

const express = require('express');
const Live = require('../models/Live');
const { createNotification } = require('./notifications');
const auth = require('../middleware/auth');

const router = express.Router();

// Go live
router.post('/start', auth, async (req, res) => {
  try {
    const { title, visibility } = req.body;

    const live = new Live({
      user: req.user._id,
      title: title || `${req.user.username}'s Live`,
      visibility: visibility || 'public'
    });

    await live.save();
    await live.populate('user', 'username profilePicture isVerified');

    // Notify followers
    req.io?.emit('user_went_live', {
      userId: req.user._id,
      username: req.user.username,
      liveId: live._id
    });

    res.status(201).json(live);
  } catch (error) {
    console.error('Start live error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// End live
router.put('/:id/end', auth, async (req, res) => {
  try {
    const live = await Live.findById(req.params.id);

    if (!live) {
      return res.status(404).json({ message: 'Live not found' });
    }

    if (live.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    live.isActive = false;
    live.endedAt = new Date();
    live.duration = Math.floor((new Date() - live.startedAt) / 1000);
    await live.save();

    req.io?.emit('user_ended_live', {
      userId: req.user._id,
      liveId: live._id
    });

    res.json({ message: 'Live ended', duration: live.duration });
  } catch (error) {
    console.error('End live error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join live
router.put('/:id/join', auth, async (req, res) => {
  try {
    const live = await Live.findById(req.params.id);

    if (!live || !live.isActive) {
      return res.status(404).json({ message: 'Live not found or ended' });
    }

    const alreadyViewing = live.viewers.some(
      v => v.user.toString() === req.user._id.toString()
    );

    if (!alreadyViewing) {
      live.viewers.push({ user: req.user._id });
      if (live.viewers.length > live.peakViewers) {
        live.peakViewers = live.viewers.length;
      }
      await live.save();
    }

    await live.populate('user', 'username profilePicture isVerified');
    res.json(live);
  } catch (error) {
    console.error('Join live error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Leave live
router.put('/:id/leave', auth, async (req, res) => {
  try {
    const live = await Live.findById(req.params.id);

    if (live) {
      live.viewers = live.viewers.filter(
        v => v.user.toString() !== req.user._id.toString()
      );
      await live.save();
    }

    res.json({ message: 'Left live' });
  } catch (error) {
    console.error('Leave live error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Comment on live
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const live = await Live.findById(req.params.id);

    if (!live || !live.isActive) {
      return res.status(404).json({ message: 'Live not found or ended' });
    }

    const comment = {
      user: req.user._id,
      text
    };

    live.comments.push(comment);
    await live.save();

    req.io?.to(`live_${req.params.id}`).emit('live_comment', {
      user: { _id: req.user._id, username: req.user.username },
      text,
      createdAt: new Date()
    });

    res.json({ message: 'Comment added' });
  } catch (error) {
    console.error('Live comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like live
router.post('/:id/like', auth, async (req, res) => {
  try {
    const live = await Live.findById(req.params.id);

    if (!live || !live.isActive) {
      return res.status(404).json({ message: 'Live not found or ended' });
    }

    live.likes.push({ user: req.user._id });
    await live.save();

    req.io?.to(`live_${req.params.id}`).emit('live_like', {
      userId: req.user._id,
      username: req.user.username
    });

    res.json({ message: 'Liked' });
  } catch (error) {
    console.error('Like live error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get active lives
router.get('/active', auth, async (req, res) => {
  try {
    const lives = await Live.find({ isActive: true })
      .populate('user', 'username profilePicture isVerified')
      .sort({ 'viewers.length': -1, createdAt: -1 });

    res.json(lives);
  } catch (error) {
    console.error('Get active lives error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
