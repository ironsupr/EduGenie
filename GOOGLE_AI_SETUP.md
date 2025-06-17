# EduGenie Google AI SDK Setup Guide

## Quick Setup Instructions

Follow these steps to set up EduGenie with Google AI SDK integration.

### 1. Prerequisites

- Python 3.9 or higher
- Google AI API access (Gemini API key)
- (Optional) Google Cloud Project for Firestore

### 2. Installation

```bash
# Clone or navigate to the EduGenie project directory
cd d:\Project\EduGenie

# Install required dependencies
pip install -r requirements.txt

# Install additional dependencies if needed
pip install google-generativeai==0.7.2 google-ai-generativelanguage==0.6.6
```

### 3. Get Google AI API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Create a new API key or use an existing one
4. Copy the API key for configuration

### 4. Environment Configuration

Create a `.env` file in the project root:

```bash
# Google AI SDK Configuration
GOOGLE_AI_API_KEY=your_gemini_api_key_here

# Optional: Firestore Configuration (if using database features)
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
FIRESTORE_PROJECT_ID=your_firestore_project_id

# Application Settings
DEBUG=True
PROJECT_ID=edugenie-1
```

### 5. Verify Installation

Run the following test script to verify the Google AI SDK integration:

```python
# test_ai_integration.py
import asyncio
import os

async def test_ai_integration():
    """Test Google AI SDK integration"""
    try:
        # Set API key for testing
        os.environ['GOOGLE_AI_API_KEY'] = 'your_api_key_here'

        from core.ai_client import get_ai_client

        ai_client = get_ai_client()
        print("✅ AI Client initialized successfully")

        # Test content generation
        lesson = await ai_client.generate_lesson_content(
            topic="Basic Algebra",
            difficulty="beginner"
        )
        print("✅ Lesson content generation working")

        # Test chat functionality
        chat_response = await ai_client.create_interactive_chat_response(
            "Hello, can you help me with math?"
        )
        print("✅ Chat functionality working")

        print("🎉 All AI features are working correctly!")

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        print("Please check your API key and network connection")

if __name__ == "__main__":
    asyncio.run(test_ai_integration())
```

### 6. Run the Application

```bash
# Start the application
python main.py

# Or using uvicorn directly
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 7. Access the Application

- Main Application: http://localhost:8000
- Course Module Demo: http://localhost:8000/course-module
- Dashboard: http://localhost:8000/dashboard

## AI Features Available

### 1. Intelligent Content Generation

- **Lesson Creation**: AI generates comprehensive lessons for any topic
- **Quiz Generation**: Automatic creation of practice questions
- **Personalization**: Content adapted to learning styles and skill levels

### 2. Smart Assessment Analysis

- **Answer Evaluation**: AI analyzes student responses with detailed feedback
- **Progress Tracking**: Intelligent analysis of learning progress
- **Weakness Identification**: AI identifies areas needing improvement

### 3. Personalized Recommendations

- **Study Plans**: AI creates personalized learning paths
- **Resource Matching**: Intelligent recommendation of learning materials
- **Time Management**: AI-optimized study schedules

### 4. Interactive AI Assistant

- **Real-time Help**: Instant answers to student questions
- **Contextual Responses**: AI understands educational context
- **Learning Support**: Homework help and concept explanations

## Configuration Options

### AI Model Settings

Edit `core/config.py` or set environment variables:

```python
# Model Selection
AI_MODEL_TEXT = "gemini-1.5-flash"        # For content generation
AI_MODEL_CHAT = "gemini-1.5-flash"        # For chat interactions
AI_MODEL_EMBEDDING = "text-embedding-004"  # For similarity matching

# Generation Parameters
AI_TEMPERATURE = 0.7      # Creativity vs consistency (0.0-1.0)
AI_TOP_P = 0.8           # Nucleus sampling (0.0-1.0)
AI_TOP_K = 40            # Top-k sampling (1-100)
AI_MAX_OUTPUT_TOKENS = 2048  # Maximum response length
```

### Performance Tuning

For production environments:

```python
# Recommended settings for production
AI_TEMPERATURE = 0.5      # More consistent responses
AI_MAX_OUTPUT_TOKENS = 1024  # Shorter responses for faster delivery
```

## Troubleshooting

### Common Issues

1. **API Key Error**

   ```
   Error: GOOGLE_AI_API_KEY environment variable not set
   ```

   - Solution: Ensure your `.env` file contains a valid API key
   - Verify the API key is active in Google AI Studio

2. **Import Error**

   ```
   Import "google.generativeai" could not be resolved
   ```

   - Solution: Install the required package

   ```bash
   pip install google-generativeai==0.7.2
   ```

3. **Rate Limiting**

   ```
   Error: API rate limit exceeded
   ```

   - Solution: Implement rate limiting in your application
   - Consider upgrading your Google AI API quota

4. **Network Issues**
   ```
   Error: Failed to connect to AI service
   ```
   - Solution: Check internet connection and firewall settings
   - Verify Google AI services are accessible

### Fallback Mode

If AI services are unavailable, the application automatically falls back to:

- Template-based content generation
- Rule-based assessment analysis
- Static recommendation systems
- Predefined chat responses

## Testing AI Features

### Content Generation Test

```python
# Test lesson generation
from agents.content_generator.logic import ContentGenerator

generator = ContentGenerator()
lesson = await generator.generate_lesson_content(
    topic="Quadratic Equations",
    difficulty="intermediate"
)
print(lesson)
```

### Assessment Analysis Test

```python
# Test assessment analysis
from agents.assessment_agent.logic import AssessmentEngine

engine = AssessmentEngine()
analysis = await engine.analyze_quiz({
    "q1": {
        "question": "Solve: x² - 4 = 0",
        "student_answer": "x = ±2",
        "correct_answer": "x = ±2"
    }
})
print(analysis)
```

### Chat Assistant Test

```python
# Test chat functionality
from core.ai_client import get_ai_client

ai_client = get_ai_client()
response = await ai_client.create_interactive_chat_response(
    "I need help with algebra homework"
)
print(response)
```

## Advanced Configuration

### Custom Prompts

Modify AI prompts in `core/ai_client.py`:

```python
# Example: Custom lesson generation prompt
lesson_prompt = f"""
Create a {difficulty} level lesson on {topic} that:
1. Starts with real-world examples
2. Uses simple language appropriate for {grade_level}
3. Includes visual learning elements for {learning_style} learners
4. Provides step-by-step explanations
5. Ends with practical applications

Format as JSON with clear structure...
"""
```

### Monitoring and Logging

Enable detailed AI logging:

```python
import logging
logging.getLogger('core.ai_client').setLevel(logging.DEBUG)
```

## Security Best Practices

1. **API Key Security**

   - Never commit API keys to version control
   - Use environment variables or secure key management
   - Rotate API keys regularly

2. **Content Filtering**

   - Validate AI-generated content before presenting to students
   - Implement content safety checks
   - Monitor AI responses for appropriateness

3. **Data Privacy**
   - Do not send personal student information to AI services
   - Anonymize data when possible
   - Comply with educational privacy regulations

## Production Deployment

For production deployment:

1. **Environment Setup**

   ```bash
   # Set production environment variables
   export GOOGLE_AI_API_KEY=your_production_api_key
   export DEBUG=False
   export AI_TEMPERATURE=0.5
   ```

2. **Performance Optimization**

   - Enable response caching
   - Implement connection pooling
   - Use async/await for all AI operations

3. **Monitoring**
   - Track API usage and costs
   - Monitor response times and error rates
   - Set up alerts for service failures

## Support

- **Google AI Documentation**: https://ai.google.dev/
- **API Reference**: https://ai.google.dev/api
- **Community Support**: https://developers.googleblog.com/
- **EduGenie Issues**: Check project documentation or contact the development team

---

**Note**: This guide assumes you have the necessary API access and permissions. Some features may require additional Google Cloud services or API quotas.
