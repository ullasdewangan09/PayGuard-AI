from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api.v1.auth import get_current_user_id
from app.schemas.ai import AIIntentRequest, AIIntentResponse, ChatRequest, ChatResponse
from app.schemas.intent import IntentContractCreate
from app.services.ai_provider import ai_provider
from app.services.audit import audit_service
from app.models.intent import Intent
from app.models.transaction import Transaction
from pydantic import ValidationError
import json

router = APIRouter()

@router.post("/extract", response_model=AIIntentResponse)
def extract_intent(
    request: AIIntentRequest,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    try:
        history_dicts = [{"role": msg.role, "content": msg.content} for msg in request.history] if request.history else []
        ai_output = ai_provider.extract_intent(request.text, history=history_dicts)
    except Exception as e:
        audit_service.log_event(
            db=db,
            event_type="AI_EXTRACTION_PROVIDER_FAILED",
            entity_id=user_id,
            entity_type="user",
            payload={"error": str(e), "text": request.text}
        )
        return AIIntentResponse(
            intent=None,
            interpretation="Failed to communicate with AI Provider.",
            success=False,
            error=str(e)
        )

    if ai_output.get("is_chat", False):
        return AIIntentResponse(
            intent=None,
            interpretation=ai_output.get("chat_response", "Please provide more details."),
            success=True
        )

    raw_intent = ai_output.get("extracted_intent")
    if not raw_intent:
        return AIIntentResponse(
            intent=None,
            interpretation="No valid intent structure found.",
            success=False,
            error="Missing extracted_intent payload."
        )

    try:
        validated_intent = IntentContractCreate(**raw_intent)
    except ValidationError as ve:
        audit_service.log_event(
            db=db,
            event_type="AI_EXTRACTION_VALIDATION_FAILED",
            entity_id=user_id,
            entity_type="user",
            payload={"validation_errors": ve.errors(), "raw_intent": raw_intent}
        )
        return AIIntentResponse(
            intent=None,
            interpretation="AI output did not match the strict Intent Contract schema constraints.",
            success=False,
            error="Validation Error: AI produced invalid or unsafe constraints."
        )

    audit_service.log_event(
        db=db,
        event_type="AI_INTENT_EXTRACTED",
        entity_id=user_id,
        entity_type="user",
        payload={"extracted_intent": raw_intent}
    )

    return AIIntentResponse(
        intent=validated_intent,
        interpretation=f"Extracted a {validated_intent.currency} intent with a maximum budget of {validated_intent.max_total_amount}.",
        success=True
    )


@router.post("/chat", response_model=ChatResponse)
def finance_chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Finance-expert chatbot with live account context.
    Fetches the user's real data from the DB and injects it into the AI prompt.
    """
    try:
        # --- Fetch live account context ---
        # 1. All intents for this user
        intents = db.query(Intent).filter(Intent.user_id == user_id).all()
        intent_data = []
        for i in intents:
            jsonb = i.intent_jsonb or {}
            if isinstance(jsonb, str):
                import json
                try: jsonb = json.loads(jsonb)
                except: jsonb = {}
            intent_data.append({
                "id": i.id,
                "status": i.status,
                "currency": jsonb.get("currency", "INR"),
                "max_total_amount": jsonb.get("max_total_amount", 0),
                "allowed_categories": jsonb.get("allowed_categories") or [],
                "banned_categories": jsonb.get("banned_categories") or [],
                "recurring_payment_allowed": jsonb.get("recurring_payment_allowed", False),
            })
        active_intents = [i for i in intent_data if i["status"] == "ACTIVE"]

        # 2. Recent transactions for this user
        transactions = (
            db.query(Transaction)
            .join(Intent, Transaction.intent_id == Intent.id)
            .filter(Intent.user_id == user_id)
            .order_by(Transaction.created_at.desc())
            .limit(20)
            .all()
        )
        tx_data = []
        total_volume = 0.0
        approved_count = 0
        blocked_count = 0
        pending_count = 0

        for tx in transactions:
            jsonb = tx.transaction_jsonb or {}
            if isinstance(jsonb, str):
                import json
                try: jsonb = json.loads(jsonb)
                except: jsonb = {}
                
            amount = jsonb.get("total_amount") or 0
            currency = jsonb.get("currency", "INR")
            merchant = jsonb.get("merchant", {})
            merchant_name = merchant.get("name", "Unknown") if isinstance(merchant, dict) else str(merchant)

            status = tx.status or "PENDING"
            if status == "APPROVED":
                approved_count += 1
                total_volume += float(amount)
            elif status in ("BLOCKED", "REJECTED"):
                blocked_count += 1
            else:
                pending_count += 1

            tx_data.append({
                "id": tx.id,
                "status": status,
                "total_amount": float(amount),
                "currency": currency,
                "merchant_name": merchant_name,
                "intent_id": tx.intent_id,
                "created_at": str(tx.created_at),
            })

        summary = {
            "total_transactions": len(transactions),
            "approved": approved_count,
            "blocked": blocked_count,
            "pending": pending_count,
            "total_volume": total_volume,
            "active_intents": len(active_intents),
            "total_intents": len(intents),
        }

        context = {
            "summary": summary,
            "recent_transactions": tx_data,
            "intents": intent_data,
        }

        history_dicts = [{"role": m.role, "content": m.content} for m in (request.history or [])]

        reply = ai_provider.chat(
            message=request.message,
            history=history_dicts,
            context=context
        )

        return ChatResponse(reply=reply, success=True)

    except Exception as e:
        print(f"Finance chat error: {e}")
        return ChatResponse(
            reply="I'm sorry, I encountered an error while fetching your account data. Please try again.",
            success=False,
            error=str(e)
        )
