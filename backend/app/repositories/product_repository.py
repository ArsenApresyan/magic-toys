from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from typing import List, Optional
from app.models.product import Product as ProductModel
from app.models.product_media import ProductMedia as ProductMediaModel
from app.schemas.product import ProductCreate, ProductUpdate
from datetime import datetime
class ProductRepository:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create(self, product_data: ProductCreate, created_by_id: Optional[int] = None) -> ProductModel:
        """Create a new product"""
        product_dict = product_data.model_dump()
        if created_by_id is not None:
            product_dict["created_by_id"] = created_by_id
        product = ProductModel(**product_dict)
        self.db.add(product)
        await self.db.commit()
        await self.db.refresh(product)
        # Reload with relationship to include created_by
        return await self.get_by_id(product.id)

    async def get_by_id(self, product_id: int) -> Optional[ProductModel]:
        """Get product by ID"""
        result = await self.db.execute(
            select(ProductModel)
            .options(
                selectinload(ProductModel.created_by),
                selectinload(ProductModel.media)
            )
            .where(ProductModel.id == product_id)
        )
        return result.scalar_one_or_none()
    
    async def get_all(self, skip: int = 0, limit: int = 100) -> List[ProductModel]:
        """Get all products with pagination"""
        result = await self.db.execute(
            select(ProductModel)
            .options(
                selectinload(ProductModel.created_by),
                selectinload(ProductModel.media)
            )
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def update(self, product_id: int, product_data: ProductUpdate, updated_by_id: Optional[int] = None) -> Optional[ProductModel]:
        """Update a product"""
        product = await self.get_by_id(product_id)
        if not product:
            return None
        
        # Update only provided fields (exclude_unset=True means only fields that were explicitly set)
        update_data = product_data.model_dump(exclude_unset=True)
        if updated_by_id is not None:
            update_data["updated_by_id"] = updated_by_id
            
        # Set each field individually
        for field, value in update_data.items():
            setattr(product, field, value)
        
        product.updated_at = datetime.now()
        await self.db.commit()
        await self.db.refresh(product)
        # Reload with relationships to ensure we have the latest data
        return await self.get_by_id(product_id)
    
    async def delete(self, product_id: int) -> bool:
        """Delete a product"""
        # Get product with media loaded
        product = await self.get_by_id(product_id)
        if not product:
            return False
        
        # Delete related media first (explicit delete to ensure it works)
        # The cascade should handle this, but explicit delete is more reliable
        media_delete_stmt = delete(ProductMediaModel).where(ProductMediaModel.product_id == product_id)
        await self.db.execute(media_delete_stmt)
        
        # Now delete the product
        product_delete_stmt = delete(ProductModel).where(ProductModel.id == product_id)
        result = await self.db.execute(product_delete_stmt)
        await self.db.commit()
        
        # Return True if a row was deleted
        return result.rowcount > 0