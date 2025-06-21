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
  limit as firestoreLimit,
  startAfter,
  DocumentSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Course } from '../types';

// Helper function to convert Firestore data to Course object
const convertFirestoreDataToCourse = (doc: any): Course => {
  const data = doc.data();
  
  return {
    id: doc.id,
    title: data.title || '',
    description: data.description || '',
    instructor: data.instructor || '',
    instructorId: data.instructorId || '',
    category: data.category || 'Other',
    level: data.level || 'Beginner',
    price: typeof data.price === 'number' ? data.price : 0,
    duration: data.duration || '0m',
    rating: typeof data.rating === 'number' ? data.rating : 0,
    studentsCount: typeof data.studentsCount === 'number' ? data.studentsCount : 0,
    imageUrl: data.imageUrl || 'https://via.placeholder.com/400x300?text=Course+Image',
    modules: Array.isArray(data.modules) ? data.modules : [],
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : 
               data.createdAt instanceof Date ? data.createdAt : new Date(),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : 
               data.updatedAt instanceof Date ? data.updatedAt : new Date(),
    isPublished: Boolean(data.isPublished)
  };
};

export const getCoursesNew = async (
  category?: string,
  level?: string,
  searchTerm?: string,
  limit: number = 50
): Promise<Course[]> => {
  try {
    console.log('🔍 Getting courses with params:', { category, level, searchTerm, limit });
    
    // Build query
    let q = query(
      collection(db, 'courses'),
      where('isPublished', '==', true),
      orderBy('createdAt', 'desc')
    );

    // Add category filter if specified
    if (category && category !== 'All') {
      q = query(q, where('category', '==', category));
    }

    // Add level filter if specified
    if (level && level !== 'All') {
      q = query(q, where('level', '==', level));
    }

    // Add limit
    if (limit > 0) {
      q = query(q, firestoreLimit(limit));
    }

    console.log('🔥 Executing Firestore query...');
    const querySnapshot = await getDocs(q);
    console.log(`📚 Found ${querySnapshot.size} courses`);
    
    const courses: Course[] = [];
    
    querySnapshot.forEach((doc) => {
      try {
        const course = convertFirestoreDataToCourse(doc);
        console.log(`✅ Processed course: ${course.title} (${course.category})`);
        courses.push(course);
      } catch (error) {
        console.error(`❌ Error processing course ${doc.id}:`, error);
      }
    });

    // Apply client-side search filter
    let filteredCourses = courses;
    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filteredCourses = courses.filter(course => 
        course.title.toLowerCase().includes(searchLower) ||
        course.instructor.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower) ||
        course.category.toLowerCase().includes(searchLower)
      );
      console.log(`🔍 After search filter: ${filteredCourses.length} courses`);
    }

    console.log(`🎯 Returning ${filteredCourses.length} courses`);
    return filteredCourses;
    
  } catch (error) {
    console.error('❌ Error fetching courses:', error);
    throw new Error(`Failed to fetch courses: ${error}`);
  }
};

export const getCourseById = async (courseId: string): Promise<Course | null> => {
  try {
    const docRef = doc(db, 'courses', courseId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return convertFirestoreDataToCourse(docSnap);
    } else {
      console.log('No course found with ID:', courseId);
      return null;
    }
  } catch (error) {
    console.error('Error fetching course:', error);
    throw error;
  }
};

export const createCourseNew = async (courseData: Omit<Course, 'id'>): Promise<string> => {
  try {
    console.log('🆕 Creating new course:', courseData.title);
    
    // Ensure all required fields have valid values
    const cleanCourseData = {
      ...courseData,
      title: courseData.title || 'Untitled Course',
      description: courseData.description || '',
      instructor: courseData.instructor || 'Unknown',
      instructorId: courseData.instructorId || '',
      category: courseData.category || 'Other',
      level: courseData.level || 'Beginner',
      price: typeof courseData.price === 'number' ? courseData.price : 0,
      duration: courseData.duration || '0m',
      rating: typeof courseData.rating === 'number' ? courseData.rating : 0,
      studentsCount: typeof courseData.studentsCount === 'number' ? courseData.studentsCount : 0,
      imageUrl: courseData.imageUrl || 'https://via.placeholder.com/400x300?text=Course+Image',
      modules: Array.isArray(courseData.modules) ? courseData.modules : [],
      createdAt: courseData.createdAt || new Date(),
      updatedAt: courseData.updatedAt || new Date(),
      isPublished: Boolean(courseData.isPublished)
    };
    
    const docRef = await addDoc(collection(db, 'courses'), cleanCourseData);
    console.log('✅ Course created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating course:', error);
    throw error;
  }
};

export const createTestCourseNew = async (): Promise<string> => {
  try {
    console.log('🧪 Creating test course...');
    
    const testCourse: Omit<Course, 'id'> = {
      title: `Test Course - ${new Date().toLocaleTimeString()}`,
      description: 'This is a test course created to verify the system is working properly. It contains sample content and should appear in the courses list immediately.',
      instructor: 'Test Instructor',
      instructorId: 'test-instructor-' + Date.now(),
      category: 'Programming',
      level: 'Beginner',
      price: 0,
      duration: '2 hours',
      rating: 4.5,
      studentsCount: 42,
      imageUrl: 'https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Test+Course',
      modules: [
        {
          id: 'test-module-1',
          title: 'Introduction to Testing',
          description: 'Learn the basics of testing',
          duration: '30 minutes',
          order: 0,
          lessons: [
            {
              id: 'test-lesson-1',
              title: 'What is Testing?',
              description: 'Understanding testing fundamentals',
              duration: '15 minutes',
              order: 0,
              content: 'This is test content for the lesson.',
              resources: []
            }
          ]
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublished: true
    };
    
    const courseId = await createCourseNew(testCourse);
    console.log('✅ Test course created successfully with ID:', courseId);
    return courseId;
  } catch (error) {
    console.error('❌ Error creating test course:', error);
    throw error;
  }
};

// Debug function to get all courses (including unpublished)
export const getAllCoursesDebugNew = async (): Promise<Course[]> => {
  try {
    console.log('🔍 Debug: Getting ALL courses (including unpublished)...');
    
    const q = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    console.log(`📊 Debug: Found ${querySnapshot.size} total courses in database`);
    
    const courses: Course[] = [];
    querySnapshot.forEach((doc) => {
      try {
        const course = convertFirestoreDataToCourse(doc);
        console.log(`📋 Debug: ${course.title} | Published: ${course.isPublished} | Category: ${course.category}`);
        courses.push(course);
      } catch (error) {
        console.error(`❌ Debug: Error processing course ${doc.id}:`, error);
      }
    });
    
    console.log(`📈 Debug: Processed ${courses.length} courses successfully`);
    return courses;
  } catch (error) {
    console.error('❌ Debug: Error fetching all courses:', error);
    throw error;
  }
};

// For backward compatibility
export const getCourses = getCoursesNew;
export const createCourse = createCourseNew;
export const createTestCourse = createTestCourseNew;
export const getAllCoursesDebug = getAllCoursesDebugNew;
