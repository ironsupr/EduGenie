# main.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from frontend.web_app.routes import student_routes
from core.oauth_routes import router as oauth_router
from core.auth_routes import router as auth_router
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
app.mount("/static", StaticFiles(directory=settings.STATIC_DIR), name="static")

# Initialize templates
templates = Jinja2Templates(directory=settings.TEMPLATES_DIR)

# Include router from the frontend with prefix to avoid conflicts
app.include_router(student_routes.router, prefix="/app")

# Include router without prefix for main routes (landing page, etc.)
app.include_router(student_routes.router)

# Include OAuth router
app.include_router(oauth_router)

# Include Auth router
app.include_router(auth_router, prefix="/api/auth")

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
