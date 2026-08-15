document.addEventListener('DOMContentLoaded', () => {
  const elements = {
    interactions: document.getElementById('val-interactions'),
    score: document.getElementById('val-score'),
    energy: document.getElementById('val-energy'),
    water: document.getElementById('val-water'),
    providerBadge: document.getElementById('provider-badge'),
    nudgeArea: document.getElementById('nudge-area')
  };

  function updateUI(data) {
    if (!data) return;
    
    // Animate numbers counting up (simplified for standard assignment here)
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

    // Set Provider if available
    if (data.responses && data.responses.length > 0) {
      const lastProvider = data.responses[data.responses.length - 1].provider;
      elements.providerBadge.textContent = 
        lastProvider === 'chatgpt' ? 'ChatGPT' : 
        lastProvider === 'gemini' ? 'Gemini' : 
        lastProvider === 'claude' ? 'Claude' : 'Unknown';
    }

    // Nudges
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

  function loadData() {
    chrome.storage.local.get(['neerai_session'], (result) => {
      const data = result.neerai_session || {
        interactions: 0, totalEnergy: 0, totalWater: 0, score: 100,
        responses: [], duplicateCount: 0, regenCount: 0
      };
      updateUI(data);
    });
  }

  // Initial load
  loadData();

  // Listen for changes
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.neerai_session) {
      updateUI(changes.neerai_session.newValue);
    }
  });

  // Reset Session
  document.getElementById('btn-reset').addEventListener('click', () => {
    const emptySession = {
      interactions: 0, totalEnergy: 0, totalWater: 0, score: 100,
      responses: [], duplicateCount: 0, regenCount: 0
    };
    chrome.storage.local.set({ neerai_session: emptySession }, () => {
      updateUI(emptySession);
    });
  });

  // Dashboard Button
  document.getElementById('btn-dashboard').addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:5173' });
  });
});
