# agents/content_generator/main.py

from logic import generate_lesson_content
from core.firestore_client import save_lesson_content

def handle_topic_generation(topic: str):
    lesson_data = generate_lesson_content(topic)
    save_lesson_content(topic, lesson_data)
    return lesson_data
