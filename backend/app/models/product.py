from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from datetime import datetime
from app.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional
from app.models.product_media import ProductMedia

class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, index=True)
    description: Mapped[str] = mapped_column(String)
    price: Mapped[float] = mapped_column(Float)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_by_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    updated_by_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    # Relationships
    created_by: Mapped[Optional["User"]] = relationship("User", foreign_keys=[created_by_id])
    updated_by: Mapped[Optional["User"]] = relationship("User", foreign_keys=[updated_by_id])
    orders: Mapped[List["Order"]] = relationship("Order", back_populates="product")
    baskets: Mapped[List["Basket"]] = relationship("Basket", back_populates="product")
    wishlists: Mapped[List["Wishlist"]] = relationship("Wishlist", back_populates="product")
    order_items: Mapped[List["OrderItem"]] = relationship("OrderItem", back_populates="product")
    media: Mapped[List["ProductMedia"]] = relationship("ProductMedia", back_populates="product", cascade="all, delete-orphan")