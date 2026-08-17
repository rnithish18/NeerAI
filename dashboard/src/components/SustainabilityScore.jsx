import React, { useState, useEffect } from 'react';
import './SustainabilityScore.css';

const SustainabilityScore = ({ score = 100 }) => {
  const [displayScore, setDisplayScore] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const duration = 1200;
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
  const radius = 55;
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

  // Simulated factor deduction breakdown
  const lengthLoss = Math.max(0, Math.round((100 - score) * 0.35));
  const duplicateLoss = Math.max(0, Math.round((100 - score) * 0.25));
  const regenLoss = Math.max(0, Math.round((100 - score) * 0.25));
  const computeLoss = Math.max(0, (100 - score) - (lengthLoss + duplicateLoss + regenLoss));

  return (
    <div className="sustainability-card glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="score-header">
        <h3>NeerAI Sustainability Score</h3>
        <p className="score-subtitle">Proportional indicator — not a physical measurement</p>
      </div>
      
      <div className="score-gauge-container" style={{ margin: '1rem 0 0.5rem' }}>
        <svg className="score-gauge" width="140" height="140" viewBox="0 0 140 140">
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="10"
          />
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={colorCode}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 70 70)"
            className="score-progress"
          />
        </svg>
        
        <div className="score-value-container">
          <span className={`score-value ${colorClass}`} style={{ fontSize: '2.25rem' }}>
            {Math.round(displayScore)}
          </span>
          <span className="score-max" style={{ fontSize: '0.85rem' }}>/100</span>
        </div>
      </div>

      {/* Trend Sparkline */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '0.25rem 0 0.75rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>7-Day Score Trajectory:</span>
        <svg width="60" height="18" viewBox="0 0 60 18">
          <path
            d="M 2 14 L 12 12 L 24 13 L 36 9 L 48 7 L 58 4"
            fill="none"
            stroke={colorCode}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <span style={{ fontSize: '0.75rem', color: colorCode, fontWeight: 'bold' }}>+3.4%</span>
      </div>
      
      {/* Score Impact Breakdown */}
      <div style={{ background: 'rgba(15, 23, 42, 0.5)', borderRadius: '8px', padding: '10px 12px', border: '1px solid var(--border-glass)' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase' }}>
          Point Impact Breakdown
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>📏 Length Overage:</span>
            <span style={{ color: lengthLoss > 0 ? 'var(--accent-warning)' : 'var(--accent-emerald)', fontWeight: '600' }}>
              {lengthLoss > 0 ? `-${lengthLoss} pts` : 'Optimal'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>♻️ Near-Duplicates:</span>
            <span style={{ color: duplicateLoss > 0 ? 'var(--accent-danger)' : 'var(--accent-emerald)', fontWeight: '600' }}>
              {duplicateLoss > 0 ? `-${duplicateLoss} pts` : 'Clean'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>🔄 Regenerations:</span>
            <span style={{ color: regenLoss > 0 ? 'var(--accent-warning)' : 'var(--accent-emerald)', fontWeight: '600' }}>
              {regenLoss > 0 ? `-${regenLoss} pts` : 'Zero'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>🧠 High-Compute Tasks:</span>
            <span style={{ color: computeLoss > 0 ? 'var(--accent-teal)' : 'var(--accent-emerald)', fontWeight: '600' }}>
              {computeLoss > 0 ? `-${computeLoss} pts` : 'Balanced'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SustainabilityScore;
