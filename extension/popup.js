document.addEventListener('DOMContentLoaded', () => {
  const elements = {
    interactions: document.getElementById('val-interactions'),
    score: document.getElementById('val-score'),
    scoreRing: document.getElementById('score-ring'),
    energy: document.getElementById('val-energy'),
    water: document.getElementById('val-water'),
    providerBadge: document.getElementById('provider-badge'),
    nudgeArea: document.getElementById('nudge-area'),
    patternArea: document.getElementById('pattern-area'),
    patternInsights: document.getElementById('pattern-insights'),
    btnReset: document.getElementById('btn-reset'),
    dailyCheckin: document.getElementById('daily-checkin'),
    checkinMsg: document.getElementById('checkin-msg'),
    btnCloseCheckin: document.getElementById('btn-close-checkin'),
    reactionBtns: document.querySelectorAll('.reaction-btn')
  };

  const TIPS = [
    "Tip: Combine multiple small prompts into one to save energy.",
    "Tip: Asking AI for code? Specify the exact framework versions to reduce revisions.",
    "Tip: Consider using a search engine for facts instead of generative AI.",
    "Tip: Avoid regenerating responses if the first one is 'good enough'."
  ];

  function updateScoreRing(score) {
    const radius = elements.scoreRing.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (score / 100) * circumference;
    
    elements.scoreRing.style.strokeDashoffset = offset;

    if (score >= 80) {
      elements.scoreRing.style.stroke = 'var(--score-green)';
      elements.score.style.fill = 'var(--score-green)';
    } else if (score >= 50) {
      elements.scoreRing.style.stroke = 'var(--score-yellow)';
      elements.score.style.fill = 'var(--score-yellow)';
    } else {
      elements.scoreRing.style.stroke = 'var(--score-red)';
      elements.score.style.fill = 'var(--score-red)';
    }
  }

  function updateUI(data) {
    if (!data) return;

    elements.interactions.textContent = data.interactions || 0;

    const energy = data.totalEnergy || 0;
    const water = data.totalWater || 0;
    elements.energy.textContent = energy.toFixed(4);
    elements.water.textContent = water.toFixed(2);

    let score = data.score !== undefined ? data.score : 100;
    elements.score.textContent = score;
    updateScoreRing(score);

    // Provider badge
    if (data.responses && data.responses.length > 0) {
      const lastProvider = data.responses[data.responses.length - 1].provider;
      elements.providerBadge.textContent =
        lastProvider === 'chatgpt' ? 'ChatGPT' :
        lastProvider === 'gemini' ? 'Gemini' :
        lastProvider === 'claude' ? 'Claude' : 'Unknown';
    } else {
      elements.providerBadge.textContent = 'Unknown';
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
    chrome.storage.local.get(['neerai_session', 'neerai_patterns', 'neerai_reactions', 'neerai_last_checkin'], (result) => {
      const data = result.neerai_session || {
        interactions: 0, totalEnergy: 0, totalWater: 0, score: 100,
        responses: [], duplicateCount: 0, regenCount: 0
      };
      updateUI(data);
      syncToBackend(data);

      // Run pattern analysis from stored responses
      if (data.responses && data.responses.length >= 3) {
        if (typeof analyzePatterns === 'function') {
          const insights = analyzePatterns(data.responses);
          updatePatterns(insights);
        } else if (result.neerai_patterns) {
          updatePatterns(result.neerai_patterns);
        }
      }

      // Handle Daily Checkin
      const today = new Date().toDateString();
      if (result.neerai_last_checkin !== today) {
        elements.dailyCheckin.style.display = 'flex';
        elements.checkinMsg.textContent = TIPS[Math.floor(Math.random() * TIPS.length)];
      }

      // Restore active reaction if any
      if (result.neerai_reactions) {
        elements.reactionBtns.forEach(btn => {
          if (btn.dataset.reaction === result.neerai_reactions.current) {
            btn.classList.add('active');
          }
        });
      }

      // Onboarding Logic
      chrome.storage.local.get(['onboarded', 'neerai_streak'], (res) => {
        if (!res.onboarded) {
          document.getElementById('onboarding-modal').style.display = 'block';
        }

        // Streak Badge
        const streak = res.neerai_streak || { count: 0, lastDate: null };
        if (streak.count > 0) {
          document.getElementById('streak-badge').style.display = 'block';
          document.getElementById('streak-count').textContent = streak.count;
        }
      });

      // Weekly Impact Story
      if (data.responses && data.responses.length > 0) {
        const firstResponseTime = data.responses[0].timestamp;
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        
        // Show if history spans more than 7 days, or if they have more than 15 responses
        if (firstResponseTime < oneWeekAgo || data.responses.length >= 15) {
          const totalWater = data.totalWater || 0;
          const totalEnergy = data.totalEnergy || 0;
          const bottleEquiv = (totalWater / 500).toFixed(1);
          
          document.getElementById('weekly-story').style.display = 'block';
          document.getElementById('weekly-story-content').innerHTML = 
            `This week you had <strong>${data.responses.length}</strong> conversations. Estimated footprint: <strong>${totalWater.toFixed(1)} mL</strong> water, <strong>${totalEnergy.toFixed(4)} kWh</strong> energy — roughly equivalent to <strong>${bottleEquiv} bottles of water</strong> (500mL).`;
        }
      }
    });
  }

  // Initial load
  loadData();

  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local') {
      if (changes.neerai_session) updateUI(changes.neerai_session.newValue);
      if (changes.neerai_patterns) updatePatterns(changes.neerai_patterns.newValue);
    }
  });

  // Daily checkin close
  elements.btnCloseCheckin.addEventListener('click', () => {
    elements.dailyCheckin.style.display = 'none';
    chrome.storage.local.set({ neerai_last_checkin: new Date().toDateString() });
  });

  // Reaction buttons
  elements.reactionBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      elements.reactionBtns.forEach(b => b.classList.remove('active'));
      const reaction = e.target.dataset.reaction || e.target.closest('.reaction-btn').dataset.reaction;
      e.target.closest('.reaction-btn').classList.add('active');
      
      chrome.storage.local.get(['neerai_reactions'], (res) => {
        const reactions = res.neerai_reactions || { counts: { up: 0, down: 0, think: 0 } };
        reactions.counts[reaction] = (reactions.counts[reaction] || 0) + 1;
        reactions.current = reaction;
        chrome.storage.local.set({ neerai_reactions: reactions });
      });
    });
  });

  // Reset Session
  elements.btnReset.addEventListener('click', () => {
    const emptySession = {
      interactions: 0, totalEnergy: 0, totalWater: 0, score: 100,
      responses: [], duplicateCount: 0, regenCount: 0
    };
    chrome.storage.local.set({
      neerai_session: emptySession,
      neerai_patterns: [],
      neerai_reactions: null
    }, () => {
      updateUI(emptySession);
      updatePatterns([]);
      elements.reactionBtns.forEach(b => b.classList.remove('active'));
      
      const originalText = elements.btnReset.textContent;
      elements.btnReset.textContent = '🧹 Cleared!';
      setTimeout(() => {
        elements.btnReset.textContent = originalText;
      }, 1500);
    });
  });

  function syncToBackend(data) {
    if (!data || !data.interactions) return;
    fetch('http://localhost:8000/sync/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        interactions: data.interactions,
        total_energy: data.totalEnergy || 0.0,
        total_water: data.totalWater || 0.0,
        score: data.score || 94,
        responses: data.responses || []
      })
    }).catch(() => { /* silent fail if backend offline */ });
  }

  // Dashboard Button
  document.getElementById('btn-dashboard').addEventListener('click', () => {
    chrome.storage.local.get(['neerai_session'], (result) => {
      if (result.neerai_session) {
        syncToBackend(result.neerai_session);
      }
      chrome.tabs.create({ url: 'http://localhost:5173' });
    });
  });

  // Onboarding Buttons
  document.querySelectorAll('.btn-next-step').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const next = e.target.dataset.next;
      document.querySelectorAll('.onboarding-step').forEach(el => el.style.display = 'none');
      document.getElementById('onboarding-step-' + next).style.display = 'block';
    });
  });

  document.getElementById('btn-finish-onboarding').addEventListener('click', () => {
    document.getElementById('onboarding-modal').style.display = 'none';
    chrome.storage.local.set({ onboarded: true });
  });

  document.getElementById('btn-skip-onboarding').addEventListener('click', () => {
    document.getElementById('onboarding-modal').style.display = 'none';
    chrome.storage.local.set({ onboarded: true });
  });
});
