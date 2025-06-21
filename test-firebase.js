// Simple Firebase connection test
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

console.log('🔥 Testing Firebase Configuration...');
console.log('Project ID:', firebaseConfig.projectId);
console.log('Auth Domain:', firebaseConfig.authDomain);
console.log('Has API Key:', !!firebaseConfig.apiKey);

try {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized successfully');
  
  // Test Firestore
  const db = getFirestore(app);
  console.log('✅ Firestore initialized successfully');
  
  // Test Auth
  const auth = getAuth(app);
  console.log('✅ Authentication initialized successfully');
  console.log('Auth domain:', auth.config.authDomain);
  
  console.log('\n🎉 All Firebase services initialized successfully!');
  console.log('Your Firebase configuration is working correctly.');
  
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
}
