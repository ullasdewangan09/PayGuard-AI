from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.audit import AuditEvent
from app.api.v1.auth import get_current_user_id
from typing import List

router = APIRouter()

@router.get("/", response_model=List[dict])
def list_audit_events(db: Session = Depends(get_db), user_id: str = Depends(get_current_user_id), skip: int = 0, limit: int = 100):
    db_events = db.query(AuditEvent).order_by(AuditEvent.timestamp.desc()).offset(skip).limit(limit).all()
    # In a real app we'd filter by user_id, but the audit table might not have user_id directly on every event 
    # depending on the entity type. For the hackathon/demo, we'll return all events or filter minimally.
    # Since we can't easily filter all types by user_id, let's just return them all for the demo.
    
    results = []
    for ev in db_events:
        results.append({
            "id": ev.id,
            "timestamp": ev.timestamp,
            "event_type": ev.event_type,
            "entity_id": ev.entity_id,
            "entity_type": ev.entity_type,
            "payload": ev.payload
        })
    return results
