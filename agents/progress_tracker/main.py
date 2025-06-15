# agents/progress_tracker/main.py

from logic import build_progress_entry
from core.firestore_client import get_firestore_client

def handle_topic_completion(student_id: str, topic: str, score: float):
    """Handle topic completion and log progress."""
    try:
        # Build progress entry
        progress_entry = build_progress_entry(student_id, topic, score)
        
        # Get Firestore client
        client = get_firestore_client()
        
        # Log progress
        success = client.log_progress(progress_entry)
        
        if success:
            print(f"[ProgressTracker] Successfully logged progress for {student_id}: {topic} ({score})")
            
            # Update student's overall progress stats
            progress_history = client.fetch_progress(student_id, limit=10)
            
            # Calculate recent performance metrics
            if progress_history:
                recent_scores = [p.get('score', 0) for p in progress_history[:5]]
                avg_recent_score = sum(recent_scores) / len(recent_scores)
                
                # Update student with recent performance
                updates = {
                    "recent_average_score": avg_recent_score,
                    "total_completed_topics": len(progress_history),
                    "last_activity": progress_entry.dict() if hasattr(progress_entry, 'dict') else progress_entry
                }
                client.update_student(student_id, updates)
        else:
            print(f"[ProgressTracker] Failed to log progress for {student_id}")
        
        return progress_entry
        
    except Exception as e:
        print(f"[ProgressTracker] Error logging progress for {student_id}: {str(e)}")
        return None
