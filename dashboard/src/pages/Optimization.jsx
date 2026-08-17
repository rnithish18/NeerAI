import React, { useState, useEffect } from 'react';
import OptimizationChart from '../components/charts/OptimizationChart';
import { fetchSettingsAPI, updateSettingAPI } from '../api';

const Optimization = () => {
  const [settings, setSettings] = useState({
    reasoning_guardrail: 'true',
    presubmit_nudge: 'true',
    autosummarize_first: 'false',
    nudge_sensitivity: 'standard',
    max_output_threshold: '600',
    regen_threshold: '3'
  });
  const [savedFeedback, setSavedFeedback] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const data = await fetchSettingsAPI();
      if (data && Object.keys(data).length > 0) {
        setSettings(prev => ({ ...prev, ...data }));
      }
    };
    loadSettings();
  }, []);

  const handleToggle = async (key) => {
    const nextVal = settings[key] === 'true' ? 'false' : 'true';
    const updated = { ...settings, [key]: nextVal };
    setSettings(updated);
    await updateSettingAPI(key, nextVal);
    triggerSaved();
  };

  const handleChange = async (key, val) => {
    const updated = { ...settings, [key]: val };
    setSettings(updated);
    await updateSettingAPI(key, val);
    triggerSaved();
  };

  const triggerSaved = () => {
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  return (
    <div className="page animate-fade-in">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2>Optimization Strategies & Live Controls</h2>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0' }}>Configure behavioral intervention thresholds and active water-saving policies</p>
        </div>
        {savedFeedback && (
          <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
            ✓ Policy Updated Live
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6" style={{ marginBottom: '1.5rem' }}>
        <div className="lg:col-span-2">
          <OptimizationChart />
        </div>
        
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '2rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '2.5rem' }}>📉</span>
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Potential Est. Reduction</h3>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--accent-emerald)', fontFamily: 'var(--font-heading)', lineHeight: 1, marginBottom: '0.5rem' }}>
            45%
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Simulated savings when pre-submit nudges and reasoning guardrails are actively enforced.
          </p>
        </div>
      </div>

      {/* Actionable Controls Panel */}
      <div className="glass-card mb-6" style={{ marginBottom: '2rem', borderTop: '3px solid var(--accent-teal)' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>⚙️</span> Interactive Environmental Policies & Thresholds
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Reasoning Guardrail Toggle */}
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>Reasoning Guardrail</strong>
              <button
                type="button"
                onClick={() => handleToggle('reasoning_guardrail')}
                style={{
                  background: settings.reasoning_guardrail === 'true' ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {settings.reasoning_guardrail === 'true' ? 'ACTIVE' : 'OFF'}
              </button>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Warn users before triggering extended CoT (o1/o3/R1) on basic factual or math queries.
            </p>
          </div>

          {/* Pre-submit Nudge Toggle */}
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>Pre-Submit Interception</strong>
              <button
                type="button"
                onClick={() => handleToggle('presubmit_nudge')}
                style={{
                  background: settings.presubmit_nudge === 'true' ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {settings.presubmit_nudge === 'true' ? 'ACTIVE' : 'OFF'}
              </button>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Show a subtle hint while typing if the prompt is pure arithmetic, spelling, or a trivial fact.
            </p>
          </div>

          {/* Auto-Summarize First Mode */}
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>Auto-Summarize First</strong>
              <button
                type="button"
                onClick={() => handleToggle('autosummarize_first')}
                style={{
                  background: settings.autosummarize_first === 'true' ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {settings.autosummarize_first === 'true' ? 'ACTIVE' : 'OFF'}
              </button>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Default responses to concise answers with an explicit expand option to curb token bloat.
            </p>
          </div>

          {/* Nudge Sensitivity Selector */}
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>Nudge Sensitivity</strong>
              <select
                value={settings.nudge_sensitivity}
                onChange={(e) => handleChange('nudge_sensitivity', e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  border: '1px solid var(--border-glass)',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem'
                }}
              >
                <option value="strict" style={{ background: '#0f172a' }}>Strict (Aggressive)</option>
                <option value="standard" style={{ background: '#0f172a' }}>Standard (Balanced)</option>
                <option value="relaxed" style={{ background: '#0f172a' }}>Relaxed (Quiet)</option>
              </select>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Determines token overlap threshold and frequency of inline warnings.
            </p>
          </div>

          {/* Max Output Threshold */}
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>Length Warning Overage</strong>
              <select
                value={settings.max_output_threshold}
                onChange={(e) => handleChange('max_output_threshold', e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  border: '1px solid var(--border-glass)',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem'
                }}
              >
                <option value="400" style={{ background: '#0f172a' }}>400 Words</option>
                <option value="600" style={{ background: '#0f172a' }}>600 Words</option>
                <option value="1000" style={{ background: '#0f172a' }}>1000 Words</option>
              </select>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Threshold above which responses trigger excessive output toasts.
            </p>
          </div>

          {/* Regeneration Limit */}
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>Regeneration Cool-down</strong>
              <select
                value={settings.regen_threshold}
                onChange={(e) => handleChange('regen_threshold', e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  border: '1px solid var(--border-glass)',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem'
                }}
              >
                <option value="2" style={{ background: '#0f172a' }}>2 Re-runs</option>
                <option value="3" style={{ background: '#0f172a' }}>3 Re-runs</option>
                <option value="4" style={{ background: '#0f172a' }}>4 Re-runs</option>
              </select>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Consecutive re-runs before the assist banner and cool-down are attached.
            </p>
          </div>
        </div>
      </div>
      
      <h3 style={{ marginBottom: '1rem', marginTop: '2rem' }}>Implementation Guidance</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-blue)' }}>
          <h4 style={{ fontSize: '1.1rem', color: 'var(--accent-blue)', marginBottom: '0.75rem' }}>1. Local Model Deployment</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            For simple tasks, route queries to local, smaller models (e.g., Llama 3 8B) rather than massive API endpoints. This drastically cuts transmission energy and relies on local infrastructure.
          </p>
          <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Est. Savings: High (up to 80% per query)
          </div>
        </div>
        
        <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-teal)' }}>
          <h4 style={{ fontSize: '1.1rem', color: 'var(--accent-teal)', marginBottom: '0.75rem' }}>2. Semantic Caching</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Implement vector-based caching for frequent institutional queries. If a student asks a similar question to one already answered, serve from cache instead of regenerating.
          </p>
          <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Est. Savings: Medium (depends on query repetition)
          </div>
        </div>
        
        <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-warning)' }}>
          <h4 style={{ fontSize: '1.1rem', color: 'var(--accent-warning)', marginBottom: '0.75rem' }}>3. Off-peak Processing</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Schedule heavy batch processing (like document indexing or large-scale generation) during times when the grid uses more renewable energy and cooling is more efficient (nighttime).
          </p>
          <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Est. Savings: Variable (high impact on carbon, moderate on water)
          </div>
        </div>
        
        <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-emerald)' }}>
          <h4 style={{ fontSize: '1.1rem', color: 'var(--accent-emerald)', marginBottom: '0.75rem' }}>4. Prompt Optimization</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Educate users on writing precise prompts. Fewer "back-and-forth" correction turns means fewer generation cycles, directly saving energy and water.
          </p>
          <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Est. Savings: Direct 1:1 reduction per avoided turn
          </div>
        </div>
      </div>
    </div>
  );
};

export default Optimization;
