import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { User } from '../types';
import { getUserData } from '../services/authService';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userData: null,
  loading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setLoading(false);
      setError('Firebase connection timeout. Please check if Firebase services are enabled.');
    }, 10000); // 10 seconds timeout

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setCurrentUser(user);

        if (user) {
          const data = await getUserData(user.uid);
          setUserData(data);
        } else {
          setUserData(null);
        }

        setLoading(false);
        setError(null);
        clearTimeout(timeout);
      } catch (err) {
        console.error('Firebase auth error:', err);
        setLoading(false);
        setError('Firebase authentication error. Please check your configuration.');
        clearTimeout(timeout);
      }
    });

    // Cleanup the listener and timeout on component unmount
    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []); // Remove loading dependency to prevent infinite loop

  const value = {
    currentUser,
    userData,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading EduGenie...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center max-w-md p-6">
            <div className="text-red-500 text-xl mb-4">⚠️ Configuration Error</div>
            <p className="text-gray-700 mb-4">{error}</p>
            <p className="text-sm text-gray-500">
              Please enable Authentication, Firestore, and Storage in your Firebase Console:
              <br />
              <a 
                href="https://console.firebase.google.com/project/edugenie-h-ba04c/authentication" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Enable Authentication
              </a>
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
