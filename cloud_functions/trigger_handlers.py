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
    """
    Content generation handler using Google AI SDK
    """
    data = json.loads(base64.b64decode(event['data']).decode('utf-8'))
    student_id = data['student_id']
    plan = data['plan']

    try:
        # Import AI client for content generation
        from core.ai_client import get_ai_client
        ai_client = get_ai_client()
        
        # Generate content for each topic in the learning plan
        for topic_block in plan:
            topic = topic_block["topic"]
            difficulty = topic_block.get("difficulty", "beginner")
            
            print(f"[ContentGenerator] Generating AI content for {topic} at {difficulty} level...")
            
            # Use Google AI SDK to generate comprehensive content
            lesson_content = ai_client.generate_lesson_content(topic, difficulty)
            quiz_questions = ai_client.generate_quiz_questions(topic, difficulty, num_questions=5)
            
            print(f"[ContentGenerator] Generated lesson and {len(quiz_questions)} quiz questions for {topic}")
            
            # In a real implementation, you would save this content to your database
            # For now, we'll just log the successful generation
            
    except Exception as ai_error:
        print(f"[ContentGenerator] AI generation failed: {str(ai_error)}. Using fallback content generation.")
        
        # Fallback content generation
        for topic_block in plan:
            topic = topic_block["topic"]
            print(f"[ContentGenerator] Generating fallback content for {topic}...")
            # Fallback logic would go here

    print(f"[ContentGenerator] Content generation complete for {student_id}")
    return {"status": "done", "student_id": student_id}
