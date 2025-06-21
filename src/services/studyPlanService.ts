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
// Firebase Storage is disabled - using localStorage instead
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../config/firebase';
import { StudyPlan, Subject } from '../types';
import { storeFileInLocalStorage } from './storageService';

export const uploadSyllabus = async (file: File, userId: string): Promise<string> => {
  try {
    // Use localStorage instead of Firebase Storage
    const fileName = `syllabus_${userId}_${Date.now()}_${file.name}`;
    const fileKey = await storeFileInLocalStorage(file, fileName);
    
    return fileKey; // Return the localStorage key instead of URL
  } catch (error) {
    console.error('Error uploading syllabus:', error);
    throw error;
  }
};

export const createStudyPlan = async (studyPlan: Omit<StudyPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'studyPlans'), {
      ...studyPlan,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating study plan:', error);
    throw error;
  }
};

export const getUserStudyPlans = async (userId: string): Promise<StudyPlan[]> => {
  try {
    const q = query(
      collection(db, 'studyPlans'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const studyPlans: StudyPlan[] = [];
    
    querySnapshot.forEach((doc) => {
      studyPlans.push({ id: doc.id, ...doc.data() } as StudyPlan);
    });
    
    return studyPlans;
  } catch (error) {
    console.error('Error fetching study plans:', error);
    throw error;
  }
};

export const updateTopicProgress = async (
  studyPlanId: string, 
  subjectId: string, 
  topicId: string, 
  completed: boolean
) => {
  try {
    const studyPlanRef = doc(db, 'studyPlans', studyPlanId);
    const studyPlanDoc = await getDoc(studyPlanRef);
    
    if (studyPlanDoc.exists()) {
      const data = studyPlanDoc.data() as StudyPlan;
      const subjects = data.subjects.map(subject => {
        if (subject.id === subjectId) {
          const topics = subject.topics.map(topic => {
            if (topic.id === topicId) {
              return { ...topic, completed };
            }
            return topic;
          });
          return { ...subject, topics };
        }
        return subject;
      });
      
      await updateDoc(studyPlanRef, {
        subjects,
        updatedAt: new Date()
      });
    }
  } catch (error) {
    console.error('Error updating topic progress:', error);
    throw error;
  }
};

// Mock AI analysis function - replace with actual AI service
export const analyzeSyllabus = async (_syllabusText: string): Promise<Subject[]> => {
  // This would typically call an AI service to analyze the syllabus
  // For now, returning mock data
  // TODO: Implement actual AI analysis using _syllabusText
  return [
    {
      id: '1',
      name: 'Data Structures & Algorithms',
      weightage: '25%',
      difficulty: 'High',
      estimatedHours: 40,
      topics: [
        { id: '1-1', name: 'Arrays and Strings', completed: false, resources: [] },
        { id: '1-2', name: 'Linked Lists', completed: false, resources: [] },
        { id: '1-3', name: 'Trees and Graphs', completed: false, resources: [] },
        { id: '1-4', name: 'Dynamic Programming', completed: false, resources: [] }
      ]
    },
    {
      id: '2',
      name: 'Database Management Systems',
      weightage: '20%',
      difficulty: 'Medium',
      estimatedHours: 30,
      topics: [
        { id: '2-1', name: 'SQL Fundamentals', completed: false, resources: [] },
        { id: '2-2', name: 'Normalization', completed: false, resources: [] },
        { id: '2-3', name: 'Transactions', completed: false, resources: [] }
      ]
    }
  ];
};