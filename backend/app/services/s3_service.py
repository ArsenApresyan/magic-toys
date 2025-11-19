from app.config import settings
import boto3
from typing import List
from fastapi import UploadFile
from fastapi import HTTPException
class S3Service:
    def __init__(self):
        self.s3_client = boto3.client('s3',
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
            region_name=settings.aws_region
        )
    
    async def upload_images_to_s3(self, images: List[UploadFile], product_id: int) -> List[str]:
        """Upload images to S3"""
        s3_urls = []
        for image in images:
            s3_key = f"products/{product_id}/{image.filename}"
            try:
                self.s3_client.upload_fileobj(
                    image.file,
                    settings.s3_bucket_name,
                    s3_key,
                    ExtraArgs={
                        'ContentType': image.content_type
                    }
                )
                s3_url = f"{settings.s3_base_url}/{s3_key}"
                s3_urls.append(s3_url)
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to upload image to S3: {e}")
            finally:
                image.file.close()
        return s3_urls  