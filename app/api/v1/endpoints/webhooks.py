from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Header, Request
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.transaction import Transaction
from app.models.webhook import WebhookEvent
from app.providers.razorpay_provider import razorpay_provider
from app.services.audit import audit_service
from app.services.notifications import notification_service
from app.services.payment_state import PAYMENT_CAPTURED, PAYMENT_FAILED, transition_payment
from app.services.receipt import receipt_service
import hashlib
import json

router = APIRouter()

@router.post("/razorpay")
async def razorpay_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    x_razorpay_signature: str = Header(None)
):
    if not x_razorpay_signature:
        raise HTTPException(status_code=400, detail="Missing signature")
        
    body = await request.body()
    body_str = body.decode('utf-8')
    
    is_valid = razorpay_provider.verify_webhook_signature(body_str, x_razorpay_signature)
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid signature")
        
    payload = json.loads(body_str)
    event_type = payload.get("event")
    event_key = payload.get("id") or hashlib.sha256(body).hexdigest()
    existing_event = db.query(WebhookEvent).filter(WebhookEvent.event_key == event_key).first()
    if existing_event:
        return {"status": "ok", "idempotent": True}
    db.add(WebhookEvent(event_key=event_key, event_type=event_type or "unknown"))
    db.flush()
    
    # Simple webhook handling mapping
    if event_type in ["payment.authorized", "payment.captured", "payment.failed", "payment.refunded"]:
        payment = payload.get("payload", {}).get("payment", {}).get("entity", {})
        order_id = payment.get("order_id")
        payment_id = payment.get("id")
        
        if not order_id:
            db.commit()
            return {"status": "ignored", "reason": "No order_id in payment payload"}
            
        db_transaction = db.query(Transaction).filter(Transaction.razorpay_order_id == order_id).first()
        if not db_transaction:
            db.commit()
            return {"status": "ignored", "reason": "Unknown order_id"}
            
        # Update the status based on webhook without overriding PayGuard decision
        # We only update the payment_status tracking field
        if event_type == "payment.authorized":
            if db_transaction.payment_status != PAYMENT_CAPTURED:
                transition_payment(db_transaction, "AUTHORIZED")
                db_transaction.razorpay_payment_id = payment_id
        elif event_type == "payment.captured":
            if db_transaction.status != "APPROVE":
                db.commit()
                return {"status": "ignored", "reason": "PayGuard decision is not APPROVE"}
            if db_transaction.payment_status != PAYMENT_CAPTURED:
                transition_payment(db_transaction, PAYMENT_CAPTURED)
            db_transaction.razorpay_payment_id = payment_id
            db_transaction.payment_method = payment.get("method") or db_transaction.payment_method
            receipt = receipt_service.get_or_create_for_transaction(db, db_transaction, db_transaction.agent_id)
            receipt_pdf = receipt_service.render_pdf(receipt)
            background_tasks.add_task(
                notification_service.publish_payment_success,
                db,
                db_transaction.agent_id,
                db_transaction,
                receipt,
                receipt_pdf,
            )
        elif event_type == "payment.failed":
            if db_transaction.payment_status != PAYMENT_CAPTURED:
                transition_payment(db_transaction, PAYMENT_FAILED)
                db_transaction.payment_failure_code = payment.get("error_code")
                db_transaction.payment_failure_reason = payment.get("error_description") or payment.get("error_reason")
        elif event_type == "payment.refunded":
            if db_transaction.payment_status == PAYMENT_CAPTURED:
                transition_payment(db_transaction, "REFUNDED")
            
        db.commit()
        
        audit_service.log_event(
            db=db,
            event_type=f"WEBHOOK_{event_type.upper().replace('.', '_')}",
            entity_id=db_transaction.id,
            entity_type="transaction",
            payload={"razorpay_payment_id": payment_id, "razorpay_order_id": order_id}
        )
        
    else:
        db.commit()
    return {"status": "ok"}
