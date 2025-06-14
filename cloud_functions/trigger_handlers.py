# cloud_functions/trigger_handlers.py
import base64
import json
from core import models, firestore_client

# Simulating Pub/Sub message handler
def assessment_agent_handler(event, context):
    """Triggered by a Pub/Sub message containing quiz results."""
    data = json.loads(base64.b64decode(event['data']).decode('utf-8'))
    student_id = data['student_id']
    answers = data['answers']

    # Analyze weaknesses
    weaknesses = []
    if answers.get("q1") != "B":
        weaknesses.append("Quadratic Factoring")
    if answers.get("q2") != "A":
        weaknesses.append("Linear Functions")

    # Update student profile
    firestore_client.update_weaknesses(student_id, weaknesses)

    print(f"[AssessmentAgent] {student_id} → weaknesses: {weaknesses}")

    # Trigger curriculum planner (could publish to another Pub/Sub topic)
    return {
        "next_agent": "CurriculumPlanner",
        "student_id": student_id,
        "weaknesses": weaknesses
    }

def curriculum_planner_handler(event, context):
    data = json.loads(base64.b64decode(event['data']).decode('utf-8'))
    student_id = data['student_id']
    weaknesses = data['weaknesses']

    # For each weakness, map to learning content
    plan = []
    for topic in weaknesses:
        plan.append({
            "topic": topic,
            "resources": [f"{topic} - Intro", f"{topic} - Practice Sheet"]
        })

    firestore_client.set_learning_path(student_id, plan)
    print(f"[CurriculumPlanner] Learning path set for {student_id}")

    return {
        "next_agent": "ContentGenerator",
        "student_id": student_id,
        "plan": plan
    }

def content_generator_handler(event, context):
    data = json.loads(base64.b64decode(event['data']).decode('utf-8'))
    student_id = data['student_id']
    plan = data['plan']

    for topic_block in plan:
        topic = topic_block["topic"]
        print(f"[ContentGenerator] Generating content for {topic}...")
        # This is where you'd call Gemini API or Vertex AI

    print(f"[ContentGenerator] Content generation complete for {student_id}")
    return {"status": "done"}
