"""Backend API tests for BranchIQ consultant endpoints."""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # fallback to frontend env file
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")

API = f"{BASE_URL}/api"


# ---- Health ----
def test_root_status():
    r = requests.get(f"{API}/", timeout=30)
    assert r.status_code == 200
    data = r.json()
    assert data.get("status") == "Public Data Connected"


# ---- Consultant Ask with rich context ----
def test_consultant_ask_with_context():
    payload = {
        "question": "Where should HDFC Bank expand?",
        "selectedBank": "HDFC Bank",
        "context": {
            "bank": {"name": "HDFC Bank", "branches": 8700, "deposits": 25.6},
            "topOpportunities": [
                {"state": "Uttar Pradesh", "score": 82,
                 "drivers": ["High market growth 12%", "Low HDFC branch density", "Rising credit demand"]},
                {"state": "Bihar", "score": 78,
                 "drivers": ["Under-penetrated market", "Digital adoption growth"]},
                {"state": "Madhya Pradesh", "score": 74, "drivers": ["Deposit growth"]},
                {"state": "Rajasthan", "score": 71, "drivers": ["Credit opportunity"]},
            ],
        },
    }
    r = requests.post(f"{API}/consultant/ask", json=payload, timeout=90)
    assert r.status_code == 200, r.text
    data = r.json()
    # required keys
    for k in ["intent", "banks", "executiveAnswer", "keyEvidence",
              "opportunityScore", "businessReasoning", "recommendedAction",
              "dataConfidence", "supportingData"]:
        assert k in data, f"missing key {k}"
    assert isinstance(data["keyEvidence"], list)
    assert isinstance(data["banks"], list)
    assert isinstance(data["supportingData"], list)
    assert data["opportunityScore"] is None or isinstance(data["opportunityScore"], int)
    assert isinstance(data["executiveAnswer"], str) and len(data["executiveAnswer"]) > 0
    assert data["dataConfidence"] in ("HIGH", "MEDIUM", "LIMITED")


# ---- Consultant Ask fallback (empty context) ----
def test_consultant_ask_empty_context():
    r = requests.post(f"{API}/consultant/ask",
                      json={"question": "Give me a strategic overview", "context": {}},
                      timeout=90)
    assert r.status_code == 200, r.text
    data = r.json()
    for k in ["intent", "banks", "executiveAnswer", "keyEvidence",
              "opportunityScore", "businessReasoning", "recommendedAction",
              "dataConfidence", "supportingData"]:
        assert k in data
    assert isinstance(data["executiveAnswer"], str) and len(data["executiveAnswer"]) > 0


# ---- History ----
def test_consultant_history_contains_prev():
    # wait a bit to ensure previous inserts are visible
    time.sleep(1)
    r = requests.get(f"{API}/consultant/history?limit=20", timeout=30)
    assert r.status_code == 200
    docs = r.json()
    assert isinstance(docs, list)
    assert len(docs) >= 1
    # ensure no mongo _id
    for d in docs:
        assert "_id" not in d
        assert "question" in d
        assert "response" in d
    # ensure our recent question is in there
    questions = [d.get("question") for d in docs]
    assert any("HDFC" in (q or "") for q in questions)
