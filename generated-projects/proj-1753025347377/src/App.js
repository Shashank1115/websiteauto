import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <div className="sidebar">
        <div className="logo">Instagram</div>
        <ul>
          <li><i className="home-icon">&#128340;</i>Home</li>
          <li><i className="search-icon">&#128269;</i>Search</li>
          <li><i className="compass-icon">&#9760;</i>Explore</li>
          <li><i className="reel-icon">&#127919;</i>Reels</li>
          <li><i className="messages-icon">&#128172;</i><span className="message-count">1</span> Messages</li>
          <li><i className="heart-icon">&#10084;</i>Notifications</li>
          <li><i className="plus-icon">&#10133;</i>Create</li>
          <li><i className="profile-icon">&#128100;</i>Profile</li>
          <li>Meta AI</li>
          <li>AI Studio</li>
          <li>Threads</li>
          <li>More</li>
        </ul>
      </div>
      <div className="main-content">
        <div className="story-container">
          <div className="story-item"><img src="https://placehold.co/60x60" alt="Story 1" /></div>
          <div className="story-item"><img src="https://placehold.co/60x60" alt="Story 2" /></div>
          <div className="story-item"><img src="https://placehold.co/60x60" alt="Story 3" /></div>
          <div className="story-item"><img src="https://placehold.co/60x60" alt="Story 4" /></div>
          <div className="story-item"><img src="https://placehold.co/60x60" alt="Story 5" /></div>
          <div className="story-item"><img src="https://placehold.co/60x60" alt="Story 6" /></div>
        </div>
        <div className="post-container">
          <img src="https://placehold.co/300x300" alt="Post" />
        </div>
        <div className="suggestions">
            <h3>Suggested for you</h3>
            <div className="suggestion-item">
                <img src="https://placehold.co/40x40" alt="Suggestion 1"/>
                <div>Username</div>
                <button>Follow</button>
            </div>
            <div className="suggestion-item">
                <img src="https://placehold.co/40x40" alt="Suggestion 2"/>
                <div>Username</div>
                <button>Follow</button>
            </div>
            <div className="suggestion-item">
                <img src="https://placehold.co/40x40" alt="Suggestion 3"/>
                <div>Username</div>
                <button>Follow</button>
            </div>
            <div className="suggestion-item">
                <img src="https://placehold.co/40x40" alt="Suggestion 4"/>
                <div>Username</div>
                <button>Follow</button>
            </div>
        </div>
        <div className="messages-button">
          <i className="messages-icon">&#128172;</i><span className="message-count">1</span> Messages
        </div>
      </div>
    </div>
  );
}

export default App;