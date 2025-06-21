import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

const SimpleCoursesList = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        console.log('SimpleCoursesList: Fetching courses...');
        
        const coursesRef = collection(db, 'courses');
        const snapshot = await getDocs(coursesRef);
        
        console.log('SimpleCoursesList: Found', snapshot.size, 'courses');
        
        const coursesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('SimpleCoursesList: Courses data:', coursesData);
        setCourses(coursesData);
        
      } catch (err) {
        console.error('SimpleCoursesList: Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) return <div className="p-4">Loading simple courses list...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Simple Courses List ({courses.length} found)</h1>
      <div className="grid gap-4">
        {courses.map((course) => (
          <div key={course.id} className="border p-4 rounded bg-white shadow">
            <h3 className="font-bold text-lg">{course.title}</h3>
            <p>Instructor: {course.instructor}</p>
            <p>Category: {course.category}</p>
            <p>Published: {course.isPublished ? 'Yes' : 'No'}</p>
            <p>Duration: {course.duration}</p>
            <p>ID: {course.id}</p>
          </div>
        ))}
      </div>
      {courses.length === 0 && (
        <p className="text-gray-500">No courses found in the database.</p>
      )}
    </div>
  );
};

export default SimpleCoursesList;
