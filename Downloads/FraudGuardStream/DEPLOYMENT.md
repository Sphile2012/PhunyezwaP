# Instagram Clone Deployment Guide
**Created by Phumeh**

## ✅ Full Stack Ready for Netlify!

Both frontend and backend (serverless functions) are configured for Netlify deployment.

## 🚀 Deploy to Netlify

### Step 1: Set Up MongoDB Atlas (Required)
1. Go to https://www.mongodb.com/atlas
2. Create a free account and cluster
3. Create a database user and get your connection string
4. Whitelist `0.0.0.0/0` for IP access

### Step 2: Set Up Cloudinary (For Image Uploads)
1. Go to https://cloudinary.com
2. Create a free account
3. Get your Cloud Name, API Key, and API Secret from Dashboard

### Step 3: Push to GitHub
```bash
git add .
git commit -m "Instagram Clone by Phumeh - Full Stack Ready"
git push origin main
```

### Step 4: Deploy on Netlify
1. Go to https://app.netlify.com
2. Click **"New site from Git"**
3. Connect GitHub and select your repo
4. Build settings (auto-detected from netlify.toml):
   - **Base directory:** `frontend`
   - **Build command:** `npm install && npm run build`
   - **Publish directory:** `frontend/build`
   - **Functions directory:** `netlify/functions`

### Step 5: Add Environment Variables
In Netlify Dashboard → Site Settings → Environment Variables, add:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/instagram` |
| `JWT_SECRET` | `your-super-secret-jwt-key-make-it-long` |
| `CLOUDINARY_CLOUD_NAME` | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | `your-api-key` |
| `CLOUDINARY_API_SECRET` | `your-api-secret` |

### Step 6: Redeploy
After adding environment variables, trigger a new deploy.

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
- `GET /api/reels/:id` - Get single reel
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

## 🔧 Local Development

### Install Functions Dependencies
```bash
cd netlify/functions
npm install
cd ../..
```

### Run Frontend Locally
```bash
cd frontend
npm start
```

### Test API Locally with Netlify CLI
```bash
npm install -g netlify-cli
netlify dev
```

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
- ✅ Cloudinary image uploads

## ⚠️ Notes

1. **Serverless Limitations**: WebSocket/Socket.IO features won't work (real-time messaging uses polling instead)
2. **Cold Starts**: First request after inactivity may be slow
3. **File Uploads**: Use Cloudinary URLs in POST requests (client-side upload to Cloudinary, then send URL to API)

---

**Your Full Stack Instagram Clone is ready! 🚀**

Created by Phumeh
