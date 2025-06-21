import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { importFromYouTube, bulkImportFromYouTube } from '../utils/youtubeImporter';
import { parseYouTubeUrl } from '../services/youtubeService';
import { 
  Youtube, 
  Link as LinkIcon, 
  Plus, 
  Import, 
  CheckCircle, 
  AlertCircle, 
  Loader,
  Trash2,
  Play
} from 'lucide-react';

const YouTubeImporter = () => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [bulkUrls, setBulkUrls] = useState<string[]>(['']);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [customizations, setCustomizations] = useState({
    title: '',
    description: '',
    category: 'Programming',
    level: 'Beginner' as const,
    price: 0
  });
  
  const { currentUser } = useAuth();

  const categories = [
    'Programming', 'Mathematics', 'Science', 'Business', 
    'Design', 'Language', 'Engineering', 'Medicine', 'Other'
  ];

  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  const handleUrlChange = (url: string) => {
    setYoutubeUrl(url);
    setImportResult(null);
    
    // Parse URL to show preview
    const parsed = parseYouTubeUrl(url);
    if (parsed) {
      setPreviewData({
        type: parsed.type,
        id: parsed.id,
        embedUrl: parsed.type === 'video' ? `https://www.youtube.com/embed/${parsed.id}` : null
      });
    } else {
      setPreviewData(null);
    }
  };

  const handleSingleImport = async () => {
    if (!youtubeUrl || !currentUser) return;
    
    try {
      setImporting(true);
      setImportResult(null);
      
      const customData = {
        title: customizations.title || undefined,
        description: customizations.description || undefined,
        category: customizations.category,
        level: customizations.level,
        price: customizations.price
      };
      
      const result = await importFromYouTube(
        youtubeUrl,
        currentUser.uid,
        currentUser.displayName || currentUser.email || 'YouTube Importer',
        customData
      );
      
      setImportResult(result);
      
      if (result.success) {
        setYoutubeUrl('');
        setPreviewData(null);
        setCustomizations({
          title: '',
          description: '',
          category: 'Programming',
          level: 'Beginner',
          price: 0
        });
      }
    } catch (error) {
      setImportResult({
        success: false,
        message: 'Failed to import from YouTube'
      });
    } finally {
      setImporting(false);
    }
  };

  const handleBulkImport = async () => {
    if (!currentUser) return;
    
    const validUrls = bulkUrls.filter(url => url.trim() && parseYouTubeUrl(url));
    if (validUrls.length === 0) return;
    
    try {
      setImporting(true);
      setImportResult(null);
      
      const result = await bulkImportFromYouTube(
        validUrls,
        currentUser.uid,
        currentUser.displayName || currentUser.email || 'YouTube Importer'
      );
      
      setImportResult(result);
      
      if (result.success) {
        setBulkUrls(['']);
      }
    } catch (error) {
      setImportResult({
        success: false,
        message: 'Failed to bulk import from YouTube'
      });
    } finally {
      setImporting(false);
    }
  };

  const addBulkUrl = () => {
    setBulkUrls([...bulkUrls, '']);
  };

  const removeBulkUrl = (index: number) => {
    setBulkUrls(bulkUrls.filter((_, i) => i !== index));
  };

  const updateBulkUrl = (index: number, value: string) => {
    const updated = [...bulkUrls];
    updated[index] = value;
    setBulkUrls(updated);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to import YouTube content.</p>
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
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
              <Youtube className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">YouTube Course Importer</h1>
              <p className="text-gray-600">Import courses from YouTube playlists and videos</p>
            </div>
          </div>
        </div>

        {/* API Key Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900">YouTube API Key Required</h3>
              <p className="text-yellow-700 text-sm mt-1">
                To use this feature, you need to set up a YouTube Data API v3 key. 
                Add it to your environment variables as <code className="bg-yellow-100 px-1 rounded">VITE_YOUTUBE_API_KEY</code>.
              </p>
              <a 
                href="https://developers.google.com/youtube/v3/getting-started"
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-800 underline text-sm"
              >
                Get API Key →
              </a>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Single Import */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-6">
              <LinkIcon className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Import Single Video/Playlist</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  YouTube URL
                </label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or https://www.youtube.com/playlist?list=..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                {previewData && (
                  <div className="mt-2 text-sm text-green-600">
                    ✓ Valid {previewData.type} URL detected
                  </div>
                )}
              </div>

              {/* Preview */}
              {previewData?.embedUrl && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
                  <div className="aspect-video">
                    <iframe
                      src={previewData.embedUrl}
                      className="w-full h-full rounded"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* Customizations */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Customizations (Optional)</h4>
                
                <input
                  type="text"
                  value={customizations.title}
                  onChange={(e) => setCustomizations(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Custom course title (leave empty to use YouTube title)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                />
                
                <textarea
                  value={customizations.description}
                  onChange={(e) => setCustomizations(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Custom description (leave empty to use YouTube description)"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={customizations.category}
                    onChange={(e) => setCustomizations(prev => ({ ...prev, category: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  
                  <select
                    value={customizations.level}
                    onChange={(e) => setCustomizations(prev => ({ ...prev, level: e.target.value as any }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  >
                    {levels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
                
                <input
                  type="number"
                  value={customizations.price}
                  onChange={(e) => setCustomizations(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  placeholder="Price (default: free)"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                />
              </div>
              
              <button
                onClick={handleSingleImport}
                disabled={!youtubeUrl || importing}
                className="w-full bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {importing ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <Import className="w-5 h-5" />
                    <span>Import Course</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Bulk Import */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Plus className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Bulk Import</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">
                Import multiple YouTube videos or playlists at once. Each URL will be converted to a separate course.
              </p>
              
              {bulkUrls.map((url, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => updateBulkUrl(index, e.target.value)}
                    placeholder="https://www.youtube.com/..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  />
                  {bulkUrls.length > 1 && (
                    <button
                      onClick={() => removeBulkUrl(index)}
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              
              <button
                onClick={addBulkUrl}
                className="text-green-600 hover:text-green-800 flex items-center space-x-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another URL</span>
              </button>
              
              <button
                onClick={handleBulkImport}
                disabled={importing || bulkUrls.every(url => !url.trim())}
                className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {importing ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <Import className="w-5 h-5" />
                    <span>Bulk Import</span>
                  </>
                )}
              </button>
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
                
                {importResult.courseId && (
                  <div className="mt-3">
                    <a
                      href={`/course/${importResult.courseId}`}
                      className="inline-flex items-center text-green-700 hover:text-green-800 text-sm font-medium"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      View Course
                    </a>
                  </div>
                )}
                
                {importResult.imported && importResult.imported.length > 0 && (
                  <div className="mt-3">
                    <p className="text-green-700 text-sm font-medium">
                      Successfully imported {importResult.imported.length} courses
                    </p>
                    <div className="mt-1 max-h-32 overflow-y-auto">
                      {importResult.imported.map((id: string, index: number) => (
                        <a
                          key={index}
                          href={`/course/${id}`}
                          className="block text-xs text-green-600 hover:text-green-800 bg-green-100 px-2 py-1 rounded mt-1"
                        >
                          Course {index + 1}: {id}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                
                {importResult.failed && importResult.failed.length > 0 && (
                  <div className="mt-3">
                    <p className="text-red-700 text-sm font-medium">
                      Failed to import {importResult.failed.length} URLs
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Example URLs */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Example URLs you can try:</h3>
          <div className="space-y-2 text-sm">
            <div>
              <strong className="text-blue-800">Playlist:</strong>
              <code className="block bg-blue-100 p-2 rounded mt-1 text-blue-700">
                https://www.youtube.com/playlist?list=PLWKjhJtqVAbnqBxcdjVGgT3uVR10bzTEB
              </code>
            </div>
            <div>
              <strong className="text-blue-800">Video:</strong>
              <code className="block bg-blue-100 p-2 rounded mt-1 text-blue-700">
                https://www.youtube.com/watch?v=dQw4w9WgXcQ
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubeImporter;
