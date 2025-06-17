"""
User authentication service with Firestore backend
"""
import secrets
import bcrypt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from uuid import uuid4
import jwt
import logging

from google.cloud import firestore
from core.config import Settings
from core.firestore_client import FirestoreClient
from core.auth_models import (
    UserProfile, UserAuth, SessionToken, LoginRequest, RegisterRequest,
    AuthProvider, UserRole, LearningGoal, ExperienceLevel
)

logger = logging.getLogger(__name__)


class AuthService:
    """User authentication service with Firestore backend"""
    
    def __init__(self, settings: Settings, firestore_client: Optional[FirestoreClient]):
        self.settings = settings
        self.db = firestore_client
        self.collection_users = "users"
        self.collection_auth = "user_auth"
        self.collection_sessions = "user_sessions"
        
        # If no Firestore client, we're in development mode
        self.development_mode = firestore_client is None
        if self.development_mode:
            logger.warning("AuthService running in development mode without Firestore")
            # Mock data for development
            self.dev_users = {}
            self.dev_auth = {}
    
    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt"""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def verify_password(self, password: str, hashed: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    
    def create_jwt_token(self, user: UserProfile, remember_me: bool = False) -> str:
        """Create JWT token for user session"""
        if not self.settings.SECRET_KEY:
            raise ValueError("SECRET_KEY not configured")
        
        expires_in = timedelta(days=30 if remember_me else 7)
        session_id = str(uuid4())
        
        payload = {
            'user_id': user.user_id,
            'email': user.email,
            'name': user.full_name,
            'role': user.role,
            'session_id': session_id,
            'exp': datetime.utcnow() + expires_in,
            'iat': datetime.utcnow()
        }
        
        return jwt.encode(payload, self.settings.SECRET_KEY, algorithm='HS256')
    
    def verify_jwt_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify and decode JWT token"""
        try:
            if not self.settings.SECRET_KEY:
                return None
            
            payload = jwt.decode(token, self.settings.SECRET_KEY, algorithms=['HS256'])
            return payload
            
        except jwt.ExpiredSignatureError:
            logger.warning("JWT token has expired")
            return None
        except jwt.InvalidTokenError:
            logger.warning("Invalid JWT token")
            return None
    
    async def authenticate_user(self, request: LoginRequest) -> Optional[UserProfile]:
        """Authenticate user with email/password"""
        try:
            # Development mode - use mock data
            if self.development_mode:
                return await self._dev_authenticate_user(request)
            
            # Production mode would use Firestore here
            return None
            
        except Exception as e:
            logger.error(f"Error authenticating user: {e}")
            raise
    
    async def create_user(self, request: RegisterRequest) -> UserProfile:
        """Create new user with email/password"""
        try:
            # Development mode - use mock data
            if self.development_mode:
                return await self._dev_create_user(request)
            
            # Production mode would use Firestore here
            raise NotImplementedError("Production mode requires Firestore")
            
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            raise
    
    async def get_user_by_id(self, user_id: str) -> Optional[UserProfile]:
        """Get user by ID"""
        try:
            # Development mode
            if self.development_mode:
                user_data = self.dev_users.get(user_id)
                if user_data:
                    return UserProfile(**user_data)
                return None
            
            # Production mode would use Firestore here
            return None
            
        except Exception as e:
            logger.error(f"Error getting user by ID: {e}")
            return None
    
    # Development mode helper methods
    async def _dev_authenticate_user(self, request: LoginRequest) -> Optional[UserProfile]:
        """Development mode authentication - uses test user"""
        # Create a test user if it doesn't exist
        test_email = "test@edugenie.com"
        test_password = "password123"
        
        if request.email == test_email and request.password == test_password:
            user_id = "dev_user_001"
            now = datetime.utcnow()
            
            return UserProfile(
                user_id=user_id,
                email=test_email,
                full_name="Test User",
                created_at=now,
                updated_at=now,
                last_login=now,
                learning_goal=LearningGoal.SKILL_DEVELOPMENT,
                experience_level=ExperienceLevel.INTERMEDIATE
            )
        
        return None
    
    async def _dev_create_user(self, request: RegisterRequest) -> UserProfile:
        """Development mode user creation"""
        # Check if user already exists in dev mode
        for user_data in self.dev_users.values():
            if user_data.get("email") == request.email:
                raise ValueError("User with this email already exists")
        
        user_id = f"dev_user_{len(self.dev_users) + 1:03d}"
        now = datetime.utcnow()
        
        user_profile = UserProfile(
            user_id=user_id,
            email=request.email,
            full_name=request.full_name,
            created_at=now,
            updated_at=now,
            learning_goal=request.learning_goal,
            experience_level=request.experience_level,
            subscription_plan=request.subscription_plan
        )
        
        # Store in mock data
        self.dev_users[user_id] = user_profile.model_dump()
        self.dev_auth[user_id] = {
            "user_id": user_id,
            "email": request.email,
            "provider": AuthProvider.EMAIL,
            "password_hash": self.hash_password(request.password)
        }
        
        logger.info(f"Created dev user: {user_id} ({request.email})")
        return user_profile
