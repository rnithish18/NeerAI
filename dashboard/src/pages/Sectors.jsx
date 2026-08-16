import React, { useState, useEffect } from 'react';
import SectorChart from '../components/charts/SectorChart';
import { fetchSectorStats } from '../api';

const Sectors = () => {
  const [sectors, setSectors] = useState([]);
  
  useEffect(() => {
    const loadData = async () => {
      setSectors(await fetchSectorStats());
    };
    loadData();
  }, []);

  if (sectors.length === 0) return <div>Loading...</div>;

  return (
    <div className="page animate-fade-in">
      <div className="section-header" style={{ marginBottom: '2rem' }}>
        <h2>Sector Analysis</h2>
        <p style={{ color: 'var(--text-muted)' }}>Estimated AI usage breakdown by sector</p>
      </div>
      
      <div className="glass-card mb-6" style={{ marginBottom: '1.5rem' }}>
        <SectorChart data={sectors} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sectors.map((sector, idx) => (
          <div key={sector.name} className="glass-card" style={{ borderTop: `3px solid var(--accent-water)` }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{sector.name}</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-glass)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Sessions:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{sector.sessions.toLocaleString()}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-glass)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Est. Energy:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--accent-warning)' }}>{sector.energy.toFixed(1)} kWh</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-glass)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Est. Water:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--accent-water)' }}>{(sector.water / 1000).toFixed(1)} L</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Efficiency:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--accent-emerald)' }}>
                  {((sector.sessions / sector.water) * 1000).toFixed(1)} queries/L
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sectors;
