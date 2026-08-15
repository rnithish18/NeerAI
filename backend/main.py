from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse
from pydantic import BaseModel, Field
from typing import Optional, List
import json

from config import MAX_PAYLOAD_SIZE
from estimator import estimate_footprint, calculate_sustainability_score
from nudge_engine import generate_nudge
from database import DatabaseManager

app = FastAPI(title="NeerAI Backend")
db = DatabaseManager()

# Init DB on startup
@app.on_event("startup")
def startup_event():
    db.init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def limit_payload_size(request: Request, call_next):
    if request.headers.get("content-length"):
        if int(request.headers.get("content-length")) > MAX_PAYLOAD_SIZE:
            return JSONResponse(
                status_code=413,
                content={"detail": "Payload too large"}
            )
    response = await call_next(request)
    return response

class EstimateRequest(BaseModel):
    text: Optional[str] = ""
    word_count: int = Field(default=0, ge=0)
    task_type: str = "chat"
    provider: Optional[str] = "unknown"
    region: Optional[str] = "india"

class LogRequest(EstimateRequest):
    department: Optional[str] = None
    hostel: Optional[str] = None
    history: Optional[List[str]] = []
    regen_count: int = 0

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/estimate")
def estimate(req: EstimateRequest):
    footprint = estimate_footprint(req.word_count, req.task_type, req.region)
    return footprint

@app.post("/log")
def log_session(req: LogRequest):
    footprint = estimate_footprint(req.word_count, req.task_type, req.region)
    
    nudge = generate_nudge(
        req.text, 
        req.word_count, 
        req.task_type, 
        req.regen_count, 
        req.history
    )
    
    session_data = {
        "word_count": req.word_count,
        "task_type": req.task_type,
        "nudge_type": nudge["type"] if nudge else None
    }
    
    score = calculate_sustainability_score(session_data)
    
    db_data = {
        "provider": req.provider,
        "task_type": req.task_type,
        "word_count": req.word_count,
        "energy_kwh": footprint["energy_kwh"],
        "water_ml": footprint["water_ml"],
        "department": req.department,
        "hostel": req.hostel,
        "sustainability_score": score,
        "nudge_type": nudge["type"] if nudge else None
    }
    
    db.log_session(db_data)
    
    return {
        "footprint": footprint,
        "nudge": nudge,
        "sustainability_score": score
    }

@app.get("/dashboard/summary")
def dashboard_summary(days: int = 7):
    return db.get_dashboard_summary(days)

@app.get("/dashboard/trends")
def dashboard_trends(days: int = 30):
    return db.get_daily_trends(days)

@app.get("/dashboard/departments")
def dashboard_departments():
    return db.get_department_stats()

@app.get("/dashboard/hostels")
def dashboard_hostels():
    return db.get_hostel_stats()

@app.get("/methodology")
def get_methodology():
    return {
        "title": "NeerAI Estimation Methodology",
        "version": "1.0.0",
        "disclaimer": "NeerAI does NOT physically measure data-center water consumption. All values are estimates based on configurable assumptions and published benchmarks.",
        "formula": {
            "energy": "energy_kwh = (output_word_count / 100) × energy_per_100_words",
            "water": "water_litres = energy_kwh × (WUE_onsite + PUE × EWIF_offsite)",
            "water_ml": "water_ml = water_litres × 1000"
        },
        "parameters": {
            "WUE_ONSITE": {"value": 1.0, "unit": "L/kWh", "description": "On-site Water Usage Effectiveness — water used for cooling"},
            "PUE": {"value": 1.3, "unit": "ratio", "description": "Power Usage Effectiveness — total facility power / IT equipment power"},
            "EWIF_OFFSITE": {"value": 3.4, "unit": "L/kWh", "description": "Off-site Electricity Water Intensity Factor — water used in electricity generation"}
        },
        "energy_model": {
            "chat": {"value": 0.002, "unit": "kWh per 100 words"},
            "code": {"value": 0.015, "unit": "kWh per 100 words"},
            "image": {"value": 0.05, "unit": "kWh per 100 words"}
        },
        "assumptions": [
            "Linear scaling between output word count and energy consumption",
            "Fixed WUE and PUE values (real values vary by data center and season)",
            "Output word count used as proxy for total computation (input processing not separately estimated)",
            "Single-region estimation (does not account for distributed processing)",
            "Cooling technology assumed to be evaporative (WUE varies with cooling method)"
        ],
        "limitations": [
            "Cannot access actual data center telemetry from AI providers",
            "Real energy consumption depends on model architecture, hardware, batch size, quantization, and many other factors",
            "Water footprint varies significantly by geographic location, season, and cooling technology",
            "Published benchmarks may not reflect current infrastructure as providers update their systems",
            "Estimation is per-response, not per-conversation context window"
        ],
        "source": {
            "primary": "Li et al., 2023",
            "title": "Making AI Less 'Thirsty': Uncovering and Addressing the Secret Water Footprint of AI Models",
            "url": "https://arxiv.org/abs/2304.03271",
            "note": "Published values are treated as configurable benchmarks, not universal constants."
        },
        "data_categories": {
            "published_benchmark": "Values from peer-reviewed research papers",
            "assumption": "Configurable parameters used in the estimation model",
            "estimate": "Calculated output from the model — not a direct measurement",
            "demo_data": "Synthetic data generated for demonstration purposes only",
            "measured_data": "NeerAI does NOT produce measured data in its current version"
        },
        "privacy": "NeerAI does not store raw prompts or AI responses. Only aggregate metrics (word count, energy estimate, water estimate, task type, provider) are logged."
    }

@app.get("/dashboard/export")
def export_data():
    csv_data = db.export_csv()
    return PlainTextResponse(content=csv_data, media_type="text/csv")

@app.post("/demo/generate")
def generate_demo():
    db.generate_demo_data()
    return {"status": "success", "message": "Demo data generated"}

@app.post("/demo/clear")
def clear_demo():
    db.clear_demo_data()
    return {"status": "success", "message": "Demo data cleared"}
