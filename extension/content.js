// ESTIMATION CONFIG (embedded locally)
const ESTIMATION_CONFIG = {
  WUE_ONSITE: 1.0, 
  PUE: 1.3, 
  EWIF_OFFSITE: 3.4,
  ENERGY_PER_100_WORDS: { chat: 0.002, code: 0.015, image: 0.05 }
};

// State
const processedResponses = new Set();
let sessionData = {
  interactions: 0,
  totalEnergy: 0,
  totalWater: 0,
  responses: [],
  regenCount: 0,
  duplicateCount: 0,
  score: 100
};

// Initialize session data from storage
chrome.storage.local.get(['neerai_session'], (result) => {
  if (result.neerai_session) {
    sessionData = result.neerai_session;
  }
});

// Platform Detection
function detectPlatform() {
  const url = window.location.hostname;
  if (url.includes('chatgpt.com')) return 'chatgpt';
  if (url.includes('gemini.google.com')) return 'gemini';
  if (url.includes('claude.ai')) return 'claude';
  return 'unknown';
}

const currentPlatform = detectPlatform();

// Local Estimation Functions
function estimateEnergy(wordCount, taskType) {
  const baseRate = ESTIMATION_CONFIG.ENERGY_PER_100_WORDS[taskType] || ESTIMATION_CONFIG.ENERGY_PER_100_WORDS.chat;
  return (wordCount / 100) * baseRate;
}

function estimateWater(energyKwh) {
  // Water = Energy × (WUE_onsite + PUE × EWIF_offsite)
  // Li et al., 2023 methodology
  const waterLitres = energyKwh * (ESTIMATION_CONFIG.WUE_ONSITE + (ESTIMATION_CONFIG.PUE * ESTIMATION_CONFIG.EWIF_OFFSITE));
  return waterLitres * 1000; // Convert to mL
}

function estimateFootprint(wordCount, taskType) {
  const energy = estimateEnergy(wordCount, taskType);
  const water = estimateWater(energy);
  return { energy, water, words: wordCount };
}

// Processing utilities
function extractText(element) {
  return element.innerText || element.textContent || '';
}

function countWords(text) {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

function detectTaskType(text) {
  const lower = text.toLowerCase();
  if (text.includes('```') || lower.includes('function') || lower.includes('const ')) return 'code';
  // simple image detection
  if (lower.includes('here is the image') || lower.includes('generated image')) return 'image';
  return 'chat';
}

function hashText(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
}

// Update Chrome Storage & compute score
function saveSession() {
  // Base score 100
  let score = 100;
  score -= (sessionData.duplicateCount * 5);
  score -= (sessionData.regenCount > 2 ? (sessionData.regenCount - 2) * 2 : 0);
  score = Math.max(0, score);
  sessionData.score = score;
  
  chrome.storage.local.set({ neerai_session: sessionData });
}

function showInlineToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.bottom = '24px';
  toast.style.right = '24px';
  toast.style.backgroundColor = 'rgba(15, 23, 42, 0.9)';
  toast.style.backdropFilter = 'blur(10px)';
  toast.style.color = '#f1f5f9';
  toast.style.padding = '12px 20px';
  toast.style.borderRadius = '8px';
  toast.style.borderLeft = '4px solid #06b6d4';
  toast.style.zIndex = '999999';
  toast.style.fontFamily = 'sans-serif';
  toast.style.fontSize = '14px';
  toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
  toast.innerHTML = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.5s ease';
    setTimeout(() => toast.remove(), 500);
  }, 5000);
}

function processNewResponse(node) {
  const text = extractText(node);
  const words = countWords(text);
  
  if (words < 10) return;
  
  const hash = hashText(text);
  if (processedResponses.has(hash)) return;
  processedResponses.add(hash);
  
  const taskType = detectTaskType(text);
  const isDuplicate = sessionData.responses.some(r => r.hash === hash);
  
  if (isDuplicate) {
    sessionData.duplicateCount++;
    showInlineToast('♻️ You already asked this (Estimated)');
  }

  // Regen detection: simple heuristic based on short time intervals for same task type
  const now = Date.now();
  const recentSameType = sessionData.responses.filter(r => 
    r.taskType === taskType && (now - r.timestamp) < 60000
  );
  if (recentSameType.length >= 2) {
    sessionData.regenCount++;
    if (sessionData.regenCount >= 3) {
      showInlineToast('💧 Try improving your prompt (Estimated)');
    }
  } else if (words > 500) {
    showInlineToast('🌱 A shorter response may suffice (Estimated)');
  } else {
    showInlineToast('⚡ Lightweight computation recommended (Estimated)');
  }

  const { energy, water } = estimateFootprint(words, taskType);
  
  sessionData.interactions++;
  sessionData.totalEnergy += energy;
  sessionData.totalWater += water;
  sessionData.responses.push({
    hash,
    words,
    energy,
    water,
    provider: currentPlatform,
    taskType,
    timestamp: now
  });
  
  // Keep history manageable
  if (sessionData.responses.length > 100) {
    sessionData.responses.shift();
  }
  
  saveSession();

  // Try sending to local backend
  try {
    fetch('http://localhost:8000/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: currentPlatform,
        words,
        energy,
        water,
        taskType
      })
    }).catch(() => { /* silent fail for local fallback */ });
  } catch (e) {
    // silent fail
  }
}

// Selectors for AI responses
const SELECTORS = [
  '[data-message-author-role="assistant"]', 
  '.markdown', 
  '.agent-turn',
  '.model-response-text', 
  '.response-content', 
  '[data-content-type="response"]',
  '.font-claude-message', 
  '[data-is-streaming]', 
  '.prose'
];

let debounceTimer;

const observer = new MutationObserver((mutations) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    let foundNew = false;
    
    // Look for elements matching our selectors
    const nodes = document.querySelectorAll(SELECTORS.join(', '));
    nodes.forEach(node => {
      // Just check if we've processed this exact node's text
      const text = extractText(node);
      if (text.length > 20) { // arbitrary small limit to avoid processing typing indicators
        const hash = hashText(text);
        if (!processedResponses.has(hash)) {
          // It's a new final-ish response text state
          // We wait until it stops mutating rapidly (debounced)
          processNewResponse(node);
        }
      }
    });
  }, 500);
});

observer.observe(document.body, { childList: true, subtree: true, characterData: true });
