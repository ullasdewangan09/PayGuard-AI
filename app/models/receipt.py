from datetime import datetime, timezone
import uuid

from sqlalchemy import Column, DateTime, ForeignKey, JSON, String
from sqlalchemy.orm import relationship

from app.db.database import Base


class Receipt(Base):
    __tablename__ = "receipts"

    id = Column(String, primary_key=True, default=lambda: f"rcpt_{uuid.uuid4().hex}")
    public_id = Column(String, unique=True, index=True, nullable=False, default=lambda: f"r_{uuid.uuid4().hex}")
    receipt_number = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(String, index=True, nullable=False)
    transaction_id = Column(String, ForeignKey("transactions.id"), unique=True, nullable=False)
    amount = Column(String, nullable=False)
    currency = Column(String, nullable=False)
    payment_method = Column(String, nullable=True)
    status = Column(String, default="READY", nullable=False)
    receipt_jsonb = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    transaction = relationship("Transaction")
