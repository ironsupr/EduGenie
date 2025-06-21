// Test YouTube API functionality
const YOUTUBE_API_KEY = 'AIzaSyAoWryeSEdmEhDFGfM8YiZkRmL1vhm-u-Y';

// Test video ID from a popular educational channel
const testVideoId = 'dQw4w9WgXcQ'; // Rick Roll for testing
const testPlaylistId = 'PLWKjhJtqVAbnqBxcdjVGgT3uVR10bzTEB'; // Example educational playlist

async function testVideoAPI() {
  try {
    console.log('Testing YouTube Video API...');
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${testVideoId}&key=${YOUTUBE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Video API Response:', data);
    
    if (data.items && data.items.length > 0) {
      console.log('✅ Video API working correctly');
      console.log('Video Title:', data.items[0].snippet.title);
    } else {
      console.log('❌ No video data returned');
    }
  } catch (error) {
    console.error('❌ Video API Error:', error);
  }
}

async function testPlaylistAPI() {
  try {
    console.log('\nTesting YouTube Playlist API...');
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id=${testPlaylistId}&key=${YOUTUBE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Playlist API Response:', data);
    
    if (data.items && data.items.length > 0) {
      console.log('✅ Playlist API working correctly');
      console.log('Playlist Title:', data.items[0].snippet.title);
    } else {
      console.log('❌ No playlist data returned');
    }
  } catch (error) {
    console.error('❌ Playlist API Error:', error);
  }
}

// Run tests
testVideoAPI();
testPlaylistAPI();
