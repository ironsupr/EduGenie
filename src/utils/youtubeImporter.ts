import { Course, Module, Lesson } from '../types';
import { createCourse } from '../services/courseServiceNew';
import { 
  fetchPlaylistDetails, 
  fetchVideoDetails, 
  parseYouTubeUrl,
  YouTubePlaylist,
  YouTubeVideo 
} from '../services/youtubeService';

/**
 * Convert YouTube playlist to Course structure
 */
export const convertPlaylistToCourse = (
  playlist: YouTubePlaylist,
  instructorId: string,
  instructorName: string,
  customData?: Partial<Course>
): Omit<Course, 'id'> => {
  // Create modules from videos (group every 5-10 videos into a module)
  const videosPerModule = 8;
  const modules: Module[] = [];
  
  for (let i = 0; i < playlist.videos.length; i += videosPerModule) {
    const moduleVideos = playlist.videos.slice(i, i + videosPerModule);
    const moduleNumber = Math.floor(i / videosPerModule) + 1;
    
    const lessons: Lesson[] = moduleVideos.map((video, index) => ({
      id: video.id,
      title: video.title,
      description: video.description.substring(0, 200) + '...',
      duration: video.duration,
      order: index,
      videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
      content: video.description,
      resources: [
        {
          id: `${video.id}-youtube`,
          title: 'Watch on YouTube',
          type: 'video',
          url: `https://www.youtube.com/watch?v=${video.id}`
        }
      ]
    }));
    
    const moduleDuration = calculateTotalDuration(moduleVideos.map(v => v.duration));
    
    modules.push({
      id: `module-${moduleNumber}`,
      title: `Module ${moduleNumber}: ${getModuleTitle(moduleVideos)}`,
      description: `This module contains ${moduleVideos.length} lessons covering various topics.`,
      duration: moduleDuration,
      order: moduleNumber - 1,
      lessons
    });
  }
  
  // Determine category based on playlist title and description
  const category = inferCategory(playlist.title, playlist.description);
  
  // Determine level based on content
  const level = inferLevel(playlist.title, playlist.description);
  
  return {
    title: customData?.title || playlist.title,
    description: customData?.description || playlist.description,
    instructor: instructorName,
    instructorId,
    category: customData?.category || category,
    level: customData?.level || level,
    price: customData?.price || 0, // Default to free for YouTube content
    duration: calculateTotalDuration(playlist.videos.map(v => v.duration)),
    rating: 0,
    studentsCount: 0,
    imageUrl: customData?.imageUrl || playlist.thumbnailUrl,
    modules,
    createdAt: new Date(),
    updatedAt: new Date(),
    isPublished: customData?.isPublished ?? true
  };
};

/**
 * Convert single YouTube video to a simple course
 */
export const convertVideoToCourse = (
  video: YouTubeVideo,
  instructorId: string,
  instructorName: string,
  customData?: Partial<Course>
): Omit<Course, 'id'> => {
  const lesson: Lesson = {
    id: video.id,
    title: video.title,
    description: video.description.substring(0, 200) + '...',
    duration: video.duration,
    order: 0,
    videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
    content: video.description,
    resources: [
      {
        id: `${video.id}-youtube`,
        title: 'Watch on YouTube',
        type: 'video',
        url: `https://www.youtube.com/watch?v=${video.id}`
      }
    ]
  };
  
  const module: Module = {
    id: 'module-1',
    title: 'Main Content',
    description: 'Single video lesson',
    duration: video.duration,
    order: 0,
    lessons: [lesson]
  };
  
  const category = inferCategory(video.title, video.description);
  const level = inferLevel(video.title, video.description);
  
  return {
    title: customData?.title || video.title,
    description: customData?.description || video.description.substring(0, 300) + '...',
    instructor: instructorName,
    instructorId,
    category: customData?.category || category,
    level: customData?.level || level,
    price: customData?.price || 0,
    duration: video.duration,
    rating: 0,
    studentsCount: 0,
    imageUrl: customData?.imageUrl || video.thumbnailUrl,
    modules: [module],
    createdAt: new Date(),
    updatedAt: new Date(),
    isPublished: customData?.isPublished ?? true
  };
};

/**
 * Import course from YouTube URL
 */
export const importFromYouTube = async (
  url: string,
  instructorId: string,
  instructorName: string,
  customData?: Partial<Course>
): Promise<{ success: boolean; courseId?: string; message: string }> => {
  try {
    const parsed = parseYouTubeUrl(url);
    if (!parsed) {
      return {
        success: false,
        message: 'Invalid YouTube URL. Please provide a valid video or playlist URL.'
      };
    }
    
    let courseData: Omit<Course, 'id'>;
    
    if (parsed.type === 'playlist') {
      const playlist = await fetchPlaylistDetails(parsed.id);
      if (!playlist) {
        return {
          success: false,
          message: 'Could not fetch playlist details. Please check the URL and try again.'
        };
      }
      
      courseData = convertPlaylistToCourse(playlist, instructorId, instructorName, customData);
    } else if (parsed.type === 'video') {
      const video = await fetchVideoDetails(parsed.id);
      if (!video) {
        return {
          success: false,
          message: 'Could not fetch video details. Please check the URL and try again.'
        };
      }
      
      courseData = convertVideoToCourse(video, instructorId, instructorName, customData);
    } else {
      return {
        success: false,
        message: 'Channel import not yet supported. Please use a playlist or video URL.'
      };
    }
    
    const courseId = await createCourse(courseData);
    
    return {
      success: true,
      courseId,
      message: `Successfully imported course: ${courseData.title}`
    };
  } catch (error) {
    console.error('Error importing from YouTube:', error);
    return {
      success: false,
      message: 'Failed to import from YouTube. Please check your API key and try again.'
    };
  }
};

/**
 * Bulk import multiple YouTube URLs
 */
export const bulkImportFromYouTube = async (
  urls: string[],
  instructorId: string,
  instructorName: string
): Promise<{ success: boolean; imported: string[]; failed: string[]; message: string }> => {
  const imported: string[] = [];
  const failed: string[] = [];
  
  for (const url of urls) {
    try {
      const result = await importFromYouTube(url, instructorId, instructorName);
      if (result.success && result.courseId) {
        imported.push(result.courseId);
      } else {
        failed.push(url);
      }
    } catch (error) {
      failed.push(url);
    }
  }
  
  return {
    success: imported.length > 0,
    imported,
    failed,
    message: `Imported ${imported.length} courses successfully. ${failed.length} failed.`
  };
};

/**
 * Helper function to calculate total duration
 */
const calculateTotalDuration = (durations: string[]): string => {
  let totalSeconds = 0;
  
  for (const duration of durations) {
    const parts = duration.split(':');
    if (parts.length === 2) {
      totalSeconds += parseInt(parts[0]) * 60 + parseInt(parts[1]);
    } else if (parts.length === 3) {
      totalSeconds += parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
    }
  }
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

/**
 * Helper function to get module title from videos
 */
const getModuleTitle = (videos: YouTubeVideo[]): string => {
  // Try to find common words in video titles
  const firstTitle = videos[0]?.title || '';
  const words = firstTitle.split(' ').slice(0, 3);
  return words.join(' ') || 'Video Lessons';
};

/**
 * Helper function to infer category from title and description
 */
const inferCategory = (title: string, description: string): string => {
  const text = (title + ' ' + description).toLowerCase();
  
  if (text.includes('programming') || text.includes('coding') || text.includes('javascript') || text.includes('python') || text.includes('react') || text.includes('web development')) {
    return 'Programming';
  } else if (text.includes('math') || text.includes('calculus') || text.includes('algebra') || text.includes('geometry')) {
    return 'Mathematics';
  } else if (text.includes('science') || text.includes('physics') || text.includes('chemistry') || text.includes('biology')) {
    return 'Science';
  } else if (text.includes('business') || text.includes('marketing') || text.includes('entrepreneur') || text.includes('finance')) {
    return 'Business';
  } else if (text.includes('design') || text.includes('photoshop') || text.includes('illustrator') || text.includes('ui/ux')) {
    return 'Design';
  } else if (text.includes('language') || text.includes('english') || text.includes('spanish') || text.includes('french')) {
    return 'Language';
  } else if (text.includes('engineering') || text.includes('mechanical') || text.includes('electrical')) {
    return 'Engineering';
  } else if (text.includes('medicine') || text.includes('medical') || text.includes('health')) {
    return 'Medicine';
  }
  
  return 'Other';
};

/**
 * Helper function to infer difficulty level
 */
const inferLevel = (title: string, description: string): 'Beginner' | 'Intermediate' | 'Advanced' => {
  const text = (title + ' ' + description).toLowerCase();
  
  if (text.includes('beginner') || text.includes('introduction') || text.includes('basics') || text.includes('fundamentals') || text.includes('getting started')) {
    return 'Beginner';
  } else if (text.includes('advanced') || text.includes('expert') || text.includes('master') || text.includes('professional')) {
    return 'Advanced';
  } else {
    return 'Intermediate';
  }
};
