// Alternative storage solutions without Firebase Storage
// Since Firebase Storage requires billing, we'll use these alternatives

// Option 1: LocalStorage for persistent file storage
export const storeFileInLocalStorage = (file: File, key: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result as string;
      const fileData = {
        name: file.name,
        size: file.size,
        type: file.type,
        data: base64,
        uploadedAt: new Date().toISOString(),
      };
      
      try {
        localStorage.setItem(`file_${key}`, JSON.stringify(fileData));
        resolve(key);
      } catch (error) {
        reject(new Error('LocalStorage quota exceeded. Try a smaller file.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
};

export const getFileFromLocalStorage = (key: string) => {
  try {
    const fileData = localStorage.getItem(`file_${key}`);
    return fileData ? JSON.parse(fileData) : null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
};

export const deleteFileFromLocalStorage = (key: string): boolean => {
  try {
    localStorage.removeItem(`file_${key}`);
    return true;
  } catch (error) {
    console.error('Error deleting from localStorage:', error);
    return false;
  }
};

export const listFilesInLocalStorage = (): string[] => {
  const files: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('file_')) {
      files.push(key.replace('file_', ''));
    }
  }
  return files;
};

// Option 2: Base64 encoding for small files (images, documents)
export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Option 2: Imgur (free image hosting)
export const uploadToImgur = async (file: File): Promise<string> => {
  // Free image hosting service (requires API key)
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const response = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        'Authorization': 'Client-ID YOUR_IMGUR_CLIENT_ID', // Replace with your Imgur client ID
      },
      body: formData,
    });
    
    const data = await response.json();
    return data.data.link;
  } catch (error) {
    console.error('Imgur upload failed:', error);
    throw error;
  }
};

// Option 3: Cloudinary (free tier available)
export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'YOUR_UPLOAD_PRESET'); // Replace with your preset
  
  try {
    const response = await fetch(
      'https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload', // Replace with your cloud name
      {
        method: 'POST',
        body: formData,
      }
    );
    
    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    throw error;
  }
};

// Option 2: Store files as Base64 in Firestore (for small files only)
export const storeFileInFirestore = async (file: File) => {
  // Only for files smaller than 100KB due to Firestore limits
  if (file.size > 100 * 1024) {
    throw new Error('File too large for Firestore storage. Use localStorage or external service instead.');
  }
  
  const base64 = await convertFileToBase64(file);
  
  // Return file data to be stored in Firestore document
  const fileData = {
    name: file.name,
    size: file.size,
    type: file.type,
    data: base64,
    uploadedAt: new Date(),
  };
  
  return fileData;
};

// Option 5: Simple URL-based file storage (for external links)
export const storeExternalFileUrl = (url: string, fileName: string) => {
  return {
    name: fileName,
    url: url,
    type: 'external',
    uploadedAt: new Date(),
  };
};

// LocalStorage quota check
export const getLocalStorageQuota = () => {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  
  // Estimate available space (localStorage typically has 5-10MB limit)
  const estimatedTotal = total;
  const estimatedLimit = 5 * 1024 * 1024; // 5MB estimate
  const estimatedAvailable = estimatedLimit - estimatedTotal;
  
  return {
    used: estimatedTotal,
    available: estimatedAvailable,
    usedMB: (estimatedTotal / (1024 * 1024)).toFixed(2),
    availableMB: (estimatedAvailable / (1024 * 1024)).toFixed(2)
  };
};

// File size validation
export const validateFileSize = (file: File, maxSizeMB: number = 5): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

// File type validation
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

export default {
  storeFileInLocalStorage,
  getFileFromLocalStorage,
  deleteFileFromLocalStorage,
  listFilesInLocalStorage,
  convertFileToBase64,
  uploadToImgur,
  uploadToCloudinary,
  storeFileInFirestore,
  storeExternalFileUrl,
  getLocalStorageQuota,
  validateFileSize,
  validateFileType,
};
