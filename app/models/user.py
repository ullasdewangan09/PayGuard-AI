from sqlalchemy import Boolean, Column, String, DateTime, Index
from app.db.database import Base
from datetime import datetime
import uuid

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: f"usr_{uuid.uuid4().hex}")
    
    # External authentication provider mapping
    external_auth_provider = Column(String, nullable=True, index=True)  # e.g., "supabase:google", "supabase:apple"
    external_subject = Column(String, nullable=True, index=True)  # Stable user ID from auth provider
    
    # User identity fields
    email = Column(String, unique=True, index=True, nullable=True)  # Made nullable for OAuth flows
    phone_number = Column(String, nullable=True)
    display_name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    whatsapp_number = Column(String, nullable=True)
    
    # Notification preferences
    email_enabled = Column(Boolean, default=True, nullable=False)
    sms_enabled = Column(Boolean, default=False, nullable=False)
    whatsapp_enabled = Column(Boolean, default=False, nullable=False)
    
    # Security Settings
    two_factor_enabled = Column(Boolean, default=False, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Unique constraint on external provider + subject to prevent duplicates
    __table_args__ = (
        Index('ix_external_auth', 'external_auth_provider', 'external_subject', unique=True),
    )
