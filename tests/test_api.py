import pytest
from app.schemas.evaluation import DecisionType

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200

def test_intent_and_transaction_flow(client):
    # 1. Create Intent
    intent_data = {
        "currency": "INR",
        "max_total_amount": 8000,
        "allowed_categories": [],
        "banned_categories": ["warranties"],
        "max_quantity": 1,
        "recurring_payment_allowed": False,
        "merchant_restrictions": {
            "type": "NONE",
            "list": []
        }
    }
    response = client.post("/api/v1/intents/", json=intent_data)
    assert response.status_code == 200
    intent = response.json()
    assert intent["id"] is not None
    assert intent["status"] == "ACTIVE"

    # 2. Submit Valid Transaction
    txn_data = {
        "intent_id": intent["id"],
        "merchant": {
            "id": "m_123",
            "name": "Test Store"
        },
        "currency": "INR",
        "items": [
            {
                "name": "Headphones",
                "category": "electronics",
                "unit_price": 7000,
                "quantity": 1,
                "is_subscription": False
            }
        ],
        "total_amount": 7000
    }
    response = client.post("/api/v1/transactions/", json=txn_data)
    assert response.status_code == 200
    eval_result = response.json()
    assert eval_result["decision"] == DecisionType.APPROVE
    assert len(eval_result["violations"]) == 0

    # 3. Submit Invalid Transaction (Amount exceeded)
    txn_data["total_amount"] = 8500
    response = client.post("/api/v1/transactions/", json=txn_data)
    assert response.status_code == 200
    eval_result = response.json()
    assert eval_result["decision"] == DecisionType.BLOCK
    assert len(eval_result["violations"]) == 1

def test_get_intent(client):
    intent_data = {
        "currency": "USD",
        "max_total_amount": 100,
    }
    res = client.post("/api/v1/intents/", json=intent_data)
    intent_id = res.json()["id"]

    res_get = client.get(f"/api/v1/intents/{intent_id}")
    assert res_get.status_code == 200
    assert res_get.json()["id"] == intent_id

def test_ask_approval_flow(client):
    # 1. Create intent with allowlist
    intent_data = {
        "currency": "INR",
        "max_total_amount": 8000,
        "merchant_restrictions": {
            "type": "ALLOWLIST",
            "list": ["m_trusted"]
        }
    }
    response = client.post("/api/v1/intents/", json=intent_data)
    intent = response.json()

    # 2. Submit transaction with non-allowlist merchant
    txn_data = {
        "intent_id": intent["id"],
        "merchant": {
            "id": "m_untrusted",
            "name": "Untrusted Store"
        },
        "currency": "INR",
        "items": [
            {
                "name": "Headphones",
                "category": "electronics",
                "unit_price": 7000,
                "quantity": 1,
            }
        ],
        "total_amount": 7000
    }
    response = client.post("/api/v1/transactions/", json=txn_data)
    eval_result = response.json()
    
    assert eval_result["decision"] == DecisionType.ASK
    eval_id = eval_result["id"]
    
    # 3. Approve ASK evaluation
    approve_res = client.post(f"/api/v1/evaluations/{eval_id}/approve")
    assert approve_res.status_code == 200
    assert approve_res.json()["decision"] == DecisionType.APPROVE
    
    # 4. Cannot approve already approved evaluation (or BLOCK)
    # The endpoint only allows ASK
    approve_res_again = client.post(f"/api/v1/evaluations/{eval_id}/approve")
    assert approve_res_again.status_code == 400

def test_negative_amount_rejection(client):
    # Negative amount should be blocked at schema validation level
    intent_data = {
        "currency": "INR",
        "max_total_amount": 8000
    }
    response = client.post("/api/v1/intents/", json=intent_data)
    intent = response.json()

    txn_data = {
        "intent_id": intent["id"],
        "merchant": {"id": "m_123", "name": "Store"},
        "currency": "INR",
        "items": [{"name": "Headphones", "category": "electronics", "unit_price": -7000, "quantity": 1}],
        "total_amount": -7000
    }
    response = client.post("/api/v1/transactions/", json=txn_data)
    assert response.status_code == 422 # Pydantic validation error

def test_evaluation_logging_expected_decision(client):
    intent_data = {
        "currency": "INR",
        "max_total_amount": 8000
    }
    response = client.post("/api/v1/intents/", json=intent_data)
    intent = response.json()

    txn_data = {
        "intent_id": intent["id"],
        "merchant": {"id": "m_123", "name": "Store"},
        "currency": "INR",
        "items": [{"name": "Item", "category": "electronics", "unit_price": 7000, "quantity": 1}],
        "total_amount": 7000,
        "expected_decision": "APPROVE"
    }
    response = client.post("/api/v1/transactions/", json=txn_data)
    eval_result = response.json()
    assert eval_result["expected_decision"] == "APPROVE"

def test_security_auth_enforcement():
    from fastapi.testclient import TestClient
    from app.main import app
    from app.db.database import get_db, Base
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    engine = create_engine("sqlite:///./test2.db", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    
    # Do NOT override get_current_user_id here, to test the actual auth dependency
    unauth_client = TestClient(app)
    
    intent_data = {
        "currency": "INR",
        "max_total_amount": 8000
    }
    response = unauth_client.post("/api/v1/intents/", json=intent_data)
    assert response.status_code == 403 # HTTPBearer missing -> returns 403 Forbidden. Wait, HTTPBearer returns 403 for missing token.

    del app.dependency_overrides[get_db]
    Base.metadata.drop_all(bind=engine)

