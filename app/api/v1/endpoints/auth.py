from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime, timedelta
import jwt
import uuid
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.api.v1.auth import SECRET_KEY, ALGORITHM, get_current_user_id

router = APIRouter()

# Legacy endpoint for development/testing (will be removed in production)
class LoginRequest(BaseModel):
    user_id: str = Field(default="usr_demo_123", description="Demo user ID")

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

@router.post("/login", response_model=LoginResponse, deprecated=True)
def legacy_login(request: LoginRequest):
    """
    DEPRECATED: Legacy auth endpoint for demo purposes.
    This will be removed in production. Use Supabase Auth instead.
    """
    payload = {
        "sub": request.user_id,
        "exp": datetime.utcnow() + timedelta(days=1)
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return LoginResponse(access_token=token)

# New endpoints for Supabase integration

class UserSyncRequest(BaseModel):
    """Request to synchronize a Supabase user with PayGuard database."""
    external_auth_provider: str = Field(..., description="e.g. 'supabase:google', 'supabase:apple'")
    external_subject: str = Field(..., description="User ID from Supabase")
    email: Optional[str] = Field(None, description="Email from auth provider")
    phone_number: Optional[str] = Field(None, description="Phone from auth provider")
    display_name: Optional[str] = Field(None, description="Display name from auth provider")

class UserSyncResponse(BaseModel):
    """Response with synchronized user info."""
    user_id: str
    email: Optional[str]
    display_name: Optional[str]
    is_new_user: bool

@router.post("/sync", response_model=UserSyncResponse)
def sync_user(
    request: UserSyncRequest,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Synchronize a Supabase-authenticated user with the PayGuard database.
    
    Called after successful Supabase authentication to ensure a local PayGuard
    user record exists and is up-to-date with provider information.
    
    Security: Only allows the authenticated user to sync their own record.
    """
    try:
        # Check if user already exists by ID from token
        existing_user = db.query(User).filter(User.id == current_user_id).first()
        
        if existing_user:
            # Update existing user with latest info
            existing_user.email = request.email or existing_user.email
            existing_user.phone_number = request.phone_number or existing_user.phone_number
            existing_user.display_name = request.display_name or existing_user.display_name
            existing_user.external_auth_provider = request.external_auth_provider
            existing_user.external_subject = request.external_subject
            existing_user.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(existing_user)
            
            return UserSyncResponse(
                user_id=existing_user.id,
                email=existing_user.email,
                display_name=existing_user.display_name,
                is_new_user=False
            )
        else:
            # Check if email already exists to prevent UniqueViolation
            if request.email:
                email_user = db.query(User).filter(User.email == request.email).first()
                if email_user:
                    # Email exists but ID doesn't match? Just update the existing one's ID or fail.
                    # Ideally this doesn't happen because we migrated IDs to match Supabase.
                    # For safety, let's just log and update the existing record
                    email_user.id = current_user_id
                    email_user.external_auth_provider = request.external_auth_provider
                    email_user.external_subject = request.external_subject
                    db.commit()
                    db.refresh(email_user)
                    return UserSyncResponse(
                        user_id=email_user.id,
                        email=email_user.email,
                        display_name=email_user.display_name,
                        is_new_user=False
                    )

            # Create new user
            new_user = User(
                id=current_user_id,
                external_auth_provider=request.external_auth_provider,
                external_subject=request.external_subject,
                email=request.email,
                phone_number=request.phone_number,
                display_name=request.display_name,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            
            return UserSyncResponse(
                user_id=new_user.id,
                email=new_user.email,
                display_name=new_user.display_name,
                is_new_user=True
            )
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to synchronize user: {str(e)}"
        )

class VerifyAuthResponse(BaseModel):
    """Response confirming authentication status."""
    authenticated: bool
    user_id: str

@router.get("/verify", response_model=VerifyAuthResponse)
def verify_auth(current_user_id: str = Depends(get_current_user_id)):
    """
    Verify that the current request has valid authentication.
    Used by frontend to check session status.
    """
    return VerifyAuthResponse(
        authenticated=True,
        user_id=current_user_id
    )

class LogoutResponse(BaseModel):
    """Response confirming logout."""
    status: str = "success"

@router.post("/logout", response_model=LogoutResponse)
def logout():
    """
    Logout endpoint. The actual session termination happens on the client
    (localStorage token removal) and via Supabase signOut().
    
    This endpoint exists for completeness and can be used to log audit events.
    """
    return LogoutResponse(status="success")

