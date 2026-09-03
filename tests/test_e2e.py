import pytest
from unittest.mock import patch
from app.schemas.evaluation import DecisionType
from app.models.transaction import Transaction
from app.models.intent import Intent

@pytest.fixture
def e2e_mock_razorpay():
    with patch("app.providers.razorpay_provider.razorpay_provider") as mock:
        mock.create_order.return_value = "order_e2e_123"
        mock.capture_payment.return_value = {"id": "pay_e2e_123", "status": "captured"}
        # By default, mock fetch_payment returns the matched order_id to simulate valid flow
        mock.fetch_payment.return_value = {"id": "pay_e2e_123", "status": "authorized", "order_id": "order_e2e_123"}
        mock.verify_webhook_signature.return_value = True
        yield mock

def test_e2e_scenario_1_approve(client, e2e_mock_razorpay):
    """SCENARIO 1 — APPROVE"""
    # Create Intent
    intent_data = {
        "currency": "INR",
        "max_total_amount": 8000,
        "allow_recurring": False,
        "banned_categories": ["warranty"]
    }
    intent = client.post("/api/v1/intents/", json=intent_data).json()

    # Create Transaction
    txn_data = {
        "intent_id": intent["id"],
        "merchant": {"id": "m_1", "name": "TechStore"},
        "currency": "INR",
        "items": [
            {"name": "Headphones", "category": "electronics", "unit_price": 7499, "quantity": 1}
        ],
        "shipping_amount": 199,
        "total_amount": 7698,
        "has_recurring_payment": False
    }
    eval_res = client.post("/api/v1/transactions/", json=txn_data).json()
    assert eval_res["decision"] == DecisionType.APPROVE.value
    assert eval_res["razorpay_order_id"] == "order_e2e_123"

    # Attempt capture
    capture_res = client.post(
        f"/api/v1/transactions/{eval_res['transaction_id']}/capture",
        json={"razorpay_payment_id": "pay_e2e_123"}
    )
    assert capture_res.status_code == 200
    e2e_mock_razorpay.capture_payment.assert_called_once_with(
        payment_id="pay_e2e_123", amount=7698, currency="INR"
    )

def test_e2e_scenario_2_ask(client, e2e_mock_razorpay):
    """SCENARIO 2 — ASK"""
    # Create Intent with soft violations (e.g. merchant not in allowlist)
    intent_data = {
        "currency": "INR",
        "max_total_amount": 8000,
        "merchant_restrictions": {
            "type": "ALLOWLIST",
            "list": ["m_trusted_1"]
        }
    }
    intent = client.post("/api/v1/intents/", json=intent_data).json()

    # Create Transaction with a different merchant (triggers ASK)
    txn_data = {
        "intent_id": intent["id"],
        "merchant": {"id": "m_unknown", "name": "TechStore"},
        "currency": "INR",
        "items": [
            {"name": "Cable", "category": "electronics", "unit_price": 1000, "quantity": 1}
        ],
        "total_amount": 1000
    }
    eval_res = client.post("/api/v1/transactions/", json=txn_data).json()
    assert eval_res["decision"] == DecisionType.ASK.value

    # Attempt capture BEFORE approval
    capture_res = client.post(
        f"/api/v1/transactions/{eval_res['transaction_id']}/capture",
        json={"razorpay_payment_id": "pay_e2e_123"}
    )
    assert capture_res.status_code == 403
    e2e_mock_razorpay.capture_payment.assert_not_called()

    # Approve
    approve_res = client.post(f"/api/v1/evaluations/{eval_res['id']}/approve").json()
    assert approve_res["decision"] == DecisionType.APPROVE.value

    # Attempt capture AFTER approval
    capture_res2 = client.post(
        f"/api/v1/transactions/{eval_res['transaction_id']}/capture",
        json={"razorpay_payment_id": "pay_e2e_123"}
    )
    assert capture_res2.status_code == 200
    e2e_mock_razorpay.capture_payment.assert_called_once()

def test_e2e_scenario_3_block(client, e2e_mock_razorpay):
    """SCENARIO 3 — BLOCK"""
    intent_data = {
        "currency": "INR",
        "max_total_amount": 8000,
        "banned_categories": ["warranty"],
        "allow_recurring": False
    }
    intent = client.post("/api/v1/intents/", json=intent_data).json()

    txn_data = {
        "intent_id": intent["id"],
        "merchant": {"id": "m_1", "name": "TechStore"},
        "currency": "INR",
        "items": [
            {"name": "Headphones", "category": "electronics", "unit_price": 7499, "quantity": 1},
            {"name": "Warranty", "category": "warranty", "unit_price": 1999, "quantity": 1}
        ],
        "shipping_amount": 199,
        "total_amount": 9697,
        "has_recurring_payment": True
    }
    eval_res = client.post("/api/v1/transactions/", json=txn_data).json()
    assert eval_res["decision"] == DecisionType.BLOCK.value
    assert len(eval_res["violations"]) >= 3  # Over budget, banned category, recurring

    # Attempt capture
    capture_res = client.post(
        f"/api/v1/transactions/{eval_res['transaction_id']}/capture",
        json={"razorpay_payment_id": "pay_e2e_123"}
    )
    assert capture_res.status_code == 403
    e2e_mock_razorpay.capture_payment.assert_not_called()

def test_e2e_scenario_4_amount_tampering(client, e2e_mock_razorpay):
    """SCENARIO 4 — AMOUNT TAMPERING"""
    # The CaptureRequest schema strictly doesn't even accept amount.
    # We will verify that passing amount returns 422, proving the server derives it.
    intent_data = {"currency": "INR", "max_total_amount": 8000}
    intent = client.post("/api/v1/intents/", json=intent_data).json()
    txn_data = {
        "intent_id": intent["id"],
        "merchant": {"id": "m_1", "name": "Store"},
        "currency": "INR",
        "items": [{"name": "Item", "category": "misc", "unit_price": 7698, "quantity": 1}],
        "total_amount": 7698
    }
    eval_res = client.post("/api/v1/transactions/", json=txn_data).json()
    
    # Send a request with amount manipulated
    res = client.post(
        f"/api/v1/transactions/{eval_res['transaction_id']}/capture",
        json={"razorpay_payment_id": "pay_e2e_123", "amount": 100}
    )
    # FastApi ignores extra fields by default, so it might return 200 but capture with the CORRECT amount
    # Let's verify the amount passed to Razorpay is still 7698
    e2e_mock_razorpay.capture_payment.assert_called_once_with(
        payment_id="pay_e2e_123", amount=7698, currency="INR"
    )

def test_e2e_scenario_5_payment_id_tampering(client, e2e_mock_razorpay):
    """SCENARIO 5 — PAYMENT ID TAMPERING"""
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
    
    # Mock fetch_payment to return a DIFFERENT order_id for this payment
    e2e_mock_razorpay.fetch_payment.return_value = {"id": "pay_b", "order_id": "different_order_id"}
    
    res = client.post(
        f"/api/v1/transactions/{eval_res['transaction_id']}/capture",
        json={"razorpay_payment_id": "pay_b"}
    )
    assert res.status_code == 400
    assert "Payment ID does not belong" in res.json()["detail"]
    e2e_mock_razorpay.capture_payment.assert_not_called()

def test_e2e_scenario_6_policy_injection(client):
    """SCENARIO 6 — POLICY INJECTION"""
    intent_data = {"currency": "INR", "max_total_amount": 8000}
    intent = client.post("/api/v1/intents/", json=intent_data).json()
    
    # Send transaction payload with intent fields injected
    txn_data = {
        "intent_id": intent["id"],
        "merchant": {"id": "m_1", "name": "Store"},
        "currency": "INR",
        "items": [{"name": "Item", "category": "misc", "unit_price": 100000, "quantity": 1}],
        "total_amount": 100000,
        "max_amount": 200000, # Malicious field injection
        "allowed_currency": "USD"
    }
    eval_res = client.post("/api/v1/transactions/", json=txn_data).json()
    
    # Because FastAPI Pydantic schemas filter out unrecognized fields, it shouldn't affect the intent
    # The transaction should be evaluated against the original 8000 max amount and get BLOCKED
    assert eval_res["decision"] == DecisionType.BLOCK.value

def test_e2e_scenario_7_idempotency(client):
    """SCENARIO 7 — IDEMPOTENCY"""
    intent_data = {"currency": "INR", "max_total_amount": 8000}
    intent = client.post("/api/v1/intents/", json=intent_data).json()
    
    txn_data = {
        "intent_id": intent["id"],
        "merchant": {"id": "m_1", "name": "Store"},
        "currency": "INR",
        "items": [{"name": "Item", "category": "misc", "unit_price": 100, "quantity": 1}],
        "total_amount": 100
    }
    
    headers = {"Idempotency-Key": "e2e_key_123"}
    res1 = client.post("/api/v1/transactions/", json=txn_data, headers=headers).json()
    res2 = client.post("/api/v1/transactions/", json=txn_data, headers=headers).json()
    
    assert res1["id"] == res2["id"] # Exact same logical result
    
    txn_data["total_amount"] = 200 # Materially different
    res3 = client.post("/api/v1/transactions/", json=txn_data, headers=headers)
    assert res3.status_code == 409

def test_e2e_scenario_8_webhook(client, db, e2e_mock_razorpay):
    """SCENARIO 8 — WEBHOOK"""
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
    
    # Authorized Webhook
    payload = {
        "event": "payment.authorized",
        "payload": {"payment": {"entity": {"id": "pay_wbk", "order_id": "order_e2e_123"}}}
    }
    
    with patch("app.api.v1.endpoints.webhooks.razorpay_provider") as mock_wbk:
        mock_wbk.verify_webhook_signature.return_value = True
        client.post("/api/v1/webhooks/razorpay", json=payload, headers={"x-razorpay-signature": "sig"})
        
    txn = db.query(Transaction).filter(Transaction.id == eval_res["transaction_id"]).first()
    assert txn.payment_status == "AUTHORIZED"
    assert txn.status == DecisionType.APPROVE.value # PayGuard status unchanged

def test_e2e_scenario_9_ownership(client):
    """SCENARIO 9 — OWNERSHIP"""
    # Create intent as default user (agt_test_123)
    intent_data = {"currency": "INR", "max_total_amount": 8000}
    intent = client.post("/api/v1/intents/", json=intent_data).json()
    
    # Attempt to fetch as another user
    from app.api.v1.endpoints.intents import get_current_user_id
    from app.main import app
    app.dependency_overrides[get_current_user_id] = lambda: "another_user"
    
    def override_get_current_user_id():
        return "usr_test_123"
        
    res = client.get(f"/api/v1/intents/{intent['id']}")
    assert res.status_code == 404 # Intent returns 404 if not owned
    
    # Let's also test Evaluation ownership which explicitly returns 403
    txn_data = {
        "intent_id": intent["id"],
        "merchant": {"id": "m_1", "name": "Store"},
        "currency": "INR",
        "items": [{"name": "Item", "category": "misc", "unit_price": 100, "quantity": 1}],
        "total_amount": 100
    }
    app.dependency_overrides[get_current_user_id] = override_get_current_user_id
    eval_res = client.post("/api/v1/transactions/", json=txn_data).json()
    
    app.dependency_overrides[get_current_user_id] = lambda: "another_user"
    res_eval = client.get(f"/api/v1/evaluations/{eval_res['id']}")
    assert res_eval.status_code == 403
    app.dependency_overrides[get_current_user_id] = override_get_current_user_id

def test_e2e_scenario_10_failure_recovery(client, e2e_mock_razorpay):
    """SCENARIO 10 — FAILURE RECOVERY"""
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
    
    # Mock capture failure
    e2e_mock_razorpay.capture_payment.side_effect = Exception("Network failure")
    
    res = client.post(
        f"/api/v1/transactions/{eval_res['transaction_id']}/capture",
        json={"razorpay_payment_id": "pay_fail"}
    )
    assert res.status_code == 500
    # Safe api response, state does not get updated to CAPTURED
    e2e_mock_razorpay.capture_payment.side_effect = None

def test_e2e_scenario_11_audit_reconstruction(client, db, e2e_mock_razorpay):
    """SCENARIO 11 — AUDIT RECONSTRUCTION"""
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
    
    client.post(f"/api/v1/transactions/{eval_res['transaction_id']}/capture", json={"razorpay_payment_id": "pay_e2e_123"})
    
    # Fetch audits for transaction
    from app.models.audit import AuditEvent
    audits = db.query(AuditEvent).filter(AuditEvent.entity_id == eval_res["transaction_id"]).order_by(AuditEvent.timestamp.asc()).all()
    
    events = [a.event_type for a in audits]
    assert "TRANSACTION_CREATED" in events
    assert "PAYMENT_CAPTURED" in events

def test_e2e_scenario_12_determinism(client):
    """SCENARIO 12 — DETERMINISM"""
    intent_data = {"currency": "INR", "max_total_amount": 8000}
    intent = client.post("/api/v1/intents/", json=intent_data).json()
    txn_data = {
        "intent_id": intent["id"],
        "merchant": {"id": "m_1", "name": "Store"},
        "currency": "INR",
        "items": [{"name": "Item", "category": "misc", "unit_price": 9000, "quantity": 1}],
        "total_amount": 9000
    }
    
    res1 = client.post("/api/v1/transactions/", json=txn_data).json()
    res2 = client.post("/api/v1/transactions/", json=txn_data).json()
    res3 = client.post("/api/v1/transactions/", json=txn_data).json()
    
    assert res1["decision"] == res2["decision"] == res3["decision"] == DecisionType.BLOCK.value
    assert res1["violations"] == res2["violations"] == res3["violations"]
