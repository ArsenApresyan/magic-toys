from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.schemas.user import UserResponse
from app.schemas.product_media import ProductMediaResponse

class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    is_active: bool = True

class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    is_active: Optional[bool] = None

class ProductResponse(ProductBase):
    id: int
    created_by_id: Optional[int] = None
    created_by: Optional[UserResponse] = None
    created_at: datetime
    updated_at: datetime
    media: Optional[List[ProductMediaResponse]] = None
    class Config:
        from_attributes = True