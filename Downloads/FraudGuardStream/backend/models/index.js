/*
 * Instagram Clone - Models Index (Sequelize)
 * Created by Phumeh
 */

const sequelize = require('../config/database');
const User = require('./User');
const Post = require('./Post');
const Comment = require('./Comment');
const Like = require('./Like');
const Follow = require('./Follow');
const { Conversation, ConversationParticipant, Message, MessageRead } = require('./Message');
const { Story, StoryView } = require('./Story');
const Reel = require('./Reel');
const Notification = require('./Notification');
const { Collection, CollectionPost } = require('./Collection');
const FollowRequest = require('./FollowRequest');
const { Highlight, HighlightStory } = require('./Highlight');
const { Live, LiveViewer } = require('./Live');
const Report = require('./Report');

// User associations
User.hasMany(Post, { foreignKey: 'userId', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

Comment.hasMany(Comment, { foreignKey: 'parentId', as: 'replies' });
Comment.belongsTo(Comment, { foreignKey: 'parentId', as: 'parent' });

// Likes
User.hasMany(Like, { foreignKey: 'userId', as: 'likes' });
Like.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Post.hasMany(Like, { foreignKey: 'postId', as: 'likes' });
Like.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

Comment.hasMany(Like, { foreignKey: 'commentId', as: 'likes' });
Like.belongsTo(Comment, { foreignKey: 'commentId', as: 'comment' });

Reel.hasMany(Like, { foreignKey: 'reelId', as: 'likes' });
Like.belongsTo(Reel, { foreignKey: 'reelId', as: 'reel' });

// Follows
User.belongsToMany(User, { through: Follow, as: 'followers', foreignKey: 'followingId', otherKey: 'followerId' });
User.belongsToMany(User, { through: Follow, as: 'following', foreignKey: 'followerId', otherKey: 'followingId' });

// Follow Requests
User.hasMany(FollowRequest, { foreignKey: 'fromUserId', as: 'sentFollowRequests' });
User.hasMany(FollowRequest, { foreignKey: 'toUserId', as: 'receivedFollowRequests' });
FollowRequest.belongsTo(User, { foreignKey: 'fromUserId', as: 'fromUser' });
FollowRequest.belongsTo(User, { foreignKey: 'toUserId', as: 'toUser' });

// Stories
User.hasMany(Story, { foreignKey: 'userId', as: 'stories' });
Story.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Story.hasMany(StoryView, { foreignKey: 'storyId', as: 'views' });
StoryView.belongsTo(Story, { foreignKey: 'storyId', as: 'story' });
StoryView.belongsTo(User, { foreignKey: 'userId', as: 'viewer' });

// Reels
User.hasMany(Reel, { foreignKey: 'userId', as: 'reels' });
Reel.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Messages
Conversation.hasMany(ConversationParticipant, { foreignKey: 'conversationId', as: 'participants' });
ConversationParticipant.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });
ConversationParticipant.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

Message.hasMany(MessageRead, { foreignKey: 'messageId', as: 'reads' });
MessageRead.belongsTo(Message, { foreignKey: 'messageId', as: 'message' });
MessageRead.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Notifications
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Notification.belongsTo(User, { foreignKey: 'fromUserId', as: 'fromUser' });

// Collections
User.hasMany(Collection, { foreignKey: 'userId', as: 'collections' });
Collection.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Collection.hasMany(CollectionPost, { foreignKey: 'collectionId', as: 'posts' });
CollectionPost.belongsTo(Collection, { foreignKey: 'collectionId', as: 'collection' });
CollectionPost.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

// Highlights
User.hasMany(Highlight, { foreignKey: 'userId', as: 'highlights' });
Highlight.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Highlight.hasMany(HighlightStory, { foreignKey: 'highlightId', as: 'stories' });
HighlightStory.belongsTo(Highlight, { foreignKey: 'highlightId', as: 'highlight' });
HighlightStory.belongsTo(Story, { foreignKey: 'storyId', as: 'story' });

// Live
User.hasMany(Live, { foreignKey: 'userId', as: 'lives' });
Live.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Live.hasMany(LiveViewer, { foreignKey: 'liveId', as: 'viewers' });
LiveViewer.belongsTo(Live, { foreignKey: 'liveId', as: 'live' });
LiveViewer.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Reports
User.hasMany(Report, { foreignKey: 'reporterId', as: 'reports' });
Report.belongsTo(User, { foreignKey: 'reporterId', as: 'reporter' });
Report.belongsTo(User, { foreignKey: 'reportedUserId', as: 'reportedUser' });

module.exports = {
  sequelize,
  User,
  Post,
  Comment,
  Like,
  Follow,
  Conversation,
  ConversationParticipant,
  Message,
  MessageRead,
  Story,
  StoryView,
  Reel,
  Notification,
  Collection,
  CollectionPost,
  FollowRequest,
  Highlight,
  HighlightStory,
  Live,
  LiveViewer,
  Report
};
