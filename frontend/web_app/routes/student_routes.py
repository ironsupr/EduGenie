# frontend/web_app/routes/student_routes.py
# Test comment to check if file can be modified

from fastapi import APIRouter, Request, Form, HTTPException, Depends
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from typing import Optional, Dict, Any

# Import the authentication dependency
from frontend.web_app.auth_utils import get_current_active_user

# Attempt to import Firestore client for actual data fetching
try:
    from core.firestore_client import get_firestore_client, FirestoreClient
    _firestore_client_available = True
    logger.info("Firestore client successfully imported for student routes.")
except ImportError:
    _firestore_client_available = False
    logger.warning("Student Routes Warning: Firestore client not available. Dashboard will use mock data.")
from datetime import datetime
import json
from utils.logger import setup_logger

logger = setup_logger(__name__)

templates = Jinja2Templates(directory="frontend/web_app/templates")
router = APIRouter()

# Mock data store (replace with database in production)
students_data = {}
quiz_results = {}

@router.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """Modern landing page for EduGenie"""
    return templates.TemplateResponse(request, "landing.html")

@router.get("/dashboard", response_class=HTMLResponse)
async def dashboard(request: Request, current_user: Dict[str, Any] = Depends(get_current_active_user)):
    """Modern student dashboard with gamification and AI assistant, protected by authentication."""
    
    firestore_user_id = current_user.get("sub")
    if not firestore_user_id:
        # Should be caught by dependency, but as a safeguard
        raise HTTPException(status_code=403, detail="User ID missing from token.")

    student_data_from_db = None
    if _firestore_client_available:
        try:
            firestore_client: FirestoreClient = get_firestore_client()
            # Use Firebase UID (from token's 'sub' claim) to fetch student document
            student_doc = firestore_client.get_student_by_firebase_uid(firebase_uid=firestore_user_id)
            if student_doc:
                student_data_from_db = student_doc
                # Ensure basic fields expected by template are present
                # student_doc['id'] is the Firestore document ID (e.g. google_xxxx), not the Firebase UID.
                # The template's {{ student_id }} should consistently be one type of ID.
                # If student_data.id is used in template, ensure it's what you expect (Firebase UID or Firestore Doc ID)
                student_data_from_db.setdefault("name", current_user.get("name", "Learner"))
                student_data_from_db.setdefault("email", current_user.get("email", "N/A"))
                student_data_from_db.setdefault("profile_picture", "/static/images/default-avatar.png")
                # 'id' field in student_data_from_db will be the Firestore document ID.
                # We already have firestore_user_id which is the Firebase UID.
                # Decide which one to pass as 'student_id' to the template.
                # For consistency, if 'sub' from token is Firebase UID, template 'student_id' should be Firebase UID.
                # So, we might need to adjust what 'id' means in student_data or add firebase_uid to it explicitly if not already.
                # The get_student_by_firebase_uid returns the Firestore doc which includes its own 'id'.
                # Let's ensure student_data for template has 'id' as firebase_uid.
                student_data_from_db['id'] = firestore_user_id # Override Firestore doc ID with Firebase UID for template context
                student_data_from_db.setdefault('firebase_uid', firestore_user_id)

            else:
                logger.warning(f"No student document found in Firestore for Firebase UID: {firestore_user_id}. User is authenticated but profile data might be missing.")
                student_data_from_db = {
                    "id": firestore_user_id, "firebase_uid": firestore_user_id, "name": current_user.get("name", "New User"),
                    "email": current_user.get("email", "N/A"),
                    "profile_picture": "/static/images/default-avatar.png", "status": "active_no_profile_firebase_uid_not_found_in_students"
                }
        except Exception as e:
            logger.error(f"Firestore error while fetching student by Firebase UID {firestore_user_id}: {e}")
            # Fallback on error
            student_data_from_db = None

    # Fallback to mock data if Firestore data isn't available or failed
    if student_data_from_db is None:
        logger.info(f"Falling back to mock data for student ID: {firestore_user_id}")
        # Try to get from mock store using firestore_user_id, or create a default mock
        student_data = students_data.get(firestore_user_id, {
            "id": firestore_user_id,
            "name": current_user.get("name", "Mock User"),
            "email": current_user.get("email", "mock@example.com"),
            "profile_picture": "/static/images/default-avatar.png",
            "level": 12, "current_xp": 2450, "xp_to_next_level": 500,
            "current_streak": 7, "longest_streak": 15, "global_rank": 156, "rank_change": "+3"
        })
        if firestore_user_id not in students_data: # Store if it's a new mock entry
             students_data[firestore_user_id] = student_data
    else:
        student_data = student_data_from_db
    
    # Comprehensive dashboard data
    dashboard_data = {
        # Courses data
        "courses": [
            {
                "id": 1,
                "title": "Advanced Mathematics",
                "progress": 78,
                "next_session": "Calculus Derivatives",
                "instructor": "Dr. Smith",
                "color": "#5F60F5"
            },
            {
                "id": 2,
                "title": "Physics Fundamentals",
                "progress": 45,
                "next_session": "Newton's Laws",
                "instructor": "Prof. Johnson",
                "color": "#10B981"
            },
            {
                "id": 3,
                "title": "Chemistry Basics",
                "progress": 89,
                "next_session": "Organic Compounds",
                "instructor": "Dr. Williams",
                "color": "#F59E0B"
            }
        ],
        
        # Daily planner data
        "daily_sessions": [
            {"time": "09:00", "subject": "Mathematics", "topic": "Calculus Review", "duration": 45},
            {"time": "11:30", "subject": "Physics", "topic": "Lab Work", "duration": 90},
            {"time": "14:00", "subject": "Chemistry", "topic": "Problem Solving", "duration": 60},
            {"time": "16:30", "subject": "Study Break", "topic": "AI Study Tips", "duration": 30}
        ],
        
        # Progress statistics
        "progress_stats": {
            "weekly_study_hours": 28,
            "assignments_completed": 12,
            "quiz_average": 87,
            "improvement_rate": "+5%"
        },
        
        # Recent activities
        "recent_activities": [
            {
                "type": "quiz",
                "title": "Quadratic Equations Quiz",
                "score": 92,
                "date": "2025-01-14",
                "subject": "Mathematics"
            },
            {
                "type": "assignment",
                "title": "Physics Lab Report",
                "score": 88,
                "date": "2025-01-13",
                "subject": "Physics"
            },
            {
                "type": "study",
                "title": "Chemistry Chapter 5",
                "duration": "45 min",
                "date": "2025-01-12",
                "subject": "Chemistry"
            }
        ],
        
        # Achievements
        "achievements": [
            {"name": "Week Warrior", "description": "7-day study streak", "earned": True, "icon": "🔥"},
            {"name": "Quiz Master", "description": "Score 90+ on 5 quizzes", "earned": True, "icon": "🧠"},
            {"name": "Early Bird", "description": "Complete morning sessions", "earned": False, "icon": "🌅"},
            {"name": "Perfectionist", "description": "Get 100% on any quiz", "earned": False, "icon": "⭐"}        ]
    }
    
    return templates.TemplateResponse(request, "dashboard_new.html", {
        "student_id": firestore_user_id, # Pass the authenticated user's ID
        "student_data": student_data,
        "dashboard_data": dashboard_data, # This is still generic mock data
        "current_user_jwt": current_user # Pass the raw JWT payload if needed by template
    })

@router.post("/start-quiz", response_class=HTMLResponse)
async def start_quiz(request: Request, current_user: Dict[str, Any] = Depends(get_current_active_user)): # Added Auth
    """Start assessment quiz. Now requires authentication."""
    firestore_user_id = current_user["sub"]
    
    # Store student data (mock)
    students_data[firestore_user_id] = { # Use firestore_user_id as key
        "name": current_user.get("name", firestore_user_id), # Get name from token
        "start_time": datetime.now().isoformat()
    }
    
    return templates.TemplateResponse(request, "quiz.html", {"student_id": firestore_user_id, "current_user_jwt": current_user})

@router.post("/submit-quiz", response_class=HTMLResponse)
async def submit_quiz_html( # Renamed to avoid conflict
    request: Request, 
    q1: str = Form(...), 
    q2: str = Form(...),
    q3: str = Form(...),
    current_user: Dict[str, Any] = Depends(get_current_active_user) # Added Auth
):
    """Submit quiz and generate learning path. Now requires authentication."""
    firestore_user_id = current_user["sub"]
    try:
        # Store quiz results (mock)
        answers = {"q1": q1, "q2": q2, "q3": q3}
        quiz_results[firestore_user_id] = { # Use firestore_user_id as key
            "answers": answers,
            "submitted_at": datetime.now().isoformat()
        }
        
        # Analyze answers and determine weaknesses
        weaknesses = []
        strengths = []
        
        # Question 1: Quadratic equations (correct answer: A)
        if q1 != "A":
            weaknesses.append("Quadratic Factoring")
        else:
            strengths.append("Quadratic Equations")
            
        # Question 2: Linear functions (correct answer: A) 
        if q2 != "A":
            weaknesses.append("Linear Functions")
        else:
            strengths.append("Linear Functions")
            
        # Question 3: Algebraic expressions (correct answer: A)
        if q3 != "A":
            weaknesses.append("Algebraic Simplification")
        else:
            strengths.append("Algebraic Expressions")
        
        # Calculate score
        correct_answers = sum(1 for ans in [q1 == "A", q2 == "A", q3 == "A"] if ans)
        score_percentage = (correct_answers / 3) * 100
        
        return templates.TemplateResponse(request, "learning_path_new.html", {"student_id": firestore_user_id,
            "topics": weaknesses,
            "strengths": strengths,
            "score": score_percentage,
            "total_questions": 3,
            "correct_answers": correct_answers,
            "current_user_jwt": current_user
            })
        
    except Exception as e:
        logger.error(f"Error submitting quiz for student {firestore_user_id}: {e}")
        return templates.TemplateResponse(request, "quiz.html", {
            "student_id": firestore_user_id,
            "error": "An error occurred while processing your quiz. Please try again.",
            "current_user_jwt": current_user
            })

@router.get("/api/student/{student_id}/progress", response_class=JSONResponse)
async def get_student_progress_api(student_id: str, request: Request, current_user: Dict[str, Any] = Depends(get_current_active_user)): # Added Auth, Renamed
    """
    API endpoint to get student progress data.
    Ensures requested student_id matches authenticated user.
    """
    authenticated_user_id = current_user["sub"]

    if student_id != authenticated_user_id:
        raise HTTPException(status_code=403, detail="Forbidden: You can only access your own progress.")

    target_student_id = authenticated_user_id

    try:
        # Mock progress data (replace with database query for target_student_id)
        logger.info(f"Fetching progress for student {target_student_id} via API.")
        progress = {
            "student_id": target_student_id,
            "topics": [
                {"name": "Linear Equations", "progress": 85, "status": "completed"},
                {"name": "Quadratic Functions", "progress": 60, "status": "in_progress"},
                {"name": "Graph Interpretation", "progress": 30, "status": "not_started"},
                {"name": "Algebraic Expressions", "progress": 95, "status": "completed"},
            ],
            "overall_progress": 67.5,
            "last_updated": datetime.now().isoformat()
        }
        return progress
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/study/{topic}", response_class=HTMLResponse)
async def study_topic(request: Request, topic: str, current_user: Dict[str, Any] = Depends(get_current_active_user)): # Added Auth
    """Study page for specific topic. Now requires authentication."""
    firestore_user_id = current_user["sub"]
    topic_content = {
        "quadratic_factoring": {
            "title": "Quadratic Factoring",
            "description": "Learn how to factor quadratic expressions",
            "content": "Quadratic factoring involves expressing a quadratic equation as a product of binomials...",
            "examples": [
                "x² - 5x + 6 = (x - 2)(x - 3)",
                "x² + 7x + 10 = (x + 5)(x + 2)"
            ],
            "practice": [
                "Factor: x² - 6x + 8",
                "Factor: x² + x - 12"
            ]
        },
        "linear_functions": {
            "title": "Linear Functions", 
            "description": "Understanding linear functions and their properties",
            "content": "A linear function has the form y = mx + b where m is the slope and b is the y-intercept...",
            "examples": [
                "y = 3x + 1 has slope 3 and y-intercept 1",
                "y = -2x + 5 has slope -2 and y-intercept 5"
            ],
            "practice": [
                "Find the slope of y = 4x - 2",
                "What is the y-intercept of y = -x + 7?"
            ]
        }
    }
    
    topic_key = topic.lower().replace(" ", "_")
    content = topic_content.get(topic_key, {
        "title": topic.title(),
        "description": f"Study materials for {topic}",
        "content": f"Content for {topic} will be generated here...",
        "examples": [],
        "practice": []
    })
    
    return templates.TemplateResponse(request, "study.html", {"topic": content,
        "student_id": firestore_user_id, "current_user_jwt": current_user})

@router.get("/health") # Public route, no auth needed
async def health_check():
    """Comprehensive health check endpoint"""
    from datetime import datetime
    return {
        "status": "healthy",
        "api": "healthy",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "version": "1.0.0",
        "services": {
            "student_routes": "healthy",
            "templates": "healthy",
            "static_files": "healthy"
        },
        "database": "healthy",
        "service": "student_routes"
    }

# Landing page routes
@router.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    """Login page"""
    return templates.TemplateResponse(request, "login.html", {
        "page_title": "Sign In"
    })

@router.get("/register", response_class=HTMLResponse)
async def register_page(request: Request, plan: str = "starter"):
    """Registration page with plan selection"""
    return templates.TemplateResponse(request, "register.html", {
        "page_title": "Get Started",
        "selected_plan": plan
    })

@router.get("/forgot-password", response_class=HTMLResponse)
async def forgot_password_page(request: Request):
    """Forgot password page"""
    return templates.TemplateResponse(request, "forgot_password.html", {
        "page_title": "Forgot Password"
    })

@router.get("/demo", response_class=HTMLResponse)
async def demo_page(request: Request):
    """Demo page showing platform features"""
    return templates.TemplateResponse(request, "dashboard.html", {"demo_mode": True,
        "student_id": "demo_user"})

@router.get("/contact", response_class=HTMLResponse)
async def contact_page(request: Request):
    """Contact sales page"""
    return templates.TemplateResponse(request, "index.html", {"page_title": "Contact Sales",
        "contact_mode": True})

@router.get("/courses", response_class=HTMLResponse)
async def courses_page(request: Request):
    """Our Courses page"""
    return templates.TemplateResponse(request, "dashboard_new.html", {
        "page_title": "Our Courses",
        "student_id": "student",
        "courses_mode": True
    })

@router.get("/university-exam", response_class=HTMLResponse)
async def university_exam_page(request: Request):
    """University Exam preparation page"""
    return templates.TemplateResponse(request, "dashboard_new.html", {
        "page_title": "University Exam Preparation",
        "student_id": "student",
        "exam_mode": True
    })

@router.get("/learning", response_class=HTMLResponse)
async def learning_page(request: Request, current_user: Dict[str, Any] = Depends(get_current_active_user)): # Added Auth
    """Your Learning dashboard page. Now requires authentication."""
    firestore_user_id = current_user["sub"]

    # Similar to /dashboard, fetch real student data if available
    student_data_from_db = None
    if _firestore_client_available:
        try:
            firestore_client: FirestoreClient = get_firestore_client()
            # Use Firebase UID (from token's 'sub' claim) to fetch student document
            student_doc = firestore_client.get_student_by_firebase_uid(firebase_uid=firestore_user_id)
            if student_doc:
                student_data_from_db = student_doc
                student_data_from_db.setdefault("name", current_user.get("name", "Learner"))
                student_data_from_db.setdefault("email", current_user.get("email", "N/A"))
                student_data_from_db['id'] = firestore_user_id # Ensure 'id' in template context is Firebase UID
                student_data_from_db.setdefault('firebase_uid', firestore_user_id)
            else: # Authenticated but no profile in students collection for this firebase_uid
                logger.warning(f"No student document found in Firestore for Firebase UID: {firestore_user_id} (for /learning).")
                student_data_from_db = {
                    "id": firestore_user_id, "firebase_uid": firestore_user_id,
                    "name": current_user.get("name", "New Learner"),
                    "email": current_user.get("email", "N/A"),
                    "status": "active_no_profile_firebase_uid_not_found_in_students"
                }
        except Exception as e:
            logger.error(f"Firestore error fetching student by Firebase UID {firestore_user_id} for /learning: {e}")
            student_data_from_db = {
                "id": firestore_user_id, "firebase_uid": firestore_user_id,
                "name": "Error User", "email": current_user.get("email", "N/A"), "error": str(e)
            }

    # Fallback to minimal data from token if DB interaction failed or no record
    student_data = student_data_from_db if student_data_from_db else {
        "id": firestore_user_id, "firebase_uid": firestore_user_id,
        "name": current_user.get("name", "Learner"), "email": current_user.get("email", "N/A")
    }

    return templates.TemplateResponse(request, "dashboard_new.html", { # dashboard_new.html is used as a generic layout
        "page_title": "Your Learning",
        "student_id": firestore_user_id, # This should be Firebase UID for template
        "student_data": student_data,
        "learning_mode": True,
        "current_user_jwt": current_user
    })

# API endpoints for the new dashboard features - apply auth

@router.post("/api/ai-chat", response_class=JSONResponse)
async def ai_chat_api(request: Request, current_user: Dict[str, Any] = Depends(get_current_active_user)): # Added Auth, Renamed
    """Handle AI assistant chat messages. Now requires authentication."""
    firestore_user_id = current_user["sub"]
    user_name = current_user.get("name", "Student")
    try:
        data = await request.json()
        user_message = data.get("message", "")
        
        if not user_message:
            raise HTTPException(status_code=400, detail="Message is required")
        
        # Get AI client for intelligent responses
        try:
            from core.ai_client import get_ai_client # Ensure this is importable
            ai_client = get_ai_client()
            
            # Generate context-aware response, including user ID and name
            context = {
                "user_id": firestore_user_id,
                "user_name": user_name,
                "user_type": "student", # Could be enhanced based on user profile
                "session_type": "chat_assistance",
                "timestamp": datetime.now().isoformat()
            }
            
            # Get AI-powered response
            chat_response = await ai_client.create_interactive_chat_response(user_message, context)
            
            return {
                "response": chat_response.get("response", "I'm here to help with your studies!"),
                "suggestions": chat_response.get("suggestions", [
                    "Ask about a specific topic",
                    "Request practice problems", 
                    "Get study tips"
                ]),
                "follow_up_questions": chat_response.get("follow_up_questions", [
                    "What subject are you working on?",
                    "Do you need help with homework?"
                ]),
                "timestamp": chat_response.get("timestamp", datetime.now().isoformat()),
                "source": "ai_powered"
            }
            
        except Exception as ai_error:
            # Fallback to predefined responses if AI fails
            logger.warning(f"AI chat failed: {str(ai_error)}. Using fallback responses.")
            
            # Fallback AI responses for common keywords
            ai_responses = {
                "study tips": "Here are some effective study techniques: 1) Use active recall, 2) Practice spaced repetition, 3) Take regular breaks, 4) Create mind maps for complex topics.",
                "schedule": "Based on your current progress, I recommend focusing on your most challenging subjects first when your energy is highest.",
                "motivation": "You're doing great! Every small step forward is progress. Keep up the excellent work!",
                "help": "I can help you with study planning, concept explanations, motivation, and tracking your progress. What would you like to work on?",
                "math": "Math can be challenging, but breaking problems into smaller steps makes them more manageable. What specific math topic are you working on?",
                "science": "Science is all about understanding how things work! What science concept would you like to explore?",
                "default": "I understand you're asking about studying. Could you be more specific about what you'd like help with?"
            }
            
            # Simple keyword matching for fallback
            response_key = "default"
            user_lower = user_message.lower()
            for key in ai_responses:
                if key in user_lower:
                    response_key = key
                    break
            
            return {
                "response": ai_responses[response_key],
                "timestamp": datetime.now().isoformat(),
                "suggestions": [
                    "Give me study tips",
                    "Help me plan my schedule",
                    "I need motivation",
                    "Explain this concept"
                ],
                "source": "fallback"
            }
            
    except Exception as e:
        logger.error(f"Error in AI chat: {str(e)}")
        return {"error": "Sorry, I couldn't process your message. Please try again."}

@router.get("/api/daily-planner/{student_id}", response_class=JSONResponse) # student_id in path is now mainly for explicit API clarity if kept
async def get_daily_planner_api(student_id: str, # Renamed
                            request: Request,
                            date: str = None,
                            current_user: Dict[str, Any] = Depends(get_current_active_user)): # Added Auth
    """Get daily planner data for a specific date. Now requires authentication."""
    authenticated_user_id = current_user["sub"]

    if student_id != authenticated_user_id: # Ensure user is requesting their own data
        raise HTTPException(status_code=403, detail="Forbidden: You can only access your own daily planner.")

    target_student_id = authenticated_user_id

    try:
        # Mock planner data (replace with database query for target_student_id)
        logger.info(f"Fetching daily planner for user {target_student_id}, date {date}")
        planner_data = {
            "date": date or datetime.now().strftime("%Y-%m-%d"),
            "student_id": target_student_id,
            "sessions": [
                {
                    "id": 1,
                    "time": "09:00",
                    "subject": "Mathematics",
                    "topic": "Calculus Derivatives",
                    "duration": 60,
                    "completed": True,
                    "type": "lesson"
                },
                {
                    "id": 2,
                    "time": "11:00",
                    "subject": "Physics",
                    "topic": "Newton's Laws Lab",
                    "duration": 90,
                    "completed": False,
                    "type": "lab"
                },
                {
                    "id": 3,
                    "time": "14:30",
                    "subject": "Chemistry",
                    "topic": "Organic Compounds Quiz",
                    "duration": 45,
                    "completed": False,
                    "type": "quiz"
                }
            ],
            "total_planned": 195,
            "completed_time": 60
        }
        return planner_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/daily-planner/update-session", response_class=JSONResponse)
async def update_planner_session_api(request: Request, current_user: Dict[str, Any] = Depends(get_current_active_user)): # Added Auth, renamed
    """Update a planner session. Now requires authentication."""
    firestore_user_id = current_user["sub"]
    try:
        data = await request.json()
        session_id = data.get("session_id")
        action = data.get("action")
        
        # Mock update logic (replace with database update, ensuring session_id belongs to firestore_user_id)
        logger.info(f"User {firestore_user_id} attempting to update session {session_id} with action: {action}")
        return {
            "success": True,
            "message": f"Session {session_id} {action}d successfully",
            "updated_session": {
                "id": session_id,
                "completed": action == "complete",
                "status": action
            }
        }
    except Exception as e:
        return {"error": "Failed to update session"}

@router.get("/api/progress-charts/{student_id}", response_class=JSONResponse) # student_id in path
async def get_progress_charts_api(student_id: str, # Renamed
                              request: Request,
                              current_user: Dict[str, Any] = Depends(get_current_active_user)): # Added Auth
    """Get chart data for progress visualization. Now requires authentication."""
    authenticated_user_id = current_user["sub"]
    if student_id != authenticated_user_id:
        raise HTTPException(status_code=403, detail="Forbidden: You can only access your own charts.")
    target_student_id = authenticated_user_id

    try:
        # Mock chart data (replace with actual calculations for target_student_id)
        logger.info(f"Fetching progress charts for user {target_student_id}")
        chart_data = {
            "weekly_progress": {
                "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                "data": [2.5, 3.2, 1.8, 4.1, 3.7, 2.3, 3.9],
                "target": 3.0
            },
            "subject_distribution": {
                "labels": ["Mathematics", "Physics", "Chemistry", "Biology"],
                "data": [35, 25, 25, 15],
                "colors": ["#5F60F5", "#10B981", "#F59E0B", "#EF4444"]
            },
            "performance_trend": {
                "labels": ["Week 1", "Week 2", "Week 3", "Week 4"],
                "quiz_scores": [78, 82, 85, 89],
                "assignment_scores": [85, 87, 90, 92]
            }
        }
        return chart_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/gamification/{student_id}", response_class=JSONResponse) # student_id in path
async def get_gamification_data_api(student_id: str, # Renamed
                                request: Request,
                                current_user: Dict[str, Any] = Depends(get_current_active_user)): # Added Auth
    """Get gamification data. Now requires authentication."""
    authenticated_user_id = current_user["sub"]
    if student_id != authenticated_user_id:
        raise HTTPException(status_code=403, detail="Forbidden: You can only access your own gamification data.")
    target_student_id = authenticated_user_id

    try:
        # Mock gamification data (replace with database query for target_student_id)
        logger.info(f"Fetching gamification data for user {target_student_id}")
        gamification_data = {
            "xp": {
                "current": 2450,
                "next_level": 2500,
                "total_earned": 12450,
                "level": 12
            },
            "streak": {
                "current": 7,
                "longest": 15,
                "streak_dates": ["2025-01-08", "2025-01-09", "2025-01-10", "2025-01-11", "2025-01-12", "2025-01-13", "2025-01-14"]
            },
            "achievements": [
                {"name": "Week Warrior", "description": "7-day study streak", "earned": True, "icon": "🔥", "date_earned": "2025-01-14"},
                {"name": "Quiz Master", "description": "Score 90+ on 5 quizzes", "earned": True, "icon": "🧠", "date_earned": "2025-01-10"},
                {"name": "Early Bird", "description": "Complete 5 morning sessions", "earned": False, "icon": "🌅", "progress": 3},
                {"name": "Perfectionist", "description": "Get 100% on any quiz", "earned": False, "icon": "⭐", "progress": 0}
            ],
            "leaderboard": {
                "rank": 156,
                "change": "+3",
                "top_students": [
                    {"name": "Sarah Chen", "xp": 15200, "rank": 1},
                    {"name": "Mike Johnson", "xp": 14890, "rank": 2},
                    {"name": "Emma Wilson", "xp": 14650, "rank": 3}
                ]
            }
        }
        return gamification_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/course/{course_id}/module/{module_id}", response_class=HTMLResponse)
async def course_module_page(request: Request, course_id: str, module_id: str, current_user: Dict[str, Any] = Depends(get_current_active_user)):
    """Course module page. Now requires authentication."""
    firebase_uid = current_user["sub"] # Changed variable name for clarity
    
    # Mock course data
    course_data = {
        "id": course_id,
        "title": "Introduction to Python Programming",
        "description": "Learn the fundamentals of Python programming language",
        "instructor": "Dr. Sarah Johnson",
        "duration": "8 weeks",
        "difficulty": "Beginner"
    }
    
    # Mock module data
    module_data = {
        "id": module_id,
        "title": "Python Basics and Syntax",
        "description": "Understanding Python's basic syntax and fundamental concepts",
        "video_url": f"/static/videos/module_{module_id}.mp4",
        "duration": "45 minutes",
        "lessons": [
            {
                "id": 1,
                "title": "What is Python?",
                "duration": "12:30",
                "video_id": "intro-python-1",
                "completed": True,
                "current": True
            },
            {
                "id": 2,
                "title": "Installing Python",
                "duration": "8:45",
                "video_id": "intro-python-2",
                "completed": True,
                "current": False
            },
            {
                "id": 3,
                "title": "Your First Program",
                "duration": "15:20",
                "video_id": "intro-python-3",
                "completed": False,
                "current": False
            }
        ]
    }
    
    # Mock student progress data (conceptually, fetch for firebase_uid, course_id, module_id)
    # If _firestore_client_available, you would fetch actual student data here using firebase_uid.
    # For now, just ensuring the ID used in mock data is the firebase_uid.
    student_data_for_page = {}
    if _firestore_client_available:
        try:
            firestore_client: FirestoreClient = get_firestore_client()
            student_doc = firestore_client.get_student_by_firebase_uid(firebase_uid=firebase_uid)
            if student_doc:
                student_data_for_page = student_doc
                student_data_for_page['id'] = firebase_uid # Ensure template 'id' is firebase_uid
                student_data_for_page.setdefault('name', current_user.get('name'))
                student_data_for_page.setdefault('email', current_user.get('email'))
            else:
                student_data_for_page = {'id': firebase_uid, 'name': current_user.get('name', 'Learner'), 'email': current_user.get('email')}
        except Exception as e:
            logger.error(f"Error fetching student data for course module page: {e}")
            student_data_for_page = {'id': firebase_uid, 'name': "Error User", 'email': current_user.get('email')}
    else: # Fallback if firestore not available
        student_data_for_page = {'id': firebase_uid, 'name': current_user.get('name', 'Learner'), 'email': current_user.get('email')}


    student_progress = {
        "student_id": firebase_uid, # Use Firebase UID
        "course_progress": 68,
        "module_progress": 45,
        "completed_lessons": 2,
        "total_lessons": 3,
        "time_spent": "2h 30m",
        "last_accessed": "2025-01-14"
    }
    
    # Mock AI-generated notes
    ai_notes = {
        "key_concepts": [
            "Python is a high-level, interpreted programming language",
            "Known for its simplicity and readability",
            "Widely used in web development, data science, and automation",
            "Features dynamic typing and automatic memory management"
        ],
        "important_points": {
            "title": "Why Python?",
            "content": "Python's syntax closely resembles natural language, making it an excellent choice for beginners. Its extensive library ecosystem and active community support make it powerful for professional development."
        },
        "code_examples": [
            {
                "title": "Your first Python program",
                "code": '# Your first Python program\nprint("Hello, World!")\n\n# Variables in Python\nname = "Alice"\nage = 25\nprint(f"My name is {name} and I am {age} years old")'
            }
        ],
        "action_items": [
            "Install Python on your computer",
            "Set up a code editor (VS Code recommended)",
            'Write and run your first "Hello, World!" program'
        ]
    }
    
    # Mock flashcards data
    flashcards = [
        {
            "id": 1,
            "front": "What is Python?",
            "back": "Python is a high-level, interpreted programming language known for its simplicity, readability, and versatility. It's widely used in web development, data science, machine learning, and automation.",
            "difficulty": "easy",
            "mastered": True
        },
        {
            "id": 2,
            "front": "What does 'interpreted' mean in programming?",
            "back": "An interpreted language is executed line by line by an interpreter at runtime, rather than being compiled into machine code beforehand. This makes development faster but execution slower than compiled languages.",
            "difficulty": "medium",
            "mastered": False
        },
        {
            "id": 3,
            "front": "Name three key features of Python",
            "back": "1. Simple and readable syntax\n2. Dynamic typing\n3. Extensive standard library and third-party packages",
            "difficulty": "medium",
            "mastered": True
        }
    ]
    
    # Mock discussion data
    discussion = {
        "total_messages": 23,
        "participants": 8,
        "messages": [
            {
                "id": 1,
                "author": "Alex Johnson",
                "author_role": "instructor",
                "content": "Great question about Python installation! For Windows users, I recommend downloading from the official python.org website. Make sure to check 'Add Python to PATH' during installation.",
                "timestamp": "2 hours ago",
                "likes": 12,
                "avatar": "/static/images/avatar-1.jpg"
            },
            {
                "id": 2,
                "author": "Sarah Chen",
                "author_role": "student",
                "content": "I'm having trouble understanding the difference between Python 2 and Python 3. Should I start with Python 3?",
                "timestamp": "1 hour ago",
                "likes": 5,
                "avatar": "/static/images/avatar-2.jpg"
            },
            {
                "id": 3,
                "author": "Mike Wilson",
                "author_role": "student",
                "content": "@Sarah Definitely start with Python 3! Python 2 reached end-of-life in 2020. All new projects should use Python 3, which is what this course covers.",
                "timestamp": "30 minutes ago",
                "likes": 8,
                "avatar": "/static/images/avatar-3.jpg"
            }
        ]
    }
    
    # Mock resources data
    resources = [
        {
            "id": 1,
            "title": "Python Cheat Sheet",
            "description": "Quick reference for Python syntax and common functions",
            "type": "pdf",
            "size": "2.3 MB",
            "url": "/static/resources/python-cheat-sheet.pdf",
            "icon": "fas fa-file-pdf"
        },
        {
            "id": 2,
            "title": "Sample Code Files",
            "description": "All code examples from this lesson",
            "type": "zip",
            "size": "156 KB",
            "url": "/static/resources/sample-code.zip",
            "icon": "fas fa-file-code"
        },
        {
            "id": 3,
            "title": "Python Official Documentation",
            "description": "Official Python documentation and tutorials",
            "type": "link",
            "url": "https://docs.python.org",
            "icon": "fas fa-link"
        }
    ]
    
    return templates.TemplateResponse(request, "course_module.html", {
        "course": course_data,
        "module": module_data,
        "student_progress": student_progress,
        "ai_notes": ai_notes,
        "flashcards": flashcards,
        "discussion": discussion,
        "resources": resources,
        "student_id": firebase_uid, # Ensure this is Firebase UID for template context
        "student_data": student_data_for_page, # Pass more complete student data if available
        "current_user_jwt": current_user
    })

# Quiz Interface Routes

@router.get("/quiz/{quiz_id}", response_class=HTMLResponse)
async def quiz_interface_page(request: Request, quiz_id: str, current_user: Dict[str, Any] = Depends(get_current_active_user)):
    """Modern quiz interface. Now requires authentication."""
    firebase_uid = current_user["sub"] # Changed variable name for clarity
    
    # Mock quiz data (replace with database query)
    quiz_data = {
        "quiz_id": quiz_id,
        "quiz_title": "Mathematics Assessment",
        "quiz_subject": "Algebra & Functions",
        "time_limit": 45,  # minutes
        "ai_hints_enabled": True,
        "questions": [
            {
                "question_text": "Solve for x: 2x + 5 = 13",
                "difficulty": "easy",
                "question_image": None,
                "options": [
                    {"label": "A", "text": "x = 4", "value": "A"},
                    {"label": "B", "text": "x = 6", "value": "B"},
                    {"label": "C", "text": "x = 8", "value": "C"},
                    {"label": "D", "text": "x = 9", "value": "D"}
                ]
            },
            {
                "question_text": "What is the slope of the line y = 3x - 2?",
                "difficulty": "medium",
                "question_image": None,
                "options": [
                    {"label": "A", "text": "3", "value": "A"},
                    {"label": "B", "text": "-2", "value": "B"},
                    {"label": "C", "text": "1", "value": "C"},
                    {"label": "D", "text": "5", "value": "D"}
                ]
            },
            {
                "question_text": "Factor the expression: x² - 9",
                "difficulty": "hard",
                "question_image": None,
                "options": [
                    {"label": "A", "text": "(x - 3)(x + 3)", "value": "A"},
                    {"label": "B", "text": "(x - 9)(x + 1)", "value": "B"},
                    {"label": "C", "text": "(x - 3)²", "value": "C"},
                    {"label": "D", "text": "Cannot be factored", "value": "D"}
                ]
            },
            {
                "question_text": "If f(x) = 2x + 1, what is f(5)?",
                "difficulty": "easy",
                "question_image": None,
                "options": [
                    {"label": "A", "text": "11", "value": "A"},
                    {"label": "B", "text": "10", "value": "B"},
                    {"label": "C", "text": "9", "value": "C"},
                    {"label": "D", "text": "6", "value": "D"}
                ]
            },
            {
                "question_text": "Which graph represents a linear function?",
                "difficulty": "medium",
                "question_image": "/static/images/quiz/graph-options.png",
                "options": [
                    {"label": "A", "text": "Straight line", "value": "A"},
                    {"label": "B", "text": "Parabola", "value": "B"},
                    {"label": "C", "text": "Circle", "value": "C"},
                    {"label": "D", "text": "Hyperbola", "value": "D"}
                ]
            }
        ]
    }
    
    return templates.TemplateResponse(request, "quiz_interface.html", {
        "student_id": firebase_uid, # Use Firebase UID
        **quiz_data, # Mocked quiz_data
        "current_user_jwt": current_user
    })

@router.post("/api/quiz/hints", response_class=JSONResponse)
async def get_quiz_hints_api(request: Request, current_user: Dict[str, Any] = Depends(get_current_active_user)):
    """Get AI-powered hints for quiz questions. Now requires authentication."""
    firebase_uid = current_user["sub"] # Changed variable name for clarity
    try:
        data = await request.json()
        quiz_id = data.get("quiz_id")
        question_id = data.get("question_id") # This is likely an index or specific ID
        question_text = data.get("question_text")
        # student_id from payload is no longer primary; use firebase_uid from token.

        logger.info(f"Hint request for user {firebase_uid}, quiz {quiz_id}, question {question_id if question_id else 'unknown'}")
        
        # Try to get AI-powered hints
        try:
            from core.ai_client import get_ai_client
            ai_client = get_ai_client()
            
            hint_request = {
                "question_text": question_text,
                "hint_type": "learning_hint",
                "difficulty_level": "progressive"
            }
            
            ai_response = await ai_client.generate_learning_hint(hint_request)
            
            return {
                "hint": ai_response.get("hint", "Break down the problem step by step."),
                "explanation": ai_response.get("explanation", ""),
                "learning_tip": ai_response.get("learning_tip", ""),
                "source": "ai_powered"
            }
            
        except Exception as ai_error:
            logger.warning(f"AI hints failed: {str(ai_error)}. Using fallback hints.")
            
            # Fallback hints based on question patterns
            fallback_hints = {
                "solve for x": {
                    "hint": "Isolate the variable x by performing the same operation on both sides of the equation.",
                    "explanation": "Remember the golden rule: whatever you do to one side, you must do to the other side.",
                    "learning_tip": "Work backwards from the variable - what operations are being done to x?"
                },
                "slope": {
                    "hint": "In the equation y = mx + b, the coefficient of x is the slope.",
                    "explanation": "The slope-intercept form is y = mx + b, where m is the slope and b is the y-intercept.",
                    "learning_tip": "Memorize the slope-intercept form - it's one of the most useful forms in algebra!"
                },
                "factor": {
                    "hint": "Look for patterns like difference of squares: a² - b² = (a-b)(a+b).",
                    "explanation": "x² - 9 can be written as x² - 3², which is a difference of squares.",
                    "learning_tip": "Common factoring patterns save time - learn to recognize them!"
                },
                "function": {
                    "hint": "Substitute the given value for x in the function and calculate.",
                    "explanation": "f(5) means substitute x = 5 into the function f(x) = 2x + 1.",
                    "learning_tip": "Function notation f(x) just means 'plug in x and calculate the result'."
                }
            }
            
            # Simple keyword matching for fallback hints
            hint_key = "default"
            question_lower = question_text.lower()
            for key in fallback_hints:
                if key in question_lower:
                    hint_key = key
                    break
            
            if hint_key in fallback_hints:
                return {**fallback_hints[hint_key], "source": "fallback"}
            else:
                return {
                    "hint": "Read the question carefully and identify what you're being asked to find.",
                    "explanation": "Break the problem into smaller steps and work through each part.",
                    "learning_tip": "Don't panic! Take your time and use the strategies you've learned.",
                    "source": "fallback"
                }
                
    except Exception as e:
        logger.error(f"Error getting quiz hints: {str(e)}")
        return {"error": "Unable to get hints at this time"}

@router.post("/api/quiz/save-progress", response_class=JSONResponse)
async def save_quiz_progress_api(request: Request, current_user: Dict[str, Any] = Depends(get_current_active_user)):
    """Save quiz progress. Now requires authentication."""
    firebase_uid = current_user["sub"] # Changed variable name for clarity
    try:
        data = await request.json()
        quiz_id = data.get("quiz_id")
        answers = data.get("answers", {})
        current_question = data.get("current_question", 0)
        flagged_questions = data.get("flagged_questions", [])
        time_remaining = data.get("time_remaining")
        
        # Save progress to database/storage, keyed by firebase_uid and quiz_id
        progress_key = f"quiz_progress_{quiz_id}_{firebase_uid}"
        logger.info(f"Saving quiz progress for user {firebase_uid}, quiz {quiz_id}.")
        progress_data = {
            "answers": answers,
            "current_question": current_question,
            "flagged_questions": flagged_questions,
            "time_remaining": time_remaining,
            "last_saved": datetime.now().isoformat()
        }
        
        # For now, store in memory (replace with database in production)
        quiz_results[progress_key] = progress_data
        
        return {
            "success": True,
            "message": "Progress saved successfully",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error saving quiz progress: {str(e)}")
        return {"error": "Failed to save progress"}

@router.get("/api/quiz/progress/{quiz_id}/{student_id}", response_class=JSONResponse) # student_id in path
async def get_quiz_progress_api(quiz_id: str, student_id: str, # Renamed
                             request: Request,
                             current_user: Dict[str, Any] = Depends(get_current_active_user)): # Added Auth
    """Get saved quiz progress. Now requires authentication."""
    authenticated_firebase_uid = current_user["sub"] # Changed variable name
    # Path parameter `student_id` here is expected to be the Firebase UID by this point.
    if student_id != authenticated_firebase_uid:
        raise HTTPException(status_code=403, detail="Forbidden: Cannot access this quiz progress.")

    target_firebase_uid = authenticated_firebase_uid # Use this for consistency

    try:
        progress_key = f"quiz_progress_{quiz_id}_{target_firebase_uid}"
        logger.info(f"Fetching quiz progress for user {target_firebase_uid}, quiz {quiz_id}.")
        progress_data = quiz_results.get(progress_key, {})
        
        return progress_data
        
    except Exception as e:
        logger.error(f"Error getting quiz progress: {str(e)}")
        return {"error": "Failed to load progress"}

@router.post("/api/quiz/submit", response_class=JSONResponse)
async def submit_quiz_api_final(request: Request, current_user: Dict[str, Any] = Depends(get_current_active_user)):
    """Submit completed quiz and calculate results. Now requires authentication."""
    firebase_uid = current_user["sub"] # Changed variable name for clarity
    try:
        data = await request.json()
        quiz_id = data.get("quiz_id")
        answers = data.get("answers", {})
        flagged_questions = data.get("flagged_questions", [])
        time_taken = data.get("time_taken", 0)
        
        logger.info(f"Quiz submission for user {firebase_uid}, quiz {quiz_id}.")

        # Calculate quiz results
        # Mock correct answers (in production, get from database)
        correct_answers = {
            "0": "A",  # 2x + 5 = 13, x = 4
            "1": "A",  # slope of y = 3x - 2 is 3
            "2": "A",  # x² - 9 = (x-3)(x+3)
            "3": "A",  # f(5) = 2(5) + 1 = 11
            "4": "A"   # linear function = straight line
        }
        
        # Calculate score
        total_questions = len(correct_answers)
        correct_count = 0
        question_results = {}
        
        for question_id, correct_answer in correct_answers.items():
            user_answer = answers.get(question_id)
            is_correct = user_answer == correct_answer
            if is_correct:
                correct_count += 1
            
            question_results[question_id] = {
                "user_answer": user_answer,
                "correct_answer": correct_answer,
                "is_correct": is_correct,
                "flagged": int(question_id) in flagged_questions
            }
        
        score_percentage = (correct_count / total_questions) * 100
        
        # Generate submission ID
        submission_id = f"sub_{quiz_id}_{firebase_uid}_{int(datetime.now().timestamp())}"
        
        # Save results (mocked, in prod use DB)
        quiz_results[submission_id] = {
            "quiz_id": quiz_id,
            "student_id": firebase_uid, # Store Firebase UID
            "answers": answers,
            "question_results": question_results,
            "score": score_percentage,
            "correct_count": correct_count,
            "total_questions": total_questions,
            "time_taken": time_taken,
            "flagged_questions": flagged_questions,
            "submitted_at": datetime.now().isoformat()
        }
        
        return {
            "success": True,
            "submission_id": submission_id,
            "score": score_percentage,
            "correct_count": correct_count,
            "total_questions": total_questions,
            "redirect_url": f"/quiz/results/{submission_id}"
        }
        
    except Exception as e:
        logger.error(f"Error submitting quiz: {str(e)}")
        return {"error": "Failed to submit quiz"}

@router.get("/quiz/results/{submission_id}", response_class=HTMLResponse)
async def quiz_results_page(request: Request, submission_id: str, current_user: Dict[str, Any] = Depends(get_current_active_user)): # Renamed, Added Auth
    """Display quiz results with detailed feedback. Now requires authentication."""
    firebase_uid = current_user["sub"] # Changed variable name for clarity
    try:
        results = quiz_results.get(submission_id) # Mock data
        if not results:
            raise HTTPException(status_code=404, detail="Quiz results not found.")
        
        # Security check: Ensure the results being viewed belong to the authenticated user
        if results.get("student_id") != firebase_uid: # Compare with Firebase UID from token
            logger.warning(f"User {firebase_uid} attempted to access quiz results for {submission_id} belonging to {results.get('student_id')}")
            raise HTTPException(status_code=403, detail="Forbidden: You can only view your own quiz results.")

        # Get question details for results display (mocked)
        quiz_questions = [
            {"question_text": "Solve for x: 2x + 5 = 13", "difficulty": "easy"},
            {"question_text": "What is the slope of the line y = 3x - 2?", "difficulty": "medium"},
            {"question_text": "Factor the expression: x² - 9", "difficulty": "hard"},
            {"question_text": "If f(x) = 2x + 1, what is f(5)?", "difficulty": "easy"},
            {"question_text": "Which graph represents a linear function?", "difficulty": "medium"}
        ]
        
        # Add question details to results
        detailed_results = []
        for i, (q_id, result) in enumerate(results["question_results"].items()):
            detailed_results.append({
                **result,
                "question_number": i + 1,
                "question_text": quiz_questions[i]["question_text"],
                "difficulty": quiz_questions[i]["difficulty"]
            })
        
        return templates.TemplateResponse(request, "quiz_results.html", {
            "submission_id": submission_id,
            "results": results,
            "detailed_results": detailed_results,
            "performance_level": "Excellent" if results["score"] >= 90 else "Good" if results["score"] >= 70 else "Needs Improvement"
        })
        
    except Exception as e:
        logger.error(f"Error displaying quiz results: {str(e)}")
        raise HTTPException(status_code=500, detail="Error loading quiz results")
