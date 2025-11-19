from jose import jwt
from app.config import settings
from app.models.user import User
from datetime import datetime, timedelta

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

