"""
Authentication routes for traditional email/password login
"""
from fastapi import APIRouter, HTTPException, Form, Request, Response, Depends
from fastapi.responses import RedirectResponse, JSONResponse
from typing import Optional
import logging
import json

from core.auth_service import AuthService
from core.auth_models import LoginRequest, RegisterRequest, UserProfile
from core.dependencies import get_auth_service, get_current_user

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/register", response_class=JSONResponse)
def register(
    request: Request,
    full_name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    auth_service: AuthService = Depends(get_auth_service)
):
    """Register a new user"""
    try:
        # Check if user already exists
        if auth_service.get_user_by_email(email):
            return JSONResponse(
                status_code=400,
                content={"message": "Email already registered"}
            )
        
        # Create new user
        register_data = RegisterRequest(
            full_name=full_name,
            email=email,
            password=password
        )
        user = auth_service.create_user(register_data)
        
        if not user:
            return JSONResponse(
                status_code=500,
                content={"message": "Failed to create user"}
            )
            
        # Generate JWT token
        token = auth_service.create_jwt_token(user.user_id)
        
        # Set token in cookie and return success
        response = JSONResponse(content={
            "message": "Registration successful",
            "user": json.loads(user.model_dump_json()),
            "access_token": token
        })
        response.set_cookie(
            key="session_token",
            value=token,
            httponly=True,
            secure=False,  # Set to True in production
            samesite="lax"
        )
        return response

    except Exception as e:
        logger.error(f"Registration error: {e}")
        return JSONResponse(
            status_code=500,
            content={"message": "An unexpected error occurred"}
        )

@router.post("/login", response_class=JSONResponse)
def login(
    request: Request,
    email: str = Form(...),
    password: str = Form(...),
    auth_service: AuthService = Depends(get_auth_service)
):
    """Login a user"""
    try:
        # Authenticate user
        user = auth_service.authenticate_user(email, password)
        if not user:
            return JSONResponse(
                status_code=401,
                content={"message": "Invalid credentials"}
            )
            
        # Generate JWT token
        token = auth_service.create_jwt_token(user.user_id)
        
        # Set token in cookie and return success
        response = JSONResponse(content={
            "message": "Login successful",
            "user": json.loads(user.model_dump_json()),
            "access_token": token
        })
        response.set_cookie(
            key="session_token",
            value=token,
            httponly=True,
            secure=False,  # Set to True in production
            samesite="lax"
        )
        return response

    except Exception as e:
        logger.error(f"Login error: {e}")
        return JSONResponse(
            status_code=500,
            content={"message": "An unexpected error occurred"}
        )

@router.get("/logout", response_class=RedirectResponse)
async def logout(request: Request):
    """Logout a user"""
    response = RedirectResponse(url="/login", status_code=303)
    response.delete_cookie("session_token")
    return response

@router.get("/api/me", response_model=UserProfile)
async def get_me(current_user: UserProfile = Depends(get_current_user)):
    """Get current user profile"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return current_user
