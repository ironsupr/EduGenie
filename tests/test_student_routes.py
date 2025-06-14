import pytest
from fastapi.testclient import TestClient
from frontend.web_app.routes.student_routes import router
from fastapi import FastAPI

app = FastAPI()
app.include_router(router)
client = TestClient(app)

@pytest.fixture
def mock_learning_path():
    return {
        "student_id": "ST123",
        "path_id": "LP1",
        "topics": ["Python Basics", "Data Structures", "Algorithms"],
        "planned_days": 30
    }

@pytest.fixture
def mock_progress_entry():
    return {
        "student_id": "ST123",
        "topic": "Python Basics",
        "score": 85.5,
        "completed": True
    }

def test_student_routes_health():
    """Test basic health check of student routes"""
    response = client.get("/students/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

# Add more specific route tests here as they are implemented
