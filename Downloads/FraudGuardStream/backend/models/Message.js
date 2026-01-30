/*
 * Instagram Clone - Message & Conversation Models (Sequelize)
 * Created by Phumeh
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  isGroup: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  groupName: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  groupImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lastMessageId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'conversations',
  timestamps: true
});

const ConversationParticipant = sequelize.define('ConversationParticipant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  conversationId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isMuted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isArchived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'conversation_participants',
  timestamps: true
});

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  conversationId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('text', 'image', 'video', 'voice', 'gif', 'sticker', 'post', 'reel', 'story', 'location', 'contact'),
    defaultValue: 'text'
  },
  content: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  unsent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  unsentAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  replyToId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'messages',
  timestamps: true
});

const MessageRead = sequelize.define('MessageRead', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  messageId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  readAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'message_reads',
  timestamps: false
});

module.exports = { Conversation, ConversationParticipant, Message, MessageRead };
