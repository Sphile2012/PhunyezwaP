/*
 * Instagram Clone - Profile Component
 * Cloned by Phumeh
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import config from '../config';

const Profile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${config.API_URL}/users/${username}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!profile) {
    return <div className="error">User not found</div>;
  }

  return (
    <div className="profile">
      <div className="profile-header">
        <img 
          src={profile.user.profilePicture || '/default-avatar.svg'} 
          alt={profile.user.username}
          className="profile-avatar"
        />
        <div className="profile-info">
          <h2>{profile.user.username}</h2>
          <div className="profile-stats">
            <span>{profile.posts.length} posts</span>
            <span>{profile.user.followers} followers</span>
            <span>{profile.user.following} following</span>
          </div>
          {profile.user.bio && <p className="profile-bio">{profile.user.bio}</p>}
        </div>
      </div>
      
      <div className="profile-posts">
        {profile.posts.map(post => (
          <div key={post._id} className="profile-post">
            <img src={post.image} alt="Post" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;