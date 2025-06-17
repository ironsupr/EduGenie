# EduGenie - AI-Powered Educational Platform

An intelligent education management application powered by Google AI SDK for personalized learning experiences.

## 🚀 Features

### AI-Powered Learning

- **Intelligent Content Generation**: AI creates personalized lessons, explanations, and examples
- **Smart Assessment Analysis**: Detailed feedback and performance insights using AI
- **Personalized Recommendations**: AI-driven study plans and learning path optimization
- **Interactive AI Assistant**: Real-time homework help and concept explanations

### Core Educational Features

- **Course Module Interface**: Collapsible sidebar, video lessons, AI-generated notes
- **Interactive Dashboard**: Progress tracking, study analytics, and gamification
- **Dynamic Assessments**: AI-generated quizzes and practice problems
- **Progress Analytics**: Comprehensive learning analytics and insights

### Technical Features

- **Google AI SDK Integration**: Powered by Gemini for advanced AI capabilities
- **Firestore Database**: Scalable cloud data storage and retrieval
- **FastAPI Backend**: Modern, async Python web framework
- **Responsive Frontend**: Mobile-friendly web interface

## 🛠️ Quick Setup

### Prerequisites

- Python 3.9 or higher
- Google AI API key (from [Google AI Studio](https://aistudio.google.com/))
- (Optional) Google Cloud Project for Firestore

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/Ironsupr/EduGenie.git
   cd EduGenie
   ```

2. **Install Dependencies**

   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment**
   Create a `.env` file in the project root:

   ```bash
   # Google AI SDK Configuration
   GOOGLE_AI_API_KEY=your_gemini_api_key_here

   # Optional: Firestore Configuration
   GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
   FIRESTORE_PROJECT_ID=your_firestore_project_id   # Application Settings
   DEBUG=True
   PROJECT_ID=edugenie-1
   ```

4. **Run the Application**

   ```bash
   python main.py
   ```

5. **Access the Application**
   - Main App: http://localhost:8000
   - Course Module: http://localhost:8000/course-module
   - Dashboard: http://localhost:8000/dashboard

## 🧠 AI Integration

EduGenie leverages Google's Gemini AI model for advanced educational features:

### Content Generation

```python
# Generate personalized lesson content
lesson = await ai_client.generate_lesson_content(
    topic="Quadratic Equations",
    difficulty="intermediate",
    student_profile={"learning_style": "visual"}
)
```

### Assessment Analysis

```python
# Analyze student responses with AI feedback
analysis = await ai_client.analyze_student_response(
    question="Solve: x² - 4 = 0",
    student_answer="x = ±2",
    correct_answer="x = ±2"
)
```

### Personalized Recommendations

```python
# Generate AI-powered study recommendations
recommendations = await ai_client.generate_personalized_recommendations({
    'strengths': ['algebra', 'graphing'],
    'weaknesses': ['word problems', 'factoring']
})
```

## 📊 Architecture

```
EduGenie/
├── 🧠 core/
│   ├── ai_client.py          # Google AI SDK integration
│   ├── firestore_client.py   # Database operations
│   └── models.py             # Data models
├── 🤖 agents/
│   ├── content_generator/    # AI content creation
│   ├── assessment_agent/     # Smart assessment analysis
│   ├── recommender/          # Personalized recommendations
│   └── progress_tracker/     # Learning analytics
├── 🎨 frontend/
│   └── web_app/
│       ├── templates/        # HTML templates
│       ├── static/          # CSS, JS, assets
│       └── routes/          # API endpoints
└── 📚 Documentation/
    ├── GOOGLE_AI_SDK_GUIDE.md
    ├── GOOGLE_AI_SETUP.md
    └── FIRESTORE_AUTH_SETUP.md
```

## 🎯 Usage Examples

### Test AI Integration

```bash
# Run comprehensive AI integration tests
python test_google_ai_integration.py

# Run usage examples
python examples_google_ai_usage.py
```

### Generate Educational Content

```python
from agents.content_generator.logic import ContentGenerator

# Create AI-powered lesson
generator = ContentGenerator()
lesson = await generator.generate_lesson_content(
    topic="Python Programming Basics",
    difficulty="beginner"
)

# Generate practice questions
questions = await generator.generate_quiz_questions(
    topic="Python Programming Basics",
    num_questions=5
)
```

## 🔧 Configuration

### AI Model Settings

Customize AI behavior in `core/config.py`:

```python
AI_TEMPERATURE = 0.7      # Creativity vs consistency (0.0-1.0)
AI_TOP_P = 0.8           # Nucleus sampling (0.0-1.0)
AI_MAX_OUTPUT_TOKENS = 2048  # Maximum response length
```

### Fallback System

EduGenie includes comprehensive fallbacks when AI services are unavailable:

- Template-based content generation
- Rule-based assessment analysis
- Static recommendation systems
- Predefined chat responses

## 📖 Documentation

- **[Google AI SDK Integration Guide](GOOGLE_AI_SDK_GUIDE.md)** - Comprehensive AI integration documentation
- **[Google AI Setup Guide](GOOGLE_AI_SETUP.md)** - Step-by-step setup instructions
- **[Firestore Integration Guide](FIRESTORE_INTEGRATION_GUIDE.md)** - Database setup and usage
- **[Course Module Documentation](COURSE_MODULE_README.md)** - UI/UX features and design

## 🧪 Testing

```bash
# Test all AI features
python test_google_ai_integration.py

# Run usage examples
python examples_google_ai_usage.py

# Test web application
python main.py
# Navigate to http://localhost:8000 in your browser
```

## 🚀 Deployment

### Production Environment

```bash
# Set production environment variables
export GOOGLE_AI_API_KEY=your_production_api_key
export DEBUG=False
export AI_TEMPERATURE=0.5

# Run with production settings
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Docker Support (Optional)

```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google AI Team** for the powerful Gemini API
- **FastAPI Team** for the excellent web framework
- **Google Cloud** for Firestore database services
- **Open Source Community** for inspiration and support

---

**Built with ❤️ for educators and students worldwide**
