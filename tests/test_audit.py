import pytest
from app.models.audit import AuditEvent

def test_audit_event_creation(client, db):
    # Create intent
    intent_data = {
        "currency": "INR",
        "max_total_amount": 8000
    }
    response = client.post("/api/v1/intents/", json=intent_data)
    assert response.status_code == 200
    intent_id = response.json()["id"]

    # Verify audit event for INTENT_CREATED
    audit = db.query(AuditEvent).filter(AuditEvent.entity_id == intent_id).first()
    assert audit is not None
    assert audit.event_type == "INTENT_CREATED"
    assert audit.entity_type == "intent"
    assert audit.payload["status"] == "ACTIVE"
    assert audit.payload["user_id"] == "usr_test_123"

def test_audit_transaction_and_decision(client, db):
    # Create intent
    intent_data = {
        "currency": "INR",
        "max_total_amount": 8000
    }
    intent_id = client.post("/api/v1/intents/", json=intent_data).json()["id"]

    # Create transaction
    txn_data = {
        "intent_id": intent_id,
        "merchant": {"id": "m_123", "name": "Store"},
        "currency": "INR",
        "items": [{"name": "Item", "category": "electronics", "unit_price": 7000, "quantity": 1}],
        "total_amount": 7000
    }
    response = client.post("/api/v1/transactions/", json=txn_data)
    assert response.status_code == 200
    txn_id = response.json()["transaction_id"]
    eval_id = response.json()["id"]

    # Verify audit events
    txn_audit = db.query(AuditEvent).filter(AuditEvent.event_type == "TRANSACTION_CREATED", AuditEvent.entity_id == txn_id).first()
    assert txn_audit is not None
    
    dec_audit = db.query(AuditEvent).filter(AuditEvent.event_type == "DECISION_GENERATED", AuditEvent.entity_id == eval_id).first()
    assert dec_audit is not None
    assert dec_audit.payload["decision"] == "APPROVE"
    assert dec_audit.payload["violations"] == 0
