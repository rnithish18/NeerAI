import React from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-tooltip" style={{ 
        background: 'rgba(12, 19, 40, 0.95)', 
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '10px',
        borderRadius: '8px'
      }}>
        <p style={{ margin: 0, color: data.fill, fontWeight: 'bold' }}>
          {data.name}
        </p>
        <p style={{ margin: '5px 0 0', color: '#f1f5f9' }}>
          {data.value}% of Total
        </p>
      </div>
    );
  }
  return null;
};

const TaskDistributionChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="chart-card glass-card" style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Task Category Distribution</h3>
      
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
        
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -60%)',
          textAlign: 'center',
          pointerEvents: 'none'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f1f5f9' }}>100%</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Total Tasks</div>
        </div>
      </div>
    </div>
  );
};

export default TaskDistributionChart;
