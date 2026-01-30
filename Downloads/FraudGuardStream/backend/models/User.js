/*
 * Instagram Clone - User Model (Sequelize)
 * Created by Phumeh
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fullName: {
    type: DataTypes.STRING(50),
    defaultValue: ''
  },
  profilePicture: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  bio: {
    type: DataTypes.STRING(150),
    defaultValue: ''
  },
  website: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  isPrivate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  accountType: {
    type: DataTypes.ENUM('personal', 'business', 'creator'),
    defaultValue: 'personal'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastSeen: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  notificationSettings: {
    type: DataTypes.JSON,
    defaultValue: {
      likes: true,
      comments: true,
      follows: true,
      mentions: true,
      directMessages: true,
      liveVideos: true,
      reminders: true,
      emailNotifications: false,
      pushNotifications: true
    }
  }
}, {
  tableName: 'users',
  timestamps: true
});

module.exports = User;
