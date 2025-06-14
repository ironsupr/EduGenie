# agents/recommender/main.py

from logic import suggest_topics
from core.firestore_client import fetch_progress

def handle_recommendation_request(student_id: str):
    history = fetch_progress(student_id)
    recommendations = suggest_topics(history)
    return recommendations
