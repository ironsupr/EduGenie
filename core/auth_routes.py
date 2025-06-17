"""
Authentication routes for traditional email/password login
"""
from fastapi import APIRouter, HTTPException, Form, Request, Response, Depends
from fastapi.responses import RedirectResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import logging

from core.auth_service import AuthService
from core.auth_models import LoginRequest, RegisterRequest, UserProfile
from core.config import Settings, get_settings
from core.firestore_client import get_firestore_client

logger = logging.getLogger(__name__)

router = APIRouter()
security = HTTPBearer(auto_error=False)

# Global auth service instance (singleton for development)
_auth_service_instance = None

# Dependency to get auth service
def get_auth_service() -> AuthService:
    """Get auth service instance (singleton)"""
    global _auth_service_instance
    
    print(f"get_auth_service called, instance exists: {_auth_service_instance is not None}")
    
    if _auth_service_instance is None:
        print("Creating new AuthService instance...")
        try:
            settings = get_settings()
            firestore_client = get_firestore_client(
                service_account_path=settings.FIRESTORE_SERVICE_ACCOUNT_PATH,
                project_id=settings.GOOGLE_CLOUD_PROJECT_ID
            )
            _auth_service_instance = AuthService(settings, firestore_client)
        except Exception as e:
            logger.error(f"Failed to initialize auth service: {e}")
            # Return a mock auth service for development
            settings = get_settings()
            _auth_service_instance = AuthService(settings, None)
        print(f"AuthService created, dev mode: {_auth_service_instance.development_mode}")
    else:
        print("Using existing AuthService instance")
    
    return _auth_service_instance

# Dependency to get current user from JWT token
async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    auth_service: AuthService = Depends(get_auth_service)
) -> Optional[UserProfile]:
    """Get current user from JWT token"""
    try:
        print("=== get_current_user called ===")
        logger.info("=== get_current_user called ===")
        
        # Check for token in Authorization header
        token = None
        if credentials:
            token = credentials.credentials
            print(f"Found token in Authorization header: {token[:20]}...")
            logger.info(f"Found token in Authorization header: {token[:20]}...")
        
        # Check for token in cookies
        if not token:
            token = request.cookies.get("session_token")
            if token:
                print(f"Found token in cookies: {token[:20]}...")
                logger.info(f"Found token in cookies: {token[:20]}...")
            else:
                print("No token found in cookies")
                logger.info("No token found in cookies")
        
        if not token:
            print("No token found anywhere")
            logger.info("No token found anywhere")
            return None
        
        # Verify token
        logger.info("Verifying JWT token...")
        payload = auth_service.verify_jwt_token(token)
        if not payload:
            logger.info("JWT token verification failed")
            return None
        
        logger.info(f"JWT verified successfully for user_id: {payload.get('user_id')}")
        
        # Get user from database
        user = await auth_service.get_user_by_id(payload["user_id"])
        if user:
            logger.info(f"User found: {user.email}")
            return user
        else:
            logger.info(f"User not found for user_id: {payload['user_id']}")
            return None
        
    except Exception as e:
        logger.error(f"Error getting current user: {e}")
        return None

@router.post("/api/register")
async def register(
    email: str = Form(...),
    password: str = Form(...),
    full_name: str = Form(...),
    learning_goal: Optional[str] = Form(None),
    experience_level: Optional[str] = Form(None),
    subscription_plan: str = Form("free"),  # Add missing subscription_plan field
    auth_service: AuthService = Depends(get_auth_service)
):
    """Handle traditional email/password registration"""
    try:
        # Create registration request
        register_request = RegisterRequest(
            email=email,
            password=password,
            full_name=full_name,
            learning_goal=learning_goal,
            experience_level=experience_level,
            subscription_plan=subscription_plan  # Include subscription_plan
        )
        
        # Create user
        user = await auth_service.create_user(register_request)
        
        # Create JWT token
        token = auth_service.create_jwt_token(user, remember_me=False)
        
        # Create response with redirect
        response = RedirectResponse(url="/dashboard", status_code=303)
          # Set secure cookie
        response.set_cookie(
            key="session_token",
            value=token,
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite="lax",
            max_age=7 * 24 * 60 * 60  # 7 days
        )
        
        logger.info(f"User registered successfully: {email}")
        return response
        
    except ValueError as e:
        logger.warning(f"Registration failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail="Registration failed")

@router.post("/api/login")
async def login(
    email: str = Form(...),
    password: str = Form(...),
    remember_me: bool = Form(False),
    auth_service: AuthService = Depends(get_auth_service)
):
    """Handle traditional email/password login"""
    try:
        # Create login request
        login_request = LoginRequest(
            email=email,
            password=password,
            remember_me=remember_me
        )
        
        # Authenticate user
        user = await auth_service.authenticate_user(login_request)
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Create JWT token
        token = auth_service.create_jwt_token(user, remember_me=remember_me)
        
        # Create response with redirect
        response = RedirectResponse(url="/dashboard", status_code=303)
          # Set secure cookie
        max_age = 30 * 24 * 60 * 60 if remember_me else 7 * 24 * 60 * 60  # 30 days or 7 days
        response.set_cookie(
            key="session_token",
            value=token,
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite="lax",
            max_age=max_age
        )
        
        logger.info(f"User logged in successfully: {email}")
        return response
        
    except HTTPException:
        raise
    except ValueError as e:
        logger.warning(f"Login failed: {e}")
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Login failed")

@router.post("/api/logout")
async def logout():
    """Handle user logout"""
    response = RedirectResponse(url="/", status_code=303)
    response.delete_cookie(key="session_token")
    return response

@router.post("/api/forgot-password")
async def forgot_password(
    email: str = Form(...),
    auth_service: AuthService = Depends(get_auth_service)
):
    """Handle password reset request"""
    try:
        reset_token = await auth_service.generate_password_reset_token(email)
        
        if reset_token:
            # In a real application, you would send an email with the reset link
            # For now, we'll just log it
            reset_url = f"/reset-password?token={reset_token}"
            logger.info(f"Password reset requested for {email}. Reset URL: {reset_url}")
        
        # Always return success to prevent email enumeration
        return {"message": "If an account with that email exists, a password reset link has been sent."}
        
    except Exception as e:
        logger.error(f"Password reset error: {e}")
        # Still return success to prevent information leakage
        return {"message": "If an account with that email exists, a password reset link has been sent."}

@router.post("/api/reset-password")
async def reset_password(
    token: str = Form(...),
    new_password: str = Form(...),
    auth_service: AuthService = Depends(get_auth_service)
):
    """Handle password reset"""
    try:
        success = await auth_service.reset_password(token, new_password)
        
        if not success:
            raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        
        return RedirectResponse(url="/login?message=password_reset_success", status_code=303)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password reset error: {e}")
        raise HTTPException(status_code=500, detail="Password reset failed")

@router.get("/api/me")
async def get_current_user_info(
    current_user: Optional[UserProfile] = Depends(get_current_user)
):
    """Get current user information"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    return {
        "user_id": current_user.user_id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "avatar_url": current_user.avatar_url,
        "subscription_plan": current_user.subscription_plan,
        "learning_goal": current_user.learning_goal,
        "experience_level": current_user.experience_level
    }

@router.get("/api/user/profile")
async def get_user_profile(
    current_user: Optional[UserProfile] = Depends(get_current_user)
):
    """Get current user profile information (alias for /api/me)"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    return {
        "user_id": current_user.user_id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "avatar_url": current_user.avatar_url,
        "subscription_plan": current_user.subscription_plan,
        "learning_goal": current_user.learning_goal,
        "experience_level": current_user.experience_level,
        "created_at": current_user.created_at.isoformat(),
        "is_active": current_user.is_active,
        "email_verified": current_user.email_verified
    }

# Middleware to check authentication for protected routes
async def require_auth(
    current_user: Optional[UserProfile] = Depends(get_current_user)
) -> UserProfile:
    """Require authentication for protected routes"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return current_user
