import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// Import the original App but with Firebase error handling
const LazyApp = () => {
  return import('./App.tsx')
    .then(({ default: App }) => {
      console.log('✅ App.tsx loaded successfully');
      return <App />;
    })
    .catch((error) => {
      console.error('❌ Failed to load App.tsx:', error);
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              ❌ App Loading Failed
            </h1>
            <p className="text-gray-700 mb-4">
              There's an error in the main application.
            </p>
            <div className="bg-gray-100 p-4 rounded text-left text-sm">
              <code>{error.toString()}</code>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      );
    });
};

// Simple loading component
const LoadingApp = () => {
  const [AppComponent, setAppComponent] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    import('./App.tsx')
      .then(({ default: App }) => {
        console.log('✅ App.tsx loaded successfully');
        setAppComponent(() => App);
      })
      .catch((error) => {
        console.error('❌ Failed to load App.tsx:', error);
        setError(error);
      });
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            ❌ App Loading Failed
          </h1>
          <p className="text-gray-700 mb-4">
            There's an error in the main application.
          </p>
          <div className="bg-gray-100 p-4 rounded text-left text-sm font-mono">
            {error.toString()}
          </div>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
            <p className="text-yellow-800 font-medium">� Most likely cause:</p>
            <p className="text-yellow-700">Firebase services not enabled</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!AppComponent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading EduGenie...</p>
        </div>
      </div>
    );
  }

  return <AppComponent />;
};

// We need to import useState and useEffect
import { useState, useEffect } from 'react';

try {
  const root = createRoot(document.getElementById('root')!);
  root.render(
    <StrictMode>
      <LoadingApp />
    </StrictMode>
  );
  console.log('✅ React app initialization started');
} catch (error) {
  console.error('❌ React initialization failed:', error);
  // Fallback HTML
  document.getElementById('root')!.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: Arial; background: #fef2f2; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
      <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 500px;">
        <h1 style="color: #dc2626; margin-bottom: 20px;">React Failed to Initialize</h1>
        <p style="color: #374151; margin-bottom: 15px;">There's a fundamental issue preventing React from starting.</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; font-family: monospace; text-align: left; margin-bottom: 20px;">
          ${error}
        </div>
        <p style="color: #6b7280; font-size: 14px;">Check the browser console for more details.</p>
        <button onclick="window.location.reload()" style="background: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px;">
          Retry
        </button>
      </div>
    </div>
  `;
}
