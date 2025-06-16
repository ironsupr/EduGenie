"""
OAuth authentication routes
"""
from fastapi import APIRouter, Request, HTTPException, Depends, Form, status
from fastapi.responses import RedirectResponse, JSONResponse
from pydantic import BaseModel, EmailStr, constr
from typing import Dict, Any
import logging
import uuid # Import uuid for generating unique IDs if needed

from core.config import Settings
from core.oauth_service import OAuthService
from core.firestore_client import get_firestore_client, FirestoreClient
from core.firebase_admin_client import get_firebase_auth, initialize_firebase_admin

logger = logging.getLogger(__name__)

# Initialize Firebase Admin SDK at startup (ideally, FastAPI startup event, but this ensures it runs)
# This is a module-level call, ensure it's safe and idempotent as implemented in firebase_admin_client.
initialize_firebase_admin()

# Initialize router
# The prefix for user registration might be different, e.g., /api instead of /auth
# For now, adding to the existing router. If it's /api/register, a new router or adjustment is needed.
# Let's assume /api/register means it should be outside the /auth prefix.
# I will create a new router for this.
auth_router = APIRouter(prefix="/auth", tags=["OAuth Authentication"]) # Renamed existing router
user_management_router = APIRouter(prefix="/api", tags=["User Management"])


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

        # Initialize Firestore client
        firestore_client: FirestoreClient = get_firestore_client()

        provider_user_id = str(user_info['id']) # Ensure provider_user_id is a string
        user_email = user_info.get('email')
        user_name = user_info.get('name', '') # Get name, default to empty string if not present

        if not user_email:
            logger.error(f"OAuth callback for {provider} missing email for user_id: {provider_user_id}")
            raise HTTPException(status_code=400, detail="Email not provided by OAuth provider.")

        # Use provider-specific ID as the document ID in Firestore for simplicity and uniqueness.
        # This is the `students` collection document ID.
        firestore_doc_id = f"{provider}_{provider_user_id}"

        firebase_uid_to_store = None
        firebase_auth_service = get_firebase_auth()

        try:
            firebase_user = firebase_auth_service.get_user_by_email(user_email)
            logger.info(f"User found in Firebase Auth by email {user_email}. UID: {firebase_user.uid}")
            firebase_uid_to_store = firebase_user.uid
            # Optionally update Firebase user profile here if needed
            # update_kwargs = {}
            # if user_name and firebase_user.display_name != user_name:
            #     update_kwargs['display_name'] = user_name
            # if user_info.get('picture') and firebase_user.photo_url != user_info.get('picture'):
            #     update_kwargs['photo_url'] = user_info.get('picture')
            # if update_kwargs:
            #     firebase_auth_service.update_user(firebase_user.uid, **update_kwargs)
            #     logger.info(f"Updated Firebase user profile for UID: {firebase_user.uid}")
            # Ensure firebase_user object is the one from get_user_by_email or create_user
            email_verified_status = firebase_user.email_verified
            photo_url_status = firebase_user.photo_url

        except firebase_auth_service.UserNotFoundError:
            logger.info(f"User not found in Firebase Auth by email {user_email}. Creating new Firebase user.")
            try:
                # Prefer email_verified from OAuth provider if available, else default
                oauth_email_verified = user_info.get('email_verified', False) # Default to False if not provided by OAuth

                new_firebase_user = firebase_auth_service.create_user(
                    email=user_email,
                    email_verified=oauth_email_verified,
                    display_name=user_name,
                    photo_url=user_info.get('picture'),
                    # For OAuth users, typically don't set a password directly.
                    # They will always sign in via OAuth.
                )
                firebase_uid_to_store = new_firebase_user.uid
                logger.info(f"Successfully created Firebase user. Email: {user_email}, UID: {firebase_uid_to_store}")
            except Exception as e_create:
                logger.error(f"Failed to create Firebase user for email {user_email}: {e_create}")
                raise HTTPException(status_code=500, detail="Failed to create user in authentication system.")
        except Exception as e_get:
            logger.error(f"Error looking up Firebase user by email {user_email}: {e_get}")
            raise HTTPException(status_code=500, detail="Error verifying user with authentication system.")


        # At this point, firebase_uid_to_store should hold the Firebase UID.
        # Now, handle Firestore document creation/update.
        # The document ID for Firestore `students` collection is still `firestore_doc_id`.
        # We will add `firebase_uid` as a field in this document.

        existing_student_doc = firestore_client.get_student(student_id=firestore_doc_id)

        if existing_student_doc:
            # User exists in Firestore, update their information
            user_updates = {
                "name": user_name,
                "last_login_at": firestore_client.db.SERVER_TIMESTAMP,
                "provider": provider,
                "provider_user_id": provider_user_id,
                "firebase_uid": firebase_uid_to_store,
                "profile_picture_url": photo_url_status or user_info.get('picture'), # Sync photo_url
                "email_verified": email_verified_status # Sync email_verified status
            }
            if existing_student_doc.get("name") != user_name: # Sync name if changed
                user_updates["name_last_updated_from_provider"] = firestore_client.db.SERVER_TIMESTAMP

            firestore_client.update_student(firestore_doc_id, user_updates)
            logger.info(f"Firestore student {firestore_doc_id} updated with Firebase UID {firebase_uid_to_store}, photo_url, and email_verified status.")
        else:
            # User does not exist in Firestore, create new user
            new_user_data = {
                "email": user_email,
                "name": user_name,
                "provider": provider,
                "provider_user_id": provider_user_id,
                "firebase_uid": firebase_uid_to_store,
                "profile_picture_url": photo_url_status or user_info.get('picture'), # Add photo_url
                "email_verified": email_verified_status, # Add email_verified status
                "status": "active",
                # created_at and updated_at are handled by create_student method
            }
            firestore_client.create_student(student_id=firestore_doc_id, student_data=new_user_data)
            logger.info(f"New Firestore student {firestore_doc_id} created with Firebase UID {firebase_uid_to_store}, photo_url, and email_verified status.")

        # Create JWT token - IMPORTANT: 'sub' should now be the Firebase UID for Firebase ecosystem compatibility.
        token_data = {
            'sub': firebase_uid_to_store,  # Firebase UID as subject
            'user_id': firebase_uid_to_store, # Keep for internal compatibility if needed, but 'sub' is standard
            'email': user_email,
            'name': user_name,
            'provider': provider,
            'firestore_doc_id': firestore_doc_id # Optionally include original Firestore doc ID if useful
        }
        token = oauth_service.create_jwt_token(token_data)
        
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
async def get_current_user( # Ensure this endpoint uses the 'sub' or 'user_id' from JWT correctly
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
        
        # Ensure to retrieve user_id from 'sub' or 'user_id' claim based on what was set in JWT
        user_id_from_token = user_data.get("sub") or user_data.get("user_id")

        return {
            "id": user_id_from_token,
            "email": user_data.get("email"),
            "name": user_data.get("name"),
            "provider": user_data.get("provider")
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get user error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user information")


# Pydantic model for registration data
class UserRegistrationPayload(BaseModel):
    email: EmailStr
    password: constr(min_length=8)
    full_name: Optional[str] = None
    # Add any other fields from register.html form if necessary
    # learning_goal: Optional[str] = None
    # experience_level: Optional[str] = None
    # plan: Optional[str] = "starter"
    # terms_accepted: bool


@user_management_router.post("/register")
async def register_user_email_password(
    payload: UserRegistrationPayload,
    # Re-instantiate services here or make them available via app state/global
    # For simplicity, re-instantiating as per existing pattern in this file
    oauth_service: OAuthService = Depends(get_oauth_service) # For JWT creation if auto-login
):
    """
    Handles new user registration with email and password.
    Creates user in Firebase Auth and Firestore.
    Optionally logs them in by returning a JWT.
    """
    firebase_auth_service = get_firebase_auth()
    firestore_client: FirestoreClient = get_firestore_client()

    try:
        logger.info(f"Attempting to register new user with email: {payload.email}")
        firebase_user = firebase_auth_service.create_user(
            email=payload.email,
            password=payload.password,
            display_name=payload.full_name,
            email_verified=False # Email verification step would be separate
        )
        logger.info(f"Successfully created Firebase user. Email: {firebase_user.email}, UID: {firebase_user.uid}")

        firebase_uid = firebase_user.uid

        # Create Firestore student record using Firebase UID as the document ID
        # This is a deviation from OAuth where doc ID is provider_providerid
        # This needs to be harmonized later if a single user can have both OAuth and email/pass
        # For now, this fulfills "Firebase UID directly as the document ID" for email registrations.
        firestore_doc_id = firebase_uid

        new_student_data = {
            "email": firebase_user.email,
            "name": firebase_user.display_name or "",
            "firebase_uid": firebase_uid,
            "provider": "email",
            "email_verified": firebase_user.email_verified, # Store email_verified status (initially False)
            "profile_picture_url": firebase_user.photo_url, # Store photo_url (likely None at registration)
            "status": "active",
            # created_at and updated_at are handled by create_student method
        }

        # Check if a student record already exists for this firebase_uid (should not happen for new creation)
        # or if an OAuth user with the same email (and thus same firebase_uid) already has a different doc_id.
        # The create_student method might fail if the doc_id (firebase_uid) already exists.
        # A get_student then update_or_create logic might be more robust.
        # For now, assuming create_student will create or overwrite if ID is reused (Firestore's behavior).
        # It's better if create_student fails if doc exists, or use set with merge=False.
        # Let's assume create_student is safe for now or update it later.

        # Before creating, check if a user with this Firebase UID already exists in Firestore,
        # which could happen if they first signed up with OAuth using the same email.
        existing_firestore_user_by_uid = firestore_client.get_student_by_firebase_uid(firebase_uid)

        if existing_firestore_user_by_uid:
            # This Firebase user (identified by email) already has a Firestore record.
            # This could be an OAuth record. We should update it with 'email' provider info if appropriate.
            logger.info(f"Firebase user {firebase_uid} (Email: {payload.email}) already has a Firestore record (ID: {existing_firestore_user_by_uid['id']}). Updating provider info.")
            firestore_doc_id_to_update = existing_firestore_user_by_uid['id'] # The existing doc ID (e.g. google_xxxx)
            update_data = {
                "firebase_uid": firebase_uid,
                "provider": "email",
                "name": payload.full_name or existing_firestore_user_by_uid.get("name"),
                "email_verified": firebase_user.email_verified, # Update email_verified status
                # Potentially update other fields if this flow means merging/overwriting OAuth profile
                # "profile_picture_url": firebase_user.photo_url, # Usually photo_url comes from OAuth not email reg
            }
            if not existing_firestore_user_by_uid.get("provider_user_id"):
                 update_data["provider_user_id"] = firebase_uid

            firestore_client.update_student(student_id=firestore_doc_id_to_update, updates=update_data)
            firestore_doc_id = firestore_doc_id_to_update # Use the existing doc ID for JWT context if needed
        else:
            # No existing Firestore record for this Firebase UID, create a new one.
            # Use Firebase UID as the document ID for this email-based registration.
            firestore_client.create_student(student_id=firebase_uid, student_data=new_student_data)
            logger.info(f"New Firestore student record created with ID (Firebase UID): {firebase_uid} for email {payload.email}")
            firestore_doc_id = firebase_uid # This is the ID of the Firestore document we just created

        # Optional: Auto-login by creating and returning JWT
        # The JWT 'sub' claim should be the Firebase UID.
        token_data = {
            'sub': firebase_uid,
            'user_id': firebase_uid,
            'email': firebase_user.email,
            'name': firebase_user.display_name or "",
            'provider': 'email',
            'firestore_doc_id': firestore_doc_id # ID of the Firestore document, which is firebase_uid in this case
        }
        token = oauth_service.create_jwt_token(token_data)

        response = JSONResponse(
            content={
                "message": "User registered successfully.",
                "user_id": firebase_uid,
                "email": firebase_user.email,
                "token": token # Send token for auto-login
            },
            status_code=status.HTTP_201_CREATED
        )
        # Set cookie for auto-login
        response.set_cookie(
            key="auth_token",
            value=token,
            max_age=604800,  # 7 days
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite="lax"
        )
        return response

    except firebase_auth_service.EmailAlreadyExistsError:
        logger.warning(f"Registration attempt with already existing email: {payload.email}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered. Please login or use a different email."
        )
    except firebase_auth_service.FirebaseError as fe: # Catch other Firebase specific errors
        logger.error(f"Firebase Auth error during registration for {payload.email}: {fe}")
        # You might want to inspect 'fe.code' for more specific error handling
        # e.g., 'weak-password', 'invalid-email' (though Pydantic should catch some)
        detail_msg = "Registration failed due to an authentication system error."
        if "WEAK_PASSWORD" in str(fe): # Example of more specific error
            detail_msg = "Password is too weak. Please choose a stronger password."
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail_msg)
    except Exception as e:
        logger.error(f"Unexpected error during user registration for {payload.email}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred during registration.")

# Need to ensure the main FastAPI app includes this new router.
# Example: app.include_router(user_management_router) in main.py or similar.
# For now, this defines the route. Integration into app is separate.
