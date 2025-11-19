"""
OAuth Service - Handles only OAuth-specific operations
Following single responsibility principle - this service only deals with Google OAuth flow
"""

from authlib.integrations.httpx_client import AsyncOAuth2Client
from app.config import settings
from typing import Tuple
import secrets

# Google OAuth endpoints
GOOGLE_AUTHORIZATION_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://accounts.google.com/o/oauth2/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"

class OAuthService:
    """Service for Google OAuth operations"""
    
    def __init__(self):
        self.client = AsyncOAuth2Client(
            client_id=settings.google_client_id,
            client_secret=settings.google_client_secret,
            scope="openid email profile",
            redirect_uri=settings.google_redirect_uri,
        )
    
    def generate_state(self) -> str:
        """Generate a random state token for CSRF protection"""
        return secrets.token_urlsafe(32)
    
    def create_authorization_url(self, state: str) -> Tuple[str, str]:
        """
        Create Google OAuth authorization URL
        
        Returns:
            Tuple of (authorization_url, state) - state should be stored and validated on callback
        """
        authorization_url, _ = self.client.create_authorization_url(
            GOOGLE_AUTHORIZATION_URL,
            redirect_uri=settings.google_redirect_uri,
            state=state
        )
        return authorization_url, state
    
    async def fetch_user_info(self, code: str) -> dict:
        """
        Exchange authorization code for access token and fetch user info
        
        Args:
            code: Authorization code from Google callback
            
        Returns:
            Dictionary containing user information (email, name, picture, etc.)
            
        Raises:
            Exception: If token exchange or user info fetch fails
        """
        # Exchange code for token
        token = await self.client.fetch_token(
            GOOGLE_TOKEN_URL,
            code=code,
            redirect_uri=settings.google_redirect_uri,
        )
        
        # Fetch user info using the access token
        resp = await self.client.get(GOOGLE_USERINFO_URL)
        resp.raise_for_status()
        return resp.json()