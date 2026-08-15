import React from 'react';
import './StatsGrid.css';

const StatCard = ({ title, value, unit, icon, trend, colorClass }) => (
  <div className={`stat-card glass-card ${colorClass}`}>
    <div className="stat-header">
      <span className="stat-title">{title}</span>
      <span className="stat-icon">{icon}</span>
    </div>
    <div className="stat-body">
      <div className="stat-value">
        {value} <span className="stat-unit">{unit}</span>
      </div>
    </div>
    {trend && (
      <div className="stat-footer">
        <span className={`trend ${trend > 0 ? 'up' : 'down'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
        <span className="trend-label">vs last week</span>
      </div>
    )}
  </div>
);

const StatsGrid = ({ summary }) => {
  if (!summary) return null;

  return (
    <div className="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        title="Total AI Sessions" 
        value={summary.totalSessions.toLocaleString()} 
        icon="💬" 
        trend={12.5}
        colorClass="accent-blue-card"
      />
      <StatCard 
        title="Estimated Energy" 
        value={summary.totalEnergy.toFixed(1)} 
        unit="kWh"
        icon="⚡" 
        trend={-4.2}
        colorClass="accent-warning-card"
      />
      <StatCard 
        title="Estimated Water" 
        value={(summary.totalWater / 1000).toFixed(1)} 
        unit="L"
        icon="💧" 
        trend={-5.8}
        colorClass="accent-water-card"
      />
      <StatCard 
        title="Sustainability Score" 
        value={summary.sustainabilityScore} 
        unit="/ 100"
        icon="🌱" 
        trend={2.1}
        colorClass="accent-emerald-card"
      />
    </div>
  );
};

export default StatsGrid;
