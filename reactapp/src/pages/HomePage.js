import React from 'react';
import './homePage.css';

const HomePage = () => {
  return (
    <div className="forum-container">
      <div className="forum-header">
        <p className="header-subtitle">WELCOME TO</p>
        <h1 className="header-title">Our Forum</h1>
        <p className="header-image-source">Image from Freepik</p>
      </div>
      <div className="forum-image">
        <img src="https://images.inc.com/uploaded_files/image/1920x1080/getty_541975802_243006.jpg" alt="Forum discussion" />
      </div>
      <div className="categories">
        <div className="category-card">
          <div className="category-icon">💬</div>
          <h3>General Discussion</h3>
          <p>Join the conversation about anything and everything.</p>
        </div>
        <div className="category-card">
          <div className="category-icon">📰</div>
          <h3>News & Updates</h3>
          <p>Stay informed with the latest news and updates.</p>
        </div>
        <div className="category-card">
          <div className="category-icon">📚</div>
          <h3>Knowledge Base</h3>
          <p>Share and gain knowledge with community experts.</p>
        </div>
        <div className="category-card">
          <div className="category-icon">🛠️</div>
          <h3>Support</h3>
          <p>Get help and support from other members.</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
