/*
 * Instagram Clone - Notifications Component
 * Cloned by Phumeh
 */

import React, { useState, useEffect } from 'react';
import config from '../config';

const Notifications = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_URL}/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
    setLoading(false);
  };

  const getNotificationText = (notification) => {
    switch (notification.type) {
      case 'like_post':
        return 'liked your post';
      case 'comment_post':
        return 'commented on your post';
      case 'follow':
        return 'started following you';
      case 'mention_post':
        return 'mentioned you in a post';
      default:
        return notification.message || 'sent you a notification';
    }
  };

  if (loading) {
    return (
      <div className="notifications-page">
        <div className="loading">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h2>Notifications</h2>
      </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="no-notifications">
            <h3>No notifications yet</h3>
            <p>When someone likes or comments on your posts, you'll see it here.</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div key={notification._id} className="notification-item">
              <img 
                src={notification.sender?.profilePicture || '/default-avatar.svg'} 
                alt={notification.sender?.username}
                className="notification-avatar"
              />
              <div className="notification-content">
                <div className="notification-text">
                  <strong>{notification.sender?.username}</strong> {getNotificationText(notification)}
                </div>
                <div className="notification-time">
                  {new Date(notification.createdAt).toLocaleDateString()}
                </div>
              </div>
              {notification.content?.post && (
                <img 
                  src={notification.content.post.media?.[0]?.url} 
                  alt="Post"
                  className="notification-post-image"
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;