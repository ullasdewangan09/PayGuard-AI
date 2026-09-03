import pytest
import hmac
import hashlib
import json
from unittest.mock import patch
from app.schemas.evaluation import DecisionType
from app.core.config import settings

@pytest.fixture
def mock_razorpay_provider():
    with patch("app.providers.razorpay_provider.razorpay_provider") as mock:
        mock.create_order.return_value = "order_123"
        mock.capture_payment.return_value = {"id": "pay_123", "status": "captured"}
        mock.fetch_payment.return_value = {"id": "pay_123", "status": "authorized", "order_id": "order_123"}
        mock.verify_webhook_signature.return_value = True
        yield mock

def test_order_creation(client, mock_razorpay_provider):
    intent_data = {
        "currency": "INR",
        "max_total_amount": 8000
    }
    intent = client.post("/api/v1/intents/", json=intent_data).json()

    txn_data = {
        "intent_id": intent["id"],
        "merchant": {"id": "m_123", "name": "Store"},
        "currency": "INR",
        "items": [{"name": "Item", "category": "electronics", "unit_price": 7000, "quantity": 1}],
        "total_amount": 7000
    }
    
    response = client.post("/api/v1/transactions/", json=txn_data)
    assert response.status_code == 200
    eval_result = response.json()
    assert eval_result["razorpay_order_id"] == "order_123"
    
    mock_razorpay_provider.create_order.assert_called_once_with(
        amount=7000,
        currency="INR",
        receipt=eval_result["transaction_id"]
    )

def test_capture_approved(client, mock_razorpay_provider):
    intent_data = {
        "currency": "INR",
        "max_total_amount": 8000
    }
    intent = client.post("/api/v1/intents/", json=intent_data).json()

    txn_data = {
        "intent_id": intent["id"],
        "merchant": {"id": "m_123", "name": "Store"},
        "currency": "INR",
        "items": [{"name": "Item", "category": "electronics", "unit_price": 7000, "quantity": 1}],
        "total_amount": 7000
    }
    eval_result = client.post("/api/v1/transactions/", json=txn_data).json()
    assert eval_result["decision"] == DecisionType.APPROVE
    
    transaction_id = eval_result["transaction_id"]
    
    capture_res = client.post(
        f"/api/v1/transactions/{transaction_id}/capture",
        json={"razorpay_payment_id": "pay_123"}
    )
    
    assert capture_res.status_code == 200
    assert capture_res.json()["status"] == "success"
    
    mock_razorpay_provider.capture_payment.assert_called_once_with(
        payment_id="pay_123",
        amount=7000,
        currency="INR"
    )

def test_capture_blocked(client, mock_razorpay_provider):
    intent_data = {
        "currency": "INR",
        "max_total_amount": 8000
    }
    intent = client.post("/api/v1/intents/", json=intent_data).json()

    txn_data = {
        "intent_id": intent["id"],
        "merchant": {"id": "m_123", "name": "Store"},
        "currency": "INR",
        "items": [{"name": "Item", "category": "electronics", "unit_price": 9000, "quantity": 1}],
        "total_amount": 9000
    }
    eval_result = client.post("/api/v1/transactions/", json=txn_data).json()
    assert eval_result["decision"] == DecisionType.BLOCK
    
    transaction_id = eval_result["transaction_id"]
    
    capture_res = client.post(
        f"/api/v1/transactions/{transaction_id}/capture",
        json={"razorpay_payment_id": "pay_123"}
    )
    
    assert capture_res.status_code == 403
    mock_razorpay_provider.capture_payment.assert_not_called()

def test_webhook_processing(client, db):
    # Setup intent and transaction
    intent_data = {
        "currency": "INR",
        "max_total_amount": 8000
    }
    intent = client.post("/api/v1/intents/", json=intent_data).json()

    txn_data = {
        "intent_id": intent["id"],
        "merchant": {"id": "m_123", "name": "Store"},
        "currency": "INR",
        "items": [{"name": "Item", "category": "electronics", "unit_price": 7000, "quantity": 1}],
        "total_amount": 7000
    }
    
    with patch("app.providers.razorpay_provider.razorpay_provider") as mock_rp:
        mock_rp.create_order.return_value = "order_123"
        eval_result = client.post("/api/v1/transactions/", json=txn_data).json()
        
    transaction_id = eval_result["transaction_id"]
    
    webhook_payload = {
        "event": "payment.authorized",
        "payload": {
            "payment": {
                "entity": {
                    "id": "pay_123",
                    "order_id": "order_123"
                }
            }
        }
    }
    
    with patch("app.api.v1.endpoints.webhooks.razorpay_provider") as mock_rp:
        mock_rp.verify_webhook_signature.return_value = True
        res = client.post(
            "/api/v1/webhooks/razorpay",
            json=webhook_payload,
            headers={"x-razorpay-signature": "valid_sig"}
        )
        assert res.status_code == 200
        
    # Verify state
    from app.models.transaction import Transaction
    txn = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    assert txn.payment_status == "AUTHORIZED"
    assert txn.razorpay_payment_id == "pay_123"
    
def test_webhook_invalid_signature(client):
    with patch("app.api.v1.endpoints.webhooks.razorpay_provider") as mock_rp:
        mock_rp.verify_webhook_signature.return_value = False
        res = client.post(
            "/api/v1/webhooks/razorpay",
            json={},
            headers={"x-razorpay-signature": "invalid_sig"}
        )
        assert res.status_code == 400
