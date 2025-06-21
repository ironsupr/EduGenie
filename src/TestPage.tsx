// Simple test page without Firebase dependencies

const TestPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎉 EduGenie Test Page
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          If you can see this, React is working correctly!
        </p>
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
          <h2 className="text-lg font-semibold mb-4">Basic Components Test</h2>
          <div className="space-y-2">
            <div className="bg-green-100 text-green-800 p-2 rounded">✅ React: Working</div>
            <div className="bg-green-100 text-green-800 p-2 rounded">✅ TypeScript: Working</div>
            <div className="bg-green-100 text-green-800 p-2 rounded">✅ Tailwind CSS: Working</div>
            <div className="bg-green-100 text-green-800 p-2 rounded">✅ Vite Server: Working</div>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
