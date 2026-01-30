/*
 * Instagram Clone - Main API Handler for Netlify Functions
 * Created by Phumeh
 */

const connectDB = require('./utils/db');
const { verifyAuth } = require('./utils/auth');
const { success, error, options } = require('./utils/response');

// Models
const User = require('./models/User');
const Post = require('./models/Post');
const Story = require('./models/Story');
const Reel = require('./models/Reel');
const { Conversation, Message } = require('./models/Message');
const Notification = require('./models/Notification');
const Highlight = require('./models/Highlight');

// Libraries
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper to create notification
const createNotification = async (recipientId, senderId, type, content = {}, message = '') => {
  try {
    if (recipientId.toString() === senderId.toString()) return;
    
    const recipient = await User.findById(recipientId);
    if (!recipient || !recipient.isActive) return;

    const notification = new Notification({
      recipient: recipientId,
      sender: senderId,
      type,
      content,
      message
    });

    await notification.save();
    return notification;
  } catch (err) {
    console.error('Create notification error:', err);
  }
};

// Route handlers
const handlers = {
  // ============ AUTH ROUTES ============
  'POST /auth/register': async (body) => {
    const { username, email, phone, password, fullName } = body;

    if (!username || !password || (!email && !phone)) {
      return error('Missing required fields', 400);
    }

    const existingUser = await User.findOne({ 
      $or: [
        { email: email || null }, 
        { phone: phone || null },
        { username }
      ] 
    });
    
    if (existingUser) {
      return error('User already exists', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      username,
      email: email || null,
      phone: phone || null,
      password: hashedPassword,
      fullName: fullName || ''
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    return success({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
        profilePicture: user.profilePicture,
        isPrivate: user.isPrivate,
        isVerified: user.isVerified
      }
    }, 201);
  },

  'POST /auth/login': async (body) => {
    const { identifier, password } = body;

    const user = await User.findOne({ 
      $or: [
        { email: identifier },
        { phone: identifier },
        { username: identifier }
      ]
    });

    if (!user) {
      return error('Invalid credentials', 400);
    }

    if (!user.isActive) {
      return error('Account is deactivated', 400);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return error('Invalid credentials', 400);
    }

    user.lastSeen = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    return success({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
        profilePicture: user.profilePicture,
        bio: user.bio,
        website: user.website,
        isPrivate: user.isPrivate,
        isVerified: user.isVerified,
        accountType: user.accountType,
        followers: user.followers.length,
        following: user.following.length
      }
    });
  },

  'GET /auth/me': async (body, authUser) => {
    const user = await User.findById(authUser._id)
      .populate('followers', 'username profilePicture')
      .populate('following', 'username profilePicture')
      .populate('closeFriends', 'username profilePicture');

    return success({
      id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      fullName: user.fullName,
      profilePicture: user.profilePicture,
      bio: user.bio,
      website: user.website,
      isPrivate: user.isPrivate,
      isVerified: user.isVerified,
      accountType: user.accountType,
      followers: user.followers,
      following: user.following,
      closeFriends: user.closeFriends,
      savedPosts: user.savedPosts.length,
      archivedPosts: user.archivedPosts.length
    });
  },

  'PUT /auth/profile': async (body, authUser) => {
    const { fullName, bio, website, isPrivate, profilePicture, accountType } = body;

    const user = await User.findById(authUser._id);
    
    if (fullName !== undefined) user.fullName = fullName;
    if (bio !== undefined) user.bio = bio;
    if (website !== undefined) user.website = website;
    if (isPrivate !== undefined) user.isPrivate = isPrivate;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    if (accountType !== undefined) user.accountType = accountType;

    await user.save();

    return success({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        bio: user.bio,
        website: user.website,
        profilePicture: user.profilePicture,
        isPrivate: user.isPrivate,
        accountType: user.accountType
      }
    });
  },

  'PUT /auth/password': async (body, authUser) => {
    const { currentPassword, newPassword } = body;

    const user = await User.findById(authUser._id);
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return error('Current password is incorrect', 400);
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    await user.save();

    return success({ message: 'Password updated successfully' });
  },

  'POST /auth/logout': async (body, authUser) => {
    const user = await User.findById(authUser._id);
    user.lastSeen = new Date();
    await user.save();

    return success({ message: 'Logged out successfully' });
  },

  // ============ POSTS ROUTES ============
  'GET /posts': async (body, authUser) => {
    const posts = await Post.find()
      .populate('user', 'username profilePicture')
      .populate('comments.user', 'username')
      .sort({ createdAt: -1 });

    return success(posts);
  },

  'POST /posts': async (body, authUser) => {
    const { caption, media, type, hashtags, location } = body;
    
    if (!media || !media.length) {
      return error('Media is required', 400);
    }

    const post = new Post({
      user: authUser._id,
      media,
      type: type || 'photo',
      caption: caption || '',
      hashtags: hashtags || [],
      location: location || null
    });

    await post.save();
    await post.populate('user', 'username profilePicture');

    return success(post, 201);
  },

  'PUT /posts/:id/like': async (body, authUser, params) => {
    const post = await Post.findById(params.id);
    
    if (!post) {
      return error('Post not found', 404);
    }

    const likeIndex = post.likes.findIndex(
      like => like.user && like.user.toString() === authUser._id.toString()
    );
    
    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push({ user: authUser._id });
    }

    await post.save();
    return success({ likes: post.likes.length, isLiked: likeIndex === -1 });
  },

  'POST /posts/:id/comment': async (body, authUser, params) => {
    const { text } = body;
    const post = await Post.findById(params.id);
    
    if (!post) {
      return error('Post not found', 404);
    }

    const comment = {
      user: authUser._id,
      text
    };

    post.comments.push(comment);
    await post.save();
    await post.populate('comments.user', 'username');

    return success(post.comments[post.comments.length - 1]);
  },

  // ============ USERS ROUTES ============
  'GET /users/:username': async (body, authUser, params) => {
    const user = await User.findOne({ username: params.username })
      .select('-password')
      .populate('followers', 'username profilePicture isVerified')
      .populate('following', 'username profilePicture isVerified');
    
    if (!user || !user.isActive) {
      return error('User not found', 404);
    }

    if (user.blockedUsers.includes(authUser._id)) {
      return error('Access denied', 403);
    }

    const posts = await Post.find({ user: user._id, isArchived: false })
      .populate('user', 'username profilePicture')
      .sort({ createdAt: -1 });

    const isFollowing = user.followers.some(f => f._id.toString() === authUser._id.toString());

    return success({
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        profilePicture: user.profilePicture,
        bio: user.bio,
        website: user.website,
        isPrivate: user.isPrivate,
        isVerified: user.isVerified,
        accountType: user.accountType,
        followers: user.followers.length,
        following: user.following.length,
        posts: posts.length
      },
      posts,
      isFollowing,
      isOwnProfile: user._id.toString() === authUser._id.toString()
    });
  },

  'PUT /users/:id/follow': async (body, authUser, params) => {
    const userToFollow = await User.findById(params.id);
    const currentUser = await User.findById(authUser._id);
    
    if (!userToFollow || !userToFollow.isActive) {
      return error('User not found', 404);
    }

    if (userToFollow._id.toString() === authUser._id.toString()) {
      return error('Cannot follow yourself', 400);
    }

    const isFollowing = currentUser.following.includes(params.id);
    
    if (isFollowing) {
      currentUser.following = currentUser.following.filter(
        id => id.toString() !== params.id
      );
      userToFollow.followers = userToFollow.followers.filter(
        id => id.toString() !== authUser._id.toString()
      );
    } else {
      currentUser.following.push(params.id);
      userToFollow.followers.push(authUser._id);

      await createNotification(
        userToFollow._id,
        authUser._id,
        'follow',
        {},
        `${currentUser.username} started following you`
      );
    }

    await currentUser.save();
    await userToFollow.save();

    return success({ 
      isFollowing: !isFollowing,
      followers: userToFollow.followers.length,
      following: currentUser.following.length
    });
  },

  'GET /users/suggestions/for-you': async (body, authUser) => {
    const currentUser = await User.findById(authUser._id);
    
    const suggestions = await User.aggregate([
      {
        $match: {
          _id: { $nin: [...currentUser.following, ...currentUser.blockedUsers, authUser._id] },
          isActive: true
        }
      },
      {
        $addFields: {
          mutualFollowers: {
            $size: {
              $setIntersection: ['$followers', currentUser.following]
            }
          }
        }
      },
      { $sort: { mutualFollowers: -1, isVerified: -1 } },
      { $limit: 20 },
      {
        $project: {
          username: 1,
          fullName: 1,
          profilePicture: 1,
          isVerified: 1,
          mutualFollowers: 1
        }
      }
    ]);

    return success(suggestions);
  },

  // ============ STORIES ROUTES ============
  'GET /stories/feed': async (body, authUser) => {
    const user = await User.findById(authUser._id);
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

    return success(Object.values(groupedStories));
  },

  'POST /stories': async (body, authUser) => {
    const { type, media, text, stickers, music, audience } = body;
    
    if (!media) {
      return error('Media is required', 400);
    }

    const story = new Story({
      user: authUser._id,
      type,
      media,
      text: text || undefined,
      stickers: stickers || [],
      music: music || undefined,
      audience: audience || 'followers'
    });

    await story.save();
    await story.populate('user', 'username profilePicture');

    return success(story, 201);
  },

  'PUT /stories/:id/view': async (body, authUser, params) => {
    const story = await Story.findById(params.id);
    
    if (!story) {
      return error('Story not found', 404);
    }

    const alreadyViewed = story.views.some(
      view => view.user.toString() === authUser._id.toString()
    );

    if (!alreadyViewed) {
      story.views.push({ user: authUser._id });
      await story.save();
    }

    return success({ message: 'Story viewed' });
  },

  // ============ REELS ROUTES ============
  'GET /reels/feed': async (body, authUser, params, query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const reels = await Reel.find({ audience: 'public' })
      .populate('user', 'username profilePicture isVerified')
      .sort({ createdAt: -1, views: -1 })
      .skip(skip)
      .limit(limit);

    return success(reels);
  },

  'POST /reels': async (body, authUser) => {
    const { video, caption, hashtags, audio, audience } = body;
    
    if (!video || !video.url) {
      return error('Video is required', 400);
    }

    const reel = new Reel({
      user: authUser._id,
      video,
      caption: caption || '',
      hashtags: hashtags || [],
      audio: audio || undefined,
      audience: audience || 'public'
    });

    await reel.save();
    await reel.populate('user', 'username profilePicture isVerified');

    return success(reel, 201);
  },

  'GET /reels/:id': async (body, authUser, params) => {
    const reel = await Reel.findById(params.id)
      .populate('user', 'username profilePicture isVerified')
      .populate('comments.user', 'username profilePicture');

    if (!reel) {
      return error('Reel not found', 404);
    }

    reel.views += 1;
    await reel.save();

    return success(reel);
  },

  'PUT /reels/:id/like': async (body, authUser, params) => {
    const reel = await Reel.findById(params.id);
    
    if (!reel) {
      return error('Reel not found', 404);
    }

    const likeIndex = reel.likes.findIndex(
      like => like.user && like.user.toString() === authUser._id.toString()
    );

    if (likeIndex > -1) {
      reel.likes.splice(likeIndex, 1);
    } else {
      reel.likes.push({ user: authUser._id });
    }

    await reel.save();
    return success({ likes: reel.likes.length, isLiked: likeIndex === -1 });
  },

  // ============ SEARCH ROUTES ============
  'GET /search/users': async (body, authUser, params, query) => {
    const q = query.q;
    const limit = parseInt(query.limit) || 20;
    
    if (!q || q.trim().length < 1) {
      return success([]);
    }

    const searchQuery = q.trim();
    
    const users = await User.find({
      $and: [
        { _id: { $ne: authUser._id } },
        { isActive: true },
        {
          $or: [
            { username: { $regex: searchQuery, $options: 'i' } },
            { fullName: { $regex: searchQuery, $options: 'i' } }
          ]
        }
      ]
    })
    .select('username fullName profilePicture isVerified isPrivate')
    .limit(limit)
    .sort({ isVerified: -1, username: 1 });

    return success(users);
  },

  'GET /search/hashtags': async (body, authUser, params, query) => {
    const q = query.q;
    const limit = parseInt(query.limit) || 20;
    
    if (!q || q.trim().length < 1) {
      return success([]);
    }

    const searchQuery = q.trim().replace('#', '');
    
    const hashtags = await Post.aggregate([
      { $match: { hashtags: { $regex: searchQuery, $options: 'i' } } },
      { $unwind: '$hashtags' },
      { $match: { hashtags: { $regex: searchQuery, $options: 'i' } } },
      {
        $group: {
          _id: '$hashtags',
          count: { $sum: 1 },
          recentPost: { $first: '$media' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: limit }
    ]);

    return success(hashtags.map(tag => ({
      hashtag: tag._id,
      postCount: tag.count,
      thumbnail: tag.recentPost?.[0]?.url || null
    })));
  },

  // ============ MESSAGES ROUTES ============
  'GET /messages/conversations': async (body, authUser) => {
    const conversations = await Conversation.find({
      participants: authUser._id,
      deletedBy: { $ne: authUser._id }
    })
    .populate('participants', 'username fullName profilePicture isVerified')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

    const activeConversations = conversations.filter(conv => 
      !conv.archivedBy.includes(authUser._id)
    );

    return success(activeConversations);
  },

  'POST /messages/conversations': async (body, authUser) => {
    const { participantIds, isGroup, groupName } = body;
    
    let participants = [authUser._id, ...participantIds];
    
    if (!isGroup && participants.length === 2) {
      const existingConversation = await Conversation.findOne({
        participants: { $all: participants, $size: 2 },
        isGroup: false
      });

      if (existingConversation) {
        return success(existingConversation);
      }
    }

    const conversation = new Conversation({
      participants,
      isGroup: isGroup || false,
      groupName: groupName || null,
      admins: isGroup ? [authUser._id] : []
    });

    await conversation.save();
    await conversation.populate('participants', 'username fullName profilePicture isVerified');

    return success(conversation, 201);
  },

  'GET /messages/conversations/:id/messages': async (body, authUser, params, query) => {
    const { id } = params;
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 50;
    const skip = (page - 1) * limit;

    const conversation = await Conversation.findById(id);
    if (!conversation || !conversation.participants.includes(authUser._id)) {
      return error('Access denied', 403);
    }

    const messages = await Message.find({
      conversation: id,
      deletedBy: { $ne: authUser._id }
    })
    .populate('sender', 'username profilePicture')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    return success(messages.reverse());
  },

  'POST /messages/conversations/:id/messages': async (body, authUser, params) => {
    const { id } = params;
    const { type, text } = body;

    const conversation = await Conversation.findById(id);
    if (!conversation || !conversation.participants.includes(authUser._id)) {
      return error('Access denied', 403);
    }

    const message = new Message({
      conversation: id,
      sender: authUser._id,
      type: type || 'text',
      content: { text }
    });

    await message.save();
    await message.populate('sender', 'username profilePicture');

    conversation.lastMessage = message._id;
    conversation.updatedAt = new Date();
    await conversation.save();

    return success(message, 201);
  },

  // ============ NOTIFICATIONS ROUTES ============
  'GET /notifications': async (body, authUser, params, query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 50;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ recipient: authUser._id })
      .populate('sender', 'username fullName profilePicture isVerified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    await Notification.updateMany(
      { recipient: authUser._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    return success(notifications);
  },

  'GET /notifications/unread-count': async (body, authUser) => {
    const count = await Notification.countDocuments({
      recipient: authUser._id,
      isRead: false
    });

    return success({ count });
  },

  'PUT /notifications/read-all': async (body, authUser) => {
    await Notification.updateMany(
      { recipient: authUser._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    return success({ message: 'All notifications marked as read' });
  },

  // ============ HEALTH CHECK ============
  'GET /health': async () => {
    return success({ 
      message: 'Instagram Clone API - Created by Phumeh',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      features: [
        'Authentication', 'Posts', 'Stories', 'Reels', 'Live',
        'Messages', 'Notifications', 'Search', 'Collections',
        'Follow System', 'Reports'
      ]
    });
  }
};

// Main handler
exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  // Handle OPTIONS (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return options();
  }

  try {
    await connectDB();

    // Parse path - remove /api/ prefix if present
    let path = event.path.replace('/.netlify/functions/api', '').replace('/api', '');
    if (!path.startsWith('/')) path = '/' + path;
    
    const method = event.httpMethod;
    const body = event.body ? JSON.parse(event.body) : {};
    const query = event.queryStringParameters || {};

    // Extract route params
    const routeKey = `${method} ${path}`;
    let handler = handlers[routeKey];
    let params = {};

    // If no exact match, try pattern matching
    if (!handler) {
      for (const [pattern, h] of Object.entries(handlers)) {
        const [m, p] = pattern.split(' ');
        if (m !== method) continue;

        const patternParts = p.split('/');
        const pathParts = path.split('/');

        if (patternParts.length !== pathParts.length) continue;

        let match = true;
        const extractedParams = {};

        for (let i = 0; i < patternParts.length; i++) {
          if (patternParts[i].startsWith(':')) {
            extractedParams[patternParts[i].slice(1)] = pathParts[i];
          } else if (patternParts[i] !== pathParts[i]) {
            match = false;
            break;
          }
        }

        if (match) {
          handler = h;
          params = extractedParams;
          break;
        }
      }
    }

    if (!handler) {
      return error('Route not found', 404);
    }

    // Check if route requires auth (all except register, login, health)
    const publicRoutes = [
      'POST /auth/register',
      'POST /auth/login',
      'GET /health'
    ];

    const isPublic = publicRoutes.some(r => {
      const [m, p] = r.split(' ');
      return m === method && path === p;
    });

    let authUser = null;
    if (!isPublic) {
      const authResult = await verifyAuth(event);
      if (authResult.error) {
        return error(authResult.error, authResult.status);
      }
      authUser = authResult.user;
    }

    return await handler(body, authUser, params, query);

  } catch (err) {
    console.error('API Error:', err);
    return error(err.message || 'Server error', 500);
  }
};
