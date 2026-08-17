// NeerAI Content Script — AI Sustainability Layer (v1.3)
// Detects AI responses and estimates environmental footprint in real-time

// ============================================================================
// ESTIMATION CONFIG (embedded locally — works with or without backend)
// ============================================================================
// Shipped defaults aligned with backend/config.py:
// WUE_ONSITE = 1.8 L/kWh (on-site cooling)
// PUE = 1.2 (facility power overhead)
// EWIF_OFFSITE = 0.5 L/kWh (grid generation water intensity)
// Multiplier: 1.8 + (1.2 * 0.5) = 2.4 L per kWh
const ESTIMATION_CONFIG = {
  WUE_ONSITE: 1.8,
  PUE: 1.2,
  EWIF_OFFSITE: 0.5,
  ENERGY_PER_100_WORDS: {
    chat: 0.002,
    reasoning: 0.035, // Extended reasoning / chain-of-thought
    code: 0.015,
    image: 0.05
  },
  REGEN_THRESHOLDS: {
    chat: 3,
    reasoning: 2,
    code: 4,
    image: 2
  },
  SIMILARITY_DUPLICATE_THRESHOLD: 0.75
};

// ============================================================================
// STATE
// ============================================================================
const processedResponses = new Set();
let sessionData = {
  interactions: 0,
  totalEnergy: 0,
  totalWater: 0,
  responses: [],
  regenCount: 0,
  duplicateCount: 0,
  idleIgnoredCount: 0,
  score: 100
};

// Initialize from Chrome storage
chrome.storage.local.get(['neerai_session'], (result) => {
  if (result.neerai_session) sessionData = result.neerai_session;
});

// ============================================================================
// PLATFORM & REASONING DETECTION
// ============================================================================
function detectPlatform() {
  const url = window.location.hostname;
  if (url.includes('chatgpt.com')) return 'chatgpt';
  if (url.includes('gemini.google.com')) return 'gemini';
  if (url.includes('claude.ai')) return 'claude';
  return 'unknown';
}

const currentPlatform = detectPlatform();

function isReasoningModelActive() {
  const bodyText = (document.body.innerText || '').toLowerCase();
  const titleText = (document.title || '').toLowerCase();
  
  // Check common reasoning model indicators in URL / page / model selector
  const reasoningKeywords = ['o1-preview', 'o1-mini', 'o1', 'o3-mini', 'o3', 'deepseek-r1', 'thinking', 'extended thinking', 'reasoning'];
  const hasReasoningSelector = document.querySelector('[data-testid*="model-switcher"], [aria-label*="Model"], button:has([class*="model"])');
  const selectorText = hasReasoningSelector ? hasReasoningSelector.textContent.toLowerCase() : '';
  
  return reasoningKeywords.some(k => selectorText.includes(k) || titleText.includes(k));
}

// ============================================================================
// ESTIMATION ENGINE (local, privacy-safe)
// ============================================================================
function estimateEnergy(wordCount, taskType) {
  const baseRate = ESTIMATION_CONFIG.ENERGY_PER_100_WORDS[taskType] || ESTIMATION_CONFIG.ENERGY_PER_100_WORDS.chat;
  return (wordCount / 100) * baseRate;
}

function estimateWater(energyKwh) {
  // Water = Energy × (WUE_onsite + PUE × EWIF_offsite) (Li et al., 2023)
  const waterLitres = energyKwh * (ESTIMATION_CONFIG.WUE_ONSITE + (ESTIMATION_CONFIG.PUE * ESTIMATION_CONFIG.EWIF_OFFSITE));
  return waterLitres * 1000; // mL
}

function estimateFootprint(wordCount, taskType) {
  const energy = estimateEnergy(wordCount, taskType);
  const water = estimateWater(energy);
  return { energy, water, words: wordCount };
}

// ============================================================================
// TASK-TYPE DETECTION (Distinguishes standard chat, reasoning, code, image)
// ============================================================================
function detectTaskType(element) {
  // 1. Check for extended reasoning / thinking blocks in DOM
  const thoughtContainers = element.querySelectorAll(
    '.thinking-container, details[data-testid*="thought"], [class*="thought"], [class*="reasoning"], .model-thought, [data-is-thought="true"]'
  );
  if (thoughtContainers.length > 0 || isReasoningModelActive()) {
    return 'reasoning';
  }

  // 2. Check for actual code blocks in the DOM — <pre>, <code>, code fences
  const codeBlocks = element.querySelectorAll('pre, code, .code-block, [class*="language-"], [class*="hljs"]');
  if (codeBlocks.length > 0) {
    let totalCodeChars = 0;
    codeBlocks.forEach(block => {
      if (block.tagName === 'PRE' || block.closest('pre')) {
        totalCodeChars += (block.textContent || '').length;
      }
    });
    if (totalCodeChars > 50) return 'code';
  }

  // 3. Check for image generation indicators
  const text = (element.textContent || '').toLowerCase();
  if (text.includes('here is the image') || text.includes('generated image') || element.querySelector('img[src*="dall-e"], img[src*="generated"]')) {
    return 'image';
  }

  return 'chat';
}

// ============================================================================
// TEXT NORMALIZATION & NEAR-DUPLICATE DETECTION
// ============================================================================
function normalizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')  // Strip punctuation
    .replace(/\s+/g, ' ')      // Collapse whitespace
    .trim();
}

function calculateTokenSimilarity(text1, text2) {
  const norm1 = normalizeText(text1);
  const norm2 = normalizeText(text2);
  if (!norm1 || !norm2) return 0.0;
  if (norm1 === norm2) return 1.0;

  const tokens1 = new Set(norm1.split(' '));
  const tokens2 = new Set(norm2.split(' '));
  if (tokens1.size === 0 || tokens2.size === 0) return 0.0;

  let intersectionCount = 0;
  tokens1.forEach(t => {
    if (tokens2.has(t)) intersectionCount++;
  });

  const unionSize = new Set([...tokens1, ...tokens2]).size;
  return intersectionCount / unionSize;
}

function hashText(text) {
  const normalized = normalizeText(text);
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
}

// ============================================================================
// BROADENED SIMPLE-TASK DETECTION
// ============================================================================
function isSimpleTask(text) {
  if (!text) return false;
  const cleaned = text.trim();
  const norm = normalizeText(cleaned);
  const words = norm.split(' ');

  // 1. Pure arithmetic expressions
  if (/^[\d\s\+\-\*\/\(\)\=\.\^\%×÷]+$/.test(cleaned)) return true;
  if (/^\d+[\s]*[+\-*/×÷^%][\s]*\d+/.test(cleaned)) return true;

  if (words.length > 15) return false;

  // 2. Unit/Currency/Temperature conversions
  const conversionPatterns = [
    /^(convert|how many|what is)\s+\d+.*(to|in)\s+\w+/i,
    /^\d+\s*(km|miles|kg|lbs|celsius|fahrenheit|usd|inr|eur|meters|feet|hours|minutes|seconds|gb|mb|kb)\s+(to|in)\s+\w+/i,
    /^(celsius to fahrenheit|fahrenheit to celsius|km to miles|miles to km|kg to lbs|lbs to kg)/i
  ];
  if (conversionPatterns.some(p => p.test(norm))) return true;

  // 3. Spelling, definition, and grammar lookups
  const spellingPatterns = [
    /^(how do you spell|how to spell|spell check|correct spelling of|is it spelled)\s+/i,
    /^(define|definition of|meaning of|synonym for|synonym of|antonym of)\s+\w+/i
  ];
  if (spellingPatterns.some(p => p.test(norm))) return true;

  // 4. Date & Time / Timezone lookups
  const datetimePatterns = [
    /^(what day is|what is the date|current date|today's date|what time is it in)\s+/i,
    /^(convert\s+\d+.*(am|pm)?\s*(est|pst|cst|ist|gmt|utc)\s+to\s+(est|pst|cst|ist|gmt|utc))/i,
    /^(time difference between|days until|how many days between)\s+/i
  ];
  if (datetimePatterns.some(p => p.test(norm))) return true;

  // 5. Single-fact factual lookups
  const factualPatterns = [
    /^(what is the capital of|who is the president of|who is the prime minister of|who is the ceo of)\s+\w+/i,
    /^(who founded|who invented|when was|what year was|where was)\s+[\w\s]+(\?|$)/i,
    /^(height of|population of|distance between)\s+[\w\s]+(\?|$)/i
  ];
  if (factualPatterns.some(p => p.test(norm))) return true;

  return false;
}

// ============================================================================
// PROPORTIONAL SCORING ENGINE
// ============================================================================
function saveSession() {
  let score = 100.0;

  // Proportional duplicate penalty
  score -= (sessionData.duplicateCount * 8.0);

  // Proportional regeneration penalty
  if (sessionData.regenCount > 1) {
    score -= Math.min(20.0, 4.0 + (sessionData.regenCount - 1) * 3.5);
  }

  // Idle ignored responses penalty
  if (sessionData.idleIgnoredCount > 0) {
    score -= (sessionData.idleIgnoredCount * 5.0);
  }

  // Proportional length & task penalties over recent responses
  if (sessionData.responses && sessionData.responses.length > 0) {
    let recentLengthPenalties = 0;
    let simpleCount = 0;
    const recent = sessionData.responses.slice(-20);

    recent.forEach(r => {
      if (r.words > 150) {
        recentLengthPenalties += Math.min(2.0, (r.words - 150) / 400.0);
      }
      if (r.taskType === 'reasoning') recentLengthPenalties += 1.5;
      if (r.isSimple) simpleCount++;
    });

    score -= Math.min(20.0, recentLengthPenalties);

    if (recent.length >= 5 && (simpleCount / recent.length) > 0.35) {
      score -= 8.0;
    }
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  sessionData.score = score;

  chrome.storage.local.set({ neerai_session: sessionData });
}

// ============================================================================
// IDLE RESPONSE TRACKING (IntersectionObserver for unread waste detection)
// ============================================================================
const responseVisibilityObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.dataset.neeraiViewed = 'true';
      responseVisibilityObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

function trackResponseVisibility(node, wordCount) {
  if (wordCount < 200) return;
  responseVisibilityObserver.observe(node);

  // Check 60s later if it was never viewed (e.g. background tab / abandoned query)
  setTimeout(() => {
    if (node && node.dataset.neeraiViewed !== 'true') {
      sessionData.idleIgnoredCount = (sessionData.idleIgnoredCount || 0) + 1;
      saveSession();
    }
  }, 60000);
}

// ============================================================================
// TOAST NOTIFICATIONS & COOL-DOWN HELPERS
// ============================================================================
function showInlineToast(message, type = 'info') {
  const borderColors = { info: '#06b6d4', warning: '#eab308', success: '#22c55e' };
  
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; bottom: 24px; right: 24px;
    background: rgba(15, 23, 42, 0.94); backdrop-filter: blur(12px);
    color: #f1f5f9; padding: 12px 20px; border-radius: 8px;
    border-left: 4px solid ${borderColors[type] || borderColors.info};
    z-index: 999999; font-family: system-ui, sans-serif; font-size: 14px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5); max-width: 380px;
    transition: opacity 0.5s ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 500);
  }, 5500);
}

function showCoolDownAssist(targetBtn) {
  if (document.getElementById('neerai-cooldown-banner')) return;

  const banner = document.createElement('div');
  banner.id = 'neerai-cooldown-banner';
  banner.style.cssText = `
    position: fixed; bottom: 80px; right: 24px;
    background: rgba(30, 41, 59, 0.98); border: 1px solid #f59e0b;
    color: #f8fafc; padding: 14px 18px; border-radius: 10px;
    z-index: 999999; font-family: system-ui, sans-serif; font-size: 13px;
    box-shadow: 0 12px 30px rgba(0,0,0,0.6); max-width: 380px;
  `;
  banner.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
      <strong style="color:#fbbf24;">⏳ Regeneration Cool-down</strong>
      <button id="close-cooldown" style="background:transparent; border:none; color:#94a3b8; cursor:pointer; font-size:16px;">×</button>
    </div>
    <p style="margin:0 0 8px; color:#cbd5e1; line-height:1.4;">
      3+ regenerations detected on this prompt. Re-running without changes wastes water and compute.
    </p>
    <div style="font-size:12px; color:#38bdf8; background:rgba(56,189,248,0.1); padding:6px 10px; border-radius:6px;">
      💡 Tip: Specify exact output format, constraints, or length in your prompt.
    </div>
  `;

  document.body.appendChild(banner);
  document.getElementById('close-cooldown').addEventListener('click', () => banner.remove());
  setTimeout(() => banner && banner.remove(), 12000);
}

// ============================================================================
// REGENERATION HOOK WITH THRESHOLDS
// ============================================================================
let regenButtonHooked = false;

function hookRegenButton() {
  const regenSelectors = [
    'button[aria-label*="Regenerate"]',
    'button[data-testid="regenerate-button"]',
    'button[aria-label*="Retry"]',
    '[data-action="retry"]',
    'button:has(> svg[data-icon="retry"])'
  ];

  const buttons = document.querySelectorAll(regenSelectors.join(', '));
  buttons.forEach(btn => {
    if (!btn.dataset.neeraiHooked) {
      btn.dataset.neeraiHooked = 'true';
      btn.addEventListener('click', () => {
        sessionData.regenCount++;
        if (sessionData.regenCount >= 3) {
          showCoolDownAssist(btn);
        }
        saveSession();
      });
      regenButtonHooked = true;
    }
  });
}

// ============================================================================
// FLOATING EMOJI REACTION
// ============================================================================
function showFloatingEmoji(node, energy, taskType) {
  let emoji = '🌱'; // Low footprint
  if (taskType === 'reasoning' || energy > 0.04) emoji = '🧠'; // Extended reasoning
  else if (energy > 0.02) emoji = '🌊'; // High footprint
  else if (energy > 0.008) emoji = '💧'; // Moderate footprint

  const el = document.createElement('div');
  el.textContent = emoji;
  el.style.cssText = `
    position: absolute;
    right: -30px;
    top: 0;
    font-size: 24px;
    opacity: 0;
    transform: translateY(10px);
    transition: all 1s ease-out;
    pointer-events: none;
    z-index: 100;
  `;

  if (getComputedStyle(node).position === 'static') {
    node.style.position = 'relative';
  }
  
  node.appendChild(el);

  requestAnimationFrame(() => {
    el.style.opacity = '1';
    el.style.transform = 'translateY(-20px)';
  });

  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(-40px)';
    setTimeout(() => el.remove(), 1000);
  }, 3000);
}

// ============================================================================
// CORE: PROCESS NEW AI RESPONSE
// ============================================================================
function processNewResponse(node) {
  const text = (node.innerText || node.textContent || '').trim();
  const words = text.split(/\s+/).filter(w => w.length > 0).length;
  if (words < 10) return;

  const hash = hashText(text);
  if (processedResponses.has(hash)) return;
  processedResponses.add(hash);

  // 1. Task-type detection
  const taskType = detectTaskType(node);

  // 2. Near-duplicate check with token similarity
  const isDuplicate = sessionData.responses.some(r => {
    if (r.hash === hash) return true;
    if (r.textSnippet && calculateTokenSimilarity(text, r.textSnippet) >= ESTIMATION_CONFIG.SIMILARITY_DUPLICATE_THRESHOLD) {
      return true;
    }
    return false;
  });

  if (isDuplicate) {
    sessionData.duplicateCount++;
    showInlineToast('♻️ Near-duplicate response detected — consider checking previous turns', 'warning');
  }

  // 3. Simple-task detection
  const textPreview = text.substring(0, 250);
  const isSimple = isSimpleTask(textPreview);
  if (isSimple && !isDuplicate) {
    showInlineToast('⚡ Quick factual lookup: Traditional tools consume ~99% less energy', 'info');
  }

  // 4. Excessive output nudge
  if (!isDuplicate && words > (taskType === 'reasoning' ? 600 : 1000)) {
    showInlineToast('💧 Lengthy response generated — consider asking for concise summaries', 'info');
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
    isSimple,
    textSnippet: text.substring(0, 150),
    timestamp: Date.now()
  });

  showFloatingEmoji(node, energy, taskType);
  trackResponseVisibility(node, words);

  if (sessionData.responses.length > 100) sessionData.responses.shift();

  saveSession();

  if (typeof runPatternAnalysis === 'function') {
    runPatternAnalysis();
  }

  const logPayload = {
    word_count: words,
    task_type: taskType,
    provider: currentPlatform,
  };

  sendToBackend(logPayload);
}

// ============================================================================
// BACKEND SYNC & OFFLINE QUEUE
// ============================================================================
function sendToBackend(payload) {
  fetch('http://localhost:8000/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(res => {
    if (res.ok) {
      flushOfflineQueue();
    } else {
      queueLogForLater(payload);
    }
  })
  .catch(() => {
    queueLogForLater(payload);
  });
}

function queueLogForLater(payload) {
  chrome.storage.local.get(['neerai_offline_queue'], (result) => {
    const queue = result.neerai_offline_queue || [];
    queue.push(payload);
    chrome.storage.local.set({ neerai_offline_queue: queue });
  });
}

function flushOfflineQueue() {
  chrome.storage.local.get(['neerai_offline_queue'], (result) => {
    const queue = result.neerai_offline_queue || [];
    if (queue.length === 0) return;

    const payload = queue[0];
    fetch('http://localhost:8000/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => {
      if (res.ok) {
        queue.shift();
        chrome.storage.local.set({ neerai_offline_queue: queue }, () => {
          if (queue.length > 0) flushOfflineQueue();
        });
      }
    })
    .catch(() => { /* backend still unreachable */ });
  });
}

setTimeout(flushOfflineQueue, 2000);

// ============================================================================
// PROACTIVE PRE-SUBMIT NUDGE & REASONING MODE DETECTOR
// ============================================================================
let proactiveTipShown = false;
let tipElement = null;

function showProactiveTip(inputBox, isReasoning = false) {
  if (proactiveTipShown || tipElement) return;

  tipElement = document.createElement('div');
  tipElement.style.cssText = `
    position: absolute;
    bottom: 100%;
    left: 10px;
    margin-bottom: 8px;
    background: rgba(15, 23, 42, 0.96);
    color: #f1f5f9;
    padding: 10px 14px;
    border-radius: 8px;
    border: 1px solid ${isReasoning ? '#f59e0b' : '#38bdf8'};
    font-size: 13px;
    font-family: system-ui, sans-serif;
    z-index: 999999;
    box-shadow: 0 6px 18px rgba(0,0,0,0.4);
    display: flex;
    align-items: center;
    gap: 8px;
  `;

  if (isReasoning) {
    tipElement.innerHTML = `
      <span>🧠 <strong>Reasoning Mode:</strong> This simple query uses ~5-10x more energy/water in extended thinking. Standard chat recommended.</span>
      <button style="background:transparent; border:none; color:#94a3b8; cursor:pointer; font-size:16px; padding:0 4px;">×</button>
    `;
  } else {
    tipElement.innerHTML = `
      <span>⚡ <strong>Quick Fact/Math:</strong> Traditional search or calculation uses ~99% less energy than LLM inference.</span>
      <button style="background:transparent; border:none; color:#94a3b8; cursor:pointer; font-size:16px; padding:0 4px;">×</button>
    `;
  }

  tipElement.querySelector('button').addEventListener('click', () => {
    tipElement.remove();
    tipElement = null;
    proactiveTipShown = true;
    
    // Reward conscious choice in local streak
    chrome.storage.local.get(['neerai_streak'], (res) => {
      const streak = res.neerai_streak || { count: 0, lastDate: null };
      const today = new Date().toDateString();
      if (streak.lastDate !== today) {
        streak.count += 1;
        streak.lastDate = today;
        chrome.storage.local.set({ neerai_streak: streak });
      }
    });
  });

  const wrapper = inputBox.parentElement;
  if (getComputedStyle(wrapper).position === 'static') {
    wrapper.style.position = 'relative';
  }
  wrapper.appendChild(tipElement);
}

function handleInputEvent(e) {
  const text = e.target.value || e.target.textContent || '';
  if (text.trim().length > 4 && isSimpleTask(text)) {
    const isReasoning = isReasoningModelActive();
    showProactiveTip(e.target, isReasoning);
  } else if (tipElement) {
    tipElement.remove();
    tipElement = null;
  }
}

function attachInputListeners() {
  const inputSelectors = [
    '#prompt-textarea',
    'rich-textarea',
    '[contenteditable="true"]',
    'textarea'
  ];

  const inputs = document.querySelectorAll(inputSelectors.join(', '));
  inputs.forEach(input => {
    if (!input.dataset.neeraiInputHooked) {
      input.dataset.neeraiInputHooked = 'true';
      input.addEventListener('input', handleInputEvent);
    }
  });
}

// ============================================================================
// MUTATION OBSERVER WITH SELECTOR MANAGEMENT
// ============================================================================
const SELECTORS = {
  chatgpt: [
    '[data-message-author-role="assistant"]',
    '.markdown.prose',
    '.agent-turn',
  ],
  gemini: [
    '.model-response-text',
    '.response-content',
    '[data-content-type="response"]',
  ],
  claude: [
    '.font-claude-message',
    '[data-is-streaming="false"]',
    '.prose',
  ],
  fallback: [
    '.markdown',
    '.prose',
    '[role="article"]',
    '[data-message-author-role="assistant"]',
  ]
};

function getResponseNodes() {
  const platformSelectors = SELECTORS[currentPlatform] || [];
  const allSelectors = [...platformSelectors, ...SELECTORS.fallback];
  return document.querySelectorAll(allSelectors.join(', '));
}

let debounceTimer;

const observer = new MutationObserver(() => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const nodes = getResponseNodes();
    nodes.forEach(node => {
      const text = (node.innerText || node.textContent || '').trim();
      if (text.length > 20) {
        const hash = hashText(text);
        if (!processedResponses.has(hash)) {
          processNewResponse(node);
        }
      }
    });

    hookRegenButton();
    attachInputListeners();
  }, 500);
});

observer.observe(document.body, { childList: true, subtree: true, characterData: true });

setTimeout(() => {
  hookRegenButton();
  attachInputListeners();
}, 2000);
