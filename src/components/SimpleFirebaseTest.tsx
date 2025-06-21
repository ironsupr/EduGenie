import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

const SimpleFirebaseTest = () => {
  const [status, setStatus] = useState('Testing...');
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    const testFirebase = async () => {
      try {
        console.log('SimpleFirebaseTest: Testing Firebase connection...');
        console.log('DB object:', db);
        
        const coursesRef = collection(db, 'courses');
        const snapshot = await getDocs(coursesRef);
        
        console.log('SimpleFirebaseTest: Got', snapshot.size, 'courses');
        
        const coursesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setCourses(coursesData);
        setStatus(`Success! Found ${snapshot.size} courses`);
        
      } catch (error) {
        console.error('SimpleFirebaseTest: Error:', error);
        setStatus(`Error: ${error}`);
      }
    };

    testFirebase();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Simple Firebase Test</h1>
      <p className="mb-4">Status: {status}</p>
      <div>
        <h2 className="text-lg font-bold mb-2">Courses ({courses.length}):</h2>
        {courses.map((course, index) => (
          <div key={course.id || index} className="border p-2 mb-2">
            <p><strong>Title:</strong> {course.title}</p>
            <p><strong>Category:</strong> {course.category}</p>
            <p><strong>Published:</strong> {course.isPublished ? 'Yes' : 'No'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimpleFirebaseTest;
