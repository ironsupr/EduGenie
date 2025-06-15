# frontend/web_app/routes/student_routes.py

from fastapi import APIRouter, Request, Form, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from typing import Optional, Dict, Any
from datetime import datetime
import json

templates = Jinja2Templates(directory="templates")
router = APIRouter()

# Mock data store (replace with database in production)
students_data = {}
quiz_results = {}

@router.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """Modern landing page for EduGenie"""
    return templates.TemplateResponse(request, "landing.html")

@router.get("/dashboard", response_class=HTMLResponse)
async def dashboard(request: Request, student_id: str = None):
    """Modern student dashboard with gamification and AI assistant"""
    if not student_id:
        return templates.TemplateResponse(request, "dashboard_new.html", {
            "error": "Please provide a student ID"
        })
    
    # Enhanced mock data for the new dashboard
    student_data = students_data.get(student_id, {
        "name": "Alex Johnson",
        "email": "alex.johnson@student.edu",
        "profile_picture": "/static/images/default-avatar.png",
        "level": 12,
        "current_xp": 2450,
        "xp_to_next_level": 500,
        "current_streak": 7,
        "longest_streak": 15,
        "global_rank": 156,
        "rank_change": "+3"
    })
    
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
        "student_id": student_id,
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

@router.get("/health")
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
    return templates.TemplateResponse(request, "index.html", {"page_title": "Sign In",
        "login_mode": True})

@router.get("/register", response_class=HTMLResponse)
async def register_page(request: Request, plan: str = "starter"):
    """Registration page with plan selection"""
    return templates.TemplateResponse(request, "index.html", {"page_title": "Get Started",
        "register_mode": True,
        "selected_plan": plan})

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

# API endpoints for the new dashboard features

@router.post("/api/ai-chat", response_class=JSONResponse)
async def ai_chat(request: Request):
    """Handle AI assistant chat messages"""
    try:
        data = await request.json()
        user_message = data.get("message", "")
        
        # Mock AI responses (replace with actual AI integration)
        ai_responses = {
            "study tips": "Here are some effective study techniques: 1) Use active recall, 2) Practice spaced repetition, 3) Take regular breaks, 4) Create mind maps for complex topics.",
            "schedule": "Based on your current progress, I recommend focusing on Physics for the next 2 hours, then reviewing Chemistry concepts.",
            "motivation": "You're doing great! Your 7-day streak shows real dedication. Keep up the excellent work!",
            "help": "I can help you with study planning, concept explanations, motivation, and tracking your progress. What would you like to work on?",
            "default": "I understand you're asking about studying. Could you be more specific about what you'd like help with?"
        }
        
        # Simple keyword matching for demo
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
            ]
        }
    except Exception as e:
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
        "student_id": student_id or "demo_student"
    })
