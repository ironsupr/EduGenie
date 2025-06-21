// Test YouTube Import End-to-End
import { importFromYouTube } from './src/utils/youtubeImporter.js';

// Test URLs
const testUrls = [
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Single video
  'https://www.youtube.com/playlist?list=PLWKjhJtqVAbnqBxcdjVGgT3uVR10bzTEB' // Python playlist
];

async function testImport() {
  console.log('🧪 Testing YouTube Import Functionality\n');
  
  const testUserId = 'test-user-123';
  const testInstructorName = 'Test Instructor';
  
  for (const [index, url] of testUrls.entries()) {
    console.log(`\n📹 Test ${index + 1}: ${url}`);
    
    try {
      const result = await importFromYouTube(
        url,
        testUserId,
        testInstructorName,
        {
          category: 'Programming',
          level: 'Beginner',
          price: 0
        }
      );
      
      if (result.success) {
        console.log(`✅ Import successful!`);
        console.log(`📚 Course ID: ${result.courseId}`);
        console.log(`💬 Message: ${result.message}`);
      } else {
        console.log(`❌ Import failed: ${result.message}`);
      }
    } catch (error) {
      console.log(`💥 Error during import: ${error.message}`);
    }
  }
}

// Only run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testImport().catch(console.error);
}
