import React, { useState, useEffect } from 'react';
import TaskDistributionChart from '../components/charts/TaskDistributionChart';
import { getTaskDistribution, fetchDashboardSummary } from '../api';

const Energy = () => {
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState(null);
  
  useEffect(() => {
    const loadData = async () => {
      setTasks(await getTaskDistribution());
      setSummary(await fetchDashboardSummary());
    };
    loadData();
  }, []);

  if (!summary) return <div>Loading...</div>;

  return (
    <div className="page animate-fade-in">
      <div className="section-header" style={{ marginBottom: '2rem' }}>
        <h2>Energy Consumption</h2>
        <p style={{ color: 'var(--text-muted)' }}>Estimated electrical usage for AI workloads</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6" style={{ marginBottom: '1.5rem' }}>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
            {summary.totalEnergy.toFixed(1)} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>kWh</span>
          </div>
          <div style={{ color: 'var(--accent-warning)', fontSize: '0.875rem', marginTop: '0.5rem', textTransform: 'uppercase' }}>
            Total Est. Energy
          </div>
        </div>
        
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💡</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
            {((summary.totalEnergy * 1000) / summary.totalSessions).toFixed(2)} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Wh</span>
          </div>
          <div style={{ color: 'var(--accent-emerald)', fontSize: '0.875rem', marginTop: '0.5rem', textTransform: 'uppercase' }}>
            Avg. Energy per Session
          </div>
        </div>
        
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔋</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
            {(summary.totalEnergy * 0.4).toFixed(1)} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>kg CO₂e</span>
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem', textTransform: 'uppercase' }}>
            Est. Carbon Emissions
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TaskDistributionChart data={tasks} />
        
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem' }}>Model Efficiency Comparison</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <div>
                <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>GPT-4 / Claude 3 Opus</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Complex Reasoning</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'var(--accent-danger)', fontWeight: 'bold' }}>Highest Energy</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>~0.015 kWh / query</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <div>
                <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>GPT-3.5 / Claude 3 Haiku</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Standard Chat</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'var(--accent-warning)', fontWeight: 'bold' }}>Moderate Energy</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>~0.003 kWh / query</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', borderLeft: '3px solid var(--accent-emerald)' }}>
              <div>
                <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Llama 3 8B (Local)</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Basic Tasks</div>
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
