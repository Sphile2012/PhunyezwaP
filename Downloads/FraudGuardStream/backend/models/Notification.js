/*
 * Instagram Clone - Notification Model
 * Cloned by Phumeh
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'like_post', 'like_comment', 'like_reel', 'like_story',
      'comment_post', 'comment_reel', 'reply_comment',
      'follow', 'follow_request', 'follow_accept',
      'mention_post', 'mention_comment', 'mention_story',
      'tag_post', 'tag_story',
      'share_post', 'share_reel', 'share_story',
      'story_view', 'live_start',
      'message', 'video_call', 'voice_call'
    ],
    required: true
  },
  content: {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    },
    reel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reel'
    },
    story: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Story'
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    },
    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    }
  },
  message: {
    type: String,
    maxlength: 200
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  actionUrl: String
}, {
  timestamps: true
});

// Index for efficient querying
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);