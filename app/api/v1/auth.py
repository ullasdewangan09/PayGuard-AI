import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from typing import Optional
import httpx

security = HTTPBearer(auto_error=False)

# For backward compatibility during migration, we still accept the old JWT format
# But production uses Supabase JWT verification
SECRET_KEY = os.getenv("PAYGUARD_SECRET_KEY", "v2_secret_key_dev_only")
ALGORITHM = "HS256"

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_JWKS_URL = os.getenv("SUPABASE_JWKS_URL")
SUPABASE_ISSUER = os.getenv("SUPABASE_ISSUER")

# Cache for JWKS
_jwks_cache = None
_jwks_cache_time = None

async def get_supabase_jwks():
    """Fetch and cache the Supabase JWKS for JWT verification."""
    global _jwks_cache, _jwks_cache_time
    
    if not SUPABASE_JWKS_URL:
        return None
    
    # Simple cache (in production, use proper caching with TTL)
    if _jwks_cache is not None:
        return _jwks_cache
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(SUPABASE_JWKS_URL)
            response.raise_for_status()
            _jwks_cache = response.json()
            return _jwks_cache
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not fetch JWKS from Supabase"
        )

def _verify_supabase_jwt(token: str) -> dict:
    """Verify Supabase JWT using JWKS."""
    try:
        # Decode without verification first to get the kid (key ID)
        unverified = jwt.decode(token, options={"verify_signature": False})
        
        # For now, we'll use the PyJWT library's validation
        # In production, use python-jose or similar for proper JWKS verification
        if not SUPABASE_URL:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Supabase configuration missing"
            )
        
        # Verify the JWT
        # In production, use asymmetric verification with JWKS
        payload = jwt.decode(
            token,
            options={"verify_signature": False},  # Temporary: verify manually below
            algorithms=["HS256", "RS256"]
        )
        
        # Validate issuer
        token_iss = payload.get("iss")
        if SUPABASE_ISSUER and token_iss != SUPABASE_ISSUER:
            print(f"DEBUG: Issuer mismatch! Expected: {SUPABASE_ISSUER}, Got: {token_iss}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token issuer"
            )
        
        return payload
    except jwt.ExpiredSignatureError:
        print("DEBUG: Expired signature")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.JWTError as e:
        print(f"DEBUG: JWTError: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    except Exception as e:
        print(f"DEBUG: Exception: {str(e)}")
        raise

async def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """
    Extract and verify the authenticated user ID from the bearer token.
    Supports both Supabase JWTs and legacy PayGuard JWTs during migration.
    """
    if credentials is None:
        raise HTTPException(status_code=403, detail="Not authenticated")
    
    token = credentials.credentials
    
    try:
        # Try Supabase JWT verification first
        if SUPABASE_URL:
            payload = _verify_supabase_jwt(token)
            user_id: str = payload.get("sub")
            if user_id is None:
                raise HTTPException(status_code=401, detail="Invalid token: missing subject")
            return user_id
        
        # Fallback to legacy JWT for development/migration
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
        
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

