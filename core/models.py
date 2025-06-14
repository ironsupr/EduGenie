"""
Core data models for the EduGenie platform
"""

from pydantic import BaseModel, Field, EmailStr, constr
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from enum import Enum

class LearningStyle(str, Enum):
    VISUAL = "visual"
    AUDITORY = "auditory"
    KINESTHETIC = "kinesthetic"
    READING = "reading"

class DifficultyLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"

class StudentBase(BaseModel):
    student_id: str = Field(..., min_length=1, description="Unique identifier for the student")
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    learning_style: Optional[LearningStyle] = Field(default=LearningStyle.VISUAL)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    meta_data: Optional[Dict[str, Any]] = None

class AssessmentAnalysis(BaseModel):
    strengths: List[str] = Field(..., min_items=0, description="Topics the student excels at")
    weaknesses: List[str] = Field(..., min_items=0, description="Topics needing improvement")
    recommendations: Optional[List[str]] = Field(default_factory=list)
    meta_data: Optional[Dict[str, Any]] = None

class LearningPath(BaseModel):
    student_id: str = Field(..., min_length=1)
    path_id: str = Field(..., min_length=1)
    topics: List[str] = Field(..., min_items=1)
    difficulty: DifficultyLevel = Field(default=DifficultyLevel.BEGINNER)
    planned_days: int = Field(..., gt=0, le=365)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    meta_data: Optional[Dict[str, Any]] = None

class ProgressEntry(BaseModel):
    student_id: str = Field(..., min_length=1)
    topic: str = Field(..., min_length=1)
    score: float = Field(..., ge=0.0, le=100.0)
    completed: bool
    difficulty: DifficultyLevel = Field(default=DifficultyLevel.BEGINNER)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    time_spent: Optional[int] = Field(None, description="Time spent in minutes")
    meta_data: Optional[Dict[str, Any]] = None

class QuizSubmission(BaseModel):
    student_id: str = Field(..., min_length=1)
    quiz_id: str = Field(..., min_length=1)
    answers: Dict[str, Union[str, Dict[str, Any]]] = Field(...)
    difficulty: DifficultyLevel = Field(default=DifficultyLevel.BEGINNER)
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    time_taken: Optional[int] = Field(None, description="Time taken in seconds")
    meta_data: Optional[Dict[str, Any]] = None

class LessonContent(BaseModel):
    topic: str = Field(..., min_length=1)
    difficulty: DifficultyLevel
    content: Dict[str, Any]
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    meta_data: Optional[Dict[str, Any]] = None
