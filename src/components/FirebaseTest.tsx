import { useEffect, useState } from 'react';
import { auth, db, storage } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const FirebaseTest = () => {  const [status, setStatus] = useState({
    auth: 'Testing...',
    firestore: 'Testing...',
    storage: 'Testing...',
    config: 'Testing...'
  });

  useEffect(() => {    // Test Firebase config
    setStatus(prev => ({
      ...prev,
      config: `Project ID: ${auth.app.options.projectId}`,
      storage: storage ? '✅ Storage enabled' : '⚠️ Storage disabled (billing required)'
    }));

    // Test Auth
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setStatus(prev => ({
        ...prev,
        auth: user ? `✅ Authenticated: ${user.email}` : '✅ Auth working (no user)'
      }));
    }, (error) => {
      setStatus(prev => ({
        ...prev,
        auth: `❌ Auth error: ${error.message}`
      }));
    });    // Test Firestore
    const testFirestore = async () => {
      try {
        // Try to read a non-existent document to test connection
        await getDoc(doc(db, 'test', 'connection'));
        setStatus(prev => ({
          ...prev,
          firestore: '✅ Firestore connected successfully'
        }));
      } catch (error: unknown) {
        setStatus(prev => ({
          ...prev,
          firestore: `❌ Firestore error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }));
      }
    };

    testFirestore();

    return unsubscribe;
  }, []);

  return (
    <div className="p-6 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-4">🔥 Firebase Connection Test</h3>      <div className="space-y-2">
        <div><strong>Config:</strong> {status.config}</div>
        <div><strong>Authentication:</strong> {status.auth}</div>
        <div><strong>Firestore:</strong> {status.firestore}</div>
        <div><strong>Storage:</strong> {status.storage}</div>
      </div>
      {!storage && (
        <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 rounded">
          <p className="text-sm text-yellow-800">
            <strong>Storage Alternative:</strong> Using Base64 encoding and external services for file uploads.
          </p>
        </div>
      )}
    </div>
  );
};

export default FirebaseTest;
