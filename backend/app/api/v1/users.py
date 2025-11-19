from fastapi import APIRouter, Depends
from app.services.user_service import UserService
from app.core.dependencies import get_user_service
from typing import List
from app.schemas.user import UserResponse
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    service: UserService = Depends(get_user_service)
):
    users = await service.get_all(skip=skip, limit=limit)
    return users


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user)
):
    """Get current authenticated user"""
    return current_user