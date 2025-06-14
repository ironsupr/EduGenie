"""
Tests for health check endpoints
"""
import pytest
from fastapi.testclient import TestClient
from datetime import datetime
from main import app

client = TestClient(app)

def test_health_check_success():
    """Test successful health check response"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    
    # Check required fields
    assert "api" in data
    assert "timestamp" in data
    assert "version" in data
    assert "services" in data
    assert "database" in data
    
    # Check services status
    assert data["api"] == "healthy"
    assert isinstance(data["timestamp"], str)
    assert datetime.fromisoformat(data["timestamp"])  # Validates ISO format
    assert isinstance(data["version"], str)
    
    # Check service components
    services = data["services"]
    assert "assessment" in services
    assert "content_generator" in services
    assert "progress_tracker" in services
    assert services["assessment"] in ["healthy", "unhealthy"]
    assert services["content_generator"] in ["healthy", "unhealthy"]
    assert services["progress_tracker"] in ["healthy", "unhealthy"]

def test_health_check_database():
    """Test database status in health check"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "database" in data
    assert data["database"] in ["healthy", "unhealthy"]

@pytest.mark.asyncio
async def test_check_database_health():
    """Test database health check function"""
    from main import check_database_health
    status = await check_database_health()
    assert status in ["healthy", "unhealthy"]