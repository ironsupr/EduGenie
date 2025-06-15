# agents/content_generator/main.py

from logic import generate_lesson_content
from core.firestore_client import get_firestore_client

def handle_topic_generation(topic: str):
    """Handle lesson content generation and save to Firestore."""
    try:
        # Generate lesson content using AI/logic
        lesson_data = generate_lesson_content(topic)
        
        # Get Firestore client
        client = get_firestore_client()
        
        # Save lesson content to Firestore
        success = client.save_lesson_content(topic, lesson_data)
        
        if success:
            print(f"[ContentGenerator] Successfully generated and saved content for topic: {topic}")
        else:
            print(f"[ContentGenerator] Failed to save content for topic: {topic}")
        
        return lesson_data
        
    except Exception as e:
        print(f"[ContentGenerator] Error generating content for topic {topic}: {str(e)}")
        return None
