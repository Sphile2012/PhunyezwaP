/*
 * Instagram Clone - Live Video Routes
 * Created by Phumeh
 */

const express = require('express');
const { User, Live, LiveViewer } = require('../models');
const { createNotification } = require('./notifications');
const auth = require('../middleware/auth');

const router = express.Router();

// Go live
router.post('/start', auth, async (req, res) => {
  try {
    const { title, visibility } = req.body;

    const live = await Live.create({
      userId: req.user.id,
      title: title || `${req.user.username}'s Live`,
      visibility: visibility || 'public'
    });

    const liveWithUser = await Live.findByPk(live.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'profilePicture', 'isVerified'] }]
    });

    // Notify followers
    req.io?.emit('user_went_live', {
      userId: req.user.id,
      username: req.user.username,
      liveId: live.id
    });

    res.status(201).json(liveWithUser);
  } catch (error) {
    console.error('Start live error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// End live
router.put('/:id/end', auth, async (req, res) => {
  try {
    const live = await Live.findByPk(req.params.id);

    if (!live) {
      return res.status(404).json({ message: 'Live not found' });
    }

    if (live.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    live.isActive = false;
    live.endedAt = new Date();
    live.duration = Math.floor((new Date() - live.startedAt) / 1000);
    await live.save();

    req.io?.emit('user_ended_live', {
      userId: req.user.id,
      liveId: live.id
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
    const live = await Live.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'profilePicture', 'isVerified'] }]
    });

    if (!live || !live.isActive) {
      return res.status(404).json({ message: 'Live not found or ended' });
    }

    const [viewer, created] = await LiveViewer.findOrCreate({
      where: { liveId: req.params.id, userId: req.user.id },
      defaults: { liveId: req.params.id, userId: req.user.id }
    });

    if (created) {
      const viewerCount = await LiveViewer.count({ where: { liveId: req.params.id } });
      if (viewerCount > live.peakViewers) {
        live.peakViewers = viewerCount;
        await live.save();
      }
    }

    res.json(live);
  } catch (error) {
    console.error('Join live error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Leave live
router.put('/:id/leave', auth, async (req, res) => {
  try {
    await LiveViewer.destroy({
      where: { liveId: req.params.id, userId: req.user.id }
    });

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
    const live = await Live.findByPk(req.params.id);

    if (!live || !live.isActive) {
      return res.status(404).json({ message: 'Live not found or ended' });
    }

    const comments = live.comments || [];
    comments.push({
      userId: req.user.id,
      text,
      createdAt: new Date()
    });
    live.comments = comments;
    await live.save();

    req.io?.to(`live_${req.params.id}`).emit('live_comment', {
      user: { id: req.user.id, username: req.user.username },
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
    const live = await Live.findByPk(req.params.id);

    if (!live || !live.isActive) {
      return res.status(404).json({ message: 'Live not found or ended' });
    }

    await live.increment('likesCount');

    req.io?.to(`live_${req.params.id}`).emit('live_like', {
      userId: req.user.id,
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
    const lives = await Live.findAll({
      where: { isActive: true },
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'profilePicture', 'isVerified'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(lives);
  } catch (error) {
    console.error('Get active lives error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
