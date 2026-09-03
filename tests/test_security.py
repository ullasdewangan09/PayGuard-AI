import pytest
from app.schemas.evaluation import DecisionType

def test_auth_bypass(client):
    # Trying to create an intent without proper mock JWT (or any token).
    # Currently client is authenticated via conftest override.
    # We will remove the override to test unauthenticated access.
    from app.api.v1.auth import get_current_user_id
    from app.main import app
    app.dependency_overrides.pop(get_current_user_id, None)
    
    res = client.post("/api/v1/intents/", json={"currency": "INR", "max_total_amount": 100})
    assert res.status_code == 403 # HTTPBearer returns 403 when not provided in testing without proper setup, or 401.

    # Restore
    def override_get_current_user_id():
        return "usr_test_123"
    app.dependency_overrides[get_current_user_id] = override_get_current_user_id

def test_cross_user_capture(client, db):
    # Create intent and transaction as user A (usr_test_123)
    intent_data = {"currency": "INR", "max_total_amount": 8000}
    intent = client.post("/api/v1/intents/", json=intent_data).json()
    
    txn_data = {
        "intent_id": intent["id"],
        "merchant": {"id": "m_1", "name": "Store"},
        "currency": "INR",
        "items": [{"name": "Item", "category": "misc", "unit_price": 100, "quantity": 1}],
        "total_amount": 100
    }
    eval_res = client.post("/api/v1/transactions/", json=txn_data).json()
    
    # Attempt to capture as user B
    from app.api.v1.auth import get_current_user_id
    from app.main import app
    app.dependency_overrides[get_current_user_id] = lambda: "attacker_user"
    
    res = client.post(
        f"/api/v1/transactions/{eval_res['transaction_id']}/capture",
        json={"razorpay_payment_id": "pay_fake"}
    )
    assert res.status_code == 403
    assert "Not authorized to capture" in res.json()["detail"]
    
    # Restore
    def override_get_current_user_id():
        return "usr_test_123"
    app.dependency_overrides[get_current_user_id] = override_get_current_user_id

def test_double_capture(client):
    from unittest.mock import patch
    with patch("app.providers.razorpay_provider.razorpay_provider") as mock:
        mock.create_order.return_value = "order_e2e_123"
        mock.capture_payment.return_value = {"id": "pay_e2e_123", "status": "captured"}
        mock.fetch_payment.return_value = {"id": "pay_e2e_123", "status": "authorized", "order_id": "order_e2e_123"}
        
        # Setup
        intent_data = {"currency": "INR", "max_total_amount": 8000}
        intent = client.post("/api/v1/intents/", json=intent_data).json()
        
        txn_data = {
            "intent_id": intent["id"],
            "merchant": {"id": "m_1", "name": "Store"},
            "currency": "INR",
            "items": [{"name": "Item", "category": "misc", "unit_price": 100, "quantity": 1}],
            "total_amount": 100
        }
        eval_res = client.post("/api/v1/transactions/", json=txn_data).json()
        
        # First capture
        res1 = client.post(
            f"/api/v1/transactions/{eval_res['transaction_id']}/capture",
            json={"razorpay_payment_id": "pay_e2e_123"}
        )
        assert res1.status_code == 200
        
        # Second capture attempt
        res2 = client.post(
            f"/api/v1/transactions/{eval_res['transaction_id']}/capture",
            json={"razorpay_payment_id": "pay_e2e_123"}
        )
        assert res2.status_code == 409
        assert "already captured" in res2.json()["detail"].lower()

def test_negative_intent_tampering(client):
    # Attempt to create an intent with negative max_total_amount
    intent_data = {"currency": "INR", "max_total_amount": -5000}
    res = client.post("/api/v1/intents/", json=intent_data)
    assert res.status_code == 422 # Pydantic Validation Error due to ge=0.0
