/*
 * Instagram Clone - Post Model (Sequelize)
 * Created by Phumeh
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Post = sequelize.define('Post', {
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
    type: DataTypes.ENUM('photo', 'video', 'carousel'),
    defaultValue: 'photo'
  },
  media: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  caption: {
    type: DataTypes.STRING(2200),
    defaultValue: ''
  },
  hashtags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  locationName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  locationLat: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  locationLng: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  isArchived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  commentsDisabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  hideLikeCount: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  audience: {
    type: DataTypes.ENUM('public', 'followers', 'close_friends'),
    defaultValue: 'public'
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'posts',
  timestamps: true
});

module.exports = Post;
