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
        <p style={{ margin: '3px 0 0', color: '#10b981', fontSize: '11px' }}>
          Click to filter dashboard
        </p>
      </div>
    );
  }
  return null;
};

const colors = ['#06b6d4', '#3b82f6', '#14b8a6', '#8b5cf6', '#ec4899'];

const SectorChart = ({ data, selectedSector = null, onSelectSector = null }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="chart-card glass-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Sector Comparison - Estimated AI Water Footprint</h3>
          <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Interactive: Click any bar to drill down and filter metrics
          </p>
        </div>
        {selectedSector && (
          <button
            onClick={() => onSelectSector && onSelectSector(null)}
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            Clear Filter ({selectedSector}) ✕
          </button>
        )}
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
            onClick={(state) => {
              if (state && state.activePayload && state.activePayload.length && onSelectSector) {
                const clickedSector = state.activePayload[0].payload.name;
                onSelectSector(selectedSector === clickedSector ? null : clickedSector);
              }
            }}
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
            <Bar dataKey="water" radius={[4, 4, 0, 0]} animationDuration={1000} cursor="pointer">
              {data.map((entry, index) => {
                const isSelected = selectedSector === entry.name;
                const isOtherSelected = selectedSector && !isSelected;
                return (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={colors[index % colors.length]}
                    opacity={isOtherSelected ? 0.35 : 1.0}
                    stroke={isSelected ? '#ffffff' : 'none'}
                    strokeWidth={isSelected ? 2 : 0}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SectorChart;
