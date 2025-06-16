"""
Assessment Agent Logic - Handles student assessment and performance analysis using Google AI SDK
"""
from typing import Dict, List, Any, Optional
from core.models import AssessmentAnalysis
from utils.logger import setup_logger
from core.ai_client import get_ai_client

logger = setup_logger(__name__)

class AssessmentEngine:
    def __init__(self):
        self.logger = setup_logger(__name__)
        self.ai_client = get_ai_client()
        # Fallback topic mapping for when AI is unavailable
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
        Analyze quiz answers and provide detailed feedback using Google AI SDK
        """
        try:
            self.logger.info(f"Analyzing quiz with {len(answers)} answers")
            
            strengths = []
            weaknesses = []
            detailed_feedback = []
            
            for question_id, answer_data in answers.items():
                question = answer_data.get('question', '')
                student_answer = answer_data.get('student_answer', '')
                correct_answer = answer_data.get('correct_answer', '')
                
                # Use AI to analyze each response
                try:
                    analysis = await self.ai_client.analyze_student_response(question, student_answer, correct_answer)
                    
                    if analysis.get('is_correct'):
                        # Add topics to strengths
                        for topic in analysis.get('practice_topics', []):
                            if topic not in strengths:
                                strengths.append(topic)
                    else:
                        # Add topics to weaknesses
                        for topic in analysis.get('practice_topics', []):
                            if topic not in weaknesses:
                                weaknesses.append(topic)
                    
                    detailed_feedback.append({
                        'question_id': question_id,
                        'feedback': analysis.get('feedback', ''),
                        'suggestions': analysis.get('suggestions', []),
                        'confidence_score': analysis.get('confidence_score', 0)
                    })
                    
                except Exception as ai_error:
                    self.logger.warning(f"AI analysis failed for question {question_id}: {str(ai_error)}. Using fallback.")
                    # Fallback analysis
                    fallback_analysis = self._fallback_analyze_answer(question, student_answer, correct_answer)
                    if fallback_analysis['is_correct']:
                        strengths.extend(fallback_analysis['topics'])
                    else:
                        weaknesses.extend(fallback_analysis['topics'])
            
            # Remove duplicates
            strengths = list(set(strengths))
            weaknesses = list(set(weaknesses))
            
            self.logger.info(f"Analysis complete. Found {len(strengths)} strengths and {len(weaknesses)} weaknesses")
            return AssessmentAnalysis(
                strengths=strengths,
                weaknesses=weaknesses,
                detailed_feedback=detailed_feedback
            )
            
        except Exception as e:
            self.logger.error(f"Failed to analyze quiz: {str(e)}")
            # Complete fallback analysis
            return self._fallback_quiz_analysis(answers)

    def _fallback_analyze_answer(self, question: str, student_answer: str, correct_answer: str) -> Dict[str, Any]:
        """Fallback analysis when AI is unavailable"""
        topics = self._detect_topics(student_answer)
        is_correct = self._is_correct_answer(student_answer, correct_answer)
        
        return {
            'is_correct': is_correct,
            'topics': topics,
            'confidence_score': 75 if is_correct else 25
        }

    def _fallback_quiz_analysis(self, answers: Dict[str, Any]) -> AssessmentAnalysis:
        """Complete fallback quiz analysis"""
        strengths = []
        weaknesses = []
        
        for question_id, answer_data in answers.items():
            student_answer = answer_data.get('student_answer', '')
            correct_answer = answer_data.get('correct_answer', '')
            
            topics = self._detect_topics(student_answer)
            is_correct = self._is_correct_answer(student_answer, correct_answer)
            
            if is_correct:
                strengths.extend(topics)
            else:
                weaknesses.extend(topics)
        
        return AssessmentAnalysis(
            strengths=list(set(strengths)),
            weaknesses=list(set(weaknesses)),
            detailed_feedback=[]
        )

    def _detect_topics(self, answer: str) -> List[str]:
        """
        Detect topics based on keywords in the answer
        """
        topics = []
        for keyword, topic in self.topic_map.items():
            if keyword.lower() in answer.lower():
                topics.append(topic)
        return topics

    def _is_correct_answer(self, student_answer: str, correct_answer: str) -> bool:
        """
        Determine if an answer is correct
        """
        # Simple comparison - in production this would be more sophisticated
        return student_answer.strip().lower() == correct_answer.strip().lower()

    async def generate_recommendations(self, analysis: AssessmentAnalysis) -> List[Dict[str, Any]]:
        """
        Generate personalized learning recommendations based on assessment analysis using Google AI SDK
        """
        try:
            if not analysis.weaknesses:
                return []
            
            # Prepare progress data for AI
            progress_data = {
                'strengths': analysis.strengths,
                'weaknesses': analysis.weaknesses,
                'assessment_type': 'quiz_analysis'
            }
            
            # Use AI to generate recommendations
            recommendations = await self.ai_client.generate_personalized_recommendations(progress_data)
            
            self.logger.info(f"Generated {len(recommendations)} AI-powered recommendations")
            return recommendations
            
        except Exception as e:
            self.logger.error(f"Error generating AI recommendations: {str(e)}. Using fallback.")
            # Fallback to simple recommendations
            return self._generate_fallback_recommendations(analysis)

    def _generate_fallback_recommendations(self, analysis: AssessmentAnalysis) -> List[Dict[str, Any]]:
        """Generate fallback recommendations when AI is unavailable"""
        recommendations = []
        
        for i, topic in enumerate(analysis.weaknesses[:5]):  # Limit to 5 recommendations
            recommendations.append({
                "type": "topic_focus",
                "title": f"Focus on {topic.title()}",
                "description": f"Based on your assessment, you should spend more time practicing {topic}. This will help strengthen your understanding.",
                "priority": "high",
                "estimated_time": "2-3 hours",
                "resources": self._get_topic_resources(topic),
                "generated_at": __import__('datetime').datetime.utcnow().isoformat()
            })
        
        return recommendations

    def _get_topic_resources(self, topic: str) -> List[str]:
        """
        Get learning resources for a specific topic
        """
        return [
            f"Khan Academy - {topic}",
            f"Practice exercises - {topic}",
            f"Video tutorials - {topic}",
            f"Interactive simulations - {topic}"
        ]
