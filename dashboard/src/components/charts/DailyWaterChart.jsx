import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
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
        <p style={{ margin: '5px 0 0', color: '#06b6d4', fontWeight: 'bold' }}>
          {payload[0].value.toFixed(1)} mL Water
        </p>
      </div>
    );
  }
  return null;
};

const DailyWaterChart = ({ data, title = "Daily Estimated Water Footprint" }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="chart-card glass-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem' }}>{title}</h3>
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="water" 
              stroke="#06b6d4" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorWater)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DailyWaterChart;
