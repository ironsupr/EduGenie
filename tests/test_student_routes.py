import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import pytest
from httpx import AsyncClient
from main import app
import uuid

@pytest.mark.asyncio
async def test_full_auth_flow():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # 1. Register a new user
        unique_email = f"testuser_{uuid.uuid4()}@example.com"
        password = "testpassword"
        response = await ac.post("/api/auth/register", data={"email": unique_email, "password": password, "full_name": "Test User"})
        assert response.status_code == 200
        assert "user" in response.json()
        assert "user_id" in response.json()["user"]

        # 2. Log in with the new user
        login_response = await ac.post("/api/auth/login", data={"email": unique_email, "password": password})
        assert login_response.status_code == 200
        assert "access_token" in login_response.json()
        token = login_response.json()["access_token"]

        # 3. Access the dashboard with the token
        headers = {"Authorization": f"Bearer {token}"}
        dashboard_response = await ac.get("/app/dashboard", headers=headers)
        
        # Follow redirect
        if dashboard_response.status_code == 307:
            redirect_url = dashboard_response.headers["location"]
            dashboard_response = await ac.get(redirect_url, headers=headers)

        assert dashboard_response.status_code == 200
        assert "Welcome back" in dashboard_response.text
