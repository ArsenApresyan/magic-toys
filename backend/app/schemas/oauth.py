"""
OAuth Schemas

Following the same pattern as product schemas:
- BaseModel for validation
- Clear naming conventions
- Proper type hints
"""

from pydantic import BaseModel

class GoogleAuthResponse(BaseModel):
    """Response containing Google OAuth authorization URL"""
    authorization_url: str
    state: str  # State token for CSRF protection

class TokenResponse(BaseModel):
    """Response containing JWT access token"""
    access_token: str
    token_type: str = "Bearer"
    expires_in: int