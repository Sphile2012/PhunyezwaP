/*
 * Instagram Clone - Messages/DM Routes
 * Cloned by Phumeh
 */

const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { Conversation, Message } = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Get all conversations for user
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
      deletedBy: { $ne: req.user._id }
    })
    .populate('participants', 'username fullName profilePicture isVerified')
    .populate('lastMessage')
    .populate('lastMessage.sender', 'username profilePicture')
    .sort({ updatedAt: -1 });

    // Filter out archived conversations unless requested
    const activeConversations = conversations.filter(conv => 
      !conv.archivedBy.includes(req.user._id)
    );

    res.json(activeConversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get or create conversation
router.post('/conversations', auth, async (req, res) => {
  try {
    const { participantIds, isGroup, groupName } = req.body;
    
    let participants = [req.user._id, ...participantIds];
    
    if (!isGroup && participants.length === 2) {
      // Check if conversation already exists
      const existingConversation = await Conversation.findOne({
        participants: { $all: participants, $size: 2 },
        isGroup: false
      });

      if (existingConversation) {
        return res.json(existingConversation);
      }
    }

    const conversation = new Conversation({
      participants,
      isGroup: isGroup || false,
      groupName: groupName || null,
      admins: isGroup ? [req.user._id] : []
    });

    await conversation.save();
    await conversation.populate('participants', 'username fullName profilePicture isVerified');

    res.status(201).json(conversation);
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages in conversation
router.get('/conversations/:id/messages', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    // Verify user is participant
    const conversation = await Conversation.findById(id);
    if (!conversation || !conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.find({
      conversation: id,
      deletedBy: { $ne: req.user._id }
    })
    .populate('sender', 'username profilePicture')
    .populate('replyTo')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    res.json(messages.reverse());
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message
router.post('/conversations/:id/messages', auth, upload.single('media'), async (req, res) => {
  try {
    const { id } = req.params;
    const { type, text, replyToId } = req.body;

    // Verify user is participant
    const conversation = await Conversation.findById(id);
    if (!conversation || !conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let content = { text };

    // Handle media upload
    if (req.file && ['image', 'video', 'voice'].includes(type)) {
      const resourceType = type === 'voice' ? 'video' : type;
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: resourceType,
        folder: 'instagram-messages'
      });

      content.media = {
        url: result.secure_url,
        thumbnail: result.eager?.[0]?.secure_url || result.secure_url,
        duration: result.duration || null
      };
    }

    const message = new Message({
      conversation: id,
      sender: req.user._id,
      type: type || 'text',
      content,
      replyTo: replyToId || null
    });

    await message.save();
    await message.populate('sender', 'username profilePicture');

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.updatedAt = new Date();
    await conversation.save();

    // Mark as delivered to all participants
    const deliveredTo = conversation.participants
      .filter(p => p.toString() !== req.user._id.toString())
      .map(p => ({ user: p, deliveredAt: new Date() }));
    
    message.deliveredTo = deliveredTo;
    await message.save();

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark messages as read
router.put('/conversations/:id/read', auth, async (req, res) => {
  try {
    const { id } = req.params;

    await Message.updateMany(
      {
        conversation: id,
        sender: { $ne: req.user._id },
        'readBy.user': { $ne: req.user._id }
      },
      {
        $push: {
          readBy: {
            user: req.user._id,
            readAt: new Date()
          }
        }
      }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// React to message
router.post('/messages/:id/react', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Remove existing reaction from this user
    message.reactions = message.reactions.filter(
      reaction => reaction.user.toString() !== req.user._id.toString()
    );

    // Add new reaction if emoji provided
    if (emoji) {
      message.reactions.push({
        user: req.user._id,
        emoji,
        createdAt: new Date()
      });
    }

    await message.save();
    res.json(message.reactions);
  } catch (error) {
    console.error('React to message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete message
router.delete('/messages/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { deleteForEveryone } = req.body;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (deleteForEveryone && message.sender.toString() === req.user._id.toString()) {
      // Delete for everyone (unsend)
      message.unsent = true;
      message.unsentAt = new Date();
      message.content = { text: 'This message was deleted' };
    } else {
      // Delete for self only
      if (!message.deletedBy.includes(req.user._id)) {
        message.deletedBy.push(req.user._id);
      }
    }

    await message.save();
    res.json({ message: 'Message deleted' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Archive conversation
router.put('/conversations/:id/archive', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const conversation = await Conversation.findById(id);
    if (!conversation || !conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!conversation.archivedBy.includes(req.user._id)) {
      conversation.archivedBy.push(req.user._id);
      await conversation.save();
    }

    res.json({ message: 'Conversation archived' });
  } catch (error) {
    console.error('Archive conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mute conversation
router.put('/conversations/:id/mute', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { duration } = req.body; // in hours, null for unmute

    const conversation = await Conversation.findById(id);
    if (!conversation || !conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Remove existing mute
    conversation.mutedBy = conversation.mutedBy.filter(
      mute => mute.user.toString() !== req.user._id.toString()
    );

    // Add new mute if duration provided
    if (duration) {
      const mutedUntil = new Date(Date.now() + duration * 60 * 60 * 1000);
      conversation.mutedBy.push({
        user: req.user._id,
        mutedUntil
      });
    }

    await conversation.save();
    res.json({ message: duration ? 'Conversation muted' : 'Conversation unmuted' });
  } catch (error) {
    console.error('Mute conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;