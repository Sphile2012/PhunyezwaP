/*
 * Instagram Clone - Stories Routes (Sequelize)
 * Created by Phumeh
 */

const express = require('express');
const auth = require('../middleware/auth');
const { User, Story, StoryView, Follow } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

// Get stories feed
router.get('/feed', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get users the current user follows
    const follows = await Follow.findAll({
      where: { followerId: userId },
      attributes: ['followingId']
    });
    const followingIds = follows.map(f => f.followingId);

    // Get stories from followed users, own stories, and public stories
    const stories = await Story.findAll({
      where: {
        [Op.or]: [
          { userId: { [Op.in]: [...followingIds, userId] } },
          { audience: 'public' }
        ],
        expiresAt: { [Op.gt]: new Date() }
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'profilePicture', 'isVerified']
      }],
      order: [['createdAt', 'DESC']]
    });

    // Group stories by user
    const groupedStories = {};
    stories.forEach(story => {
      const storyUserId = story.userId.toString();
      if (!groupedStories[storyUserId]) {
        groupedStories[storyUserId] = {
          user: story.user,
          stories: []
        };
      }
      groupedStories[storyUserId].stories.push(story);
    });

    res.json(Object.values(groupedStories));
  } catch (error) {
    console.error('Get stories feed error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create story
router.post('/', auth, async (req, res) => {
  try {
    const { type, media, text, stickers, music, audience } = req.body;

    const story = await Story.create({
      userId: req.user.id,
      type: type === 'photo' ? 'image' : (type || 'image'),
      mediaUrl: media?.url || media,
      thumbnail: media?.thumbnail || null,
      caption: text || null,
      stickers: stickers || [],
      music: music || null,
      audience: audience || 'followers',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    const storyWithUser = await Story.findByPk(story.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'profilePicture', 'isVerified']
      }]
    });

    res.status(201).json(storyWithUser);
  } catch (error) {
    console.error('Create story error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// View story
router.put('/:id/view', auth, async (req, res) => {
  try {
    const story = await Story.findByPk(req.params.id);

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    // Check if already viewed
    const existingView = await StoryView.findOne({
      where: {
        storyId: req.params.id,
        userId: req.user.id
      }
    });

    if (!existingView) {
      await StoryView.create({
        storyId: req.params.id,
        userId: req.user.id
      });
    }

    res.json({ message: 'Story viewed' });
  } catch (error) {
    console.error('View story error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like story (using StoryView with a like flag or separate table)
router.put('/:id/like', auth, async (req, res) => {
  try {
    const story = await Story.findByPk(req.params.id);

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    // For now, toggle view as "like" since there's no separate StoryLike model
    // You may want to add a StoryLike model for proper implementation
    const existingView = await StoryView.findOne({
      where: {
        storyId: req.params.id,
        userId: req.user.id
      }
    });

    let isLiked = false;
    if (!existingView) {
      await StoryView.create({
        storyId: req.params.id,
        userId: req.user.id
      });
      isLiked = true;
    }

    const likesCount = await StoryView.count({
      where: { storyId: req.params.id }
    });

    res.json({ likes: likesCount, isLiked });
  } catch (error) {
    console.error('Like story error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete story
router.delete('/:id', auth, async (req, res) => {
  try {
    const story = await Story.findByPk(req.params.id);

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    if (story.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete associated views first
    await StoryView.destroy({
      where: { storyId: req.params.id }
    });

    await story.destroy();

    res.json({ message: 'Story deleted' });
  } catch (error) {
    console.error('Delete story error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's stories
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const stories = await Story.findAll({
      where: {
        userId: req.params.userId,
        expiresAt: { [Op.gt]: new Date() }
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'profilePicture', 'isVerified']
      }],
      order: [['createdAt', 'ASC']]
    });

    res.json(stories);
  } catch (error) {
    console.error('Get user stories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
