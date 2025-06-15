# Google Firestore Integration Guide

## Authentication Setup

### Option 1: Service Account Key File (Recommended for Development)

1. **Create a Service Account:**

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to IAM & Admin > Service Accounts
   - Click "Create Service Account"
   - Give it a name like "edugenie-firestore"
   - Grant it the "Cloud Datastore User" role

2. **Download Service Account Key:**

   - Click on the created service account
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key"
   - Choose JSON format
   - Save the file as `firestore-service-account.json` in your project root

3. **Set Environment Variable:**
   ```bash
   # Add to your .env file
   GOOGLE_CLOUD_PROJECT_ID=your-project-id
   FIRESTORE_SERVICE_ACCOUNT_PATH=./firestore-service-account.json
   ```

### Option 2: Application Default Credentials (Production)

For production environments (Google Cloud Run, Compute Engine, etc.):

```bash
# Set environment variable
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
# Or use default service account on GCP
```

## Usage Examples

### Basic Initialization

```python
from core.firestore_client import get_firestore_client

# With service account file
client = get_firestore_client(
    service_account_path="./firestore-service-account.json",
    project_id="your-project-id"
)

# Or using environment variables
client = get_firestore_client()
```

### Student CRUD Operations

```python
# Create a student
student_data = {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "grade": "10th",
    "subjects": ["Math", "Science", "English"],
    "learning_style": "visual",
    "weaknesses": [],
    "strengths": ["problem_solving", "critical_thinking"]
}

success = client.create_student("student_123", student_data)

# Read a student
student = client.get_student("student_123")
print(f"Student: {student['name']}")

# Update a student
updates = {
    "weaknesses": ["algebra", "geometry"],
    "last_login": datetime.utcnow()
}
client.update_student("student_123", updates)

# Get all active students
students = client.get_all_students(active_only=True)
print(f"Total active students: {len(students)}")
```

### Quiz Results and Assessments

```python
from core.models import AssessmentAnalysis

# Save quiz results
answers = {
    "q1": "B",
    "q2": "A",
    "q3": "C"
}

analysis = AssessmentAnalysis(
    score=85,
    passed=True,
    weaknesses=["quadratic_equations"],
    strengths=["linear_functions"],
    recommendations=["Practice more quadratic problems"]
)

client.save_assessment("student_123", answers, analysis)

# Get assessment history
assessments = client.get_student_assessments("student_123", limit=5)
for assessment in assessments:
    print(f"Score: {assessment['score']}, Date: {assessment['submitted_at']}")
```

### Learning Paths

```python
from core.models import LearningPath

# Create learning path
learning_path = LearningPath(
    path_id="path_math_basics",
    student_id="student_123",
    subject="Mathematics",
    topics=["Algebra Basics", "Linear Equations", "Quadratic Equations"],
    difficulty="intermediate",
    estimated_hours=20
)

client.save_learning_path(learning_path)

# Get student's learning paths
paths = client.get_student_learning_paths("student_123")
for path in paths:
    print(f"Path: {path['subject']} - {len(path['topics'])} topics")
```

### Progress Tracking

```python
from core.models import ProgressEntry

# Log progress
progress = ProgressEntry(
    student_id="student_123",
    topic="Linear Equations",
    score=92,
    time_spent_minutes=45,
    completed=True,
    difficulty_level="medium"
)

client.log_progress(progress)

# Fetch progress history
progress_history = client.fetch_progress("student_123", limit=10)
for entry in progress_history:
    print(f"Topic: {entry['topic']}, Score: {entry['score']}")
```

### Lesson Content Management

```python
# Save lesson content
lesson_data = {
    "title": "Introduction to Linear Equations",
    "content": "Linear equations are...",
    "examples": ["2x + 3 = 7", "y = mx + b"],
    "exercises": [
        {"question": "Solve: 3x + 5 = 14", "answer": "x = 3"},
        {"question": "Find slope of y = 2x + 1", "answer": "2"}
    ],
    "video_url": "https://example.com/video1.mp4",
    "difficulty": "beginner",
    "estimated_time_minutes": 30
}

client.save_lesson_content("Linear Equations", lesson_data)

# Retrieve lesson content
lesson = client.get_lesson_content("Linear Equations")
if lesson:
    print(f"Lesson: {lesson['content']['title']}")
```

### Advanced Queries

```python
# Search students by field
math_students = client.search_students("subjects", "Math")
print(f"Students taking Math: {len(math_students)}")

# Batch update multiple students
batch_updates = [
    {"student_id": "student_123", "last_activity": datetime.utcnow()},
    {"student_id": "student_456", "last_activity": datetime.utcnow()},
    {"student_id": "student_789", "last_activity": datetime.utcnow()}
]

client.batch_update_students(batch_updates)
```

## Error Handling

The Firestore client includes comprehensive error handling and logging:

```python
try:
    student = client.get_student("non_existent_student")
    if student is None:
        print("Student not found")
except Exception as e:
    print(f"Error: {e}")
```

## Security Best Practices

1. **Never commit service account keys to version control**
2. **Use environment variables for configuration**
3. **Implement proper access controls in Firestore rules**
4. **Regularly rotate service account keys**
5. **Use least privilege principle for service account roles**

## Firestore Security Rules Example

Create security rules in Firestore console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Students can only read/write their own data
    match /students/{studentId} {
      allow read, write: if request.auth != null && request.auth.uid == studentId;
    }

    // Only authenticated users can read lesson content
    match /lesson_content/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }

    // Learning paths are readable by the student they belong to
    match /learning_paths/{pathId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.student_id;
    }
  }
}
```

## Monitoring and Performance

1. **Enable Firestore monitoring in Google Cloud Console**
2. **Set up alerts for quota usage**
3. **Use composite indexes for complex queries**
4. **Implement pagination for large result sets**
5. **Monitor read/write operations and costs**

## Testing

```python
# Test the Firestore connection
def test_firestore_connection():
    try:
        client = get_firestore_client()

        # Test create
        test_student = {
            "name": "Test Student",
            "email": "test@example.com",
            "test": True
        }

        success = client.create_student("test_student", test_student)
        assert success, "Failed to create test student"

        # Test read
        student = client.get_student("test_student")
        assert student is not None, "Failed to read test student"
        assert student["name"] == "Test Student"

        # Test update
        success = client.update_student("test_student", {"grade": "11th"})
        assert success, "Failed to update test student"

        # Test delete
        success = client.delete_student("test_student")
        assert success, "Failed to delete test student"

        print("All Firestore tests passed!")

    except Exception as e:
        print(f"Firestore test failed: {e}")

if __name__ == "__main__":
    test_firestore_connection()
```
