from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from app.api.v1 import auth, users, products

# FastAPI app
app = FastAPI(
    title="E-Commerce API",
    version="1.0.0",
    description="A scalable e-commerce API with user management, products, orders, wishlist, and basket"
)

#base route
@app.get("/")
async def read_root():
    return {"message": "Welcome to the E-Commerce API"}


# Include routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(products.router, prefix="/products", tags=["products"])