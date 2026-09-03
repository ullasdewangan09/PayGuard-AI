from datetime import datetime, timezone
import uuid

from sqlalchemy import Column, DateTime, Integer, String, UniqueConstraint

from app.db.database import Base


class Notification(Base):
    __tablename__ = "notifications"
    __table_args__ = (
        UniqueConstraint("idempotency_key", name="uq_notifications_idempotency_key"),
    )

    id = Column(String, primary_key=True, default=lambda: f"ntf_{uuid.uuid4().hex}")
    user_id = Column(String, index=True, nullable=False)
    transaction_id = Column(String, index=True, nullable=True)
    receipt_id = Column(String, index=True, nullable=True)
    event_type = Column(String, index=True, nullable=False)
    channel = Column(String, index=True, nullable=False)
    status = Column(String, default="PENDING", nullable=False)
    provider_message_id = Column(String, nullable=True)
    idempotency_key = Column(String, nullable=False)
    attempt_count = Column(Integer, default=0, nullable=False)
    last_attempt_at = Column(DateTime(timezone=True), nullable=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    failed_at = Column(DateTime(timezone=True), nullable=True)
    error_code = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
