from typing import List, Optional
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.product_repository import ProductRepository
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.schemas.product_media import ProductMediaResponse
from fastapi import UploadFile
from app.services.s3_service import S3Service
from app.repositories.product_media_repository import ProductMediaRepository
class ProductService:
    def __init__(self, db: AsyncSession):
        self.repository = ProductRepository(db)
        self.media_repository = ProductMediaRepository(db)
        self.s3_service = S3Service()


    async def create_product_with_media(self, product_data: ProductCreate, created_by_id: Optional[int] = None, images: List[UploadFile] = None) -> ProductResponse:
        """Create a new product with media"""

        # 1. Create product
        product = await self.repository.create(product_data, created_by_id=created_by_id)

        # 2. Upload to S3 and get URLs
        s3_urls = await self.s3_service.upload_images_to_s3(images, product.id)

        # 3. Create media records
        product_media = await self.media_repository.create_multiple(product_id=product.id, s3_urls=s3_urls)

        # 4. Reload product to include newly created media
        if not product_media:
            raise HTTPException(status_code=500, detail="Failed to create product media")
        
        product = await self.repository.get_by_id(product.id)

        # 5. Return product with media
        return ProductResponse.model_validate(product)
    
    
    async def get_product(self, product_id: int) -> Optional[ProductResponse]:
        """Get product by ID"""
        product = await self.repository.get_by_id(product_id)
        if not product:
            return None
        return ProductResponse.model_validate(product)
    
    async def get_products(self, skip: int = 0, limit: int = 100) -> List[ProductResponse]:
        """Get all products"""
        products = await self.repository.get_all(skip=skip, limit=limit)
        return [ProductResponse.model_validate(product) for product in products]
    
    async def update_product(self, product_id: int, product_data: ProductUpdate, updated_by_id: Optional[int] = None) -> Optional[ProductResponse]:
        """Update a product"""
        product = await self.repository.update(product_id, product_data, updated_by_id=updated_by_id)
        if not product:
            return None
        return ProductResponse.model_validate(product)
    
    async def delete_product(self, product_id: int) -> bool:
        """Delete a product"""
        return await self.repository.delete(product_id)
    
    async def get_all_media(self, skip: int = 0, limit: int = 100) -> List[ProductMediaResponse]:
        """Get all product media records"""
        media_records = await self.media_repository.get_all(skip=skip, limit=limit)
        return [ProductMediaResponse.model_validate(media) for media in media_records]
    
    async def get_product_media(self, product_id: int) -> List[ProductMediaResponse]:
        """Get all media records for a specific product"""
        media_records = await self.media_repository.get_by_product_id(product_id)
        return [ProductMediaResponse.model_validate(media) for media in media_records]