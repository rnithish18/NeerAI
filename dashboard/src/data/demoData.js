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
    // Water = Energy * (WUE + PUE*EWIF)
    // Roughly 25-35 mL per inference depending on location
    const water = energy * 185; // Roughly scaling factor for mL
    
    dailyData.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      energy: Number(energy.toFixed(2)),
      water: Number(water.toFixed(2)),
      sessions: Math.floor(energy * 120),
    });
  }

  return {
    dailyData,
    departments: [
      { name: 'CSE', energy: 125.4, water: 23200, sessions: 15400 },
      { name: 'ECE', energy: 85.2, water: 15760, sessions: 10200 },
      { name: 'EEE', energy: 65.8, water: 12170, sessions: 8100 },
      { name: 'Mechanical', energy: 45.1, water: 8340, sessions: 5500 },
      { name: 'Civil', energy: 28.5, water: 5270, sessions: 3200 },
    ],
    hostels: [
      { name: 'Sindhu', energy: 112.5, water: 20800 },
      { name: 'Ganga', energy: 95.2, water: 17600 },
      { name: 'Yamuna', energy: 88.4, water: 16350 },
      { name: 'Kaveri', energy: 76.1, water: 14080 },
      { name: 'Godavari', energy: 65.8, water: 12170 },
    ],
    taskDistribution: [
      { name: 'Chat/Text', value: 65, fill: '#3b82f6' },
      { name: 'Code Generation', value: 25, fill: '#10b981' },
      { name: 'Image/Media', value: 10, fill: '#06b6d4' },
    ],
    summary: {
      totalSessions: 42400,
      totalEnergy: 349.9,
      totalWater: 64740, // mL
      sustainabilityScore: 78,
    }
  };
};
