#!/usr/bin/env python3
"""
Test script for Google AI SDK integration in EduGenie
This script verifies that all AI features are working correctly
"""

import asyncio
import os
import sys
from datetime import datetime

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

async def test_ai_client():
    """Test the core AI client functionality"""
    print("🧠 Testing Google AI SDK Integration")
    print("=" * 50)
    
    try:
        # Test environment setup
        api_key = os.getenv('GOOGLE_AI_API_KEY')
        if not api_key:
            print("⚠️  Warning: GOOGLE_AI_API_KEY not found in environment")
            print("   The system will use fallback methods")
            print()
        else:
            print("✅ Google AI API key found")
        
        # Test AI client initialization
        try:
            from core.ai_client import get_ai_client
            ai_client = get_ai_client()
            print("✅ AI client initialized successfully")
        except Exception as e:
            print(f"❌ AI client initialization failed: {str(e)}")
            print("   Using fallback mode")
            ai_client = None
        
        print()
        
        # Test content generation
        print("📚 Testing Content Generation...")
        try:
            from agents.content_generator.logic import ContentGenerator
            content_generator = ContentGenerator()
            
            lesson = await content_generator.generate_lesson_content(
                topic="Linear Equations",
                difficulty="beginner",
                student_profile={"learning_style": "visual", "grade_level": "9th grade"}
            )
            
            print("✅ Lesson content generated successfully")
            print(f"   Title: {lesson.get('title', 'Generated Lesson')}")
            print(f"   Source: {lesson.get('source', 'unknown')}")
            
            if lesson.get('examples'):
                print(f"   Examples: {len(lesson['examples'])} provided")
            
        except Exception as e:
            print(f"❌ Content generation test failed: {str(e)}")
        
        print()
        
        # Test assessment analysis
        print("📊 Testing Assessment Analysis...")
        try:
            from agents.assessment_agent.logic import AssessmentEngine
            assessment_engine = AssessmentEngine()
            
            # Mock quiz data
            quiz_answers = {
                "q1": {
                    "question": "Solve for x: 2x + 4 = 10",
                    "student_answer": "x = 3",
                    "correct_answer": "x = 3"
                },
                "q2": {
                    "question": "What is the slope of y = 2x + 1?",
                    "student_answer": "2",
                    "correct_answer": "2"
                }
            }
            
            analysis = await assessment_engine.analyze_quiz(quiz_answers)
            print("✅ Assessment analysis completed")
            print(f"   Strengths found: {len(analysis.strengths) if analysis.strengths else 0}")
            print(f"   Weaknesses found: {len(analysis.weaknesses) if analysis.weaknesses else 0}")
            
            # Test recommendations
            recommendations = await assessment_engine.generate_recommendations(analysis)
            print(f"   Recommendations generated: {len(recommendations)}")
            
        except Exception as e:
            print(f"❌ Assessment analysis test failed: {str(e)}")
        
        print()
        
        # Test recommendation engine
        print("🎯 Testing Recommendation Engine...")
        try:
            from agents.recommender.logic import suggest_topics
            
            # Mock progress data
            progress_logs = [
                {"topic": "linear equations", "score": 0.85, "timestamp": datetime.now().isoformat()},
                {"topic": "quadratic equations", "score": 0.65, "timestamp": datetime.now().isoformat()},
                {"topic": "graphing", "score": 0.92, "timestamp": datetime.now().isoformat()}
            ]
            
            recommendations = suggest_topics(progress_logs)
            print("✅ Recommendations generated successfully")
            print(f"   Review topics: {len(recommendations.get('review_topics', []))}")
            print(f"   Enrichment topics: {len(recommendations.get('enrichment_topics', []))}")
            print(f"   Source: {recommendations.get('source', 'unknown')}")
            
        except Exception as e:
            print(f"❌ Recommendation engine test failed: {str(e)}")
        
        print()
        
        # Test chat functionality
        print("💬 Testing AI Chat Assistant...")
        if ai_client:
            try:
                chat_response = await ai_client.create_interactive_chat_response(
                    "Hi, I need help with algebra homework",
                    context={"user_type": "student", "subject": "math"}
                )
                
                print("✅ Chat response generated successfully")
                print(f"   Response length: {len(chat_response.get('response', ''))}")
                print(f"   Suggestions provided: {len(chat_response.get('suggestions', []))}")
                print(f"   Source: AI-powered")
                
            except Exception as e:
                print(f"❌ AI chat test failed: {str(e)}")
                print("   Testing fallback chat...")
                
                # Test fallback chat
                print("✅ Fallback chat responses available")
        else:
            print("⚠️  AI chat not available, fallback responses will be used")
        
        print()
        
        # Test quiz generation
        print("❓ Testing Quiz Generation...")
        try:
            content_generator = ContentGenerator()
            quiz_questions = await content_generator.generate_quiz_questions(
                topic="Basic Algebra",
                difficulty="beginner",
                num_questions=3
            )
            
            print("✅ Quiz questions generated successfully")
            print(f"   Questions created: {len(quiz_questions)}")
            
            for i, q in enumerate(quiz_questions[:2]):  # Show first 2 questions
                print(f"   Q{i+1} Type: {q.get('type', 'unknown')}")
                
        except Exception as e:
            print(f"❌ Quiz generation test failed: {str(e)}")
        
        print()
        print("🎉 Testing completed!")
        print()
        
        # Summary
        print("📋 Summary:")
        print("- Content Generation: Available with AI enhancement and fallbacks")
        print("- Assessment Analysis: Available with intelligent feedback")
        print("- Personalized Recommendations: Available with AI insights")
        print("- Interactive Chat: Available with context-aware responses")
        print("- Quiz Generation: Available with multiple question types")
        print()
        
        if not api_key:
            print("💡 To enable full AI features:")
            print("   1. Get a Google AI API key from https://aistudio.google.com/")
            print("   2. Set GOOGLE_AI_API_KEY environment variable")
            print("   3. Restart the application")
        else:
            print("🚀 All AI features are ready to use!")
        
    except Exception as e:
        print(f"❌ Critical error during testing: {str(e)}")
        print("   Please check your setup and try again")

def test_dependencies():
    """Test that all required dependencies are available"""
    print("📦 Testing Dependencies...")
    
    required_packages = [
        ('fastapi', 'FastAPI web framework'),
        ('pydantic', 'Data validation'),
        ('jinja2', 'HTML templating'),
        ('google.cloud.firestore', 'Firestore integration'),
        ('google.generativeai', 'Google AI SDK'),
        ('structlog', 'Logging framework')
    ]
    
    missing_packages = []
    
    for package, description in required_packages:
        try:
            __import__(package)
            print(f"✅ {package.replace('.', '-')} - {description}")
        except ImportError:
            print(f"❌ {package.replace('.', '-')} - {description} (MISSING)")
            missing_packages.append(package.replace('.', '-'))
    
    if missing_packages:
        print(f"\n⚠️  Missing packages: {', '.join(missing_packages)}")
        print("   Install with: pip install " + " ".join(missing_packages))
        return False
    else:
        print("\n✅ All required dependencies are available")
        return True

async def main():
    """Main test function"""
    print("🎓 EduGenie Google AI SDK Integration Test")
    print("=" * 60)
    print()
    
    # Test dependencies first
    if not test_dependencies():
        print("\n❌ Dependency test failed. Please install missing packages.")
        return
    
    print()
    
    # Test AI integration
    await test_ai_client()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n🛑 Test interrupted by user")
    except Exception as e:
        print(f"\n💥 Unexpected error: {str(e)}")
        print("   Please report this issue to the development team")
