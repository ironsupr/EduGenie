#!/usr/bin/env python3
"""
Quick API test script for EduGenie
"""

import requests
import json
import time

def test_api_endpoints():
    """Test the main API endpoints"""
    base_url = "http://localhost:8000"
    
    endpoints = [
        "/health",
        "/",
        "/api/student/chat"
    ]
    
    print("🧪 Testing EduGenie API Endpoints")
    print("=" * 50)
    
    for endpoint in endpoints:
        try:
            url = f"{base_url}{endpoint}"
            print(f"Testing: {url}")
            
            if endpoint == "/api/student/chat":
                # Test chat endpoint with POST
                payload = {"message": "Hello, can you help me with math?"}
                response = requests.post(url, json=payload, timeout=10)
            else:
                # Test other endpoints with GET
                response = requests.get(url, timeout=10)
            
            print(f"  Status: {response.status_code}")
            
            if response.status_code == 200:
                print(f"  ✅ Success")
                if len(response.text) < 200:
                    print(f"  Response: {response.text}")
                else:
                    print(f"  Response: {response.text[:100]}...")
            else:
                print(f"  ❌ Failed")
                print(f"  Error: {response.text}")
            
            print()
            
        except requests.exceptions.ConnectionError:
            print(f"  ❌ Connection failed - is the server running?")
            print()
        except Exception as e:
            print(f"  ❌ Error: {str(e)}")
            print()

if __name__ == "__main__":
    test_api_endpoints()
