from pydantic import BaseModel
from datetime import datetime

class ProductMediaResponse(BaseModel):
    id: int
    product_id: int
    s3_url: str
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True