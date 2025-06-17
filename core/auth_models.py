"""
User authentication models for EduGenie
"""
from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, EmailStr
from enum import Enum

class AuthProvider(str, Enum):
    """Authentication provider types"""
    EMAIL = "email"
    GOOGLE = "google"
    GITHUB = "github"

class UserRole(str, Enum):
    """User role types"""
    STUDENT = "student"
    INSTRUCTOR = "instructor"
    ADMIN = "admin"

class LearningGoal(str, Enum):
    """Primary learning goals"""
    SKILL_DEVELOPMENT = "skill_development"
    CAREER_ADVANCEMENT = "career_advancement"
    ACADEMIC_SUPPORT = "academic_support"
    EXAM_PREPARATION = "exam_preparation"
    PERSONAL_INTEREST = "personal_interest"

class ExperienceLevel(str, Enum):
    """User experience levels"""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"

class UserProfile(BaseModel):
    """User profile data model"""
    user_id: str
    email: EmailStr
    full_name: str
    avatar_url: Optional[str] = None
    role: UserRole = UserRole.STUDENT
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None
    is_active: bool = True
    email_verified: bool = False
    
    # Learning preferences
    learning_goal: Optional[LearningGoal] = None
    experience_level: Optional[ExperienceLevel] = None
    preferred_subjects: List[str] = []
    study_time_preference: Optional[str] = None  # morning, afternoon, evening
    
    # Subscription info
    subscription_plan: str = "starter"  # starter, pro, enterprise
    subscription_expires: Optional[datetime] = None
    
    # OAuth providers
    oauth_providers: Dict[str, Dict[str, Any]] = {}
    
    # Settings
    settings: Dict[str, Any] = {
        "notifications_enabled": True,
        "email_notifications": True,
        "dark_mode": False,
        "language": "en"
    }

class UserAuth(BaseModel):
    """User authentication data"""
    user_id: str
    email: EmailStr
    provider: AuthProvider
    provider_id: Optional[str] = None  # OAuth provider user ID
    password_hash: Optional[str] = None  # For email auth
    password_reset_token: Optional[str] = None
    password_reset_expires: Optional[datetime] = None
    login_attempts: int = 0
    locked_until: Optional[datetime] = None

class SessionToken(BaseModel):
    """JWT session token data"""
    user_id: str
    email: str
    name: str
    provider: AuthProvider
    role: UserRole
    issued_at: datetime
    expires_at: datetime
    session_id: str

class LoginRequest(BaseModel):
    """Login request data"""
    email: EmailStr
    password: str
    remember_me: bool = False

class RegisterRequest(BaseModel):
    """Registration request data"""
    email: EmailStr
    password: str
    full_name: str
    learning_goal: Optional[LearningGoal] = None
    experience_level: Optional[ExperienceLevel] = None
    subscription_plan: str = "free"  # Changed from "starter" to "free"
