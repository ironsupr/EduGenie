"""
Recommender Agent Logic - Provides personalized learning recommendations using Google AI SDK
"""
from typing import Dict, List, Any, Optional
from datetime import datetime
from utils.logger import setup_logger
from core.ai_client import get_ai_client

logger = setup_logger(__name__)

class RecommendationEngine:
    def __init__(self):
        self.logger = setup_logger(__name__)
        self.ai_client = get_ai_client()
        self.score_thresholds = {
            'needs_review': 0.7,
            'proficient': 0.8,
            'mastery': 0.9
        }

    async def suggest_topics(self, progress_logs: List[Dict[str, Any]], student_profile: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Recommend review or enrichment topics based on past performance using Google AI SDK
        """
        try:
            self.logger.info(f"Generating recommendations from {len(progress_logs)} progress logs")
            
            # Prepare comprehensive progress data for AI analysis
            progress_data = {
                'progress_logs': progress_logs,
                'student_profile': student_profile or {},
                'analysis_date': datetime.utcnow().isoformat(),
                'total_sessions': len(progress_logs)
            }
            
            # Add aggregated statistics
            if progress_logs:
                scores = [log.get('score', 0) for log in progress_logs]
                progress_data['statistics'] = {
                    'average_score': sum(scores) / len(scores),
                    'highest_score': max(scores),
                    'lowest_score': min(scores),
                    'recent_trend': self._analyze_trend(progress_logs[-5:])  # Last 5 sessions
                }
            
            # Use AI to generate sophisticated recommendations
            recommendations = await self.ai_client.generate_personalized_recommendations(progress_data)
            
            # Process and categorize AI recommendations
            categorized_recommendations = self._categorize_recommendations(recommendations, progress_logs)
            
            self.logger.info(f"Generated {len(recommendations)} AI-powered recommendations")
            return categorized_recommendations
            
        except Exception as e:
            self.logger.error(f"Error generating AI recommendations: {str(e)}. Using fallback.")
            # Fallback to rule-based recommendations
            return self._generate_fallback_recommendations(progress_logs)

    def _categorize_recommendations(self, ai_recommendations: List[Dict], progress_logs: List[Dict]) -> Dict[str, Any]:
        """Categorize AI recommendations into review, practice, and enrichment"""
        review_topics = []
        practice_topics = []
        enrichment_topics = []
        study_strategies = []
        
        for rec in ai_recommendations:
            rec_type = rec.get('type', 'topic_focus')
            
            if rec_type == 'topic_focus' and rec.get('priority') == 'high':
                review_topics.append({
                    'topic': rec.get('title', ''),
                    'description': rec.get('description', ''),
                    'estimated_time': rec.get('estimated_time', '1-2 hours'),
                    'resources': rec.get('resources', [])
                })
            elif rec_type == 'skill_practice':
                practice_topics.append({
                    'skill': rec.get('title', ''),
                    'description': rec.get('description', ''),
                    'difficulty': rec.get('priority', 'medium'),
                    'resources': rec.get('resources', [])
                })
            elif rec_type in ['study_strategy', 'time_management']:
                study_strategies.append({
                    'strategy': rec.get('title', ''),
                    'description': rec.get('description', ''),
                    'implementation': rec.get('resources', [])
                })
            elif rec.get('priority') == 'low':
                enrichment_topics.append({
                    'topic': rec.get('title', ''),
                    'description': rec.get('description', ''),
                    'challenge_level': 'advanced',
                    'resources': rec.get('resources', [])
                })
        
        return {
            'review_topics': review_topics,
            'practice_topics': practice_topics,
            'enrichment_topics': enrichment_topics,
            'study_strategies': study_strategies,
            'generated_at': datetime.utcnow().isoformat(),
            'source': 'ai_powered'
        }

    def _generate_fallback_recommendations(self, progress_logs: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate fallback recommendations using rule-based logic"""
        review_topics = []
        enrichment_topics = []
        practice_topics = []
        
        # Analyze progress logs with simple rules
        topic_scores = {}
        for entry in progress_logs:
            topic = entry.get("topic", "unknown")
            score = entry.get("score", 0)
            
            if topic not in topic_scores:
                topic_scores[topic] = []
            topic_scores[topic].append(score)
        
        # Calculate average scores and categorize
        for topic, scores in topic_scores.items():
            avg_score = sum(scores) / len(scores)
            
            if avg_score < self.score_thresholds['needs_review']:
                review_topics.append({
                    'topic': topic,
                    'description': f"Average score: {avg_score:.1%}. Needs focused review.",
                    'estimated_time': '2-3 hours',
                    'resources': [f"Khan Academy - {topic}", f"Practice exercises - {topic}"]
                })
            elif avg_score < self.score_thresholds['proficient']:
                practice_topics.append({
                    'skill': topic,
                    'description': f"Average score: {avg_score:.1%}. Continue practicing to reach proficiency.",
                    'difficulty': 'medium',
                    'resources': [f"Practice problems - {topic}", f"Quiz yourself - {topic}"]
                })
            elif avg_score >= self.score_thresholds['mastery']:
                enrichment_topics.append({
                    'topic': topic,
                    'description': f"Average score: {avg_score:.1%}. Ready for advanced challenges!",
                    'challenge_level': 'advanced',
                    'resources': [f"Advanced problems - {topic}", f"Real-world applications - {topic}"]
                })
        
        return {
            'review_topics': review_topics,
            'practice_topics': practice_topics,
            'enrichment_topics': enrichment_topics,
            'study_strategies': [
                {
                    'strategy': 'Spaced Repetition',
                    'description': 'Review topics at increasing intervals to improve retention.',
                    'implementation': ['Use flashcards', 'Schedule regular review sessions']
                }
            ],
            'generated_at': datetime.utcnow().isoformat(),
            'source': 'rule_based_fallback'
        }

    def _analyze_trend(self, recent_logs: List[Dict[str, Any]]) -> str:
        """Analyze recent performance trend"""
        if len(recent_logs) < 2:
            return 'insufficient_data'
        
        scores = [log.get('score', 0) for log in recent_logs]
        
        # Simple trend analysis
        if scores[-1] > scores[0]:
            return 'improving'
        elif scores[-1] < scores[0]:
            return 'declining'
        else:
            return 'stable'

# Legacy function for backward compatibility
def suggest_topics(progress_logs: List[Dict[str, Any]], student_profile: Optional[Dict] = None) -> Dict[str, Any]:
    """
    Legacy function wrapper for backward compatibility
    """
    engine = RecommendationEngine()
    # Note: This is a sync wrapper for an async function - in production, consider using asyncio.run()
    try:
        import asyncio
        return asyncio.run(engine.suggest_topics(progress_logs, student_profile))
    except Exception:
        # Fallback for environments where asyncio is not available
        return engine._generate_fallback_recommendations(progress_logs)
