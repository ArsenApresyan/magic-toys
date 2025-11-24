#get_user_by_email() — find user by email
#create_user() — create new user
#update_user() — update existing user
#delete_user() — delete user

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List
from datetime import datetime
from app.models.user import User

class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_all(self, skip: int = 0, limit: int = 100) -> List[User]:
        result = await self.db.execute(
            select(User).offset(skip).limit(limit)
        )
        return result.scalars().all()
    
    async def get_user_by_email(self, email: str) -> Optional[User]:
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()
    
    async def get_user_by_id(self, user_id: int) -> Optional[User]:
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def create_user(self, user: User) -> User:
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user
    
    async def update_user(self, user: User) -> User:
        await self.db.commit()
        await self.db.refresh(user)
        return user
    
    async def delete_user(self, user_id: int) -> bool:
        user = await self.get_user_by_id(user_id)
        if not user:
            return False
        self.db.delete(user)
        await self.db.commit()
        return True
    
    async def update_user_refresh_token(self, user_id: int, refresh_token: str, expires_at: datetime) -> Optional[User]:
        """Update user's refresh token and expiration"""
        user = await self.get_user_by_id(user_id)
        if not user:
            return None
        user.refresh_token = refresh_token
        user.refresh_token_expires_at = expires_at
        await self.db.commit()
        await self.db.refresh(user)
        return user
    
    async def get_user_by_refresh_token(self, refresh_token: str) -> Optional[User]:
        """Find user by refresh token"""
        result = await self.db.execute(
            select(User).where(User.refresh_token == refresh_token)
        )
        return result.scalar_one_or_none()
    
    async def revoke_refresh_token(self, user_id: int) -> bool:
        """Revoke user's refresh token by setting it to None"""
        user = await self.get_user_by_id(user_id)
        if not user:
            return False
        user.refresh_token = None
        user.refresh_token_expires_at = None
        await self.db.commit()
        await self.db.refresh(user)
        return True