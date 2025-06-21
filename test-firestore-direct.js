// Direct Firestore connection test for EduGenie
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, collection, addDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

// Load environment variables (Node.js style)
import { config } from 'dotenv';
config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

console.log('🔥 Testing Firestore Direct Connection...');
console.log('Project ID:', firebaseConfig.projectId);

async function testFirestore() {
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);
    
    console.log('✅ Firebase initialized successfully');
    
    // Test 1: Read a non-existent document (should work without errors)
    console.log('\n📖 Test 1: Reading non-existent document...');
    const testDoc = doc(db, 'test', 'connection');
    const docSnap = await getDoc(testDoc);
    
    if (docSnap.exists()) {
      console.log('✅ Document exists:', docSnap.data());
    } else {
      console.log('✅ Firestore accessible (document doesn\'t exist, which is normal)');
    }
    
    // Test 2: Sign in anonymously first (required for write operations in test mode)
    console.log('\n🔐 Test 2: Anonymous authentication...');
    await signInAnonymously(auth);
    console.log('✅ Anonymous sign-in successful');
    
    // Test 3: Write a test document
    console.log('\n✍️ Test 3: Writing test document...');
    const testData = {
      message: 'Firestore connection test',
      timestamp: new Date(),
      tester: 'comprehensive_checker'
    };
    
    await setDoc(doc(db, 'test', 'connection'), testData);
    console.log('✅ Write operation successful');
    
    // Test 4: Read the document back
    console.log('\n📖 Test 4: Reading written document...');
    const newDocSnap = await getDoc(testDoc);
    if (newDocSnap.exists()) {
      console.log('✅ Read operation successful:', newDocSnap.data());
    }
    
    // Test 5: Add a document to a collection
    console.log('\n📝 Test 5: Adding document to collection...');
    const collectionRef = collection(db, 'tests');
    const docRef = await addDoc(collectionRef, {
      test: 'collection test',
      timestamp: new Date()
    });
    console.log('✅ Collection write successful, Document ID:', docRef.id);
    
    console.log('\n🎉 ALL FIRESTORE TESTS PASSED!');
    console.log('Your Firestore database is working correctly.');
    
  } catch (error) {
    console.error('❌ Firestore test failed:', error);
    
    if (error.code === 'permission-denied') {
      console.log('\n🔧 Permission Issue:');
      console.log('- Firestore security rules might be too restrictive');
      console.log('- Try enabling test mode rules in Firebase Console');
    } else if (error.code === 'unavailable') {
      console.log('\n🔧 Service Unavailable:');
      console.log('- Firestore might still be initializing');
      console.log('- Wait a few minutes and try again');
    } else if (error.message.includes('project does not exist')) {
      console.log('\n🔧 Project Issue:');
      console.log('- Check if Firestore is enabled in Firebase Console');
      console.log('- Verify project ID is correct');
    }
  }
}

testFirestore();
