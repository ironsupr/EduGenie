"""
Enhanced Video Service for EduGenie Course Modules
Supports multiple video sources and formats
"""

from typing import Dict, List, Optional, Union
from enum import Enum
import re
import logging

logger = logging.getLogger(__name__)

class VideoSource(str, Enum):
    """Video source types"""
    LOCAL = "local"
    YOUTUBE = "youtube"
    VIMEO = "vimeo"
    S3 = "s3"
    CDN = "cdn"
    STREAMING = "streaming"

class VideoQuality(str, Enum):
    """Video quality options"""
    LOW = "360p"
    MEDIUM = "720p"
    HIGH = "1080p"
    HD = "1440p"
    UHD = "2160p"

class VideoFormat(str, Enum):
    """Video format types"""
    MP4 = "mp4"
    WEBM = "webm"
    OGV = "ogv"
    HLS = "m3u8"
    DASH = "mpd"

class VideoService:
    """Enhanced video service supporting multiple sources"""
    
    def __init__(self):
        self.video_cache = {}
        self.supported_formats = [VideoFormat.MP4, VideoFormat.WEBM, VideoFormat.OGV]
        
    def get_video_sources(self, video_id: str, lesson_data: Dict) -> Dict:
        """Get video sources based on video ID and lesson configuration"""
        
        # Check if video data is cached
        cache_key = f"{video_id}_{lesson_data.get('source_type', 'local')}"
        if cache_key in self.video_cache:
            return self.video_cache[cache_key]
            
        video_sources = []
        source_type = lesson_data.get('source_type', VideoSource.LOCAL)
        
        if source_type == VideoSource.LOCAL:
            video_sources = self._get_local_video_sources(video_id)
        elif source_type == VideoSource.YOUTUBE:
            video_sources = self._get_youtube_video_sources(video_id, lesson_data)
        elif source_type == VideoSource.VIMEO:
            video_sources = self._get_vimeo_video_sources(video_id, lesson_data)
        elif source_type == VideoSource.S3:
            video_sources = self._get_s3_video_sources(video_id, lesson_data)
        elif source_type == VideoSource.CDN:
            video_sources = self._get_cdn_video_sources(video_id, lesson_data)
        elif source_type == VideoSource.STREAMING:
            video_sources = self._get_streaming_video_sources(video_id, lesson_data)
            
        result = {
            "video_id": video_id,
            "source_type": source_type,
            "sources": video_sources,
            "poster": self._get_poster_image(video_id, lesson_data),
            "subtitles": self._get_subtitles(video_id, lesson_data),
            "metadata": self._get_video_metadata(video_id, lesson_data)
        }
        
        # Cache the result
        self.video_cache[cache_key] = result
        return result
    
    def _get_local_video_sources(self, video_id: str) -> List[Dict]:
        """Get local video file sources"""
        sources = []
        base_path = f"/static/videos/{video_id}"
        
        # Multiple quality options
        quality_paths = {
            VideoQuality.HIGH: f"{base_path}_1080p.mp4",
            VideoQuality.MEDIUM: f"{base_path}_720p.mp4", 
            VideoQuality.LOW: f"{base_path}_360p.mp4",
            "default": f"{base_path}.mp4"  # Fallback
        }
        
        # Multiple format options
        for quality, path in quality_paths.items():
            for format_type in self.supported_formats:
                if format_type == VideoFormat.MP4:
                    sources.append({
                        "src": path,
                        "type": f"video/{format_type.value}",
                        "quality": quality if quality != "default" else VideoQuality.MEDIUM,
                        "size": self._estimate_file_size(path, quality)
                    })
                    
        return sources
    
    def _get_youtube_video_sources(self, video_id: str, lesson_data: Dict) -> List[Dict]:
        """Get YouTube video sources"""
        youtube_id = lesson_data.get('youtube_id', video_id)
        
        # YouTube embed options
        embed_params = {
            "autoplay": 0,
            "controls": 1,
            "showinfo": 0,
            "rel": 0,
            "modestbranding": 1,
            "cc_load_policy": 1  # Enable closed captions
        }
        
        param_string = "&".join([f"{k}={v}" for k, v in embed_params.items()])
        
        return [{
            "type": "youtube_embed",
            "embed_url": f"https://www.youtube.com/embed/{youtube_id}?{param_string}",
            "watch_url": f"https://www.youtube.com/watch?v={youtube_id}",
            "thumbnail": f"https://img.youtube.com/vi/{youtube_id}/maxresdefault.jpg",
            "quality": "adaptive",  # YouTube handles quality automatically
            "api_available": True
        }]
    
    def _get_vimeo_video_sources(self, video_id: str, lesson_data: Dict) -> List[Dict]:
        """Get Vimeo video sources"""
        vimeo_id = lesson_data.get('vimeo_id', video_id)
        
        return [{
            "type": "vimeo_embed",
            "embed_url": f"https://player.vimeo.com/video/{vimeo_id}",
            "quality": "adaptive",
            "privacy_enhanced": True,
            "customizable": True
        }]
    
    def _get_s3_video_sources(self, video_id: str, lesson_data: Dict) -> List[Dict]:
        """Get AWS S3 video sources"""
        bucket_name = lesson_data.get('s3_bucket', 'edugenie-videos')
        region = lesson_data.get('s3_region', 'us-west-2')
        
        sources = []
        qualities = [VideoQuality.HIGH, VideoQuality.MEDIUM, VideoQuality.LOW]
        
        for quality in qualities:
            sources.append({
                "src": f"https://{bucket_name}.s3.{region}.amazonaws.com/videos/{video_id}_{quality.value}.mp4",
                "type": "video/mp4",
                "quality": quality,
                "cdn_enabled": True,
                "signed_url": lesson_data.get('use_signed_urls', False)
            })
            
        return sources
    
    def _get_cdn_video_sources(self, video_id: str, lesson_data: Dict) -> List[Dict]:
        """Get CDN video sources"""
        cdn_base_url = lesson_data.get('cdn_url', 'https://cdn.edugenie.com')
        
        return [{
            "src": f"{cdn_base_url}/videos/{video_id}.mp4",
            "type": "video/mp4", 
            "quality": VideoQuality.HIGH,
            "cdn_optimized": True,
            "global_distribution": True
        }]
    
    def _get_streaming_video_sources(self, video_id: str, lesson_data: Dict) -> List[Dict]:
        """Get adaptive streaming video sources (HLS/DASH)"""
        streaming_base_url = lesson_data.get('streaming_url', 'https://stream.edugenie.com')
        
        return [
            {
                "src": f"{streaming_base_url}/hls/{video_id}/playlist.m3u8",
                "type": "application/x-mpegURL",  # HLS
                "quality": "adaptive",
                "streaming_protocol": "HLS"
            },
            {
                "src": f"{streaming_base_url}/dash/{video_id}/manifest.mpd", 
                "type": "application/dash+xml",  # DASH
                "quality": "adaptive",
                "streaming_protocol": "DASH"
            }
        ]
    
    def _get_poster_image(self, video_id: str, lesson_data: Dict) -> str:
        """Get video poster/thumbnail image"""
        source_type = lesson_data.get('source_type', VideoSource.LOCAL)
        
        if source_type == VideoSource.YOUTUBE:
            youtube_id = lesson_data.get('youtube_id', video_id)
            return f"https://img.youtube.com/vi/{youtube_id}/maxresdefault.jpg"
        elif source_type == VideoSource.VIMEO:
            # Vimeo requires API call for thumbnail
            return f"/static/images/video-poster-{video_id}.jpg"
        else:
            return f"/static/images/video-poster-{video_id}.jpg"
    
    def _get_subtitles(self, video_id: str, lesson_data: Dict) -> List[Dict]:
        """Get video subtitle tracks"""
        subtitles = []
        
        # Support multiple languages
        supported_languages = lesson_data.get('subtitle_languages', ['en'])
        
        for lang in supported_languages:
            subtitles.append({
                "src": f"/static/subtitles/{video_id}_{lang}.vtt",
                "srclang": lang,
                "label": self._get_language_label(lang),
                "default": lang == 'en'
            })
            
        return subtitles
    
    def _get_video_metadata(self, video_id: str, lesson_data: Dict) -> Dict:
        """Get video metadata"""
        return {
            "duration": lesson_data.get('duration', '0:00'),
            "file_size": lesson_data.get('file_size', 'Unknown'),
            "upload_date": lesson_data.get('upload_date'),
            "last_modified": lesson_data.get('last_modified'),
            "resolution": lesson_data.get('resolution', '1920x1080'),
            "aspect_ratio": lesson_data.get('aspect_ratio', '16:9'),
            "framerate": lesson_data.get('framerate', 30),
            "bitrate": lesson_data.get('bitrate', '2000kbps')
        }
    
    def _estimate_file_size(self, file_path: str, quality: str) -> str:
        """Estimate file size based on quality"""
        size_estimates = {
            VideoQuality.LOW: "50-100 MB",
            VideoQuality.MEDIUM: "100-300 MB", 
            VideoQuality.HIGH: "300-800 MB",
            VideoQuality.HD: "800-1500 MB",
            VideoQuality.UHD: "1500-3000 MB"
        }
        return size_estimates.get(quality, "Unknown")
    
    def _get_language_label(self, lang_code: str) -> str:
        """Get human-readable language label"""
        language_labels = {
            'en': 'English',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese',
            'zh': 'Chinese',
            'ja': 'Japanese',
            'ko': 'Korean',
            'ar': 'Arabic',
            'hi': 'Hindi'
        }
        return language_labels.get(lang_code, lang_code.upper())
    
    def get_video_analytics(self, video_id: str) -> Dict:
        """Get video analytics and performance metrics"""
        return {
            "total_views": 0,
            "average_watch_time": "0:00",
            "completion_rate": 0.0,
            "engagement_score": 0.0,
            "popular_segments": [],
            "drop_off_points": [],
            "device_breakdown": {
                "desktop": 0,
                "mobile": 0,
                "tablet": 0
            },
            "quality_distribution": {
                "1080p": 0,
                "720p": 0,
                "480p": 0,
                "360p": 0
            }
        }

# Global video service instance
video_service = VideoService()
