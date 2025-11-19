from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.models.product_media import ProductMedia as ProductMediaModel

class ProductMediaRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_multiple(self, product_id: int, s3_urls: List[str]) -> List[ProductMediaModel]:
        """Create multiple product media records"""
        if not s3_urls:
            return []
        
        try:
            product_media = []
            for s3_url in s3_urls:
                product_media.append(ProductMediaModel(product_id=product_id, s3_url=s3_url))
            
            self.db.add_all(product_media)
            await self.db.commit()
            
            # Refresh to get IDs
            for media in product_media:
                await self.db.refresh(media)
            
            return product_media
        except Exception as e:
            await self.db.rollback()
            raise
    
    async def get_all(self, skip: int = 0, limit: int = 100) -> List[ProductMediaModel]:
        """Get all product media records with pagination"""
        result = await self.db.execute(
            select(ProductMediaModel)
            .offset(skip)
            .limit(limit)
            .order_by(ProductMediaModel.created_at.desc())
        )
        return result.scalars().all()
    
    async def get_by_product_id(self, product_id: int) -> List[ProductMediaModel]:
        """Get all media records for a specific product"""
        result = await self.db.execute(
            select(ProductMediaModel)
            .where(ProductMediaModel.product_id == product_id)
            .order_by(ProductMediaModel.created_at.desc())
        )
        return result.scalars().all()
