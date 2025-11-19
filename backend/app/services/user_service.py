from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.user_repository import UserRepository
from app.models.user import User

class UserService:
    """Service layer for user operations following the same pattern as ProductService"""
    
    def __init__(self, db: AsyncSession):
        self.repository = UserRepository(db)
    
    async def get_all(self, skip: int = 0, limit: int = 100) -> List[User]:
        """Get all users"""
        return await self.repository.get_all(skip=skip, limit=limit)
    
    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        return await self.repository.get_user_by_email(email)
    
    async def get_user_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID"""
        return await self.repository.get_user_by_id(user_id)
    
    async def create_user_from_oauth(self, email: str, name: str, picture: str) -> User:
        """Create a new user from OAuth data"""
        user = User(
            email=email,
            name=name,
            picture=picture
        )
        return await self.repository.create_user(user)
    
    async def update_user_from_oauth(self, user: User, name: str, picture: str) -> User:
        """Update user information from OAuth data"""
        user.name = name
        user.picture = picture
        return await self.repository.update_user(user)
    
    async def get_or_create_user_from_oauth(self, email: str, name: str, picture: str) -> User:
        """Get existing user or create new one from OAuth data"""
        user = await self.get_user_by_email(email)
        if not user:
            return await self.create_user_from_oauth(email, name, picture)
        else:
            return await self.update_user_from_oauth(user, name, picture)
