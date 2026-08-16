# API endpoint tests
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from fastapi.testclient import TestClient
from main import app
from database import DatabaseManager

client = TestClient(app)

# Ensure DB tables exist for tests
db = DatabaseManager()
db.init_db()

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_estimate_chat():
    response = client.post("/estimate", json={
        "word_count": 100,
        "task_type": "chat",
        "region": "india"
    })
    assert response.status_code == 200
    data = response.json()
    assert "energy_kwh" in data
    assert "water_ml" in data
    assert "disclaimer" in data
    assert data["energy_kwh"] > 0
    assert data["water_ml"] > 0

def test_estimate_code():
    response = client.post("/estimate", json={
        "word_count": 200,
        "task_type": "code",
        "region": "india"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["energy_kwh"] > 0

def test_estimate_zero_words():
    response = client.post("/estimate", json={
        "word_count": 0,
        "task_type": "chat"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["energy_kwh"] == 0
    assert data["water_ml"] == 0

def test_estimate_validation_negative():
    response = client.post("/estimate", json={
        "word_count": -5,
        "task_type": "chat"
    })
    # Pydantic should reject negative due to ge=0
    assert response.status_code == 422

def test_log_session():
    response = client.post("/log", json={
        "word_count": 150,
        "task_type": "chat",
        "provider": "chatgpt",
        "sector": "Education"
    })
    assert response.status_code == 200
    data = response.json()
    assert "footprint" in data
    assert "sustainability_score" in data

def test_log_with_nudge():
    response = client.post("/log", json={
        "text": "25 * 18",
        "word_count": 5,
        "task_type": "chat",
        "provider": "chatgpt"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["nudge"] is not None
    assert data["nudge"]["type"] == "simple_task"

def test_dashboard_summary():
    response = client.get("/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_sessions" in data
    assert "total_energy" in data
    assert "total_water" in data

def test_dashboard_trends():
    response = client.get("/dashboard/trends?days=7")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_dashboard_sectors():
    response = client.get("/dashboard/sectors")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_dashboard_regions():
    response = client.get("/dashboard/regions")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_methodology():
    response = client.get("/methodology")
    assert response.status_code == 200
    data = response.json()
    assert "formula" in data
    assert "assumptions" in data
    assert "limitations" in data
    assert "source" in data
    assert "disclaimer" in data
    assert "Li et al." in data["source"]["primary"]

def test_export():
    response = client.get("/dashboard/export")
    assert response.status_code == 200
    assert "text/csv" in response.headers["content-type"]

def test_demo_generate():
    response = client.post("/demo/generate")
    assert response.status_code == 200
    assert response.json()["status"] == "success"

def test_demo_clear():
    response = client.post("/demo/clear")
    assert response.status_code == 200
    assert response.json()["status"] == "success"

def test_demo_generates_data():
    # Clear first
    client.post("/demo/clear")
    # Generate
    client.post("/demo/generate")
    # Check
    response = client.get("/dashboard/summary")
    data = response.json()
    assert data["total_sessions"] > 0
    # Clean up
    client.post("/demo/clear")
