/*
 * Instagram Clone - Report Model
 * Created by Phumeh
 */

const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportType: {
    type: String,
    enum: ['user', 'post', 'reel', 'story', 'comment', 'message'],
    required: true
  },
  reportedItem: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'reportType'
  },
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reason: {
    type: String,
    enum: [
      'spam',
      'nudity',
      'hate_speech',
      'violence',
      'harassment',
      'false_information',
      'scam',
      'intellectual_property',
      'self_harm',
      'other'
    ],
    required: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'action_taken', 'dismissed'],
    default: 'pending'
  },
  reviewedAt: Date,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);
