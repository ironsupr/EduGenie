import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Clock, Users, Star, Play, BookOpen } from 'lucide-react';
import { getCourses, enrollInCourse, getAllCoursesDebug, createTestCourse } from '../services/courseService';
import { useAuth } from '../contexts/AuthContext';
import { Course } from '../types';
import { db } from '../config/firebase';

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  
  const { currentUser } = useAuth();

  const categories = ['All', 'Programming', 'Mathematics', 'Science', 'Business', 'Design', 'Language', 'Other'];
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    console.log('useEffect triggered - loading courses...');
    loadCourses();
  }, [selectedCategory, selectedLevel, searchTerm]);

  // Test Firebase connection on component mount
  useEffect(() => {
    console.log('Courses component mounted');
    console.log('Current user:', currentUser);
    console.log('Firebase db:', db);
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      console.log('=== loadCourses called ===');
      console.log('Loading courses with filters:', { 
        category: selectedCategory, 
        level: selectedLevel, 
        search: searchTerm 
      });
      
      // Debug: Also get all courses to see what's in the database
      console.log('Calling getAllCoursesDebug...');
      const allCourses = await getAllCoursesDebug();
      console.log('DEBUG - All courses in DB:', allCourses.length, allCourses);
      
      console.log('Calling getCourses...');
      const fetchedCourses = await getCourses(
        selectedCategory !== 'All' ? selectedCategory : undefined,
        selectedLevel !== 'All' ? selectedLevel : undefined,
        searchTerm || undefined
      );
      
      console.log('Fetched courses:', fetchedCourses.length, fetchedCourses);
      setCourses(fetchedCourses);
      console.log('State updated with courses');
      console.log('=== loadCourses completed ===');
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    if (!currentUser) {
      // Show auth modal or redirect to login
      return;
    }

    try {
      setEnrolling(courseId);
      await enrollInCourse(currentUser.uid, courseId);
      // Show success message or redirect to course
    } catch (error) {
      console.error('Error enrolling in course:', error);
    } finally {
      setEnrolling(null);
    }
  };

  const handleCreateTestCourse = async () => {
    try {
      console.log('Creating test course...');
      const courseId = await createTestCourse();
      console.log('Test course created with ID:', courseId);
      loadCourses(); // Refresh the courses list
    } catch (error) {
      console.error('Error creating test course:', error);
    }
  };

  const handleDebugAllCourses = async () => {
    try {
      console.log('Getting all courses for debugging...');
      const allCourses = await getAllCoursesDebug();
      console.log('All courses:', allCourses);
      // Force update the displayed courses with debug data
      setCourses(allCourses);
    } catch (error) {
      console.error('Error in debug function:', error);
    }
  };

  // Simple test to render hardcoded courses
  const [testCourses] = useState([
    {
      id: 'test-1',
      title: 'Test Course 1',
      description: 'This is a test course',
      instructor: 'Test Instructor',
      instructorId: 'test-instructor',
      category: 'Programming',
      level: 'Beginner' as const,
      price: 0,
      duration: '2 hours',
      rating: 4.5,
      studentsCount: 100,
      imageUrl: 'https://via.placeholder.com/400x300',
      modules: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublished: true
    }
  ]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Explore Our <span className="text-blue-600">Courses</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover world-class courses taught by industry experts and unlock your potential.
              </p>
            </div>
            {currentUser && (
              <div className="flex space-x-4">
                <Link
                  to="/courses/create"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-lg"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Create Course</span>
                </Link>
                <button
                  onClick={handleCreateTestCourse}
                  className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2 shadow-lg"
                >
                  <span>Create Test Course</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search courses or instructors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-3 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div className="lg:w-48">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full py-3 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {loading ? 'Loading...' : `Showing ${courses.length} courses`}
          </p>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-gray-300"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="h-10 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Use test courses temporarily to check if rendering works */}
            {testCourses.map(course => (
              <div key={course.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-2">
                <div className="relative">
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-semibold text-gray-900">
                    ${course.price}
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all flex items-center justify-center">
                    <Play className="h-12 w-12 text-white opacity-0 hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                      course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {course.level}
                    </span>
                    <span className="text-sm text-gray-500">{course.category}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  
                  <div className="text-sm text-gray-600 mb-4">
                    By {course.instructor}
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{course.rating}</span>
                      <span className="text-gray-400 text-sm">({course.studentsCount.toLocaleString()})</span>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock className="h-4 w-4 mr-1" />
                      {course.duration}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleEnroll(course.id)}
                    disabled={enrolling === course.id}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all text-center font-semibold flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>{enrolling === course.id ? 'Enrolling...' : 'Start Learning'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && courses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <BookOpen className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">Try adjusting your search filters</p>
          </div>
        )}

        {/* Debug Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Debug Options</h2>
          <div className="flex space-x-4">
            <button
              onClick={handleCreateTestCourse}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 shadow-lg"
            >
              <Star className="w-5 h-5" />
              <span>Create Test Course</span>
            </button>
            <button
              onClick={handleDebugAllCourses}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 shadow-lg"
            >
              <Star className="w-5 h-5" />
              <span>Load All Courses (Debug)</span>
            </button>
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-yellow-100 p-4 rounded mb-8">
          <h3 className="font-bold">Debug Info:</h3>
          <p>Loading: {loading ? 'Yes' : 'No'}</p>
          <p>Courses count: {courses.length}</p>
          <p>Courses data: {JSON.stringify(courses.map(c => ({ id: c.id, title: c.title, category: c.category })), null, 2)}</p>
          <p>Selected Category: {selectedCategory}</p>
          <p>Selected Level: {selectedLevel}</p>
          <p>Search Term: {searchTerm || 'None'}</p>
        </div>
      </div>
    </div>
  );
};

export default Courses;