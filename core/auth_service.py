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
        self.db = firestore_client
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
            print(f"=== verify_jwt_token called with token: {token[:30]}...")
            if not self.settings.SECRET_KEY:
                print("No SECRET_KEY configured")
                return None
            
            payload = jwt.decode(token, self.settings.SECRET_KEY, algorithms=['HS256'])
            print(f"JWT decoded successfully: {payload.get('user_id')}")
            return payload
            
        except jwt.ExpiredSignatureError:
            print("JWT token has expired")
            logger.warning("JWT token has expired")
            return None
        except jwt.InvalidTokenError as e:
            print(f"Invalid JWT token: {e}")
            logger.warning("Invalid JWT token")
            return None
        except Exception as e:
            print(f"Error verifying JWT token: {e}")
            logger.error(f"Error verifying JWT token: {e}")
            return None
    
    async def authenticate_user(self, request: LoginRequest) -> Optional[UserProfile]:
        """Authenticate user with email/password"""
        try:
            # Development mode - use mock data
            if self.development_mode:
                return await self._dev_authenticate_user(request)
            
            # Production mode would use Firestore here
            return await self._firestore_authenticate_user(request)
            
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
            return await self._firestore_create_user(request)
            
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
            return await self._firestore_get_user_by_id(user_id)
            
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
            
            user_profile = UserProfile(
                user_id=user_id,
                email=test_email,
                full_name="Test User",
                created_at=now,
                updated_at=now,
                last_login=now,
                learning_goal=LearningGoal.SKILL_DEVELOPMENT,
                experience_level=ExperienceLevel.INTERMEDIATE
            )
            
            # Store in dev_users so get_user_by_id can find it
            self.dev_users[user_id] = user_profile.model_dump()
            self.dev_auth[user_id] = {
                "user_id": user_id,
                "email": test_email,
                "provider": AuthProvider.EMAIL,
                "password_hash": self.hash_password(test_password)
            }
            
            return user_profile
        
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
    
    # Firestore production methods
    async def _firestore_authenticate_user(self, request: LoginRequest) -> Optional[UserProfile]:
        """Production mode authentication using Firestore"""
        try:
            # Query user_auth collection for email
            auth_docs = await self.db.query_documents_async(
                collection=self.collection_auth,
                filters=[("email", "==", request.email), ("provider", "==", AuthProvider.EMAIL)]
            )
            
            if not auth_docs:
                return None
                
            auth_data = auth_docs[0]
            
            # Verify password
            if not self.verify_password(request.password, auth_data["password_hash"]):
                return None
                  # Get user profile
            user_doc = await self.db.get_document_async(
                collection=self.collection_users,
                document_id=auth_data["user_id"]
            )
            
            if user_doc:
                # Update last login
                await self.db.update_document_async(
                    collection=self.collection_users,
                    document_id=auth_data["user_id"],
                    data={"last_login": datetime.utcnow()}
                )
                return UserProfile(**user_doc)
                
            return None
            
        except Exception as e:
            logger.error(f"Error in Firestore authentication: {e}")
            return None
    
    async def _firestore_create_user(self, request: RegisterRequest) -> UserProfile:
        """Production mode user creation using Firestore"""
        try:            # Check if user already exists
            existing_auth = await self.db.query_documents_async(
                collection=self.collection_auth,
                filters=[("email", "==", request.email)]
            )
            
            if existing_auth:
                raise ValueError("User with this email already exists")
                
            user_id = str(uuid4())
            now = datetime.utcnow()
            
            # Create user profile
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
              # Store user profile in Firestore
            await self.db.create_document_async(
                collection=self.collection_users,
                document_id=user_id,
                data=user_profile.model_dump()
            )
            
            # Store authentication data
            auth_data = {
                "user_id": user_id,
                "email": request.email,
                "provider": AuthProvider.EMAIL,
                "password_hash": self.hash_password(request.password),
                "created_at": now
            }
            
            await self.db.create_document_async(
                collection=self.collection_auth,
                document_id=f"{user_id}_email",
                data=auth_data
            )
            
            logger.info(f"Created Firestore user: {user_id} ({request.email})")
            return user_profile
            
        except Exception as e:
            logger.error(f"Error creating Firestore user: {e}")
            raise
    
    async def _firestore_get_user_by_id(self, user_id: str) -> Optional[UserProfile]:
        """Production mode user lookup using Firestore"""
        try:
            user_doc = await self.db.get_document_async(
                collection=self.collection_users,
                document_id=user_id
            )
            
            if user_doc:
                return UserProfile(**user_doc)
            return None
            
        except Exception as e:
            logger.error(f"Error getting Firestore user: {e}")
            return None
