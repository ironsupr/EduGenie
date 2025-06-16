import firebase_admin
from firebase_admin import credentials
from firebase_admin import auth as firebase_auth # Alias for clarity
import os
from utils.logger import setup_logger
from core.config import Settings

logger = setup_logger(__name__)

_firebase_admin_initialized = False

def initialize_firebase_admin():
    """
    Initializes the Firebase Admin SDK using credentials from settings.
    Ensures initialization happens only once.
    """
    global _firebase_admin_initialized
    if _firebase_admin_initialized:
        logger.info("Firebase Admin SDK already initialized.")
        return

    try:
        settings = Settings()
        service_account_path = settings.FIREBASE_ADMIN_SDK_CONFIG_PATH # Assuming this env var will be set

        if not service_account_path:
            logger.error("FIREBASE_ADMIN_SDK_CONFIG_PATH is not set. Firebase Admin SDK cannot be initialized.")
            return

        if not os.path.exists(service_account_path):
            logger.error(f"Firebase service account file not found at: {service_account_path}")
            return

        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred)
        _firebase_admin_initialized = True
        logger.info("Firebase Admin SDK initialized successfully.")

    except ValueError as ve:
        # This can happen if initialize_app is called more than once with different creds,
        # or if the default app exists and creds are provided.
        # We try to guard with _firebase_admin_initialized, but good to catch.
        if "already initialized" in str(ve).lower():
            _firebase_admin_initialized = True # Mark as initialized if error indicates it
            logger.warning(f"Firebase Admin SDK already initialized (caught from error): {ve}")
        else:
            logger.error(f"Error initializing Firebase Admin SDK: {ve}")
            # Potentially raise to halt startup if Firebase Admin is critical
    except Exception as e:
        logger.error(f"An unexpected error occurred during Firebase Admin SDK initialization: {e}")
        # Potentially raise

def get_firebase_auth():
    """
    Returns the Firebase auth module. Ensures SDK is initialized.
    """
    if not _firebase_admin_initialized:
        logger.warning("Firebase Admin SDK not initialized. Attempting to initialize now.")
        initialize_firebase_admin() # Attempt to initialize if not already

    if not _firebase_admin_initialized:
        # If still not initialized after attempt (e.g. config missing)
        logger.error("Firebase Admin SDK could not be initialized. Auth operations will fail.")
        # Depending on strictness, could raise an exception here.
        # Returning None or allowing firebase_auth to raise its own errors are options.
        # For now, let it proceed, and calls to firebase_auth will fail if not initialized.

    return firebase_auth

# Automatically initialize when this module is loaded?
# Or explicitly call initialize_firebase_admin() during app startup (e.g. in main.py or a startup event).
# For now, explicit call is safer. Let's assume main app will call initialize_firebase_admin().
# If not, get_firebase_auth() will attempt it.

# Example of how to call during app startup in your main FastAPI app file:
# from core.firebase_admin_client import initialize_firebase_admin
# app.add_event_handler("startup", initialize_firebase_admin)

print("core/firebase_admin_client.py defined.")
