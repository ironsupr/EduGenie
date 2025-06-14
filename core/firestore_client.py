# core/firestore_client.py

from google.cloud import firestore
from core.models import LearningPath, ProgressEntry, AssessmentAnalysis

db = firestore.Client()

def save_assessment(student_id: str, answers: dict, analysis: AssessmentAnalysis):
    ref = db.collection("students").document(student_id).collection("assessments").document()
    ref.set({
        "answers": answers,
        "analysis": analysis.dict()
    })

def save_learning_path(path: LearningPath):
    ref = db.collection("learning_paths").document(path.path_id)
    ref.set(path.dict())

def log_progress(entry: ProgressEntry):
    db.collection("students").document(entry.student_id).collection("progress").add(entry.dict())

def fetch_progress(student_id: str) -> list:
    docs = db.collection("students").document(student_id).collection("progress").stream()
    return [doc.to_dict() for doc in docs]
