import { useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Trash2, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

interface Course {
  id: string;
  title?: string;
  instructor?: string;
  createdAt?: any;
  [key: string]: any;
}

interface DuplicateGroup {
  title: string;
  courses: Course[];
}

const DuplicateManager = () => {
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState('');

  const scanForDuplicates = async () => {
    setScanning(true);
    setMessage('');
    
    try {
      const coursesRef = collection(db, 'courses');
      const snapshot = await getDocs(coursesRef);
      
      const titleGroups = new Map<string, Course[]>();
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const course: Course = { id: doc.id, ...data };
        const title = data.title?.toLowerCase().trim();
        
        if (title) {
          if (!titleGroups.has(title)) {
            titleGroups.set(title, []);
          }
          titleGroups.get(title)!.push(course);
        }
      });
      
      const duplicateGroups: DuplicateGroup[] = [];
      
      titleGroups.forEach((courses, title) => {
        if (courses.length > 1) {
          // Sort by creation date (oldest first)
          courses.sort((a, b) => {
            const aTime = a.createdAt?.seconds || 0;
            const bTime = b.createdAt?.seconds || 0;
            return aTime - bTime;
          });
            duplicateGroups.push({
            title: courses[0].title || 'Unknown Title',
            courses
          });
        }
      });
      
      setDuplicates(duplicateGroups);
      
      if (duplicateGroups.length === 0) {
        setMessage('No duplicates found! Your course library is clean.');
      } else {
        setMessage(`Found ${duplicateGroups.length} duplicate groups.`);
      }
      
    } catch (error) {
      console.error('Error scanning for duplicates:', error);
      setMessage('Error scanning for duplicates. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  const removeDuplicatesFromGroup = async (group: DuplicateGroup) => {
    setLoading(true);
    
    try {
      const toDelete = group.courses.slice(1); // Keep first (oldest), delete rest
      
      for (const course of toDelete) {
        await deleteDoc(doc(db, 'courses', course.id));
      }
      
      // Remove this group from the list
      setDuplicates(prev => prev.filter(g => g.title !== group.title));
      setMessage(`Removed ${toDelete.length} duplicates of "${group.title}"`);
      
    } catch (error) {
      console.error('Error removing duplicates:', error);
      setMessage('Error removing duplicates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeAllDuplicates = async () => {
    setLoading(true);
    
    try {
      let totalDeleted = 0;
      
      for (const group of duplicates) {
        const toDelete = group.courses.slice(1);
        
        for (const course of toDelete) {
          await deleteDoc(doc(db, 'courses', course.id));
          totalDeleted++;
        }
      }
      
      setDuplicates([]);
      setMessage(`Successfully removed ${totalDeleted} duplicate courses!`);
      
    } catch (error) {
      console.error('Error removing all duplicates:', error);
      setMessage('Error removing duplicates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Duplicate Course Manager</h2>
          <p className="text-gray-600">Scan and remove duplicate courses from your library</p>
        </div>
        <button
          onClick={scanForDuplicates}
          disabled={scanning || loading}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold flex items-center space-x-2 disabled:opacity-50"
        >
          <RefreshCw className={`h-5 w-5 ${scanning ? 'animate-spin' : ''}`} />
          <span>{scanning ? 'Scanning...' : 'Scan for Duplicates'}</span>
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl mb-6 flex items-center space-x-2 ${
          message.includes('Error') 
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : duplicates.length > 0
            ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {message.includes('Error') ? (
            <AlertTriangle className="h-5 w-5" />
          ) : (
            <CheckCircle className="h-5 w-5" />
          )}
          <span>{message}</span>
        </div>
      )}

      {duplicates.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Found {duplicates.length} duplicate group(s)
            </h3>
            <button
              onClick={removeAllDuplicates}
              disabled={loading}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-all duration-300 font-semibold flex items-center space-x-2 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              <span>Remove All Duplicates</span>
            </button>
          </div>

          <div className="space-y-6">
            {duplicates.map((group, index) => (
              <div key={index} className="border border-gray-200 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900 mb-2">"{group.title}"</h4>
                    <p className="text-gray-600">
                      {group.courses.length} copies found • Will keep oldest, remove {group.courses.length - 1}
                    </p>
                  </div>
                  <button
                    onClick={() => removeDuplicatesFromGroup(group)}
                    disabled={loading}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-300 font-semibold flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Remove Duplicates</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {group.courses.map((course, courseIndex) => (
                    <div
                      key={course.id}
                      className={`p-4 rounded-xl border-2 ${
                        courseIndex === 0
                          ? 'border-green-200 bg-green-50'
                          : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-bold px-2 py-1 rounded-full ${
                              courseIndex === 0
                                ? 'bg-green-200 text-green-800'
                                : 'bg-red-200 text-red-800'
                            }`}>
                              {courseIndex === 0 ? 'KEEP' : 'DELETE'}
                            </span>
                            <span className="text-sm text-gray-600">ID: {course.id}</span>
                          </div>
                          <div className="mt-1">
                            <span className="text-sm text-gray-600">
                              Instructor: {course.instructor || 'Unknown'}
                            </span>
                            <span className="text-sm text-gray-600 ml-4">
                              Created: {course.createdAt 
                                ? new Date(course.createdAt.seconds * 1000).toLocaleString()
                                : 'Unknown'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DuplicateManager;
