import React, { useState, useEffect } from 'react';
import './FootprintCard.css';

const FootprintCard = ({ water = 0, energy = 0, isLive = true }) => {
  const [period, setPeriod] = useState('session');
  const [displayWater, setDisplayWater] = useState(0);
  
  // If zero (no sessions yet), provide honest sample baseline for illustration
  const effectiveWater = water > 0 ? water : 5.4;
  const effectiveEnergy = energy > 0 ? energy : 0.0022;

  useEffect(() => {
    let start = 0;
    const target = period === 'session' ? effectiveWater : effectiveWater * 35;
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
  }, [effectiveWater, period]);

  const currentEnergy = period === 'session' ? effectiveEnergy : effectiveEnergy * 35;

  return (
    <div className="footprint-card glass-card animate-pulse-glow">
      <div className="footprint-header">
        <div>
          <h3 className="footprint-title">Estimated AI Footprint</h3>
          <span style={{ 
            fontSize: '0.7rem', 
            padding: '2px 8px', 
            borderRadius: '10px', 
            background: isLive && water > 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
            color: isLive && water > 0 ? '#34d399' : '#fbbf24',
            fontWeight: '600'
          }}>
            {isLive && water > 0 ? '● Live Session Telemetry' : '○ Sample / Benchmark View'}
          </span>
        </div>
        <div className="period-toggle">
          <button 
            type="button"
            className={`toggle-btn ${period === 'session' ? 'active' : ''}`}
            onClick={() => setPeriod('session')}
          >
            Avg / Session
          </button>
          <button 
            type="button"
            className={`toggle-btn ${period === 'week' ? 'active' : ''}`}
            onClick={() => setPeriod('week')}
          >
            Cumulative Period
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
