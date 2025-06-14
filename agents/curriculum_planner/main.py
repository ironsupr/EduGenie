# agents/curriculum_planner/main.py

from logic import build_learning_path
from core.firestore_client import save_learning_path

def handle_assessment_result(student_id: str, analysis: dict):
    path = build_learning_path(student_id, analysis["weaknesses"])
    save_learning_path(path)
    return path
