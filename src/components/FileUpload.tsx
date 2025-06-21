import { useState } from 'react';
import { Upload, FileText, Image, AlertCircle } from 'lucide-react';
import { 
  storeFileInLocalStorage, 
  validateFileSize, 
  validateFileType, 
  getLocalStorageQuota 
} from '../services/storageService';

interface FileUploadProps {
  onFileUpload: (fileData: { key: string; fileInfo: any }) => void;
  acceptedTypes?: string[];
  maxSizeMB?: number;
  label?: string;
}

const FileUpload = ({ 
  onFileUpload, 
  acceptedTypes = ['image/*', 'application/pdf', 'text/*'],
  maxSizeMB = 5,
  label = 'Upload File'
}: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [storageQuota, setStorageQuota] = useState(getLocalStorageQuota());

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);

    try {
      // Validate file size
      if (!validateFileSize(file, maxSizeMB)) {
        throw new Error(`File size must be less than ${maxSizeMB}MB`);
      }

      // Validate file type
      if (!validateFileType(file, acceptedTypes)) {
        throw new Error(`File type not supported. Accepted: ${acceptedTypes.join(', ')}`);
      }

      // Check localStorage quota
      const quota = getLocalStorageQuota();
      const fileSizeInBytes = file.size * 1.37; // Base64 encoding increases size by ~37%
      
      if (fileSizeInBytes > quota.available) {
        throw new Error(`Not enough storage space. Available: ${quota.availableMB}MB, Required: ${(fileSizeInBytes / (1024 * 1024)).toFixed(2)}MB`);
      }

      // Generate unique key for the file
      const fileKey = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
      
      // Store file in localStorage
      await storeFileInLocalStorage(file, fileKey);
      
      const fileInfo = {
        key: fileKey,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        storage: 'localStorage'
      };

      setUploadedFile(fileInfo);
      onFileUpload({ key: fileKey, fileInfo });
      
      // Update storage quota display
      setStorageQuota(getLocalStorageQuota());
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-8 w-8" />;
    return <FileText className="h-8 w-8" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        ) : uploadedFile ? (
          <div className="flex flex-col items-center">
            {getFileIcon(uploadedFile.type)}
            <p className="text-sm font-medium text-gray-900 mt-2">{uploadedFile.name}</p>
            <p className="text-xs text-gray-500">{formatFileSize(uploadedFile.size)}</p>
            <button
              onClick={() => {
                setUploadedFile(null);
                setError(null);
              }}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700"
            >
              Upload different file
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              Drag and drop your file here, or{' '}
              <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
                browse
                <input
                  type="file"
                  className="hidden"
                  onChange={handleChange}
                  accept={acceptedTypes.join(',')}
                />
              </label>
            </p>
            <p className="text-xs text-gray-400">
              Max size: {maxSizeMB}MB • Supported: {acceptedTypes.join(', ')}
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 flex items-center text-red-600">
          <AlertCircle className="h-4 w-4 mr-1" />
          <span className="text-sm">{error}</span>
        </div>
      )}      <div className="mt-2 text-xs text-gray-500 space-y-1">
        <p>� Files stored in browser localStorage (persistent across sessions)</p>
        <p>📊 Storage used: {storageQuota.usedMB}MB / Available: {storageQuota.availableMB}MB</p>
      </div>
    </div>
  );
};

export default FileUpload;
