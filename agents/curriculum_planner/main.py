# agents/curriculum_planner/main.py

from logic import build_learning_path
from core.firestore_client import get_firestore_client

def handle_assessment_result(student_id: str, analysis: dict):
    """Handle assessment results and create personalized learning path."""
    try:
        # Build learning path based on student's weaknesses
        path = build_learning_path(student_id, analysis.get("weaknesses", []))
        
        # Get Firestore client
        client = get_firestore_client()
        
        # Save learning path
        success = client.save_learning_path(path)
        
        if success:
            print(f"[CurriculumPlanner] Successfully created learning path for student: {student_id}")
            
            # Also update student's current learning path
            path_data = path.dict() if hasattr(path, 'dict') else path
            client.set_learning_path(student_id, path_data.get('topics', []))
        else:
            print(f"[CurriculumPlanner] Failed to save learning path for student: {student_id}")
        
        return path
        
    except Exception as e:
        print(f"[CurriculumPlanner] Error creating learning path for {student_id}: {str(e)}")
        return None
