import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

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

async function removeDuplicates() {
  try {
    console.log('🔍 Scanning for duplicate courses...\n');
    
    const coursesRef = collection(db, 'courses');
    const snapshot = await getDocs(coursesRef);
    
    console.log(`Total courses found: ${snapshot.size}`);
    
    const titleGroups = new Map();
    
    // Group courses by title
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const title = data.title?.toLowerCase().trim();
      
      if (title) {
        if (!titleGroups.has(title)) {
          titleGroups.set(title, []);
        }
        titleGroups.get(title).push({
          id: doc.id,
          data: data,
          createdAt: data.createdAt
        });
      }
    });
    
    const toDelete = [];
    
    // Find duplicates (groups with more than 1 course)
    titleGroups.forEach((courses, title) => {
      if (courses.length > 1) {
        console.log(`\n📚 Found ${courses.length} copies of: "${courses[0].data.title}"`);
        
        // Sort by creation date (oldest first)
        courses.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return aTime - bTime;
        });
        
        // Keep the first (oldest), mark others for deletion
        const toKeep = courses[0];
        const duplicates = courses.slice(1);
        
        console.log(`   ✅ Keeping: ${toKeep.id} (created: ${new Date(toKeep.createdAt?.seconds * 1000).toLocaleString()})`);
        
        duplicates.forEach(course => {
          console.log(`   ❌ Will delete: ${course.id} (created: ${new Date(course.createdAt?.seconds * 1000).toLocaleString()})`);
          toDelete.push(course.id);
        });
      }
    });
    
    if (toDelete.length === 0) {
      console.log('\n✨ No duplicates found! Your course library is clean.');
      return;
    }
    
    console.log(`\n🗑️  Ready to delete ${toDelete.length} duplicate courses.`);
    console.log('Proceeding with deletion...\n');
    
    let deleted = 0;
    for (const courseId of toDelete) {
      try {
        await deleteDoc(doc(db, 'courses', courseId));
        console.log(`✅ Deleted course: ${courseId}`);
        deleted++;
      } catch (error) {
        console.error(`❌ Failed to delete course ${courseId}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Cleanup complete!`);
    console.log(`   • Deleted: ${deleted} duplicate courses`);
    console.log(`   • Remaining: ${snapshot.size - deleted} unique courses`);
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

removeDuplicates();
