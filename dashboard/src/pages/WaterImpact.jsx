import React, { useState, useEffect } from 'react';
import DailyWaterChart from '../components/charts/DailyWaterChart';
import SectorChart from '../components/charts/SectorChart';
import IndiaContext from '../components/IndiaContext';
import DateRangeSelector from '../components/DateRangeSelector';
import { fetchDailyTrends, fetchSectorStats, fetchDashboardSummary } from '../api';

const WaterImpact = () => {
  const [days, setDays] = useState(30);
  const [trends, setTrends] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [selectedSector, setSelectedSector] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [trendsData, sectorsData, summaryData] = await Promise.all([
        fetchDailyTrends(days),
        fetchSectorStats(days),
        fetchDashboardSummary(days)
      ]);
      
      setTrends(trendsData);
      setSectors(sectorsData);
      setSummary(summaryData);
      setLoading(false);
    };
    loadData();
  }, [days]);

  if (!summary && loading) return <div className="loading">Loading water impact data...</div>;

  return (
    <div className="page animate-fade-in">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2>Water Impact Analysis</h2>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0' }}>All values are estimates based on standard PUE and WUE metrics (Li et al., 2023)</p>
        </div>
        <DateRangeSelector value={days} onChange={setDays} />
      </div>
      
      <div className="glass-card mb-6" style={{ marginBottom: '1.5rem' }}>
        <DailyWaterChart data={trends} title={`${days}-Day Estimated Water Footprint Trend`} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6" style={{ marginBottom: '1.5rem' }}>
        <SectorChart 
          data={sectors} 
          selectedSector={selectedSector} 
          onSelectSector={setSelectedSector} 
        />
        <IndiaContext waterMl={summary ? summary.totalWater : 0} />
      </div>
      
      <div className="glass-card">
        <h3>Understanding AI Water Consumption</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div className="info-box" style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
            <h4 style={{ color: 'var(--accent-water)', marginBottom: '0.5rem' }}>Direct Cooling</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Water evaporated in data center cooling towers to keep GPU servers at optimal temperatures during inference.</p>
          </div>
          <div className="info-box" style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
            <h4 style={{ color: 'var(--accent-water)', marginBottom: '0.5rem' }}>Indirect Generation</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Water consumed by power plants to generate the electricity required to run the servers.</p>
          </div>
          <div className="info-box" style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
            <h4 style={{ color: 'var(--accent-water)', marginBottom: '0.5rem' }}>Location Dependency</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>The same prompt in a hot climate requires more water for cooling than in a cold climate.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterImpact;
