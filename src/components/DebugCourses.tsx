import { useState, useEffect } from 'react';
import { getAllCoursesDebug } from '../services/courseService';
import { Course } from '../types';

const DebugCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        console.log('DebugCourses: Loading courses...');
        const fetchedCourses = await getAllCoursesDebug();
        console.log('DebugCourses: Fetched courses:', fetchedCourses);
        setCourses(fetchedCourses);
      } catch (err) {
        console.error('DebugCourses: Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  if (loading) {
    return <div className="p-4">Loading debug courses...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Debug Courses ({courses.length} found)</h2>
      <div className="space-y-4">
        {courses.map((course) => (
          <div key={course.id} className="border p-4 rounded">
            <h3 className="font-bold">{course.title}</h3>
            <p>Instructor: {course.instructor}</p>
            <p>Published: {course.isPublished ? 'Yes' : 'No'}</p>
            <p>Category: {course.category}</p>
            <p>Level: {course.level}</p>
            <p>Created: {course.createdAt?.toString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DebugCourses;
