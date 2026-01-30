/*
 * Instagram Clone - Stories Routes
 * Created by Phumeh
 */

const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// Demo stories storage
const demoStories = [
  {
    _id: 'story-1',
    user: {
      _id: 'user-1',
      username: 'phumeh',
      profilePicture: 'https://picsum.photos/150/150?random=200',
      isVerified: true
    },
    stories: [
      {
        _id: 'story-1-1',
        type: 'photo',
        media: { url: 'https://picsum.photos/400/700?random=10', thumbnail: 'https://picsum.photos/400/700?random=10' },
        createdAt: new Date().toISOString(),
        views: [],
        likes: []
      }
    ]
  },
  {
    _id: 'story-2',
    user: {
      _id: 'user-2',
      username: 'travel_pics',
      profilePicture: 'https://picsum.photos/150/150?random=201',
      isVerified: false
    },
    stories: [
      {
        _id: 'story-2-1',
        type: 'photo',
        media: { url: 'https://picsum.photos/400/700?random=11', thumbnail: 'https://picsum.photos/400/700?random=11' },
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        views: [],
        likes: []
      }
    ]
  },
  {
    _id: 'story-3',
    user: {
      _id: 'user-3',
      username: 'daily_life',
      profilePicture: 'https://picsum.photos/150/150?random=202',
      isVerified: false
    },
    stories: [
      {
        _id: 'story-3-1',
        type: 'photo',
        media: { url: 'https://picsum.photos/400/700?random=12', thumbnail: 'https://picsum.photos/400/700?random=12' },
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        views: [],
        likes: []
      }
    ]
  }
];

// Get Story model safely
const getStory = () => {
  try {
    const Story = require('../models/Story');
    if (Story.db?.readyState === 1) return Story;
    return null;
  } catch (e) {
    return null;
  }
};

// Get stories feed
router.get('/feed', auth, async (req, res) => {
  try {
    const Story = getStory();
    
    if (Story) {
      const user = req.user;
      const following = user.following || [];
      
      const stories = await Story.find({
        $or: [
          { user: { $in: [...following, user._id] } },
          { audience: 'public' }
        ],
        expiresAt: { $gt: new Date() }
      })
      .populate('user', 'username profilePicture isVerified')
      .sort({ createdAt: -1 });

      const groupedStories = {};
      stories.forEach(story => {
        const userId = story.user._id.toString();
        if (!groupedStories[userId]) {
          groupedStories[userId] = {
            user: story.user,
            stories: []
          };
        }
        groupedStories[userId].stories.push(story);
      });

      return res.json(Object.values(groupedStories));
    }

    // Demo mode
    res.json(demoStories);
  } catch (error) {
    console.error('Get stories feed error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create story
router.post('/', auth, async (req, res) => {
  try {
    const { type, media, text, stickers, music, audience } = req.body;
    
    const Story = getStory();
    
    if (Story) {
      const story = new Story({
        user: req.user._id,
        type: type || 'photo',
        media,
        text: text || undefined,
        stickers: stickers || [],
        music: music || undefined,
        audience: audience || 'followers'
      });

      await story.save();
      await story.populate('user', 'username profilePicture');
      return res.status(201).json(story);
    }

    // Demo mode
    const newStory = {
      _id: 'story-' + Date.now(),
      user: {
        _id: req.user._id || req.user.id,
        username: req.user.username,
        profilePicture: req.user.profilePicture,
        isVerified: req.user.isVerified
      },
      type: type || 'photo',
      media: media || { url: 'https://picsum.photos/400/700?random=' + Date.now() },
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      views: [],
      likes: []
    };

    // Add to demo stories
    const existingUser = demoStories.find(s => s.user.username === req.user.username);
    if (existingUser) {
      existingUser.stories.unshift(newStory);
    } else {
      demoStories.unshift({
        user: newStory.user,
        stories: [newStory]
      });
    }

    res.status(201).json(newStory);
  } catch (error) {
    console.error('Create story error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// View story
router.put('/:id/view', auth, async (req, res) => {
  try {
    const Story = getStory();
    
    if (Story) {
      const story = await Story.findById(req.params.id);
      
      if (!story) {
        return res.status(404).json({ message: 'Story not found' });
      }

      const alreadyViewed = story.views.some(
        view => view.user.toString() === req.user._id.toString()
      );

      if (!alreadyViewed) {
        story.views.push({ user: req.user._id });
        await story.save();
      }

      return res.json({ message: 'Story viewed' });
    }

    // Demo mode
    res.json({ message: 'Story viewed' });
  } catch (error) {
    console.error('View story error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like story
router.put('/:id/like', auth, async (req, res) => {
  try {
    const Story = getStory();
    
    if (Story) {
      const story = await Story.findById(req.params.id);
      
      if (!story) {
        return res.status(404).json({ message: 'Story not found' });
      }

      const isLiked = story.likes.some(
        like => like.user.toString() === req.user._id.toString()
      );

      if (isLiked) {
        story.likes = story.likes.filter(
          like => like.user.toString() !== req.user._id.toString()
        );
      } else {
        story.likes.push({ user: req.user._id });
      }

      await story.save();
      return res.json({ likes: story.likes.length, isLiked: !isLiked });
    }

    // Demo mode
    res.json({ likes: 1, isLiked: true });
  } catch (error) {
    console.error('Like story error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete story
router.delete('/:id', auth, async (req, res) => {
  try {
    const Story = getStory();
    
    if (Story) {
      const story = await Story.findById(req.params.id);
      
      if (!story) {
        return res.status(404).json({ message: 'Story not found' });
      }

      if (story.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      await Story.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Story deleted' });
    }

    // Demo mode
    res.json({ message: 'Story deleted' });
  } catch (error) {
    console.error('Delete story error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's stories
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const Story = getStory();
    
    if (Story) {
      const stories = await Story.find({
        user: req.params.userId,
        expiresAt: { $gt: new Date() }
      })
      .populate('user', 'username profilePicture isVerified')
      .sort({ createdAt: 1 });

      return res.json(stories);
    }

    // Demo mode
    const userStories = demoStories.find(s => s.user._id === req.params.userId);
    res.json(userStories ? userStories.stories : []);
  } catch (error) {
    console.error('Get user stories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
