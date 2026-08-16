import React, { useState, useEffect } from 'react';
import DepartmentChart from '../components/charts/DepartmentChart';
import { fetchDepartmentStats } from '../api';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  
  useEffect(() => {
    const loadData = async () => {
      setDepartments(await fetchDepartmentStats());
    };
    loadData();
  }, []);

  if (departments.length === 0) return <div>Loading...</div>;

  return (
    <div className="page animate-fade-in">
      <div className="section-header" style={{ marginBottom: '2rem' }}>
        <h2>Department Analysis</h2>
        <p style={{ color: 'var(--text-muted)' }}>Estimated AI usage breakdown by department</p>
      </div>
      
      <div className="glass-card mb-6" style={{ marginBottom: '1.5rem' }}>
        <DepartmentChart data={departments} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept, idx) => (
          <div key={dept.name} className="glass-card" style={{ borderTop: `3px solid var(--accent-water)` }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{dept.name}</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-glass)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Sessions:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{dept.sessions.toLocaleString()}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-glass)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Est. Energy:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--accent-warning)' }}>{dept.energy.toFixed(1)} kWh</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-glass)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Est. Water:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--accent-water)' }}>{(dept.water / 1000).toFixed(1)} L</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Efficiency:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--accent-emerald)' }}>
                  {((dept.sessions / dept.water) * 1000).toFixed(1)} queries/L
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Departments;
