import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
// Note: Firebase Storage commented out - requires billing
// import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // For development - you can use Firebase emulators or a test project
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "demo-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
// Firebase Storage disabled - using localStorage + Firestore for file storage
// export const storage = getStorage(app);
export const storage = null; // Placeholder for compatibility

// File storage method indicator
export const STORAGE_METHOD = 'localStorage';

// Optional: Connect to Firebase Emulators for development
// Uncomment these lines if you want to use local emulators
// if (import.meta.env.MODE === 'development') {
//   connectFirestoreEmulator(db, 'localhost', 8080);
//   connectAuthEmulator(auth, 'http://localhost:9099');
//   connectStorageEmulator(storage, 'localhost', 9199);
// }

export default app;