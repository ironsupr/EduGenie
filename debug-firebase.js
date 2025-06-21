import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBNTSV9rG2CDziPjWkJd0Mz-kPHmpFwQzE",
  authDomain: "edugenie-h-ba04c.firebaseapp.com",
  projectId: "edugenie-h-ba04c",
  storageBucket: "edugenie-h-ba04c.firebasestorage.app",
  messagingSenderId: "822500132023",
  appId: "1:822500132023:web:586949d5d7248ae6573932"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testFirebase() {
  try {
    console.log('Testing Firebase connection...');
    
    // Try to get all courses
    const coursesRef = collection(db, 'courses');
    const snapshot = await getDocs(coursesRef);
    
    console.log(`Found ${snapshot.size} courses in database`);
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log('Course:', {
        id: doc.id,
        title: data.title,
        isPublished: data.isPublished,
        createdAt: data.createdAt,
        instructor: data.instructor
      });
    });
    
    // Try to add a test course
    const testCourse = {
      title: 'Debug Test Course',
      description: 'A test course created via debug script',
      instructor: 'Debug User',
      instructorId: 'debug-user',
      category: 'Programming',
      level: 'Beginner',
      price: 0,
      duration: '1 hour',
      rating: 0,
      studentsCount: 0,
      imageUrl: 'https://via.placeholder.com/400x300',
      modules: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublished: true
    };
    
    console.log('Creating test course...');
    const docRef = await addDoc(coursesRef, testCourse);
    console.log('Test course created with ID:', docRef.id);
    
  } catch (error) {
    console.error('Firebase test failed:', error);
  }
}

testFirebase();
