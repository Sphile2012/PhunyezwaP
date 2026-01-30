/*
 * Instagram Clone - Reels Component
 * Cloned by Phumeh
 */

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import config from '../config';

const Reels = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const videoRefs = useRef([]);

  useEffect(() => {
    fetchReels();
  }, []);

  useEffect(() => {
    // Auto-play current video and pause others
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentReelIndex) {
          video.play();
        } else {
          video.pause();
        }
      }
    });
  }, [currentReelIndex]);

  const fetchReels = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.API_URL}/reels/feed`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReels(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reels:', error);
      setLoading(false);
    }
  };

  const handleLike = async (reelId, index) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${config.API_URL}/reels/${reelId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const updatedReels = [...reels];
      updatedReels[index].likes = Array(response.data.likes).fill({});
      updatedReels[index].isLiked = response.data.isLiked;
      setReels(updatedReels);
    } catch (error) {
      console.error('Error liking reel:', error);
    }
  };

  const handleComment = async (reelId, text, index) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${config.API_URL}/reels/${reelId}/comment`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const updatedReels = [...reels];
      updatedReels[index].comments.push(response.data);
      setReels(updatedReels);
    } catch (error) {
      console.error('Error commenting on reel:', error);
    }
  };

  const handleShare = async (reelId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${config.API_URL}/reels/${reelId}/share`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Reel shared!');
    } catch (error) {
      console.error('Error sharing reel:', error);
    }
  };

  const scrollToReel = (direction) => {
    if (direction === 'up' && currentReelIndex > 0) {
      setCurrentReelIndex(currentReelIndex - 1);
    } else if (direction === 'down' && currentReelIndex < reels.length - 1) {
      setCurrentReelIndex(currentReelIndex + 1);
    }
  };

  if (loading) {
    return <div className="reels-loading">Loading reels...</div>;
  }

  return (
    <div className="reels-container">
      <div className="reels-header">
        <h2>Reels</h2>
        <span className="reels-subtitle">by Phumeh</span>
      </div>

      <div className="reels-feed">
        {reels.map((reel, index) => (
          <div 
            key={reel._id} 
            className={`reel-item ${index === currentReelIndex ? 'active' : ''}`}
          >
            <div className="reel-video-container">
              <video
                ref={el => videoRefs.current[index] = el}
                src={reel.video.url}
                poster={reel.video.thumbnail}
                loop
                muted
                playsInline
                className="reel-video"
                onClick={() => {
                  const video = videoRefs.current[index];
                  if (video.paused) {
                    video.play();
                  } else {
                    video.pause();
                  }
                }}
              />

              <div className="reel-overlay">
                <div className="reel-user-info">
                  <img 
                    src={reel.user.profilePicture || '/default-avatar.svg'} 
                    alt={reel.user.username}
                    className="reel-avatar"
                  />
                  <span className="reel-username">
                    {reel.user.username}
                    {reel.user.isVerified && <span className="verified">✓</span>}
                  </span>
                  <button className="follow-btn">Follow</button>
                </div>

                <div className="reel-caption">
                  <p>{reel.caption}</p>
                  {reel.hashtags.map((tag, i) => (
                    <span key={i} className="hashtag">#{tag}</span>
                  ))}
                </div>

                {reel.audio && (
                  <div className="reel-audio">
                    <span>🎵 {reel.audio.title} - {reel.audio.artist}</span>
                  </div>
                )}
              </div>

              <div className="reel-actions">
                <button 
                  className={`action-btn like ${reel.isLiked ? 'liked' : ''}`}
                  onClick={() => handleLike(reel._id, index)}
                >
                  ❤️
                  <span>{reel.likes.length}</span>
                </button>

                <button className="action-btn comment">
                  💬
                  <span>{reel.comments.length}</span>
                </button>

                <button 
                  className="action-btn share"
                  onClick={() => handleShare(reel._id)}
                >
                  📤
                </button>

                <button className="action-btn more">
                  ⋯
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="reel-navigation">
        <button 
          className="nav-btn up"
          onClick={() => scrollToReel('up')}
          disabled={currentReelIndex === 0}
        >
          ↑
        </button>
        <button 
          className="nav-btn down"
          onClick={() => scrollToReel('down')}
          disabled={currentReelIndex === reels.length - 1}
        >
          ↓
        </button>
      </div>
    </div>
  );
};

export default Reels;