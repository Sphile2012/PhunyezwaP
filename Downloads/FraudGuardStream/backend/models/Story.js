/*
 * Instagram Clone - Story Model (Sequelize)
 * Created by Phumeh
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Story = sequelize.define('Story', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('image', 'video'),
    defaultValue: 'image'
  },
  mediaUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  thumbnail: {
    type: DataTypes.STRING,
    allowNull: true
  },
  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 5
  },
  caption: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  music: {
    type: DataTypes.JSON,
    allowNull: true
  },
  stickers: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  mentions: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  hashtags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  locationName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  audience: {
    type: DataTypes.ENUM('public', 'followers', 'close_friends'),
    defaultValue: 'followers'
  },
  isHighlight: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'stories',
  timestamps: true
});

const StoryView = sequelize.define('StoryView', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  storyId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'story_views',
  timestamps: true
});

module.exports = { Story, StoryView };
