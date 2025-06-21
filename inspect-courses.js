import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function inspectCourses() {
  try {
    console.log('Inspecting all courses in database...');
    
    const coursesRef = collection(db, 'courses');
    const snapshot = await getDocs(coursesRef);
    
    console.log(`Found ${snapshot.size} courses in database`);
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log('\n--- Course ---');
      console.log('ID:', doc.id);
      console.log('Title:', data.title);
      console.log('Category:', data.category);
      console.log('Level:', data.level);
      console.log('Published:', data.isPublished);
      console.log('Instructor:', data.instructor);
      console.log('Price:', data.price);
      console.log('Duration:', data.duration);
      console.log('Created:', data.createdAt);
      console.log('Full data keys:', Object.keys(data));
    });
    
  } catch (error) {
    console.error('Inspection failed:', error);
  }
}

inspectCourses();
