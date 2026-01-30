/*
 * Instagram Clone - Stories Component
 * Cloned by Phumeh
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

const Stories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.API_URL}/stories/feed`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStories(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stories:', error);
      setLoading(false);
    }
  };

  const openStory = (userStories, index = 0) => {
    setSelectedStory(userStories);
    setCurrentStoryIndex(index);
  };

  const closeStory = () => {
    setSelectedStory(null);
    setCurrentStoryIndex(0);
  };

  const nextStory = () => {
    if (currentStoryIndex < selectedStory.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      // Move to next user's stories
      const currentUserIndex = stories.findIndex(s => s.user._id === selectedStory.user._id);
      if (currentUserIndex < stories.length - 1) {
        openStory(stories[currentUserIndex + 1], 0);
      } else {
        closeStory();
      }
    }
  };

  const prevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    } else {
      // Move to previous user's stories
      const currentUserIndex = stories.findIndex(s => s.user._id === selectedStory.user._id);
      if (currentUserIndex > 0) {
        const prevUserStories = stories[currentUserIndex - 1];
        openStory(prevUserStories, prevUserStories.stories.length - 1);
      }
    }
  };

  const viewStory = async (storyId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${config.API_URL}/stories/${storyId}/view`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error viewing story:', error);
    }
  };

  if (loading) {
    return <div className="stories-loading">Loading stories...</div>;
  }

  return (
    <div className="stories-container">
      <div className="stories-list">
        {stories.map((userStories) => (
          <div 
            key={userStories.user._id} 
            className="story-item"
            onClick={() => openStory(userStories)}
          >
            <div className="story-avatar">
              <img 
                src={userStories.user.profilePicture || '/default-avatar.svg'} 
                alt={userStories.user.username}
              />
              <div className="story-ring"></div>
            </div>
            <span className="story-username">{userStories.user.username}</span>
          </div>
        ))}
      </div>

      {selectedStory && (
        <div className="story-viewer">
          <div className="story-overlay" onClick={closeStory}></div>
          <div className="story-content">
            <div className="story-header">
              <div className="story-progress">
                {selectedStory.stories.map((_, index) => (
                  <div 
                    key={index} 
                    className={`progress-bar ${index <= currentStoryIndex ? 'active' : ''}`}
                  ></div>
                ))}
              </div>
              <div className="story-user-info">
                <img 
                  src={selectedStory.user.profilePicture || '/default-avatar.svg'} 
                  alt={selectedStory.user.username}
                />
                <span>{selectedStory.user.username}</span>
                <span className="story-time">
                  {new Date(selectedStory.stories[currentStoryIndex].createdAt).toLocaleTimeString()}
                </span>
              </div>
              <button className="close-story" onClick={closeStory}>×</button>
            </div>

            <div className="story-media">
              {selectedStory.stories[currentStoryIndex].type === 'video' ? (
                <video 
                  src={selectedStory.stories[currentStoryIndex].media.url}
                  autoPlay
                  muted
                  onEnded={nextStory}
                />
              ) : (
                <img 
                  src={selectedStory.stories[currentStoryIndex].media.url}
                  alt="Story"
                />
              )}
              
              <button className="story-nav prev" onClick={prevStory}>‹</button>
              <button className="story-nav next" onClick={nextStory}>›</button>
            </div>

            <div className="story-actions">
              <input 
                type="text" 
                placeholder="Send message..." 
                className="story-reply-input"
              />
              <button className="story-like">❤️</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stories;