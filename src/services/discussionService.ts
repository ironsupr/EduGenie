import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc,
  arrayUnion,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Discussion, Reply } from '../types';

export const getDiscussions = async (
  courseId: string,
  moduleId?: string,
  lessonId?: string
): Promise<Discussion[]> => {
  try {
    let q = query(
      collection(db, 'discussions'),
      where('courseId', '==', courseId),
      orderBy('createdAt', 'desc')
    );

    if (moduleId) {
      q = query(q, where('moduleId', '==', moduleId));
    }

    if (lessonId) {
      q = query(q, where('lessonId', '==', lessonId));
    }

    const querySnapshot = await getDocs(q);
    const discussions: Discussion[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      discussions.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as Discussion);
    });
    
    return discussions;
  } catch (error) {
    console.error('Error fetching discussions:', error);
    throw error;
  }
};

export const createDiscussion = async (discussion: Omit<Discussion, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'discussions'), {
      ...discussion,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating discussion:', error);
    throw error;
  }
};

export const addReply = async (discussionId: string, reply: Omit<Reply, 'id' | 'createdAt'>) => {
  try {
    const discussionRef = doc(db, 'discussions', discussionId);
    const newReply: Reply = {
      ...reply,
      id: Date.now().toString(), // Simple ID generation
      createdAt: new Date()
    };
    
    await updateDoc(discussionRef, {
      replies: arrayUnion(newReply),
      updatedAt: Timestamp.now()
    });
    
    return newReply.id;
  } catch (error) {
    console.error('Error adding reply:', error);
    throw error;
  }
};

export const likeDiscussion = async (discussionId: string, userId: string) => {
  try {
    const discussionRef = doc(db, 'discussions', discussionId);
    const discussionDoc = await getDoc(discussionRef);
    
    if (discussionDoc.exists()) {
      const data = discussionDoc.data();
      const currentLikes = data.likes || 0;
      
      await updateDoc(discussionRef, {
        likes: currentLikes + 1,
        updatedAt: Timestamp.now()
      });
    }
  } catch (error) {
    console.error('Error liking discussion:', error);
    throw error;
  }
};