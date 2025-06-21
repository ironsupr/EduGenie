import { getCourses, getAllCoursesDebug } from './src/services/courseService.js';

console.log('Testing course service...');

// Test the debug function
getAllCoursesDebug().then(courses => {
  console.log('getAllCoursesDebug returned:', courses.length, 'courses');
  courses.forEach(course => {
    console.log('Course:', course.title, 'Published:', course.isPublished);
  });
}).catch(error => {
  console.error('getAllCoursesDebug failed:', error);
});

// Test the regular getCourses function
getCourses().then(courses => {
  console.log('getCourses returned:', courses.length, 'courses');
  courses.forEach(course => {
    console.log('Course:', course.title, 'Published:', course.isPublished);
  });
}).catch(error => {
  console.error('getCourses failed:', error);
});
