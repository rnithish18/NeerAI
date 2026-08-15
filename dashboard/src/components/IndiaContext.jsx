import React from 'react';
import './IndiaContext.css';

const IndiaContext = ({ waterMl = 0 }) => {
  // 500ml water bottle comparison
  const bottles = (waterMl / 500).toFixed(2);
  const percentage = ((waterMl / 500) * 100).toFixed(1);

  return (
    <div className="india-context glass-card">
      <div className="context-header">
        <h3>India Water Context</h3>
        <span className="context-badge">Local Impact</span>
      </div>
      
      <div className="context-content">
        <div className="context-visual">
          <div className="bottle-container">
            <svg viewBox="0 0 40 100" className="bottle-svg">
              <path d="M15,5 L15,10 L10,15 L10,90 C10,95 15,95 20,95 C25,95 30,95 30,90 L30,15 L25,10 L25,5 Z" 
                fill="rgba(255,255,255,0.1)" stroke="var(--border-glass)" strokeWidth="2" />
              <rect x="11" y={90 - (90 * (Math.min(100, percentage) / 100))} width="18" height={90 * (Math.min(100, percentage) / 100)} 
                fill="var(--accent-water)" />
            </svg>
            <div className="bottle-label">500 mL</div>
          </div>
          
          <div className="context-stats">
            <div className="comparison-text">
              <span className="highlight">{waterMl.toLocaleString()} mL</span> ≈ 
              <span className="highlight"> {percentage}%</span> of a 500mL bottle
            </div>
            <p className="context-description">
              In a country where millions face water scarcity, every drop counts. 
              The AI industry's water footprint is growing rapidly.
            </p>
          </div>
        </div>
        
        <div className="context-note">
          <h4>Historical Context (Chennai)</h4>
          <p>
            During the 2019 Chennai water crisis, the city's four main reservoirs ran virtually dry. 
            Data centers and tech parks had to rely on hundreds of water tankers daily to maintain operations and cooling systems.
          </p>
          <div className="note-disclaimer">
            *Historical/reference context. Live reservoir data unavailable in offline demo mode.
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndiaContext;
