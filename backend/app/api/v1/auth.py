"""
Google OAuth Authentication Endpoints

Following the same pattern as products endpoints:
- Uses dependency injection for services
- Proper error handling with HTTPException
- Response models for type safety
- State parameter for CSRF protection
"""

import time
from fastapi import APIRouter, HTTPException, Depends, Query, status

from app.schemas.oauth import GoogleAuthResponse, TokenResponse

from app.services.oauth_service import OAuthService
from app.services.user_service import UserService

from app.core.security import create_access_token
from app.core.dependencies import get_user_service

from app.config import settings


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
    user_service: UserService = Depends(get_user_service)
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
        
        # Generate JWT token
        access_token = create_access_token(user)
        
        return TokenResponse(
            access_token=access_token,
            expires_in=settings.access_token_expire_minutes * 60 if settings.access_token_expire_minutes else 1800
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )