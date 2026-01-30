/*
 * Instagram Clone - Reel Model (Sequelize)
 * Created by Phumeh
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reel = sequelize.define('Reel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  videoUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  thumbnail: {
    type: DataTypes.STRING,
    allowNull: true
  },
  caption: {
    type: DataTypes.STRING(2200),
    defaultValue: ''
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  music: {
    type: DataTypes.JSON,
    allowNull: true
  },
  hashtags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  mentions: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  shares: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  commentsDisabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  audience: {
    type: DataTypes.ENUM('public', 'followers'),
    defaultValue: 'public'
  }
}, {
  tableName: 'reels',
  timestamps: true
});

module.exports = Reel;
