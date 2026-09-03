from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.intent import IntentContractCreate, IntentContract
from app.models.intent import Intent
from app.models.idempotency import IdempotencyKey
from app.api.v1.auth import get_current_user_id
from app.services.audit import audit_service
import uuid
import json
import hashlib
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=IntentContract)
def create_intent(
    intent_in: IntentContractCreate, 
    db: Session = Depends(get_db), 
    user_id: str = Depends(get_current_user_id),
    idempotency_key: str = Header(None, alias="Idempotency-Key")
):
    if idempotency_key:
        req_hash = hashlib.sha256(intent_in.model_dump_json().encode()).hexdigest()
        ik = db.query(IdempotencyKey).filter(IdempotencyKey.idempotency_key == idempotency_key).first()
        if ik:
            if ik.request_hash != req_hash:
                raise HTTPException(status_code=409, detail="Idempotency key already used with different payload")
            return ik.response_payload

    db_intent = Intent(
        user_id=user_id,
        intent_jsonb=intent_in.model_dump(),
        status="ACTIVE"
    )
    db.add(db_intent)
    db.commit()
    db.refresh(db_intent)
    
    intent_contract = IntentContract(
        id=db_intent.id,
        user_id=db_intent.user_id,
        status=db_intent.status,
        created_at=db_intent.created_at,
        version=db_intent.version,
        **db_intent.intent_jsonb
    )

    audit_service.log_event(
        db=db,
        event_type="INTENT_CREATED",
        entity_id=db_intent.id,
        entity_type="intent",
        payload={"user_id": user_id, "status": "ACTIVE"}
    )
    
    if idempotency_key:
        ik = IdempotencyKey(
            idempotency_key=idempotency_key,
            request_hash=req_hash,
            response_payload=intent_contract.model_dump(mode="json"),
            status_code="200"
        )
        db.add(ik)
        db.commit()

    return intent_contract

@router.get("/{intent_id}", response_model=IntentContract)
def get_intent(intent_id: str, db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    db_intent = db.query(Intent).filter(Intent.id == intent_id, Intent.user_id == user_id).first()
    if not db_intent:
        raise HTTPException(status_code=404, detail="Intent not found")
        
    return IntentContract(
        id=db_intent.id,
        user_id=db_intent.user_id,
        status=db_intent.status,
        created_at=db_intent.created_at,
        version=db_intent.version,
        **db_intent.intent_jsonb
    )

from typing import List

@router.get("/", response_model=List[IntentContract])
def list_intents(db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    db_intents = db.query(Intent).filter(Intent.user_id == user_id).all()
    results = []
    for db_intent in db_intents:
        results.append(IntentContract(
            id=db_intent.id,
            user_id=db_intent.user_id,
            status=db_intent.status,
            created_at=db_intent.created_at,
            version=db_intent.version,
            **db_intent.intent_jsonb
        ))
    return results

from pydantic import BaseModel
class StatusUpdate(BaseModel):
    status: str

@router.put("/{intent_id}/status", response_model=IntentContract)
def update_intent_status(intent_id: str, status_update: StatusUpdate, db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    db_intent = db.query(Intent).filter(Intent.id == intent_id, Intent.user_id == user_id).first()
    if not db_intent:
        raise HTTPException(status_code=404, detail="Intent not found")
        
    db_intent.status = status_update.status
    db.commit()
    db.refresh(db_intent)
    
    audit_service.log_event(
        db=db,
        event_type="INTENT_STATUS_UPDATED",
        entity_id=db_intent.id,
        entity_type="intent",
        payload={"new_status": status_update.status}
    )
    
    return IntentContract(
        id=db_intent.id,
        user_id=db_intent.user_id,
        status=db_intent.status,
        created_at=db_intent.created_at,
        version=db_intent.version,
        **db_intent.intent_jsonb
    )

@router.delete("/{intent_id}")
def delete_intent(intent_id: str, db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id)):
    db_intent = db.query(Intent).filter(Intent.id == intent_id, Intent.user_id == user_id).first()
    if not db_intent:
        raise HTTPException(status_code=404, detail="Intent not found")
        
    db.delete(db_intent)
    db.commit()
    
    audit_service.log_event(
        db=db,
        event_type="INTENT_DELETED",
        entity_id=intent_id,
        entity_type="intent",
        payload={}
    )
    
    return {"message": "Intent deleted successfully"}
