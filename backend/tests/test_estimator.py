# estimator tests
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from estimator import estimate_energy, estimate_water, estimate_footprint, calculate_sustainability_score

def test_zero_words():
    assert estimate_energy(0) == 0.0
    water = estimate_water(0)
    assert water["ml"] == 0.0

def test_100_words_chat():
    energy = estimate_energy(100, "chat")
    # 100/100 * 0.002 = 0.002
    assert abs(energy - 0.002) < 0.0001

def test_500_words_code():
    energy = estimate_energy(500, "code")
    # 500/100 * 0.015 = 0.075
    assert abs(energy - 0.075) < 0.001

def test_1000_words_chat():
    energy = estimate_energy(1000, "chat")
    # 1000/100 * 0.002 = 0.02
    assert abs(energy - 0.02) < 0.001

def test_image_task():
    energy = estimate_energy(100, "image")
    # 100/100 * 0.05 = 0.05
    assert abs(energy - 0.05) < 0.001

def test_water_formula():
    """Water = Energy × (WUE_onsite + PUE × EWIF_offsite) = Energy × (1.0 + 1.3 × 3.4) = Energy × 5.42"""
    energy = 0.002  # 100 words chat
    water = estimate_water(energy)
    expected_litres = 0.002 * (1.0 + 1.3 * 3.4)  # = 0.002 * 5.42 = 0.01084
    assert abs(water["litres"] - expected_litres) < 0.0001
    assert abs(water["ml"] - expected_litres * 1000) < 0.1

def test_india_region():
    result = estimate_footprint(100, "chat", "india")
    assert result["region"] == "india"
    assert result["energy_kwh"] > 0
    assert result["water_ml"] > 0
    assert result["carbon_g"] > 0

def test_global_region():
    result = estimate_footprint(100, "chat", "global")
    assert result["region"] == "global"

def test_unknown_region_defaults_to_global():
    result = estimate_footprint(100, "chat", "mars")
    assert result["region"] == "global"

def test_unknown_task_defaults_to_chat():
    energy = estimate_energy(100, "unknown_type")
    chat_energy = estimate_energy(100, "chat")
    assert energy == chat_energy

def test_negative_words():
    assert estimate_energy(-10) == 0.0

def test_footprint_has_disclaimer():
    result = estimate_footprint(100, "chat", "india")
    assert "disclaimer" in result
    assert "Estimated" in result["disclaimer"] or "estimate" in result["disclaimer"].lower()

def test_footprint_has_bottle_percentage():
    result = estimate_footprint(100, "chat", "india")
    assert "bottle_percentage" in result
    assert result["bottle_percentage"] >= 0

def test_sustainability_score_default():
    score = calculate_sustainability_score({"word_count": 50, "task_type": "chat"})
    assert score == 100

def test_sustainability_score_penalties():
    score = calculate_sustainability_score({"word_count": 6000, "task_type": "image", "nudge_type": "duplicate"})
    assert score < 60

def test_sustainability_score_bounds():
    # Score should never go below 0
    score = calculate_sustainability_score({
        "word_count": 10000,
        "task_type": "image",
        "nudge_type": "duplicate"
    })
    assert 0 <= score <= 100
