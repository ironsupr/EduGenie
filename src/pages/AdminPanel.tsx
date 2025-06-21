import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { bulkImportCourses, importCoursesFromJSON } from '../utils/courseImporter';
import { Upload, Download, BookOpen, Users, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const AdminPanel = () => {
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    courseIds?: string[];
  } | null>(null);
  
  const { currentUser } = useAuth();

  const handleBulkImport = async () => {
    if (!currentUser) return;
    
    try {
      setImporting(true);
      setImportResult(null);
      
      const result = await bulkImportCourses(
        currentUser.uid,
        currentUser.displayName || currentUser.email || 'Admin User'
      );
      
      setImportResult(result);
    } catch (error) {
      setImportResult({
        success: false,
        message: 'Failed to import courses'
      });
    } finally {
      setImporting(false);
    }
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;

    try {
      setImporting(true);
      setImportResult(null);
      
      const text = await file.text();
      const jsonData = JSON.parse(text);
      
      const result = await importCoursesFromJSON(
        jsonData,
        currentUser.uid,
        currentUser.displayName || currentUser.email || 'Admin User'
      );
      
      setImportResult(result);
    } catch (error) {
      setImportResult({
        success: false,
        message: 'Failed to parse or import JSON file'
      });
    } finally {
      setImporting(false);
    }
  };

  const downloadSampleJSON = () => {
    const sampleData = [
      {
        title: "Sample Course",
        description: "This is a sample course description",
        category: "Programming",
        level: "Beginner",
        price: 49.99,
        duration: "4 weeks",
        rating: 4.5,
        studentsCount: 100,
        imageUrl: "https://example.com/image.jpg",
        modules: [],
        isPublished: true
      }
    ];
    
    const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-courses.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to access the admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600">Manage courses and content</p>
            </div>
          </div>
        </div>        <div className="grid md:grid-cols-2 gap-8">
          {/* Bulk Import Sample Courses */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Sample Courses</h2>
            </div>
            
            <p className="text-gray-600 mb-6">
              Import a set of pre-built sample courses to get started quickly. 
              Includes courses in Programming, Business, Mathematics, and Science.
            </p>
            
            <button
              onClick={handleBulkImport}
              disabled={importing}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {importing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>Import Sample Courses (5 courses)</span>
                </>
              )}
            </button>
          </div>

          {/* YouTube Import */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">YT</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">YouTube Import</h2>
            </div>
            
            <p className="text-gray-600 mb-6">
              Import courses directly from YouTube playlists and videos. 
              Convert educational content into structured courses automatically.
            </p>
            
            <a
              href="/youtube-import"
              className="w-full bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Upload className="w-5 h-5" />
              <span>Import from YouTube</span>
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-1 gap-8 mt-8">
          {/* JSON File Import */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">JSON Import</h2>
            </div>
            
            <p className="text-gray-600 mb-4">
              Import courses from a JSON file. Download the sample format first 
              to see the required structure.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={downloadSampleJSON}
                className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Sample JSON</span>
              </button>
              
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  disabled={importing}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <div className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors flex items-center justify-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>Click to Upload JSON File</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Import Result */}
        {importResult && (
          <div className={`mt-8 p-6 rounded-lg ${importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-start space-x-3">
              {importResult.success ? (
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              
              <div>
                <h3 className={`font-semibold ${importResult.success ? 'text-green-900' : 'text-red-900'}`}>
                  {importResult.success ? 'Import Successful!' : 'Import Failed'}
                </h3>
                <p className={`mt-1 ${importResult.success ? 'text-green-700' : 'text-red-700'}`}>
                  {importResult.message}
                </p>
                
                {importResult.courseIds && importResult.courseIds.length > 0 && (
                  <div className="mt-3">
                    <p className="text-green-700 text-sm font-medium">Course IDs:</p>
                    <div className="mt-1 max-h-32 overflow-y-auto">
                      {importResult.courseIds.map((id, index) => (
                        <code key={index} className="block text-xs text-green-600 bg-green-100 px-2 py-1 rounded mt-1">
                          {id}
                        </code>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <a
              href="/courses/create"
              className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg transition-colors text-center"
            >
              <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="font-semibold text-blue-900">Create Course</div>
              <div className="text-sm text-blue-600">Build a new course</div>
            </a>
            
            <a
              href="/youtube-import"
              className="bg-red-50 hover:bg-red-100 p-4 rounded-lg transition-colors text-center"
            >
              <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center mx-auto mb-2">
                <span className="text-white text-xs font-bold">YT</span>
              </div>
              <div className="font-semibold text-red-900">YouTube Import</div>
              <div className="text-sm text-red-600">Import from YouTube</div>
            </a>
            
            <a
              href="/courses"
              className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg transition-colors text-center"
            >
              <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="font-semibold text-purple-900">View Courses</div>
              <div className="text-sm text-purple-600">Browse all courses</div>
            </a>
            
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <div className="font-semibold text-gray-600">User Management</div>
              <div className="text-sm text-gray-500">Coming soon</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
