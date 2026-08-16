export const generateDemoData = () => {
  const days = 30;
  const today = new Date();
  const dailyData = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    // Base traffic pattern with some randomness and weekend dip
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const baseEnergy = isWeekend ? 4.5 : 8.2;
    const randomFactor = 0.8 + Math.random() * 0.4;
    
    const energy = baseEnergy * randomFactor;
    // Water = Energy × (WUE_onsite + PUE × EWIF_offsite) × 1000 (for mL)
    // = Energy × (1.8 + 1.2 × 0.5) × 1000 = Energy × 2400
    const water = energy * 2400;
    
    dailyData.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      energy: Number(energy.toFixed(2)),
      water: Number(water.toFixed(2)),
      sessions: Math.floor(energy * 120),
    });
  }

  return {
    dailyData,
    sectors: [
      { name: 'IT & Software', energy: 12.5, water: 30000, sessions: 1540 },
      { name: 'Education', energy: 8.5, water: 20400, sessions: 1020 },
      { name: 'Research', energy: 6.6, water: 15840, sessions: 810 },
      { name: 'Government', energy: 4.5, water: 10800, sessions: 550 },
      { name: 'Healthcare', energy: 2.9, water: 6960, sessions: 320 },
    ],
    regions: [
      { name: 'South', energy: 112.5, water: 20800 },
      { name: 'North', energy: 95.2, water: 17600 },
      { name: 'West', energy: 88.4, water: 16350 },
      { name: 'East', energy: 76.1, water: 14080 },
      { name: 'Central', energy: 65.8, water: 12170 },
    ],
    taskDistribution: [
      { name: 'Chat/Text', value: 65, fill: '#3b82f6' },
      { name: 'Code Generation', value: 25, fill: '#10b981' },
      { name: 'Image/Media', value: 10, fill: '#06b6d4' },
    ],
    summary: {
      totalSessions: 4240,
      totalEnergy: 35.0,
      totalWater: 84000, // mL (35 kWh × 2400)
      sustainabilityScore: 78,
    }
  };
};
