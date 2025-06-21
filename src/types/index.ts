export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  enrolledCourses: string[];
  progress: { [courseId: string]: number };
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorId: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  price: number;
  duration: string;
  rating: number;
  studentsCount: number;
  imageUrl: string;
  modules: Module[];
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
  order: number;
  lessons: Lesson[];
  quiz?: Quiz;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  order: number;
  videoUrl?: string;
  content: string;
  resources: Resource[];
  completed?: boolean;
}

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'link' | 'document';
  url: string;
  size?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  timeLimit: number; // in minutes
  passingScore: number;
  attempts: number;
}

export interface Question {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  hint?: string;
  points: number;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  answers: { [questionId: string]: string | number };
  score: number;
  completedAt: Date;
  timeSpent: number; // in seconds
}

export interface Discussion {
  id: string;
  courseId: string;
  moduleId?: string;
  lessonId?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  title: string;
  content: string;
  replies: Reply[];
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reply {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  likes: number;
  createdAt: Date;
}

export interface StudyPlan {
  id: string;
  userId: string;
  syllabusFileName: string;
  subjects: Subject[];
  totalWeeks: number;
  hoursPerWeek: number;
  startDate: Date;
  examDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subject {
  id: string;
  name: string;
  weightage: string;
  difficulty: 'Low' | 'Medium' | 'High';
  topics: Topic[];
  estimatedHours: number;
}

export interface Topic {
  id: string;
  name: string;
  completed: boolean;
  resources: Resource[];
}