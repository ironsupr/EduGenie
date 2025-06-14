#!/usr/bin/env python3
"""
Test script for the new dashboard API endpoints
This demonstrates how the new dashboard features work
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://127.0.0.1:8000"

def test_ai_chat():
    """Test the AI chat endpoint"""
    print("🤖 Testing AI Chat...")
    
    messages = [
        "Give me study tips",
        "Help me plan my schedule",
        "I need motivation",
        "What should I focus on today?"
    ]
    
    for message in messages:
        response = requests.post(f"{BASE_URL}/api/ai-chat", 
                               json={"message": message})
        if response.status_code == 200:
            data = response.json()
            print(f"  User: {message}")
            print(f"  AI: {data['response'][:100]}...")
            print()
        else:
            print(f"  Error: {response.status_code}")

def test_daily_planner():
    """Test the daily planner endpoint"""
    print("📅 Testing Daily Planner...")
    
    student_id = "alex_123"
    response = requests.get(f"{BASE_URL}/api/daily-planner/{student_id}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"  Date: {data['date']}")
        print(f"  Sessions planned: {len(data['sessions'])}")
        print(f"  Total time: {data['total_planned']} minutes")
        print(f"  Completed: {data['completed_time']} minutes")
        
        print("  Sessions:")
        for session in data['sessions']:
            status = "✅" if session['completed'] else "⏳"
            print(f"    {status} {session['time']} - {session['subject']}: {session['topic']}")
    else:
        print(f"  Error: {response.status_code}")

def test_progress_charts():
    """Test the progress charts endpoint"""
    print("📊 Testing Progress Charts...")
    
    student_id = "alex_123"
    response = requests.get(f"{BASE_URL}/api/progress-charts/{student_id}")
    
    if response.status_code == 200:
        data = response.json()
        print("  Weekly Progress:")
        weekly = data['weekly_progress']
        for i, (day, hours) in enumerate(zip(weekly['labels'], weekly['data'])):
            print(f"    {day}: {hours} hours")
        
        print(f"\n  Subject Distribution:")
        subject_dist = data['subject_distribution']
        for label, percentage in zip(subject_dist['labels'], subject_dist['data']):
            print(f"    {label}: {percentage}%")
    else:
        print(f"  Error: {response.status_code}")

def test_gamification():
    """Test the gamification endpoint"""
    print("🎮 Testing Gamification...")
    
    student_id = "alex_123"
    response = requests.get(f"{BASE_URL}/api/gamification/{student_id}")
    
    if response.status_code == 200:
        data = response.json()
        
        # XP Info
        xp = data['xp']
        print(f"  Level: {xp['level']}")
        print(f"  Current XP: {xp['current']}/{xp['next_level']}")
        print(f"  Total XP Earned: {xp['total_earned']}")
        
        # Streak Info
        streak = data['streak']
        print(f"\n  Current Streak: {streak['current']} days 🔥")
        print(f"  Longest Streak: {streak['longest']} days")
        
        # Achievements
        print(f"\n  Achievements:")
        for achievement in data['achievements']:
            status = "🏆" if achievement['earned'] else "🔒"
            print(f"    {status} {achievement['name']}: {achievement['description']}")
            
        # Leaderboard
        leaderboard = data['leaderboard']
        print(f"\n  Global Rank: #{leaderboard['rank']} ({leaderboard['change']})")
    else:
        print(f"  Error: {response.status_code}")

def test_dashboard_page():
    """Test that the dashboard page loads"""
    print("🏠 Testing Dashboard Page...")
    
    response = requests.get(f"{BASE_URL}/dashboard?student_id=alex_123")
    
    if response.status_code == 200:
        print("  ✅ Dashboard page loaded successfully!")
        print(f"  Response size: {len(response.content)} bytes")
    else:
        print(f"  ❌ Error loading dashboard: {response.status_code}")

if __name__ == "__main__":
    print("🚀 Testing EduGenie Dashboard API Endpoints")
    print("=" * 50)
    
    try:
        test_dashboard_page()
        print()
        test_ai_chat()
        print()
        test_daily_planner()
        print()
        test_progress_charts()
        print()
        test_gamification()
        
        print("\n🎉 All tests completed!")
        print("\n💡 You can now visit: http://127.0.0.1:8000/dashboard?student_id=alex_123")
        print("   to see your beautiful new dashboard in action!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the server.")
        print("   Make sure the web application is running with: python main.py")
    except Exception as e:
        print(f"❌ Error: {e}")
