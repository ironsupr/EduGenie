from fastapi import Depends, Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import logging

from core.auth_service import AuthService
from core.auth_models import UserProfile
from core.config import get_settings
from core.firestore_client import get_firestore_client

logger = logging.getLogger(__name__)

security = HTTPBearer(auto_error=False)

# Global auth service instance
_auth_service_instance = None

def get_auth_service() -> AuthService:
    """Dependency to get a singleton AuthService instance."""
    global _auth_service_instance
    if _auth_service_instance is None:
        try:
            settings = get_settings()
            firestore_client = get_firestore_client(
                service_account_path=settings.FIRESTORE_SERVICE_ACCOUNT_PATH,
                project_id=settings.GOOGLE_CLOUD_PROJECT_ID
            )
            _auth_service_instance = AuthService(settings, firestore_client)
        except Exception as e:
            logger.error(f"Failed to initialize auth service: {e}")
            settings = get_settings()
            _auth_service_instance = AuthService(settings, None) # Fallback for dev
    return _auth_service_instance

def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    auth_service: AuthService = Depends(get_auth_service)
) -> Optional[UserProfile]:
    """
    Dependency to get the current user from a JWT token.
    Checks for the token in the Authorization header and request cookies.
    """
    token = None
    if credentials:
        token = credentials.credentials
    
    if not token:
        token = request.cookies.get("session_token")

    if not token:
        return None

    try:
        payload = auth_service.verify_jwt_token(token)
        if not payload:
            return None
        
        user_id = payload.get("user_id")
        if not user_id:
            return None
            
        user = auth_service.get_user_by_id(user_id)
        return user
    except Exception as e:
        logger.error(f"Error getting current user: {e}")
        return None
