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
    
    # Google AI SDK Configuration
    GOOGLE_AI_API_KEY: Optional[str] = None
    
    # AI Model Configuration
    AI_MODEL_TEXT: str = "gemini-1.5-flash"
    AI_MODEL_CHAT: str = "gemini-1.5-flash"
    AI_MODEL_EMBEDDING: str = "text-embedding-004"
    
    # AI Generation Settings
    AI_TEMPERATURE: float = 0.7
    AI_TOP_P: float = 0.8
    AI_TOP_K: int = 40
    AI_MAX_OUTPUT_TOKENS: int = 2048
    
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
    
    # OAuth Configuration
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GITHUB_CLIENT_ID: Optional[str] = None
    GITHUB_CLIENT_SECRET: Optional[str] = None
    SECRET_KEY: Optional[str] = None
    OAUTH_REDIRECT_URI: str = "http://127.0.0.1:8000/auth/callback"
    
    # Database
    DATABASE_URL: str = "sqlite:///./edugenie.db"
    
    # Google Cloud / Firestore Configuration    GOOGLE_CLOUD_PROJECT_ID: Optional[str] = None
    FIRESTORE_SERVICE_ACCOUNT_PATH: Optional[str] = None
    FIRESTORE_COLLECTION_PREFIX: str = ""  # For multi-environment support
    
    # Legacy Firestore settings (for backward compatibility)
    API_KEY: Optional[str] = None
    GOOGLE_CLOUD_PROJECT: Optional[str] = None
    GOOGLE_APPLICATION_CREDENTIALS: Optional[str] = None
    DATABASE_NAME: str = "edugenie"
    ENABLE_ADVANCED_ANALYTICS: bool = True
    ENABLE_REALTIME_FEEDBACK: bool = True
    
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
