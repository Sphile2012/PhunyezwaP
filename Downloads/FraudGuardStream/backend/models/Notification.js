/*
 * Instagram Clone - Notification Model (Sequelize)
 * Created by Phumeh
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fromUserId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('like', 'comment', 'follow', 'mention', 'tag', 'story_mention', 'live', 'message', 'follow_request'),
    allowNull: false
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  reelId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  storyId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  commentId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  message: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'notifications',
  timestamps: true
});

module.exports = Notification;
