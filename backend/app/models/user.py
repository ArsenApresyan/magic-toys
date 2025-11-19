from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from app.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List

#for google oauth2 we need to have all necessary fields for the user like email, name, picture, etc use Mapped and mapped_column instead of Column  
class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    name: Mapped[str] = mapped_column(String)
    picture: Mapped[str] = mapped_column(String)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    
    # Relationships
    orders: Mapped[List["Order"]] = relationship("Order", back_populates="user")
    baskets: Mapped[List["Basket"]] = relationship("Basket", back_populates="user")
    wishlists: Mapped[List["Wishlist"]] = relationship("Wishlist", back_populates="user")