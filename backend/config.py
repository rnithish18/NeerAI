# config.py
"""
NeerAI Configuration
====================
Configurable constants for the NeerAI sustainability estimation engine.
All values here are initial defaults based on published benchmarks.

Reference: Li et al., 2023
"Making AI Less 'Thirsty': Uncovering and Addressing the Secret Water Footprint of AI Models"
https://arxiv.org/abs/2304.03271

IMPORTANT: These are configurable assumptions, NOT universal constants.
Different data centers, cooling systems, and regions will have different values.
"""

# =============================================================================
# SUSTAINABILITY CONSTANTS (configurable per deployment)
# =============================================================================
WUE_ONSITE = 1.0    # On-site Water Usage Effectiveness (L/kWh) — cooling towers
PUE = 1.3            # Power Usage Effectiveness — total facility / IT equipment
EWIF_OFFSITE = 3.4   # Off-site Electricity Water Intensity Factor (L/kWh)

# Formula: Water (L) = Energy (kWh) × (WUE_ONSITE + PUE × EWIF_OFFSITE)
# With defaults: Water = Energy × (1.0 + 1.3 × 3.4) = Energy × 5.42

# =============================================================================
# ENERGY MODEL (estimated consumption per 100 output words)
# =============================================================================
ENERGY_PER_100_WORDS_KWH = {
    "chat": 0.002,    # General conversational AI
    "code": 0.015,    # Code generation (higher complexity)
    "image": 0.05     # Image generation (highest resource usage)
}

# =============================================================================
# REGION-SPECIFIC SETTINGS
# =============================================================================
REGIONS = {
    "india":   {"grid_carbon_intensity": 700, "label": "India"},
    "global":  {"grid_carbon_intensity": 475, "label": "Global Average"},
    "us_west": {"grid_carbon_intensity": 250, "label": "US West Coast"},
    "europe":  {"grid_carbon_intensity": 200, "label": "Europe"},
}

DEFAULT_REGION = "india"

# =============================================================================
# INSTITUTIONAL CONFIGURATION
# =============================================================================
INSTITUTION_NAME = "V.S.B. Engineering College"

DEPARTMENTS = [
    "CSE",          # Computer Science & Engineering
    "ECE",          # Electronics & Communication Engineering
    "EEE",          # Electrical & Electronics Engineering
    "Mechanical",   # Mechanical Engineering
    "Civil",        # Civil Engineering
]

HOSTELS = [
    "Boys Hostel A",
    "Boys Hostel B",
    "Boys Hostel C",
    "Girls Hostel A",
    "Girls Hostel B",
]

# =============================================================================
# SECURITY & LIMITS
# =============================================================================
MAX_PAYLOAD_SIZE = 1_048_576  # 1 MB limit for requests
MAX_TEXT_LENGTH = 50_000      # Maximum text length to process

# =============================================================================
# SCORING
# =============================================================================
SUSTAINABILITY_SCORE_DEFAULT = 100
SUSTAINABILITY_SCORE_MIN = 0
SUSTAINABILITY_SCORE_MAX = 100
