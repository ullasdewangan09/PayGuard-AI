from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.v1.auth import get_current_user_id
from app.db.database import get_db
from app.models.intent import Intent
from app.models.notification import Notification
from app.models.receipt import Receipt
from app.models.transaction import Transaction

router = APIRouter()


@router.get("/{order_id}")
def get_order(order_id: str, db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    transaction = (
        db.query(Transaction)
        .filter((Transaction.id == order_id) | (Transaction.razorpay_order_id == order_id))
        .first()
    )
    if not transaction:
        raise HTTPException(status_code=404, detail="Order not found")
    intent = db.query(Intent).filter(Intent.id == transaction.intent_id).first()
    if not intent or intent.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this order")
    receipt = db.query(Receipt).filter(Receipt.transaction_id == transaction.id).first()
    notification_rows = db.query(Notification).filter(Notification.transaction_id == transaction.id).all()
    return {
        "order_id": transaction.id,
        "razorpay_order_id": transaction.razorpay_order_id,
        "status": transaction.status,
        "amount": transaction.transaction_jsonb.get("total_amount"),
        "currency": transaction.transaction_jsonb.get("currency"),
        "payment_status": transaction.payment_status,
        "payment_method": transaction.payment_method,
        "created_at": transaction.created_at,
        "updated_at": transaction.updated_at,
        "receipt_available": receipt is not None,
        "receipt_id": receipt.public_id if receipt else None,
        "notification_status": [
            {"channel": row.channel, "event_type": row.event_type, "status": row.status}
            for row in notification_rows
        ],
    }
