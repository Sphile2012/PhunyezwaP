/*
 * Instagram Clone - Demo Feed Component
 * Cloned by Phumeh
 */

import React from 'react';

const DemoFeed = () => {
  const demoPosts = [
    {
      id: 1,
      user: { username: 'phumeh', profilePicture: '/default-avatar.svg' },
      image: 'https://picsum.photos/600/600?random=1',
      caption: 'Welcome to my Instagram Clone! 🚀',
      likes: 42,
      comments: [
        { user: { username: 'demo_user' }, text: 'Amazing work!' }
      ]
    },
    {
      id: 2,
      user: { username: 'phumeh', profilePicture: '/default-avatar.svg' },
      image: 'https://picsum.photos/600/600?random=2',
      caption: 'Built with MERN stack 💻',
      likes: 28,
      comments: []
    }
  ];

  return (
    <div className="feed">
      <div className="demo-notice">
        <h3>Instagram Clone Demo</h3>
        <p>Created by Phumeh - Backend coming soon!</p>
      </div>
      
      <div className="posts-container">
        {demoPosts.map(post => (
          <div key={post.id} className="post-card">
            <div className="post-header">
              <img 
                src={post.user.profilePicture} 
                alt={post.user.username}
                className="profile-pic"
              />
              <span className="username">{post.user.username}</span>
            </div>
            
            <img src={post.image} alt="Post" className="post-image" />
            
            <div className="post-actions">
              <button className="like-btn">
                ❤️ {post.likes}
              </button>
            </div>
            
            <div className="post-caption">
              <strong>{post.user.username}</strong> {post.caption}
            </div>
            
            <div className="comments-section">
              {post.comments.map((comment, index) => (
                <div key={index} className="comment">
                  <strong>{comment.user.username}</strong> {comment.text}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DemoFeed;