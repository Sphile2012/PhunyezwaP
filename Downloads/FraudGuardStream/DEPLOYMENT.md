# Instagram Clone Deployment Guide
**Created by Phumeh**

## 🗄️ Database: SQLite with Sequelize

This project now uses **SQLite with Sequelize** instead of MongoDB. The SQLite database file is created automatically at `backend/database.sqlite`.

## 🚀 Local Development

### Install Dependencies
```bash
# Install all dependencies
npm run install-deps

# Or manually:
cd backend && npm install
cd ../frontend && npm install
```

### Run Locally
```bash
# Run both frontend and backend
npm run dev

# Or run separately:
cd backend && npm run dev    # Backend on port 5000
cd frontend && npm start     # Frontend on port 3000
```

## 🌐 Deploy to Netlify (Frontend Only)

Since SQLite requires persistent storage, for Netlify deployment we recommend:

### Option 1: Frontend on Netlify + Backend on Render/Railway

1. **Deploy Backend to Render/Railway:**
   - Create account on https://render.com or https://railway.app
   - Connect your GitHub repo
   - Set build command: `cd backend && npm install`
   - Set start command: `cd backend && npm start`
   - Add environment variables:
     - `JWT_SECRET=your-secret-key`
     - `NODE_ENV=production`

2. **Deploy Frontend to Netlify:**
   - Go to https://app.netlify.com
   - Connect your GitHub repo
   - Set build command: `cd frontend && npm install && npm run build`
   - Set publish directory: `frontend/build`
   - Add environment variable:
     - `REACT_APP_API_URL=https://your-backend-url.onrender.com`

### Option 2: Use Turso (Serverless SQLite)

For true serverless deployment with SQLite, use [Turso](https://turso.tech):

1. Create Turso account and database
2. Update `backend/config/database.js` to use Turso connection
3. Add Turso credentials to environment variables

## 📡 API Endpoints

All API endpoints are available at `/api/*`:

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create post
- `PUT /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comment` - Add comment

### Users
- `GET /api/users/:username` - Get user profile
- `PUT /api/users/:id/follow` - Follow/unfollow user
- `GET /api/users/suggestions/for-you` - Get suggestions

### Stories
- `GET /api/stories/feed` - Get stories feed
- `POST /api/stories` - Create story
- `PUT /api/stories/:id/view` - Mark story viewed

### Reels
- `GET /api/reels/feed` - Get reels feed
- `POST /api/reels` - Create reel
- `PUT /api/reels/:id/like` - Like/unlike reel

### Search
- `GET /api/search/users?q=query` - Search users
- `GET /api/search/hashtags?q=query` - Search hashtags

### Messages
- `GET /api/messages/conversations` - Get conversations
- `POST /api/messages/conversations` - Create conversation
- `GET /api/messages/conversations/:id/messages` - Get messages
- `POST /api/messages/conversations/:id/messages` - Send message

### Notifications
- `GET /api/notifications` - Get notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/read-all` - Mark all read

### Health
- `GET /api/health` - API health check

## 📱 Features

- ✅ User authentication (JWT)
- ✅ Create/view posts
- ✅ Like and comment on posts
- ✅ Follow/unfollow users
- ✅ Stories (24-hour expiry)
- ✅ Reels
- ✅ Direct messages
- ✅ Search users/hashtags
- ✅ Notifications
- ✅ User profiles
- ✅ SQLite database (no external database needed!)

## 🗄️ Database Schema

The SQLite database includes these tables:
- `users` - User accounts
- `posts` - Posts/photos
- `comments` - Post comments
- `likes` - Likes on posts/comments/reels
- `follows` - User relationships
- `stories` - Stories
- `story_views` - Story view tracking
- `reels` - Video reels
- `conversations` - Message conversations
- `messages` - Direct messages
- `notifications` - User notifications
- `collections` - Saved post collections
- `highlights` - Story highlights
- `reports` - Content reports

---

**Your Instagram Clone is ready! 🚀**

Created by Phumeh
