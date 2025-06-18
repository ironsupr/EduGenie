# EduGenie Video Content Options Guide

## Overview

EduGenie supports multiple video sources and formats to give you maximum flexibility in delivering course content. Here's a comprehensive guide to all available options:

## 🎥 Video Source Types

### 1. Local Video Files (`source_type: "local"`)

**Best for:** Complete control, offline access, custom branding

**How it works:**

- Upload video files directly to your server
- Files stored in `/static/videos/` directory
- Supports multiple quality levels automatically

**Supported Formats:**

- MP4 (recommended)
- WebM
- OGV

**Quality Options:**

- 360p (Low) - ~50-100 MB
- 720p (Medium) - ~100-300 MB
- 1080p (High) - ~300-800 MB
- 1440p (HD) - ~800-1500 MB
- 2160p (4K) - ~1500-3000 MB

**Example Setup:**

```python
lesson_data = {
    "source_type": "local",
    "video_id": "lesson_001",
    "title": "Introduction to Python",
    "duration": "15:30"
}
```

**File Structure:**

```
/static/videos/
├── lesson_001.mp4          # Default quality
├── lesson_001_360p.mp4     # Low quality
├── lesson_001_720p.mp4     # Medium quality
└── lesson_001_1080p.mp4    # High quality
```

---

### 2. YouTube Integration (`source_type: "youtube"`)

**Best for:** Free hosting, existing content, wide compatibility

**How it works:**

- Embed YouTube videos using video IDs
- Automatic quality adaptation
- Built-in analytics and controls

**Example Setup:**

```python
lesson_data = {
    "source_type": "youtube",
    "video_id": "lesson_001",
    "youtube_id": "dQw4w9WgXcQ",  # YouTube video ID
    "title": "Course Introduction"
}
```

**Features:**

- Automatic quality switching
- Closed captions support
- No storage costs
- Built-in YouTube analytics

---

### 3. Vimeo Integration (`source_type: "vimeo"`)

**Best for:** Professional presentation, privacy controls, ad-free experience

**How it works:**

- Embed Vimeo videos using Vimeo IDs
- Enhanced privacy options
- Professional appearance

**Example Setup:**

```python
lesson_data = {
    "source_type": "vimeo",
    "video_id": "lesson_001",
    "vimeo_id": "123456789",
    "title": "Advanced Concepts"
}
```

**Benefits:**

- No advertisements
- Enhanced privacy controls
- Customizable player
- Better compression than YouTube

---

### 4. Cloud Storage (AWS S3) (`source_type: "s3"`)

**Best for:** Scalable hosting, global distribution, cost-effective storage

**How it works:**

- Videos stored in AWS S3 buckets
- CDN distribution via CloudFront
- Multiple quality versions

**Example Setup:**

```python
lesson_data = {
    "source_type": "s3",
    "video_id": "lesson_001",
    "s3_bucket": "edugenie-videos",
    "s3_region": "us-west-2",
    "use_signed_urls": False  # Set to True for private content
}
```

**File Structure in S3:**

```
edugenie-videos/
└── videos/
    ├── lesson_001_360p.mp4
    ├── lesson_001_720p.mp4
    └── lesson_001_1080p.mp4
```

---

### 5. CDN Hosting (`source_type: "cdn"`)

**Best for:** Global performance, reduced server load, professional delivery

**How it works:**

- Videos served from Content Delivery Network
- Optimized for global access
- Reduced bandwidth costs

**Example Setup:**

```python
lesson_data = {
    "source_type": "cdn",
    "video_id": "lesson_001",
    "cdn_url": "https://cdn.edugenie.com"
}
```

---

### 6. Adaptive Streaming (`source_type: "streaming"`)

**Best for:** Professional streaming, adaptive quality, large audiences

**Protocols Supported:**

- **HLS (HTTP Live Streaming)** - Apple standard, iOS/Safari optimized
- **DASH (Dynamic Adaptive Streaming)** - Open standard, cross-platform

**How it works:**

- Video automatically adjusts quality based on connection
- Segments loaded progressively
- Optimal viewing experience

**Example Setup:**

```python
lesson_data = {
    "source_type": "streaming",
    "video_id": "lesson_001",
    "streaming_url": "https://stream.edugenie.com"
}
```

---

## 🛠 Implementation Examples

### Frontend Implementation

```javascript
// Initialize video player
const player = new EnhancedVideoPlayer('video-container', {
    autoplay: false,
    controls: true,
    playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
    enableAnalytics: true
});

// Load different video types
const videoData = {
    video_id: "lesson_001",
    source_type: "local", // or "youtube", "vimeo", "s3", etc.
    sources: [...], // Video source URLs
    poster: "/static/images/lesson_001_poster.jpg",
    subtitles: [
        {
            src: "/static/subtitles/lesson_001_en.vtt",
            srclang: "en",
            label: "English",
            default: true
        }
    ]
};

await player.loadVideo(videoData);
```

### Backend API Usage

```python
from core.video_service import video_service

# Get video sources for any type
video_sources = video_service.get_video_sources("lesson_001", {
    "source_type": "local",
    "title": "Introduction to Programming",
    "duration": "15:30"
})

# Returns structured data for frontend player
```

---

## 📊 Comparison Matrix

| Feature              | Local          | YouTube    | Vimeo        | S3/CDN    | Streaming |
| -------------------- | -------------- | ---------- | ------------ | --------- | --------- |
| **Cost**             | Server storage | Free       | Paid plans   | AWS costs | High      |
| **Quality Control**  | Full           | Limited    | Good         | Full      | Excellent |
| **Branding**         | Full           | YouTube UI | Customizable | Full      | Full      |
| **Analytics**        | Custom         | YouTube    | Vimeo        | Custom    | Advanced  |
| **Offline Access**   | Yes            | No         | No           | No        | No        |
| **Global CDN**       | No             | Yes        | Yes          | Yes       | Yes       |
| **Adaptive Quality** | Manual         | Auto       | Auto         | Manual    | Auto      |
| **Setup Complexity** | Low            | Very Low   | Low          | Medium    | High      |

---

## 🚀 Getting Started

### 1. Choose Your Primary Video Source

For most educational content, we recommend:

- **Starting with Local files** for full control
- **Adding YouTube** for free hosting of public content
- **Upgrading to S3/CDN** for scalability
- **Using Streaming** for professional, large-scale deployments

### 2. Prepare Your Content

Regardless of source type, ensure you have:

- High-quality source videos
- Thumbnail/poster images
- Subtitle files (VTT format)
- Proper video metadata

### 3. Configure Your Course

Update your course data to specify video sources:

```python
course_data = {
    "modules": [
        {
            "id": "module_1",
            "lessons": [
                {
                    "id": "lesson_001",
                    "source_type": "local",  # Change this based on your choice
                    "title": "Introduction",
                    "duration": "15:30",
                    # Add source-specific configuration here
                }
            ]
        }
    ]
}
```

---

## 🔧 Advanced Configuration

### Multiple Video Sources (Fallback)

You can configure multiple sources for redundancy:

```python
lesson_data = {
    "primary_source": {
        "source_type": "s3",
        "s3_bucket": "primary-videos"
    },
    "fallback_sources": [
        {
            "source_type": "youtube",
            "youtube_id": "backup_video_id"
        },
        {
            "source_type": "local",
            "video_id": "local_backup"
        }
    ]
}
```

### Custom Video Processing

For local files, you can set up automatic processing:

```bash
# Example: Convert video to multiple qualities using FFmpeg
ffmpeg -i input.mp4 -vf scale=1920:1080 -b:v 4000k lesson_001_1080p.mp4
ffmpeg -i input.mp4 -vf scale=1280:720 -b:v 2000k lesson_001_720p.mp4
ffmpeg -i input.mp4 -vf scale=640:360 -b:v 800k lesson_001_360p.mp4
```

---

## 📈 Analytics and Monitoring

The enhanced video player automatically tracks:

- Watch time and completion rates
- Quality selection preferences
- Pause/seek behavior
- Device and browser usage
- Network performance impact

Access analytics via:

```python
analytics = video_service.get_video_analytics("lesson_001")
```

---

## 🔒 Security and Privacy

### Private Content

- **Local files**: Server-level access control
- **S3**: Signed URLs with expiration
- **Vimeo**: Privacy settings and domain restrictions
- **Streaming**: Token-based authentication

### Content Protection

- Domain-based restrictions
- User authentication requirements
- Video watermarking (where supported)
- Download prevention measures

---

## 🆘 Troubleshooting

### Common Issues:

1. **Video won't load**: Check file paths and permissions
2. **Poor quality**: Verify source video resolution
3. **Slow loading**: Consider CDN or quality reduction
4. **Mobile issues**: Ensure responsive design and mobile formats

### Debug Tools:

```javascript
// Enable debug mode
const player = new EnhancedVideoPlayer("video-container", {
  debug: true,
  logLevel: "verbose",
});
```

---

This guide covers all major video content options for EduGenie. Choose the approach that best fits your budget, technical requirements, and user experience goals.
