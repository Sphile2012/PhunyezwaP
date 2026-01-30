# Instagram Clone

**Created by Phumeh** 📱

A full-featured Instagram clone with all the major features of the original platform.

## ✨ Features

### 👤 User Management
- Sign up with email/phone/username
- Login/Logout with JWT authentication
- Edit profile (bio, picture, website)
- Switch between public/private accounts
- Follow/Unfollow users
- Block, restrict, mute, and report accounts
- Close friends list management
- Two-factor authentication (coming soon)

### 📸 Posts
- Upload photos and videos
- Apply filters and effects
- Add captions, hashtags, locations
- Tag people
- Like, comment, save, share posts
- Edit and delete posts
- Archive posts
- Control comment permissions

### 📖 Stories
- 24-hour disappearing content
- Add polls, questions, quizzes
- Music, stickers, GIFs
- View story analytics
- Create highlights
- Story privacy settings

### 🎬 Reels
- Create short-form videos
- Add audio, effects, captions
- Like, comment, share, save
- Remix other reels
- Explore trending content

### 🔴 Live Video
- Go live instantly
- Invite guests
- Live comments and reactions
- Pin comments
- Save/delete live videos

### 💬 Direct Messages
- Text, voice, photos, videos
- GIFs and stickers
- Group chats
- Voice/video calls
- Unsend messages
- Message requests

### 🔍 Explore & Search
- Discover new content
- Search users, hashtags, locations
- Trending topics

### 🔔 Notifications
- Real-time notifications
- Customizable notification settings
- Activity feed

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (or use demo mode)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Sphile2012/PhunyezwaP.git

# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cp .env.example .env  # Edit with your values

# Install frontend dependencies
cd ../frontend
npm install
```

### Running Locally

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

Visit `http://localhost:3000`

### Demo Mode
The app works without MongoDB! Just start the frontend and login with any credentials.

## 🌐 Deployment

### Netlify (Recommended)

1. Push to GitHub
2. Connect to Netlify
3. Add environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

Build settings are pre-configured in `netlify.toml`.

## 📡 API Endpoints

| Category | Endpoints |
|----------|-----------|
| Auth | `/api/auth/register`, `/api/auth/login`, `/api/auth/me` |
| Posts | `/api/posts`, `/api/posts/:id/like`, `/api/posts/:id/comment` |
| Users | `/api/users/:username`, `/api/users/:id/follow` |
| Stories | `/api/stories/feed`, `/api/stories/:id/view` |
| Reels | `/api/reels/feed`, `/api/reels/:id/like` |
| Live | `/api/live/start`, `/api/live/:id/end` |
| Messages | `/api/messages/conversations` |
| Notifications | `/api/notifications` |
| Search | `/api/search/users`, `/api/search/hashtags` |
| Collections | `/api/collections` |
| Follow | `/api/follow/request`, `/api/follow/requests` |
| Reports | `/api/reports` |

## 🛠️ Tech Stack

### Frontend
- React.js
- React Router
- Axios
- CSS3 with mobile-first design

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO for real-time features
- JWT authentication
- Cloudinary for media storage

### Deployment
- Netlify (frontend + serverless functions)
- MongoDB Atlas

## 📁 Project Structure

```
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       └── App.js
├── netlify/
│   └── functions/
├── netlify.toml
└── README.md
```

## 🔒 Environment Variables

```env
# Required
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret

# Optional (for media uploads)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

## 📱 Screenshots

*Coming soon*

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - Created by Phumeh

---

**Made with ❤️ by Phumeh**
