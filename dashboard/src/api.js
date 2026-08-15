import { generateDemoData } from './data/demoData';

const API_BASE = 'http://localhost:8000';
let useDemoData = true; // Fallback mode active by default
const demoData = generateDemoData();

const fetchWrapper = async (endpoint, dataKey) => {
  if (useDemoData) {
    return new Promise(resolve => setTimeout(() => resolve(demoData[dataKey]), 300));
  }
  
  try {
    const response = await fetch(`${API_BASE}${endpoint}`);
    if (!response.ok) throw new Error('API error');
    return await response.json();
  } catch (error) {
    console.warn(`API unavailable, using demo data for ${endpoint}`);
    useDemoData = true;
    return demoData[dataKey];
  }
};

export const fetchHealth = async () => {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch (e) {
    return false;
  }
};

export const fetchDashboardSummary = () => fetchWrapper('/api/summary', 'summary');
export const fetchDailyTrends = (days = 30) => fetchWrapper(`/api/trends?days=${days}`, 'dailyData');
export const fetchDepartmentStats = () => fetchWrapper('/api/departments', 'departments');
export const fetchHostelStats = () => fetchWrapper('/api/hostels', 'hostels');
export const fetchMethodology = async () => ({
  formula: "Water = Energy × (WUE_onsite + PUE × EWIF_offsite)",
  source: "Li et al., 2023 (Making AI Less Thirsty)"
});

export const getTaskDistribution = () => fetchWrapper('/api/tasks', 'taskDistribution');

export const clearDemoData = () => {
  useDemoData = false;
};

export const exportCSV = () => {
  console.log("Exporting CSV...");
  alert("Export function available in production backend.");
};
