import { createCourse } from '../services/courseService';
import { Course } from '../types';

// Sample course data that can be imported
export const sampleCourses: Omit<Course, 'id' | 'instructorId' | 'instructor' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: "Complete Web Development Bootcamp",
    description: "Learn HTML, CSS, JavaScript, React, Node.js, and MongoDB from scratch. Build real-world projects and become a full-stack developer.",
    category: "Programming",
    level: "Beginner",
    price: 99.99,
    duration: "12 weeks",
    rating: 4.8,
    studentsCount: 15420,
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500",
    modules: [
      {
        id: "1",
        title: "HTML & CSS Fundamentals",
        description: "Learn the building blocks of web development",
        duration: "2 weeks",
        order: 0,
        lessons: []
      },
      {
        id: "2", 
        title: "JavaScript Essentials",
        description: "Master JavaScript programming concepts",
        duration: "3 weeks",
        order: 1,
        lessons: []
      },
      {
        id: "3",
        title: "React Framework",
        description: "Build modern web applications with React",
        duration: "4 weeks", 
        order: 2,
        lessons: []
      }
    ],
    isPublished: true
  },
  {
    title: "Data Science with Python",
    description: "Master data analysis, machine learning, and visualization using Python, pandas, scikit-learn, and matplotlib.",
    category: "Programming",
    level: "Intermediate",
    price: 149.99,
    duration: "16 weeks",
    rating: 4.9,
    studentsCount: 8750,
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500",
    modules: [
      {
        id: "1",
        title: "Python for Data Science",
        description: "Python fundamentals for data analysis",
        duration: "3 weeks",
        order: 0,
        lessons: []
      },
      {
        id: "2",
        title: "Data Analysis with Pandas", 
        description: "Data manipulation and analysis techniques",
        duration: "4 weeks",
        order: 1,
        lessons: []
      },
      {
        id: "3",
        title: "Machine Learning Fundamentals",
        description: "Introduction to ML algorithms and implementation",
        duration: "6 weeks",
        order: 2,
        lessons: []
      }
    ],
    isPublished: true
  },
  {
    title: "Digital Marketing Mastery",
    description: "Learn SEO, social media marketing, Google Ads, email marketing, and analytics to grow any business online.",
    category: "Business",
    level: "Beginner",
    price: 79.99,
    duration: "8 weeks",
    rating: 4.7,
    studentsCount: 12300,
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500",
    modules: [
      {
        id: "1",
        title: "Digital Marketing Fundamentals",
        description: "Understanding the digital marketing landscape",
        duration: "1 week",
        order: 0,
        lessons: []
      },
      {
        id: "2",
        title: "SEO & Content Marketing",
        description: "Search engine optimization and content strategies",
        duration: "3 weeks",
        order: 1, 
        lessons: []
      },
      {
        id: "3",
        title: "Social Media & Paid Advertising",
        description: "Social media marketing and Google Ads",
        duration: "3 weeks",
        order: 2,
        lessons: []
      }
    ],
    isPublished: true
  },
  {
    title: "Calculus I: Limits and Derivatives",
    description: "Master the fundamentals of calculus including limits, derivatives, and their applications in science and engineering.",
    category: "Mathematics",
    level: "Intermediate",
    price: 59.99,
    duration: "10 weeks",
    rating: 4.6,
    studentsCount: 5650,
    imageUrl: "https://images.unsplash.com/photo-1635372722656-389f87a941b7?w=500",
    modules: [
      {
        id: "1",
        title: "Introduction to Limits",
        description: "Understanding limits and continuity",
        duration: "2 weeks",
        order: 0,
        lessons: []
      },
      {
        id: "2",
        title: "Derivatives and Rules",
        description: "Derivative rules and techniques",
        duration: "4 weeks",
        order: 1,
        lessons: []
      },
      {
        id: "3", 
        title: "Applications of Derivatives",
        description: "Real-world applications and optimization",
        duration: "3 weeks",
        order: 2,
        lessons: []
      }
    ],
    isPublished: true
  },
  {
    title: "Introduction to Psychology",
    description: "Explore the fundamentals of human behavior, cognition, and mental processes through engaging lectures and case studies.",
    category: "Science",
    level: "Beginner",
    price: 69.99,
    duration: "6 weeks",
    rating: 4.5,
    studentsCount: 9820,
    imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500",
    modules: [
      {
        id: "1",
        title: "History and Methods of Psychology",
        description: "Overview of psychology as a science",
        duration: "1 week",
        order: 0,
        lessons: []
      },
      {
        id: "2",
        title: "Cognitive Psychology",
        description: "Understanding perception, memory, and thinking",
        duration: "2 weeks",
        order: 1,
        lessons: []
      },
      {
        id: "3",
        title: "Social and Personality Psychology", 
        description: "How we interact with others and develop personality",
        duration: "2 weeks",
        order: 2,
        lessons: []
      }
    ],
    isPublished: true
  }
];

/**
 * Bulk import courses into Firestore
 * @param instructorId - The ID of the instructor creating these courses
 * @param instructorName - The name of the instructor
 */
export const bulkImportCourses = async (instructorId: string, instructorName: string) => {
  const importedCourses: string[] = [];
  
  try {
    for (const courseData of sampleCourses) {
      const fullCourseData: Omit<Course, 'id'> = {
        ...courseData,
        instructor: instructorName,
        instructorId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const courseId = await createCourse(fullCourseData);
      importedCourses.push(courseId);
      
      console.log(`Created course: ${courseData.title} (ID: ${courseId})`);
    }
    
    return {
      success: true,
      message: `Successfully imported ${importedCourses.length} courses`,
      courseIds: importedCourses
    };
  } catch (error) {
    console.error('Error during bulk import:', error);
    return {
      success: false,
      message: 'Failed to import courses',
      error: error
    };
  }
};

/**
 * Import courses from a JSON file
 * @param jsonData - Array of course objects
 * @param instructorId - The ID of the instructor
 * @param instructorName - The name of the instructor
 */
export const importCoursesFromJSON = async (
  jsonData: any[], 
  instructorId: string, 
  instructorName: string
) => {
  const importedCourses: string[] = [];
  
  try {
    for (const courseData of jsonData) {
      // Validate required fields
      if (!courseData.title || !courseData.description || !courseData.category) {
        console.warn('Skipping invalid course data:', courseData);
        continue;
      }
      
      const fullCourseData: Omit<Course, 'id'> = {
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        level: courseData.level || 'Beginner',
        price: parseFloat(courseData.price) || 0,
        duration: courseData.duration || 'Self-paced',
        rating: parseFloat(courseData.rating) || 0,
        studentsCount: parseInt(courseData.studentsCount) || 0,
        imageUrl: courseData.imageUrl || '',
        modules: courseData.modules || [],
        instructor: instructorName,
        instructorId,
        isPublished: courseData.isPublished || false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const courseId = await createCourse(fullCourseData);
      importedCourses.push(courseId);
    }
    
    return {
      success: true,
      message: `Successfully imported ${importedCourses.length} courses`,
      courseIds: importedCourses
    };
  } catch (error) {
    console.error('Error importing courses from JSON:', error);
    return {
      success: false,
      message: 'Failed to import courses from JSON',
      error: error
    };
  }
};
