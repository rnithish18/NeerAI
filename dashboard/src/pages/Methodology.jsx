import React, { useState, useEffect } from 'react';
import { fetchMethodology } from '../api';

const Methodology = () => {
  const [method, setMethod] = useState(null);
  
  useEffect(() => {
    const loadData = async () => {
      setMethod(await fetchMethodology());
    };
    loadData();
  }, []);

  return (
    <div className="page animate-fade-in">
      <div className="section-header" style={{ marginBottom: '2rem' }}>
        <h2>Methodology & Calculations</h2>
        <p style={{ color: 'var(--text-muted)' }}>How we estimate AI environmental impact</p>
      </div>
      
      <div className="glass-card mb-6" style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: 'var(--accent-water)', marginBottom: '1rem' }}>Disclaimer: Estimation vs Measurement</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
          <strong>NeerAI does NOT physically measure data-center water consumption.</strong> 
          Tech giants (OpenAI, Google, Microsoft) do not provide real-time API telemetry for water/energy per request. 
          Therefore, all numbers presented in this dashboard are <em>estimates</em> calculated using peer-reviewed academic models applied to proxy metrics (token counts, session duration).
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          The data currently shown is synthetic (demo mode) to illustrate the platform's capabilities.
        </p>
      </div>
      
      <div className="glass-card mb-6" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Core Formula</h3>
        <div style={{ background: 'var(--bg-primary)', padding: '2rem', borderRadius: '8px', textAlign: 'center', marginBottom: '1.5rem', border: '1px solid var(--border-glass)' }}>
          <div style={{ fontFamily: 'monospace', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
            {method?.formula || "Water = Energy × (WUE_onsite + PUE × EWIF_offsite)"}
          </div>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'right' }}>
          Source: {method?.source || "Li et al., 2023"} <a href="https://arxiv.org/abs/2304.03271" target="_blank" rel="noreferrer" style={{ marginLeft: '0.5rem' }}>[arxiv]</a>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem' }}>Configurable Constants (Assumptions)</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>Variable</th>
                <th style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>Value</th>
                <th style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '0.75rem 0', color: 'var(--accent-blue)' }}>WUE</td>
                <td style={{ padding: '0.75rem 0' }}>1.8 L/kWh</td>
                <td style={{ padding: '0.75rem 0', color: 'var(--text-secondary)' }}>Water Usage Effectiveness</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '0.75rem 0', color: 'var(--accent-blue)' }}>PUE</td>
                <td style={{ padding: '0.75rem 0' }}>1.2</td>
                <td style={{ padding: '0.75rem 0', color: 'var(--text-secondary)' }}>Power Usage Effectiveness</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '0.75rem 0', color: 'var(--accent-blue)' }}>EWIF</td>
                <td style={{ padding: '0.75rem 0' }}>0.5 L/kWh</td>
                <td style={{ padding: '0.75rem 0', color: 'var(--text-secondary)' }}>Energy Water Intensity</td>
              </tr>
              <tr>
                <td style={{ padding: '0.75rem 0', color: 'var(--accent-blue)' }}>Avg Session</td>
                <td style={{ padding: '0.75rem 0' }}>~500 mL</td>
                <td style={{ padding: '0.75rem 0', color: 'var(--text-secondary)' }}>Based on ~10-50 queries</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem' }}>Limitations</h3>
          <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li style={{ display: 'flex', gap: '0.75rem' }}>
              <span style={{ color: 'var(--accent-warning)' }}>•</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Geographic variability is immense. A data center in Ireland uses almost zero water for cooling, while one in Arizona uses massive amounts. Our estimates use global averages.
              </span>
            </li>
            <li style={{ display: 'flex', gap: '0.75rem' }}>
              <span style={{ color: 'var(--accent-warning)' }}>•</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Different models (GPT-4 vs Llama 3) have wildly different architectures and thus different energy profiles per token.
              </span>
            </li>
            <li style={{ display: 'flex', gap: '0.75rem' }}>
              <span style={{ color: 'var(--accent-warning)' }}>•</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Training cost is amortized. This dashboard currently focuses on <em>inference</em> cost, not the massive initial training cost.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Methodology;
