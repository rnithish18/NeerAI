import React, { useState } from 'react';
import './StatsGrid.css';

const StatCard = ({ title, value, unit, icon, trend, trendLabel, colorClass, highlight = false }) => (
  <div className={`stat-card glass-card ${colorClass} ${highlight ? 'highlight-border' : ''}`}>
    <div className="stat-header">
      <span className="stat-title">{title}</span>
      <span className="stat-icon">{icon}</span>
    </div>
    <div className="stat-body">
      <div className="stat-value">
        {value} <span className="stat-unit">{unit}</span>
      </div>
    </div>
    {trend !== undefined && trend !== null && (
      <div className="stat-footer">
        <span className={`trend ${trend > 0 ? (title.includes('Score') ? 'up' : 'down') : (title.includes('Score') ? 'down' : 'up')}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
        <span className="trend-label">{trendLabel || 'vs prior period'}</span>
      </div>
    )}
  </div>
);

const StatsGrid = ({ summary, selectedSector = null, onClearSector = null }) => {
  const [comparisonMode, setComparisonMode] = useState('prior'); // 'prior' | 'average'

  if (!summary) return null;

  const isSectorFiltered = !!selectedSector;

  return (
    <div className="stats-container" style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isSectorFiltered ? (
            <span style={{ 
              background: 'rgba(56, 189, 248, 0.15)', 
              color: '#38bdf8', 
              padding: '4px 12px', 
              borderRadius: '20px', 
              fontSize: '0.8rem', 
              fontWeight: '600',
              border: '1px solid rgba(56, 189, 248, 0.3)'
            }}>
              Filtered Sector: {selectedSector}
              {onClearSector && (
                <button 
                  onClick={onClearSector} 
                  style={{ background: 'none', border: 'none', color: '#38bdf8', marginLeft: '6px', cursor: 'pointer' }}
                >
                  ✕
                </button>
              )}
            </span>
          ) : (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Overall Institution Footprint Metrics
            </span>
          )}
        </div>

        {/* Comparative framing toggle */}
        <div style={{ display: 'inline-flex', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-glass)', borderRadius: '6px', padding: '2px' }}>
          <button
            type="button"
            onClick={() => setComparisonMode('prior')}
            style={{
              background: comparisonMode === 'prior' ? 'rgba(255,255,255,0.1)' : 'transparent',
              border: 'none',
              color: comparisonMode === 'prior' ? '#ffffff' : 'var(--text-muted)',
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            vs Last Week
          </button>
          <button
            type="button"
            onClick={() => setComparisonMode('average')}
            style={{
              background: comparisonMode === 'average' ? 'rgba(255,255,255,0.1)' : 'transparent',
              border: 'none',
              color: comparisonMode === 'average' ? '#ffffff' : 'var(--text-muted)',
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            vs Sector Average
          </button>
        </div>
      </div>

      <div className="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total AI Sessions" 
          value={summary.totalSessions.toLocaleString()} 
          icon="💬" 
          trend={comparisonMode === 'prior' ? 12.5 : 8.2}
          trendLabel={comparisonMode === 'prior' ? 'vs last week' : 'vs sector avg'}
          colorClass="accent-blue-card"
        />
        <StatCard 
          title="Estimated Energy" 
          value={summary.totalEnergy.toFixed(1)} 
          unit="kWh"
          icon="⚡" 
          trend={comparisonMode === 'prior' ? -4.2 : -11.5}
          trendLabel={comparisonMode === 'prior' ? 'vs last week' : 'vs sector avg'}
          colorClass="accent-warning-card"
        />
        <StatCard 
          title="Estimated Water" 
          value={(summary.totalWater / 1000).toFixed(1)} 
          unit="L"
          icon="💧" 
          trend={comparisonMode === 'prior' ? -5.8 : -14.2}
          trendLabel={comparisonMode === 'prior' ? 'vs last week' : 'vs sector avg'}
          colorClass="accent-water-card"
        />
        <StatCard 
          title="Sustainability Score" 
          value={summary.sustainabilityScore} 
          unit="/ 100"
          icon="🌱" 
          trend={comparisonMode === 'prior' ? 2.1 : 6.4}
          trendLabel={comparisonMode === 'prior' ? 'vs last week' : 'vs sector avg'}
          colorClass="accent-emerald-card"
        />
      </div>
    </div>
  );
};

export default StatsGrid;
