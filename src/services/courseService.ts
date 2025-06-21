import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Course } from '../types';

export const getCourses = async (
  category?: string,
  level?: string,
  searchTerm?: string,
  limitCount: number = 10,
  lastDoc?: DocumentSnapshot
) => {
  try {
    console.log('=== getCourses called ===');
    console.log('Firebase db object:', db);
    console.log('Parameters:', { category, level, searchTerm, limitCount });
    
    let q = query(
      collection(db, 'courses'),
      where('isPublished', '==', true),
      orderBy('createdAt', 'desc')
    );

    console.log('Building query for published courses');

    if (category && category !== 'All') {
      q = query(q, where('category', '==', category));
      console.log('Added category filter:', category);
    }

    if (level && level !== 'All') {
      q = query(q, where('level', '==', level));
      console.log('Added level filter:', level);
    }

    if (limitCount) {
      q = query(q, limit(limitCount));
    }

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    console.log('Executing Firestore query...');
    const querySnapshot = await getDocs(q);
    console.log('Query returned', querySnapshot.size, 'documents');
    
    const courses: Course[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Ensure proper data conversion
      const courseData: Course = {
        id: doc.id,
        title: data.title || '',
        description: data.description || '',
        instructor: data.instructor || '',
        instructorId: data.instructorId || '',
        category: data.category || 'Other',
        level: data.level || 'Beginner',
        price: data.price || 0,
        duration: data.duration || '0m',
        rating: data.rating || 0,
        studentsCount: data.studentsCount || 0,
        imageUrl: data.imageUrl || 'https://via.placeholder.com/400x300',
        modules: data.modules || [],
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
        isPublished: data.isPublished === true
      };
      
      console.log('Found course:', courseData.title, 'Published:', courseData.isPublished, 'Category:', courseData.category);
      courses.push(courseData);
    });

    // Filter by search term on client side (for simplicity)
    if (searchTerm) {
      const filtered = courses.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log('After search filter:', filtered.length, 'courses');
      return filtered;
    }

    console.log('Returning', courses.length, 'courses');
    console.log('=== getCourses completed ===');
    return courses;
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

export const getCourse = async (courseId: string): Promise<Course | null> => {
  try {
    const courseDoc = await getDoc(doc(db, 'courses', courseId));
    if (courseDoc.exists()) {
      return { id: courseDoc.id, ...courseDoc.data() } as Course;
    }
    return null;
  } catch (error) {
    console.error('Error fetching course:', error);
    throw error;
  }
};

export const enrollInCourse = async (userId: string, courseId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const enrolledCourses = userData.enrolledCourses || [];
      
      if (!enrolledCourses.includes(courseId)) {
        await updateDoc(userRef, {
          enrolledCourses: [...enrolledCourses, courseId],
          updatedAt: new Date()
        });
      }
    }
  } catch (error) {
    console.error('Error enrolling in course:', error);
    throw error;
  }
};

export const updateProgress = async (
  userId: string, 
  courseId: string, 
  moduleId: string, 
  lessonId: string
) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const progress = userData.progress || {};
      const courseProgress = progress[courseId] || {};
      
      // Mark lesson as completed
      if (!courseProgress[moduleId]) {
        courseProgress[moduleId] = {};
      }
      courseProgress[moduleId][lessonId] = true;
      
      await updateDoc(userRef, {
        [`progress.${courseId}`]: courseProgress,
        updatedAt: new Date()
      });
    }
  } catch (error) {
    console.error('Error updating progress:', error);
    throw error;
  }
};

export const createCourse = async (courseData: Omit<Course, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'courses'), {
      ...courseData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

export const updateCourse = async (courseId: string, updateData: Partial<Course>) => {
  try {
    const courseRef = doc(db, 'courses', courseId);
    await updateDoc(courseRef, {
      ...updateData,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
};

export const deleteCourse = async (courseId: string) => {
  try {
    await deleteDoc(doc(db, 'courses', courseId));
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};

export const getEnrolledCourses = async (userId: string): Promise<Course[]> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const enrolledCourseIds = userData.enrolledCourses || [];
      
      const courses: Course[] = [];
      for (const courseId of enrolledCourseIds) {
        const course = await getCourse(courseId);
        if (course) {
          courses.push(course);
        }
      }
      
      return courses;
    }
    return [];
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    throw error;
  }
};

// Debug function to get all courses regardless of publish status
export const getAllCoursesDebug = async () => {
  try {
    console.log('Getting ALL courses for debugging...');
    const q = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    console.log('Total courses in database:', querySnapshot.size);
    
    const courses: Course[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Ensure proper data conversion
      const courseData: Course = {
        id: doc.id,
        title: data.title || '',
        description: data.description || '',
        instructor: data.instructor || '',
        instructorId: data.instructorId || '',
        category: data.category || 'Other',
        level: data.level || 'Beginner',
        price: data.price || 0,
        duration: data.duration || '0m',
        rating: data.rating || 0,
        studentsCount: data.studentsCount || 0,
        imageUrl: data.imageUrl || 'https://via.placeholder.com/400x300',
        modules: data.modules || [],
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
        isPublished: data.isPublished === true
      };
      
      console.log('Course:', courseData.title, 'Published:', courseData.isPublished, 'Created:', courseData.createdAt);
      courses.push(courseData);
    });
    
    return courses;
  } catch (error) {
    console.error('Error in getAllCoursesDebug:', error);
    throw error;
  }
};

// Debug function to create a test course
export const createTestCourse = async (): Promise<string> => {
  try {
    const testCourse = {
      title: 'Test Course from Debug',
      description: 'This is a test course created for debugging purposes',
      instructor: 'Test Instructor',
      instructorId: 'test-instructor-123',
      category: 'Programming',
      level: 'Beginner' as const,
      price: 0,
      duration: '2 hours',
      rating: 0,
      studentsCount: 0,
      imageUrl: 'https://via.placeholder.com/300x200',
      modules: [
        {
          id: 'module-1',
          title: 'Introduction',
          description: 'Introduction module',
          duration: '30 minutes',
          order: 0,
          lessons: [
            {
              id: 'lesson-1',
              title: 'Getting Started',
              description: 'First lesson',
              duration: '15 minutes',
              order: 0,
              content: 'Welcome to the course!',
              resources: []
            }
          ]
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublished: true
    };
    
    console.log('Creating test course:', testCourse);
    const courseId = await createCourse(testCourse);
    console.log('Test course created with ID:', courseId);
    return courseId;
  } catch (error) {
    console.error('Error creating test course:', error);
    throw error;
  }
};