/*
 * Instagram Clone - Collection Model (Saved Posts)
 * Created by Phumeh
 */

const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    maxlength: 50
  },
  coverImage: String,
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  reels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reel'
  }],
  isPrivate: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Collection', collectionSchema);
