"""
Google AI SDK Integration for EduGenie
This module provides centralized access to Google's Generative AI capabilities
using the official Google AI SDK (google-generativeai)
"""

import os
import google.generativeai as genai
from typing import Dict, List, Any, Optional
from datetime import datetime
import json
from utils.logger import setup_logger

logger = setup_logger(__name__)

class GoogleAIClient:
    """
    Centralized client for Google AI SDK integration
    Handles authentication and provides methods for various AI tasks
    """
    
    def __init__(self):
        """Initialize the Google AI client with API key"""
        self.api_key = os.getenv('GOOGLE_AI_API_KEY')
        if not self.api_key:
            raise ValueError("GOOGLE_AI_API_KEY environment variable not set")
        
        # Configure the API key
        genai.configure(api_key=self.api_key)
        
        # Initialize model configurations
        self.models = {
            'text': 'gemini-1.5-flash',
            'chat': 'gemini-1.5-flash',
            'embedding': 'text-embedding-004'
        }
        
        self.generation_config = {
            'temperature': 0.7,
            'top_p': 0.8,
            'top_k': 40,
            'max_output_tokens': 2048,
        }
        
        logger.info("Google AI SDK client initialized successfully")
    
    async def generate_content(self, prompt: str, model_type: str = 'text') -> str:
        """
        Generate content using Gemini model
        
        Args:
            prompt: The input prompt
            model_type: Type of model to use ('text', 'chat')
            
        Returns:
            Generated content as string
        """
        try:
            model = genai.GenerativeModel(
                model_name=self.models[model_type],
                generation_config=self.generation_config
            )
            
            response = await model.generate_content_async(prompt)
            return response.text
            
        except Exception as e:
            logger.error(f"Error generating content: {str(e)}")
            raise
    
    async def generate_lesson_content(self, topic: str, difficulty: str, student_profile: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Generate comprehensive lesson content for a specific topic
        
        Args:
            topic: The subject topic
            difficulty: Difficulty level (beginner, intermediate, advanced)
            student_profile: Optional student profile for personalization
            
        Returns:
            Dictionary containing lesson content
        """
        try:
            # Build personalized prompt
            profile_context = ""
            if student_profile:
                learning_style = student_profile.get('learning_style', 'visual')
                grade_level = student_profile.get('grade_level', 'high school')
                profile_context = f"Student profile: {learning_style} learner, {grade_level} level. "
            
            prompt = f"""
            {profile_context}Create a comprehensive lesson on {topic} at {difficulty} level.
            
            Please provide:
            1. A clear explanation of the concept
            2. 3-5 practical examples with step-by-step solutions
            3. 5 practice questions with varying difficulty
            4. Key takeaways and summary points
            5. Real-world applications
            
            Format the response as JSON with the following structure:
            {{
                "title": "lesson title",
                "explanation": "detailed explanation",
                "examples": ["example1", "example2", ...],
                "practice_questions": ["question1", "question2", ...],
                "key_takeaways": ["point1", "point2", ...],
                "real_world_applications": ["application1", "application2", ...]
            }}
            """
            
            content = await self.generate_content(prompt, 'text')
            
            # Parse JSON response
            try:
                lesson_data = json.loads(content)
                lesson_data['generated_at'] = datetime.utcnow().isoformat()
                lesson_data['topic'] = topic
                lesson_data['difficulty'] = difficulty
                return lesson_data
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                return {
                    "title": f"{topic} - {difficulty.title()} Level",
                    "explanation": content,
                    "examples": [],
                    "practice_questions": [],
                    "key_takeaways": [],
                    "real_world_applications": [],
                    "generated_at": datetime.utcnow().isoformat(),
                    "topic": topic,
                    "difficulty": difficulty
                }
                
        except Exception as e:
            logger.error(f"Error generating lesson content for {topic}: {str(e)}")
            raise
    
    async def analyze_student_response(self, question: str, student_answer: str, correct_answer: str) -> Dict[str, Any]:
        """
        Analyze student's response and provide feedback
        
        Args:
            question: The original question
            student_answer: Student's response
            correct_answer: The correct answer
            
        Returns:
            Analysis with feedback and suggestions
        """
        try:
            prompt = f"""
            Analyze this student response:
            
            Question: {question}
            Student Answer: {student_answer}
            Correct Answer: {correct_answer}
            
            Please provide:
            1. Whether the answer is correct (true/false)
            2. Specific feedback on what's right/wrong
            3. Suggestions for improvement
            4. Confidence score (0-100)
            5. Topic areas that need more practice
            
            Format as JSON:
            {{
                "is_correct": boolean,
                "feedback": "detailed feedback",
                "suggestions": ["suggestion1", "suggestion2"],
                "confidence_score": 0-100,
                "practice_topics": ["topic1", "topic2"]
            }}
            """
            
            content = await self.generate_content(prompt, 'text')
            analysis = json.loads(content)
            analysis['analyzed_at'] = datetime.utcnow().isoformat()
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing student response: {str(e)}")
            raise
    
    async def generate_personalized_recommendations(self, student_progress: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generate personalized learning recommendations based on student progress
        
        Args:
            student_progress: Dictionary containing student's learning history and performance
            
        Returns:
            List of personalized recommendations
        """
        try:
            progress_summary = json.dumps(student_progress, indent=2)
            
            prompt = f"""
            Based on this student's progress data, generate personalized learning recommendations:
            
            {progress_summary}
            
            Please provide 5-7 specific recommendations including:
            1. Topics to focus on next
            2. Specific skills to practice
            3. Study strategies
            4. Time allocation suggestions
            5. Difficulty level adjustments
            
            Format as JSON array:
            [
                {{
                    "type": "topic_focus|skill_practice|study_strategy|time_management|difficulty_adjustment",
                    "title": "recommendation title",
                    "description": "detailed description",
                    "priority": "high|medium|low",
                    "estimated_time": "time in hours",
                    "resources": ["resource1", "resource2"]
                }}
            ]
            """
            
            content = await self.generate_content(prompt, 'text')
            recommendations = json.loads(content)
            
            # Add metadata
            for rec in recommendations:
                rec['generated_at'] = datetime.utcnow().isoformat()
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {str(e)}")
            raise
    
    async def create_interactive_chat_response(self, user_message: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Generate interactive chat responses for the AI assistant
        
        Args:
            user_message: User's message
            context: Optional context about the student and current session
            
        Returns:
            Chat response with suggestions and follow-up questions
        """
        try:
            context_str = ""
            if context:
                context_str = f"Context: {json.dumps(context, indent=2)}\n"
            
            prompt = f"""
            {context_str}User message: {user_message}
            
            As an AI tutor assistant, provide a helpful, encouraging response that:
            1. Directly addresses the user's question or concern
            2. Provides actionable advice or explanations
            3. Includes 2-3 follow-up suggestions
            4. Matches an encouraging, supportive tone
            
            Format as JSON:
            {{
                "response": "main response text",
                "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
                "follow_up_questions": ["question1", "question2"],
                "tone": "encouraging|explanatory|motivational|supportive"
            }}
            """
            
            content = await self.generate_content(prompt, 'chat')
            chat_response = json.loads(content)
            chat_response['timestamp'] = datetime.utcnow().isoformat()
            return chat_response
            
        except Exception as e:
            logger.error(f"Error generating chat response: {str(e)}")
            # Fallback response
            return {
                "response": "I'm here to help! Could you provide more details about what you'd like to learn or practice?",
                "suggestions": ["Ask a specific question", "Request practice problems", "Get study tips"],
                "follow_up_questions": ["What topic are you working on?", "What's challenging you the most?"],
                "tone": "supportive",
                "timestamp": datetime.utcnow().isoformat()
            }
    
    async def generate_quiz_questions(self, topic: str, difficulty: str, num_questions: int = 5) -> List[Dict[str, Any]]:
        """
        Generate quiz questions for a specific topic
        
        Args:
            topic: Subject topic
            difficulty: Difficulty level
            num_questions: Number of questions to generate
            
        Returns:
            List of quiz questions with answers
        """
        try:
            prompt = f"""
            Generate {num_questions} quiz questions on {topic} at {difficulty} level.
            
            Include a mix of:
            - Multiple choice (4 options each)
            - Short answer
            - Problem-solving questions
            
            Format as JSON array:
            [
                {{
                    "type": "multiple_choice|short_answer|problem_solving",
                    "question": "question text",
                    "options": ["A", "B", "C", "D"] or null for non-multiple choice,
                    "correct_answer": "correct answer",
                    "explanation": "why this is correct",
                    "difficulty_points": 1-10
                }}
            ]
            """
            
            content = await self.generate_content(prompt, 'text')
            questions = json.loads(content)
            
            # Add metadata
            for q in questions:
                q['topic'] = topic
                q['generated_at'] = datetime.utcnow().isoformat()
            
            return questions
            
        except Exception as e:
            logger.error(f"Error generating quiz questions: {str(e)}")
            raise

# Global instance
_ai_client = None

def get_ai_client() -> GoogleAIClient:
    """Get the global AI client instance"""
    global _ai_client
    if _ai_client is None:
        _ai_client = GoogleAIClient()
    return _ai_client
