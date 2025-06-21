import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: ''
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkDuplicates() {
  try {
    const coursesRef = collection(db, 'courses');
    const snapshot = await getDocs(coursesRef);
    
    console.log('Total courses found:', snapshot.size);
    
    const courses = [];
    const titleMap = new Map();
    const duplicates = [];
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const course = { id: doc.id, ...data };
      courses.push(course);
      
      const title = data.title?.toLowerCase().trim();
      if (title) {
        if (titleMap.has(title)) {
          const existing = titleMap.get(title);
          duplicates.push({
            title: data.title,
            existing: { id: existing.id, createdAt: existing.createdAt },
            duplicate: { id: doc.id, createdAt: data.createdAt }
          });
        } else {
          titleMap.set(title, { id: doc.id, createdAt: data.createdAt });
        }
      }
    });
    
    console.log('\n=== COURSE ANALYSIS ===');
    console.log('Unique titles:', titleMap.size);
    console.log('Duplicate groups found:', duplicates.length);
    
    if (duplicates.length > 0) {
      console.log('\n=== DUPLICATES FOUND ===');
      duplicates.forEach((dup, index) => {
        console.log(`${index + 1}. "${dup.title}"`);
        console.log(`   Original: ${dup.existing.id} (created: ${dup.existing.createdAt || 'unknown'})`);
        console.log(`   Duplicate: ${dup.duplicate.id} (created: ${dup.duplicate.createdAt || 'unknown'})`);
        console.log('');
      });
    } else {
      console.log('\nNo duplicates found!');
    }
    
    console.log('\n=== ALL COURSES ===');
    courses.forEach((course, index) => {
      console.log(`${index + 1}. "${course.title || 'No title'}" (ID: ${course.id})`);
      console.log(`   Instructor: ${course.instructor || 'Unknown'}`);
      console.log(`   Created: ${course.createdAt || 'Unknown'}`);
      console.log(`   Source: ${course.sourceType || 'Unknown'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkDuplicates();
