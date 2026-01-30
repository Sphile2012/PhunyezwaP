/*
 * Instagram Clone - CreatePost Component
 * Cloned by Phumeh
 */

import React, { useState } from 'react';
import axios from 'axios';
import config from '../config';

const CreatePost = ({ onPostCreated }) => {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', image);
    formData.append('caption', caption);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${config.API_URL}/posts`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      onPostCreated(response.data);
      setImage(null);
      setCaption('');
    } catch (error) {
      console.error('Error creating post:', error);
    }
    setLoading(false);
  };

  return (
    <div className="create-post">
      <h3>Create New Post</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          required
        />
        <textarea
          placeholder="Write a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        <button type="submit" disabled={loading || !image}>
          {loading ? 'Posting...' : 'Share Post'}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;