import React, { useState, useEffect } from 'react';
import './SustainabilityScore.css';

const SustainabilityScore = ({ score = 0 }) => {
  const [displayScore, setDisplayScore] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const increment = score / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(start);
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [score]);

  // Calculate SVG arc
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;
  
  // Determine color based on score
  let colorClass = 'score-red';
  let colorCode = '#ef4444';
  if (score >= 80) {
    colorClass = 'score-green';
    colorCode = '#10b981';
  } else if (score >= 50) {
    colorClass = 'score-amber';
    colorCode = '#f59e0b';
  }

  return (
    <div className="sustainability-card glass-card">
      <div className="score-header">
        <h3>NeerAI Sustainability Score</h3>
        <p className="score-subtitle">Experimental indicator — not a scientific measurement</p>
      </div>
      
      <div className="score-gauge-container">
        <svg className="score-gauge" width="160" height="160" viewBox="0 0 160 160">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="12"
          />
          {/* Progress circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={colorCode}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 80 80)"
            className="score-progress"
          />
        </svg>
        
        <div className="score-value-container">
          <span className={`score-value ${colorClass}`}>
            {Math.round(displayScore)}
          </span>
          <span className="score-max">/100</span>
        </div>
      </div>
      
      <div className="score-details">
        <div className="score-stat">
          <span className="stat-label">Efficiency</span>
          <span className="stat-val">Good</span>
        </div>
        <div className="score-stat">
          <span className="stat-label">Offset</span>
          <span className="stat-val">32%</span>
        </div>
        <div className="score-stat">
          <span className="stat-label">Trend</span>
          <span className="stat-val">+2.1</span>
        </div>
      </div>
    </div>
  );
};

export default SustainabilityScore;
