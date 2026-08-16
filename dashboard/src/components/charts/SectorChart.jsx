import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
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
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px' }}>{label}</p>
        <p style={{ margin: '5px 0 0', color: '#3b82f6', fontWeight: 'bold' }}>
          {payload[0].value.toLocaleString()} mL
        </p>
      </div>
    );
  }
  return null;
};

const colors = ['#06b6d4', '#3b82f6', '#14b8a6', '#8b5cf6', '#ec4899'];

const SectorChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="chart-card glass-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem' }}>Sector Comparison - Estimated AI Water Footprint</h3>
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#64748b" 
              tick={{ fill: '#94a3b8', fontSize: 12 }} 
              axisLine={false} 
              tickLine={false} 
            />
            <YAxis 
              stroke="#64748b" 
              tick={{ fill: '#64748b', fontSize: 12 }} 
              axisLine={false} 
              tickLine={false} 
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Bar dataKey="water" radius={[4, 4, 0, 0]} animationDuration={1500}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SectorChart;
