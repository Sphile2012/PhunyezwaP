/*
 * Instagram Clone - Highlight Model (Sequelize)
 * Created by Phumeh
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Highlight = sequelize.define('Highlight', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  coverImage: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'highlights',
  timestamps: true
});

const HighlightStory = sequelize.define('HighlightStory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  highlightId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  storyId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'highlight_stories',
  timestamps: true
});

module.exports = { Highlight, HighlightStory };
