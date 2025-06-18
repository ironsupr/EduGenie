"""
Minimal authentication service for development
"""
from typing import Optional
import logging
from core.auth_models import UserProfile, LoginRequest, RegisterRequest

logger = logging.getLogger(__name__)

class AuthService:
    """Minimal auth service for development"""
    
    def __init__(self, settings, firestore_client=None):
        self.settings = settings
        self.development_mode = True
        logger.warning("Using minimal AuthService for development")
    
    async def authenticate_user(self, request: LoginRequest) -> Optional[UserProfile]:
        """Mock authentication"""
        return None
    
    async def create_user(self, request: RegisterRequest) -> UserProfile:
        """Mock user creation"""
        raise NotImplementedError("Registration not implemented in dev mode")
    
    async def get_user_by_id(self, user_id: str) -> Optional[UserProfile]:
        """Mock user lookup"""
        return None
    
    def create_jwt_token(self, user: UserProfile, remember_me: bool = False) -> str:
        """Mock JWT creation"""
        return "dev_token_123"
    
    def verify_jwt_token(self, token: str) -> Optional[dict]:
        """Mock JWT verification"""
        return None
