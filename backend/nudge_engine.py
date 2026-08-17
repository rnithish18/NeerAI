# nudge_engine.py
import re
import hashlib
from config import (
    REGEN_THRESHOLDS,
    DEFAULT_REGEN_THRESHOLD,
    SIMILARITY_DUPLICATE_THRESHOLD,
    MAX_PROMPT_SIMPLE_WORDS
)

def normalize_text(text: str) -> str:
    """Normalize text by lowercasing, removing punctuation, and collapsing whitespace."""
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def calculate_token_similarity(text1: str, text2: str) -> float:
    """Calculate Jaccard token similarity between two normalized strings."""
    norm1 = normalize_text(text1)
    norm2 = normalize_text(text2)
    
    if not norm1 or not norm2:
        return 0.0
    if norm1 == norm2:
        return 1.0
        
    tokens1 = set(norm1.split())
    tokens2 = set(norm2.split())
    
    if not tokens1 or not tokens2:
        return 0.0
        
    intersection = tokens1.intersection(tokens2)
    union = tokens1.union(tokens2)
    jaccard = len(intersection) / len(union)
    containment = len(intersection) / min(len(tokens1), len(tokens2))
    return max(jaccard, containment * 0.9)

def detect_simple_task(text: str) -> bool:
    """Broadened simple-task detection: arithmetic, conversions, spelling, dates, timezones, and single-fact lookups."""
    if not text:
        return False
        
    cleaned = text.strip()
    norm = normalize_text(cleaned)
    words = norm.split()
    word_count = len(words)
    
    # 1. Pure arithmetic expressions (e.g., "25 * 18", "100 / 4 + 7")
    if re.match(r'^[\d\s\+\-\*\/\(\)\=\.\^\%×÷]+$', cleaned):
        return True
    if re.match(r'^\d+[\s]*[+\-*/×÷^%][\s]*\d+', cleaned):
        return True
        
    # Only evaluate short queries for lightweight lookups
    if word_count > MAX_PROMPT_SIMPLE_WORDS:
        return False
        
    # 2. Conversions (units, currencies, temperature)
    conversion_patterns = [
        r'^(convert|how many|what is)\s+\d+.*(to|in)\s+\w+',
        r'^\d+\s*(km|miles|kg|lbs|celsius|fahrenheit|usd|inr|eur|meters|feet|hours|minutes|seconds|gb|mb|kb)\s+(to|in)\s+\w+',
        r'^(celsius to fahrenheit|fahrenheit to celsius|km to miles|miles to km|kg to lbs|lbs to kg)'
    ]
    for pattern in conversion_patterns:
        if re.search(pattern, norm):
            return True
            
    # 3. Spelling, definition, and grammar lookups
    spelling_patterns = [
        r'^(how do you spell|how to spell|spell check|correct spelling of|is it spelled)\s+',
        r'^(define|definition of|meaning of|synonym for|synonym of|antonym of)\s+\w+'
    ]
    for pattern in spelling_patterns:
        if re.search(pattern, norm):
            return True
            
    # 4. Date & Time / Timezone math
    datetime_patterns = [
        r'^(what day is|what is the date|current date|today\'s date|what time is it in)\s+',
        r'^(convert\s+\d+.*(am|pm)?\s*(est|pst|cst|ist|gmt|utc)\s+to\s+(est|pst|cst|ist|gmt|utc))',
        r'^(time difference between|days until|how many days between)\s+'
    ]
    for pattern in datetime_patterns:
        if re.search(pattern, norm):
            return True
            
    # 5. Single-fact / Quick trivia lookups
    factual_patterns = [
        r'^(what is the capital of|who is the president of|who is the prime minister of|who is the ceo of)\s+\w+',
        r'^(who founded|who invented|when was|what year was|where was)\s+[\w\s]+(\?|$)',
        r'^(height of|population of|distance between)\s+[\w\s]+(\?|$)'
    ]
    for pattern in factual_patterns:
        if re.search(pattern, norm):
            return True
            
    return False

def detect_duplicate(text: str, history: list) -> bool:
    """Near-duplicate detection combining exact normalization and token-overlap similarity."""
    if not text or not history:
        return False
        
    norm_text = normalize_text(text)
    if not norm_text:
        return False
        
    for h in history:
        norm_h = normalize_text(h)
        if not norm_h:
            continue
            
        # Exact match after normalization
        if norm_text == norm_h:
            return True
            
        # Near-duplicate via token overlap
        similarity = calculate_token_similarity(text, h)
        if similarity >= SIMILARITY_DUPLICATE_THRESHOLD:
            return True
            
    return False

def detect_regeneration(regen_count: int, task_type: str = "chat") -> bool:
    """Check if regenerations exceed the threshold for this task type."""
    threshold = REGEN_THRESHOLDS.get(task_type, DEFAULT_REGEN_THRESHOLD)
    return regen_count >= threshold

def detect_excessive_output(word_count: int, task_type: str) -> bool:
    if task_type == "code" and word_count > 500:
        return True
    if task_type == "reasoning" and word_count > 600:
        return True
    if task_type == "chat" and word_count > 1000:
        return True
    return False

def generate_nudge(text: str, word_count: int, task_type: str, regen_count: int = 0, history: list = None):
    if history is None:
        history = []
        
    if detect_duplicate(text, history):
        return {
            "type": "duplicate",
            "severity": "high",
            "message": "♻️ Similar question asked recently. Check your previous response to save AI resources.",
            "icon": "♻️"
        }
        
    if detect_simple_task(text):
        return {
            "type": "simple_task",
            "severity": "medium",
            "message": "⚡ Quick fact/arithmetic detected: Traditional tools or direct knowledge use ~99% less energy than LLM inference.",
            "icon": "⚡"
        }
        
    if detect_regeneration(regen_count, task_type):
        return {
            "type": "regeneration",
            "severity": "low",
            "message": f"🔄 Multiple regenerations ({regen_count}) on this prompt. Try refining instructions directly to save water.",
            "icon": "🔄"
        }
        
    if detect_excessive_output(word_count, task_type):
        return {
            "type": "excessive_output",
            "severity": "medium",
            "message": "💧 Long output footprint detected. Consider asking for a concise summary first.",
            "icon": "💧"
        }
        
    return None
