/*
 * Instagram Clone - Full-Featured Server
 * Created by Phumeh
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');

dotenv.config();

const app = express();
const server = createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/users', require('./routes/users'));
app.use('/api/stories', require('./routes/stories'));
app.use('/api/reels', require('./routes/reels'));
app.use('/api/search', require('./routes/search'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications').router);
app.use('/api/live', require('./routes/live'));
app.use('/api/collections', require('./routes/collections'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/follow', require('./routes/follow'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
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
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
  });

  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
  });

  socket.on('join_live', (liveId) => {
    socket.join(`live_${liveId}`);
  });

  socket.on('leave_live', (liveId) => {
    socket.leave(`live_${liveId}`);
  });

  socket.on('typing', (data) => {
    socket.to(`conversation_${data.conversationId}`).emit('user_typing', {
      userId: data.userId,
      username: data.username
    });
  });

  socket.on('stop_typing', (data) => {
    socket.to(`conversation_${data.conversationId}`).emit('user_stop_typing', {
      userId: data.userId
    });
  });

  socket.on('new_message', (data) => {
    socket.to(`conversation_${data.conversationId}`).emit('receive_message', data);
  });

  socket.on('go_live', (data) => {
    socket.broadcast.emit('user_went_live', data);
  });

  socket.on('end_live', (data) => {
    socket.broadcast.emit('user_ended_live', data);
  });

  socket.on('new_story', (data) => {
    socket.broadcast.emit('story_update', data);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/instagram-clone';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('🚀 MongoDB connected - Instagram Clone by Phumeh'))
.catch(err => {
  console.log('⚠️ MongoDB connection failed, running in demo mode');
  console.log('   To use full features, set MONGODB_URI in .env');
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 Instagram Clone Server running on port ${PORT}`);
  console.log(`📱 Created by Phumeh`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n📡 API Endpoints:`);
  console.log(`   - Auth:          /api/auth`);
  console.log(`   - Posts:         /api/posts`);
  console.log(`   - Users:         /api/users`);
  console.log(`   - Stories:       /api/stories`);
  console.log(`   - Reels:         /api/reels`);
  console.log(`   - Live:          /api/live`);
  console.log(`   - Messages:      /api/messages`);
  console.log(`   - Notifications: /api/notifications`);
  console.log(`   - Search:        /api/search`);
  console.log(`   - Collections:   /api/collections`);
  console.log(`   - Reports:       /api/reports`);
  console.log(`   - Follow:        /api/follow`);
  console.log(`   - Health:        /api/health\n`);
});
