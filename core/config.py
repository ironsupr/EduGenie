"""
Application configuration settings
"""
from pydantic_settings import BaseSettings
from typing import List, Optional
from datetime import datetime

class Settings(BaseSettings):
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
    
    # Monitoring
    HEALTH_CHECK_INTERVAL: int = 300  # 5 minutes
    LOG_LEVEL: str = "INFO"
    
    # Time Settings
    TIMEZONE: str = "UTC"
    CREATED_AT: datetime = datetime.now()
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create settings instance
settings = Settings()
