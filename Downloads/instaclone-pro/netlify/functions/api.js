const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');

const useSupabase = !!(process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY));
let supabase = null;
if (useSupabase) {
  const { createClient } = require('@supabase/supabase-js');
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);
}

const readData = async (name) => {
  if (useSupabase) {
    try {
      const { data, error } = await supabase.from(name).select('*');
      if (error) {
        console.error('supabase read error', name, error);
        return [];
      }
      return data || [];
    } catch (e) {
      console.error('supabase read exception', e);
      return [];
    }
  }

  try {
    const file = path.join(DATA_DIR, `${name}.json`);
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    console.error('readData error', e);
    return [];
  }
};

const writeData = async (name, data) => {
  if (useSupabase) {
    try {
      // naive upsert: relies on Supabase table having a primary key `id`
      if (Array.isArray(data)) {
        const { error } = await supabase.from(name).upsert(data, { onConflict: 'id' });
        if (error) console.error('supabase upsert error', name, error);
      } else {
        const { error } = await supabase.from(name).upsert(data, { onConflict: 'id' });
        if (error) console.error('supabase upsert error', name, error);
      }
      return;
    } catch (e) {
      console.error('supabase write exception', e);
      return;
    }
  }

  try {
    const file = path.join(DATA_DIR, `${name}.json`);
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('writeData error', e);
  }
};

const json = (status, body) => ({
  statusCode: status,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

exports.handler = async function (event) {
  const { httpMethod: method, path: reqPath, body } = event;

  try {
    // route matching
    // GET /api/posts
    if (method === 'GET' && reqPath === '/api/posts') {
      const posts = await readData('posts');
      posts.sort((a, b) => b.createdAt - a.createdAt);
      return json(200, posts);
    }

    // GET /api/stories
    if (method === 'GET' && reqPath === '/api/stories') {
      const stories = await readData('stories');
      stories.sort((a, b) => b.createdAt - a.createdAt);
      return json(200, stories);
    }

    // GET /api/notifications
    if (method === 'GET' && reqPath === '/api/notifications') {
      const notifications = await readData('notifications');
      notifications.sort((a, b) => b.createdAt - a.createdAt);
      return json(200, notifications);
    }

    // GET /api/users/:id
    if (method === 'GET' && reqPath.startsWith('/api/users/')) {
      const id = reqPath.split('/').pop();
      const users = await readData('users');
      const user = users.find(u => u.id === id);
      if (user) return json(200, user);
      return json(404, { error: 'User not found' });
    }

    // PUT /api/users/:id
    if (method === 'PUT' && reqPath.startsWith('/api/users/')) {
      const id = reqPath.split('/').pop();
      const updates = JSON.parse(body || '{}');
      const users = await readData('users');
      const idx = users.findIndex(u => u.id === id);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...updates };
        await writeData('users', users);
        return json(200, users[idx]);
      }
      return json(404, { error: 'User not found' });
    }

    // POST /api/posts
    if (method === 'POST' && reqPath === '/api/posts') {
      const { userId, username, userAvatar, imageUrl, caption } = JSON.parse(body || '{}');
      const posts = await readData('posts');
      const users = await readData('users');
      const newPost = {
        id: Math.random().toString(36).substr(2, 9),
        userId,
        username,
        userAvatar,
        imageUrl,
        caption,
        likes: [],
        comments: [],
        createdAt: Date.now()
      };
      posts.push(newPost);
      await writeData('posts', posts);
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        users[userIndex].postsCount = (users[userIndex].postsCount || 0) + 1;
        await writeData('users', users);
      }
      return json(200, newPost);
    }

    // PUT /api/posts/:id
    if (method === 'PUT' && reqPath.startsWith('/api/posts/')) {
      const id = reqPath.split('/').pop();
      const { caption } = JSON.parse(body || '{}');
      const posts = await readData('posts');
      const idx = posts.findIndex(p => p.id === id);
      if (idx !== -1) {
        posts[idx].caption = caption;
        await writeData('posts', posts);
        return json(200, posts[idx]);
      }
      return json(404, { error: 'Post not found' });
    }

    // DELETE /api/posts/:id
    if (method === 'DELETE' && reqPath.startsWith('/api/posts/')) {
      const id = reqPath.split('/').pop();
      const posts = await readData('posts');
      const users = await readData('users');
      const idx = posts.findIndex(p => p.id === id);
      if (idx !== -1) {
        const post = posts[idx];
        posts.splice(idx, 1);
        await writeData('posts', posts);
        const userIndex = users.findIndex(u => u.id === post.userId);
        if (userIndex !== -1) {
          users[userIndex].postsCount = Math.max(0, (users[userIndex].postsCount || 0) - 1);
          await writeData('users', users);
        }
        return json(200, { success: true });
      }
      return json(404, { error: 'Post not found' });
    }

    // POST /api/posts/:id/like
    if (method === 'POST' && /^\/api\/posts\/[^/]+\/like$/.test(reqPath)) {
      const id = reqPath.split('/')[3];
      const { userId, username, userAvatar } = JSON.parse(body || '{}');
      const posts = await readData('posts');
      const notifications = await readData('notifications');
      const idx = posts.findIndex(p => p.id === id);
      if (idx === -1) return json(404, { error: 'Post not found' });
      const post = posts[idx];
      const isLiked = post.likes.includes(userId);
      if (isLiked) post.likes = post.likes.filter(uid => uid !== userId);
      else {
        post.likes.push(userId);
        if (post.userId !== userId) {
          notifications.push({
            id: Math.random().toString(36).substr(2, 9),
            type: 'like',
            userId,
            username,
            userAvatar,
            postId: id,
            postImage: post.imageUrl,
            createdAt: Date.now()
          });
          await writeData('notifications', notifications);
        }
      }
      await writeData('posts', posts);
      return json(200, { likes: post.likes });
    }

    // POST /api/posts/:id/comments
    if (method === 'POST' && /^\/api\/posts\/[^/]+\/comments$/.test(reqPath)) {
      const id = reqPath.split('/')[3];
      const { userId, username, text, userAvatar } = JSON.parse(body || '{}');
      const posts = await readData('posts');
      const notifications = await readData('notifications');
      const idx = posts.findIndex(p => p.id === id);
      if (idx === -1) return json(404, { error: 'Post not found' });
      const comment = { id: Math.random().toString(36).substr(2, 9), userId, username, text, createdAt: Date.now() };
      posts[idx].comments.push(comment);
      await writeData('posts', posts);
      if (posts[idx].userId !== userId) {
        notifications.push({ id: Math.random().toString(36).substr(2, 9), type: 'comment', userId, username, userAvatar, postId: id, postImage: posts[idx].imageUrl, text, createdAt: Date.now() });
        await writeData('notifications', notifications);
      }
      return json(200, { comments: posts[idx].comments });
    }

    // DELETE /api/posts/:postId/comments/:commentId
    if (method === 'DELETE' && /^\/api\/posts\/[^/]+\/comments\/[^/]+$/.test(reqPath)) {
      const parts = reqPath.split('/');
      const postId = parts[3];
      const commentId = parts[5];
      const posts = await readData('posts');
      const idx = posts.findIndex(p => p.id === postId);
      if (idx === -1) return json(404, { error: 'Post not found' });
      posts[idx].comments = posts[idx].comments.filter(c => c.id !== commentId);
      await writeData('posts', posts);
      return json(200, { comments: posts[idx].comments });
    }

    // POST /api/stories
    if (method === 'POST' && reqPath === '/api/stories') {
      const { userId, username, avatar, imageUrl } = JSON.parse(body || '{}');
      const stories = await readData('stories');
      const newStory = { id: Math.random().toString(36).substr(2, 9), userId, username, avatar, imageUrl, createdAt: Date.now(), seen: false };
      stories.push(newStory);
      await writeData('stories', stories);
      return json(200, newStory);
    }

    // POST /api/follow
    if (method === 'POST' && reqPath === '/api/follow') {
      const { followerId, followingId, followerUsername, followerAvatar } = JSON.parse(body || '{}');
      const follows = readData('follows');
      const users = readData('users');
      const notifications = readData('notifications');
      const existingIndex = follows.findIndex(f => f.followerId === followerId && f.followingId === followingId);
      if (existingIndex !== -1) {
        follows.splice(existingIndex, 1);
        const followerIndex = users.findIndex(u => u.id === followerId);
        const followingIndex = users.findIndex(u => u.id === followingId);
        if (followerIndex !== -1) users[followerIndex].followingCount = Math.max(0, (users[followerIndex].followingCount || 0) - 1);
        if (followingIndex !== -1) users[followingIndex].followersCount = Math.max(0, (users[followingIndex].followersCount || 0) - 1);
      } else {
        follows.push({ followerId, followingId });
        const followerIndex = users.findIndex(u => u.id === followerId);
        const followingIndex = users.findIndex(u => u.id === followingId);
        if (followerIndex !== -1) users[followerIndex].followingCount = (users[followerIndex].followingCount || 0) + 1;
        if (followingIndex !== -1) users[followingIndex].followersCount = (users[followingIndex].followersCount || 0) + 1;
        notifications.push({ id: Math.random().toString(36).substr(2, 9), type: 'follow', userId: followerId, username: followerUsername, userAvatar: followerAvatar, createdAt: Date.now() });
      }
      writeData('follows', follows);
      writeData('users', users);
      writeData('notifications', notifications);
      return json(200, { success: true });
    }

    // GET /api/following/:userId
    if (method === 'GET' && reqPath.startsWith('/api/following/')) {
      const userId = reqPath.split('/').pop();
      const follows = await readData('follows');
      const following = follows.filter(f => f.followerId === userId).map(f => f.followingId);
      return json(200, following);
    }

    // POST /api/saved-posts
    if (method === 'POST' && reqPath === '/api/saved-posts') {
      const { userId, postId } = JSON.parse(body || '{}');
      const saved = await readData('saved_posts');
      const existingIndex = saved.findIndex(s => s.userId === userId && s.postId === postId);
      if (existingIndex !== -1) saved.splice(existingIndex, 1);
      else saved.push({ userId, postId });
      await writeData('saved_posts', saved);
      return json(200, { success: true });
    }

    // GET /api/saved-posts/:userId
    if (method === 'GET' && reqPath.startsWith('/api/saved-posts/')) {
      const userId = reqPath.split('/').pop();
      const saved = await readData('saved_posts');
      const list = saved.filter(s => s.userId === userId).map(s => s.postId);
      return json(200, list);
    }

    // POST /api/generate-caption
    if (method === 'POST' && reqPath === '/api/generate-caption') {
      try {
        const { imageBase64 } = JSON.parse(body || '{}');
        if (!imageBase64) return json(400, { error: 'Missing imageBase64' });
        const { GoogleGenAI } = require('@google/genai');
        const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
        if (!apiKey) return json(500, { error: 'Server missing GEMINI API key' });
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: { parts: [ { inlineData: { mimeType: 'image/jpeg', data: imageBase64.split(',')[1] || imageBase64 } }, { text: "Analyze this image and write a short, engaging Instagram caption with a few relevant hashtags. Keep it concise and trendy." } ] } });
        return json(200, { caption: response.text || 'Just another amazing day! ✨ #vibes' });
      } catch (err) {
        console.error('generate-caption error', err);
        return json(500, { error: 'Caption generation failed' });
      }
    }

    return json(404, { error: 'Not found' });
  } catch (err) {
    console.error('API function error', err);
    return json(500, { error: 'Internal server error' });
  }
};
