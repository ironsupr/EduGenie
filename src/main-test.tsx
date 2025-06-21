import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// Simple test without any Firebase dependencies
const TestApp = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-green-600 mb-4">
          ✅ React is Working!
        </h1>
        <p className="text-lg text-gray-700 mb-4">
          If you can see this, React is rendering correctly.
        </p>
        <div className="space-y-2">
          <div className="bg-green-100 text-green-800 p-2 rounded">✅ Vite Dev Server</div>
          <div className="bg-green-100 text-green-800 p-2 rounded">✅ React Rendering</div>
          <div className="bg-green-100 text-green-800 p-2 rounded">✅ TypeScript Working</div>
          <div className="bg-green-100 text-green-800 p-2 rounded">✅ Tailwind CSS</div>
        </div>
        <button 
          onClick={() => {
            console.log('Button clicked - React events working!');
            alert('React events are working!');
          }}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Test Click Event
        </button>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(
  <StrictMode>
    <TestApp />
  </StrictMode>
);
