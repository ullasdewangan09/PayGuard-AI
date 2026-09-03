from sqlalchemy import Column, String, DateTime, JSON
from datetime import datetime, timezone
import uuid

from app.db.database import Base

class IdempotencyKey(Base):
    __tablename__ = "idempotency_keys"

    idempotency_key = Column(String, primary_key=True, index=True)
    request_hash = Column(String, nullable=False) # to detect if payload changed
    response_payload = Column(JSON, nullable=True) # the returned data
    status_code = Column(String, nullable=False) # e.g. "200"
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
