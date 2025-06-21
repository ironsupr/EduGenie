// Test script to verify YouTube import and course display functionality
import { importYouTubeVideo } from './src/utils/youtubeImporter.js';

const testVideoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Rick Roll - a well-known test video

async function testYouTubeImport() {
  try {
    console.log('Testing YouTube video import...');
    console.log('Video URL:', testVideoUrl);
    
    // Test the import
    const result = await importYouTubeVideo(testVideoUrl, 'test-user-123');
    
    if (result.success) {
      console.log('✅ Import successful!');
      console.log('Course ID:', result.courseId);
      console.log('Course Title:', result.title);
      console.log('Video Count:', result.videoCount);
    } else {
      console.log('❌ Import failed:');
      console.log('Error:', result.error);
    }
  } catch (error) {
    console.log('❌ Test failed with error:');
    console.log(error.message);
  }
}

testYouTubeImport();
