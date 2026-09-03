from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, String

from app.db.database import Base


class WebhookEvent(Base):
    __tablename__ = "webhook_events"

    event_key = Column(String, primary_key=True, index=True)
    provider = Column(String, default="razorpay", nullable=False)
    event_type = Column(String, index=True, nullable=False)
    processed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
