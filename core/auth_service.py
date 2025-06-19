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

# Shared development mode storage (persists across instances)
_dev_users_store = {}
_dev_auth_store = {}

class AuthService:
    """User authentication service with Firestore backend"""
    
    def __init__(self, settings: Settings, firestore_client: Optional[FirestoreClient]):
        self.settings = settings
        self.db = firestore_client.db if firestore_client else None
        self.collection_users = "users"
        self.collection_auth = "user_auth"
        self.collection_sessions = "user_sessions"
        
        # If no Firestore client, we're in development mode
        self.development_mode = firestore_client is None
        if self.development_mode:
            logger.warning("AuthService running in development mode without Firestore")
            # Use shared storage for development mode
            self.dev_users = _dev_users_store
            self.dev_auth = _dev_auth_store
    
    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt"""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def verify_password(self, password: str, hashed: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    
    def create_jwt_token(self, user_id: str, remember_me: bool = False) -> str:
        """Create JWT token for user session"""
        if not self.settings.SECRET_KEY:
            raise ValueError("SECRET_KEY not configured")
        
        expires_in = timedelta(days=30 if remember_me else 7)
        session_id = str(uuid4())
        
        payload = {
            'user_id': user_id,
            'exp': datetime.utcnow() + expires_in,
            'iat': datetime.utcnow(),
            'session_id': session_id
        }
        return jwt.encode(payload, self.settings.SECRET_KEY, algorithm='HS256')
    
    def verify_jwt_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify and decode JWT token"""
        try:
            if not self.settings.SECRET_KEY:
                logger.error("SECRET_KEY not configured")
                return None
            
            payload = jwt.decode(token, self.settings.SECRET_KEY, algorithms=['HS256'])
            return payload
            
        except jwt.ExpiredSignatureError:
            logger.warning("JWT token has expired")
            return None
        except jwt.InvalidTokenError:
            logger.warning("Invalid JWT token")
            return None
        except Exception as e:
            logger.error(f"Error verifying JWT token: {e}")
            return None
    
    def get_user_by_id(self, user_id: str) -> Optional[UserProfile]:
        """Get user profile by user ID"""
        if self.development_mode:
            user_data = self.dev_users.get(user_id)
            return UserProfile(**user_data) if user_data else None

        try:
            user_doc = self.db.collection(self.collection_users).document(user_id).get()
            if user_doc.exists:
                return UserProfile(**user_doc.to_dict())
            return None
        except Exception as e:
            logger.error(f"Error getting user by ID '{user_id}': {e}")
            return None

    def get_user_by_email(self, email: str) -> Optional[UserProfile]:
        """Get user profile by email"""
        if self.development_mode:
            for user_id, auth_data in self.dev_auth.items():
                if auth_data.get("email") == email:
                    user_data = self.dev_users.get(user_id)
                    return UserProfile(**user_data) if user_data else None
            return None

        try:
            query = self.db.collection(self.collection_auth).where("email", "==", email).limit(1)
            docs = list(query.stream())
            
            if not docs:
                return None
            
            auth_data = docs[0].to_dict()
            user_id = auth_data.get("user_id")
            if not user_id:
                return None
                
            return self.get_user_by_id(user_id)
        except Exception as e:
            logger.error(f"Error getting user by email '{email}': {e}")
            return None

    def create_user(self, request: RegisterRequest) -> Optional[UserProfile]:
        """Create a new user"""
        user_id = str(uuid4())
        hashed_password = self.hash_password(request.password)
        now = datetime.utcnow()
        
        user_profile = UserProfile(
            user_id=user_id,
            full_name=request.full_name,
            email=request.email,
            created_at=now,
            updated_at=now,
        )
        
        user_auth = UserAuth(
            user_id=user_id,
            email=request.email,
            password_hash=hashed_password,
            provider=AuthProvider.EMAIL,
            created_at=now,
            updated_at=now,
        )

        if self.development_mode:
            self.dev_users[user_id] = user_profile.model_dump()
            self.dev_auth[user_id] = user_auth.model_dump()
            return user_profile

        try:
            self.db.collection(self.collection_users).document(user_id).set(user_profile.model_dump())
            self.db.collection(self.collection_auth).document(f"{user_id}_email").set(user_auth.model_dump())
            return user_profile
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            return None

    def authenticate_user(self, email: str, password: str) -> Optional[UserProfile]:
        """Authenticate user with email and password"""
        if self.development_mode:
            user = self.get_user_by_email(email)
            if not user:
                return None
            
            auth_data = self.dev_auth.get(user.user_id)
            if auth_data and self.verify_password(password, auth_data.get("hashed_password")):
                return user
            return None

        try:
            query = self.db.collection(self.collection_auth).where("email", "==", email).limit(1)
            docs = list(query.stream())

            if not docs:
                return None
            
            auth_data = docs[0].to_dict()
            if self.verify_password(password, auth_data.get("password_hash")):
                user_id = auth_data.get("user_id")
                return self.get_user_by_id(user_id)
            return None
        except Exception as e:
            logger.error(f"Error authenticating user '{email}': {e}")
            return None
