#!/usr/bin/env python3
"""
Test script for Firestore integration with EduGenie
Run this script to verify your Firestore setup is working correctly.
"""

import os
import sys
from datetime import datetime
from typing import Dict, Any

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from core.firestore_client import get_firestore_client
from core.models import AssessmentAnalysis, ProgressEntry, LearningPath

def test_firestore_connection():
    """Test basic Firestore connectivity."""
    print("🔍 Testing Firestore connection...")
    
    try:
        # Initialize client
        client = get_firestore_client()
        print("✅ Successfully initialized Firestore client")
        return True
    except Exception as e:
        print(f"❌ Failed to initialize Firestore client: {e}")
        return False

def test_student_crud():
    """Test CRUD operations on students collection."""
    print("\n👨‍🎓 Testing Student CRUD operations...")
    
    try:
        client = get_firestore_client()
        test_student_id = f"test_student_{int(datetime.now().timestamp())}"
        
        # Test CREATE
        student_data = {
            "name": "Test Student",
            "email": "test@example.com",
            "grade": "10th",
            "subjects": ["Mathematics", "Science"],
            "learning_style": "visual",
            "weaknesses": [],
            "strengths": ["problem_solving"]
        }
        
        success = client.create_student(test_student_id, student_data)
        if not success:
            raise Exception("Failed to create student")
        print(f"✅ Created student: {test_student_id}")
        
        # Test READ
        student = client.get_student(test_student_id)
        if not student or student["name"] != "Test Student":
            raise Exception("Failed to read student or data mismatch")
        print(f"✅ Read student: {student['name']}")
        
        # Test UPDATE
        updates = {
            "grade": "11th",
            "weaknesses": ["algebra"],
            "last_login": datetime.utcnow()
        }
        success = client.update_student(test_student_id, updates)
        if not success:
            raise Exception("Failed to update student")
        print("✅ Updated student successfully")
        
        # Verify update
        updated_student = client.get_student(test_student_id)
        if updated_student["grade"] != "11th":
            raise Exception("Update verification failed")
        print("✅ Verified student update")
        
        # Test DELETE (soft delete)
        success = client.delete_student(test_student_id)
        if not success:
            raise Exception("Failed to delete student")
        print("✅ Soft deleted student successfully")
        
        return True
        
    except Exception as e:
        print(f"❌ Student CRUD test failed: {e}")
        return False

def test_assessment_operations():
    """Test assessment-related operations."""
    print("\n📝 Testing Assessment operations...")
    
    try:
        client = get_firestore_client()
        test_student_id = f"assessment_test_{int(datetime.now().timestamp())}"
        
        # Create a test student first
        student_data = {"name": "Assessment Test Student", "email": "assessment@test.com"}
        client.create_student(test_student_id, student_data)
        
        # Test assessment saving
        answers = {"q1": "B", "q2": "A", "q3": "C"}
        
        # Create mock assessment analysis
        analysis = {
            "score": 85,
            "passed": True,
            "weaknesses": ["quadratic_equations"],
            "strengths": ["linear_functions"],
            "recommendations": ["Practice more quadratic problems"]
        }
        
        success = client.save_assessment(test_student_id, answers, analysis)
        if not success:
            raise Exception("Failed to save assessment")
        print("✅ Saved assessment successfully")
        
        # Test retrieving assessments
        assessments = client.get_student_assessments(test_student_id)
        if not assessments or len(assessments) == 0:
            raise Exception("Failed to retrieve assessments")
        print(f"✅ Retrieved {len(assessments)} assessment(s)")
        
        # Verify assessment data
        latest_assessment = assessments[0]
        if latest_assessment["score"] != 85:
            raise Exception("Assessment data verification failed")
        print("✅ Verified assessment data")
        
        # Clean up
        client.delete_student(test_student_id)
        
        return True
        
    except Exception as e:
        print(f"❌ Assessment operations test failed: {e}")
        return False

def test_progress_tracking():
    """Test progress tracking operations."""
    print("\n📈 Testing Progress tracking...")
    
    try:
        client = get_firestore_client()
        test_student_id = f"progress_test_{int(datetime.now().timestamp())}"
        
        # Create a test student
        student_data = {"name": "Progress Test Student", "email": "progress@test.com"}
        client.create_student(test_student_id, student_data)
        
        # Test progress logging
        progress_entries = [
            {
                "student_id": test_student_id,
                "topic": "Linear Equations",
                "score": 92,
                "time_spent_minutes": 45,
                "completed": True,
                "difficulty_level": "medium"
            },
            {
                "student_id": test_student_id,
                "topic": "Quadratic Equations", 
                "score": 78,
                "time_spent_minutes": 60,
                "completed": True,
                "difficulty_level": "hard"
            }
        ]
        
        for entry_data in progress_entries:
            success = client.log_progress(entry_data)
            if not success:
                raise Exception(f"Failed to log progress for {entry_data['topic']}")
        
        print(f"✅ Logged {len(progress_entries)} progress entries")
        
        # Test retrieving progress
        progress_history = client.fetch_progress(test_student_id)
        if len(progress_history) != len(progress_entries):
            raise Exception("Progress retrieval count mismatch")  
        print(f"✅ Retrieved {len(progress_history)} progress entries")
        
        # Verify progress data
        topics = [p["topic"] for p in progress_history]
        if "Linear Equations" not in topics or "Quadratic Equations" not in topics:
            raise Exception("Progress data verification failed")
        print("✅ Verified progress data")
        
        # Clean up
        client.delete_student(test_student_id)
        
        return True
        
    except Exception as e:
        print(f"❌ Progress tracking test failed: {e}")
        return False

def test_lesson_content():
    """Test lesson content operations."""
    print("\n📚 Testing Lesson content operations...")
    
    try:
        client = get_firestore_client()
        
        # Test lesson content saving
        topic = f"Test Topic {int(datetime.now().timestamp())}"
        lesson_data = {
            "title": f"Introduction to {topic}",
            "content": "This is test lesson content...",
            "examples": ["Example 1", "Example 2"],
            "exercises": [
                {"question": "Test question?", "answer": "Test answer"},
            ],
            "video_url": "https://example.com/video.mp4",
            "difficulty": "beginner",
            "estimated_time_minutes": 30
        }
        
        success = client.save_lesson_content(topic, lesson_data)
        if not success:
            raise Exception("Failed to save lesson content")
        print(f"✅ Saved lesson content for: {topic}")
        
        # Test retrieving lesson content
        retrieved_lesson = client.get_lesson_content(topic)
        if not retrieved_lesson or retrieved_lesson["content"]["title"] != lesson_data["title"]:
            raise Exception("Failed to retrieve lesson content or data mismatch")
        print("✅ Retrieved and verified lesson content")
        
        return True
        
    except Exception as e:
        print(f"❌ Lesson content test failed: {e}")
        return False

def test_search_and_batch_operations():
    """Test search and batch operations."""
    print("\n🔍 Testing Search and batch operations...")
    
    try:
        client = get_firestore_client()
        test_students = []
        
        # Create multiple test students
        for i in range(3):
            student_id = f"batch_test_{i}_{int(datetime.now().timestamp())}"
            student_data = {
                "name": f"Batch Test Student {i}",
                "email": f"batch{i}@test.com",
                "grade": "10th",
                "test_batch": True
            }
            client.create_student(student_id, student_data)
            test_students.append(student_id)
        
        print(f"✅ Created {len(test_students)} test students for batch operations")
        
        # Test search
        all_students = client.get_all_students()
        batch_students = [s for s in all_students if s.get("test_batch")]
        
        if len(batch_students) < 3:
            raise Exception("Search operation failed - not all test students found")
        print(f"✅ Found {len(batch_students)} test students via search")
        
        # Test batch update
        batch_updates = []
        for student_id in test_students:
            batch_updates.append({
                "student_id": student_id,
                "batch_updated": True,
                "batch_update_time": datetime.utcnow()
            })
        
        success = client.batch_update_students(batch_updates)
        if not success:
            raise Exception("Batch update failed")
        print("✅ Batch updated students successfully")
        
        # Verify batch update
        for student_id in test_students:
            student = client.get_student(student_id)
            if not student.get("batch_updated"):
                raise Exception("Batch update verification failed")
        print("✅ Verified batch update")
        
        # Clean up
        for student_id in test_students:
            client.delete_student(student_id)
        print("✅ Cleaned up test students")
        
        return True
        
    except Exception as e:
        print(f"❌ Search and batch operations test failed: {e}")
        return False

def run_all_tests():
    """Run all Firestore integration tests."""
    print("🚀 Starting Firestore Integration Tests for EduGenie\n")
    
    tests = [
        ("Connection Test", test_firestore_connection),
        ("Student CRUD", test_student_crud),
        ("Assessment Operations", test_assessment_operations),
        ("Progress Tracking", test_progress_tracking),
        ("Lesson Content", test_lesson_content),
        ("Search & Batch Operations", test_search_and_batch_operations)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            if result:
                passed += 1
            print("")  # Add spacing between tests
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}\n")
    
    print("=" * 50)
    print(f"🏁 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Your Firestore integration is working correctly.")
    else:
        failed = total - passed
        print(f"⚠️  {failed} test(s) failed. Please check your Firestore configuration.")
        
        if passed == 0:
            print("\n💡 Troubleshooting tips:")
            print("1. Make sure your service account key file exists and path is correct")
            print("2. Verify your Google Cloud project ID is correct")
            print("3. Check that Firestore is enabled in your Google Cloud project")
            print("4. Ensure your service account has proper Firestore permissions")
    
    return passed == total

if __name__ == "__main__":
    # Check for environment setup
    if not os.path.exists(".env") and not os.path.exists("firestore-service-account.json"):
        print("⚠️  Warning: No .env file or service account key found.")
        print("Please set up your environment variables or service account key file.")
        print("See FIRESTORE_INTEGRATION_GUIDE.md for setup instructions.\n")
    
    success = run_all_tests()
    sys.exit(0 if success else 1)
