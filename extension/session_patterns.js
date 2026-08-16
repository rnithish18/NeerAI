// NeerAI Session Patterns — Behavioral Pattern Detection
// Runs over sessionData.responses[] to surface weekly/session-level insights
// Privacy-safe: uses only task type, word count, timestamps, frequency
// No raw prompt/response text

const PATTERN_RULES = {
  SIMPLE_TASK_THRESHOLD: 0.4,   // >40% simple tasks triggers tip
  BURST_WINDOW_MS: 120000,      // 2-minute window for burst detection
  BURST_COUNT: 4,               // 4+ queries in burst window
  BURST_AVG_WORDS: 50,          // Average word count considered "short"
  REPETITION_MIN: 5,            // Min responses to check repetition
  COMPLEXITY_TREND_WINDOW: 7,   // Days to analyze trend
};

/**
 * Analyze session responses and return pattern insights
 * @param {Array} responses - Array of {taskType, words, timestamp, isSimple, provider}
 * @returns {Array} Array of pattern insight objects {type, message, icon}
 */
function analyzePatterns(responses) {
  if (!responses || responses.length < 3) return [];

  const insights = [];

  // ─── Pattern 1: High simple-task ratio ───
  const simpleCount = responses.filter(r => r.isSimple).length;
  const simpleRatio = simpleCount / responses.length;
  if (simpleRatio > PATTERN_RULES.SIMPLE_TASK_THRESHOLD && responses.length >= 5) {
    insights.push({
      type: 'simple_heavy',
      icon: '🧮',
      message: `${Math.round(simpleRatio * 100)}% of your queries were quick lookups. For simple math and conversions, try doing it yourself first — save AI for the harder questions.`
    });
  }

  // ─── Pattern 2: High-frequency short bursts ───
  const sortedByTime = [...responses].sort((a, b) => a.timestamp - b.timestamp);
  let maxBurstCount = 0;
  let burstAvgWords = 0;

  for (let i = 0; i < sortedByTime.length; i++) {
    const windowEnd = sortedByTime[i].timestamp + PATTERN_RULES.BURST_WINDOW_MS;
    const burst = sortedByTime.filter(r =>
      r.timestamp >= sortedByTime[i].timestamp && r.timestamp <= windowEnd
    );
    if (burst.length > maxBurstCount) {
      maxBurstCount = burst.length;
      burstAvgWords = burst.reduce((sum, r) => sum + r.words, 0) / burst.length;
    }
  }

  if (maxBurstCount >= PATTERN_RULES.BURST_COUNT && burstAvgWords < PATTERN_RULES.BURST_AVG_WORDS) {
    insights.push({
      type: 'burst_pattern',
      icon: '⚡',
      message: `You sent ${maxBurstCount} short queries in quick succession. Combining related questions into one prompt is more efficient and saves computation.`
    });
  }

  // ─── Pattern 3: Repetition without refinement ───
  if (responses.length >= PATTERN_RULES.REPETITION_MIN) {
    const taskCounts = {};
    responses.forEach(r => {
      taskCounts[r.taskType] = (taskCounts[r.taskType] || 0) + 1;
    });

    const dominantTask = Object.entries(taskCounts).sort((a, b) => b[1] - a[1])[0];
    if (dominantTask && dominantTask[1] / responses.length > 0.8) {
      // Check if word counts are rising (stuck-in-a-loop signal)
      const dominantResponses = responses.filter(r => r.taskType === dominantTask[0]);
      const firstHalf = dominantResponses.slice(0, Math.floor(dominantResponses.length / 2));
      const secondHalf = dominantResponses.slice(Math.floor(dominantResponses.length / 2));

      const firstAvg = firstHalf.reduce((s, r) => s + r.words, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((s, r) => s + r.words, 0) / secondHalf.length;

      if (secondAvg > firstAvg * 1.3 && dominantResponses.length >= 6) {
        insights.push({
          type: 'repetition_loop',
          icon: '🔄',
          message: `Your responses are getting longer over time — this sometimes means you're iterating rather than progressing. Consider outlining the problem yourself before asking AI to solve it end-to-end.`
        });
      }
    }
  }

  // ─── Pattern 4: Task complexity trend ───
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const thisWeek = responses.filter(r => (now - r.timestamp) < weekMs);
  const lastWeek = responses.filter(r => (now - r.timestamp) >= weekMs && (now - r.timestamp) < 2 * weekMs);

  if (thisWeek.length >= 5 && lastWeek.length >= 5) {
    const thisWeekSimpleRatio = thisWeek.filter(r => r.isSimple).length / thisWeek.length;
    const lastWeekSimpleRatio = lastWeek.filter(r => r.isSimple).length / lastWeek.length;

    if (thisWeekSimpleRatio > lastWeekSimpleRatio + 0.15) {
      insights.push({
        type: 'complexity_shift',
        icon: '📊',
        message: `This week you're using AI more for simple tasks compared to last week. For quick lookups, your own knowledge is often faster and free.`
      });
    }
  }

  // Return at most 2 insights to avoid being preachy
  return insights.slice(0, 2);
}

// Make available to popup.js via Chrome storage
function runPatternAnalysis() {
  chrome.storage.local.get(['neerai_session'], (result) => {
    const session = result.neerai_session;
    if (!session || !session.responses) return;

    const insights = analyzePatterns(session.responses);
    chrome.storage.local.set({ neerai_patterns: insights });
  });
}

// Export for use by content.js
if (typeof module !== 'undefined') {
  module.exports = { analyzePatterns, runPatternAnalysis };
}
