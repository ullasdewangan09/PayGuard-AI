from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.database import Base
from datetime import datetime
import uuid

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, default=lambda: f"txn_{uuid.uuid4().hex}")
    intent_id = Column(String, ForeignKey("intents.id"), nullable=False)
    agent_id = Column(String, nullable=False)
    status = Column(String, default="PENDING")
    transaction_jsonb = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    razorpay_order_id = Column(String, nullable=True)
    razorpay_payment_id = Column(String, nullable=True)
    payment_status = Column(String, default="CREATED")
    payment_method = Column(String, nullable=True)
    payment_metadata = Column(JSON, nullable=True)
    payment_failure_code = Column(String, nullable=True)
    payment_failure_reason = Column(String, nullable=True)
    authorized_at = Column(DateTime, nullable=True)
    captured_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    evaluations = relationship("Evaluation", back_populates="transaction")
