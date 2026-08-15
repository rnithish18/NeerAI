# nudge engine tests
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from nudge_engine import detect_simple_task, detect_duplicate, detect_regeneration, detect_excessive_output, generate_nudge

def test_simple_arithmetic():
    assert detect_simple_task("25 * 18") == True

def test_simple_conversion():
    assert detect_simple_task("convert 5 km to miles") == True

def test_complex_query_not_simple():
    assert detect_simple_task("Explain the theory of relativity and its implications for modern physics") == False

def test_empty_text_not_simple():
    assert detect_simple_task("") == False
    assert detect_simple_task(None) == False

def test_duplicate_detection():
    history = ["What is Python?", "How does AI work?"]
    assert detect_duplicate("What is Python?", history) == True

def test_no_duplicate():
    history = ["What is Python?", "How does AI work?"]
    assert detect_duplicate("What is JavaScript?", history) == False

def test_duplicate_empty_history():
    assert detect_duplicate("test", []) == False
    assert detect_duplicate("test", None) == False

def test_regeneration_threshold():
    assert detect_regeneration(3) == True
    assert detect_regeneration(5) == True

def test_below_regeneration_threshold():
    assert detect_regeneration(0) == False
    assert detect_regeneration(2) == False

def test_excessive_output_chat():
    assert detect_excessive_output(1500, "chat") == True
    assert detect_excessive_output(500, "chat") == False

def test_excessive_output_code():
    assert detect_excessive_output(600, "code") == True
    assert detect_excessive_output(300, "code") == False

def test_normal_output():
    assert detect_excessive_output(100, "chat") == False

def test_generate_nudge_duplicate():
    nudge = generate_nudge("What is Python?", 50, "chat", 0, ["What is Python?"])
    assert nudge is not None
    assert nudge["type"] == "duplicate"
    assert nudge["severity"] == "high"

def test_generate_nudge_simple():
    nudge = generate_nudge("25 * 18", 5, "chat", 0, [])
    assert nudge is not None
    assert nudge["type"] == "simple_task"

def test_generate_nudge_regeneration():
    nudge = generate_nudge("Explain AI", 50, "chat", 4, [])
    assert nudge is not None
    assert nudge["type"] == "regeneration"

def test_generate_nudge_excessive():
    nudge = generate_nudge("Long response", 1500, "chat", 0, [])
    assert nudge is not None
    assert nudge["type"] == "excessive_output"

def test_generate_nudge_normal():
    nudge = generate_nudge("Tell me about machine learning", 200, "chat", 0, [])
    assert nudge is None

def test_nudge_structure():
    nudge = generate_nudge("25 * 18", 5, "chat", 0, [])
    assert "type" in nudge
    assert "severity" in nudge
    assert "message" in nudge
    assert "icon" in nudge
