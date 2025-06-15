# agents/assessment_agent/main.py

from logic import analyze_quiz
from core.firestore_client import get_firestore_client

def handle_quiz_submission(student_id, answers):
    """Handle quiz submission and save results to Firestore."""
    try:
        # Analyze the quiz answers
        analysis = analyze_quiz(answers)
        
        # Get Firestore client
        client = get_firestore_client()
        
        # Save assessment results
        success = client.save_assessment(student_id=student_id, answers=answers, analysis=analysis)
        
        if success:
            print(f"[AssessmentAgent] Successfully saved assessment for student {student_id}")
            
            # Update student weaknesses based on analysis
            if hasattr(analysis, 'weaknesses') and analysis.weaknesses:
                client.update_weaknesses(student_id, analysis.weaknesses)
                print(f"[AssessmentAgent] Updated weaknesses for {student_id}: {analysis.weaknesses}")
        else:
            print(f"[AssessmentAgent] Failed to save assessment for student {student_id}")
        
        return analysis
        
    except Exception as e:
        print(f"[AssessmentAgent] Error handling quiz submission for {student_id}: {str(e)}")
        return None
