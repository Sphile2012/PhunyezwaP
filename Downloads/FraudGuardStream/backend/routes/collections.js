/*
 * Instagram Clone - Collections Routes
 * Created by Phumeh
 */

const express = require('express');
const Collection = require('../models/Collection');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user's collections
router.get('/', auth, async (req, res) => {
  try {
    const collections = await Collection.find({ user: req.user._id })
      .populate('posts', 'media')
      .populate('reels', 'video')
      .sort({ updatedAt: -1 });

    res.json(collections);
  } catch (error) {
    console.error('Get collections error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create collection
router.post('/', auth, async (req, res) => {
  try {
    const { name, coverImage } = req.body;

    const collection = new Collection({
      user: req.user._id,
      name,
      coverImage
    });

    await collection.save();
    res.status(201).json(collection);
  } catch (error) {
    console.error('Create collection error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single collection
router.get('/:id', auth, async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id)
      .populate({
        path: 'posts',
        populate: { path: 'user', select: 'username profilePicture' }
      })
      .populate({
        path: 'reels',
        populate: { path: 'user', select: 'username profilePicture' }
      });

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    if (collection.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(collection);
  } catch (error) {
    console.error('Get collection error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update collection
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, coverImage } = req.body;
    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    if (collection.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (name) collection.name = name;
    if (coverImage) collection.coverImage = coverImage;

    await collection.save();
    res.json(collection);
  } catch (error) {
    console.error('Update collection error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete collection
router.delete('/:id', auth, async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    if (collection.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Collection.findByIdAndDelete(req.params.id);
    res.json({ message: 'Collection deleted' });
  } catch (error) {
    console.error('Delete collection error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add post to collection
router.post('/:id/posts/:postId', auth, async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    if (collection.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!collection.posts.includes(req.params.postId)) {
      collection.posts.push(req.params.postId);
      await collection.save();
    }

    res.json({ message: 'Post added to collection' });
  } catch (error) {
    console.error('Add to collection error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove post from collection
router.delete('/:id/posts/:postId', auth, async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    if (collection.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    collection.posts = collection.posts.filter(
      p => p.toString() !== req.params.postId
    );
    await collection.save();

    res.json({ message: 'Post removed from collection' });
  } catch (error) {
    console.error('Remove from collection error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
