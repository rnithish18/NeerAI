# estimator.py
"""
NeerAI Estimation Engine

Estimates energy and water footprint of AI interactions.
Based on methodology from Li et al., 2023:
"Making AI Less 'Thirsty': Uncovering and Addressing the Secret Water Footprint of AI Models"
https://arxiv.org/abs/2304.03271

IMPORTANT: All values are ESTIMATES based on configurable assumptions.
NeerAI does NOT physically measure data-center water consumption.
"""
from config import ENERGY_PER_100_WORDS_KWH, WUE_ONSITE, PUE, EWIF_OFFSITE, REGIONS


def estimate_energy(word_count, task_type="chat"):
    """Estimate energy consumption in kWh based on output word count.
    
    Formula: energy_kwh = (word_count / 100) * energy_per_100_words
    
    Note: This is a LINEAR approximation. Real energy consumption depends
    on model architecture, hardware, batch size, and many other factors.
    """
    task_type = task_type.lower()
    if task_type not in ENERGY_PER_100_WORDS_KWH:
        task_type = "chat"
    
    if word_count <= 0:
        return 0.0
        
    energy_per_100 = ENERGY_PER_100_WORDS_KWH[task_type]
    energy_kwh = (word_count / 100.0) * energy_per_100
    return round(energy_kwh, 6)


def estimate_water(energy_kwh, region="india"):
    """Estimate water footprint from energy consumption.
    
    Formula (Li et al., 2023):
        Water (litres) = Energy (kWh) × (WUE_onsite + PUE × EWIF_offsite)
    
    Where:
        WUE_onsite  = On-site Water Usage Effectiveness (L/kWh) — cooling towers
        PUE         = Power Usage Effectiveness — overhead multiplier
        EWIF_offsite = Off-site Electricity Water Intensity Factor (L/kWh)
    """
    if energy_kwh <= 0:
        return {"litres": 0.0, "ml": 0.0}
    
    # Water = Energy × (WUE_onsite + PUE × EWIF_offsite)
    water_litres = energy_kwh * (WUE_ONSITE + PUE * EWIF_OFFSITE)
    water_ml = water_litres * 1000
    
    return {
        "litres": round(water_litres, 6),
        "ml": round(water_ml, 2)
    }


def estimate_footprint(word_count, task_type="chat", region="india"):
    """Complete footprint estimation for an AI interaction.
    
    Returns a dict with energy, water, and carbon estimates.
    All values are clearly labeled as estimates.
    """
    if region not in REGIONS:
        region = "global"
        
    energy_kwh = estimate_energy(word_count, task_type)
    water_data = estimate_water(energy_kwh, region)
    
    carbon_intensity = REGIONS[region]["grid_carbon_intensity"]
    carbon_g = round(energy_kwh * carbon_intensity, 4)
    
    # India context: comparison to 500mL reference bottle
    bottle_percentage = round((water_data["ml"] / 500) * 100, 2) if water_data["ml"] > 0 else 0.0
    
    return {
        "energy_kwh": energy_kwh,
        "water_litres": water_data["litres"],
        "water_ml": water_data["ml"],
        "carbon_g": carbon_g,
        "bottle_percentage": bottle_percentage,
        "word_count": word_count,
        "task_type": task_type,
        "region": region,
        "disclaimer": "Estimated values based on configurable assumptions. Not a direct measurement."
    }


def calculate_sustainability_score(session_data):
    """Calculate an experimental sustainability score (0-100).
    
    Higher score = more sustainable AI usage pattern.
    Uses smooth proportional scaling rather than fixed step-ladder penalties.
    
    Penalties scale proportionally based on:
      - Output length overage above 150 words
      - Task type energy intensity (chat, code, reasoning, image)
      - Behavioral inefficiencies (duplicates, regenerations, simple tasks)
    """
    score = 100.0
    
    word_count = session_data.get("word_count", 0)
    task_type = session_data.get("task_type", "chat").lower()
    nudge_type = session_data.get("nudge_type")
    regen_count = session_data.get("regen_count", 0)
    
    # Proportional Output length penalty:
    # Baseline up to 150 words without penalty.
    # Severity scales continuously with overage rather than jumping at fixed thresholds
    if word_count > 150:
        overage = word_count - 150
        length_penalty = min(28.0, round(overage / 125.0, 2))
        score -= length_penalty
        
    # Task type relative compute penalty
    task_penalties = {
        "chat": 0.0,
        "code": 3.0,
        "reasoning": 7.0,
        "image": 10.0
    }
    score -= task_penalties.get(task_type, 0.0)
    
    # Nudge-based penalties (behavioral inefficiencies)
    if nudge_type == "duplicate":
        score -= 15.0
    elif nudge_type == "regeneration":
        regen_penalty = min(20.0, 6.0 + max(0, regen_count - 2) * 3.5)
        score -= regen_penalty
    elif nudge_type == "excessive_output":
        score -= 8.0
    elif nudge_type == "simple_task":
        score -= 8.0
        
    return max(0, min(100, int(round(score))))
