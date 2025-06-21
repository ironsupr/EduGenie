import { useState, useEffect } from 'react';
import { FileText, Image, Trash2, Download, HardDrive } from 'lucide-react';
import { 
  listFilesInLocalStorage, 
  getFileFromLocalStorage, 
  deleteFileFromLocalStorage,
  getLocalStorageQuota 
} from '../services/storageService';

const LocalStorageManager = () => {
  const [files, setFiles] = useState<string[]>([]);
  const [quota, setQuota] = useState(getLocalStorageQuota());

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = () => {
    const fileKeys = listFilesInLocalStorage();
    setFiles(fileKeys);
    setQuota(getLocalStorageQuota());
  };

  const handleDownload = (fileKey: string) => {
    const fileData = getFileFromLocalStorage(fileKey);
    if (fileData) {
      // Create download link
      const link = document.createElement('a');
      link.href = fileData.data;
      link.download = fileData.name;
      link.click();
    }
  };

  const handleDelete = (fileKey: string) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      deleteFileFromLocalStorage(fileKey);
      loadFiles();
    }
  };

  const getFileIcon = (type: string) => {
    if (type && type.startsWith('image/')) {
      return <Image className="h-4 w-4 text-blue-500" />;
    }
    return <FileText className="h-4 w-4 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (files.length === 0) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg">
        <div className="text-center">
          <HardDrive className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No files stored</h3>
          <p className="text-gray-500">Upload some files to see them here</p>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>💾 Storage: {quota.usedMB}MB used / {quota.availableMB}MB available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <HardDrive className="h-5 w-5 mr-2" />
          Local Storage Files ({files.length})
        </h3>
        <div className="text-sm text-gray-500">
          {quota.usedMB}MB / ~5MB
        </div>
      </div>

      <div className="space-y-2">
        {files.map((fileKey) => {
          const fileData = getFileFromLocalStorage(fileKey);
          if (!fileData) return null;

          return (
            <div key={fileKey} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getFileIcon(fileData.type)}
                <div>
                  <p className="text-sm font-medium text-gray-900">{fileData.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(fileData.size)} • {formatDate(fileData.uploadedAt)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownload(fileKey)}
                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(fileKey)}
                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-blue-800">Storage Usage:</span>
          <span className="font-medium text-blue-900">
            {quota.usedMB}MB used, {quota.availableMB}MB available
          </span>
        </div>
        <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full" 
            style={{ 
              width: `${Math.min((parseFloat(quota.usedMB) / (parseFloat(quota.usedMB) + parseFloat(quota.availableMB))) * 100, 100)}%` 
            }}
          ></div>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500">
        <p>💡 Files are stored in your browser's localStorage and persist across sessions</p>
        <p>⚠️ Files will be lost if you clear browser data or use incognito mode</p>
      </div>
    </div>
  );
};

export default LocalStorageManager;
