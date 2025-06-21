import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Quiz, QuizAttempt } from '../types';

export const getQuiz = async (quizId: string): Promise<Quiz | null> => {
  try {
    const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
    if (quizDoc.exists()) {
      return { id: quizDoc.id, ...quizDoc.data() } as Quiz;
    }
    return null;
  } catch (error) {
    console.error('Error fetching quiz:', error);
    throw error;
  }
};

export const submitQuizAttempt = async (attempt: Omit<QuizAttempt, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'quizAttempts'), {
      ...attempt,
      completedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error submitting quiz attempt:', error);
    throw error;
  }
};

export const getUserQuizAttempts = async (userId: string, quizId: string): Promise<QuizAttempt[]> => {
  try {
    const q = query(
      collection(db, 'quizAttempts'),
      where('userId', '==', userId),
      where('quizId', '==', quizId),
      orderBy('completedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const attempts: QuizAttempt[] = [];
    
    querySnapshot.forEach((doc) => {
      attempts.push({ id: doc.id, ...doc.data() } as QuizAttempt);
    });
    
    return attempts;
  } catch (error) {
    console.error('Error fetching quiz attempts:', error);
    throw error;
  }
};

export const calculateQuizScore = (quiz: Quiz, answers: { [questionId: string]: string | number }): number => {
  let totalPoints = 0;
  let earnedPoints = 0;
  
  quiz.questions.forEach(question => {
    totalPoints += question.points;
    const userAnswer = answers[question.id];
    
    if (userAnswer !== undefined && userAnswer === question.correctAnswer) {
      earnedPoints += question.points;
    }
  });
  
  return totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
};