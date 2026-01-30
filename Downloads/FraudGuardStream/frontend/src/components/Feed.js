/*
 * Instagram Clone - Feed Component
 * Cloned by Phumeh
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PostCard from './PostCard';
import CreatePost from './CreatePost';
import config from '../config';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.API_URL}/posts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setLoading(false);
    }
  };

  const handleNewPost = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="feed">
      <CreatePost onPostCreated={handleNewPost} />
      <div className="posts-container">
        {posts.map(post => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default Feed;