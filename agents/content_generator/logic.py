"""
Content Generator Agent - Generates personalized learning content
"""
from typing import Dict, List, Any, Optional
from datetime import datetime
from utils.logger import setup_logger

logger = setup_logger(__name__)

class ContentGenerator:
    def __init__(self):
        self.logger = setup_logger(__name__)
        self.topics = {
            "quadratic_factoring": {
                "lesson": "Quadratic factoring is a method to express a quadratic equation as a product of binomials. For example, x² - 5x + 6 = (x - 2)(x - 3).",
                "examples": [
                    "Factor x² + 7x + 10 = (x + 5)(x + 2)",
                    "Factor x² - 4x - 5 = (x - 5)(x + 1)"
                ],
                "practice_questions": [
                    "Factor: x² - 6x + 8",
                    "Factor: x² + x - 12"
                ]
            }
        }

    async def generate_lesson_content(
        self, 
        topic: str,
        difficulty: str = "beginner",
        student_profile: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Generate personalized lesson content for a given topic
        """
        try:
            self.logger.info(f"Generating content for topic: {topic}")
            
            topic_key = topic.lower().replace(" ", "_")
            if topic_key in self.topics:
                content = self.topics[topic_key]
                self.logger.info(f"Using template for {topic}")
            else:
                content = self._generate_dynamic_content(topic)
                self.logger.info(f"Generated dynamic content for {topic}")

            if student_profile:
                content = self._personalize_content(content, student_profile)
            
            return {
                "topic": topic,
                "difficulty": difficulty,
                "content": content,
                "generated_at": datetime.now().isoformat()
            }
        except Exception as e:
            self.logger.error(f"Error generating content for {topic}: {str(e)}")
            raise

    def _generate_dynamic_content(self, topic: str) -> Dict[str, Any]:
        """Generate dynamic content when no template exists"""
        return {
            "lesson": f"This is a generated lesson for {topic}. Replace with Gemini output later.",
            "examples": [
                f"Example 1 for {topic}",
                f"Example 2 for {topic}"
            ],
            "practice_questions": [
                f"Practice 1 for {topic}",
                f"Practice 2 for {topic}"
            ]
        }

    def _personalize_content(self, content: Dict[str, Any], student_profile: Dict) -> Dict[str, Any]:
        """Personalize content based on student profile"""
        # Add personalization logic here
        content["personalized"] = True
        content["learning_style"] = student_profile.get("learning_style", "visual")
        return content
