/*
 * Instagram Clone - Messages Component
 * Cloned by Phumeh
 */

import React, { useState, useEffect } from 'react';
import config from '../config';

const Messages = ({ user }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_URL}/messages/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="messages-page">
        <div className="loading">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="messages-page">
      <div className="messages-header">
        <h2>Messages</h2>
        <button className="new-message-btn">+</button>
      </div>

      <div className="conversations-list">
        {conversations.length === 0 ? (
          <div className="no-messages">
            <h3>Your Messages</h3>
            <p>Send private photos and messages to a friend or group.</p>
            <button className="send-message-btn">Send Message</button>
          </div>
        ) : (
          conversations.map(conversation => (
            <div key={conversation._id} className="conversation-item">
              <img 
                src={conversation.participants[0]?.profilePicture || '/default-avatar.svg'} 
                alt="User"
                className="conversation-avatar"
              />
              <div className="conversation-info">
                <div className="conversation-name">
                  {conversation.isGroup ? 
                    conversation.groupName : 
                    conversation.participants[0]?.username
                  }
                </div>
                <div className="last-message">
                  {conversation.lastMessage?.content?.text || 'No messages yet'}
                </div>
              </div>
              <div className="conversation-time">
                {conversation.lastMessage && 
                  new Date(conversation.lastMessage.createdAt).toLocaleDateString()
                }
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Messages;