/*
 * Instagram Clone - PostCard Component
 * Cloned by Phumeh
 */

import React, { useState } from 'react';
import axios from 'axios';
import config from '../config';

const PostCard = ({ post }) => {
  const [likes, setLikes] = useState(post.likes.length);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState(post.comments);
  const [newComment, setNewComment] = useState('');

  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${config.API_URL}/posts/${post._id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLikes(response.data.likes);
      setIsLiked(response.data.isLiked);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${config.API_URL}/posts/${post._id}/comment`,
        { text: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments([...comments, response.data]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <img 
          src={post.user.profilePicture || '/default-avatar.svg'} 
          alt={post.user.username}
          className="profile-pic"
        />
        <span className="username">{post.user.username}</span>
      </div>
      
      <img src={post.image} alt="Post" className="post-image" />
      
      <div className="post-actions">
        <button 
          onClick={handleLike} 
          className={`like-btn ${isLiked ? 'liked' : ''}`}
        >
          ❤️ {likes}
        </button>
      </div>
      
      {post.caption && (
        <div className="post-caption">
          <strong>{post.user.username}</strong> {post.caption}
        </div>
      )}
      
      <div className="comments-section">
        {comments.map((comment, index) => (
          <div key={index} className="comment">
            <strong>{comment.user.username}</strong> {comment.text}
          </div>
        ))}
        
        <form onSubmit={handleComment} className="comment-form">
          <input
            type="text"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button type="submit">Post</button>
        </form>
      </div>
    </div>
  );
};

export default PostCard;