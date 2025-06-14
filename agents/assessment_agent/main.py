# agents/assessment_agent/main.py

from logic import analyze_quiz
from core.firestore_client import save_quiz_result

def handle_quiz_submission(student_id, answers):
    analysis = analyze_quiz(answers)
    save_quiz_result(student_id=student_id, answers=answers, analysis=analysis)
    return analysis
