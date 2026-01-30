/*
 * Instagram Clone - Notifications Routes
 * Cloned by Phumeh
 */

const express = require('express');
const Notification = require('../models/Notification');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user notifications
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50, type } = req.query;
    const skip = (page - 1) * limit;

    let query = { recipient: req.user._id };
    if (type) {
      query.type = type;
    }

    const notifications = await Notification.find(query)
      .populate('sender', 'username fullName profilePicture isVerified')
      .populate('content.post', 'media')
      .populate('content.reel', 'video')
      .populate('content.story', 'media')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Mark notifications as read when fetched
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unread notification count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark all notifications as read
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to create notification
const createNotification = async (recipientId, senderId, type, content = {}, message = '') => {
  try {
    // Don't send notification to self
    if (recipientId.toString() === senderId.toString()) {
      return;
    }

    // Check if recipient allows this type of notification
    const recipient = await User.findById(recipientId);
    if (!recipient || !recipient.isActive) {
      return;
    }

    const notification = new Notification({
      recipient: recipientId,
      sender: senderId,
      type,
      content,
      message
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
  }
};

// Notification settings
router.get('/settings', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notificationSettings');
    
    const defaultSettings = {
      likes: true,
      comments: true,
      follows: true,
      mentions: true,
      directMessages: true,
      liveVideos: true,
      reminders: true,
      emailNotifications: false,
      pushNotifications: true
    };

    res.json(user.notificationSettings || defaultSettings);
  } catch (error) {
    console.error('Get notification settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update notification settings
router.put('/settings', auth, async (req, res) => {
  try {
    const settings = req.body;
    
    await User.findByIdAndUpdate(
      req.user._id,
      { notificationSettings: settings },
      { new: true }
    );

    res.json({ message: 'Notification settings updated', settings });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = { router, createNotification };