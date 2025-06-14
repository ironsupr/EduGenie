# agents/notifier/logic.py

def build_message(event_type: str, metadata: dict) -> str:
    """
    Generate a motivational or reminder message based on event type.
    """
    if event_type == "progress_reminder":
        return f"Hey! Don't forget to study today. You're working on {metadata.get('topic', 'your goal')}!"

    elif event_type == "goal_near":
        return f"Awesome! You're {metadata.get('progress', '90%')} done with your learning path. Keep it up!"

    elif event_type == "stuck":
        return f"It looks like you're struggling with {metadata.get('topic')}. Let's review it together!"

    else:
        return "Keep learning and pushing forward! 🚀"
