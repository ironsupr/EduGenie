"""
Application configuration settings
"""
from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import List, Optional
from datetime import datetime

class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", case_sensitive=True)
    
    # Application Info
    PROJECT_ID: str = "edugenie"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Paths
    TEMPLATES_DIR: str = "frontend/web_app/templates"
    STATIC_DIR: str = "frontend/web_app/static"
    
    # Learning Settings
    MIN_PASS_SCORE: float = 0.7
    MAX_QUIZ_ATTEMPTS: int = 3
    QUIZ_TIME_LIMIT: int = 1800  # 30 minutes in seconds
    
    # Service Settings
    ENABLE_NOTIFICATIONS: bool = True
    ENABLE_AI_FEATURES: bool = True
    
    # Security
    CORS_ORIGINS: List[str] = ["*"]
    API_KEY_HEADER: str = "X-API-Key"
      # Database
    DATABASE_URL: str = "sqlite:///./edugenie.db"
    
    # Google Cloud / Firestore Configuration
    GOOGLE_CLOUD_PROJECT_ID: Optional[str] = None
    FIRESTORE_SERVICE_ACCOUNT_PATH: Optional[str] = None
    FIRESTORE_COLLECTION_PREFIX: str = ""  # For multi-environment support
    
    # Redis (Caching & Background Tasks)
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"
    
    # AI Services
    OPENAI_API_KEY: Optional[str] = None
    
    # Monitoring
    HEALTH_CHECK_INTERVAL: int = 300  # 5 minutes
    LOG_LEVEL: str = "INFO"
    
    # Time Settings
    TIMEZONE: str = "UTC"
    CREATED_AT: datetime = datetime.now()

# Create settings instance
settings = Settings()
