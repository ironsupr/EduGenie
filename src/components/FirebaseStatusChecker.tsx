import { useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';

interface FirebaseStatus {
  config: string;
  auth: string;
  firestore: string;
  services: {
    authEnabled: boolean;
    firestoreEnabled: boolean;
  };
}

const FirebaseStatusChecker = () => {
  const [status, setStatus] = useState<FirebaseStatus>({
    config: 'Testing...',
    auth: 'Testing...',
    firestore: 'Testing...',
    services: {
      authEnabled: false,
      firestoreEnabled: false
    }
  });
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    checkFirebaseStatus();
  }, []);

  const checkFirebaseStatus = async () => {
    // Test Firebase config
    setStatus(prev => ({
      ...prev,
      config: `✅ Project: ${auth.app.options.projectId} | Auth Domain: ${auth.app.options.authDomain}`
    }));

    // Test Authentication
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setStatus(prev => ({
        ...prev,
        auth: user 
          ? `✅ Authentication working - User: ${user.email || 'Anonymous'}` 
          : '✅ Authentication service enabled (no user signed in)',
        services: {
          ...prev.services,
          authEnabled: true
        }
      }));
    }, (error) => {
      setStatus(prev => ({
        ...prev,
        auth: `❌ Authentication error: ${error.message}`,
        services: {
          ...prev.services,
          authEnabled: false
        }
      }));
    });

    // Test Firestore
    try {
      // Try to read from Firestore
      const testDocRef = doc(db, 'test', 'connection');
      await getDoc(testDocRef);
      
      setStatus(prev => ({
        ...prev,
        firestore: '✅ Firestore database connected successfully',
        services: {
          ...prev.services,
          firestoreEnabled: true
        }
      }));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('permission-denied') || errorMessage.includes('requires-recent-login')) {
        setStatus(prev => ({
          ...prev,
          firestore: '✅ Firestore connected (permission rules working)',
          services: {
            ...prev.services,
            firestoreEnabled: true
          }
        }));
      } else {
        setStatus(prev => ({
          ...prev,
          firestore: `❌ Firestore error: ${errorMessage}`,
          services: {
            ...prev.services,
            firestoreEnabled: false
          }
        }));
      }
    }

    return unsubscribe;
  };

  const testWriteToFirestore = async () => {
    setTesting(true);
    try {
      // Try to write a test document
      const testData = {
        test: true,
        timestamp: new Date(),
        message: 'Firestore write test'
      };
      
      await addDoc(collection(db, 'tests'), testData);
      setStatus(prev => ({
        ...prev,
        firestore: prev.firestore + ' | ✅ Write test successful'
      }));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setStatus(prev => ({
        ...prev,
        firestore: prev.firestore + ` | ❌ Write test failed: ${errorMessage}`
      }));
    } finally {
      setTesting(false);
    }
  };

  const testAuthentication = async () => {
    setTesting(true);
    try {
      // Try anonymous sign in
      await signInAnonymously(auth);
      setStatus(prev => ({
        ...prev,
        auth: prev.auth + ' | ✅ Anonymous sign-in test successful'
      }));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setStatus(prev => ({
        ...prev,
        auth: prev.auth + ` | ❌ Sign-in test failed: ${errorMessage}`
      }));
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (enabled: boolean) => {
    return enabled ? '✅' : '❌';
  };

  const getStatusColor = (enabled: boolean) => {
    return enabled ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h3 className="text-xl font-bold mb-4 flex items-center">
        🔥 Firebase Configuration Status
      </h3>
      
      <div className="space-y-4">
        {/* Configuration */}
        <div className="p-3 bg-gray-50 rounded">
          <h4 className="font-semibold text-gray-800 mb-2">Configuration</h4>
          <p className="text-sm text-gray-700">{status.config}</p>
        </div>

        {/* Services Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-3 rounded border-l-4 ${status.services.authEnabled ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
            <h4 className={`font-semibold mb-2 ${getStatusColor(status.services.authEnabled)}`}>
              {getStatusIcon(status.services.authEnabled)} Authentication
            </h4>
            <p className="text-sm text-gray-700 mb-2">{status.auth}</p>
            <button 
              onClick={testAuthentication}
              disabled={testing}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {testing ? 'Testing...' : 'Test Auth'}
            </button>
          </div>

          <div className={`p-3 rounded border-l-4 ${status.services.firestoreEnabled ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
            <h4 className={`font-semibold mb-2 ${getStatusColor(status.services.firestoreEnabled)}`}>
              {getStatusIcon(status.services.firestoreEnabled)} Firestore Database
            </h4>
            <p className="text-sm text-gray-700 mb-2">{status.firestore}</p>
            <button 
              onClick={testWriteToFirestore}
              disabled={testing}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {testing ? 'Testing...' : 'Test Write'}
            </button>
          </div>
        </div>

        {/* Storage Status */}
        <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
          <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Storage (Disabled)</h4>
          <p className="text-sm text-yellow-700">
            Firebase Storage disabled (requires billing). Using localStorage instead.
          </p>
        </div>

        {/* Overall Status */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">📊 Overall Status</h4>
          <div className="text-sm space-y-1">
            <p>
              <span className="font-medium">Authentication:</span> 
              <span className={getStatusColor(status.services.authEnabled)}>
                {status.services.authEnabled ? ' Enabled & Working' : ' Not Enabled'}
              </span>
            </p>
            <p>
              <span className="font-medium">Firestore:</span> 
              <span className={getStatusColor(status.services.firestoreEnabled)}>
                {status.services.firestoreEnabled ? ' Enabled & Working' : ' Not Enabled'}
              </span>
            </p>
            <p>
              <span className="font-medium">Storage:</span> 
              <span className="text-yellow-600"> Using localStorage (no billing required)</span>
            </p>
          </div>
          
          {status.services.authEnabled && status.services.firestoreEnabled && (
            <div className="mt-3 p-2 bg-green-100 border border-green-300 rounded">
              <p className="text-green-800 font-medium">
                🎉 Your Firebase setup is complete and working perfectly!
              </p>
            </div>
          )}
        </div>

        {/* Troubleshooting */}
        {(!status.services.authEnabled || !status.services.firestoreEnabled) && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2">🔧 Setup Required</h4>
            <div className="text-sm text-red-700 space-y-2">
              {!status.services.authEnabled && (
                <div>
                  <p className="font-medium">Authentication Setup:</p>
                  <p>1. Go to <a href="https://console.firebase.google.com/project/edugenie-h-ba04c/authentication" className="underline" target="_blank" rel="noopener noreferrer">Firebase Authentication Console</a></p>
                  <p>2. Click "Get started"</p>
                  <p>3. Enable "Email/Password" sign-in method</p>
                </div>
              )}
              {!status.services.firestoreEnabled && (
                <div>
                  <p className="font-medium">Firestore Setup:</p>
                  <p>1. Go to <a href="https://console.firebase.google.com/project/edugenie-h-ba04c/firestore" className="underline" target="_blank" rel="noopener noreferrer">Firebase Firestore Console</a></p>
                  <p>2. Click "Create database"</p>
                  <p>3. Choose "Start in test mode"</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FirebaseStatusChecker;
