# frontend/web_app/routes/student_routes.py

from fastapi import APIRouter, Request, Depends, Form, HTTPException, Query
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from typing import Optional, List
import json
import asyncio
from datetime import datetime, timedelta
import logging

# Import authentication dependencies from core
from core.auth_models import UserProfile
# from core.youtube_service import YouTubeService  # Commented out for now

# Setup logging
def setup_logger(name):
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    if not logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    return logger

logger = setup_logger(__name__)

# Simple auth dependency for now
def get_current_user() -> Optional[UserProfile]:
    """Simple auth dependency - replace with real implementation"""
    return None

def require_auth() -> UserProfile:
    """Simple require auth dependency - replace with real implementation"""
    # For now, return a mock user or raise an exception
    # In production, this should validate the user session
    return None

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
async def dashboard(
    request: Request, 
    current_user: UserProfile = Depends(require_auth)
):
    """Modern student dashboard with gamification and AI assistant"""
    # Enhanced dashboard data using current user info
    student_data = {
        "name": current_user.full_name,
        "email": current_user.email,
        "profile_picture": current_user.avatar_url or "/static/images/default-avatar.png",
        "level": 12,
        "current_xp": 2450,
        "xp_to_next_level": 500,
        "current_streak": 7,
        "longest_streak": 15,
        "global_rank": 156,
        "rank_change": "+3",
        "user_id": current_user.user_id,
        "subscription_plan": current_user.subscription_plan,
        "learning_goal": current_user.learning_goal,
        "experience_level": current_user.experience_level
    }
    
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
        "achievements": [            {"name": "Week Warrior", "description": "7-day study streak", "earned": True, "icon": "🔥"},
            {"name": "Quiz Master", "description": "Score 90+ on 5 quizzes", "earned": True, "icon": "🧠"},
            {"name": "Early Bird", "description": "Complete morning sessions", "earned": False, "icon": "🌅"},
            {"name": "Perfectionist", "description": "Get 100% on any quiz", "earned": False, "icon": "⭐"}
        ]
    }
    
    return templates.TemplateResponse(request, "dashboard_new.html", {
        "student_id": current_user.user_id,
        "student_data": student_data,
        "dashboard_data": dashboard_data
    })

@router.post("/start-quiz", response_class=HTMLResponse)
async def start_quiz(request: Request, student_id: str = Form(...)):
    """Start assessment quiz"""
    if not student_id.strip():
        return templates.TemplateResponse(request, "index.html", {"error": "Please enter your name or student ID"})
    
    # Store student data
    students_data[student_id] = {
        "name": student_id,
        "start_time": datetime.now().isoformat()
    }
    
    return templates.TemplateResponse(request, "quiz.html", {"student_id": student_id})

@router.post("/submit-quiz", response_class=HTMLResponse)
async def submit_quiz(
    request: Request, 
    student_id: str = Form(...), 
    q1: str = Form(...), 
    q2: str = Form(...),
    q3: str = Form(...)
):
    """Submit quiz and generate learning path"""
    try:
        # Store quiz results
        answers = {"q1": q1, "q2": q2, "q3": q3}
        quiz_results[student_id] = {
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
        
        return templates.TemplateResponse(request, "learning_path_new.html", {"student_id": student_id,
            "topics": weaknesses,
            "strengths": strengths,
            "score": score_percentage,
            "total_questions": 3,
            "correct_answers": correct_answers})
        
    except Exception as e:
        return templates.TemplateResponse(request, "quiz.html", {"student_id": student_id,
            "error": "An error occurred while processing your quiz. Please try again."})

@router.get("/api/student/{student_id}/progress", response_class=JSONResponse)
async def get_student_progress(student_id: str):
    """API endpoint to get student progress data"""
    try:
        # Mock progress data (replace with database query)
        progress = {
            "student_id": student_id,
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
async def study_topic(request: Request, topic: str, student_id: str = None):
    """Study page for specific topic"""
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
        "student_id": student_id})

# Health check moved to main.py to avoid route conflicts

# Landing page routes
@router.get("/login", response_class=HTMLResponse)
async def login_page(request: Request, message: str = None):
    """Login page"""
    context = {"request": request}
    if message:
        context["message"] = message
    return templates.TemplateResponse("login.html", context)

@router.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    """Registration page"""
    return templates.TemplateResponse("register.html", {"request": request})

@router.get("/forgot-password", response_class=HTMLResponse)
async def forgot_password_page(request: Request):
    """Forgot password page"""
    return templates.TemplateResponse("forgot_password.html", {"request": request})

@router.get("/reset-password", response_class=HTMLResponse)
async def reset_password_page(request: Request, token: str):
    """Reset password page"""
    return templates.TemplateResponse("reset_password.html", {
        "request": request,
        "token": token
    })

@router.get("/demo", response_class=HTMLResponse)
async def demo_page(request: Request):
    """Demo page showing platform features"""
    # Create mock progress data for the demo
    demo_progress = {
        "current_streak": 7,
        "total_points": 2450,
        "completed_topics": 15,
        "total_topics": 20,
        "weekly_hours": 28,
        "overall_progress": 75
    }
    
    return templates.TemplateResponse(request, "dashboard.html", {
        "demo_mode": True,
        "student_id": "demo_user",
        "progress": demo_progress
    })

@router.get("/contact", response_class=HTMLResponse)
async def contact_page(request: Request):
    """Contact sales page"""
    return templates.TemplateResponse(request, "index.html", {"page_title": "Contact Sales",
        "contact_mode": True})

@router.get("/courses", response_class=HTMLResponse)
async def courses_page(
    request: Request,
    current_user: Optional[UserProfile] = Depends(get_current_user)
):
    """Comprehensive Courses page with YouTube playlist integration"""
    
    # Sample course data (replace with database queries)
    featured_courses = [
        {
            'id': 'python-basics',
            'title': 'Python Programming for Beginners',
            'description': 'Learn Python from scratch with this comprehensive course covering all the fundamentals.',
            'category': 'programming',
            'level': 'beginner',
            'type': 'interactive',
            'thumbnail': '/static/images/python-course.jpg',
            'instructor': 'Dr. Sarah Johnson',
            'duration': '8 weeks',
            'video_count': None,
            'enrolled_count': 1250,
            'rating': 4.8,
            'is_free': True,
            'is_new': True
        },
        {
            'id': 'yt-js-tutorial',
            'title': 'Complete JavaScript Tutorial',
            'description': 'Master JavaScript with this comprehensive YouTube playlist covering ES6+, DOM manipulation, and more.',
            'category': 'programming',
            'level': 'intermediate',
            'type': 'youtube',
            'thumbnail': 'https://i.ytimg.com/vi/sample/maxresdefault.jpg',
            'instructor': 'Code Academy',
            'duration': '12 hours',
            'video_count': 45,
            'enrolled_count': 2890,
            'rating': 4.9,
            'url': 'https://www.youtube.com/playlist?list=PLsample123',
            'is_free': True,
            'is_new': False
        },
        {
            'id': 'math-calculus',
            'title': 'Calculus I - Differential Calculus',
            'description': 'AI-guided learning path for mastering differential calculus with personalized practice problems.',
            'category': 'mathematics',
            'level': 'intermediate',
            'type': 'guided',
            'thumbnail': '/static/images/calculus-course.jpg',
            'instructor': 'Prof. Michael Chen',
            'duration': '10 weeks',
            'video_count': None,
            'enrolled_count': 892,
            'rating': 4.7,
            'is_free': False,
            'price': 49,
            'is_new': False
        }
    ]
    
    all_courses = [
        *featured_courses,
        {
            'id': 'yt-machine-learning',
            'title': 'Machine Learning Course - Stanford CS229',
            'description': 'Complete machine learning course from Stanford University available on YouTube.',
            'category': 'programming',
            'level': 'advanced',
            'type': 'youtube',
            'thumbnail': 'https://i.ytimg.com/vi/sample2/maxresdefault.jpg',
            'instructor': 'Stanford University',
            'duration': '20 hours',
            'video_count': 32,
            'enrolled_count': 15420,
            'rating': 4.9,
            'url': 'https://www.youtube.com/playlist?list=PLsample456',
            'is_free': True,
            'is_new': False
        },
        {
            'id': 'chemistry-organic',
            'title': 'Organic Chemistry Fundamentals',
            'description': 'Learn the basics of organic chemistry with interactive 3D molecular models.',
            'category': 'science',
            'level': 'beginner',
            'type': 'interactive',
            'thumbnail': '/static/images/chemistry-course.jpg',
            'instructor': 'Dr. Emily Rodriguez',
            'duration': '6 weeks',
            'video_count': None,
            'enrolled_count': 567,
            'rating': 4.6,
            'is_free': False,
            'price': 39,
            'is_new': True
        },
        {
            'id': 'yt-spanish-beginner',
            'title': 'Learn Spanish - Complete Beginner Course',
            'description': 'Comprehensive Spanish learning playlist for absolute beginners.',
            'category': 'language',
            'level': 'beginner',
            'type': 'youtube',
            'thumbnail': 'https://i.ytimg.com/vi/sample3/maxresdefault.jpg',
            'instructor': 'SpanishPod101',
            'duration': '15 hours',
            'video_count': 60,
            'enrolled_count': 8234,
            'rating': 4.8,
            'url': 'https://www.youtube.com/playlist?list=PLsample789',
            'is_free': True,
            'is_new': False
        }
    ]
    
    stats = {
        'total_courses': len(all_courses),
        'youtube_playlists': len([c for c in all_courses if c['type'] == 'youtube']),
        'active_learners': '12K+'
    }
    
    return templates.TemplateResponse(request, "courses.html", {
        "page_title": "Courses",
        "user": current_user,
        "featured_courses": featured_courses,
        "all_courses": all_courses,
        "stats": stats
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
async def learning_page(request: Request, student_id: str = "student"):
    """Your Learning dashboard page"""
    return templates.TemplateResponse(request, "dashboard_new.html", {
        "page_title": "Your Learning",
        "student_id": student_id,
        "learning_mode": True
    })

# API endpoints for the new dashboard features

@router.post("/api/ai-chat", response_class=JSONResponse)
async def ai_chat(request: Request):
    """Handle AI assistant chat messages using Google AI SDK"""
    try:
        data = await request.json()
        user_message = data.get("message", "")
        
        if not user_message:
            return {"error": "Message is required"}
        
        # Get AI client for intelligent responses
        try:
            from core.ai_client import get_ai_client
            ai_client = get_ai_client()
            
            # Generate context-aware response
            context = {
                "user_type": "student",
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

@router.get("/api/daily-planner/{student_id}", response_class=JSONResponse)
async def get_daily_planner(student_id: str, date: str = None):
    """Get daily planner data for a specific date"""
    try:
        # Mock planner data (replace with database query)
        planner_data = {
            "date": date or datetime.now().strftime("%Y-%m-%d"),
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
async def update_planner_session(request: Request):
    """Update a planner session (mark as completed, reschedule, etc.)"""
    try:
        data = await request.json()
        session_id = data.get("session_id")
        action = data.get("action")  # "complete", "reschedule", "cancel"
        
        # Mock update logic (replace with database update)
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

@router.get("/api/progress-charts/{student_id}", response_class=JSONResponse)
async def get_progress_charts(student_id: str):
    """Get chart data for progress visualization"""
    try:
        # Mock chart data (replace with actual calculations)
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

@router.get("/api/gamification/{student_id}", response_class=JSONResponse)
async def get_gamification_data(student_id: str):
    """Get gamification data including XP, streaks, and achievements"""
    try:
        # Mock gamification data (replace with database query)
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
async def course_module(request: Request, course_id: str, module_id: str, student_id: str = None):
    """Course module page with video player, AI notes, flashcards, and discussion"""
      # Enhanced course data with module information
    course_data = {
        "id": course_id,
        "title": "Introduction to Python Programming",
        "description": "Learn the fundamentals of Python programming language",
        "instructor": "Dr. Sarah Johnson",
        "duration": "8 weeks",
        "difficulty": "Beginner",
        "category": "Programming",
        "total_modules": 5,
        "completed_modules": 1,
        "course_progress": 68,
        "enrollment_date": "2025-01-01",
        "last_accessed": "2025-01-14",
        "course_image": "/static/images/python-course-banner.jpg",
        "navigation": {
            "previous_module": None if module_id == "basics" else "introduction", 
            "next_module": "variables" if module_id == "basics" else None,
            "course_url": f"/courses",
            "dashboard_url": f"/dashboard?student_id={student_id or 'demo'}"
        }
    }
    
    # Mock module data
    module_data = {
        "id": module_id,
        "title": "Python Basics and Syntax",
        "description": "Understanding Python's basic syntax and fundamental concepts",
        "video_url": f"/static/videos/module_{module_id}.mp4",
        "duration": "45 minutes",
        "lessons": [            {
                "id": 1,
                "title": "What is Python?",
                "duration": "12:30",
                "video_id": "intro-python-1",
                "source_type": "youtube",
                "youtube_id": "dQw4w9WgXcQ",  # Replace with actual Python tutorial video ID
                "completed": True,
                "current": True
            },
            {
                "id": 2,
                "title": "Installing Python",
                "duration": "8:45",
                "video_id": "intro-python-2",
                "source_type": "youtube",
                "youtube_id": "kJQP7kiw5Fk",  # Replace with actual Python installation video ID
                "completed": True,
                "current": False
            },
            {
                "id": 3,
                "title": "Your First Program",
                "duration": "15:20",
                "video_id": "intro-python-3",
                "source_type": "youtube",
                "youtube_id": "rfscVS0vtbw",  # Replace with actual Python programming video ID
                "completed": False,
                "current": False
            }
        ]
    }
    
    # Mock student progress data
    student_progress = {
        "student_id": student_id or "demo_student",
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
            "id": 3,            "title": "Python Official Documentation",
            "description": "Official Python documentation and tutorials",
            "type": "link",
            "url": "https://docs.python.org",
            "icon": "fas fa-link"
        }
    ]
    
    # Enhanced course data with module information
    enhanced_course_data = {
        "id": course_id,
        "title": "Introduction to Python Programming",
        "description": "Learn the fundamentals of Python programming language",
        "instructor": "Dr. Sarah Johnson",
        "duration": "8 weeks",
        "difficulty": "Beginner",
        "category": "Programming",
        "total_modules": 5,
        "completed_modules": 1,
        "course_progress": 68,
        "enrollment_date": "2025-01-01",
        "last_accessed": "2025-01-14",
        "course_image": "/static/images/python-course-banner.jpg",
        "navigation": {
            "previous_module": None if module_id == "basics" else "introduction", 
            "next_module": "variables" if module_id == "basics" else None,
            "course_url": f"/courses",
            "dashboard_url": f"/dashboard?student_id={student_id or 'demo'}"
        }
    }    
    return templates.TemplateResponse(request, "course_module.html", {
        "course": course_data,
        "module": module_data,
        "student_progress": student_progress,
        "ai_notes": ai_notes,
        "flashcards": flashcards,
        "discussion": discussion,
        "resources": resources,
        "student_id": student_id or "demo_student"
    })

# Quiz Interface Routes

@router.get("/quiz/{quiz_id}", response_class=HTMLResponse)
async def quiz_interface(request: Request, quiz_id: str, student_id: str = None):
    """Modern quiz interface with AI hints, timer, and navigation"""
    if not student_id:
        raise HTTPException(status_code=400, detail="Student ID is required")
    
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
        "student_id": student_id,
        **quiz_data
    })

@router.post("/api/quiz/hints", response_class=JSONResponse)
async def get_quiz_hints(request: Request):
    """Get AI-powered hints for quiz questions"""
    try:
        data = await request.json()
        quiz_id = data.get("quiz_id")
        question_id = data.get("question_id")
        question_text = data.get("question_text")
        student_id = data.get("student_id")
        
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
async def save_quiz_progress(request: Request):
    """Save quiz progress for auto-save functionality"""
    try:
        data = await request.json()
        quiz_id = data.get("quiz_id")
        student_id = data.get("student_id")
        answers = data.get("answers", {})
        current_question = data.get("current_question", 0)
        flagged_questions = data.get("flagged_questions", [])
        time_remaining = data.get("time_remaining")
        
        # Save progress to database/storage
        # In production, save to database
        progress_key = f"quiz_progress_{quiz_id}_{student_id}"
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

@router.get("/api/quiz/progress/{quiz_id}/{student_id}", response_class=JSONResponse)
async def get_quiz_progress(quiz_id: str, student_id: str):
    """Get saved quiz progress"""
    try:
        progress_key = f"quiz_progress_{quiz_id}_{student_id}"
        progress_data = quiz_results.get(progress_key, {})
        
        return progress_data
        
    except Exception as e:
        logger.error(f"Error getting quiz progress: {str(e)}")
        return {"error": "Failed to load progress"}

@router.post("/api/quiz/submit", response_class=JSONResponse)
async def submit_quiz(request: Request):
    """Submit completed quiz and calculate results"""
    try:
        data = await request.json()
        quiz_id = data.get("quiz_id")
        student_id = data.get("student_id")
        answers = data.get("answers", {})
        flagged_questions = data.get("flagged_questions", [])
        time_taken = data.get("time_taken", 0)
        
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
        submission_id = f"sub_{quiz_id}_{student_id}_{int(datetime.now().timestamp())}"
        
        # Save results
        quiz_results[submission_id] = {
            "quiz_id": quiz_id,
            "student_id": student_id,
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
async def quiz_results(request: Request, submission_id: str):
    """Display quiz results with detailed feedback"""
    try:
        results = quiz_results.get(submission_id)
        if not results:
            raise HTTPException(status_code=404, detail="Quiz results not found")
        
        # Get question details for results display
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

@router.get("/profile", response_class=HTMLResponse)
async def profile_page(
    request: Request, 
    current_user: Optional[UserProfile] = Depends(get_current_user)
):
    """User profile and settings page"""
    try:
        # Check if user is authenticated
        if not current_user:
            # Redirect to login instead of dashboard
            return RedirectResponse(url="/login?redirect=/profile", status_code=302)
        
        # Generate mock user stats (replace with actual data from database)
        user_stats = {
            "courses_completed": 12,
            "study_hours": 85,
            "achievements": 8,
            "streak_days": 7
        }
        
        # Generate mock current goal (replace with actual data)
        current_goal = {
            "title": "Complete Python Fundamentals",
            "progress": 65,
            "deadline": "2024-02-15"
        }
        
        context = {
            "request": request,
            "user": current_user,
            "user_stats": user_stats,
            "current_goal": current_goal
        }
        
        return templates.TemplateResponse("profile.html", context)
        
    except Exception as e:
        logger.error(f"Error loading profile page: {str(e)}")
        # Redirect to login on error instead of dashboard
        return RedirectResponse(url="/login?error=profile_error", status_code=302)

# Add a simple dashboard route for testing without auth
@router.get("/dashboard-test", response_class=HTMLResponse)
async def dashboard_test(request: Request):
    """Simple dashboard for testing navbar without authentication"""
    # Mock student data for testing
    student_data = {
        "name": "Test User",
        "email": "test@example.com",
        "profile_picture": "/static/images/profile-logo.svg",
        "level": 12,
        "current_xp": 2450,
        "xp_to_next_level": 500,
        "current_streak": 7,
        "longest_streak": 15,
        "global_rank": 156,
        "rank_change": "+3",
        "user_id": "test-user-123",
        "subscription_plan": "pro",
        "learning_goal": "Master Python",
        "experience_level": "intermediate"
    }
    
    return templates.TemplateResponse(
        request,
        "dashboard.html",
        {
            "student_data": student_data,
            "student_id": "test-user"
        }
    )

# Add a test profile route without authentication
@router.get("/profile-test", response_class=HTMLResponse)
async def profile_test(request: Request):
    """Test profile page without authentication for testing navbar"""
    try:
        # Mock user data for testing
        mock_user = {
            "user_id": "test-user-123",
            "full_name": "Test User",
            "email": "test@example.com",
            "avatar_url": "/static/images/profile-logo.svg",
            "subscription_plan": "pro",
            "learning_goal": "Master Python",
            "experience_level": "intermediate"
        }
        
        # Generate mock user stats
        user_stats = {
            "courses_completed": 12,
            "study_hours": 85,
            "achievements": 8,
            "streak_days": 7
        }
        
        # Generate mock current goal
        current_goal = {
            "title": "Complete Python Fundamentals",
            "progress": 65,
            "deadline": "2024-02-15"
        }
        
        context = {
            "request": request,
            "user": mock_user,
            "user_stats": user_stats,
            "current_goal": current_goal
        }
        
        return templates.TemplateResponse("profile.html", context)
        
    except Exception as e:
        logger.error(f"Error loading test profile page: {str(e)}")
        raise HTTPException(status_code=500, detail="Error loading profile page")

# API endpoint for adding YouTube playlists as courses
@router.post("/api/courses/add-youtube-playlist", response_class=JSONResponse)
async def add_youtube_playlist(
    request: Request,
    playlist_url: str = Form(...),
    category: str = Form("programming"),
    level: str = Form("beginner"),
    current_user: Optional[UserProfile] = Depends(get_current_user)
):
    """Add a YouTube playlist as a course"""
    try:
        # YouTube service temporarily disabled
        # youtube_service = YouTubeService()
        # playlist_info = await youtube_service.get_playlist_info(playlist_url)
        
        # Mock response for now
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "YouTube playlist feature temporarily disabled",
                "playlist_id": "mock_playlist"
            }
        )
        
    except Exception as e:
        logger.error(f"Error adding YouTube playlist: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": "Failed to add YouTube playlist. Please try again."}
        )

# API endpoints for course functionality
@router.get("/api/courses/search", response_class=JSONResponse)
async def search_courses(
    request: Request,
    q: Optional[str] = None,
    category: Optional[str] = None,
    level: Optional[str] = None,
    type: Optional[str] = None,
    sort: Optional[str] = "newest",
    page: int = 1,
    limit: int = 20
):
    """Search and filter courses with pagination"""
    try:
        # Get all courses (in production, this would be from database)
        all_courses = get_all_courses_data()
        
        # Apply filters
        filtered_courses = all_courses.copy()
        
        # Search by query
        if q:
            q_lower = q.lower()
            filtered_courses = [
                course for course in filtered_courses
                if (q_lower in course['title'].lower() or 
                    q_lower in course['description'].lower() or
                    q_lower in course['instructor'].lower())
            ]
        
        # Filter by category
        if category:
            filtered_courses = [
                course for course in filtered_courses
                if course['category'] == category
            ]
        
        # Filter by level
        if level:
            filtered_courses = [
                course for course in filtered_courses
                if course['level'] == level
            ]
        
        # Filter by type
        if type:
            filtered_courses = [
                course for course in filtered_courses
                if course['type'] == type
            ]
        
        # Sort courses
        if sort == "popular":
            filtered_courses.sort(key=lambda x: x['enrolled_count'], reverse=True)
        elif sort == "rating":
            filtered_courses.sort(key=lambda x: x['rating'], reverse=True)
        elif sort == "title":
            filtered_courses.sort(key=lambda x: x['title'])
        else:  # newest
            filtered_courses.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        # Apply pagination
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_courses = filtered_courses[start_idx:end_idx]
        
        return JSONResponse(
            status_code=200,
            content={
                "courses": paginated_courses,
                "total": len(filtered_courses),
                "page": page,
                "limit": limit,
                "has_more": end_idx < len(filtered_courses)
            }
        )
        
    except Exception as e:
        logger.error(f"Error searching courses: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": "Failed to search courses"}
        )

@router.get("/api/courses/categories", response_class=JSONResponse)
async def get_course_categories():
    """Get all available course categories with counts"""
    try:
        all_courses = get_all_courses_data()
        
        # Count courses by category
        category_counts = {}
        for course in all_courses:
            category = course['category']
            category_counts[category] = category_counts.get(category, 0) + 1
        
        categories = [
            {"name": "programming", "label": "Programming", "count": category_counts.get("programming", 0)},
            {"name": "mathematics", "label": "Mathematics", "count": category_counts.get("mathematics", 0)},
            {"name": "science", "label": "Science", "count": category_counts.get("science", 0)},
            {"name": "language", "label": "Languages", "count": category_counts.get("language", 0)},
            {"name": "business", "label": "Business", "count": category_counts.get("business", 0)},
            {"name": "art", "label": "Design", "count": category_counts.get("art", 0)},
        ]
        
        return JSONResponse(
            status_code=200,
            content={"categories": categories}
        )
        
    except Exception as e:
        logger.error(f"Error getting categories: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": "Failed to get categories"}
        )

@router.post("/api/courses/bookmark", response_class=JSONResponse)
async def toggle_course_bookmark(
    request: Request,
    course_id: str = Form(...),
    current_user: Optional[UserProfile] = Depends(get_current_user)
):
    """Toggle bookmark status for a course"""
    try:
        if not current_user:
            return JSONResponse(
                status_code=401,
                content={"error": "Authentication required"}
            )
        
        # In production, save to database
        # For now, we'll just return success
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "bookmarked": True,  # Would check actual status from database
                "message": "Course bookmark updated"
            }
        )
        
    except Exception as e:
        logger.error(f"Error toggling bookmark: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": "Failed to update bookmark"}
        )

@router.get("/api/courses/stats", response_class=JSONResponse)
async def get_course_stats():
    """Get course statistics for the hero section"""
    try:
        all_courses = get_all_courses_data()
        
        youtube_count = len([c for c in all_courses if c['type'] == 'youtube'])
        interactive_count = len([c for c in all_courses if c['type'] in ['interactive', 'guided']])
        total_learners = sum(course['enrolled_count'] for course in all_courses)
        
        stats = {
            'total_courses': interactive_count,
            'youtube_playlists': youtube_count,
            'active_learners': f"{total_learners // 1000}K+" if total_learners >= 1000 else str(total_learners)
        }
        
        return JSONResponse(
            status_code=200,
            content=stats
        )
        
    except Exception as e:
        logger.error(f"Error getting course stats: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": "Failed to get course stats"}
        )

def get_all_courses_data():
    """Helper function to get all courses data (replace with database query in production)"""
    return [
        {
            'id': 'python-basics',
            'title': 'Python Programming for Beginners',
            'description': 'Learn Python from scratch with this comprehensive course covering all the fundamentals.',
            'category': 'programming',
            'level': 'beginner',
            'type': 'interactive',
            'thumbnail': '/static/images/python-course.jpg',
            'instructor': 'Dr. Sarah Johnson',
            'duration': '8 weeks',
            'video_count': None,
            'enrolled_count': 1250,
            'rating': 4.8,
            'is_free': True,
            'is_new': True,
            'created_at': '2024-01-15T00:00:00Z'
        },
        {
            'id': 'yt-js-tutorial',
            'title': 'Complete JavaScript Tutorial',
            'description': 'Master JavaScript with this comprehensive YouTube playlist covering ES6+, DOM manipulation, and more.',
            'category': 'programming',
            'level': 'intermediate',
            'type': 'youtube',
            'thumbnail': 'https://i.ytimg.com/vi/sample/maxresdefault.jpg',
            'instructor': 'Code Academy',
            'duration': '12 hours',
            'video_count': 45,
            'enrolled_count': 2890,
            'rating': 4.9,
            'url': 'https://www.youtube.com/playlist?list=PLsample123',
            'is_free': True,
            'is_new': False,
            'created_at': '2024-02-01T00:00:00Z'
        },
        {
            'id': 'math-calculus',
            'title': 'Calculus I - Differential Calculus',
            'description': 'AI-guided learning path for mastering differential calculus with personalized practice problems.',
            'category': 'mathematics',
            'level': 'intermediate',
            'type': 'guided',
            'thumbnail': '/static/images/calculus-course.jpg',
            'instructor': 'Prof. Michael Chen',
            'duration': '10 weeks',
            'video_count': None,
            'enrolled_count': 892,
            'rating': 4.7,
            'is_free': False,
            'price': 49,
            'is_new': False,
            'created_at': '2024-01-30T00:00:00Z'
        },
        {
            'id': 'yt-machine-learning',
            'title': 'Machine Learning Course - Stanford CS229',
            'description': 'Complete machine learning course from Stanford University available on YouTube.',
            'category': 'programming',
            'level': 'advanced',
            'type': 'youtube',
            'thumbnail': 'https://i.ytimg.com/vi/sample2/maxresdefault.jpg',
            'instructor': 'Stanford University',
            'duration': '20 hours',
            'video_count': 32,
            'enrolled_count': 15420,
            'rating': 4.9,
            'url': 'https://www.youtube.com/playlist?list=PLsample456',
            'is_free': True,
            'is_new': False,
            'created_at': '2024-01-10T00:00:00Z'
        },
        {
            'id': 'chemistry-organic',
            'title': 'Organic Chemistry Fundamentals',
            'description': 'Learn the basics of organic chemistry with interactive 3D molecular models.',
            'category': 'science',
            'level': 'beginner',
            'type': 'interactive',
            'thumbnail': '/static/images/chemistry-course.jpg',
            'instructor': 'Dr. Emily Rodriguez',
            'duration': '6 weeks',
            'video_count': None,
            'enrolled_count': 567,
            'rating': 4.6,
            'is_free': False,
            'price': 39,
            'is_new': True,
            'created_at': '2024-02-10T00:00:00Z'
        },
        {
            'id': 'yt-spanish-beginner',
            'title': 'Learn Spanish - Complete Beginner Course',
            'description': 'Comprehensive Spanish learning playlist for absolute beginners.',
            'category': 'language',
            'level': 'beginner',
            'type': 'youtube',
            'thumbnail': 'https://i.ytimg.com/vi/sample3/maxresdefault.jpg',
            'instructor': 'SpanishPod101',
            'duration': '15 hours',
            'video_count': 60,
            'enrolled_count': 8234,
            'rating': 4.8,
            'url': 'https://www.youtube.com/playlist?list=PLsample789',
            'is_free': True,
            'is_new': False,
            'created_at': '2024-01-20T00:00:00Z'
        },
        {
            'id': 'data-science-intro',
            'title': 'Introduction to Data Science',
            'description': 'Learn data analysis, visualization, and machine learning basics with Python.',
            'category': 'programming',
            'level': 'intermediate',
            'type': 'interactive',
            'thumbnail': '/static/images/data-science-course.jpg',
            'instructor': 'Dr. Amanda Wilson',
            'duration': '12 weeks',
            'video_count': None,
            'enrolled_count': 3421,
            'rating': 4.8,
            'is_free': False,
            'price': 79,
            'is_new': True,
            'created_at': '2024-02-15T00:00:00Z'
        },
        {
            'id': 'yt-physics-fundamentals',
            'title': 'Physics Fundamentals - Complete Course',
            'description': 'Comprehensive physics course covering mechanics, thermodynamics, and electromagnetism.',
            'category': 'science',
            'level': 'intermediate',
            'type': 'youtube',
            'thumbnail': 'https://i.ytimg.com/vi/sample4/maxresdefault.jpg',
            'instructor': 'Physics Online',
            'duration': '25 hours',
            'video_count': 75,
            'enrolled_count': 12567,
            'rating': 4.9,
            'url': 'https://www.youtube.com/playlist?list=PLsample101112',
            'is_free': True,
            'is_new': False,
            'created_at': '2024-01-05T00:00:00Z'
        }
    ]

# Add navigation helper for course modules
@router.get("/course/{course_id}", response_class=RedirectResponse)
async def redirect_to_course_module(course_id: str, student_id: str = None):
    """Redirect to the first module of a course"""
    # Map course IDs to their first module IDs
    course_module_map = {
        'python-basics': 'basics',
        'math-calculus': 'derivatives', 
        'chemistry-organic': 'fundamentals',
        'javascript-advanced': 'es6-features',
        'data-structures': 'arrays-lists'
    }
    
    module_id = course_module_map.get(course_id, 'introduction')
    redirect_url = f"/course/{course_id}/module/{module_id}"
    
    if student_id:
        redirect_url += f"?student_id={student_id}"
    
    return RedirectResponse(url=redirect_url, status_code=302)
