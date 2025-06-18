"""
YouTube service for integrating YouTube playlists as courses
"""
import re
import logging
from typing import List, Dict, Optional, Any
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from core.config import get_settings

logger = logging.getLogger(__name__)

class YouTubeService:
    """Service for interacting with YouTube API"""
    
    def __init__(self):
        self.settings = get_settings()
        self.youtube = None
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize YouTube API client"""
        try:
            # You'll need to add YOUTUBE_API_KEY to your .env file
            api_key = self.settings.YOUTUBE_API_KEY if hasattr(self.settings, 'YOUTUBE_API_KEY') else None
            
            if not api_key:
                logger.warning("YouTube API key not found. YouTube integration will be limited.")
                return
            
            self.youtube = build('youtube', 'v3', developerKey=api_key)
            logger.info("YouTube API client initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize YouTube API client: {e}")
    
    def extract_playlist_id(self, url: str) -> Optional[str]:
        """Extract playlist ID from YouTube URL"""
        patterns = [
            r'list=([a-zA-Z0-9_-]+)',
            r'playlist\?list=([a-zA-Z0-9_-]+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        
        return None
    
    async def get_playlist_info(self, playlist_url: str) -> Optional[Dict[str, Any]]:
        """Get playlist information from YouTube"""
        if not self.youtube:
            return self._get_mock_playlist_info(playlist_url)
        
        playlist_id = self.extract_playlist_id(playlist_url)
        if not playlist_id:
            raise ValueError("Invalid YouTube playlist URL")
        
        try:
            # Get playlist details
            playlist_response = self.youtube.playlists().list(
                part='snippet,contentDetails',
                id=playlist_id
            ).execute()
            
            if not playlist_response['items']:
                raise ValueError("Playlist not found")
            
            playlist_data = playlist_response['items'][0]
            
            # Get playlist videos
            videos = await self._get_playlist_videos(playlist_id)
            
            # Calculate total duration
            total_duration = sum(video.get('duration_seconds', 0) for video in videos)
            
            return {
                'id': playlist_id,
                'title': playlist_data['snippet']['title'],
                'description': playlist_data['snippet']['description'],
                'thumbnail': self._get_best_thumbnail(playlist_data['snippet']['thumbnails']),
                'channel_title': playlist_data['snippet']['channelTitle'],
                'video_count': len(videos),
                'total_duration_seconds': total_duration,
                'total_duration_formatted': self._format_duration(total_duration),
                'videos': videos,
                'url': playlist_url,
                'published_at': playlist_data['snippet']['publishedAt']
            }
            
        except HttpError as e:
            logger.error(f"YouTube API error: {e}")
            raise ValueError(f"Failed to fetch playlist information: {e}")
        except Exception as e:
            logger.error(f"Error getting playlist info: {e}")
            raise ValueError(f"Failed to process playlist: {e}")
    
    async def _get_playlist_videos(self, playlist_id: str) -> List[Dict[str, Any]]:
        """Get all videos in a playlist"""
        videos = []
        next_page_token = None
        
        try:
            while True:
                request = self.youtube.playlistItems().list(
                    part='snippet,contentDetails',
                    playlistId=playlist_id,
                    maxResults=50,
                    pageToken=next_page_token
                )
                response = request.execute()
                
                # Get video IDs for duration lookup
                video_ids = [item['contentDetails']['videoId'] for item in response['items']]
                
                # Get video details including duration
                video_details = self.youtube.videos().list(
                    part='contentDetails',
                    id=','.join(video_ids)
                ).execute()
                
                # Create duration lookup
                duration_lookup = {}
                for video in video_details['items']:
                    duration = video['contentDetails']['duration']
                    duration_seconds = self._parse_duration(duration)
                    duration_lookup[video['id']] = duration_seconds
                
                # Process videos
                for item in response['items']:
                    video_id = item['contentDetails']['videoId']
                    snippet = item['snippet']
                    
                    if snippet['title'] != 'Private video' and snippet['title'] != 'Deleted video':
                        duration_seconds = duration_lookup.get(video_id, 0)
                        
                        videos.append({
                            'video_id': video_id,
                            'title': snippet['title'],
                            'description': snippet.get('description', ''),
                            'thumbnail': self._get_best_thumbnail(snippet['thumbnails']),
                            'duration_seconds': duration_seconds,
                            'duration_formatted': self._format_duration(duration_seconds),
                            'position': snippet['position'],
                            'url': f"https://www.youtube.com/watch?v={video_id}",
                            'published_at': snippet['publishedAt']
                        })
                
                next_page_token = response.get('nextPageToken')
                if not next_page_token:
                    break
                    
        except HttpError as e:
            logger.error(f"Error fetching playlist videos: {e}")
        
        return videos
    
    def _get_mock_playlist_info(self, playlist_url: str) -> Dict[str, Any]:
        """Return mock playlist info when YouTube API is not available"""
        playlist_id = self.extract_playlist_id(playlist_url) or "mock_playlist"
        
        return {
            'id': playlist_id,
            'title': 'Sample YouTube Playlist',
            'description': 'This is a sample playlist. YouTube API key needed for full integration.',
            'thumbnail': '/static/images/course-default.jpg',
            'channel_title': 'Sample Channel',
            'video_count': 10,
            'total_duration_seconds': 3600,
            'total_duration_formatted': '1 hour',
            'videos': [
                {
                    'video_id': f'video_{i}',
                    'title': f'Sample Video {i}',
                    'description': 'Sample video description',
                    'thumbnail': '/static/images/course-default.jpg',
                    'duration_seconds': 360,
                    'duration_formatted': '6 minutes',
                    'position': i - 1,
                    'url': f'https://www.youtube.com/watch?v=video_{i}',
                    'published_at': '2025-01-01T00:00:00Z'
                }
                for i in range(1, 11)
            ],
            'url': playlist_url,
            'published_at': '2025-01-01T00:00:00Z'
        }
    
    def _get_best_thumbnail(self, thumbnails: Dict[str, Any]) -> str:
        """Get the best quality thumbnail URL"""
        # Prefer higher quality thumbnails
        for quality in ['maxres', 'high', 'medium', 'default']:
            if quality in thumbnails:
                return thumbnails[quality]['url']
        
        return '/static/images/course-default.jpg'
    
    def _parse_duration(self, duration: str) -> int:
        """Parse YouTube duration format (PT1H2M3S) to seconds"""
        pattern = r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?'
        match = re.match(pattern, duration)
        
        if not match:
            return 0
        
        hours = int(match.group(1) or 0)
        minutes = int(match.group(2) or 0)
        seconds = int(match.group(3) or 0)
        
        return hours * 3600 + minutes * 60 + seconds
    
    def _format_duration(self, seconds: int) -> str:
        """Format duration in seconds to human-readable format"""
        if seconds < 60:
            return f"{seconds} seconds"
        elif seconds < 3600:
            minutes = seconds // 60
            return f"{minutes} minutes"
        else:
            hours = seconds // 3600
            minutes = (seconds % 3600) // 60
            if minutes > 0:
                return f"{hours} hours {minutes} minutes"
            else:
                return f"{hours} hours"
    
    def validate_playlist_url(self, url: str) -> bool:
        """Validate if URL is a valid YouTube playlist URL"""
        return self.extract_playlist_id(url) is not None
    
    async def search_playlists(self, query: str, max_results: int = 25) -> List[Dict[str, Any]]:
        """Search for YouTube playlists"""
        if not self.youtube:
            return []
        
        try:
            search_response = self.youtube.search().list(
                q=query,
                part='snippet',
                type='playlist',
                maxResults=max_results
            ).execute()
            
            playlists = []
            for item in search_response['items']:
                snippet = item['snippet']
                playlists.append({
                    'id': item['id']['playlistId'],
                    'title': snippet['title'],
                    'description': snippet['description'],
                    'thumbnail': self._get_best_thumbnail(snippet['thumbnails']),
                    'channel_title': snippet['channelTitle'],
                    'url': f"https://www.youtube.com/playlist?list={item['id']['playlistId']}",
                    'published_at': snippet['publishedAt']
                })
            
            return playlists
            
        except HttpError as e:
            logger.error(f"YouTube search error: {e}")
            return []
        except Exception as e:
            logger.error(f"Error searching playlists: {e}")
            return []

# Global instance
_youtube_service = None

def get_youtube_service() -> YouTubeService:
    """Get YouTube service instance (singleton)"""
    global _youtube_service
    
    if _youtube_service is None:
        _youtube_service = YouTubeService()
    
    return _youtube_service
