from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import Optional

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    database_url: Optional[str] = Field(default=None, env="DATABASE_URL")
    secret_key: Optional[str] = Field(default=None, env="SECRET_KEY")
    algorithm: Optional[str] = Field(default=None, env="ALGORITHM")
    access_token_expire_minutes: Optional[int] = Field(default=None, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    refresh_token_expire_days: Optional[int] = Field(default=30, env="REFRESH_TOKEN_EXPIRE_DAYS")
    debug: Optional[bool] = Field(default=False, env="DEBUG")
    # cors_origins: Optional[list[str]] = Field(default=None, env="CORS_ORIGINS")
    
    # Google OAuth fields
    google_client_id: Optional[str] = Field(default=None, env="GOOGLE_CLIENT_ID")
    google_client_secret: Optional[str] = Field(default=None, env="GOOGLE_CLIENT_SECRET")
    google_redirect_uri: Optional[str] = Field(default=None, env="GOOGLE_REDIRECT_URI")

    # AWS S3 fields
    aws_access_key_id: Optional[str] = Field(default=None, env="AWS_ACCESS_KEY_ID")
    aws_secret_access_key: Optional[str] = Field(default=None, env="AWS_SECRET_ACCESS_KEY")
    aws_region: Optional[str] = Field(default=None, env="AWS_REGION")
    s3_bucket_name: Optional[str] = Field(default=None, env="S3_BUCKET_NAME")
    s3_base_url: Optional[str] = Field(default=None, env="S3_BASE_URL")  # Optional: for CDN

settings = Settings()