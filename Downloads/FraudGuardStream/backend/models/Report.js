/*
 * Instagram Clone - Report Model (Sequelize)
 * Created by Phumeh
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  reporterId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  reportedUserId: {
    type: DataTypes.INTEGER,
    allowNull: true
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
  messageId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  reason: {
    type: DataTypes.ENUM('spam', 'harassment', 'hate_speech', 'violence', 'nudity', 'false_information', 'scam', 'self_harm', 'other'),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'reviewing', 'resolved', 'dismissed'),
    defaultValue: 'pending'
  },
  resolution: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'reports',
  timestamps: true
});

module.exports = Report;
