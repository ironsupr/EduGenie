# agents/recommender/main.py

from logic import suggest_topics
from core.firestore_client import get_firestore_client

def handle_recommendation_request(student_id: str):
    """Handle recommendation request and provide personalized topic suggestions."""
    try:
        # Get Firestore client
        client = get_firestore_client()
        
        # Fetch student's progress history
        history = client.fetch_progress(student_id)
        
        if not history:
            print(f"[Recommender] No progress history found for student: {student_id}")
            return []
        
        # Get student profile for additional context
        student = client.get_student(student_id)
        
        # Generate recommendations based on history and profile
        recommendations = suggest_topics(history, student_profile=student)
        
        if recommendations:
            print(f"[Recommender] Generated {len(recommendations)} recommendations for {student_id}")
            
            # Save recommendations to student profile
            updates = {
                "latest_recommendations": recommendations,
                "recommendations_generated_at": __import__('datetime').datetime.utcnow()
            }
            client.update_student(student_id, updates)
        else:
            print(f"[Recommender] No recommendations generated for {student_id}")
        
        return recommendations
        
    except Exception as e:
        print(f"[Recommender] Error generating recommendations for {student_id}: {str(e)}")
        return []
