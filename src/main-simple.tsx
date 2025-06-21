import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// Simple test without Firebase
const SimpleApp = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎉 EduGenie is Running!
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          React, TypeScript, and Tailwind are working correctly.
        </p>
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
          <h2 className="text-lg font-semibold mb-4">Status Check</h2>
          <div className="space-y-2">
            <div className="bg-green-100 text-green-800 p-2 rounded">✅ React: Working</div>
            <div className="bg-green-100 text-green-800 p-2 rounded">✅ TypeScript: Working</div>
            <div className="bg-green-100 text-green-800 p-2 rounded">✅ Tailwind CSS: Working</div>
            <div className="bg-green-100 text-green-800 p-2 rounded">✅ Vite Server: Working</div>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
            <p className="text-yellow-800 font-medium">⚠️ Next Step:</p>
            <p className="text-yellow-700">Enable Firebase services (Firestore + Auth) in Firebase Console</p>
          </div>
        </div>
      </div>
    </div>
  );
};

try {
  const root = createRoot(document.getElementById('root')!);
  root.render(
    <StrictMode>
      <SimpleApp />
    </StrictMode>
  );
  console.log('✅ Simple React app loaded successfully');
} catch (error) {
  console.error('❌ Even simple React failed:', error);
  document.getElementById('root')!.innerHTML = `
    <div style="padding: 20px; color: red; font-family: Arial;">
      <h1>Critical Error</h1>
      <p>React cannot initialize at all: ${error}</p>
    </div>
  `;
}
