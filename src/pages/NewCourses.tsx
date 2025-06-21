import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, Users, Star, Play, BookOpen, Grid, List } from 'lucide-react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Course } from '../types';

const NewCourses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const { currentUser } = useAuth();

  const categories = ['All', 'Programming', 'Mathematics', 'Science', 'Business', 'Design', 'Language', 'Other'];
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  // Test Firebase connection on component mount
  useEffect(() => {
    console.log('NewCourses component mounted');
    console.log('Current user:', currentUser);
    console.log('Firebase db:', db);
    console.log('Environment mode:', import.meta.env.MODE);
  }, [currentUser]);
  // Load courses on mount
  useEffect(() => {
    // Test with static data first
    const staticCourses: Course[] = [
      {
        id: 'static-1',
        title: 'Static Test Course 1',
        description: 'This is a static test course to verify UI rendering',
        instructor: 'Static Instructor',
        instructorId: 'static-instructor',
        category: 'Programming',
        level: 'Beginner',
        price: 0,
        duration: '2 hours',
        rating: 4.5,
        studentsCount: 100,
        imageUrl: 'https://via.placeholder.com/400x300?text=Static+Course',
        modules: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublished: true
      }
    ];
    
    console.log('Setting static courses for testing...');
    setCourses(staticCourses);
    setLoading(false);
    
    // Load real courses after a delay
    setTimeout(() => {
      loadCourses();
    }, 2000);
  }, []);

  // Filter courses when search/filter changes
  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, selectedCategory, selectedLevel]);  const loadCourses = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading courses directly from Firebase...');
      
      // Get all courses directly from Firebase
      const coursesRef = collection(db, 'courses');
      const snapshot = await getDocs(coursesRef);
      
      console.log('📚 Found courses in Firebase:', snapshot.size);
      
      const coursesData: Course[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const course: Course = {
          id: doc.id,
          title: data.title || '',
          description: data.description || '',
          instructor: data.instructor || '',
          instructorId: data.instructorId || '',
          category: data.category || 'Other',
          level: data.level || 'Beginner',
          price: typeof data.price === 'number' ? data.price : 0,
          duration: data.duration || '0m',
          rating: typeof data.rating === 'number' ? data.rating : 0,
          studentsCount: typeof data.studentsCount === 'number' ? data.studentsCount : 0,
          imageUrl: data.imageUrl || 'https://via.placeholder.com/400x300?text=Course+Image',
          modules: Array.isArray(data.modules) ? data.modules : [],
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
          isPublished: Boolean(data.isPublished)
        };
        console.log('✅ Processed course:', course.title, 'Published:', course.isPublished);
        coursesData.push(course);
      });
      
      console.log('📊 Total processed courses:', coursesData.length);
      setCourses(coursesData);
      console.log('✅ Courses state updated');
    } catch (error) {
      console.error('❌ Error loading courses:', error);
    } finally {
      setLoading(false);
      console.log('🏁 Loading completed');
    }
  };

  const filterCourses = () => {
    let filtered = [...courses];

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    // Filter by level
    if (selectedLevel !== 'All') {
      filtered = filtered.filter(course => course.level === selectedLevel);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCourses(filtered);
  };
  const handleCreateTestCourse = async () => {
    try {
      console.log('🧪 Creating test course...');
      
      const testCourse = {
        title: `Test Course - ${new Date().toLocaleTimeString()}`,
        description: 'This is a test course created to verify the system is working properly.',
        instructor: 'Test Instructor',
        instructorId: 'test-instructor-' + Date.now(),
        category: 'Programming',
        level: 'Beginner',
        price: 0,
        duration: '2 hours',
        rating: 4.5,
        studentsCount: 42,
        imageUrl: 'https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Test+Course',
        modules: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublished: true
      };
      
      const docRef = await addDoc(collection(db, 'courses'), testCourse);
      console.log('✅ Test course created with ID:', docRef.id);
      
      loadCourses(); // Refresh courses
    } catch (error) {
      console.error('❌ Error creating test course:', error);
    }
  };

  const CourseCard = ({ course }: { course: Course }) => (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="relative">
        <img
          src={course.imageUrl || 'https://via.placeholder.com/400x300?text=Course+Image'}
          alt={course.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
          <Play className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded-full text-sm font-semibold">
          {course.price === 0 ? 'Free' : `$${course.price}`}
        </div>
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
            course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {course.level}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-2">
          <span className="text-sm text-blue-600 font-medium">{course.category}</span>
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {course.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {course.description}
        </p>
        
        <div className="text-sm text-gray-700 mb-4">
          By <span className="font-medium">{course.instructor}</span>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">{course.rating || 0}</span>
            <span className="text-gray-400 text-sm">({course.studentsCount || 0})</span>
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <Clock className="h-4 w-4 mr-1" />
            {course.duration}
          </div>
        </div>
        
        <Link
          to={`/course/${course.id}`}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium flex items-center justify-center space-x-2"
        >
          <BookOpen className="h-4 w-4" />
          <span>Start Learning</span>
        </Link>
      </div>
    </div>
  );

  const CourseListItem = ({ course }: { course: Course }) => (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 flex">
      <img
        src={course.imageUrl || 'https://via.placeholder.com/200x120?text=Course'}
        alt={course.title}
        className="w-32 h-20 object-cover rounded-lg mr-6"
      />
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm text-blue-600 font-medium">{course.category}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {course.level}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
              {course.title}
            </h3>
            
            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
              {course.description}
            </p>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>By {course.instructor}</span>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span>{course.rating || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{course.studentsCount || 0}</span>
              </div>
            </div>
          </div>
          
          <div className="ml-6 flex flex-col items-end space-y-2">
            <div className="text-lg font-bold text-blue-600">
              {course.price === 0 ? 'Free' : `$${course.price}`}
            </div>
            <Link
              to={`/course/${course.id}`}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
            >
              <BookOpen className="h-4 w-4" />
              <span>Start Learning</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover Amazing <span className="text-yellow-300">Courses</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Learn from industry experts and advance your skills with our comprehensive course library
            </p>
            {currentUser && (
              <div className="flex justify-center space-x-4">
                <Link
                  to="/courses/create"
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-bold flex items-center space-x-2"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Create Course</span>
                </Link>
                <Link
                  to="/youtube-import"
                  className="bg-yellow-500 text-white px-8 py-3 rounded-lg hover:bg-yellow-600 transition-colors font-bold"
                >
                  Import from YouTube
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search courses, instructors, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {loading ? 'Loading courses...' : `Showing ${filteredCourses.length} of ${courses.length} courses`}
          </p>
          {currentUser && (
            <div className="flex space-x-2">
              <button
                onClick={handleCreateTestCourse}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Add Test Course
              </button>
              <Link
                to="/youtube-import"
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Import from YouTube
              </Link>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
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
        )}

        {/* Courses Grid/List */}
        {!loading && (
          <>
            {filteredCourses.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map(course => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredCourses.map(course => (
                    <CourseListItem key={course.id} course={course} />
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <BookOpen className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || selectedCategory !== 'All' || selectedLevel !== 'All'
                    ? 'Try adjusting your search filters'
                    : 'No courses available yet'
                  }
                </p>
                {currentUser && (
                  <div className="space-x-4">
                    <Link
                      to="/courses/create"
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Create First Course
                    </Link>
                    <Link
                      to="/youtube-import"
                      className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors font-medium"
                    >
                      Import from YouTube
                    </Link>
                  </div>
                )}
              </div>
            )}
          </>
        )}        {/* Debug Info (only in development) */}
        {import.meta.env.MODE === 'development' && (
          <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-bold text-yellow-800 mb-2">Debug Info</h3>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>Total courses loaded: {courses.length}</p>
              <p>Filtered courses: {filteredCourses.length}</p>
              <p>Loading: {loading ? 'Yes' : 'No'}</p>
              <p>Selected category: {selectedCategory}</p>
              <p>Selected level: {selectedLevel}</p>
              <p>Search term: {searchTerm || 'None'}</p>
              {courses.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Course titles:</p>
                  <ul className="list-disc list-inside ml-2">
                    {courses.slice(0, 5).map(course => (
                      <li key={course.id}>{course.title} ({course.category})</li>
                    ))}
                    {courses.length > 5 && <li>... and {courses.length - 5} more</li>}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewCourses;
