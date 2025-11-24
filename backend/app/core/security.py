import secrets
from jose import jwt
from app.config import settings
from app.models.user import User
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

def create_access_token(user: User) -> str:
    expire_minutes = settings.access_token_expire_minutes or 30
    expire = datetime.utcnow() + timedelta(minutes=expire_minutes)
    # Convert datetime to Unix timestamp (seconds since epoch)
    expire_timestamp = int(expire.timestamp())
    
    payload = {
        "sub": str(user.id),
        "exp": expire_timestamp
    }
    
    secret_key = settings.secret_key
    if not secret_key:
        raise ValueError("SECRET_KEY is not set in environment variables")
    
    algorithm = settings.algorithm or "HS256"
    
    return jwt.encode(
        payload,
        secret_key,
        algorithm=algorithm
    )


#verify access token
def verify_access_token(token: str) -> dict:
    secret_key = settings.secret_key
    if not secret_key:
        raise ValueError("SECRET_KEY is not set in environment variables")
    
    algorithm = settings.algorithm or "HS256"
    
    return jwt.decode(
        token,
        secret_key,
        algorithms=[algorithm]
    )


def create_refresh_token() -> str:
    """
    Generate a secure random refresh token string.
    This token will be stored in the database and associated with a user.
    """
    return secrets.token_urlsafe(32)


async def verify_refresh_token(token: str, db: AsyncSession) -> Optional[User]:
    """
    Verify a refresh token by looking it up in the database.
    
    Args:
        token: The refresh token string to verify
        db: Database session
        
    Returns:
        User object if token is valid, None otherwise
    """
    from app.repositories.user_repository import UserRepository
    
    if not token:
        return None
    
    repository = UserRepository(db)
    user = await repository.get_user_by_refresh_token(token)
    
    if not user:
        return None
    
    # Check if token is expired
    if user.refresh_token_expires_at and user.refresh_token_expires_at < datetime.utcnow():
        return None
    
    return user
