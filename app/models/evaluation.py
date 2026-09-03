from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base
from datetime import datetime, timezone
import uuid

def generate_uuid():
    return f"eval_{uuid.uuid4().hex}"

class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    transaction_id = Column(String, ForeignKey("transactions.id"), nullable=False)
    decision = Column(String, nullable=False) # APPROVE, ASK, BLOCK
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    explanation = Column(String, nullable=True)
    expected_decision = Column(String, nullable=True)

    violations = relationship("ViolationRecord", back_populates="evaluation")
    transaction = relationship("Transaction", back_populates="evaluations")


class ViolationRecord(Base):
    __tablename__ = "violations"

    id = Column(String, primary_key=True, default=lambda: f"viol_{uuid.uuid4().hex}")
    evaluation_id = Column(String, ForeignKey("evaluations.id"), nullable=False)
    code = Column(String, nullable=False)
    constraint = Column(String, nullable=False)
    expected = Column(String, nullable=False)
    actual = Column(String, nullable=False)
    severity = Column(String, nullable=False)

    evaluation = relationship("Evaluation", back_populates="violations")
