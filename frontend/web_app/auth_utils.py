from fastapi import Request, HTTPException, Depends
from fastapi.responses import RedirectResponse
from typing import Optional, Dict, Any

# Attempt to import necessary components from the 'core' module.
# This assumes that 'core' is in PYTHONPATH or structured as a package
# that 'frontend.web_app' can access.
try:
    from core.config import Settings
    from core.oauth_service import OAuthService
    # If OAuthService uses jose.jwt for token verification
    from jose import JWTError
except ImportError as e:
    # This fallback is for environments where 'core' might not be directly importable
    # by 'frontend.web_app' without specific path setup.
    # In a well-structured project, these imports should ideally work.
    # If they don't, it points to a project structure or PYTHONPATH issue.
    print(f"Auth Utils Warning: Could not import from core: {e}. Using placeholder services.")
    print("For the application to function correctly, ensure 'core' is accessible from 'frontend.web_app'.")

    class SettingsPlaceholder:
        SECRET_KEY: str = "your-actual-secret-key"  # MUST match the key used for encoding
        ALGORITHM: str = "HS256"                   # MUST match the algorithm used for encoding
        ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # Example: 7 days

    class OAuthServicePlaceholder:
        def __init__(self, settings_instance):
            self.settings = settings_instance
            try:
                from jose import jwt, JWTError as JoseJWTError
                self._jwt_decode = jwt.decode
                self._JWTError = JoseJWTError
                self._jose_available = True
            except ImportError:
                print("Auth Utils Error: 'python-jose' library is not installed. JWT verification will fail.")
                self._jose_available = False

        def verify_jwt_token(self, token: str) -> Optional[Dict[str, Any]]:
            if not self._jose_available:
                return None # Cannot verify without JOSE
            try:
                payload = self._jwt_decode(
                    token,
                    self.settings.SECRET_KEY,
                    algorithms=[self.settings.ALGORITHM]
                )
                # Standard 'sub' claim should be present for user identification
                if "sub" not in payload:
                    print("Auth Utils Warning: Token payload missing 'sub' claim.")
                    return None
                return payload
            except self._JWTError as e: # Catches ExpiredSignatureError, JWTClaimsError, etc.
                print(f"Auth Utils Info: JWT verification failed - {type(e).__name__}: {e}")
                return None
            except Exception as e:
                print(f"Auth Utils Error: An unexpected error occurred during token verification: {e}")
                return None

    # Use placeholders if actual import failed
    Settings = SettingsPlaceholder # type: ignore
    OAuthService = OAuthServicePlaceholder # type: ignore
    JWTError = getattr(__import__('jose', fromlist=['JWTError']), 'JWTError', Exception) # type: ignore


# Instantiate settings and service.
# In a larger app, settings might be loaded via a dependency or global config object.
try:
    app_settings = Settings()
    oauth_service = OAuthService(settings=app_settings)
except Exception as e:
    # This is a critical failure if settings or service cannot be initialized.
    print(f"Auth Utils Critical Error: Failed to initialize Settings or OAuthService: {e}")
    app_settings = None # type: ignore
    oauth_service = None # type: ignore


async def get_current_active_user(request: Request) -> Dict[str, Any]:
    """
    FastAPI dependency to retrieve and validate the current user from an auth_token cookie.
    If the token is missing, invalid, or expired, it raises an HTTPException
    that triggers a redirect to the /login page.
    """
    if not oauth_service or not app_settings:
        print("Auth Utils Critical Error: Authentication service is not configured.")
        # This indicates a server configuration issue.
        raise HTTPException(
            status_code=303,  # See Other, common for redirect after POST, or for this kind of redirect
            detail="Authentication service error. Please try again or contact support.",
            headers={"Location": "/login?error=auth_service_unavailable"},
        )

    auth_token = request.cookies.get("auth_token")
    if not auth_token:
        # Token is missing.
        raise HTTPException(
            status_code=303,
            detail="Not authenticated. Redirecting to login.",
            headers={"Location": "/login?reason=no_token"},
        )

    user_payload: Optional[Dict[str, Any]] = None
    try:
        # Ensure oauth_service is not None before calling methods on it
        if oauth_service:
             user_payload = oauth_service.verify_jwt_token(auth_token)
        else:
            # This case should ideally be caught by the initial check, but as a safeguard:
            raise ConnectionError("OAuth service not initialized") # Or a more specific custom error

    except JWTError as e: # Catch specific JOSE errors if verify_jwt_token re-raises them
        user_payload = None
        print(f"Auth Utils Info: JWTError during token verification: {e}")
    except ConnectionError as e: # Catch our custom error
        print(f"Auth Utils Error: {e}")
        raise HTTPException(
            status_code=303,
            detail="Authentication system error. Please try again later.",
            headers={"Location": "/login?error=auth_system_error_verify"},
        )


    if user_payload is None:
        # Token is invalid (expired, malformed, signature mismatch, etc.)
        # For HTTPException, we can't directly control the response object to delete cookies easily.
        # The redirect itself is the primary action. Cookie clearing is best-effort here or handled by frontend/login page.
        exc = HTTPException(
            status_code=303,
            detail="Invalid or expired token. Redirecting to login.",
            headers={"Location": "/login?reason=invalid_token"},
        )
        # A more advanced setup would use a custom exception + FastAPI exception_handler
        # to build a RedirectResponse and attach a Set-Cookie header to clear the cookie.
        # Example:
        # response = RedirectResponse(url="/login?reason=invalid_token", status_code=303)
        # response.delete_cookie("auth_token")
        # raise MyCustomRedirectException(response) # and have a handler for this
        raise exc


    if "sub" not in user_payload or not user_payload["sub"]:
        # 'sub' (subject) claim, typically holding the user ID, is essential.
        raise HTTPException(
            status_code=303,
            detail="Token payload is invalid (missing 'sub'). Redirecting to login.",
            headers={"Location": "/login?reason=invalid_payload"},
        )

    # User is authenticated, token is valid, and payload contains 'sub'.
    return user_payload

# Optional: A dependency for routes that can be accessed by anyone,
# but may provide enhanced features if the user is authenticated.
async def get_optional_current_user(request: Request) -> Optional[Dict[str, Any]]:
    if not oauth_service:
        print("Auth Utils Warning: Optional user check - OAuthService not available.")
        return None # Authentication service not available, treat as anonymous.

    auth_token = request.cookies.get("auth_token")
    if not auth_token:
        return None # No token, user is anonymous.

    user_payload = oauth_service.verify_jwt_token(auth_token)

    if user_payload is None or "sub" not in user_payload:
        # Token is invalid or payload is malformed, treat as anonymous.
        return None

    return user_payload

print("frontend/web_app/auth_utils.py defined with authentication dependencies (refined).")
