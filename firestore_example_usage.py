#!/usr/bin/env python3
"""
EduGenie Firestore Integration Example
This script demonstrates how to use the existing Firestore client in EduGenie
for common educational data operations.
"""

import sys
import os
from datetime import datetime, timedelta
from typing import Dict, List, Any

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import existing EduGenie modules
from core.firestore_client import get_firestore_client
from core.models import AssessmentAnalysis, ProgressEntry, LearningPath

def example_student_operations():
    """Demonstrate student profile operations"""
    print("👨‍🎓 Student Profile Operations")
    print("-" * 40)
    
    try:
        # Get the Firestore client
        client = get_firestore_client()
        
        # Create a student profile
        student_id = f"student_{int(datetime.now().timestamp())}"
        student_data = {
            "name": "Emma Wilson",
            "email": "emma.wilson@school.edu",
            "grade": "11th",
            "subjects": ["Mathematics", "Physics", "Computer Science"],
            "learning_style": "kinesthetic",
            "strengths": ["logical_reasoning", "problem_solving"],
            "weaknesses": ["time_management"],
            "enrollment_date": datetime.now().strftime("%Y-%m-%d"),
            "active": True
        }
        
        # Create the student
        success = client.create_student(student_id, student_data)
        if success:
            print(f"✅ Created student: {student_data['name']} ({student_id})")
        else:
            print("❌ Failed to create student")
            return None
        
        # Read the student back
        retrieved_student = client.get_student(student_id)
        if retrieved_student:
            print(f"📋 Retrieved: {retrieved_student['name']}")
            print(f"📚 Subjects: {', '.join(retrieved_student['subjects'])}")
        
        # Update student information
        updates = {
            "last_login": datetime.utcnow(),
            "total_sessions": 5,
            "preferred_study_time": "evening",
            "weaknesses": ["algebra", "time_management"]  # Updated weaknesses
        }
        
        success = client.update_student(student_id, updates)
        if success:
            print("✅ Updated student profile")
        
        return student_id
        
    except Exception as e:
        print(f"❌ Error in student operations: {str(e)}")
        return None

def example_quiz_operations(student_id: str):
    """Demonstrate quiz and assessment operations"""
    print(f"\n📝 Quiz and Assessment Operations for {student_id}")
    print("-" * 50)
    
    try:
        client = get_firestore_client()
        
        # Create assessment analysis
        analysis = AssessmentAnalysis(
            score=78,
            passed=True,
            weaknesses=["quadratic_equations", "word_problems"],
            strengths=["linear_equations", "basic_arithmetic"],
            recommendations=[
                "Practice more quadratic equation problems",
                "Work on translating word problems to equations",
                "Review factoring techniques"
            ]
        )
        
        # Save quiz results
        quiz_answers = {
            "q1": "B",  # Linear equations
            "q2": "C",  # Quadratic formula
            "q3": "A",  # Word problem
            "q4": "B",  # Factoring
            "q5": "D"   # Systems of equations
        }
        
        success = client.save_assessment(student_id, quiz_answers, analysis)
        if success:
            print(f"✅ Saved quiz assessment (Score: {analysis.score}%)")
        
        # Retrieve assessment history
        assessments = client.get_student_assessments(student_id, limit=3)
        print(f"📊 Assessment History ({len(assessments)} results):")
        for i, assessment in enumerate(assessments, 1):
            score = assessment.get('analysis', {}).get('score', 0)
            passed = assessment.get('analysis', {}).get('passed', False)
            date = assessment.get('submitted_at', 'Unknown')
            status = "✅ Passed" if passed else "❌ Failed"
            print(f"   {i}. Score: {score}% - {status} - {date}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error in quiz operations: {str(e)}")
        return False

def example_learning_path_operations(student_id: str):
    """Demonstrate learning path operations"""
    print(f"\n🛤️ Learning Path Operations for {student_id}")
    print("-" * 45)
    
    try:
        client = get_firestore_client()
        
        # Create a learning path
        learning_path = LearningPath(
            path_id=f"path_math_{student_id}",
            student_id=student_id,
            subject="Mathematics",
            topics=[
                "Linear Equations Review",
                "Quadratic Equations",
                "Systems of Linear Equations",
                "Polynomial Functions",
                "Rational Functions",
                "Exponential and Logarithmic Functions"
            ],
            difficulty="intermediate",
            estimated_hours=50
        )
        
        success = client.save_learning_path(learning_path)
        if success:
            print(f"✅ Created learning path: {learning_path.subject}")
            print(f"📚 Topics ({len(learning_path.topics)}):")
            for i, topic in enumerate(learning_path.topics, 1):
                print(f"   {i}. {topic}")
        
        # Get student's learning paths
        paths = client.get_student_learning_paths(student_id)
        print(f"\n📋 Student has {len(paths)} learning path(s)")
        
        return True
        
    except Exception as e:
        print(f"❌ Error in learning path operations: {str(e)}")
        return False

def example_progress_tracking(student_id: str):
    """Demonstrate progress tracking operations"""
    print(f"\n📈 Progress Tracking for {student_id}")
    print("-" * 35)
    
    try:
        client = get_firestore_client()
        
        # Log multiple progress entries
        progress_entries = [
            ProgressEntry(
                student_id=student_id,
                topic="Linear Equations",
                score=92,
                time_spent_minutes=45,
                completed=True,
                difficulty_level="medium"
            ),
            ProgressEntry(
                student_id=student_id,
                topic="Quadratic Equations",
                score=78,
                time_spent_minutes=60,
                completed=True,
                difficulty_level="hard"
            ),
            ProgressEntry(
                student_id=student_id,
                topic="Systems of Equations",
                score=85,
                time_spent_minutes=50,
                completed=True,
                difficulty_level="medium"
            )
        ]
        
        # Log each progress entry
        for entry in progress_entries:
            success = client.log_progress(entry)
            if success:
                status = "✅ Completed" if entry.completed else "⏳ In Progress"
                print(f"{status} {entry.topic}: {entry.score}% ({entry.time_spent_minutes}min)")
        
        # Fetch progress history
        print(f"\n📊 Progress History:")
        progress_history = client.fetch_progress(student_id, limit=10)
        
        total_time = 0
        total_score = 0
        completed_topics = 0
        
        for entry in progress_history:
            topic = entry.get('topic', 'Unknown')
            score = entry.get('score', 0)
            time_spent = entry.get('time_spent_minutes', 0)
            completed = entry.get('completed', False)
            
            total_time += time_spent
            total_score += score
            if completed:
                completed_topics += 1
            
            print(f"   📚 {topic}: {score}% in {time_spent}min")
        
        # Calculate summary statistics
        if progress_history:
            avg_score = total_score / len(progress_history)
            print(f"\n📈 Summary:")
            print(f"   📊 Average Score: {avg_score:.1f}%")
            print(f"   ⏱️ Total Study Time: {total_time} minutes")
            print(f"   ✅ Completed Topics: {completed_topics}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error in progress tracking: {str(e)}")
        return False

def example_lesson_content_operations():
    """Demonstrate lesson content operations"""
    print(f"\n📖 Lesson Content Operations")
    print("-" * 30)
    
    try:
        client = get_firestore_client()
        
        # Save lesson content
        lesson_data = {
            "title": "Introduction to Quadratic Equations",
            "content": """
            A quadratic equation is a polynomial equation of degree 2.
            The standard form is: ax² + bx + c = 0, where a ≠ 0.
            
            Key Concepts:
            1. Discriminant: Δ = b² - 4ac
            2. Quadratic Formula: x = (-b ± √Δ) / 2a
            3. Factoring methods
            4. Completing the square
            """,
            "examples": [
                "x² - 5x + 6 = 0  →  (x-2)(x-3) = 0",
                "2x² + 7x - 4 = 0  →  Use quadratic formula",
                "x² - 9 = 0  →  (x-3)(x+3) = 0"
            ],
            "exercises": [
                {
                    "question": "Solve: x² - 6x + 8 = 0",
                    "answer": "x = 2 or x = 4",
                    "method": "factoring"
                },
                {
                    "question": "Find the discriminant of: 3x² - 2x + 1 = 0",
                    "answer": "Δ = 4 - 12 = -8",
                    "method": "discriminant formula"
                }
            ],
            "video_url": "https://example.com/quadratic-intro.mp4",
            "difficulty": "intermediate",
            "estimated_time_minutes": 60,
            "prerequisites": ["linear_equations", "basic_algebra"]
        }
        
        topic = "Quadratic Equations"
        success = client.save_lesson_content(topic, lesson_data)
        if success:
            print(f"✅ Saved lesson: {lesson_data['title']}")
        
        # Retrieve lesson content
        retrieved_lesson = client.get_lesson_content(topic)
        if retrieved_lesson:
            content = retrieved_lesson.get('content', {})
            print(f"📖 Retrieved lesson: {content.get('title', 'Unknown')}")
            print(f"⏱️ Estimated time: {content.get('estimated_time_minutes', 0)} minutes")
            print(f"📚 Examples: {len(content.get('examples', []))}")
            print(f"✏️ Exercises: {len(content.get('exercises', []))}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error in lesson content operations: {str(e)}")
        return False

def example_advanced_queries():
    """Demonstrate advanced query operations"""
    print(f"\n🔍 Advanced Query Operations")
    print("-" * 30)
    
    try:
        client = get_firestore_client()
        
        # Get all students
        all_students = client.get_all_students()
        print(f"👥 Total active students: {len(all_students)}")
        
        # Example of updating weaknesses
        if all_students:
            sample_student = all_students[0]
            student_id = sample_student['id']
            
            # Update student weaknesses
            weaknesses = ["algebra", "geometry", "trigonometry"]
            success = client.update_weaknesses(student_id, weaknesses)
            if success:
                print(f"✅ Updated weaknesses for {sample_student.get('name', 'student')}")
        
        # Example of setting learning path
        if all_students:
            sample_student = all_students[0]
            student_id = sample_student['id']
            
            learning_plan = [
                {"topic": "Algebra Review", "estimated_hours": 10, "priority": "high"},
                {"topic": "Geometry Basics", "estimated_hours": 15, "priority": "medium"},
                {"topic": "Trigonometry Intro", "estimated_hours": 12, "priority": "low"}
            ]
            
            success = client.set_learning_path(student_id, learning_plan)
            if success:
                print(f"✅ Set learning path for {sample_student.get('name', 'student')}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error in advanced queries: {str(e)}")
        return False

def main():
    """Main demonstration function"""
    print("🚀 EduGenie Firestore Integration Demo")
    print("="*50)
    
    try:
        # Test connection
        client = get_firestore_client()
        print("✅ Connected to Firestore successfully!\n")
        
        # Run demonstrations
        student_id = example_student_operations()
        
        if student_id:
            example_quiz_operations(student_id)
            example_learning_path_operations(student_id)
            example_progress_tracking(student_id)
        
        example_lesson_content_operations()
        example_advanced_queries()
        
        print(f"\n🎉 Demo completed successfully!")
        print(f"📝 Remember to clean up test data if needed")
        
        # Optional cleanup
        if student_id:
            cleanup = input(f"\n🧹 Delete test student {student_id}? (y/N): ")
            if cleanup.lower() == 'y':
                success = client.delete_student(student_id)
                if success:
                    print("✅ Test student deleted")
                else:
                    print("❌ Failed to delete test student")
        
    except Exception as e:
        print(f"❌ Demo failed: {str(e)}")
        print("""
💡 Troubleshooting Tips:
1. Check your service account key file path
2. Verify GOOGLE_CLOUD_PROJECT_ID environment variable
3. Ensure proper Firestore permissions
4. Run: python test_firestore.py to verify setup
        """)

if __name__ == "__main__":
    main()
