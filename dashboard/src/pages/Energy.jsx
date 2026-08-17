import React, { useState, useEffect } from 'react';
import TaskDistributionChart from '../components/charts/TaskDistributionChart';
import DateRangeSelector from '../components/DateRangeSelector';
import { getTaskDistribution, fetchDashboardSummary } from '../api';

const Energy = () => {
  const [days, setDays] = useState(30);
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [taskDist, summaryData] = await Promise.all([
        getTaskDistribution(),
        fetchDashboardSummary(days)
      ]);
      setTasks(taskDist);
      setSummary(summaryData);
      setLoading(false);
    };
    loadData();
  }, [days]);

  if (!summary && loading) return <div className="loading">Loading energy metrics...</div>;

  const totalSessions = summary && summary.totalSessions > 0 ? summary.totalSessions : 1;
  const totalEnergy = summary ? summary.totalEnergy : 0;
  const avgWh = ((totalEnergy * 1000) / totalSessions).toFixed(2);
  const carbonKg = (totalEnergy * 0.7).toFixed(2); // India grid carbon factor 700 gCO2eq/kWh

  return (
    <div className="page animate-fade-in">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2>Energy Consumption</h2>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0' }}>Estimated electrical usage for conversational, code, and extended reasoning workloads</p>
        </div>
        <DateRangeSelector value={days} onChange={setDays} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6" style={{ marginBottom: '1.5rem' }}>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
            {totalEnergy.toFixed(2)} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>kWh</span>
          </div>
          <div style={{ color: 'var(--accent-warning)', fontSize: '0.875rem', marginTop: '0.5rem', textTransform: 'uppercase' }}>
            Total Est. Energy ({days}D)
          </div>
        </div>
        
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💡</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
            {avgWh} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Wh</span>
          </div>
          <div style={{ color: 'var(--accent-emerald)', fontSize: '0.875rem', marginTop: '0.5rem', textTransform: 'uppercase' }}>
            Avg. Energy per Session
          </div>
        </div>
        
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔋</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
            {carbonKg} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>kg CO₂e</span>
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem', textTransform: 'uppercase' }}>
            Est. Carbon Emissions (India Grid)
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TaskDistributionChart data={tasks} />
        
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem' }}>Model Efficiency Comparison</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', borderLeft: '3px solid #ef4444' }}>
              <div>
                <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>o1 / o3 / DeepSeek-R1</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Extended Reasoning (CoT)</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'var(--accent-danger)', fontWeight: 'bold' }}>Ultra High Energy</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>~0.035 kWh / 100 words</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <div>
                <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>GPT-4o / Claude 3.5 Sonnet</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Complex Coding / Chat</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'var(--accent-warning)', fontWeight: 'bold' }}>High Energy</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>~0.015 kWh / 100 words</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <div>
                <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>GPT-4o mini / Claude Haiku</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Standard Conversational</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'var(--accent-teal)', fontWeight: 'bold' }}>Moderate Energy</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>~0.002 kWh / 100 words</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', borderLeft: '3px solid var(--accent-emerald)' }}>
              <div>
                <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Llama 3 8B (Local On-Prem)</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Basic Tasks & Offline Lookup</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'var(--accent-emerald)', fontWeight: 'bold' }}>Lowest Energy</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>~0.0005 kWh / query</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Energy;
