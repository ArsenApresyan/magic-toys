from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from typing import List, Optional
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.schemas.product_media import ProductMediaResponse
from app.services.product_service import ProductService
from app.core.dependencies import get_product_service, get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[ProductResponse])
async def list_products(
    skip: int = 0,
    limit: int = 100,
    service: ProductService = Depends(get_product_service)
):
    """Get all products with pagination"""
    products = await service.get_products(skip=skip, limit=limit)
    return products

@router.get("/media", response_model=List[ProductMediaResponse])
async def list_all_media(
    skip: int = 0,
    limit: int = 100,
    service: ProductService = Depends(get_product_service)
):
    """Get all product media records across all products"""
    media_records = await service.get_all_media(skip=skip, limit=limit)
    return media_records

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int,
    service: ProductService = Depends(get_product_service)
):
    """Get product by ID"""
    product = await service.get_product(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {product_id} not found"
        )
    return product

@router.get("/{product_id}/media", response_model=List[ProductMediaResponse])
async def get_product_media(
    product_id: int,
    service: ProductService = Depends(get_product_service)
):
    """Get all media records for a specific product"""
    media_records = await service.get_product_media(product_id)
    return media_records

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_product(
 # Use Form() for each field instead of ProductCreate object
    name: str = Form(..., description="Product name"),
    description: str = Form(..., description="Product description"),
    price: float = Form(..., description="Product price"),
    is_active: bool = Form(True, description="Whether the product is active"),
    # File uploads
    images: List[UploadFile] = File(default=[], description="Product images"),
    current_user: User = Depends(get_current_user),
    service: ProductService = Depends(get_product_service)
):
    # Create ProductCreate object from Form fields
    product_data = ProductCreate(
        name=name,
        description=description,
        price=price,
        is_active=is_active
    )
    """Create a new product"""
    product = await service.create_product_with_media(product_data, created_by_id=current_user.id, images=images)
    return product

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_data: ProductUpdate,
    current_user: User = Depends(get_current_user),
    service: ProductService = Depends(get_product_service)
):
    """Update a product"""
    product = await service.update_product(product_id, product_data, updated_by_id=current_user.id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {product_id} not found"
        )
    return product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    current_user: User = Depends(get_current_user),
    service: ProductService = Depends(get_product_service)
):
    """Delete a product"""
    deleted = await service.delete_product(product_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {product_id} not found"
        )
    return None