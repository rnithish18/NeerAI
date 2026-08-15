# nudge_engine.py
import re
import hashlib

def detect_simple_task(text):
    if not text:
        return False
    # Simple arithmetic
    if re.match(r'^[\d\s\+\-\*\/\(\)\=\.]+$', text.strip()):
        return True
    
    # Simple unit conversions
    conversion_keywords = ['convert', 'to', 'celsius', 'fahrenheit', 'km', 'miles', 'kg', 'lbs']
    words = text.lower().split()
    if len(words) < 6 and any(k in words for k in conversion_keywords):
        return True
        
    return False

def detect_duplicate(text, history):
    if not text or not history:
        return False
    text_hash = hashlib.md5(text.lower().strip().encode()).hexdigest()
    for h in history:
        if hashlib.md5(h.lower().strip().encode()).hexdigest() == text_hash:
            return True
    return False

def detect_regeneration(regen_count):
    return regen_count >= 3

def detect_excessive_output(word_count, task_type):
    if task_type == "code" and word_count > 500:
        return True
    if task_type == "chat" and word_count > 1000:
        return True
    return False

def generate_nudge(text, word_count, task_type, regen_count=0, history=None):
    if history is None:
        history = []
        
    if detect_duplicate(text, history):
        return {
            "type": "duplicate",
            "severity": "high",
            "message": "You've asked this recently. Check your history to save AI resources.",
            "icon": "♻️"
        }
        
    if detect_simple_task(text):
        return {
            "type": "simple_task",
            "severity": "medium",
            "message": "Simple tasks like this use significant energy via AI. Consider using a traditional calculator or search.",
            "icon": "🧮"
        }
        
    if detect_regeneration(regen_count):
        return {
            "type": "regeneration",
            "severity": "low",
            "message": "Multiple regenerations consume extra water and energy. Try refining your prompt.",
            "icon": "🔄"
        }
        
    if detect_excessive_output(word_count, task_type):
        return {
            "type": "excessive_output",
            "severity": "medium",
            "message": "Long responses have a high water footprint. Consider asking for concise summaries.",
            "icon": "💧"
        }
        
    return None
