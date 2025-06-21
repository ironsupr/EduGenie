import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  Search, 
  Filter, 
  Clock, 
  Users, 
  Star, 
  Play, 
  BookOpen, 
  Grid, 
  List,
  Youtube,
  Plus,
  ChevronRight,
  Sparkles,
  Zap,
  Target,
  Globe,
  Heart,
  ArrowRight,
  CheckCircle,
  Trophy,
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DuplicateManager from '../components/DuplicateManager';

const SuperSimpleCourses = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAdmin, setShowAdmin] = useState(false);
  
  const { currentUser } = useAuth();

  const categories = ['All', 'Programming', 'Mathematics', 'Science', 'Business', 'Design', 'Language', 'Other'];

  // Demo courses for showcase when no real courses exist
  const demoCourses = [
    {
      id: 'demo-1',
      title: 'Complete Web Development Bootcamp',
      description: 'Master HTML, CSS, JavaScript, React, Node.js and become a full-stack developer. Build real-world projects and launch your career.',
      instructor: 'Sarah Johnson',
      category: 'Programming',
      level: 'Beginner',
      duration: '12h 30m',
      studentsCount: 15420,
      rating: 4.9,
      price: 0,
      lessons: 45,
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop',
      isDemo: true
    },
    {
      id: 'demo-2',
      title: 'Advanced Machine Learning with Python',
      description: 'Deep dive into ML algorithms, neural networks, and AI. Learn TensorFlow, PyTorch, and build intelligent applications.',
      instructor: 'Dr. Michael Chen',
      category: 'Programming',
      level: 'Advanced',
      duration: '18h 45m',
      studentsCount: 8920,
      rating: 4.8,
      price: 89,
      lessons: 60,
      imageUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&h=250&fit=crop',
      isDemo: true
    },
    {
      id: 'demo-3',
      title: 'Digital Marketing Mastery',
      description: 'Learn SEO, social media marketing, Google Ads, content marketing, and analytics. Grow your business online.',
      instructor: 'Emma Williams',
      category: 'Business',
      level: 'Intermediate',
      duration: '9h 20m',
      studentsCount: 12350,
      rating: 4.7,
      price: 59,
      lessons: 32,
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop',
      isDemo: true
    },
    {
      id: 'demo-4',
      title: 'UI/UX Design Fundamentals',
      description: 'Create beautiful, user-friendly interfaces. Learn design principles, Figma, prototyping, and user research.',
      instructor: 'Alex Rodriguez',
      category: 'Design',
      level: 'Beginner',
      duration: '15h 10m',
      studentsCount: 9870,
      rating: 4.9,
      price: 0,
      lessons: 38,
      imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop',
      isDemo: true
    },
    {
      id: 'demo-5',
      title: 'Data Science with R',
      description: 'Analyze data, create visualizations, and build predictive models. Master statistical analysis and data storytelling.',
      instructor: 'Prof. Lisa Zhang',
      category: 'Science',
      level: 'Intermediate',
      duration: '14h 55m',
      studentsCount: 6540,
      rating: 4.8,
      price: 79,
      lessons: 42,
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
      isDemo: true
    },
    {
      id: 'demo-6',
      title: 'Spanish for Beginners',
      description: 'Speak Spanish confidently with interactive lessons, cultural insights, and practical conversation practice.',
      instructor: 'Carlos Mendoza',
      category: 'Language',
      level: 'Beginner',
      duration: '8h 30m',
      studentsCount: 18750,
      rating: 4.9,
      price: 49,
      lessons: 28,
      imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop',
      isDemo: true
    }
  ];
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        console.log('Fetching courses...');
        const coursesRef = collection(db, 'courses');
        const snapshot = await getDocs(coursesRef);
        
        console.log('Found', snapshot.size, 'courses');
        
        const coursesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // If no real courses found, use demo courses for showcase
        const allCourses = coursesData.length > 0 ? coursesData : demoCourses;
        
        setCourses(allCourses);
        setFilteredCourses(allCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
        // Fallback to demo courses if there's an error
        setCourses(demoCourses);
        setFilteredCourses(demoCourses);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Filter courses when search term or category changes
  useEffect(() => {
    let filtered = courses;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(course => 
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCourses(filtered);
  }, [courses, searchTerm, selectedCategory]);
  const CourseCard = ({ course }: { course: any }) => (
    <div className="group bg-white rounded-3xl shadow-xl hover:shadow-3xl transition-all duration-700 overflow-hidden transform hover:-translate-y-3 relative">
      {/* Gradient border effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-purple-600/0 to-pink-600/0 group-hover:from-blue-600/20 group-hover:via-purple-600/20 group-hover:to-pink-600/20 rounded-3xl transition-all duration-700"></div>
      
      <div className="relative overflow-hidden rounded-t-3xl">
        <img
          src={course.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop'}
          alt={course.title}
          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 via-purple-600/0 to-transparent group-hover:from-blue-600/30 group-hover:via-purple-600/20 transition-all duration-500" />
        
        {/* Enhanced play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
          <div className="bg-white/95 backdrop-blur-sm rounded-full p-4 transform scale-50 group-hover:scale-100 transition-all duration-500 shadow-2xl">
            <Play className="h-10 w-10 text-blue-600 ml-1" fill="currentColor" />
          </div>
        </div>
        
        {/* Enhanced badges */}
        <div className="absolute top-6 right-6">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl backdrop-blur-sm">
            {course.price === 0 || !course.price ? 'FREE' : `$${course.price}`}
          </span>
        </div>
        
        <div className="absolute top-6 left-6">
          <span className="bg-white/95 backdrop-blur-sm text-gray-800 px-4 py-2 rounded-full text-sm font-bold shadow-lg">
            {course.category || 'General'}
          </span>
        </div>

        {/* Level indicator */}
        <div className="absolute bottom-6 left-6">
          <div className="flex items-center space-x-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
            <Target className="h-4 w-4 text-white" />
            <span className="text-white text-sm font-medium">{course.level || 'Beginner'}</span>
          </div>
        </div>
      </div>
      
      <div className="p-8 relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-yellow-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-current" />
            ))}
            <span className="text-lg font-bold text-gray-700 ml-2">
              {course.rating || '4.9'}
            </span>
          </div>
          <div className="flex items-center space-x-1 text-gray-500">
            <Globe className="h-4 w-4" />
            <span className="text-sm">Online</span>
          </div>
        </div>
        
        <h3 className="text-2xl font-black text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 leading-tight">
          {course.title}
        </h3>
        
        <p className="text-gray-600 text-base mb-6 line-clamp-2 leading-relaxed">
          {course.description || 'Master new skills with this comprehensive, expert-designed course that will transform your learning journey.'}
        </p>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-lg font-bold">
                {course.instructor?.charAt(0) || 'E'}
              </span>
            </div>
            <div>
              <div className="text-base font-bold text-gray-900">
                {course.instructor || 'Expert Instructor'}
              </div>
              <div className="text-sm text-gray-500">Course Creator</div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-2xl">
          <div className="flex items-center space-x-1 text-gray-600">
            <Clock className="h-5 w-5" />
            <span className="font-medium">{course.duration || '2h 30m'}</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-600">
            <Users className="h-5 w-5" />
            <span className="font-medium">{course.studentsCount || 0} students</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-600">
            <BookOpen className="h-5 w-5" />
            <span className="font-medium">{course.lessons || 12} lessons</span>
          </div>
        </div>
          {course.isDemo ? (
          <div className="w-full bg-gradient-to-r from-gray-400 to-gray-500 text-white py-4 px-6 rounded-2xl font-bold text-lg text-center flex items-center justify-center space-x-3 shadow-xl cursor-not-allowed opacity-75">
            <BookOpen className="h-6 w-6" />
            <span>Demo Course</span>
            <Sparkles className="h-6 w-6" />
          </div>
        ) : (
          <Link
            to={`/course/${course.id}`}
            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white py-4 px-6 rounded-2xl transition-all duration-500 font-bold text-lg text-center flex items-center justify-center space-x-3 group/btn shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            <BookOpen className="h-6 w-6" />
            <span>Start Learning</span>
            <ArrowRight className="h-6 w-6 transform group-hover/btn:translate-x-2 transition-transform duration-300" />
          </Link>
        )}
      </div>
    </div>
  );
  const CourseListItem = ({ course }: { course: any }) => (
    <div className="group bg-white rounded-3xl shadow-xl hover:shadow-3xl transition-all duration-500 p-8 flex items-center space-x-8 relative overflow-hidden">
      {/* Gradient border effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-purple-600/0 to-pink-600/0 group-hover:from-blue-600/10 group-hover:via-purple-600/10 group-hover:to-pink-600/10 transition-all duration-500"></div>
      
      <div className="relative flex-shrink-0">
        <div className="relative overflow-hidden rounded-2xl">
          <img
            src={course.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=180&fit=crop'}
            alt={course.title}
            className="w-48 h-32 object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/20 group-hover:to-purple-600/20 transition-all duration-500" />
          
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="bg-white/95 backdrop-blur-sm rounded-full p-2 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-xl">
              <Play className="h-6 w-6 text-blue-600 ml-0.5" fill="currentColor" />
            </div>
          </div>

          {/* Price badge */}
          <div className="absolute top-3 right-3">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              {course.price === 0 || !course.price ? 'FREE' : `$${course.price}`}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 min-w-0 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-6">
            <div className="flex items-center space-x-3 mb-3">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-sm font-bold uppercase tracking-wide">
                {course.category || 'General'}
              </span>
              <span className="text-gray-300">•</span>
              <div className="flex items-center space-x-1">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">{course.level || 'Beginner'}</span>
              </div>
              <span className="text-gray-300">•</span>
              <div className="flex items-center space-x-1">
                <Globe className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Online</span>
              </div>
            </div>
            
            <h3 className="text-3xl font-black text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300 leading-tight">
              {course.title}
            </h3>
            
            <p className="text-gray-600 text-lg mb-4 line-clamp-2 leading-relaxed">
              {course.description || 'Master new skills with this comprehensive, expert-designed course that will transform your learning journey.'}
            </p>
            
            <div className="flex items-center space-x-8 text-base text-gray-600 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm font-bold">
                    {course.instructor?.charAt(0) || 'E'}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-gray-900">{course.instructor || 'Expert Instructor'}</div>
                  <div className="text-sm text-gray-500">Course Creator</div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="font-medium">{course.duration || '2h 30m'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-5 w-5 text-green-600" />
                <span className="font-medium">{course.studentsCount || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                ))}
                <span className="font-bold ml-1">{course.rating || '4.9'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-4 ml-8">
            <div className="text-right">
              <div className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {course.price === 0 || !course.price ? 'FREE' : `$${course.price}`}
              </div>
              <div className="text-sm text-gray-500 font-medium">One-time payment</div>
            </div>            {course.isDemo ? (
              <div className="bg-gradient-to-r from-gray-400 to-gray-500 text-white py-3 px-8 rounded-2xl font-bold text-lg flex items-center space-x-3 shadow-xl cursor-not-allowed opacity-75">
                <BookOpen className="h-5 w-5" />
                <span>Demo Course</span>
                <Sparkles className="h-5 w-5" />
              </div>
            ) : (
              <Link
                to={`/course/${course.id}`}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white py-3 px-8 rounded-2xl transition-all duration-500 font-bold text-lg flex items-center space-x-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 group/btn"
              >
                <BookOpen className="h-5 w-5" />
                <span>Enroll Now</span>
                <ArrowRight className="h-5 w-5 transform group-hover/btn:translate-x-1 transition-transform duration-300" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* Enhanced Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white overflow-hidden">
        {/* Animated background patterns */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-600/20 to-transparent rounded-full animate-pulse"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-600/20 to-transparent rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-float-delayed"></div>
        </div>

        {/* Background geometric patterns */}
        <div className="absolute inset-0 opacity-5">
          <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            {/* Enhanced title with better typography */}
            <div className="mb-8">
              <div className="inline-flex items-center justify-center p-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
                <Sparkles className="h-6 w-6 text-yellow-300 mr-2" />
                <span className="text-lg font-semibold text-white/90">Welcome to EduGenie</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                  Learn
                </span>
                <br />
                <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-blue-300 bg-clip-text text-transparent">
                  Without Limits
                </span>
              </h1>
            </div>
            
            <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto text-blue-100/90 leading-relaxed font-light">
              Discover world-class courses from expert instructors. Build skills, advance your career, 
              and unlock your potential with our comprehensive learning platform.
            </p>
            
            {/* Enhanced CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
              {currentUser && (
                <>
                  <Link
                    to="/youtube-import"
                    className="group relative bg-white text-blue-900 px-10 py-5 rounded-2xl hover:bg-blue-50 transition-all duration-500 font-bold flex items-center space-x-3 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/5 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <Youtube className="w-7 h-7 text-red-500 relative z-10" />
                    <span className="relative z-10 text-lg">Import from YouTube</span>
                    <ArrowRight className="w-5 h-5 relative z-10 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                  <Link
                    to="/courses/create"
                    className="group relative bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-10 py-5 rounded-2xl hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 transition-all duration-500 font-bold flex items-center space-x-3 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300"></div>
                    <Plus className="w-7 h-7 relative z-10" />
                    <span className="relative z-10 text-lg">Create Course</span>
                    <Zap className="w-5 h-5 relative z-10 animate-pulse" />
                  </Link>
                </>
              )}
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">{courses.length}+</div>
                <div className="text-blue-200 text-sm uppercase tracking-wide">Courses</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">10k+</div>
                <div className="text-blue-200 text-sm uppercase tracking-wide">Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">4.9</div>
                <div className="text-blue-200 text-sm uppercase tracking-wide">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">95%</div>
                <div className="text-blue-200 text-sm uppercase tracking-wide">Success Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg className="relative block w-full h-16" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39C398.88,31.83,313.53,70.53,226.84,92.83c-33.22,8.57-68.48,15.37-104.6,19.88v7.29H1200V92.83C1146.07,83.48,1013.25,92.83,985.66,92.83z" fill="#f8fafc"></path>
          </svg>
        </div>
      </div>      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Enhanced Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 -mt-8">
          <div className="group bg-white rounded-3xl shadow-xl p-8 text-center relative overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                <BookOpen className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-4xl font-black text-gray-900 mb-3">{courses.length}</h3>
              <p className="text-gray-600 font-semibold text-lg">Expert Courses</p>
              <div className="mt-4 flex items-center justify-center space-x-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">All Verified</span>
              </div>
            </div>
          </div>
          
          <div className="group bg-white rounded-3xl shadow-xl p-8 text-center relative overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-4xl font-black text-gray-900 mb-3">
                {courses.reduce((acc, course) => acc + (course.studentsCount || 0), 0).toLocaleString()}
              </h3>
              <p className="text-gray-600 font-semibold text-lg">Happy Students</p>
              <div className="mt-4 flex items-center justify-center space-x-1">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600 font-medium">Worldwide</span>
              </div>
            </div>
          </div>
          
          <div className="group bg-white rounded-3xl shadow-xl p-8 text-center relative overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-violet-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="bg-gradient-to-br from-purple-500 to-violet-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-4xl font-black text-gray-900 mb-3">
                {Math.round((courses.reduce((acc, course) => acc + (course.rating || 4.5), 0) / courses.length) * 10) / 10 || 4.5}
              </h3>
              <p className="text-gray-600 font-semibold text-lg">Average Rating</p>
              <div className="mt-4 flex items-center justify-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>            </div>
          </div>
        </div>

        {/* Admin Tools Section - Only for authenticated users */}
        {currentUser && (
          <div className="mb-16">
            <div className="bg-gray-50 rounded-3xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 w-12 h-12 rounded-xl flex items-center justify-center">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Admin Tools</h3>
                    <p className="text-gray-600">Manage your course library</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAdmin(!showAdmin)}
                  className="bg-white text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-100 transition-all duration-300 font-semibold flex items-center space-x-2 shadow-md"
                >
                  <span>{showAdmin ? 'Hide' : 'Show'} Tools</span>
                  {showAdmin ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
              </div>

              {showAdmin && (
                <div className="mt-6">
                  <DuplicateManager />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Search and Filters */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 rounded-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-10 mb-16 border border-white/20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Find Your Perfect Course</h2>
              <p className="text-gray-600 text-lg">Search through our extensive library of expert-led courses</p>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Enhanced Search */}
              <div className="flex-1">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6 z-10" />
                  <input
                    type="text"
                    placeholder="Search courses, instructors, or topics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="relative w-full pl-14 pr-6 py-5 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg font-medium bg-white/90 backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Enhanced Category Filter */}
              <div className="lg:w-72">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Filter className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="relative w-full pl-14 pr-6 py-5 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-lg font-medium bg-white/90 backdrop-blur-sm appearance-none cursor-pointer"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-6 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 h-5 w-5 pointer-events-none" />
                </div>
              </div>

              {/* Enhanced View Toggle */}
              <div className="flex items-center space-x-3 bg-gray-100 rounded-2xl p-3">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-4 rounded-xl transition-all duration-300 ${
                    viewMode === 'grid' 
                      ? 'bg-white shadow-lg text-blue-600 scale-105' 
                      : 'hover:bg-gray-200 text-gray-600 hover:scale-105'
                  }`}
                >
                  <Grid className="h-6 w-6" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-4 rounded-xl transition-all duration-300 ${
                    viewMode === 'list' 
                      ? 'bg-white shadow-lg text-blue-600 scale-105' 
                      : 'hover:bg-gray-200 text-gray-600 hover:scale-105'
                  }`}
                >
                  <List className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {loading ? 'Loading courses...' : `${filteredCourses.length} Courses Available`}
            </h2>
            <p className="text-gray-600 mt-1">
              {searchTerm && `Results for "${searchTerm}"`}
              {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            </p>
          </div>
        </div>        {/* Enhanced Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-3xl shadow-xl overflow-hidden animate-pulse">
                <div className="w-full h-56 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse"></div>
                <div className="p-8">
                  <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg mb-4 animate-pulse"></div>
                  <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg mb-4 animate-pulse"></div>
                  <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg mb-6 animate-pulse"></div>
                  <div className="h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-2xl animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Courses Display */}
        {!loading && (
          <>
            {filteredCourses.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
              <div className="text-center py-24">
                <div className="relative mb-8">
                  <div className="bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 animate-pulse"></div>
                    <BookOpen className="h-16 w-16 text-gray-400 relative z-10" />
                  </div>
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
                    <Sparkles className="h-8 w-8 text-yellow-400 animate-pulse" />
                  </div>
                </div>
                
                <h3 className="text-4xl font-black text-gray-900 mb-6">
                  {searchTerm || selectedCategory !== 'All' 
                    ? 'No matching courses found' 
                    : 'Your learning journey starts here'
                  }
                </h3>
                
                <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                  {searchTerm || selectedCategory !== 'All'
                    ? 'Try adjusting your search filters or explore different categories to find the perfect course for you.'
                    : 'Start building your course library by importing from YouTube or creating new courses. The possibilities are endless!'
                  }
                </p>
                
                {currentUser && (
                  <div className="flex flex-col sm:flex-row items-center justify-center space-y-6 sm:space-y-0 sm:space-x-6">
                    <Link
                      to="/youtube-import"
                      className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-500 font-bold text-lg flex items-center space-x-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-2"
                    >
                      <Youtube className="h-6 w-6" />
                      <span>Import from YouTube</span>
                      <ArrowRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                    <Link
                      to="/courses/create"
                      className="group bg-white text-gray-900 px-10 py-4 rounded-2xl hover:bg-gray-50 transition-all duration-500 font-bold text-lg border-2 border-gray-200 hover:border-gray-300 flex items-center space-x-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-2"
                    >
                      <Plus className="h-6 w-6" />
                      <span>Create Course</span>
                      <Zap className="h-5 w-5 transform group-hover:scale-110 transition-transform duration-300" />
                    </Link>
                  </div>
                )}
                
                {!currentUser && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 max-w-lg mx-auto">
                    <h4 className="text-xl font-bold text-gray-900 mb-3">Ready to get started?</h4>
                    <p className="text-gray-600 mb-4">Sign in to create and import courses</p>
                    <Link
                      to="/auth"
                      className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SuperSimpleCourses;
