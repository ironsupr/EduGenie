"""
OAuth authentication service for Google and GitHub
"""
from authlib.integrations.starlette_client import OAuth
from authlib.integrations.starlette_client import OAuthError
from starlette.requests import Request
from starlette.responses import RedirectResponse
from typing import Dict, Optional, Any
import jwt
from datetime import datetime, timedelta
import httpx
import logging

from core.config import Settings

logger = logging.getLogger(__name__)

class OAuthService:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.oauth = OAuth()
        
        # Configure Google OAuth
        if settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET:
            self.oauth.register(
                name='google',
                client_id=settings.GOOGLE_CLIENT_ID,
                client_secret=settings.GOOGLE_CLIENT_SECRET,
                server_metadata_url='https://accounts.google.com/.well-known/openid_configuration',
                client_kwargs={
                    'scope': 'openid email profile'
                }
            )
        
        # Configure GitHub OAuth
        if settings.GITHUB_CLIENT_ID and settings.GITHUB_CLIENT_SECRET:
            self.oauth.register(
                name='github',
                client_id=settings.GITHUB_CLIENT_ID,
                client_secret=settings.GITHUB_CLIENT_SECRET,
                access_token_url='https://github.com/login/oauth/access_token',
                authorize_url='https://github.com/login/oauth/authorize',
                api_base_url='https://api.github.com/',
                client_kwargs={'scope': 'user:email'},
            )
    
    async def get_login_url(self, provider: str, request: Request) -> str:
        """Generate OAuth login URL for the specified provider"""
        try:
            if provider not in ['google', 'github']:
                raise ValueError(f"Unsupported provider: {provider}")
            
            client = self.oauth.create_client(provider)
            redirect_uri = f"{self.settings.OAUTH_REDIRECT_URI}/{provider}"
            
            return await client.create_authorization_url(redirect_uri)
        except Exception as e:
            logger.error(f"Error creating {provider} login URL: {e}")
            raise
    
    async def handle_callback(self, provider: str, request: Request) -> Dict[str, Any]:
        """Handle OAuth callback and return user information"""
        try:
            if provider not in ['google', 'github']:
                raise ValueError(f"Unsupported provider: {provider}")
            
            client = self.oauth.create_client(provider)
            redirect_uri = f"{self.settings.OAUTH_REDIRECT_URI}/{provider}"
            
            token = await client.authorize_access_token(request)
            
            if provider == 'google':
                user_info = await self._get_google_user_info(token)
            elif provider == 'github':
                user_info = await self._get_github_user_info(token)
            
            return {
                'provider': provider,
                'user_info': user_info,
                'token': token
            }
        except OAuthError as e:
            logger.error(f"OAuth error for {provider}: {e}")
            raise
        except Exception as e:
            logger.error(f"Error handling {provider} callback: {e}")
            raise
    
    async def _get_google_user_info(self, token: Dict[str, Any]) -> Dict[str, Any]:
        """Extract user information from Google token"""
        user_info = token.get('userinfo')
        if user_info:
            return {
                'id': user_info.get('sub'),
                'email': user_info.get('email'),
                'name': user_info.get('name'),
                'picture': user_info.get('picture'),
                'email_verified': user_info.get('email_verified', False)
            }
        
        # Fallback: fetch user info from Google API
        async with httpx.AsyncClient() as client:
            response = await client.get(
                'https://www.googleapis.com/oauth2/v2/userinfo',
                headers={'Authorization': f"Bearer {token['access_token']}"}
            )
            if response.status_code == 200:
                data = response.json()
                return {
                    'id': data.get('id'),
                    'email': data.get('email'),
                    'name': data.get('name'),
                    'picture': data.get('picture'),
                    'email_verified': data.get('verified_email', False)
                }
        
        raise Exception("Failed to fetch Google user information")
    
    async def _get_github_user_info(self, token: Dict[str, Any]) -> Dict[str, Any]:
        """Extract user information from GitHub token"""
        async with httpx.AsyncClient() as client:
            # Get user profile
            user_response = await client.get(
                'https://api.github.com/user',
                headers={'Authorization': f"Bearer {token['access_token']}"}
            )
            
            if user_response.status_code != 200:
                raise Exception("Failed to fetch GitHub user information")
            
            user_data = user_response.json()
            
            # Get user emails
            emails_response = await client.get(
                'https://api.github.com/user/emails',
                headers={'Authorization': f"Bearer {token['access_token']}"}
            )
            
            primary_email = None
            email_verified = False
            
            if emails_response.status_code == 200:
                emails = emails_response.json()
                for email in emails:
                    if email.get('primary', False):
                        primary_email = email.get('email')
                        email_verified = email.get('verified', False)
                        break
            
            return {
                'id': str(user_data.get('id')),
                'email': primary_email or user_data.get('email'),
                'name': user_data.get('name') or user_data.get('login'),
                'picture': user_data.get('avatar_url'),
                'email_verified': email_verified
            }
    
    def create_jwt_token(self, user_data: Dict[str, Any]) -> str:
        """Create JWT token for authenticated user"""
        if not self.settings.SECRET_KEY:
            raise ValueError("SECRET_KEY not configured")
        
        payload = {
            'user_id': user_data['id'],
            'email': user_data['email'],
            'name': user_data['name'],
            'provider': user_data.get('provider'),
            'exp': datetime.utcnow() + timedelta(days=7),  # Token expires in 7 days
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
