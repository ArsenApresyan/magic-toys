from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.product_repository import ProductRepository
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse

class ProductService:
    def __init__(self, db: AsyncSession):
        self.repository = ProductRepository(db)
    
    async def create_product(self, product_data: ProductCreate, created_by_id: Optional[int] = None) -> ProductResponse:
        """Create a new product"""
        product = await self.repository.create(product_data, created_by_id=created_by_id)
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
    
    async def update_product(self, product_id: int, product_data: ProductUpdate) -> Optional[ProductResponse]:
        """Update a product"""
        product = await self.repository.update(product_id, product_data)
        if not product:
            return None
        return ProductResponse.model_validate(product)
    
    async def delete_product(self, product_id: int) -> bool:
        """Delete a product"""
        return await self.repository.delete(product_id)