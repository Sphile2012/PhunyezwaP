-- Supabase / Postgres schema for Instaclone demo
-- Run this in Supabase SQL Editor (adjust types/constraints as needed)

-- Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  fullName TEXT,
  avatar TEXT,
  bio TEXT,
  followersCount INTEGER DEFAULT 0,
  followingCount INTEGER DEFAULT 0,
  postsCount INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Posts
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  userId TEXT REFERENCES users(id) ON DELETE SET NULL,
  username TEXT,
  userAvatar TEXT,
  imageUrl TEXT,
  caption TEXT,
  likes JSONB DEFAULT '[]',
  comments JSONB DEFAULT '[]',
  createdAt BIGINT,
  location TEXT
);

-- Stories
CREATE TABLE IF NOT EXISTS stories (
  id TEXT PRIMARY KEY,
  userId TEXT REFERENCES users(id) ON DELETE SET NULL,
  username TEXT,
  avatar TEXT,
  imageUrl TEXT,
  createdAt BIGINT,
  seen BOOLEAN DEFAULT FALSE
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  type TEXT,
  userId TEXT,
  username TEXT,
  userAvatar TEXT,
  postId TEXT,
  postImage TEXT,
  text TEXT,
  createdAt BIGINT
);

-- Follows
CREATE TABLE IF NOT EXISTS follows (
  id TEXT PRIMARY KEY,
  followerId TEXT REFERENCES users(id) ON DELETE CASCADE,
  followingId TEXT REFERENCES users(id) ON DELETE CASCADE
);

-- Saved posts
CREATE TABLE IF NOT EXISTS saved_posts (
  id TEXT PRIMARY KEY,
  userId TEXT REFERENCES users(id) ON DELETE CASCADE,
  postId TEXT REFERENCES posts(id) ON DELETE CASCADE
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_posts_userId ON posts(userId);
CREATE INDEX IF NOT EXISTS idx_stories_userId ON stories(userId);
CREATE INDEX IF NOT EXISTS idx_notifications_userId ON notifications(userId);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(followerId);
CREATE INDEX IF NOT EXISTS idx_saved_user ON saved_posts(userId);
