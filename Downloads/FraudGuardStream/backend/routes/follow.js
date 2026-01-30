/*
 * Instagram Clone - Follow Request Routes
 * Created by Phumeh
 */

const express = require('express');
const FollowRequest = require('../models/FollowRequest');
const User = require('../models/User');
const { createNotification } = require('./notifications');
const auth = require('../middleware/auth');

const router = express.Router();

// Send follow request
router.post('/request/:userId', auth, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.userId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.params.userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    // Check if already following
    if (targetUser.followers.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already following' });
    }

    // If public account, follow directly
    if (!targetUser.isPrivate) {
      targetUser.followers.push(req.user._id);
      await targetUser.save();

      const currentUser = await User.findById(req.user._id);
      currentUser.following.push(req.params.userId);
      await currentUser.save();

      await createNotification(
        req.params.userId,
        req.user._id,
        'follow',
        {},
        `${req.user.username} started following you`
      );

      return res.json({ message: 'Now following', isFollowing: true });
    }

    // Check existing request
    const existingRequest = await FollowRequest.findOne({
      from: req.user._id,
      to: req.params.userId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Request already sent' });
    }

    const request = new FollowRequest({
      from: req.user._id,
      to: req.params.userId
    });

    await request.save();

    await createNotification(
      req.params.userId,
      req.user._id,
      'follow_request',
      {},
      `${req.user.username} requested to follow you`
    );

    res.json({ message: 'Follow request sent', isRequested: true });
  } catch (error) {
    console.error('Follow request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pending follow requests
router.get('/requests', auth, async (req, res) => {
  try {
    const requests = await FollowRequest.find({
      to: req.user._id,
      status: 'pending'
    })
    .populate('from', 'username fullName profilePicture isVerified')
    .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Get follow requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept follow request
router.put('/requests/:requestId/accept', auth, async (req, res) => {
  try {
    const request = await FollowRequest.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.to.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    request.status = 'accepted';
    await request.save();

    // Add to followers/following
    const currentUser = await User.findById(req.user._id);
    const requester = await User.findById(request.from);

    currentUser.followers.push(request.from);
    requester.following.push(req.user._id);

    await currentUser.save();
    await requester.save();

    await createNotification(
      request.from,
      req.user._id,
      'follow_accept',
      {},
      `${req.user.username} accepted your follow request`
    );

    res.json({ message: 'Follow request accepted' });
  } catch (error) {
    console.error('Accept follow request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Decline follow request
router.put('/requests/:requestId/decline', auth, async (req, res) => {
  try {
    const request = await FollowRequest.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.to.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    request.status = 'declined';
    await request.save();

    res.json({ message: 'Follow request declined' });
  } catch (error) {
    console.error('Decline follow request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel follow request
router.delete('/requests/:userId', auth, async (req, res) => {
  try {
    await FollowRequest.findOneAndDelete({
      from: req.user._id,
      to: req.params.userId,
      status: 'pending'
    });

    res.json({ message: 'Follow request cancelled' });
  } catch (error) {
    console.error('Cancel follow request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unfollow user
router.delete('/unfollow/:userId', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const targetUser = await User.findById(req.params.userId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    currentUser.following = currentUser.following.filter(
      id => id.toString() !== req.params.userId
    );
    targetUser.followers = targetUser.followers.filter(
      id => id.toString() !== req.user._id.toString()
    );

    await currentUser.save();
    await targetUser.save();

    res.json({ message: 'Unfollowed', isFollowing: false });
  } catch (error) {
    console.error('Unfollow error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove follower
router.delete('/remove-follower/:userId', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const follower = await User.findById(req.params.userId);

    if (!follower) {
      return res.status(404).json({ message: 'User not found' });
    }

    currentUser.followers = currentUser.followers.filter(
      id => id.toString() !== req.params.userId
    );
    follower.following = follower.following.filter(
      id => id.toString() !== req.user._id.toString()
    );

    await currentUser.save();
    await follower.save();

    res.json({ message: 'Follower removed' });
  } catch (error) {
    console.error('Remove follower error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
