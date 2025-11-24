"""
Google OAuth Authentication Endpoints

Following the same pattern as products endpoints:
- Uses dependency injection for services
- Proper error handling with HTTPException
- Response models for type safety
- State parameter for CSRF protection
"""

import time
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, Query, status, Body

from app.schemas.oauth import GoogleAuthResponse, TokenResponse, RefreshTokenRequest

from app.services.oauth_service import OAuthService
from app.services.user_service import UserService

from app.core.security import create_access_token, create_refresh_token, verify_refresh_token
from app.core.dependencies import get_user_service
from app.database import get_db

from app.config import settings
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timedelta
from app.repositories.user_repository import UserRepository


router = APIRouter()

# In-memory state storage (in production, use Redis or database)
# Key: state_token, Value: timestamp or user session info
_oauth_states = {}

@router.get("/google/login", response_model=GoogleAuthResponse)
async def google_login():
    """
    Initiate Google OAuth login flow
    
    Returns authorization URL that user should be redirected to.
    State parameter is generated for CSRF protection.
    """
    oauth_service = OAuthService()
    state = oauth_service.generate_state()
    
    # Store state with timestamp (expires after 10 minutes)
    _oauth_states[state] = time.time()
    
    authorization_url, _ = oauth_service.create_authorization_url(state)
    
    return GoogleAuthResponse(
        authorization_url=authorization_url,
        state=state  # Frontend should store this and send it back
    )


@router.get("/google/callback", response_model=TokenResponse)
async def google_callback(
    code: str = Query(..., description="Authorization code from Google"),
    state: str = Query(..., description="State parameter for CSRF protection"),
    user_service: UserService = Depends(get_user_service),
    db: AsyncSession = Depends(get_db)
):
    """
    Handle Google OAuth callback
    
    Validates state parameter, exchanges code for user info,
    creates/updates user, and returns JWT token.
    """
    # Validate state parameter (CSRF protection)
    if state not in _oauth_states:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid state parameter"
        )
    
    # Check if state is expired (10 minutes)
    if time.time() - _oauth_states[state] > 600:
        del _oauth_states[state]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="State parameter expired"
        )
    
    # Remove used state
    del _oauth_states[state]
    
    try:
        # Fetch user info from Google
        oauth_service = OAuthService()
        user_info = await oauth_service.fetch_user_info(code)
        
        if not user_info or "email" not in user_info:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Failed to fetch user information from Google"
            )
        
        # Get or create user
        user = await user_service.get_or_create_user_from_oauth(
            email=user_info["email"],
            name=user_info.get("name", ""),
            picture=user_info.get("picture", "")
        )
        
        # Generate JWT access token
        access_token = create_access_token(user)
        
        # Generate refresh token
        refresh_token = create_refresh_token()
        refresh_token_expires_at = datetime.utcnow() + timedelta(
            days=settings.refresh_token_expire_days or 30
        )
        
        # Save refresh token to database
        repository = UserRepository(db)
        await repository.update_user_refresh_token(
            user.id, refresh_token, refresh_token_expires_at
        )
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.access_token_expire_minutes * 60 if settings.access_token_expire_minutes else 1800,
            refresh_token_expires_in=(settings.refresh_token_expire_days or 30) * 24 * 60 * 60
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )


@router.post("/auth/refresh", response_model=TokenResponse)
async def refresh_access_token(
    request: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Refresh access token using refresh token
    
    Validates the refresh token and returns a new access token.
    Optionally rotates the refresh token for better security.
    """
    try:
        # Verify refresh token
        user = await verify_refresh_token(request.refresh_token, db)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token"
            )
        
        # Generate new access token
        access_token = create_access_token(user)
        
        # Optionally rotate refresh token (generate new one)
        new_refresh_token = create_refresh_token()
        refresh_token_expires_at = datetime.utcnow() + timedelta(
            days=settings.refresh_token_expire_days or 30
        )
        
        # Update refresh token in database
        from app.repositories.user_repository import UserRepository
        repository = UserRepository(db)
        await repository.update_user_refresh_token(
            user.id, new_refresh_token, refresh_token_expires_at
        )
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=new_refresh_token,
            expires_in=settings.access_token_expire_minutes * 60 if settings.access_token_expire_minutes else 1800,
            refresh_token_expires_in=(settings.refresh_token_expire_days or 30) * 24 * 60 * 60
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token refresh failed: {str(e)}"
        )