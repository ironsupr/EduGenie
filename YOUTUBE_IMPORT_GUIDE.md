# YouTube Course Import Guide

This guide explains how to set up and use the YouTube course import feature in EduGenie.

## 🔧 Setup

### 1. Get YouTube Data API v3 Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **YouTube Data API v3**:
   - Go to "APIs & Services" → "Library"
   - Search for "YouTube Data API v3"
   - Click "Enable"
4. Create credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API key"
   - Copy the generated API key

### 2. Configure Environment Variables

Add your YouTube API key to your `.env.local` file:

```bash
VITE_YOUTUBE_API_KEY=your_youtube_api_key_here
```

### 3. Restart Development Server

After adding the API key, restart your development server:

```bash
npm run dev
```

## 🎯 Features

### 1. Single Video/Playlist Import
- **URL**: `/youtube-import`
- Import individual YouTube videos or entire playlists
- Automatic course structure generation
- Customizable metadata (title, description, category, level, price)
- Real-time preview of video content

### 2. Bulk Import
- Import multiple YouTube URLs at once
- Each URL becomes a separate course
- Batch processing with success/failure reporting
- Support for mixed video and playlist URLs

### 3. Automatic Course Generation
- **Videos**: Converted to single-lesson courses
- **Playlists**: Organized into modules (8 videos per module)
- **Metadata**: Extracted from YouTube (title, description, duration, thumbnails)
- **Categories**: Auto-detected based on content keywords
- **Levels**: Inferred from title/description keywords

## 📋 Supported URL Formats

### Video URLs
```
https://www.youtube.com/watch?v=VIDEO_ID
https://youtu.be/VIDEO_ID
https://www.youtube.com/embed/VIDEO_ID
```

### Playlist URLs
```
https://www.youtube.com/playlist?list=PLAYLIST_ID
https://www.youtube.com/watch?v=VIDEO_ID&list=PLAYLIST_ID
```

## 🎓 How Courses are Structured

### From YouTube Video
```
Course
└── Module 1: Main Content
    └── Lesson: [Video Title]
        ├── Content: Video description
        ├── Duration: Video duration
        └── Resources: YouTube link
```

### From YouTube Playlist
```
Course
├── Module 1: [First 8 videos]
│   ├── Lesson 1: Video 1
│   ├── Lesson 2: Video 2
│   └── ...
├── Module 2: [Next 8 videos]
│   └── ...
└── Module N: [Remaining videos]
```

## 🔍 Auto-Detection Rules

### Category Detection
Based on keywords in title/description:
- **Programming**: programming, coding, javascript, python, react, web development
- **Mathematics**: math, calculus, algebra, geometry
- **Science**: science, physics, chemistry, biology
- **Business**: business, marketing, entrepreneur, finance
- **Design**: design, photoshop, illustrator, ui/ux
- **Language**: language, english, spanish, french
- **Engineering**: engineering, mechanical, electrical
- **Medicine**: medicine, medical, health

### Level Detection
Based on keywords in title/description:
- **Beginner**: beginner, introduction, basics, fundamentals, getting started
- **Advanced**: advanced, expert, master, professional
- **Intermediate**: Everything else (default)

## 🛠️ Usage Examples

### Example 1: Import a Programming Playlist
1. Go to `/youtube-import`
2. Paste: `https://www.youtube.com/playlist?list=PLWKjhJtqVAbnqBxcdjVGgT3uVR10bzTEB`
3. Customize if needed:
   - Title: "Complete React Course"
   - Category: Programming
   - Level: Intermediate
   - Price: 49.99
4. Click "Import Course"

### Example 2: Bulk Import Educational Videos
1. Go to `/youtube-import`
2. Click "Bulk Import" tab
3. Add multiple URLs:
   ```
   https://www.youtube.com/watch?v=ABC123
   https://www.youtube.com/playlist?list=XYZ789
   https://www.youtube.com/watch?v=DEF456
   ```
4. Click "Bulk Import"

### Example 3: Import with Custom Metadata
1. Paste YouTube URL
2. Customize fields:
   - **Title**: Override the YouTube title
   - **Description**: Add your own course description
   - **Category**: Select appropriate category
   - **Level**: Choose difficulty level
   - **Price**: Set course price (default: free)

## 📊 Import Results

### Success Response
```javascript
{
  success: true,
  courseId: "course_id_123",
  message: "Successfully imported course: Course Title"
}
```

### Bulk Import Response
```javascript
{
  success: true,
  imported: ["course_id_1", "course_id_2"],
  failed: ["invalid_url"],
  message: "Imported 2 courses successfully. 1 failed."
}
```

## ⚠️ Limitations & Notes

### API Quotas
- YouTube Data API has daily quotas
- Each import uses multiple API calls
- Monitor usage in Google Cloud Console

### Content Restrictions
- Only public videos/playlists can be imported
- Age-restricted content may not be accessible
- Some videos may have embedding disabled

### Course Quality
- Auto-generated courses may need manual review
- Consider editing course descriptions and module organization
- Add your own assessments and supplementary materials

### Performance
- Large playlists (50+ videos) may take time to import
- Bulk imports are processed sequentially
- Network timeout may occur for very large imports

## 🔧 Troubleshooting

### "YouTube API key not configured"
- Check that `VITE_YOUTUBE_API_KEY` is set in `.env.local`
- Restart the development server after adding the key

### "YouTube API error: 403"
- API key may be invalid or restricted
- Check API quotas in Google Cloud Console
- Ensure YouTube Data API v3 is enabled

### "Could not fetch playlist details"
- Playlist may be private or deleted
- Check the URL format
- Try with a different playlist

### "Failed to import from YouTube"
- Check network connection
- Verify the YouTube URL is valid and public
- Try importing a single video first to test API setup

## 🚀 Advanced Usage

### Custom Course Structure
After importing, you can:
1. Edit course metadata
2. Reorganize modules and lessons
3. Add quizzes and assessments
4. Include additional resources
5. Set up discussions and forums

### Integration with Existing Courses
- Import YouTube content as supplementary material
- Embed videos in existing course lessons
- Create hybrid courses with multiple content sources

### Batch Processing Scripts
For large-scale imports, consider creating custom scripts using the import utilities:

```typescript
import { bulkImportFromYouTube } from './utils/youtubeImporter';

const urls = [
  // ... array of YouTube URLs
];

const result = await bulkImportFromYouTube(
  urls, 
  instructorId, 
  instructorName
);
```
