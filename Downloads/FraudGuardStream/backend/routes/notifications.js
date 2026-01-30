/*
 * Instagram Clone - Notifications Routes
 * Cloned by Phumeh
 */

const express = require('express');
const { User, Notification } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user notifications
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50, type } = req.query;
    const offset = (page - 1) * limit;

    const where = { recipientId: req.user.id };
    if (type) {
      where.type = type;
    }

    const notifications = await Notification.findAll({
      where,
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username', 'fullName', 'profilePicture', 'isVerified'] }
      ],
      order: [['createdAt', 'DESC']],
      offset,
      limit: parseInt(limit)
    });

    // Mark notifications as read when fetched
    await Notification.update(
      { isRead: true, readAt: new Date() },
      { where: { recipientId: req.user.id, isRead: false } }
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
    const count = await Notification.count({
      where: {
        recipientId: req.user.id,
        isRead: false
      }
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
    const [updatedCount, [notification]] = await Notification.update(
      { isRead: true, readAt: new Date() },
      { 
        where: { id: req.params.id, recipientId: req.user.id },
        returning: true
      }
    );

    if (updatedCount === 0) {
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
    await Notification.update(
      { isRead: true, readAt: new Date() },
      { where: { recipientId: req.user.id, isRead: false } }
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
    const deletedCount = await Notification.destroy({
      where: { id: req.params.id, recipientId: req.user.id }
    });

    if (deletedCount === 0) {
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
    if (recipientId === senderId) {
      return;
    }

    // Check if recipient allows this type of notification
    const recipient = await User.findByPk(recipientId);
    if (!recipient || !recipient.isActive) {
      return;
    }

    const notification = await Notification.create({
      recipientId,
      senderId,
      type,
      content,
      message
    });

    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
  }
};

// Notification settings
router.get('/settings', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['notificationSettings']
    });
    
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

    res.json(user?.notificationSettings || defaultSettings);
  } catch (error) {
    console.error('Get notification settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update notification settings
router.put('/settings', auth, async (req, res) => {
  try {
    const settings = req.body;
    
    await User.update(
      { notificationSettings: settings },
      { where: { id: req.user.id } }
    );

    res.json({ message: 'Notification settings updated', settings });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = { router, createNotification };
