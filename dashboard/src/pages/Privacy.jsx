import React from 'react';

const Privacy = () => {
  return (
    <div className="page animate-fade-in">
      <div className="section-header" style={{ marginBottom: '2rem' }}>
        <h2>Privacy Architecture</h2>
        <p style={{ color: 'var(--text-muted)' }}>How NeerAI protects user data</p>
      </div>
      
      <div className="glass-card mb-6" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent-emerald)' }}>Privacy-First Design</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '800px' }}>
          NeerAI acts as a proxy layer, but it is designed specifically to <strong>never log, store, or analyze the actual content</strong> of user prompts or model responses. We only extract the metadata required to calculate environmental impact.
        </p>
        
        <div className="architecture-diagram" style={{ 
          background: 'var(--bg-primary)', 
          padding: '2rem', 
          borderRadius: '12px',
          border: '1px solid var(--border-glass)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--accent-blue)', width: '150px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👤</div>
              <div style={{ fontWeight: 'bold' }}>User</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sends Prompt</div>
            </div>
            
            <div style={{ color: 'var(--text-muted)', fontSize: '1.5rem' }}>→</div>
            
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1.5rem', borderRadius: '8px', border: '2px solid var(--accent-emerald)', width: '200px', textAlign: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent-emerald)', color: 'var(--bg-primary)', padding: '2px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 'bold' }}>NeerAI Proxy</div>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🛡️</div>
              <div style={{ fontSize: '0.85rem' }}>Counts tokens & infers model type</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Drops payload content</div>
            </div>
            
            <div style={{ color: 'var(--text-muted)', fontSize: '1.5rem' }}>→</div>
            
            <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--accent-blue)', width: '150px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>☁️</div>
              <div style={{ fontWeight: 'bold' }}>AI Provider</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OpenAI / Anthropic</div>
            </div>
          </div>
          
          <div style={{ color: 'var(--text-muted)', fontSize: '1.5rem' }}>↓</div>
          
          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px dashed var(--accent-water)', width: '300px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📊</div>
            <div style={{ fontWeight: 'bold', color: 'var(--accent-water)' }}>Metrics DB (Local)</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Timestamp, Token Count, Dept ID</div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card" style={{ borderTop: '3px solid var(--accent-danger)' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>❌</span> What we DON'T collect
          </h3>
          <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>• Prompt text content</li>
            <li style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>• Generated responses or code</li>
            <li style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>• Uploaded files or images</li>
            <li style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>• Personally Identifiable Information (PII)</li>
            <li style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>• Specific user IP addresses</li>
          </ul>
        </div>
        
        <div className="glass-card" style={{ borderTop: '3px solid var(--accent-emerald)' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>✅</span> What we DO collect
          </h3>
          <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>• Input/Output Token counts</li>
            <li style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>• Target Model (e.g., gpt-4, claude-3)</li>
            <li style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>• Request timestamp & duration</li>
            <li style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>• Organizational unit (e.g., Dept: CSE)</li>
            <li style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>• Request success/failure status</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
