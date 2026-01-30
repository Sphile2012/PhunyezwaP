/*
 * Instagram Clone - Reel Model
 * Cloned by Phumeh
 */

const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  video: {
    url: {
      type: String,
      required: true
    },
    thumbnail: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      required: true
    }
  },
  audio: {
    title: String,
    artist: String,
    url: String,
    originalReel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reel'
    }
  },
  caption: {
    type: String,
    default: '',
    maxlength: 2200
  },
  hashtags: [{
    type: String,
    trim: true
  }],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  effects: [{
    name: String,
    id: String
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
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      maxlength: 500
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    replies: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      text: {
        type: String,
        required: true
      },
      likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  shares: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  plays: {
    type: Number,
    default: 0
  },
  remixes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reel'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isOriginalAudio: {
    type: Boolean,
    default: true
  },
  commentsDisabled: {
    type: Boolean,
    default: false
  },
  audience: {
    type: String,
    enum: ['public', 'followers'],
    default: 'public'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Reel', reelSchema);