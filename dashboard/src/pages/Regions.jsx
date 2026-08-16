import React, { useState, useEffect } from 'react';
import { fetchRegionStats } from '../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Regions = () => {
  const [regions, setRegions] = useState([]);
  
  useEffect(() => {
    const loadData = async () => {
      setRegions(await fetchRegionStats());
    };
    loadData();
  }, []);

  if (regions.length === 0) return <div>Loading...</div>;

  return (
    <div className="page animate-fade-in">
      <div className="section-header" style={{ marginBottom: '2rem' }}>
        <h2>Region Analysis</h2>
        <p style={{ color: 'var(--text-muted)' }}>Estimated AI usage breakdown by region</p>
      </div>
      
      <div className="glass-card mb-6" style={{ marginBottom: '1.5rem', height: '400px' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Estimated Energy Consumption by Region (kWh)</h3>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={regions} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: 'rgba(12, 19, 40, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
            <Bar dataKey="energy" radius={[4, 4, 0, 0]}>
              {regions.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#06b6d4'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {regions.map((region) => (
          <div key={region.name} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>{region.name}</h3>
              <span style={{ fontSize: '1.5rem' }}>📍</span>
            </div>
            
            <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Est. Water</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-water)' }}>
                {(region.water / 1000).toFixed(1)} <span style={{ fontSize: '1rem' }}>L</span>
              </div>
            </div>
            
            <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Est. Energy</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-warning)' }}>
                {region.energy.toFixed(1)} <span style={{ fontSize: '1rem' }}>kWh</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Regions;
