#!/usr/bin/env python3
"""
Complete Google Firestore Integration Example for EduGenie
This script demonstrates how to:
1. Authenticate with Firestore using service account
2. Perform CRUD operations on students collection
3. Store and retrieve quiz results, learning paths, and lesson content
4. Handle errors and implement best practices
"""

import os
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from google.cloud import firestore
from google.oauth2 import service_account
from dataclasses import dataclass, asdict
from pathlib import Path

# Enhanced data models for type safety
@dataclass
class StudentProfile:
    """Student profile data model"""
    student_id: str
    name: str
    email: str
    grade: str
    subjects: List[str]
    learning_style: str
    weaknesses: List[str] = None
    strengths: List[str] = None
    created_at: datetime = None
    updated_at: datetime = None
    status: str = "active"
    
    def __post_init__(self):
        if self.weaknesses is None:
            self.weaknesses = []
        if self.strengths is None:
            self.strengths = []
        if self.created_at is None:
            self.created_at = datetime.utcnow()
        if self.updated_at is None:
            self.updated_at = datetime.utcnow()

@dataclass
class QuizResult:
    """Quiz result data model"""
    student_id: str
    quiz_id: str
    answers: Dict[str, Any]
    score: float
    passed: bool
    weaknesses: List[str]
    strengths: List[str]
    recommendations: List[str]
    submitted_at: datetime = None
    time_taken_minutes: int = 0
    
    def __post_init__(self):
        if self.submitted_at is None:
            self.submitted_at = datetime.utcnow()

@dataclass
class LearningPath:
    """Learning path data model"""
    path_id: str
    student_id: str
    subject: str
    topics: List[str]
    difficulty: str
    estimated_hours: int
    progress_percentage: float = 0.0
    created_at: datetime = None
    updated_at: datetime = None
    status: str = "active"
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.utcnow()
        if self.updated_at is None:
            self.updated_at = datetime.utcnow()

@dataclass
class LessonContent:
    """Lesson content data model"""
    lesson_id: str
    title: str
    subject: str
    topic: str
    content: str
    examples: List[str]
    exercises: List[Dict[str, str]]
    video_url: str = ""
    difficulty: str = "beginner"
    estimated_time_minutes: int = 30
    created_at: datetime = None
    updated_at: datetime = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.utcnow()
        if self.updated_at is None:
            self.updated_at = datetime.utcnow()

class EduGenieFirestoreClient:
    """
    Enhanced Firestore client for EduGenie with complete CRUD operations
    and authentication handling
    """
    
    def __init__(self, service_account_path: str = None, project_id: str = None):
        """
        Initialize Firestore client with service account authentication
        
        Args:
            service_account_path: Path to service account JSON file
            project_id: Google Cloud project ID
        """
        self.db = None
        self.project_id = project_id or os.getenv('GOOGLE_CLOUD_PROJECT_ID')
        
        # Try multiple authentication methods
        self._authenticate(service_account_path)
        
    def _authenticate(self, service_account_path: str = None):
        """Handle Firestore authentication with fallback options"""
        try:
            # Method 1: Service account key file (preferred for development)
            if service_account_path and Path(service_account_path).exists():
                print(f"🔐 Authenticating with service account: {service_account_path}")
                credentials = service_account.Credentials.from_service_account_file(
                    service_account_path
                )
                self.db = firestore.Client(credentials=credentials, project=self.project_id)
                print("✅ Successfully authenticated with service account key")
                return
                
            # Method 2: Environment variable path
            env_key_path = os.getenv('FIRESTORE_SERVICE_ACCOUNT_PATH')
            if env_key_path and Path(env_key_path).exists():
                print(f"🔐 Authenticating with environment service account: {env_key_path}")
                credentials = service_account.Credentials.from_service_account_file(env_key_path)
                self.db = firestore.Client(credentials=credentials, project=self.project_id)
                print("✅ Successfully authenticated with environment service account")
                return
                
            # Method 3: Google Application Default Credentials
            print("🔐 Trying Application Default Credentials...")
            self.db = firestore.Client(project=self.project_id)
            
            # Test the connection
            self.db.collection("test").limit(1).get()
            print("✅ Successfully authenticated with default credentials")
            
        except Exception as e:
            print(f"❌ Authentication failed: {str(e)}")
            print("""
💡 Authentication Setup Help:
1. Download service account key from Google Cloud Console
2. Set environment variables:
   export GOOGLE_CLOUD_PROJECT_ID=your-project-id
   export FIRESTORE_SERVICE_ACCOUNT_PATH=./path/to/service-account.json
3. Or use: gcloud auth application-default login
            """)
            raise
    
    def test_connection(self) -> bool:
        """Test Firestore connection"""
        try:
            # Try to access collections list
            collections = list(self.db.collections())
            print(f"✅ Firestore connection successful. Found {len(collections)} collections.")
            return True
        except Exception as e:
            print(f"❌ Firestore connection failed: {str(e)}")
            return False
    
    # =============================================================================
    # STUDENT PROFILE CRUD OPERATIONS
    # =============================================================================
    
    def create_student(self, profile: StudentProfile) -> bool:
        """Create a new student profile"""
        try:
            # Convert dataclass to dict, handling datetime serialization
            data = asdict(profile)
            data['created_at'] = profile.created_at
            data['updated_at'] = profile.updated_at
            
            doc_ref = self.db.collection("students").document(profile.student_id)
            doc_ref.set(data)
            
            print(f"✅ Created student profile: {profile.name} ({profile.student_id})")
            return True
            
        except Exception as e:
            print(f"❌ Error creating student {profile.student_id}: {str(e)}")
            return False
    
    def get_student(self, student_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve student profile by ID"""
        try:
            doc_ref = self.db.collection("students").document(student_id)
            doc = doc_ref.get()
            
            if doc.exists:
                data = doc.to_dict()
                data["id"] = doc.id
                print(f"✅ Retrieved student: {data.get('name', 'Unknown')} ({student_id})")
                return data
            else:
                print(f"⚠️ Student not found: {student_id}")
                return None
                
        except Exception as e:
            print(f"❌ Error retrieving student {student_id}: {str(e)}")
            return None
    
    def update_student(self, student_id: str, updates: Dict[str, Any]) -> bool:
        """Update student profile"""
        try:
            updates["updated_at"] = datetime.utcnow()
            
            doc_ref = self.db.collection("students").document(student_id)
            doc_ref.update(updates)
            
            print(f"✅ Updated student: {student_id}")
            return True
            
        except Exception as e:
            print(f"❌ Error updating student {student_id}: {str(e)}")
            return False
    
    def delete_student(self, student_id: str, soft_delete: bool = True) -> bool:
        """Delete student profile (soft delete by default)"""
        try:
            if soft_delete:
                # Soft delete - mark as inactive
                updates = {
                    "status": "deleted",
                    "deleted_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
                doc_ref = self.db.collection("students").document(student_id)
                doc_ref.update(updates)
                print(f"✅ Soft deleted student: {student_id}")
            else:
                # Hard delete - completely remove document
                doc_ref = self.db.collection("students").document(student_id)
                doc_ref.delete()
                print(f"✅ Hard deleted student: {student_id}")
                
            return True
            
        except Exception as e:
            print(f"❌ Error deleting student {student_id}: {str(e)}")
            return False
    
    def get_all_students(self, active_only: bool = True, limit: int = 100) -> List[Dict[str, Any]]:
        """Retrieve all students with optional filtering"""
        try:
            query = self.db.collection("students")
            
            if active_only:
                query = query.where("status", "==", "active")
            
            docs = query.limit(limit).stream()
            students = []
            
            for doc in docs:
                data = doc.to_dict()
                data["id"] = doc.id
                students.append(data)
            
            print(f"✅ Retrieved {len(students)} students")
            return students
            
        except Exception as e:
            print(f"❌ Error retrieving students: {str(e)}")
            return []
    
    # =============================================================================
    # QUIZ RESULTS OPERATIONS
    # =============================================================================
    
    def save_quiz_result(self, quiz_result: QuizResult) -> bool:
        """Save quiz result to student's assessments subcollection"""
        try:
            # Convert to dict
            data = asdict(quiz_result)
            data['submitted_at'] = quiz_result.submitted_at
            
            # Save to student's assessments subcollection
            doc_ref = (self.db.collection("students")
                      .document(quiz_result.student_id)
                      .collection("assessments")
                      .document())
            doc_ref.set(data)
            
            # Update student's latest assessment info
            student_updates = {
                "latest_assessment": {
                    "score": quiz_result.score,
                    "passed": quiz_result.passed,
                    "date": quiz_result.submitted_at
                },
                "updated_at": datetime.utcnow()
            }
            self.update_student(quiz_result.student_id, student_updates)
            
            print(f"✅ Saved quiz result for student: {quiz_result.student_id} (Score: {quiz_result.score})")
            return True
            
        except Exception as e:
            print(f"❌ Error saving quiz result: {str(e)}")
            return False
    
    def get_student_quiz_results(self, student_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get quiz results for a student"""
        try:
            docs = (self.db.collection("students")
                   .document(student_id)
                   .collection("assessments")
                   .order_by("submitted_at", direction=firestore.Query.DESCENDING)
                   .limit(limit)
                   .stream())
            
            results = []
            for doc in docs:
                data = doc.to_dict()
                data["id"] = doc.id
                results.append(data)
            
            print(f"✅ Retrieved {len(results)} quiz results for student: {student_id}")
            return results
            
        except Exception as e:
            print(f"❌ Error retrieving quiz results for {student_id}: {str(e)}")
            return []
    
    # =============================================================================
    # LEARNING PATHS OPERATIONS
    # =============================================================================
    
    def save_learning_path(self, learning_path: LearningPath) -> bool:
        """Save learning path"""
        try:
            data = asdict(learning_path)
            data['created_at'] = learning_path.created_at
            data['updated_at'] = learning_path.updated_at
            
            doc_ref = self.db.collection("learning_paths").document(learning_path.path_id)
            doc_ref.set(data)
            
            print(f"✅ Saved learning path: {learning_path.subject} for {learning_path.student_id}")
            return True
            
        except Exception as e:
            print(f"❌ Error saving learning path: {str(e)}")
            return False
    
    def get_student_learning_paths(self, student_id: str) -> List[Dict[str, Any]]:
        """Get all learning paths for a student"""
        try:
            docs = (self.db.collection("learning_paths")
                   .where("student_id", "==", student_id)
                   .where("status", "==", "active")
                   .order_by("created_at", direction=firestore.Query.DESCENDING)
                   .stream())
            
            paths = []
            for doc in docs:
                data = doc.to_dict()
                data["id"] = doc.id
                paths.append(data)
            
            print(f"✅ Retrieved {len(paths)} learning paths for student: {student_id}")
            return paths
            
        except Exception as e:
            print(f"❌ Error retrieving learning paths for {student_id}: {str(e)}")
            return []
    
    def update_learning_path_progress(self, path_id: str, progress_percentage: float) -> bool:
        """Update learning path progress"""
        try:
            updates = {
                "progress_percentage": progress_percentage,
                "updated_at": datetime.utcnow()
            }
            
            doc_ref = self.db.collection("learning_paths").document(path_id)
            doc_ref.update(updates)
            
            print(f"✅ Updated learning path progress: {path_id} -> {progress_percentage}%")
            return True
            
        except Exception as e:
            print(f"❌ Error updating learning path progress: {str(e)}")
            return False
    
    # =============================================================================
    # LESSON CONTENT OPERATIONS
    # =============================================================================
    
    def save_lesson_content(self, lesson: LessonContent) -> bool:
        """Save lesson content"""
        try:
            data = asdict(lesson)
            data['created_at'] = lesson.created_at
            data['updated_at'] = lesson.updated_at
            
            doc_ref = self.db.collection("lesson_content").document(lesson.lesson_id)
            doc_ref.set(data)
            
            print(f"✅ Saved lesson content: {lesson.title}")
            return True
            
        except Exception as e:
            print(f"❌ Error saving lesson content: {str(e)}")
            return False
    
    def get_lesson_content(self, lesson_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve lesson content by ID"""
        try:
            doc_ref = self.db.collection("lesson_content").document(lesson_id)
            doc = doc_ref.get()
            
            if doc.exists:
                data = doc.to_dict()
                data["id"] = doc.id
                print(f"✅ Retrieved lesson: {data.get('title', 'Unknown')}")
                return data
            else:
                print(f"⚠️ Lesson not found: {lesson_id}")
                return None
                
        except Exception as e:
            print(f"❌ Error retrieving lesson {lesson_id}: {str(e)}")
            return None
    
    def get_lessons_by_subject(self, subject: str, difficulty: str = None) -> List[Dict[str, Any]]:
        """Get lessons by subject and optional difficulty"""
        try:
            query = self.db.collection("lesson_content").where("subject", "==", subject)
            
            if difficulty:
                query = query.where("difficulty", "==", difficulty)
            
            docs = query.order_by("title").stream()
            lessons = []
            
            for doc in docs:
                data = doc.to_dict()
                data["id"] = doc.id
                lessons.append(data)
            
            print(f"✅ Retrieved {len(lessons)} lessons for {subject}")
            return lessons
            
        except Exception as e:
            print(f"❌ Error retrieving lessons for {subject}: {str(e)}")
            return []
    
    # =============================================================================
    # UTILITY OPERATIONS
    # =============================================================================
    
    def batch_update_students(self, updates: List[Dict[str, Any]]) -> bool:
        """Perform batch updates on multiple students"""
        try:
            batch = self.db.batch()
            
            for update_data in updates:
                student_id = update_data.pop("student_id")
                update_data["updated_at"] = datetime.utcnow()
                
                doc_ref = self.db.collection("students").document(student_id)
                batch.update(doc_ref, update_data)
            
            batch.commit()
            print(f"✅ Batch updated {len(updates)} students")
            return True
            
        except Exception as e:
            print(f"❌ Error in batch update: {str(e)}")
            return False
    
    def search_students_by_field(self, field: str, value: Any, limit: int = 50) -> List[Dict[str, Any]]:
        """Search students by a specific field value"""
        try:
            docs = (self.db.collection("students")
                   .where(field, "==", value)
                   .limit(limit)
                   .stream())
            
            students = []
            for doc in docs:
                data = doc.to_dict()
                data["id"] = doc.id
                students.append(data)
            
            print(f"✅ Found {len(students)} students where {field} = {value}")
            return students
            
        except Exception as e:
            print(f"❌ Error searching students: {str(e)}")
            return []

def demonstrate_firestore_operations():
    """Demonstrate all Firestore operations with real examples"""
    print("🚀 Starting EduGenie Firestore Integration Demo\n")
    
    # Initialize client (provide your service account path)
    service_account_path = "./firestore-service-account.json"  # Update this path
    project_id = "your-project-id"  # Update this
    
    try:
        client = EduGenieFirestoreClient(service_account_path, project_id)
        
        if not client.test_connection():
            print("❌ Failed to connect to Firestore. Check your authentication.")
            return
        
        print("\n" + "="*70)
        print("📚 1. STUDENT PROFILE OPERATIONS")
        print("="*70)
        
        # Create sample student
        student = StudentProfile(
            student_id="demo_student_001",
            name="Alice Johnson",
            email="alice.johnson@school.edu",
            grade="10th",
            subjects=["Mathematics", "Physics", "Chemistry"],
            learning_style="visual",
            strengths=["problem_solving", "analytical_thinking"],
            weaknesses=["time_management"]
        )
        
        # Create student
        client.create_student(student)
        
        # Read student
        retrieved_student = client.get_student("demo_student_001")
        if retrieved_student:
            print(f"📋 Student Name: {retrieved_student['name']}")
            print(f"📋 Subjects: {', '.join(retrieved_student['subjects'])}")
        
        # Update student
        updates = {
            "weaknesses": ["algebra", "geometry"],
            "last_login": datetime.utcnow(),
            "total_study_hours": 45.5
        }
        client.update_student("demo_student_001", updates)
        
        print("\n" + "="*70)
        print("📝 2. QUIZ RESULTS OPERATIONS")
        print("="*70)
        
        # Save quiz result
        quiz_result = QuizResult(
            student_id="demo_student_001",
            quiz_id="math_algebra_quiz_001",
            answers={"q1": "B", "q2": "A", "q3": "C", "q4": "B"},
            score=85.0,
            passed=True,
            weaknesses=["quadratic_equations"],
            strengths=["linear_equations", "factoring"],
            recommendations=[
                "Practice more quadratic equation problems",
                "Review the quadratic formula",
                "Complete additional factoring exercises"
            ],
            time_taken_minutes=25
        )
        
        client.save_quiz_result(quiz_result)
        
        # Retrieve quiz results
        quiz_history = client.get_student_quiz_results("demo_student_001", limit=5)
        for i, quiz in enumerate(quiz_history, 1):
            print(f"📊 Quiz {i}: Score {quiz['score']}% - {'✅ Passed' if quiz['passed'] else '❌ Failed'}")
        
        print("\n" + "="*70)
        print("🛤️ 3. LEARNING PATH OPERATIONS")
        print("="*70)
        
        # Create learning path
        learning_path = LearningPath(
            path_id="path_math_advanced_001",
            student_id="demo_student_001",
            subject="Mathematics",
            topics=[
                "Linear Equations Review",
                "Quadratic Equations",
                "Systems of Equations",
                "Polynomial Functions",
                "Exponential Functions"
            ],
            difficulty="intermediate",
            estimated_hours=40,
            progress_percentage=25.0
        )
        
        client.save_learning_path(learning_path)
        
        # Update progress
        client.update_learning_path_progress("path_math_advanced_001", 45.0)
        
        # Get student's learning paths
        student_paths = client.get_student_learning_paths("demo_student_001")
        for path in student_paths:
            print(f"📚 Path: {path['subject']} - {path['progress_percentage']}% complete")
            print(f"   Topics: {', '.join(path['topics'][:3])}...")
        
        print("\n" + "="*70)
        print("📖 4. LESSON CONTENT OPERATIONS")
        print("="*70)
        
        # Create lesson content
        lesson = LessonContent(
            lesson_id="lesson_quadratic_intro",
            title="Introduction to Quadratic Equations",
            subject="Mathematics",
            topic="Quadratic Equations",
            content="""
            Quadratic equations are polynomial equations of degree 2.
            The standard form is: ax² + bx + c = 0, where a ≠ 0.
            
            Key concepts:
            - Discriminant: b² - 4ac
            - Quadratic formula: x = (-b ± √(b² - 4ac)) / 2a
            - Factoring methods
            """,
            examples=[
                "x² - 5x + 6 = 0",
                "2x² + 7x - 4 = 0",
                "x² - 9 = 0"
            ],
            exercises=[
                {"question": "Solve: x² - 4x + 3 = 0", "answer": "x = 1 or x = 3"},
                {"question": "Find discriminant of: 2x² - 3x + 1 = 0", "answer": "1"},
                {"question": "Factor: x² - 6x + 9", "answer": "(x - 3)²"}
            ],
            video_url="https://example.com/quadratic-intro.mp4",
            difficulty="intermediate",
            estimated_time_minutes=45
        )
        
        client.save_lesson_content(lesson)
        
        # Retrieve lesson
        retrieved_lesson = client.get_lesson_content("lesson_quadratic_intro")
        if retrieved_lesson:
            print(f"📖 Lesson: {retrieved_lesson['title']}")
            print(f"⏱️ Duration: {retrieved_lesson['estimated_time_minutes']} minutes")
            print(f"📚 Examples: {len(retrieved_lesson['examples'])}")
        
        # Get lessons by subject
        math_lessons = client.get_lessons_by_subject("Mathematics", "intermediate")
        print(f"📚 Found {len(math_lessons)} intermediate math lessons")
        
        print("\n" + "="*70)
        print("🔧 5. UTILITY OPERATIONS")
        print("="*70)
        
        # Batch update
        batch_updates = [
            {
                "student_id": "demo_student_001",
                "last_activity": datetime.utcnow(),
                "session_count": 15
            }
        ]
        client.batch_update_students(batch_updates)
        
        # Search students
        visual_learners = client.search_students_by_field("learning_style", "visual")
        print(f"🔍 Found {len(visual_learners)} visual learners")
        
        # Get all students
        all_students = client.get_all_students()
        print(f"👥 Total active students: {len(all_students)}")
        
        print("\n" + "="*70)
        print("🧹 6. CLEANUP (OPTIONAL)")
        print("="*70)
        
        # Uncomment to clean up demo data
        # client.delete_student("demo_student_001", soft_delete=True)
        # print("🗑️ Demo student soft deleted")
        
        print("\n🎉 Firestore integration demo completed successfully!")
        print("💡 Remember to implement proper error handling and logging in production!")
        
    except Exception as e:
        print(f"❌ Demo failed: {str(e)}")
        print("💡 Make sure your service account key is properly configured")

if __name__ == "__main__":
    demonstrate_firestore_operations()
