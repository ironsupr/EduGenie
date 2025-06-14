# agents/curriculum_planner/logic.py

from datetime import datetime
import uuid

def build_learning_path(student_id: str, weak_topics: list) -> dict:
    """
    Given a list of weak topics, generate a personalized learning path.
    """
    base_duration = 2  # days per topic

    path = {
        "student_id": student_id,
        "path_id": f"path_{uuid.uuid4().hex[:8]}",
        "topics": weak_topics,
        "planned_days": len(weak_topics) * base_duration,
        "created_at": datetime.utcnow().isoformat()
    }

    return path
