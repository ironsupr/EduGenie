"""
Assessment Agent Logic - Handles student assessment and performance analysis
"""
from typing import Dict, List, Any, Optional
from core.models import AssessmentAnalysis
from utils.logger import setup_logger

logger = setup_logger(__name__)

class AssessmentEngine:
    def __init__(self):
        self.logger = setup_logger(__name__)
        self.topic_map = {
            "x =": "linear equations",
            "x^2": "quadratic equations",
            "graph": "graph interpretation",
            "function": "functions",
            "derivative": "calculus",
            "integral": "calculus",
            "probability": "statistics",
            "matrix": "linear algebra"
        }

    async def analyze_quiz(self, answers: Dict[str, Any]) -> Optional[AssessmentAnalysis]:
        """
        Analyze student answers to determine strengths and weaknesses.
        Args:
            answers: Dictionary containing question-answer pairs
        Returns:
            AssessmentAnalysis object containing strengths and weaknesses
        """
        try:
            self.logger.info("Starting quiz analysis")
            strengths: List[str] = []
            weaknesses: List[str] = []

            for q_id, answer in answers.items():
                try:
                    detected_topics = self._detect_topics(answer)
                    if self._is_correct_answer(answer):
                        strengths.extend(detected_topics)
                    else:
                        weaknesses.extend(detected_topics)
                except Exception as e:
                    self.logger.warning(f"Error processing answer {q_id}: {str(e)}")
                    continue

            # Remove duplicates while preserving order
            strengths = list(dict.fromkeys(strengths))
            weaknesses = list(dict.fromkeys(weaknesses))

            self.logger.info(f"Analysis complete. Found {len(strengths)} strengths and {len(weaknesses)} weaknesses")
            return AssessmentAnalysis(
                strengths=strengths,
                weaknesses=weaknesses
            )
        except Exception as e:
            self.logger.error(f"Failed to analyze quiz: {str(e)}")
            raise

    def _detect_topics(self, answer: str) -> List[str]:
        """
        Detect topics based on keywords in the answer
        """
        topics = []
        for keyword, topic in self.topic_map.items():
            if keyword.lower() in answer.lower():
                topics.append(topic)
        return topics

    def _is_correct_answer(self, answer: str) -> bool:
        """
        Determine if an answer is correct
        """
        return "wrong" not in answer.lower()

    async def generate_recommendations(self, analysis: AssessmentAnalysis) -> List[str]:
        """
        Generate personalized learning recommendations based on assessment analysis
        """
        try:
            recommendations = []
            if analysis.weaknesses:
                for topic in analysis.weaknesses:
                    recommendations.append({
                        "topic": topic,
                        "resources": self._get_topic_resources(topic),
                        "priority": "high" if topic in ["linear equations", "functions"] else "medium"
                    })
            return recommendations
        except Exception as e:
            self.logger.error(f"Error generating recommendations: {str(e)}")
            raise

    def _get_topic_resources(self, topic: str) -> List[str]:
        """
        Get learning resources for a specific topic
        """
        # This would be replaced with actual resource lookup logic
        return [
            f"Khan Academy - {topic}",
            f"Practice exercises - {topic}",
            f"Video tutorials - {topic}"
        ]
