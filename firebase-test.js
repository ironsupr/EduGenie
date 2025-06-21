// Test Firebase connection
import { auth, db } from './src/config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

console.log('Testing Firebase connection...');
console.log('Auth:', auth);
console.log('Database:', db);
console.log('Project ID:', auth.app.options.projectId);

// Test auth state listener
onAuthStateChanged(auth, (user) => {
  console.log('Auth state changed:', user ? 'User logged in' : 'No user');
});

console.log('Firebase test complete');
