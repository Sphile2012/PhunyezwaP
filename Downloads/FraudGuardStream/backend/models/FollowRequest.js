/*
 * Instagram Clone - Follow Request Model
 * Created by Phumeh
 */

const mongoose = require('mongoose');

const followRequestSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  }
}, {
  timestamps: true
});

followRequestSchema.index({ from: 1, to: 1 }, { unique: true });

module.exports = mongoose.model('FollowRequest', followRequestSchema);
