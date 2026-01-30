/*
 * Instagram Clone - Collections Routes
 * Created by Phumeh
 */

const express = require('express');
const { User, Collection, CollectionPost, Post } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user's collections
router.get('/', auth, async (req, res) => {
  try {
    const collections = await Collection.findAll({
      where: { userId: req.user.id },
      include: [
        { 
          model: Post, 
          as: 'posts',
          attributes: ['id', 'media'],
          through: { attributes: [] }
        }
      ],
      order: [['updatedAt', 'DESC']]
    });

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

    const collection = await Collection.create({
      userId: req.user.id,
      name,
      coverImage
    });

    res.status(201).json(collection);
  } catch (error) {
    console.error('Create collection error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single collection
router.get('/:id', auth, async (req, res) => {
  try {
    const collection = await Collection.findByPk(req.params.id, {
      include: [
        {
          model: Post,
          as: 'posts',
          include: [{ model: User, as: 'user', attributes: ['id', 'username', 'profilePicture'] }],
          through: { attributes: [] }
        }
      ]
    });

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    if (collection.userId !== req.user.id) {
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
    const collection = await Collection.findByPk(req.params.id);

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    if (collection.userId !== req.user.id) {
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
    const collection = await Collection.findByPk(req.params.id);

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    if (collection.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await collection.destroy();
    res.json({ message: 'Collection deleted' });
  } catch (error) {
    console.error('Delete collection error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add post to collection
router.post('/:id/posts/:postId', auth, async (req, res) => {
  try {
    const collection = await Collection.findByPk(req.params.id);

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    if (collection.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const existingEntry = await CollectionPost.findOne({
      where: { collectionId: req.params.id, postId: req.params.postId }
    });

    if (!existingEntry) {
      await CollectionPost.create({
        collectionId: req.params.id,
        postId: req.params.postId
      });
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
    const collection = await Collection.findByPk(req.params.id);

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    if (collection.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await CollectionPost.destroy({
      where: { collectionId: req.params.id, postId: req.params.postId }
    });

    res.json({ message: 'Post removed from collection' });
  } catch (error) {
    console.error('Remove from collection error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
