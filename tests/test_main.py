"""
Main application test suite
"""
import pytest
from fastapi.testclient import TestClient
from main import app
from core.models import StudentBase, QuizSubmission
from datetime import datetime

client = TestClient(app)

def test_home():
    """Test the home endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()
    assert "Welcome to EduGenie" in response.json()["message"]

def test_invalid_route():
    """Test handling of invalid routes"""
    response = client.get("/nonexistent")
    assert response.status_code == 404
    assert response.json()["detail"] == "Not Found"

@pytest.fixture
def sample_student_data():
    """Fixture for sample student data"""
    return {
        "student_id": "ST123",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "learning_style": "visual"
    }

@pytest.fixture
def sample_quiz_submission():
    """Fixture for sample quiz submission"""
    return {
        "student_id": "ST123",
        "quiz_id": "Q1",
        "answers": {
            "1": {"answer": "A", "topic": "algebra"},
            "2": {"answer": "B", "topic": "geometry"},
            "3": {"answer": "C", "topic": "calculus"}
        },
        "difficulty": "beginner",
        "submitted_at": datetime.utcnow().isoformat(),
        "time_taken": 300
    }

def test_cors_headers():
    """Test CORS headers are properly set"""
    response = client.options("/", 
        headers={
            "origin": "http://localhost:3000",
            "access-control-request-method": "GET"
        }
    )
    assert response.status_code == 200
    assert "access-control-allow-origin" in response.headers
    assert response.headers["access-control-allow-origin"] == "*"
    assert "access-control-allow-methods" in response.headers
    assert "GET" in response.headers["access-control-allow-methods"]

def test_student_model_validation():
    """Test student model validation"""
    # Test valid student data
    student = StudentBase(
        student_id="ST123",
        name="John Doe",
        email="john.doe@example.com",
        learning_style="visual"
    )
    assert student.student_id == "ST123"
    assert student.name == "John Doe"
    
    # Test invalid email format
    with pytest.raises(ValueError):
        StudentBase(
            student_id="ST123",
            name="John Doe",
            email="invalid-email"
        )
    
    # Test invalid name length
    with pytest.raises(ValueError):
        StudentBase(
            student_id="ST123",
            name="",
            email="john.doe@example.com"
        )

def test_quiz_submission_model():
    """Test quiz submission model validation"""
    # Test valid submission
    submission = QuizSubmission(
        student_id="ST123",
        quiz_id="Q1",
        answers={
            "1": {"answer": "A", "topic": "algebra"},
            "2": {"answer": "B", "topic": "geometry"}
        },
        difficulty="beginner",
        time_taken=300
    )
    assert submission.student_id == "ST123"
    assert len(submission.answers) == 2
    assert submission.time_taken == 300
    
    # Test invalid student_id
    with pytest.raises(ValueError):
        QuizSubmission(
            student_id="",
            quiz_id="Q1",
            answers={}
        )
