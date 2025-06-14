# scheduler/daily_jobs.py

from core import firestore_client
import datetime
import random

def run_daily_reassessment():
    """Simulate a daily quiz reassessment for active students."""
    students = firestore_client.get_all_students()
    print(f"[Scheduler] Reassessing {len(students)} students")

    for student in students:
        student_id = student["id"]
        # Simulate updated weaknesses
        random_score = random.randint(0, 100)
        if random_score < 70:
            weaknesses = ["Quadratic Factoring"]
        else:
            weaknesses = []

        firestore_client.update_weaknesses(student_id, weaknesses)
        print(f"[Reassessment] {student_id} → score={random_score}, weaknesses={weaknesses}")

def send_daily_nudges():
    """Send motivational nudges to students who haven’t logged in recently."""
    students = firestore_client.get_all_students()
    today = datetime.date.today()

    for student in students:
        last_active = student.get("last_active", today)
        days_inactive = (today - last_active).days

        if days_inactive > 2:
            print(f"[Nudge] {student['id']} has been inactive for {days_inactive} days. Sending reminder...")

# Simulate manual trigger
if __name__ == "__main__":
    run_daily_reassessment()
    send_daily_nudges()
