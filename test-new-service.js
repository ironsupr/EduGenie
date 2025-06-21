import { getAllCoursesDebugNew } from './src/services/courseServiceNew.js';

console.log('Testing new course service...');

getAllCoursesDebugNew()
  .then(courses => {
    console.log('✅ New service works! Found', courses.length, 'courses:');
    courses.forEach(course => {
      console.log(`📚 ${course.title} | ${course.category} | Published: ${course.isPublished}`);
    });
  })
  .catch(error => {
    console.error('❌ New service failed:', error);
  });
