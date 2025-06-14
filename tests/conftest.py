import pytest
from fastapi.testclient import TestClient
from core.config import settings
from main import app
from datetime import datetime

@pytest.fixture
def client():
    """
    Test client fixture for FastAPI app
    """
    return TestClient(app)

@pytest.fixture
def sample_student():
    """
    Sample student data fixture
    """
    return {
        "student_id": "ST123",
        "name": "John Doe",
        "email": "john.doe@example.com"
    }

@pytest.fixture
def sample_learning_path():
    """
    Sample learning path fixture
    """
    return {
        "student_id": "ST123",
        "path_id": "LP1",
        "topics": ["Python Basics", "Data Structures", "Algorithms"],
        "planned_days": 30,
        "created_at": datetime.now()
    }

@pytest.fixture
def sample_quiz():
    """
    Sample quiz submission fixture
    """
    return {
        "student_id": "ST123",
        "quiz_id": "Q1",
        "answers": {
            "1": "A",
            "2": "B",
            "3": "C"
        }
    }
