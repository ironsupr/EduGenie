# agents/progress_tracker/main.py

from logic import build_progress_entry
from core.firestore_client import log_progress

def handle_topic_completion(student_id: str, topic: str, score: float):
    progress_entry = build_progress_entry(student_id, topic, score)
    log_progress(progress_entry)
    return progress_entry
