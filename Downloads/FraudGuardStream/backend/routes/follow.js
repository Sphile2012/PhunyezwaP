/*
 * Instagram Clone - Follow Request Routes
 * Created by Phumeh
 */

const express = require('express');
const { User, Follow, FollowRequest } = require('../models');
const { createNotification } = require('./notifications');
const auth = require('../middleware/auth');

const router = express.Router();

// Send follow request
router.post('/request/:userId', auth, async (req, res) => {
  try {
    const targetUser = await User.findByPk(req.params.userId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.params.userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      where: { followerId: req.user.id, followingId: req.params.userId }
    });

    if (existingFollow) {
      return res.status(400).json({ message: 'Already following' });
    }

    // If public account, follow directly
    if (!targetUser.isPrivate) {
      await Follow.create({
        followerId: req.user.id,
        followingId: req.params.userId
      });

      // Update follower counts
      await User.increment('followersCount', { where: { id: req.params.userId } });
      await User.increment('followingCount', { where: { id: req.user.id } });

      await createNotification(
        req.params.userId,
        req.user.id,
        'follow',
        {},
        `${req.user.username} started following you`
      );

      return res.json({ message: 'Now following', isFollowing: true });
    }

    // Check existing request
    const existingRequest = await FollowRequest.findOne({
      where: {
        fromId: req.user.id,
        toId: req.params.userId,
        status: 'pending'
      }
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Request already sent' });
    }

    await FollowRequest.create({
      fromId: req.user.id,
      toId: req.params.userId
    });

    await createNotification(
      req.params.userId,
      req.user.id,
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
    const requests = await FollowRequest.findAll({
      where: {
        toId: req.user.id,
        status: 'pending'
      },
      include: [
        { model: User, as: 'from', attributes: ['id', 'username', 'fullName', 'profilePicture', 'isVerified'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(requests);
  } catch (error) {
    console.error('Get follow requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept follow request
router.put('/requests/:requestId/accept', auth, async (req, res) => {
  try {
    const request = await FollowRequest.findByPk(req.params.requestId);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.toId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    request.status = 'accepted';
    await request.save();

    // Create follow relationship
    await Follow.create({
      followerId: request.fromId,
      followingId: req.user.id
    });

    // Update follower counts
    await User.increment('followersCount', { where: { id: req.user.id } });
    await User.increment('followingCount', { where: { id: request.fromId } });

    await createNotification(
      request.fromId,
      req.user.id,
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
    const request = await FollowRequest.findByPk(req.params.requestId);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.toId !== req.user.id) {
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
    await FollowRequest.destroy({
      where: {
        fromId: req.user.id,
        toId: req.params.userId,
        status: 'pending'
      }
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
    const targetUser = await User.findByPk(req.params.userId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const deleted = await Follow.destroy({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId
      }
    });

    if (deleted) {
      // Update follower counts
      await User.decrement('followersCount', { where: { id: req.params.userId } });
      await User.decrement('followingCount', { where: { id: req.user.id } });
    }

    res.json({ message: 'Unfollowed', isFollowing: false });
  } catch (error) {
    console.error('Unfollow error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove follower
router.delete('/remove-follower/:userId', auth, async (req, res) => {
  try {
    const follower = await User.findByPk(req.params.userId);

    if (!follower) {
      return res.status(404).json({ message: 'User not found' });
    }

    const deleted = await Follow.destroy({
      where: {
        followerId: req.params.userId,
        followingId: req.user.id
      }
    });

    if (deleted) {
      // Update follower counts
      await User.decrement('followersCount', { where: { id: req.user.id } });
      await User.decrement('followingCount', { where: { id: req.params.userId } });
    }

    res.json({ message: 'Follower removed' });
  } catch (error) {
    console.error('Remove follower error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
