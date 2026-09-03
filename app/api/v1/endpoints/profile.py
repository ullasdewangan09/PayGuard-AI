from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any

from app.db.database import get_db
from app.models.user import User
from app.api.v1.auth import get_current_user_id

router = APIRouter()

@router.get("/")
async def get_profile(
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get the current authenticated user's profile.
    """
    user = db.query(User).filter(User.id == current_user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {
        "id": user.id,
        "email": user.email,
        "display_name": user.display_name,
        "phone_number": user.phone_number,
        "avatar_url": user.avatar_url,
        "whatsapp_number": user.whatsapp_number,
        "email_enabled": user.email_enabled,
        "sms_enabled": user.sms_enabled,
        "whatsapp_enabled": user.whatsapp_enabled,
        "created_at": user.created_at,
        "updated_at": user.updated_at
    }

@router.put("/")
async def update_profile(
    profile_data: Dict[str, Any] = Body(...),
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Update the current authenticated user's profile.
    """
    user = db.query(User).filter(User.id == current_user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Allowed fields for update
    allowed_fields = [
        "display_name", 
        "phone_number", 
        "avatar_url", 
        "whatsapp_number",
        "email_enabled",
        "sms_enabled",
        "whatsapp_enabled"
    ]
    
    for field in allowed_fields:
        if field in profile_data:
            setattr(user, field, profile_data[field])
            
    # Email and sensitive fields updates should be handled by a separate endpoint 
    # requiring step-up verification (implemented in security.py)
            
    db.commit()
    db.refresh(user)
    
    return {
        "id": user.id,
        "email": user.email,
        "display_name": user.display_name,
        "phone_number": user.phone_number,
        "avatar_url": user.avatar_url,
        "whatsapp_number": user.whatsapp_number,
        "email_enabled": user.email_enabled,
        "sms_enabled": user.sms_enabled,
        "whatsapp_enabled": user.whatsapp_enabled,
        "created_at": user.created_at,
        "updated_at": user.updated_at
    }
