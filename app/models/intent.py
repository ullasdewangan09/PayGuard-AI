from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON
from app.db.database import Base
from datetime import datetime
import uuid

class Intent(Base):
    __tablename__ = "intents"

    id = Column(String, primary_key=True, default=lambda: f"int_{uuid.uuid4().hex}")
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="ACTIVE")
    intent_jsonb = Column(JSON, nullable=False)
    version = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
