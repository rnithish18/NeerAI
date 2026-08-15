import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip" style={{ 
        background: 'rgba(12, 19, 40, 0.95)', 
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '10px',
        borderRadius: '8px'
      }}>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px', marginBottom: '8px' }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ margin: '3px 0', color: entry.color, fontWeight: 'bold', fontSize: '13px' }}>
            {entry.name}: {entry.value.toLocaleString()} mL
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const OptimizationChart = () => {
  // Demo optimization scenario data
  const data = [
    { name: 'Default Models', current: 15400, optimized: 8200 },
    { name: 'Local Caching', current: 9800, optimized: 4100 },
    { name: 'Off-peak Processing', current: 12500, optimized: 9300 },
  ];

  return (
    <div className="chart-card glass-card" style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>Optimization Scenario — Estimated Impact</h3>
      <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.5rem' }}>Simulated optimization savings</p>
      
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
            <XAxis type="number" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="current" name="Current Est. Water" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
            <Bar dataKey="optimized" name="Optimized Projection" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default OptimizationChart;
