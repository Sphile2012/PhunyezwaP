/*
 * Instagram Clone - Live Model (Sequelize)
 * Created by Phumeh
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Live = sequelize.define('Live', {
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
    type: DataTypes.STRING(100),
    allowNull: true
  },
  streamKey: {
    type: DataTypes.STRING,
    allowNull: true
  },
  streamUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  thumbnail: {
    type: DataTypes.STRING,
    allowNull: true
  },
  viewerCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  peakViewers: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'live', 'ended'),
    defaultValue: 'live'
  },
  scheduledFor: {
    type: DataTypes.DATE,
    allowNull: true
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  audience: {
    type: DataTypes.ENUM('public', 'followers', 'close_friends'),
    defaultValue: 'public'
  }
}, {
  tableName: 'lives',
  timestamps: true
});

const LiveViewer = sequelize.define('LiveViewer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  liveId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  joinedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  leftAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'live_viewers',
  timestamps: false
});

module.exports = { Live, LiveViewer };
