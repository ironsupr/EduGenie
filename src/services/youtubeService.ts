// YouTube API Service
// Note: You'll need to get a YouTube Data API v3 key from Google Cloud Console

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnailUrl: string;
  publishedAt: string;
  viewCount: string;
  position?: number;
}

export interface YouTubePlaylist {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  channelId: string;
  itemCount: number;
  videos: YouTubeVideo[];
}

export interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  subscriberCount: string;
  videoCount: string;
  playlists: YouTubePlaylist[];
}

/**
 * Parse YouTube URL to extract ID and type
 */
export const parseYouTubeUrl = (url: string) => {
  // Playlist URL patterns
  const playlistRegex = /[?&]list=([a-zA-Z0-9_-]+)/;
  const playlistMatch = url.match(playlistRegex);
  
  // Video URL patterns
  const videoRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]+)/;
  const videoMatch = url.match(videoRegex);
  
  // Channel URL patterns
  const channelRegex = /youtube\.com\/(?:channel\/|c\/|@)([a-zA-Z0-9_-]+)/;
  const channelMatch = url.match(channelRegex);

  if (playlistMatch) {
    return { type: 'playlist', id: playlistMatch[1] };
  } else if (videoMatch) {
    return { type: 'video', id: videoMatch[1] };
  } else if (channelMatch) {
    return { type: 'channel', id: channelMatch[1] };
  }
  
  return null;
};

/**
 * Convert ISO 8601 duration to readable format
 */
export const formatDuration = (isoDuration: string): string => {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
};

/**
 * Fetch video details from YouTube API
 */
export const fetchVideoDetails = async (videoId: string): Promise<YouTubeVideo | null> => {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API key not configured');
  }

  try {
    const response = await fetch(
      `${YOUTUBE_API_BASE}/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const video = data.items[0];
      return {
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        duration: formatDuration(video.contentDetails.duration),
        thumbnailUrl: video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high?.url || '',
        publishedAt: video.snippet.publishedAt,
        viewCount: video.statistics.viewCount || '0'
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching video details:', error);
    throw error;
  }
};

/**
 * Fetch playlist details and videos from YouTube API
 */
export const fetchPlaylistDetails = async (playlistId: string): Promise<YouTubePlaylist | null> => {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API key not configured');
  }

  try {
    // Fetch playlist info
    const playlistResponse = await fetch(
      `${YOUTUBE_API_BASE}/playlists?part=snippet,contentDetails&id=${playlistId}&key=${YOUTUBE_API_KEY}`
    );
    
    if (!playlistResponse.ok) {
      throw new Error(`YouTube API error: ${playlistResponse.status}`);
    }
    
    const playlistData = await playlistResponse.json();
    
    if (!playlistData.items || playlistData.items.length === 0) {
      return null;
    }
    
    const playlist = playlistData.items[0];
    
    // Fetch playlist items (videos)
    const itemsResponse = await fetch(
      `${YOUTUBE_API_BASE}/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=50&key=${YOUTUBE_API_KEY}`
    );
    
    if (!itemsResponse.ok) {
      throw new Error(`YouTube API error: ${itemsResponse.status}`);
    }
    
    const itemsData = await itemsResponse.json();
    
    // Fetch detailed video information for each video
    const videoIds = itemsData.items.map((item: any) => item.contentDetails.videoId).join(',');
    const videosResponse = await fetch(
      `${YOUTUBE_API_BASE}/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    );
    
    const videosData = await videosResponse.json();
    
    const videos: YouTubeVideo[] = videosData.items.map((video: any, index: number) => ({
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      duration: formatDuration(video.contentDetails.duration),
      thumbnailUrl: video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high?.url || '',
      publishedAt: video.snippet.publishedAt,
      viewCount: video.statistics.viewCount || '0',
      position: index
    }));
    
    return {
      id: playlist.id,
      title: playlist.snippet.title,
      description: playlist.snippet.description,
      thumbnailUrl: playlist.snippet.thumbnails.maxres?.url || playlist.snippet.thumbnails.high?.url || '',
      channelTitle: playlist.snippet.channelTitle,
      channelId: playlist.snippet.channelId,
      itemCount: playlist.contentDetails.itemCount,
      videos
    };
  } catch (error) {
    console.error('Error fetching playlist details:', error);
    throw error;
  }
};

/**
 * Search YouTube for educational content
 */
export const searchYouTubeContent = async (
  query: string, 
  type: 'video' | 'playlist' | 'channel' = 'video',
  maxResults: number = 25
) => {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API key not configured');
  }

  try {
    const response = await fetch(
      `${YOUTUBE_API_BASE}/search?part=snippet&q=${encodeURIComponent(query)}&type=${type}&maxResults=${maxResults}&order=relevance&key=${YOUTUBE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.items;
  } catch (error) {
    console.error('Error searching YouTube:', error);
    throw error;
  }
};

/**
 * Get educational channels recommendations
 */
export const getEducationalChannels = async () => {
  const educationalQueries = [
    'programming tutorial',
    'mathematics lesson',
    'science education',
    'business course',
    'design tutorial',
    'language learning'
  ];
  
  const channels: any[] = [];
  
  for (const query of educationalQueries) {
    try {
      const results = await searchYouTubeContent(query, 'channel', 5);
      channels.push(...results);
    } catch (error) {
      console.error(`Error searching for ${query}:`, error);
    }
  }
  
  return channels;
};
