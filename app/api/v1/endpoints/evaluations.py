from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.evaluation import EvaluationResult, Violation, DecisionType
from app.models.evaluation import Evaluation, ViolationRecord
from app.models.transaction import Transaction
from app.models.intent import Intent
from app.api.v1.auth import get_current_user_id
from app.services.audit import audit_service
from app.services.explanation import explanation_engine

router = APIRouter()

@router.get("/{evaluation_id}", response_model=EvaluationResult)
def get_evaluation(evaluation_id: str, db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    db_evaluation = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
    if not db_evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")
        
    db_transaction = db.query(Transaction).filter(Transaction.id == db_evaluation.transaction_id).first()
    db_intent = db.query(Intent).filter(Intent.id == db_transaction.intent_id).first()
    
    if db_intent.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this evaluation")

    violations = [
        Violation(
            code=v.code,
            constraint=v.constraint,
            expected=v.expected,
            actual=v.actual,
            severity=v.severity
        ) for v in db_evaluation.violations
    ]
    
    return EvaluationResult(
        id=db_evaluation.id,
        intent_id=db_intent.id,
        transaction_id=db_evaluation.transaction_id,
        decision=db_evaluation.decision,
        violations=violations,
        created_at=db_evaluation.created_at,
        explanation=db_evaluation.explanation,
        expected_decision=db_evaluation.expected_decision,
        razorpay_order_id=db_transaction.razorpay_order_id
    )

@router.post("/{evaluation_id}/approve", response_model=EvaluationResult)
def approve_ask_evaluation(evaluation_id: str, db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    db_evaluation = db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()
    if not db_evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")
        
    if db_evaluation.decision != DecisionType.ASK.value:
        raise HTTPException(status_code=400, detail="Only ASK evaluations can be manually approved")
        
    # Verify the evaluation belongs to the user
    db_transaction = db.query(Transaction).filter(Transaction.id == db_evaluation.transaction_id).first()
    db_intent = db.query(Intent).filter(Intent.id == db_transaction.intent_id).first()
    
    if db_intent.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to approve this transaction")
        
    if db_transaction.payment_status == "CAPTURED":
        raise HTTPException(status_code=400, detail="Cannot approve an already captured transaction")
        
    audit_service.log_event(
        db=db,
        event_type="ASK_APPROVAL_REQUESTED",
        entity_id=db_evaluation.id,
        entity_type="evaluation",
        payload={"user_id": user_id, "transaction_id": db_transaction.id}
    )
        
    db_evaluation.decision = DecisionType.APPROVE.value
    db_transaction.status = DecisionType.APPROVE.value
    
    violations = [
        Violation(
            code=v.code,
            constraint=v.constraint,
            expected=v.expected,
            actual=v.actual,
            severity=v.severity
        ) for v in db_evaluation.violations
    ]
    
    # Regenerate explanation based on new decision
    explanation = explanation_engine.generate(DecisionType.APPROVE, violations)
    db_evaluation.explanation = explanation

    db.commit()
    
    audit_service.log_event(
        db=db,
        event_type="ASK_APPROVED",
        entity_id=db_evaluation.id,
        entity_type="evaluation",
        payload={"user_id": user_id, "transaction_id": db_transaction.id}
    )
    
    return EvaluationResult(
        id=db_evaluation.id,
        intent_id=db_intent.id,
        transaction_id=db_evaluation.transaction_id,
        decision=DecisionType.APPROVE,
        violations=violations,
        created_at=db_evaluation.created_at,
        explanation=db_evaluation.explanation,
        expected_decision=db_evaluation.expected_decision,
        razorpay_order_id=db_transaction.razorpay_order_id
    )
