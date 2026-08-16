import { generateDemoData } from './data/demoData';

const API_BASE = 'http://localhost:8000';
let useDemoData = false;
let demoDataCache = null;

const getDemoData = () => {
  if (!demoDataCache) demoDataCache = generateDemoData();
  return demoDataCache;
};

// Transform backend snake_case response to camelCase for React components
const transformSummary = (data) => ({
  totalSessions: data.total_sessions ?? data.totalSessions ?? 0,
  totalEnergy: data.total_energy ?? data.totalEnergy ?? 0,
  totalWater: data.total_water ?? data.totalWater ?? 0,
  sustainabilityScore: Math.round(data.avg_score ?? data.sustainabilityScore ?? 0),
});

const transformTrends = (data) => {
  if (!Array.isArray(data)) return [];
  return data.map(d => ({
    date: d.date || '',
    energy: d.total_energy ?? d.energy ?? 0,
    water: d.total_water ?? d.water ?? 0,
    sessions: d.session_count ?? d.sessions ?? 0,
  }));
};

const transformDepartments = (data) => {
  if (!Array.isArray(data)) return [];
  return data.map(d => ({
    name: d.department ?? d.name ?? 'Unknown',
    energy: d.total_energy ?? d.energy ?? 0,
    water: d.total_water ?? d.water ?? 0,
    sessions: d.session_count ?? d.sessions ?? 0,
  }));
};

const transformHostels = (data) => {
  if (!Array.isArray(data)) return [];
  return data.map(d => ({
    name: d.hostel ?? d.name ?? 'Unknown',
    energy: d.total_energy ?? d.energy ?? 0,
    water: d.total_water ?? d.water ?? 0,
  }));
};

const fetchFromAPI = async (endpoint) => {
  const response = await fetch(`${API_BASE}${endpoint}`);
  if (!response.ok) throw new Error('API error');
  return await response.json();
};

export const fetchHealth = async () => {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (res.ok) {
      useDemoData = false;
      return true;
    }
    useDemoData = true;
    return false;
  } catch (e) {
    useDemoData = true;
    return false;
  }
};

export const fetchDashboardSummary = async () => {
  if (useDemoData) return getDemoData().summary;
  try {
    const data = await fetchFromAPI('/dashboard/summary?days=30');
    return transformSummary(data);
  } catch (e) {
    console.warn('API unavailable for summary, using demo data');
    useDemoData = true;
    return getDemoData().summary;
  }
};

export const fetchDailyTrends = async (days = 30) => {
  if (useDemoData) return getDemoData().dailyData;
  try {
    const data = await fetchFromAPI(`/dashboard/trends?days=${days}`);
    const transformed = transformTrends(data);
    return transformed.length > 0 ? transformed : getDemoData().dailyData;
  } catch (e) {
    console.warn('API unavailable for trends, using demo data');
    useDemoData = true;
    return getDemoData().dailyData;
  }
};

export const fetchDepartmentStats = async () => {
  if (useDemoData) return getDemoData().departments;
  try {
    const data = await fetchFromAPI('/dashboard/departments');
    const transformed = transformDepartments(data);
    return transformed.length > 0 ? transformed : getDemoData().departments;
  } catch (e) {
    console.warn('API unavailable for departments, using demo data');
    useDemoData = true;
    return getDemoData().departments;
  }
};

export const fetchHostelStats = async () => {
  if (useDemoData) return getDemoData().hostels;
  try {
    const data = await fetchFromAPI('/dashboard/hostels');
    const transformed = transformHostels(data);
    return transformed.length > 0 ? transformed : getDemoData().hostels;
  } catch (e) {
    console.warn('API unavailable for hostels, using demo data');
    useDemoData = true;
    return getDemoData().hostels;
  }
};

export const fetchMethodology = async () => ({
  formula: "Water = Energy × (WUE_onsite + PUE × EWIF_offsite)",
  source: "Li et al., 2023 (Making AI Less Thirsty)"
});

export const getTaskDistribution = async () => {
  return getDemoData().taskDistribution;
};

export const generateDemoDataAPI = async () => {
  try {
    await fetch(`${API_BASE}/demo/generate`, { method: 'POST' });
    useDemoData = false;
    demoDataCache = null;
  } catch (e) {
    useDemoData = true;
  }
};

export const clearDemoDataAPI = async () => {
  try {
    await fetch(`${API_BASE}/demo/clear`, { method: 'POST' });
    demoDataCache = null;
  } catch (e) {
    console.warn('Could not clear demo data on backend');
  }
};

export const isDemoMode = () => useDemoData;

export const exportCSV = async () => {
  try {
    const response = await fetch(`${API_BASE}/dashboard/export`);
    if (!response.ok) throw new Error('Export failed');
    const csvText = await response.text();
    const blob = new Blob([csvText], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neerai_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    // Fallback: export demo data as CSV
    const data = getDemoData();
    const rows = data.dailyData.map(d => `${d.date},${d.sessions},${d.energy},${d.water}`);
    const csv = 'Date,Sessions,Estimated Energy (kWh),Estimated Water (mL)\n' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neerai_demo_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
