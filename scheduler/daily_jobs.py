# scheduler/daily_jobs.py

from core.firestore_client import get_firestore_client
import datetime
import random

def run_daily_reassessment():
    """Simulate a daily quiz reassessment for active students."""
    try:
        client = get_firestore_client()
        students = client.get_all_students(active_only=True)
        print(f"[Scheduler] Reassessing {len(students)} students")

        for student in students:
            student_id = student["id"]
            # Simulate updated weaknesses
            random_score = random.randint(0, 100)
            if random_score < 70:
                weaknesses = ["Quadratic Factoring"]
            else:
                weaknesses = []

            client.update_weaknesses(student_id, weaknesses)
            print(f"[Reassessment] {student_id} → score={random_score}, weaknesses={weaknesses}")
            
    except Exception as e:
        print(f"[Scheduler] Error in daily reassessment: {str(e)}")

def send_daily_nudges():
    """Send motivational nudges to students who haven't logged in recently."""
    try:
        client = get_firestore_client()
        students = client.get_all_students(active_only=True)
        today = datetime.date.today()

        for student in students:
            last_active = student.get("last_active", today)
            if isinstance(last_active, datetime.datetime):
                last_active = last_active.date()
            
            days_inactive = (today - last_active).days

            if days_inactive > 2:
                print(f"[Nudge] {student['id']} has been inactive for {days_inactive} days. Sending reminder...")
                
                # Update student with nudge sent flag
                client.update_student(student["id"], {
                    "last_nudge_sent": datetime.datetime.utcnow(),
                    "nudge_reason": f"inactive_for_{days_inactive}_days"
                })
                
    except Exception as e:
        print(f"[Scheduler] Error in sending daily nudges: {str(e)}")

# Simulate manual trigger
if __name__ == "__main__":
    print("🔄 Running daily scheduled jobs...")
    run_daily_reassessment()
    print()
    send_daily_nudges()
    print("✅ Daily jobs completed!")
