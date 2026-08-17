import React, { useState, useEffect } from 'react';
import SectorChart from '../components/charts/SectorChart';
import DateRangeSelector from '../components/DateRangeSelector';
import { fetchSectorStats } from '../api';

const Sectors = () => {
  const [days, setDays] = useState(30);
  const [sectors, setSectors] = useState([]);
  const [selectedSector, setSelectedSector] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchSectorStats(days);
      setSectors(data);
      setLoading(false);
    };
    loadData();
  }, [days]);

  if (sectors.length === 0 && loading) return <div className="loading">Loading sector analysis...</div>;

  // Calculate institutional average
  const totalWater = sectors.reduce((acc, s) => acc + (s.water || 0), 0);
  const avgWaterPerSector = sectors.length > 0 ? totalWater / sectors.length : 1;

  const filteredSectors = selectedSector 
    ? sectors.filter(s => s.name === selectedSector)
    : sectors;

  return (
    <div className="page animate-fade-in">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2>Sector Analysis</h2>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0' }}>Estimated AI resource utilization across organizational verticals</p>
        </div>
        <DateRangeSelector value={days} onChange={setDays} />
      </div>
      
      <div className="glass-card mb-6" style={{ marginBottom: '1.5rem' }}>
        <SectorChart 
          data={sectors} 
          selectedSector={selectedSector} 
          onSelectSector={setSelectedSector} 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSectors.map((sector) => {
          const isAboveAvg = sector.water > avgWaterPerSector;
          const diffPct = Math.round(Math.abs((sector.water - avgWaterPerSector) / avgWaterPerSector) * 100);

          return (
            <div 
              key={sector.name} 
              className="glass-card" 
              style={{ 
                borderTop: `3px solid ${isAboveAvg ? 'var(--accent-warning)' : 'var(--accent-emerald)'}`,
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                boxShadow: selectedSector === sector.name ? '0 0 15px rgba(6, 182, 212, 0.4)' : 'none'
              }}
              onClick={() => setSelectedSector(selectedSector === sector.name ? null : sector.name)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{sector.name}</h3>
                <span style={{ 
                  fontSize: '0.75rem', 
                  padding: '2px 8px', 
                  borderRadius: '10px', 
                  background: isAboveAvg ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  color: isAboveAvg ? '#fbbf24' : '#34d399',
                  fontWeight: '600'
                }}>
                  {isAboveAvg ? `+${diffPct}% vs Avg` : `-${diffPct}% vs Avg`}
                </span>
              </div>
              
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
                  <span style={{ color: 'var(--text-secondary)' }}>Query Efficiency:</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--accent-emerald)' }}>
                    {((sector.sessions / (sector.water || 1)) * 1000).toFixed(1)} queries/L
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sectors;
