import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <div className="hero-section glass-card animate-fade-in">
      <div className="hero-content">
        <h1 className="hero-title text-gradient">NEERAI</h1>
        <h2 className="hero-subtitle">The Sustainability Layer for AI</h2>
        <p className="hero-tagline">Think Smarter. Use AI Wisely. Save Water.</p>
        
        <div className="hero-pills">
          <div className="pill">
            <span className="pill-icon">📏</span>
            Measure
          </div>
          <div className="pill-divider">→</div>
          <div className="pill">
            <span className="pill-icon">⚙️</span>
            Optimize
          </div>
          <div className="pill-divider">→</div>
          <div className="pill">
            <span className="pill-icon">🌱</span>
            Reduce
          </div>
        </div>
      </div>
      
      <div className="hero-visual">
        <div className="droplet-container">
          <div className="water-droplet">
            <svg viewBox="0 0 100 100" className="neural-pattern">
              <path d="M20,50 L40,30 L60,50 L80,30" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <path d="M20,50 L40,70 L60,50 L80,70" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <circle cx="20" cy="50" r="2" fill="rgba(255,255,255,0.5)" />
              <circle cx="40" cy="30" r="2" fill="rgba(255,255,255,0.5)" />
              <circle cx="40" cy="70" r="2" fill="rgba(255,255,255,0.5)" />
              <circle cx="60" cy="50" r="2" fill="rgba(255,255,255,0.5)" />
              <circle cx="80" cy="30" r="2" fill="rgba(255,255,255,0.5)" />
              <circle cx="80" cy="70" r="2" fill="rgba(255,255,255,0.5)" />
            </svg>
          </div>
          <div className="ripple ripple-1"></div>
          <div className="ripple ripple-2"></div>
          <div className="ripple ripple-3"></div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
