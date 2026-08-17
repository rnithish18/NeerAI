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
# Chosen shipped defaults:
# WUE_ONSITE = 1.8 L/kWh (on-site cooling towers water usage)
# PUE = 1.2 (Power Usage Effectiveness: facility power / IT equipment power)
# EWIF_OFFSITE = 0.5 L/kWh (off-site electricity generation water intensity)
# Combined multiplier = 1.8 + (1.2 * 0.5) = 2.4 L water per kWh
WUE_ONSITE = 1.8    # On-site Water Usage Effectiveness (L/kWh) — cooling towers
PUE = 1.2            # Power Usage Effectiveness — total facility / IT equipment
EWIF_OFFSITE = 0.5   # Off-site Electricity Water Intensity Factor (L/kWh)

# Formula: Water (L) = Energy (kWh) × (WUE_ONSITE + PUE × EWIF_OFFSITE)
# With defaults: Water = Energy × (1.8 + 1.2 × 0.5) = Energy × 2.4

# =============================================================================
# ENERGY MODEL (estimated consumption per 100 output words)
# =============================================================================
ENERGY_PER_100_WORDS_KWH = {
    "chat": 0.002,       # General conversational AI (standard mode)
    "reasoning": 0.035,  # Extended thinking / Chain-of-thought models (e.g. o1/o3/DeepSeek-R1)
    "code": 0.015,       # Code generation (higher complexity)
    "image": 0.05        # Image generation (highest resource usage)
}

# =============================================================================
# NUDGE & REGENERATION THRESHOLDS
# =============================================================================
DEFAULT_REGEN_THRESHOLD = 3
REGEN_THRESHOLDS = {
    "chat": 3,
    "reasoning": 2,
    "code": 4,
    "image": 2
}
SIMILARITY_DUPLICATE_THRESHOLD = 0.75
MAX_PROMPT_SIMPLE_WORDS = 15

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
# Configurable: set to your institution/org name, or leave as default for national view
ORG_NAME = "NeerAI — India"

# Primary segment axis: which sector of usage
USAGE_SECTORS = ["Education", "IT & Software", "Government", "Healthcare", "Research"]

# Secondary segment axis: which region
REGIONS_INDIA = ["North", "South", "East", "West", "Central"]

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
