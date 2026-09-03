from sqlalchemy.orm import Session
from app.models.audit import AuditEvent
import json

class AuditService:
    @staticmethod
    def log_event(db: Session, event_type: str, entity_id: str, entity_type: str, payload: dict):
        # We assume payload is dict. Serialize to jsonable if needed, but JSON column handles dicts usually
        audit_event = AuditEvent(
            event_type=event_type,
            entity_id=entity_id,
            entity_type=entity_type,
            payload=payload
        )
        db.add(audit_event)
        db.commit()
        db.refresh(audit_event)
        return audit_event

audit_service = AuditService()
