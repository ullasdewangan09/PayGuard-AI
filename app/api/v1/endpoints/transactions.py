from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.transaction import TransactionContractCreate, TransactionContract
from app.schemas.intent import IntentContract
from app.schemas.evaluation import EvaluationResult, DecisionType
from app.models.intent import Intent
from app.models.transaction import Transaction
from app.models.evaluation import Evaluation, ViolationRecord
from app.models.idempotency import IdempotencyKey
from app.policies.engine import policy_engine
from app.decisions.engine import decision_engine
from app.services.explanation import explanation_engine
from app.services.audit import audit_service
from app.services.notifications import notification_service
from app.services.payment_state import (
    PAYMENT_AUTHORIZED,
    PAYMENT_CAPTURE_PENDING,
    PAYMENT_CAPTURED,
    PAYMENT_CREATED,
    PAYMENT_FAILED,
    transition_payment,
)
from app.services.receipt import receipt_service
import hashlib
import json

router = APIRouter()

from app.api.v1.auth import get_current_user_id

@router.post("/", response_model=EvaluationResult)
def create_and_evaluate_transaction(
    transaction_in: TransactionContractCreate, 
    db: Session = Depends(get_db), 
    user_id: str = Depends(get_current_user_id),
    idempotency_key: str = Header(None, alias="Idempotency-Key")
):
    if idempotency_key:
        req_hash = hashlib.sha256(transaction_in.model_dump_json().encode()).hexdigest()
        ik = db.query(IdempotencyKey).filter(IdempotencyKey.idempotency_key == idempotency_key).first()
        if ik:
            if ik.request_hash != req_hash:
                raise HTTPException(status_code=409, detail="Idempotency key already used with different payload")
            return ik.response_payload

    # 1. Fetch the Intent
    db_intent = db.query(Intent).filter(Intent.id == transaction_in.intent_id).first()
    if not db_intent:
        raise HTTPException(status_code=404, detail="Intent not found")
        
    if db_intent.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to use this intent")
        
    intent_contract = IntentContract(
        id=db_intent.id,
        user_id=db_intent.user_id,
        status=db_intent.status,
        created_at=db_intent.created_at,
        version=db_intent.version,
        **db_intent.intent_jsonb
    )

    # 2. Save the Transaction
    # Filter out expected_decision for transaction model dump
    txn_data = transaction_in.model_dump(exclude={"expected_decision"})
    db_transaction = Transaction(
        intent_id=intent_contract.id,
        agent_id=user_id,
        transaction_jsonb=txn_data,
        status="PENDING",
        payment_status="CREATED"
    )
    db.add(db_transaction)
    db.flush() # To get the transaction id

    # Create Razorpay Order
    from app.providers.razorpay_provider import razorpay_provider
    order_id = razorpay_provider.create_order(
        amount=transaction_in.total_amount,
        currency=transaction_in.currency,
        receipt=db_transaction.id
    )
    db_transaction.razorpay_order_id = order_id
    db_transaction.payment_status = PAYMENT_CREATED
    db.flush()

    audit_service.log_event(
        db=db,
        event_type="TRANSACTION_CREATED",
        entity_id=db_transaction.id,
        entity_type="transaction",
        payload={"intent_id": intent_contract.id, "agent_id": user_id, "razorpay_order_id": order_id}
    )

    # 3. Evaluate Constraints
    transaction_contract = TransactionContract(
        id=db_transaction.id,
        agent_id=db_transaction.agent_id,
        status=db_transaction.status,
        created_at=str(db_transaction.created_at),
        **txn_data
    )
    
    violations = policy_engine.evaluate(intent_contract, transaction_contract)
    
    # 4. Make Decision
    decision = decision_engine.decide(violations)
    
    # Generate Explanation
    explanation = explanation_engine.generate(decision, violations)

    # 5. Save Evaluation
    db_evaluation = Evaluation(
        transaction_id=db_transaction.id,
        decision=decision.value,
        explanation=explanation,
        expected_decision=transaction_in.expected_decision
    )
    db.add(db_evaluation)
    db.flush()
    
    # 6. Save Violations
    for v in violations:
        db_violation = ViolationRecord(
            evaluation_id=db_evaluation.id,
            code=v.code.value,
            constraint=v.constraint,
            expected=v.expected,
            actual=v.actual,
            severity=v.severity.value
        )
        db.add(db_violation)
        
    # Update transaction status to reflect decision
    db_transaction.status = decision.value
    
    audit_service.log_event(
        db=db,
        event_type="DECISION_GENERATED",
        entity_id=db_evaluation.id,
        entity_type="evaluation",
        payload={"transaction_id": db_transaction.id, "decision": decision.value, "violations": len(violations)}
    )

    db.commit()
    db.refresh(db_evaluation)

    eval_result = EvaluationResult(
        id=db_evaluation.id,
        intent_id=intent_contract.id,
        transaction_id=db_transaction.id,
        decision=decision,
        violations=violations,
        created_at=db_evaluation.created_at,
        explanation=explanation,
        expected_decision=transaction_in.expected_decision,
        razorpay_order_id=order_id
    )

    if idempotency_key:
        resp_dump = eval_result.model_dump(mode="json")
        
        ik = IdempotencyKey(
            idempotency_key=idempotency_key,
            request_hash=req_hash,
            response_payload=resp_dump,
            status_code="200"
        )
        db.add(ik)
        db.commit()

    return eval_result

from pydantic import BaseModel

class CaptureRequest(BaseModel):
    razorpay_payment_id: str
    razorpay_signature: str | None = None

@router.post("/{transaction_id}/capture", response_model=dict)
def capture_payment(
    transaction_id: str,
    capture_in: CaptureRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    db_transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    db_intent = db.query(Intent).filter(Intent.id == db_transaction.intent_id).first()
    
    if db_intent.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to capture this transaction")
        
    if db_transaction.payment_status == PAYMENT_CAPTURED:
        raise HTTPException(status_code=409, detail="Transaction already captured")
    
    if db_transaction.status != DecisionType.APPROVE.value:
        audit_service.log_event(
            db=db,
            event_type="CAPTURE_REJECTED",
            entity_id=db_transaction.id,
            entity_type="transaction",
            payload={"reason": f"Decision state is {db_transaction.status}"}
        )
        raise HTTPException(status_code=403, detail="Transaction is not approved for capture")

    from app.providers.razorpay_provider import razorpay_provider
    # transaction_jsonb contains total_amount and currency
    amount = db_transaction.transaction_jsonb.get("total_amount")
    currency = db_transaction.transaction_jsonb.get("currency")

    if capture_in.razorpay_signature:
        if not razorpay_provider.verify_checkout_signature(
            db_transaction.razorpay_order_id,
            capture_in.razorpay_payment_id,
            capture_in.razorpay_signature,
        ):
            raise HTTPException(status_code=400, detail="Invalid Razorpay checkout signature")
    
    try:
        payment_details = razorpay_provider.fetch_payment(capture_in.razorpay_payment_id)
        if payment_details.get("order_id") != db_transaction.razorpay_order_id:
            raise ValueError("Payment ID does not belong to the associated order")
        fetched_amount = payment_details.get("amount")
        expected_amount = int(round(float(amount) * 100))
        if fetched_amount is not None and int(fetched_amount) != expected_amount:
            raise ValueError("Payment amount does not match transaction amount")
        fetched_currency = payment_details.get("currency")
        if fetched_currency is not None and fetched_currency != currency:
            raise ValueError("Payment currency does not match transaction currency")
        fetched_status = payment_details.get("status")
        if fetched_status is not None and fetched_status not in {"authorized", "captured"}:
            raise ValueError("Payment is not authorized for capture")

        db_transaction.razorpay_payment_id = capture_in.razorpay_payment_id
        db_transaction.payment_method = payment_details.get("method") or db_transaction.payment_method
        db_transaction.payment_metadata = {
            key: payment_details.get(key)
            for key in ["method", "bank", "wallet", "vpa", "card_id", "international"]
            if payment_details.get(key) is not None
        }
        transition_payment(db_transaction, PAYMENT_AUTHORIZED, allowed_from=[PAYMENT_CREATED, PAYMENT_AUTHORIZED, PAYMENT_FAILED])
        transition_payment(db_transaction, PAYMENT_CAPTURE_PENDING, allowed_from=[PAYMENT_AUTHORIZED])
            
        capture_result = razorpay_provider.capture_payment(
            payment_id=capture_in.razorpay_payment_id,
            amount=amount,
            currency=currency
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Razorpay capture failed")

    transition_payment(db_transaction, PAYMENT_CAPTURED, allowed_from=[PAYMENT_CAPTURE_PENDING])
    if capture_result.get("method") and not db_transaction.payment_method:
        db_transaction.payment_method = capture_result.get("method")
    receipt = receipt_service.get_or_create_for_transaction(db, db_transaction, user_id)
    db.commit()
    db.refresh(receipt)
    
    audit_service.log_event(
        db=db,
        event_type="PAYMENT_CAPTURED",
        entity_id=db_transaction.id,
        entity_type="transaction",
        payload={"razorpay_payment_id": capture_in.razorpay_payment_id, "amount": amount}
    )

    receipt_pdf = receipt_service.render_pdf(receipt)
    background_tasks.add_task(
        notification_service.publish_payment_success,
        db,
        user_id,
        db_transaction,
        receipt,
        receipt_pdf,
    )
    
    return {
        "status": "success",
        "payment_status": PAYMENT_CAPTURED,
        "receipt_id": receipt.public_id,
        "capture_result": capture_result,
    }

from typing import List

@router.get("/", response_model=List[dict])
def list_transactions(db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id), skip: int = 0, limit: int = 100):
    db_transactions = db.query(Transaction).filter(Transaction.agent_id == user_id).order_by(Transaction.created_at.desc()).offset(skip).limit(limit).all()
    results = []
    for db_tx in db_transactions:
        # Fetch associated evaluation if available to get the decision reasoning
        db_eval = db.query(Evaluation).filter(Evaluation.transaction_id == db_tx.id).first()
        results.append({
            "id": db_tx.id,
            "intent_id": db_tx.intent_id,
            "status": db_tx.status,
            "payment_status": db_tx.payment_status,
            "created_at": db_tx.created_at,
            "decision": db_tx.status,
            "reasoning": db_eval.explanation if db_eval else "Pending evaluation",
            "evaluation_id": db_eval.id if db_eval else None,
            **db_tx.transaction_jsonb
        })
    return results
