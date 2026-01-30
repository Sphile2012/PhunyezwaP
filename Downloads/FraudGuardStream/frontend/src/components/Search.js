/*
 * Instagram Clone - Search Component
 * Cloned by Phumeh
 */

import React, { useState, useEffect } from 'react';
import config from '../config';

const Search = ({ user }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({
    users: [],
    hashtags: [],
    locations: []
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('users');

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults({ users: [], hashtags: [], locations: [] });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Search users
      const usersResponse = await fetch(`${config.API_URL}/search/users?q=${encodeURIComponent(searchQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const users = usersResponse.ok ? await usersResponse.json() : [];

      // Search hashtags
      const hashtagsResponse = await fetch(`${config.API_URL}/search/hashtags?q=${encodeURIComponent(searchQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const hashtags = hashtagsResponse.ok ? await hashtagsResponse.json() : [];

      setResults({ users, hashtags, locations: [] });
    } catch (error) {
      console.error('Search error:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleSearch(query);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  return (
    <div className="search-page">
      <div className="search-header">
        <div className="search-input-container">
          <input
            type="text"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="search-tabs">
        <button 
          className={`search-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={`search-tab ${activeTab === 'hashtags' ? 'active' : ''}`}
          onClick={() => setActiveTab('hashtags')}
        >
          Tags
        </button>
      </div>

      <div className="search-results">
        {loading ? (
          <div className="loading">Searching...</div>
        ) : (
          <>
            {activeTab === 'users' && (
              <div className="users-results">
                {results.users.map(searchUser => (
                  <div key={searchUser._id} className="user-result">
                    <img 
                      src={searchUser.profilePicture || '/default-avatar.svg'} 
                      alt={searchUser.username}
                      className="user-avatar"
                    />
                    <div className="user-info">
                      <div className="username">
                        {searchUser.username}
                        {searchUser.isVerified && <span className="verified">✓</span>}
                      </div>
                      <div className="full-name">{searchUser.fullName}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'hashtags' && (
              <div className="hashtags-results">
                {results.hashtags.map(tag => (
                  <div key={tag.hashtag} className="hashtag-result">
                    <div className="hashtag-info">
                      <div className="hashtag-name">#{tag.hashtag}</div>
                      <div className="hashtag-count">{tag.postCount} posts</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Search;