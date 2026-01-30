/*
 * Instagram Clone - Like Model (Sequelize)
 * Created by Phumeh
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Like = sequelize.define('Like', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  commentId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  reelId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'likes',
  timestamps: true
});

module.exports = Like;
