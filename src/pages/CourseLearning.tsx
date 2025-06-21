import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  ChevronDown, 
  ChevronRight, 
  Play, 
  FileText, 
  MessageCircle,
  Download,
  Bookmark,
  Share2,
  Clock,
  Users,
  BookOpen,
  CheckCircle,
  PlayCircle
} from 'lucide-react';
import { getCourse } from '../services/courseService';
import { Course } from '../types';

const CourseLearning = () => {
  const { courseId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedModules, setExpandedModules] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) return;
      
      try {
        setLoading(true);
        const courseData = await getCourse(courseId);
        setCourse(courseData);
        
        if (courseData && courseData.modules && courseData.modules.length > 0) {
          const firstModule = courseData.modules[0];
          setExpandedModules([firstModule.id]);
          if (firstModule.lessons && firstModule.lessons.length > 0) {
            setCurrentLesson({
              moduleId: firstModule.id,
              lessonId: firstModule.lessons[0].id
            });
          }
        }
      } catch (error) {
        console.error('Error loading course:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId]);

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const selectLesson = (moduleId, lessonId) => {
    setCurrentLesson({ moduleId, lessonId });
  };

  const getCurrentLesson = () => {
    if (!course || !currentLesson) return null;
    
    const module = course.modules?.find(m => m.id === currentLesson.moduleId);
    if (!module) return null;
    
    const lesson = module.lessons?.find(l => l.id === currentLesson.lessonId);
    return lesson || null;
  };

  const getVideoEmbedUrl = (videoUrl) => {
    if (!videoUrl) return null;
    if (videoUrl.includes('youtube.com/watch?v=')) {
      const videoId = videoUrl.split('v=')[1]?.split('&')[0];
      return 'https://www.youtube.com/embed/' + videoId;
    } else if (videoUrl.includes('youtu.be/')) {
      const videoId = videoUrl.split('/').pop();
      return 'https://www.youtube.com/embed/' + videoId;
    }
    return videoUrl;
  };

  const currentLessonData = getCurrentLesson();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h2>
          <p className="text-gray-600">The requested course could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar - Course Content */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Course Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{course.title}</h2>
              <p className="text-sm text-gray-500">by {course.instructor || 'Unknown'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{course.duration || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-4 h-4" />
              <span>{course.level || 'Beginner'}</span>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>0%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '0%' }}></div>
            </div>
          </div>
        </div>

        {/* Modules List */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Course Content</h3>
          <div className="space-y-2">
            {course.modules?.map((module, moduleIndex) => (
              <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full p-4 text-left bg-white hover:bg-gray-50 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                      {moduleIndex + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{module.title}</p>
                      <p className="text-xs text-gray-500">{module.lessons?.length || 0} lessons</p>
                    </div>
                  </div>
                  {expandedModules.includes(module.id) ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {expandedModules.includes(module.id) && (
                  <div className="bg-gray-50 border-t border-gray-200">
                    {module.lessons?.map((lesson) => {
                      const isActive = currentLesson?.lessonId === lesson.id && currentLesson?.moduleId === module.id;
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => selectLesson(module.id, lesson.id)}
                          className={'w-full p-3 text-left flex items-center gap-3 hover:bg-white transition-colors ' + (isActive ? 'bg-indigo-50 border-r-4 border-indigo-600' : '')}
                        >
                          <div className="flex-shrink-0">
                            {isActive ? (
                              <PlayCircle className="w-5 h-5 text-indigo-600" />
                            ) : (
                              <Play className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{lesson.title}</p>
                            <p className="text-xs text-gray-500">{lesson.duration || '5:00'}</p>
                          </div>
                          <CheckCircle className="w-4 h-4 text-gray-300" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Video Player Section */}
        <div className="bg-black relative">
          <div className="aspect-video bg-gray-900 flex items-center justify-center">
            {currentLessonData && currentLessonData.videoUrl ? (
              <iframe
                src={getVideoEmbedUrl(currentLessonData.videoUrl)}
                title={currentLessonData.title}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            ) : (
              <div className="text-center text-white p-8">
                <PlayCircle className="w-20 h-20 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">Welcome to the Course</h3>
                <p className="text-gray-400">Select a lesson from the sidebar to start learning</p>
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 bg-white">
          <div className="max-w-4xl mx-auto p-6">
            {/* Lesson Title */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {currentLessonData?.title || course.title}
              </h1>
              <p className="text-gray-600">
                {currentLessonData?.description || course.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 mb-8">
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                <Bookmark className="w-4 h-4" />
                Bookmark
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" />
                Resources
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'overview', label: 'Overview', icon: FileText },
                  { id: 'notes', label: 'Notes', icon: FileText },
                  { id: 'discussion', label: 'Discussion', icon: MessageCircle }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={'py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ' + (activeTab === tab.id ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300')}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="prose max-w-none">
              {activeTab === 'overview' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">About this lesson</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {currentLessonData?.content || currentLessonData?.description || 
                     'This lesson will cover important concepts and practical applications. Make sure to take notes and practice the examples shown in the video.'}
                  </p>
                </div>
              )}

              {activeTab === 'notes' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Lesson Notes</h3>
                  {currentLessonData?.content ? (
                    <div dangerouslySetInnerHTML={{ __html: currentLessonData.content }} />
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No notes available for this lesson yet.</p>
                      <p className="text-sm">Notes will be added as the course develops.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'discussion' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Discussion</h3>
                  <div className="text-center py-12">
                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No discussions yet</h4>
                    <p className="text-gray-600 mb-6">Be the first to start a discussion about this lesson!</p>
                    <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                      Start Discussion
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseLearning;
