document.addEventListener('DOMContentLoaded', () => {
  const elements = {
    interactions: document.getElementById('val-interactions'),
    score: document.getElementById('val-score'),
    energy: document.getElementById('val-energy'),
    water: document.getElementById('val-water'),
    providerBadge: document.getElementById('provider-badge'),
    nudgeArea: document.getElementById('nudge-area'),
    patternArea: document.getElementById('pattern-area'),
    patternInsights: document.getElementById('pattern-insights'),
  };

  function updateUI(data) {
    if (!data) return;

    elements.interactions.textContent = data.interactions || 0;

    const energy = data.totalEnergy || 0;
    const water = data.totalWater || 0;
    elements.energy.textContent = energy.toFixed(4);
    elements.water.textContent = water.toFixed(2);

    let score = data.score !== undefined ? data.score : 100;
    elements.score.textContent = score;

    // Score coloring
    if (score >= 80) {
      elements.score.style.color = 'var(--score-green)';
      elements.score.style.textShadow = '0 0 20px rgba(34, 197, 94, 0.4)';
    } else if (score >= 50) {
      elements.score.style.color = 'var(--score-yellow)';
      elements.score.style.textShadow = '0 0 20px rgba(234, 179, 8, 0.4)';
    } else {
      elements.score.style.color = 'var(--score-red)';
      elements.score.style.textShadow = '0 0 20px rgba(239, 68, 68, 0.4)';
    }

    // Provider badge
    if (data.responses && data.responses.length > 0) {
      const lastProvider = data.responses[data.responses.length - 1].provider;
      elements.providerBadge.textContent =
        lastProvider === 'chatgpt' ? 'ChatGPT' :
        lastProvider === 'gemini' ? 'Gemini' :
        lastProvider === 'claude' ? 'Claude' : 'Unknown';
    }

    // Per-response nudges
    elements.nudgeArea.innerHTML = '';
    elements.nudgeArea.classList.remove('empty');
    if (data.duplicateCount > 0) {
      elements.nudgeArea.innerHTML += `<div class="nudge"><span>♻️</span> Avoid duplicate queries to save energy.</div>`;
    }
    if (data.regenCount > 2) {
      elements.nudgeArea.innerHTML += `<div class="nudge"><span>💧</span> Try refining your prompt instead of regenerating.</div>`;
    }
    if (elements.nudgeArea.innerHTML === '') {
      elements.nudgeArea.classList.add('empty');
    }
  }

  function updatePatterns(patterns) {
    if (!patterns || patterns.length === 0) {
      elements.patternArea.style.display = 'none';
      return;
    }

    elements.patternArea.style.display = 'block';
    elements.patternInsights.innerHTML = '';

    patterns.forEach(insight => {
      const div = document.createElement('div');
      div.className = 'pattern-item';
      div.innerHTML = `<span class="pattern-icon">${insight.icon}</span><span class="pattern-text">${insight.message}</span>`;
      elements.patternInsights.appendChild(div);
    });
  }

  function loadData() {
    chrome.storage.local.get(['neerai_session', 'neerai_patterns'], (result) => {
      const data = result.neerai_session || {
        interactions: 0, totalEnergy: 0, totalWater: 0, score: 100,
        responses: [], duplicateCount: 0, regenCount: 0
      };
      updateUI(data);

      // Run pattern analysis from stored responses
      if (data.responses && data.responses.length >= 3) {
        // Call analyzePatterns if available (loaded via session_patterns.js)
        if (typeof analyzePatterns === 'function') {
          const insights = analyzePatterns(data.responses);
          updatePatterns(insights);
        } else if (result.neerai_patterns) {
          updatePatterns(result.neerai_patterns);
        }
      }
    });
  }

  // Initial load
  loadData();

  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.neerai_session) {
      updateUI(changes.neerai_session.newValue);
    }
    if (areaName === 'local' && changes.neerai_patterns) {
      updatePatterns(changes.neerai_patterns.newValue);
    }
  });

  // Reset Session
  document.getElementById('btn-reset').addEventListener('click', () => {
    const emptySession = {
      interactions: 0, totalEnergy: 0, totalWater: 0, score: 100,
      responses: [], duplicateCount: 0, regenCount: 0
    };
    chrome.storage.local.set({
      neerai_session: emptySession,
      neerai_patterns: []
    }, () => {
      updateUI(emptySession);
      updatePatterns([]);
    });
  });

  // Dashboard Button
  document.getElementById('btn-dashboard').addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:5173' });
  });
});
