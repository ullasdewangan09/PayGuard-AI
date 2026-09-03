from unittest.mock import patch

from app.models.notification import Notification
from app.models.receipt import Receipt
from app.models.transaction import Transaction
from app.models.webhook import WebhookEvent
from app.schemas.evaluation import DecisionType


def _approved_transaction(client):
    intent = client.post("/api/v1/intents/", json={"currency": "INR", "max_total_amount": 8000}).json()
    txn_data = {
        "intent_id": intent["id"],
        "merchant": {"id": "m_123", "name": "Store"},
        "currency": "INR",
        "items": [{"name": "Item", "category": "electronics", "unit_price": 7000, "quantity": 1}],
        "total_amount": 7000,
    }
    return client.post("/api/v1/transactions/", json=txn_data).json()


def test_capture_creates_receipt_and_order_status(client, db):
    with patch("app.providers.razorpay_provider.razorpay_provider") as mock_rp:
        mock_rp.create_order.return_value = "order_receipt_123"
        mock_rp.fetch_payment.return_value = {
            "id": "pay_receipt_123",
            "status": "authorized",
            "order_id": "order_receipt_123",
            "amount": 700000,
            "currency": "INR",
            "method": "upi",
            "vpa": "buyer@upi",
        }
        mock_rp.capture_payment.return_value = {"id": "pay_receipt_123", "status": "captured", "method": "upi"}

        eval_result = _approved_transaction(client)
        assert eval_result["decision"] == DecisionType.APPROVE.value
        capture = client.post(
            f"/api/v1/transactions/{eval_result['transaction_id']}/capture",
            json={"razorpay_payment_id": "pay_receipt_123"},
        )

    assert capture.status_code == 200
    receipt_id = capture.json()["receipt_id"]
    receipt = db.query(Receipt).filter(Receipt.public_id == receipt_id).first()
    assert receipt is not None
    assert receipt.receipt_number.startswith("PG-")

    order = client.get(f"/api/v1/orders/{eval_result['transaction_id']}")
    assert order.status_code == 200
    assert order.json()["payment_status"] == "CAPTURED"
    assert order.json()["payment_method"] == "upi"
    assert order.json()["receipt_available"] is True

    pdf = client.get(f"/api/v1/receipts/{receipt_id}")
    assert pdf.status_code == 200
    assert pdf.headers["content-type"] == "application/pdf"
    assert pdf.content.startswith(b"%PDF")


def test_receipt_ownership_enforced(client):
    with patch("app.providers.razorpay_provider.razorpay_provider") as mock_rp:
        mock_rp.create_order.return_value = "order_owner_123"
        mock_rp.fetch_payment.return_value = {"id": "pay_owner_123", "status": "authorized", "order_id": "order_owner_123"}
        mock_rp.capture_payment.return_value = {"id": "pay_owner_123", "status": "captured"}
        eval_result = _approved_transaction(client)
        capture = client.post(
            f"/api/v1/transactions/{eval_result['transaction_id']}/capture",
            json={"razorpay_payment_id": "pay_owner_123"},
        )

    from app.api.v1.auth import get_current_user_id
    from app.main import app

    app.dependency_overrides[get_current_user_id] = lambda: "usr_attacker"
    try:
        denied = client.get(f"/api/v1/receipts/{capture.json()['receipt_id']}")
        assert denied.status_code == 403
    finally:
        app.dependency_overrides[get_current_user_id] = lambda: "usr_test_123"


def test_webhook_replay_is_idempotent_and_does_not_duplicate_receipts(client, db):
    with patch("app.providers.razorpay_provider.razorpay_provider") as mock_rp:
        mock_rp.create_order.return_value = "order_wbk_capture"
        eval_result = _approved_transaction(client)

    payload = {
        "id": "evt_capture_once",
        "event": "payment.captured",
        "payload": {"payment": {"entity": {"id": "pay_wbk_capture", "order_id": "order_wbk_capture", "method": "card"}}},
    }

    with patch("app.api.v1.endpoints.webhooks.razorpay_provider") as mock_wbk:
        mock_wbk.verify_webhook_signature.return_value = True
        first = client.post("/api/v1/webhooks/razorpay", json=payload, headers={"x-razorpay-signature": "sig"})
        second = client.post("/api/v1/webhooks/razorpay", json=payload, headers={"x-razorpay-signature": "sig"})

    assert first.status_code == 200
    assert second.status_code == 200
    assert second.json()["idempotent"] is True
    assert db.query(WebhookEvent).filter(WebhookEvent.event_key == "evt_capture_once").count() == 1
    assert db.query(Receipt).filter(Receipt.transaction_id == eval_result["transaction_id"]).count() == 1


def test_wrong_amount_and_currency_are_rejected_before_capture(client):
    with patch("app.providers.razorpay_provider.razorpay_provider") as mock_rp:
        mock_rp.create_order.return_value = "order_wrong_amount"
        mock_rp.fetch_payment.return_value = {
            "id": "pay_wrong_amount",
            "status": "authorized",
            "order_id": "order_wrong_amount",
            "amount": 710000,
            "currency": "INR",
        }
        eval_result = _approved_transaction(client)
        result = client.post(
            f"/api/v1/transactions/{eval_result['transaction_id']}/capture",
            json={"razorpay_payment_id": "pay_wrong_amount"},
        )

    assert result.status_code == 400
    assert "amount" in result.json()["detail"]
    mock_rp.capture_payment.assert_not_called()


def test_notification_idempotency_on_duplicate_publish(client, db):
    with patch("app.providers.razorpay_provider.razorpay_provider") as mock_rp:
        mock_rp.create_order.return_value = "order_notify"
        mock_rp.fetch_payment.return_value = {"id": "pay_notify", "status": "authorized", "order_id": "order_notify"}
        mock_rp.capture_payment.return_value = {"id": "pay_notify", "status": "captured"}
        eval_result = _approved_transaction(client)
        capture = client.post(
            f"/api/v1/transactions/{eval_result['transaction_id']}/capture",
            json={"razorpay_payment_id": "pay_notify"},
        )

    transaction = db.query(Transaction).filter(Transaction.id == eval_result["transaction_id"]).first()
    receipt = db.query(Receipt).filter(Receipt.public_id == capture.json()["receipt_id"]).first()

    from app.services.notifications import notification_service

    notification_service.publish_payment_success(db, "usr_test_123", transaction, receipt)
    notification_service.publish_payment_success(db, "usr_test_123", transaction, receipt)

    rows = db.query(Notification).filter(Notification.transaction_id == transaction.id, Notification.channel == "email").all()
    assert len(rows) == 1
    assert rows[0].status == "SENT"
