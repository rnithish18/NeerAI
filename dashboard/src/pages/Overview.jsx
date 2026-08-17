import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import StatsGrid from '../components/StatsGrid';
import FootprintCard from '../components/FootprintCard';
import SustainabilityScore from '../components/SustainabilityScore';
import IndiaContext from '../components/IndiaContext';
import DailyWaterChart from '../components/charts/DailyWaterChart';
import SectorChart from '../components/charts/SectorChart';
import DateRangeSelector from '../components/DateRangeSelector';
import { fetchDashboardSummary, fetchDailyTrends, fetchSectorStats } from '../api';

const Overview = () => {
  const [days, setDays] = useState(7);
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [selectedSector, setSelectedSector] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [summaryData, trendsData, sectorsData] = await Promise.all([
        fetchDashboardSummary(days),
        fetchDailyTrends(days),
        fetchSectorStats(days)
      ]);
      
      setSummary(summaryData);
      setTrends(trendsData);
      setSectors(sectorsData);
      setLoading(false);
    };
    
    loadData();
  }, [days]);

  if (loading && !summary) return <div className="loading">Loading dashboard...</div>;

  // Real session metrics calculated from actual database summary
  const hasSessions = summary && summary.totalSessions > 0;
  const liveSessionWater = hasSessions ? (summary.totalWater / summary.totalSessions) : 0;
  const liveSessionEnergy = hasSessions ? (summary.totalEnergy / summary.totalSessions) : 0;

  // Filtered trends if sector selected
  const displayTrends = trends;

  return (
    <div className="page animate-fade-in">
      <Hero />
      
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2>Dashboard Overview</h2>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0' }}>Live AI environmental telemetry and aggregate analytics</p>
        </div>
        <DateRangeSelector value={days} onChange={setDays} />
      </div>
      
      <StatsGrid 
        summary={summary} 
        selectedSector={selectedSector} 
        onClearSector={() => setSelectedSector(null)} 
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <DailyWaterChart data={displayTrends} title={`Estimated Water Footprint (Last ${days} Days)`} />
        </div>
        <div>
          <SustainabilityScore score={summary ? summary.sustainabilityScore : 100} />
        </div>
      </div>

      <div className="mt-6">
        <SectorChart 
          data={sectors} 
          selectedSector={selectedSector} 
          onSelectSector={setSelectedSector} 
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <FootprintCard 
          water={liveSessionWater} 
          energy={liveSessionEnergy} 
          isLive={hasSessions}
        />
        <IndiaContext waterMl={summary ? summary.totalWater : 0} />
      </div>
      
      <div className="impact-statement glass-card mt-6" style={{ textAlign: 'center', padding: '2.5rem' }}>
        <h3 style={{ fontSize: '1.4rem', color: 'var(--accent-water)', marginBottom: '0.75rem' }}>
          What if every unnecessary AI regeneration could be avoided?
        </h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '800px', margin: '0 auto', fontSize: '1.05rem', lineHeight: '1.6' }}>
          By understanding and optimizing AI usage patterns across India, we can significantly reduce our collective environmental impact without sacrificing technological advancement.
        </p>
      </div>
    </div>
  );
};

export default Overview;
