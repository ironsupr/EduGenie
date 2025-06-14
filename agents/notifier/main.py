# agents/notifier/main.py

from logic import build_message
from core.notification_client import send_notification

def handle_event_notification(student_id: str, event_type: str, metadata: dict):
    message = build_message(event_type, metadata)
    send_notification(student_id, message)
    return {"status": "sent", "message": message}
