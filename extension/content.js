// NeerAI Content Script — AI Sustainability Layer
// Detects AI responses and estimates environmental footprint

// ============================================================================
// ESTIMATION CONFIG (embedded locally — works without backend)
// ============================================================================
const ESTIMATION_CONFIG = {
  WUE_ONSITE: 1.8,
  PUE: 1.2,
  EWIF_OFFSITE: 0.5,
  ENERGY_PER_100_WORDS: { chat: 0.002, code: 0.015, image: 0.05 }
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
  score: 100
};

// Initialize from Chrome storage
chrome.storage.local.get(['neerai_session'], (result) => {
  if (result.neerai_session) sessionData = result.neerai_session;
});

// ============================================================================
// PLATFORM DETECTION
// ============================================================================
function detectPlatform() {
  const url = window.location.hostname;
  if (url.includes('chatgpt.com')) return 'chatgpt';
  if (url.includes('gemini.google.com')) return 'gemini';
  if (url.includes('claude.ai')) return 'claude';
  return 'unknown';
}

const currentPlatform = detectPlatform();

// ============================================================================
// ESTIMATION ENGINE (local, privacy-safe)
// ============================================================================
function estimateEnergy(wordCount, taskType) {
  const baseRate = ESTIMATION_CONFIG.ENERGY_PER_100_WORDS[taskType] || ESTIMATION_CONFIG.ENERGY_PER_100_WORDS.chat;
  return (wordCount / 100) * baseRate;
}

function estimateWater(energyKwh) {
  // Water = Energy × (WUE_onsite + PUE × EWIF_offsite)
  // Li et al., 2023 methodology
  const waterLitres = energyKwh * (ESTIMATION_CONFIG.WUE_ONSITE + (ESTIMATION_CONFIG.PUE * ESTIMATION_CONFIG.EWIF_OFFSITE));
  return waterLitres * 1000; // mL
}

function estimateFootprint(wordCount, taskType) {
  const energy = estimateEnergy(wordCount, taskType);
  const water = estimateWater(energy);
  return { energy, water, words: wordCount };
}

// ============================================================================
// SMARTER TASK-TYPE DETECTION
// Uses DOM structure (code blocks, language hints) instead of keyword-only
// ============================================================================
function detectTaskType(element) {
  // Check for actual code blocks in the DOM — <pre>, <code>, code fences
  const codeBlocks = element.querySelectorAll('pre, code, .code-block, [class*="language-"], [class*="hljs"]');
  const hasCodeBlocks = codeBlocks.length > 0;

  // Check for significant code content (multi-line code, not just inline `backticks`)
  if (hasCodeBlocks) {
    let totalCodeChars = 0;
    codeBlocks.forEach(block => {
      if (block.tagName === 'PRE' || block.closest('pre')) {
        totalCodeChars += (block.textContent || '').length;
      }
    });
    // If there's substantial code (>50 chars in <pre> blocks), classify as code
    if (totalCodeChars > 50) return 'code';
  }

  // Check for image generation indicators
  const text = (element.textContent || '').toLowerCase();
  if (text.includes('here is the image') || text.includes('generated image') || element.querySelector('img[src*="dall-e"], img[src*="generated"]')) {
    return 'image';
  }

  return 'chat';
}

// ============================================================================
// TEXT NORMALIZATION (for better duplicate detection)
// ============================================================================
function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')  // Strip punctuation
    .replace(/\s+/g, ' ')     // Collapse whitespace
    .trim();
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
// SIMPLE-TASK DETECTION (arithmetic, unit conversions, quick lookups)
// ============================================================================
function isSimpleTask(text) {
  const lower = text.toLowerCase().trim();
  const patterns = [
    /^\d+[\s]*[+\-*/×÷][\s]*\d+/,          // Arithmetic: "25 * 18"
    /^(convert|how many|what is)\s+\d/i,     // Conversions: "convert 5 km"
    /^(what|when|where|who) (is|was|are)\s/i, // Quick factual lookups
    /^(define|spell|translate)\s/i,           // Definitions
    /^(calculate|compute)\s+\d/i,            // Calculations
  ];
  // Only flag if the text is short (< 15 words) — longer queries are likely more complex
  const words = lower.split(/\s+/).length;
  if (words > 15) return false;
  return patterns.some(p => p.test(lower));
}

// ============================================================================
// REGENERATION DETECTION
// Tries to hook platform "Regenerate" button first, falls back to heuristic
// ============================================================================
let regenButtonHooked = false;

function hookRegenButton() {
  if (regenButtonHooked) return;
  
  const regenSelectors = [
    // ChatGPT regenerate button
    'button[aria-label*="Regenerate"]',
    'button[data-testid="regenerate-button"]',
    // Gemini retry button
    'button[aria-label*="Retry"]',
    '[data-action="retry"]',
    // Claude retry
    'button[aria-label*="Retry"]',
    'button:has(> svg[data-icon="retry"])',
  ];

  const buttons = document.querySelectorAll(regenSelectors.join(', '));
  buttons.forEach(btn => {
    if (!btn.dataset.neeraiHooked) {
      btn.dataset.neeraiHooked = 'true';
      btn.addEventListener('click', () => {
        sessionData.regenCount++;
        if (sessionData.regenCount >= 3) {
          showInlineToast('💧 Multiple regenerations detected — try refining your prompt instead', 'warning');
        }
        saveSession();
      });
      regenButtonHooked = true;
    }
  });
}

// ============================================================================
// SELECTOR MANAGEMENT WITH FALLBACK LOGGING
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

let selectorHitCount = 0;
let selectorMissLogged = false;

function getResponseNodes() {
  // Try platform-specific selectors first
  const platformSelectors = SELECTORS[currentPlatform] || [];
  const allSelectors = [...platformSelectors, ...SELECTORS.fallback];
  
  const selectorString = allSelectors.join(', ');
  const nodes = document.querySelectorAll(selectorString);
  
  if (nodes.length > 0) {
    selectorHitCount++;
    return nodes;
  }

  // Log selector failure once per session
  if (!selectorMissLogged && sessionData.interactions === 0) {
    console.warn(
      `[NeerAI] No AI response elements found on ${currentPlatform}. ` +
      `Selectors may need updating. Tried: ${selectorString}`
    );
    selectorMissLogged = true;
  }

  return nodes;
}

// ============================================================================
// TEXT EXTRACTION & WORD COUNT
// ============================================================================
function extractText(element) {
  return element.innerText || element.textContent || '';
}

function countWords(text) {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

// ============================================================================
// SESSION PERSISTENCE & SCORING
// ============================================================================
function saveSession() {
  let score = 100;
  score -= (sessionData.duplicateCount * 5);
  score -= (sessionData.regenCount > 2 ? (sessionData.regenCount - 2) * 2 : 0);

  // Penalize high simple-task ratio
  const simpleCount = sessionData.responses.filter(r => r.isSimple).length;
  if (sessionData.responses.length >= 5 && (simpleCount / sessionData.responses.length) > 0.4) {
    score -= 5;
  }

  score = Math.max(0, Math.min(100, score));
  sessionData.score = score;

  chrome.storage.local.set({ neerai_session: sessionData });
}

// ============================================================================
// TOAST NOTIFICATIONS
// ============================================================================
function showInlineToast(message, type = 'info') {
  const borderColors = { info: '#06b6d4', warning: '#eab308', success: '#22c55e' };
  
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; bottom: 24px; right: 24px;
    background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(12px);
    color: #f1f5f9; padding: 12px 20px; border-radius: 8px;
    border-left: 4px solid ${borderColors[type] || borderColors.info};
    z-index: 999999; font-family: system-ui, sans-serif; font-size: 14px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5); max-width: 360px;
    transition: opacity 0.5s ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 500);
  }, 5000);
}

// ============================================================================
// FLOATING EMOJI REACTION
// ============================================================================
function showFloatingEmoji(node, energy) {
  let emoji = '🌱'; // Low footprint
  if (energy > 0.05) emoji = '🌊'; // High footprint
  else if (energy > 0.01) emoji = '💧'; // Moderate footprint

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
  const text = extractText(node);
  const words = countWords(text);
  if (words < 10) return;

  const hash = hashText(text);
  if (processedResponses.has(hash)) return;
  processedResponses.add(hash);

  // Smart task-type detection using DOM structure
  const taskType = detectTaskType(node);
  
  // Normalized duplicate detection
  const isDuplicate = sessionData.responses.some(r => r.hash === hash);
  if (isDuplicate) {
    sessionData.duplicateCount++;
    showInlineToast('♻️ Similar query detected — you may already have this answer', 'warning');
  }

  // Simple-task detection (uses first ~200 chars as proxy, no full text stored)
  const textPreview = text.substring(0, 200);
  const isSimple = isSimpleTask(textPreview);

  // Regeneration: only use heuristic if button hook failed
  if (!regenButtonHooked) {
    const now = Date.now();
    const recentSameType = sessionData.responses.filter(r =>
      r.taskType === taskType && (now - r.timestamp) < 30000 // 30s window (tighter than 60s)
    );
    if (recentSameType.length >= 2) {
      sessionData.regenCount++;
      if (sessionData.regenCount >= 3) {
        showInlineToast('💧 Frequent similar responses — try refining your prompt', 'warning');
      }
    }
  }

  // Excessive output nudge (only if not duplicate/regen)
  if (!isDuplicate && words > 500) {
    showInlineToast('🌱 This was a long response — consider requesting concise answers', 'info');
  }

  // Simple task nudge
  if (isSimple && !isDuplicate) {
    showInlineToast('⚡ Quick lookups are often faster without AI', 'info');
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
    timestamp: Date.now()
  });
  showFloatingEmoji(node, energy);

  // Keep history manageable
  if (sessionData.responses.length > 100) sessionData.responses.shift();

  saveSession();

  // Run behavioral pattern analysis (from session_patterns.js)
  if (typeof runPatternAnalysis === 'function') {
    runPatternAnalysis();
  }

  // Try sending aggregate metrics to backend (privacy-safe: no raw text)
  fetch('http://localhost:8000/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      word_count: words,
      task_type: taskType,
      provider: currentPlatform,
    })
  }).catch(() => { /* silent fail — backend optional */ });
}

// ============================================================================
// MUTATION OBSERVER WITH DEBOUNCE
// ============================================================================
let debounceTimer;

const observer = new MutationObserver(() => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const nodes = getResponseNodes();
    nodes.forEach(node => {
      const text = extractText(node);
      if (text.length > 20) {
        const hash = hashText(text);
        if (!processedResponses.has(hash)) {
          processNewResponse(node);
        }
      }
    });

    // Periodically try to hook regen button
    hookRegenButton();
  }, 500);
});

observer.observe(document.body, { childList: true, subtree: true, characterData: true });

// Initial hook attempt
setTimeout(hookRegenButton, 2000);
