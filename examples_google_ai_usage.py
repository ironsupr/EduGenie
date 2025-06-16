#!/usr/bin/env python3
"""
Google AI SDK Example Usage for EduGenie
This script demonstrates how to use the AI features in EduGenie
"""

import asyncio
import os
import sys
from datetime import datetime

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

async def example_content_generation():
    """Example: Generate educational content using AI"""
    print("📚 Content Generation Example")
    print("-" * 40)
    
    from agents.content_generator.logic import ContentGenerator
    
    # Create content generator instance
    generator = ContentGenerator()
    
    # Generate a lesson
    lesson = await generator.generate_lesson_content(
        topic="Photosynthesis",
        difficulty="high school",
        student_profile={
            "learning_style": "visual",
            "grade_level": "10th grade"
        }
    )
    
    print(f"📖 Lesson Title: {lesson.get('title', 'Generated Lesson')}")
    print(f"📝 Explanation: {lesson.get('explanation', 'No explanation available')[:100]}...")
    print(f"🎯 Examples: {len(lesson.get('examples', []))} provided")
    print(f"❓ Practice Questions: {len(lesson.get('practice_questions', []))} generated")
    print(f"💡 Key Takeaways: {len(lesson.get('key_takeaways', []))} points")
    print()

async def example_quiz_generation():
    """Example: Generate quiz questions using AI"""
    print("❓ Quiz Generation Example")
    print("-" * 40)
    
    from agents.content_generator.logic import ContentGenerator
    
    generator = ContentGenerator()
    
    # Generate quiz questions
    questions = await generator.generate_quiz_questions(
        topic="World War II",
        difficulty="intermediate",
        num_questions=3
    )
    
    print(f"📋 Generated {len(questions)} quiz questions:")
    print()
    
    for i, question in enumerate(questions, 1):
        print(f"Question {i}:")
        print(f"  Type: {question.get('type', 'unknown')}")
        print(f"  Question: {question.get('question', 'No question text')}")
        if question.get('options'):
            print(f"  Options: {len(question['options'])} choices")
        print(f"  Difficulty: {question.get('difficulty_points', 'Unknown')} points")
        print()

async def example_assessment_analysis():
    """Example: Analyze student assessment using AI"""
    print("📊 Assessment Analysis Example")
    print("-" * 40)
    
    from agents.assessment_agent.logic import AssessmentEngine
    
    engine = AssessmentEngine()
    
    # Mock student quiz responses
    student_responses = {
        "q1": {
            "question": "What is the capital of France?",
            "student_answer": "Paris",
            "correct_answer": "Paris"
        },
        "q2": {
            "question": "Solve: 2x + 5 = 13",
            "student_answer": "x = 4",
            "correct_answer": "x = 4"
        },
        "q3": {
            "question": "What causes photosynthesis?",
            "student_answer": "Sunlight and water",
            "correct_answer": "Sunlight, water, and carbon dioxide"
        }
    }
    
    # Analyze the responses
    analysis = await engine.analyze_quiz(student_responses)
    
    print(f"✅ Strengths: {', '.join(analysis.strengths) if analysis.strengths else 'None identified'}")
    print(f"⚠️  Weaknesses: {', '.join(analysis.weaknesses) if analysis.weaknesses else 'None identified'}")
    
    # Generate recommendations
    recommendations = await engine.generate_recommendations(analysis)
    
    print(f"\n💡 Recommendations ({len(recommendations)} generated):")
    for i, rec in enumerate(recommendations[:3], 1):  # Show first 3
        if isinstance(rec, dict):
            print(f"  {i}. {rec.get('title', 'Study Recommendation')}")
            print(f"     Priority: {rec.get('priority', 'Medium')}")
            print(f"     Time: {rec.get('estimated_time', 'Unknown')}")
        else:
            print(f"  {i}. {rec}")
    print()

async def example_personalized_recommendations():
    """Example: Generate personalized study recommendations"""
    print("🎯 Personalized Recommendations Example")
    print("-" * 40)
    
    from agents.recommender.logic import suggest_topics
    
    # Mock student progress data
    progress_history = [
        {"topic": "algebra basics", "score": 0.95, "timestamp": "2024-01-15"},
        {"topic": "linear equations", "score": 0.88, "timestamp": "2024-01-16"},
        {"topic": "quadratic equations", "score": 0.65, "timestamp": "2024-01-17"},
        {"topic": "graphing functions", "score": 0.72, "timestamp": "2024-01-18"},
        {"topic": "trigonometry", "score": 0.45, "timestamp": "2024-01-19"},
    ]
    
    student_profile = {
        "learning_style": "kinesthetic",
        "grade_level": "11th grade",
        "preferred_study_time": "afternoon"
    }
    
    # Generate recommendations
    recommendations = suggest_topics(progress_history, student_profile)
    
    print("📖 Review Topics (Need more practice):")
    for topic in recommendations.get('review_topics', [])[:3]:
        if isinstance(topic, dict):
            print(f"  • {topic.get('topic', 'Unknown topic')}")
            print(f"    {topic.get('description', 'No description')}")
        else:
            print(f"  • {topic}")
    
    print("\n🚀 Enrichment Topics (Ready for advanced work):")
    for topic in recommendations.get('enrichment_topics', [])[:3]:
        if isinstance(topic, dict):
            print(f"  • {topic.get('topic', 'Unknown topic')}")
            print(f"    {topic.get('description', 'No description')}")
        else:
            print(f"  • {topic}")
    
    print("\n📚 Study Strategies:")
    for strategy in recommendations.get('study_strategies', [])[:2]:
        if isinstance(strategy, dict):
            print(f"  • {strategy.get('strategy', 'Study Tip')}")
            print(f"    {strategy.get('description', 'No description')}")
        else:
            print(f"  • {strategy}")
    print()

async def example_ai_chat():
    """Example: AI chat assistant interaction"""
    print("💬 AI Chat Assistant Example")
    print("-" * 40)
    
    # Example chat interactions
    chat_scenarios = [
        "I'm struggling with calculus derivatives. Can you help?",
        "What's the best way to study for a history exam?",
        "I need help with my chemistry homework about molecules",
        "Can you explain the difference between mitosis and meiosis?"
    ]
    
    try:
        from core.ai_client import get_ai_client
        
        ai_client = get_ai_client()
        
        for i, user_message in enumerate(chat_scenarios, 1):
            print(f"Chat Example {i}:")
            print(f"👤 Student: {user_message}")
            
            # Get AI response
            try:
                response = await ai_client.create_interactive_chat_response(
                    user_message=user_message,
                    context={
                        "user_type": "student",
                        "session_type": "homework_help",
                        "timestamp": datetime.now().isoformat()
                    }
                )
                
                print(f"🤖 AI Assistant: {response.get('response', 'No response generated')}")
                
                suggestions = response.get('suggestions', [])
                if suggestions:
                    print(f"💡 Suggestions: {', '.join(suggestions[:2])}")
                
            except Exception as e:
                print(f"🤖 AI Assistant: I'm here to help! Let me know what specific topic you'd like to work on.")
                print(f"   (AI unavailable: {str(e)})")
            
            print()
    
    except Exception as e:
        print(f"⚠️  AI Chat not available: {str(e)}")
        print("Using fallback responses...")
        
        fallback_responses = {
            "calculus": "Calculus can be challenging! Try breaking derivatives into smaller steps and practice with simple functions first.",
            "history": "For history exams, create timelines and practice with flashcards. Focus on cause-and-effect relationships.",
            "chemistry": "Chemistry is all about understanding how atoms and molecules interact. What specific concept are you working on?",
            "biology": "Biology topics are easier to remember when you understand the 'why' behind processes. Let's break it down step by step."
        }
        
        for message in chat_scenarios:
            print(f"👤 Student: {message}")
              # Simple keyword matching for fallback
            response_key = "default"
            for key in fallback_responses:
                if key in message.lower():
                    response_key = key
                    break
            
            response = fallback_responses.get(response_key, "I'm here to help! Can you be more specific about what you need help with?")
            print(f"🤖 AI Assistant: {response}")
            print()

async def main():
    """Run all examples"""
    print("🎓 EduGenie Google AI SDK Usage Examples")
    print("=" * 60)
    print()
    
    # Check if API key is set
    api_key = os.getenv('GOOGLE_AI_API_KEY')
    if not api_key:
        print("💡 Note: GOOGLE_AI_API_KEY not set - using fallback methods")
        print("   For full AI features, set your API key in the environment")
        print()
    
    examples = [
        ("Content Generation", example_content_generation),
        ("Quiz Generation", example_quiz_generation),
        ("Assessment Analysis", example_assessment_analysis),
        ("Personalized Recommendations", example_personalized_recommendations),
        ("AI Chat Assistant", example_ai_chat),
    ]
    
    for name, example_func in examples:
        try:
            await example_func()
        except Exception as e:
            print(f"❌ Error in {name}: {str(e)}")
            print()
    
    print("🎉 Examples completed!")
    print()
    print("💡 Integration Tips:")
    print("   - All functions include fallback methods for reliability")
    print("   - AI responses are cached for better performance")
    print("   - Content is filtered for educational appropriateness")
    print("   - Personal data is never sent to external AI services")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n🛑 Examples interrupted by user")
    except Exception as e:
        print(f"\n💥 Unexpected error: {str(e)}")
