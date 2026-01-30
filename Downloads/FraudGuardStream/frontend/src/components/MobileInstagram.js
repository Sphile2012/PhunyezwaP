/*
 * Instagram Clone - Mobile Interface with Backend Integration
 * Cloned by Phumeh
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../config';

const MobileInstagram = ({ user, onLogout }) => {
  const [currentTab, setCurrentTab] = useState('home');
  const [stories, setStories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeedData();
  }, []);

  const fetchFeedData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch stories
      const storiesResponse = await fetch(`${config.API_URL}/stories/feed`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (storiesResponse.ok) {
        const storiesData = await storiesResponse.json();
        setStories(storiesData);
      }

      // Fetch posts
      const postsResponse = await fetch(`${config.API_URL}/posts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        setPosts(postsData);
      }
    } catch (error) {
      console.error('Error fetching feed data:', error);
      // Use demo data if backend is not available
      setStories([
        { id: 1, user: { username: 'Your story', profilePicture: 'https://picsum.photos/66/66?random=1' }, isOwn: true },
        { id: 2, user: { username: 'joshua_l', profilePicture: 'https://picsum.photos/66/66?random=2' } },
        { id: 3, user: { username: 'karennne', profilePicture: 'https://picsum.photos/66/66?random=3' } }
      ]);
      
      setPosts([
        {
          _id: 1,
          user: { username: 'heaven_is_nevaeh', profilePicture: 'https://picsum.photos/32/32?random=10' },
          media: [{ url: 'https://picsum.photos/414/500?random=20', type: 'image' }],
          likes: [1, 2, 3, 4],
          caption: 'Your favorite duo ❤️',
          createdAt: new Date().toISOString(),
          comments: []
        }
      ]);
    }
    setLoading(false);
  };

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_URL}/posts/${postId}/like`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPosts(posts.map(post => 
          post._id === postId 
            ? { ...post, likes: Array(data.likes).fill({}), isLiked: data.isLiked }
            : post
        ));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleTabClick = (tab) => {
    setCurrentTab(tab);
    switch (tab) {
      case 'search':
        navigate('/search');
        break;
      case 'messages':
        navigate('/messages');
        break;
      case 'notifications':
        navigate('/notifications');
        break;
      case 'profile':
        navigate(`/profile/${user.username}`);
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="mobile-instagram">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mobile-instagram">
      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-time">9:26</div>
        <div className="status-icons">
          <div className="signal-icon"></div>
          <div className="wifi-icon"></div>
          <div className="battery-icon"></div>
        </div>
      </div>

      {/* Instagram Header */}
      <div className="instagram-header">
        <div className="instagram-logo">Instagram</div>
        <div className="header-icons">
          <svg className="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" onClick={() => navigate('/notifications')}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <svg className="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" onClick={() => navigate('/messages')}>
            <path d="M22 2L2 22"></path>
            <path d="M17 2v20l-5-4-5 4V2z"></path>
          </svg>
        </div>
      </div>

      {/* Demo Notice */}
      <div className="demo-notice">
        Instagram Clone - Created by Phumeh 🚀
      </div>

      {/* Stories Section */}
      <div className="stories-section">
        <div className="stories-container">
          {stories.map((story, index) => (
            <div key={story.id || index} className="story-item">
              <div className="story-avatar-container">
                {story.isOwn ? (
                  <div className="your-story">
                    <img src={story.user.profilePicture || user.profilePicture || 'https://picsum.photos/66/66?random=1'} alt={story.user.username} className="story-avatar" />
                    <div className="add-story-btn">+</div>
                  </div>
                ) : (
                  <div className="story-gradient-ring">
                    <img src={story.user.profilePicture} alt={story.user.username} className="story-avatar" />
                  </div>
                )}
              </div>
              <div className="story-username">{story.user.username}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Feed Posts */}
      <div className="feed-container">
        {posts.map((post) => (
          <div key={post._id} className="post">
            {/* Post Header */}
            <div className="post-header">
              <div className="post-user-info">
                <img src={post.user.profilePicture || '/default-avatar.svg'} alt={post.user.username} className="post-avatar" />
                <div>
                  <div className="post-username">{post.user.username}</div>
                </div>
              </div>
              <button className="post-menu">⋯</button>
            </div>

            {/* Post Image */}
            <img src={post.media?.[0]?.url || post.image} alt="Post" className="post-image" />

            {/* Post Actions */}
            <div className="post-actions">
              <div className="post-actions-left">
                <button className="action-btn" onClick={() => handleLike(post._id)}>
                  <svg className="action-icon" viewBox="0 0 24 24" fill={post.isLiked ? "red" : "none"} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </button>
                <button className="action-btn">
                  <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </button>
                <button className="action-btn">
                  <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                    <polyline points="16,6 12,2 8,6"></polyline>
                    <line x1="12" y1="2" x2="12" y2="15"></line>
                  </svg>
                </button>
              </div>
              <button className="action-btn">
                <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
              </button>
            </div>

            {/* Post Likes */}
            <div className="post-likes">
              {post.likes?.length || 0} likes
            </div>

            {/* Post Caption */}
            <div className="post-caption">
              <span className="username">{post.user.username}</span>
              {post.caption}
            </div>

            {/* Post Comments Link */}
            <div className="post-comments-link">
              View all {post.comments?.length || 0} comments
            </div>

            {/* Post Time */}
            <div className="post-time">
              {new Date(post.createdAt).toLocaleDateString().toUpperCase()}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <div className={`nav-item ${currentTab === 'home' ? 'active' : ''}`} onClick={() => handleTabClick('home')}>
          <svg className="nav-icon" viewBox="0 0 24 24" fill={currentTab === 'home' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9,22 9,12 15,12 15,22"></polyline>
          </svg>
        </div>
        <div className={`nav-item ${currentTab === 'search' ? 'active' : ''}`} onClick={() => handleTabClick('search')}>
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="M21 21l-4.35-4.35"></path>
          </svg>
        </div>
        <div className={`nav-item ${currentTab === 'reels' ? 'active' : ''}`} onClick={() => handleTabClick('reels')}>
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
        </div>
        <div className={`nav-item ${currentTab === 'shop' ? 'active' : ''}`} onClick={() => handleTabClick('shop')}>
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
        </div>
        <div className={`nav-item ${currentTab === 'profile' ? 'active' : ''}`} onClick={() => handleTabClick('profile')}>
          <img 
            src={user.profilePicture || 'https://picsum.photos/24/24?random=99'} 
            alt="Profile" 
            className="profile-nav-icon"
          />
        </div>
      </div>

      {/* Home Indicator */}
      <div className="home-indicator"></div>
    </div>
  );
};

export default MobileInstagram;