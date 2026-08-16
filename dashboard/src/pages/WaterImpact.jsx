import React, { useState, useEffect } from 'react';
import DailyWaterChart from '../components/charts/DailyWaterChart';
import SectorChart from '../components/charts/SectorChart';
import IndiaContext from '../components/IndiaContext';
import { fetchDailyTrends, fetchSectorStats, fetchDashboardSummary } from '../api';

const WaterImpact = () => {
  const [trends, setTrends] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [summary, setSummary] = useState(null);
  
  useEffect(() => {
    const loadData = async () => {
      setTrends(await fetchDailyTrends(30));
      setSectors(await fetchSectorStats());
      setSummary(await fetchDashboardSummary());
    };
    loadData();
  }, []);

  if (!summary) return <div>Loading...</div>;

  return (
    <div className="page animate-fade-in">
      <div className="section-header" style={{ marginBottom: '2rem' }}>
        <h2>Water Impact Analysis</h2>
        <p style={{ color: 'var(--text-muted)' }}>All values are estimates based on standard PUE and WUE metrics</p>
      </div>
      
      <div className="glass-card mb-6" style={{ marginBottom: '1.5rem' }}>
        <DailyWaterChart data={trends} title="30-Day Estimated Water Footprint Trend" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6" style={{ marginBottom: '1.5rem' }}>
        <SectorChart data={sectors} />
        <IndiaContext waterMl={summary.totalWater} />
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
