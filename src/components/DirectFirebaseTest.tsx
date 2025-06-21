import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

const DirectFirebaseTest = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        console.log('DirectFirebaseTest: Starting...');
        const coursesRef = collection(db, 'courses');
        const snapshot = await getDocs(coursesRef);
        
        console.log('DirectFirebaseTest: Got snapshot with', snapshot.size, 'documents');
        
        const coursesData = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log('DirectFirebaseTest: Processing doc', doc.id, data);
          return {
            id: doc.id,
            title: data.title,
            instructor: data.instructor,
            category: data.category,
            isPublished: data.isPublished
          };
        });
        
        console.log('DirectFirebaseTest: Final courses data:', coursesData);
        setCourses(coursesData);
      } catch (error) {
        console.error('DirectFirebaseTest: Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  console.log('DirectFirebaseTest: Rendering with', courses.length, 'courses, loading:', loading);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Direct Firebase Test</h1>
      
      {loading && <p className="text-blue-600">Loading...</p>}
      
      <div className="bg-white p-4 rounded shadow mb-4">
        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
        <p><strong>Courses count:</strong> {courses.length}</p>
      </div>
      
      {!loading && courses.length === 0 && (
        <p className="text-red-600">No courses found!</p>
      )}
      
      {!loading && courses.length > 0 && (
        <div className="space-y-4">
          {courses.map((course) => (
            <div key={course.id} className="bg-white p-4 rounded shadow">
              <h3 className="font-bold">{course.title}</h3>
              <p>Instructor: {course.instructor}</p>
              <p>Category: {course.category}</p>
              <p>Published: {course.isPublished ? 'Yes' : 'No'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DirectFirebaseTest;
