import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import StatsGrid from '../components/StatsGrid';
import FootprintCard from '../components/FootprintCard';
import SustainabilityScore from '../components/SustainabilityScore';
import IndiaContext from '../components/IndiaContext';
import DailyWaterChart from '../components/charts/DailyWaterChart';
import { fetchDashboardSummary, fetchDailyTrends } from '../api';

const Overview = () => {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const summaryData = await fetchDashboardSummary();
      const trendsData = await fetchDailyTrends(7); // Last 7 days for overview
      
      setSummary(summaryData);
      setTrends(trendsData);
      setLoading(false);
    };
    
    loadData();
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  // Assuming 1 query roughly = 5mL water for the live demo calculation
  const currentSessionWater = 125.5; 
  const currentSessionEnergy = 0.0245;

  return (
    <div className="page animate-fade-in">
      <Hero />
      
      <div className="section-header">
        <h2>Dashboard Overview</h2>
      </div>
      
      <StatsGrid summary={summary} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <DailyWaterChart data={trends} title="Estimated Water Footprint (Last 7 Days)" />
        </div>
        <div>
          <SustainabilityScore score={summary.sustainabilityScore} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <FootprintCard water={currentSessionWater} energy={currentSessionEnergy} />
        <IndiaContext waterMl={summary.totalWater} />
      </div>
      
      <div className="impact-statement glass-card mt-6" style={{ textAlign: 'center', padding: '3rem' }}>
        <h3 style={{ fontSize: '1.5rem', color: 'var(--accent-water)', marginBottom: '1rem' }}>
          What if every unnecessary AI regeneration could be avoided?
        </h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '800px', margin: '0 auto', fontSize: '1.1rem' }}>
          By understanding and optimizing AI usage patterns across India, we can significantly reduce our collective environmental impact without sacrificing technological advancement.
        </p>
      </div>
    </div>
  );
};

export default Overview;
