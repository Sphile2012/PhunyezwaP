/*
 * Instagram Clone - Story Model
 * Cloned by Phumeh
 */

const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['photo', 'video'],
    required: true
  },
  media: {
    url: {
      type: String,
      required: true
    },
    thumbnail: String
  },
  text: {
    content: String,
    color: String,
    font: String,
    size: Number,
    position: {
      x: Number,
      y: Number
    }
  },
  stickers: [{
    type: {
      type: String,
      enum: ['poll', 'question', 'quiz', 'countdown', 'music', 'location', 'mention', 'hashtag']
    },
    content: mongoose.Schema.Types.Mixed,
    position: {
      x: Number,
      y: Number
    }
  }],
  music: {
    title: String,
    artist: String,
    url: String,
    startTime: Number,
    duration: Number
  },
  views: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  replies: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  audience: {
    type: String,
    enum: ['public', 'followers', 'close_friends'],
    default: 'followers'
  },
  isHighlighted: {
    type: Boolean,
    default: false
  },
  highlightCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Highlight'
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  }
}, {
  timestamps: true
});

// Auto-delete expired stories
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Story', storySchema);