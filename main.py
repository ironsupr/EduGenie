# main.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
# Jinja2Templates might not be needed here if this main.py is purely for backend/API routes
# from fastapi.templating import Jinja2Templates
from frontend.web_app.routes import student_routes # This is for the /app prefixed frontend routes
from core.oauth_routes import auth_router, user_management_router # Updated import
from core.config import settings
from utils.logger import setup_logger
from typing import Dict, Any
from datetime import datetime

# Initialize logger
logger = setup_logger(__name__)

app = FastAPI(
    title="EduGenie: Personalized Learning Agents",
    description="API for EduGenie personalized learning platform",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory=settings.STATIC_DIR), name="static") # Serves global static files if any

# Templates might only be for the /app (frontend) part, or if main.py serves some root HTML
# templates = Jinja2Templates(directory=settings.TEMPLATES_DIR)

# Include router from the frontend web_app (Jinja2 views)
# These usually serve HTML pages and might have their own static file mounting
app.include_router(student_routes.router, prefix="/app") # Prefixed to /app/...
# The line below might be redundant or for serving landing page at root "/" from student_routes
# If student_routes.router defines "/", this will conflict if not handled carefully.
# Assuming student_routes.router has routes like /dashboard, /login etc., not just "/"
# This line might be intended for root path "/" to be handled by student_routes's "/"
# app.include_router(student_routes.router) # This could be problematic if it also defines /static, /login etc.

# Include core API routers
app.include_router(auth_router) # Handles /auth/login/{provider}, /auth/callback/{provider}, /auth/logout
app.include_router(user_management_router) # Handles /api/register

@app.get("/health")
async def health_check() -> Dict[str, Any]:
    """
    Health check endpoint that monitors system components
    """
    try:
        logger.info("Performing health check")
        services_status = {
            "api": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "version": settings.VERSION,
            "services": {
                "assessment": "healthy",
                "content_generator": "healthy",
                "progress_tracker": "healthy"
            },
            "database": await check_database_health(),
        }
        return services_status
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={"error": "Health check failed", "message": str(e)}
        )

async def check_database_health() -> str:
    """
    Check database connection health
    """
    try:
        # Add actual database health check here
        return "healthy"
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        return "unhealthy"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
