/*
 * Instagram Clone - Messages/DM Routes
 * Cloned by Phumeh
 */

const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { User, Conversation, ConversationParticipant, Message, MessageRead } = require('../models');
const { Op } = require('sequelize');
const auth = require('../middleware/auth');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Get all conversations for user
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Conversation.findAll({
      include: [
        {
          model: ConversationParticipant,
          as: 'conversationParticipants',
          where: {
            userId: req.user.id,
            deletedAt: null
          },
          required: true
        },
        {
          model: ConversationParticipant,
          as: 'allParticipants',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'fullName', 'profilePicture', 'isVerified']
            }
          ]
        },
        {
          model: Message,
          as: 'lastMessage',
          include: [
            {
              model: User,
              as: 'sender',
              attributes: ['id', 'username', 'profilePicture']
            }
          ]
        }
      ],
      order: [['updatedAt', 'DESC']]
    });

    // Filter out archived conversations unless requested
    const activeConversations = conversations.filter(conv => {
      const userParticipant = conv.conversationParticipants.find(p => p.userId === req.user.id);
      return !userParticipant?.archivedAt;
    });

    // Transform to match expected API format
    const formattedConversations = activeConversations.map(conv => ({
      id: conv.id,
      isGroup: conv.isGroup,
      groupName: conv.groupName,
      participants: conv.allParticipants.map(p => p.user),
      lastMessage: conv.lastMessage,
      updatedAt: conv.updatedAt,
      createdAt: conv.createdAt
    }));

    res.json(formattedConversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get or create conversation
router.post('/conversations', auth, async (req, res) => {
  try {
    const { participantIds, isGroup, groupName } = req.body;
    
    const allParticipantIds = [req.user.id, ...participantIds];
    
    if (!isGroup && allParticipantIds.length === 2) {
      // Check if conversation already exists (non-group with exactly these 2 participants)
      const existingConversations = await Conversation.findAll({
        where: { isGroup: false },
        include: [
          {
            model: ConversationParticipant,
            as: 'allParticipants'
          }
        ]
      });

      const existingConversation = existingConversations.find(conv => {
        const participantUserIds = conv.allParticipants.map(p => p.userId);
        return participantUserIds.length === 2 &&
          allParticipantIds.every(id => participantUserIds.includes(id));
      });

      if (existingConversation) {
        await existingConversation.reload({
          include: [
            {
              model: ConversationParticipant,
              as: 'allParticipants',
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['id', 'username', 'fullName', 'profilePicture', 'isVerified']
                }
              ]
            }
          ]
        });

        return res.json({
          id: existingConversation.id,
          isGroup: existingConversation.isGroup,
          groupName: existingConversation.groupName,
          participants: existingConversation.allParticipants.map(p => p.user),
          updatedAt: existingConversation.updatedAt,
          createdAt: existingConversation.createdAt
        });
      }
    }

    const conversation = await Conversation.create({
      isGroup: isGroup || false,
      groupName: groupName || null
    });

    // Create participant entries
    const participantPromises = allParticipantIds.map(userId =>
      ConversationParticipant.create({
        conversationId: conversation.id,
        userId,
        isAdmin: isGroup && userId === req.user.id
      })
    );
    await Promise.all(participantPromises);

    // Reload with participants
    await conversation.reload({
      include: [
        {
          model: ConversationParticipant,
          as: 'allParticipants',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'fullName', 'profilePicture', 'isVerified']
            }
          ]
        }
      ]
    });

    res.status(201).json({
      id: conversation.id,
      isGroup: conversation.isGroup,
      groupName: conversation.groupName,
      participants: conversation.allParticipants.map(p => p.user),
      updatedAt: conversation.updatedAt,
      createdAt: conversation.createdAt
    });
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
    const offset = (page - 1) * limit;

    // Verify user is participant
    const participant = await ConversationParticipant.findOne({
      where: {
        conversationId: id,
        userId: req.user.id
      }
    });

    if (!participant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.findAll({
      where: {
        conversationId: id,
        [Op.or]: [
          { deletedForUserIds: { [Op.not]: { [Op.contains]: [req.user.id] } } },
          { deletedForUserIds: null }
        ]
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'profilePicture']
        },
        {
          model: Message,
          as: 'replyTo',
          include: [
            {
              model: User,
              as: 'sender',
              attributes: ['id', 'username', 'profilePicture']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      offset,
      limit: parseInt(limit)
    });

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
    const participant = await ConversationParticipant.findOne({
      where: {
        conversationId: id,
        userId: req.user.id
      }
    });

    if (!participant) {
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

    const message = await Message.create({
      conversationId: id,
      senderId: req.user.id,
      type: type || 'text',
      content,
      replyToId: replyToId || null
    });

    // Update conversation's lastMessageId
    await Conversation.update(
      { lastMessageId: message.id },
      { where: { id } }
    );

    // Mark as delivered to all other participants
    const otherParticipants = await ConversationParticipant.findAll({
      where: {
        conversationId: id,
        userId: { [Op.ne]: req.user.id }
      }
    });

    const deliveryPromises = otherParticipants.map(p =>
      MessageRead.create({
        messageId: message.id,
        userId: p.userId,
        deliveredAt: new Date()
      })
    );
    await Promise.all(deliveryPromises);

    // Reload with sender
    await message.reload({
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'profilePicture']
        }
      ]
    });

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

    // Get all unread messages in conversation not sent by user
    const unreadMessages = await Message.findAll({
      where: {
        conversationId: id,
        senderId: { [Op.ne]: req.user.id }
      },
      include: [
        {
          model: MessageRead,
          as: 'messageReads',
          where: {
            userId: req.user.id,
            readAt: null
          },
          required: false
        }
      ]
    });

    const updatePromises = unreadMessages.map(async (message) => {
      const existingRead = message.messageReads?.find(r => r.userId === req.user.id);
      if (existingRead) {
        return existingRead.update({ readAt: new Date() });
      } else {
        return MessageRead.create({
          messageId: message.id,
          userId: req.user.id,
          readAt: new Date()
        });
      }
    });

    await Promise.all(updatePromises);

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

    const message = await Message.findByPk(id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Get current reactions and update
    let reactions = message.reactions || [];
    
    // Remove existing reaction from this user
    reactions = reactions.filter(
      reaction => reaction.userId !== req.user.id
    );

    // Add new reaction if emoji provided
    if (emoji) {
      reactions.push({
        userId: req.user.id,
        emoji,
        createdAt: new Date()
      });
    }

    await message.update({ reactions });
    res.json(reactions);
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

    const message = await Message.findByPk(id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (deleteForEveryone && message.senderId === req.user.id) {
      // Delete for everyone (unsend)
      await message.update({
        unsent: true,
        unsentAt: new Date(),
        content: { text: 'This message was deleted' }
      });
    } else {
      // Delete for self only
      const deletedForUserIds = message.deletedForUserIds || [];
      if (!deletedForUserIds.includes(req.user.id)) {
        deletedForUserIds.push(req.user.id);
        await message.update({ deletedForUserIds });
      }
    }

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

    const participant = await ConversationParticipant.findOne({
      where: {
        conversationId: id,
        userId: req.user.id
      }
    });

    if (!participant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await participant.update({ archivedAt: new Date() });

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

    const participant = await ConversationParticipant.findOne({
      where: {
        conversationId: id,
        userId: req.user.id
      }
    });

    if (!participant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (duration) {
      const mutedUntil = new Date(Date.now() + duration * 60 * 60 * 1000);
      await participant.update({ mutedUntil });
    } else {
      await participant.update({ mutedUntil: null });
    }

    res.json({ message: duration ? 'Conversation muted' : 'Conversation unmuted' });
  } catch (error) {
    console.error('Mute conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
