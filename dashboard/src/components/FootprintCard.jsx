import React, { useState, useEffect } from 'react';
import './FootprintCard.css';

const FootprintCard = ({ water = 0, energy = 0 }) => {
  const [period, setPeriod] = useState('session');
  
  // Animate numbers up
  const [displayWater, setDisplayWater] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const target = period === 'session' ? water : water * 45; // arbitrary multiplier for demo
    const duration = 1000;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setDisplayWater(target);
        clearInterval(timer);
      } else {
        setDisplayWater(start);
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [water, period]);

  const currentEnergy = period === 'session' ? energy : energy * 45;

  return (
    <div className="footprint-card glass-card animate-pulse-glow">
      <div className="footprint-header">
        <h3 className="footprint-title">Live AI Footprint</h3>
        <div className="period-toggle">
          <button 
            className={`toggle-btn ${period === 'session' ? 'active' : ''}`}
            onClick={() => setPeriod('session')}
          >
            This Session
          </button>
          <button 
            className={`toggle-btn ${period === 'week' ? 'active' : ''}`}
            onClick={() => setPeriod('week')}
          >
            This Week
          </button>
        </div>
      </div>
      
      <div className="footprint-content">
        <div className="water-metric">
          <div className="water-icon-large">💧</div>
          <div className="water-value-container">
            <div className="water-value">{displayWater.toFixed(1)} <span className="unit">mL</span></div>
            <div className="metric-label">Estimated Water Footprint</div>
          </div>
        </div>
        
        <div className="energy-metric">
          <div className="energy-icon">⚡</div>
          <div className="energy-value-container">
            <div className="energy-value">{currentEnergy.toFixed(4)} <span className="unit">kWh</span></div>
            <div className="metric-label">Estimated Energy Usage</div>
          </div>
        </div>
      </div>
      
      <div className="card-bg-animation">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
      </div>
    </div>
  );
};

export default FootprintCard;
