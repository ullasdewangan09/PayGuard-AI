from sqlalchemy import Column, String, DateTime, JSON
from datetime import datetime, timezone
import uuid

from app.db.database import Base

def generate_uuid():
    return f"aud_{uuid.uuid4().hex}"

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    event_type = Column(String, index=True, nullable=False)
    entity_id = Column(String, index=True, nullable=True)
    entity_type = Column(String, index=True, nullable=True)
    payload = Column(JSON, nullable=True)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
