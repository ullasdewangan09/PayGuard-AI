from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from pydantic import BaseModel
import random
import time
from typing import Dict

from app.db.database import get_db
from app.models.user import User
from app.api.v1.auth import get_current_user_id

router = APIRouter()

# In-memory store for OTPs (in production, use Redis)
# format: { user_id: { "code": "123456", "expires_at": timestamp } }
otp_store: Dict[str, Dict[str, any]] = {}

class OTPVerifyRequest(BaseModel):
    code: str

@router.get("/status")
async def get_security_status(
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get the current security settings for the user.
    """
    user = db.query(User).filter(User.id == current_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {
        "two_factor_enabled": user.two_factor_enabled
    }

@router.post("/2fa/setup")
async def setup_2fa(
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Initiate 2FA setup by sending an OTP to the user's email.
    """
    user = db.query(User).filter(User.id == current_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.two_factor_enabled:
        raise HTTPException(status_code=400, detail="2FA is already enabled")
        
    # Generate 6-digit OTP
    code = str(random.randint(100000, 999999))
    
    # Store with 10-minute expiration
    otp_store[current_user_id] = {
        "code": code,
        "expires_at": time.time() + 600
    }
    
    # In a real app, send an email here. For now, we mock it.
    print(f"MOCK EMAIL TO {user.email}: Your PayGuard AI 2FA setup code is {code}")
    
    # For demonstration purposes, we return the code to the frontend so it's easy to test
    # DO NOT do this in production!
    return {
        "message": "OTP sent to your email",
        "mock_code": code  # Remove in production
    }

@router.post("/2fa/verify")
async def verify_2fa(
    req: OTPVerifyRequest,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Verify the OTP and enable 2FA.
    """
    user = db.query(User).filter(User.id == current_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    stored_otp_data = otp_store.get(current_user_id)
    
    if not stored_otp_data:
        raise HTTPException(status_code=400, detail="No pending 2FA setup found")
        
    if time.time() > stored_otp_data["expires_at"]:
        del otp_store[current_user_id]
        raise HTTPException(status_code=400, detail="OTP has expired")
        
    if req.code != stored_otp_data["code"]:
        raise HTTPException(status_code=400, detail="Invalid OTP code")
        
    # Success! Enable 2FA
    user.two_factor_enabled = True
    db.commit()
    db.refresh(user)
    
    # Clear the OTP
    del otp_store[current_user_id]
    
    return {
        "message": "2FA successfully enabled",
        "two_factor_enabled": True
    }

@router.post("/2fa/disable")
async def disable_2fa(
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Disable 2FA. In a real app, this should also require an OTP verification first.
    For this demo, we'll allow immediate disabling.
    """
    user = db.query(User).filter(User.id == current_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.two_factor_enabled = False
    db.commit()
    db.refresh(user)
    
    return {
        "message": "2FA successfully disabled",
        "two_factor_enabled": False
    }
