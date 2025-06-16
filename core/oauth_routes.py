"""
OAuth authentication routes
"""
from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.responses import RedirectResponse, HTMLResponse
from starlette.responses import Response
from typing import Dict, Any
import logging

from core.config import Settings
from core.oauth_service import OAuthService

logger = logging.getLogger(__name__)

# Initialize router
router = APIRouter(prefix="/auth", tags=["authentication"])

# Dependency to get OAuth service
def get_oauth_service() -> OAuthService:
    settings = Settings()
    return OAuthService(settings)

@router.get("/login/{provider}")
async def oauth_login(
    provider: str,
    request: Request,
    oauth_service: OAuthService = Depends(get_oauth_service)
):
    """Initiate OAuth login with specified provider"""
    try:
        if provider not in ['google', 'github']:
            raise HTTPException(status_code=400, detail="Unsupported OAuth provider")
        
        login_url = await oauth_service.get_login_url(provider, request)
        return RedirectResponse(url=login_url)
    
    except Exception as e:
        logger.error(f"OAuth login error for {provider}: {e}")
        raise HTTPException(status_code=500, detail="OAuth login failed")

@router.get("/callback/{provider}")
async def oauth_callback(
    provider: str,
    request: Request,
    oauth_service: OAuthService = Depends(get_oauth_service)
):
    """Handle OAuth callback from provider"""
    try:
        if provider not in ['google', 'github']:
            raise HTTPException(status_code=400, detail="Unsupported OAuth provider")
        
        # Handle the OAuth callback
        auth_result = await oauth_service.handle_callback(provider, request)
        user_info = auth_result['user_info']
        
        # Create JWT token
        token = oauth_service.create_jwt_token({
            'id': user_info['id'],
            'email': user_info['email'],
            'name': user_info['name'],
            'provider': provider
        })
        
        # Here you would typically:
        # 1. Check if user exists in your database
        # 2. Create new user if they don't exist
        # 3. Update user information if they do exist
        # 4. Store any additional user data
        
        # For now, we'll create a success response with the token
        response = RedirectResponse(url="/dashboard", status_code=302)
        
        # Set secure HTTP-only cookie with the JWT token
        response.set_cookie(
            key="auth_token",
            value=token,
            max_age=604800,  # 7 days
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite="lax"
        )
        
        return response
    
    except Exception as e:
        logger.error(f"OAuth callback error for {provider}: {e}")
        # Redirect to login page with error
        return RedirectResponse(url="/login?error=oauth_failed", status_code=302)

@router.get("/logout")
async def logout():
    """Logout user by clearing authentication cookie"""
    response = RedirectResponse(url="/login", status_code=302)
    response.delete_cookie(key="auth_token")
    return response

@router.get("/user")
async def get_current_user(
    request: Request,
    oauth_service: OAuthService = Depends(get_oauth_service)
):
    """Get current authenticated user information"""
    try:
        # Get token from cookie
        token = request.cookies.get("auth_token")
        if not token:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        # Verify token
        user_data = oauth_service.verify_jwt_token(token)
        if not user_data:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        
        return {
            "id": user_data.get("user_id"),
            "email": user_data.get("email"),
            "name": user_data.get("name"),
            "provider": user_data.get("provider")
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get user error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user information")
