// Course Module JavaScript - EduGenie (Enhanced Version with YouTube Support)

// Global Variables
let currentVideo = null;
let youtubePlayer = null; // YouTube player instance
let isYouTubeVideo = false; // Track current video type
let currentFlashcard = 0;
let flashcards = [];
let isFlipped = false;
let aiAssistantOpen = false;
let sidebarCollapsed = false;
let currentModule = null;
let studySession = {
    startTime: Date.now(),
    videosWatched: 0,
    notesViewed: 0,
    flashcardsStudied: 0,
    discussionParticipated: false
};

// YouTube API Ready
let youtubeAPIReady = false;
function onYouTubeIframeAPIReady() {
    youtubeAPIReady = true;
    console.log('🎬 YouTube API Ready');
}

// YouTube Player Management
class YouTubeVideoManager {
    constructor() {
        this.player = null;
        this.isReady = false;
    }
    
    loadVideo(youtubeId, elementId = 'youtubeFrame') {
        return new Promise((resolve, reject) => {
            if (!youtubeAPIReady) {
                reject(new Error('YouTube API not ready'));
                return;
            }
            
            // Destroy existing player if any
            if (this.player) {
                this.player.destroy();
            }
            
            this.player = new YT.Player(elementId, {
                height: '100%',
                width: '100%',
                videoId: youtubeId,
                playerVars: {
                    'autoplay': 0,
                    'controls': 1,
                    'showinfo': 0,
                    'rel': 0,
                    'modestbranding': 1,
                    'cc_load_policy': 1,
                    'iv_load_policy': 3,
                    'origin': window.location.origin
                },
                events: {
                    'onReady': (event) => {
                        this.isReady = true;
                        console.log('✅ YouTube player ready');
                        resolve(this.player);
                    },
                    'onStateChange': this.onPlayerStateChange.bind(this),
                    'onError': (event) => {
                        console.error('❌ YouTube player error:', event.data);
                        reject(new Error(`YouTube error: ${event.data}`));
                    }
                }
            });
        });
    }
    
    onPlayerStateChange(event) {
        const states = {
            '-1': 'unstarted',
            '0': 'ended',
            '1': 'playing',
            '2': 'paused',
            '3': 'buffering',
            '5': 'cued'
        };
        
        const state = states[event.data] || 'unknown';
        console.log(`🎬 YouTube player state: ${state}`);
        
        // Track events
        switch (event.data) {
            case YT.PlayerState.PLAYING:
                studySession.videosWatched++;
                trackEvent('youtube_video_play');
                break;
            case YT.PlayerState.ENDED:
                onVideoEnded();
                trackEvent('youtube_video_completed');
                break;
            case YT.PlayerState.PAUSED:
                trackEvent('youtube_video_paused');
                break;
        }
    }
    
    play() {
        if (this.player && this.isReady) {
            this.player.playVideo();
        }
    }
    
    pause() {
        if (this.player && this.isReady) {
            this.player.pauseVideo();
        }
    }
    
    getCurrentTime() {
        return this.player && this.isReady ? this.player.getCurrentTime() : 0;
    }
    
    getDuration() {
        return this.player && this.isReady ? this.player.getDuration() : 0;
    }
    
    seekTo(seconds) {
        if (this.player && this.isReady) {
            this.player.seekTo(seconds, true);
        }
    }
    
    setVolume(volume) {
        if (this.player && this.isReady) {
            this.player.setVolume(volume);
        }
    }
}

// Initialize YouTube manager
const youtubeManager = new YouTubeVideoManager();

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadFlashcards();
    setupEventListeners();
    setupKeyboardShortcuts();
    trackStudySession();
});

// Initialize application with enhanced features
function initializeApp() {
    // Set up video player
    currentVideo = document.getElementById('mainVideo');
    
    // Initialize first tab with smooth transition
    switchTab('notes');
    
    // Setup responsive behavior
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Initialize progress tracking
    updateProgressAnimations();
    
    // Setup intersection observers for animations
    setupScrollAnimations();
    
    // Initialize accessibility features
    setupAccessibility();
    
    console.log('🎓 EduGenie Course Module initialized successfully!');
}

// Enhanced event listeners
function setupEventListeners() {
    // Video events with enhanced tracking
    if (currentVideo) {
        currentVideo.addEventListener('loadstart', () => showVideoLoading());
        currentVideo.addEventListener('canplay', () => hideVideoLoading());
        currentVideo.addEventListener('play', () => {
            hideVideoOverlay();
            studySession.videosWatched++;
            trackEvent('video_play', { video_id: currentVideo.getAttribute('data-video-id') });
        });
        currentVideo.addEventListener('pause', () => showVideoOverlay());
        currentVideo.addEventListener('ended', () => {
            onVideoEnded();
            trackEvent('video_completed');
        });
        currentVideo.addEventListener('timeupdate', () => updateVideoProgress());
    }
    
    // Enhanced keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Click outside to close AI assistant with smooth animation
    document.addEventListener('click', function(e) {
        if (aiAssistantOpen && !e.target.closest('.ai-assistant-panel') && !e.target.closest('.ai-assistant-fab')) {
            toggleAIAssistant();
        }
    });
    
    // Window visibility change for study session tracking
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            pauseStudySession();
        } else {
            resumeStudySession();
        }
    });
    
    // Enhanced scroll tracking
    window.addEventListener('scroll', debounce(trackScrollProgress, 100));
}

// Enhanced keyboard shortcuts
function setupKeyboardShortcuts() {
    const shortcuts = {
        'Space': () => toggleVideoPlayback(),
        'KeyF': () => toggleFullscreen(),
        'KeyM': () => toggleVideoMute(),
        'Digit1': () => switchTab('notes'),
        'Digit2': () => switchTab('flashcards'),
        'Digit3': () => switchTab('discussion'),
        'Digit4': () => switchTab('resources'),
        'KeyS': (e) => { if (e.ctrlKey) { e.preventDefault(); toggleSidebar(); }},
        'KeyA': (e) => { if (e.ctrlKey) { e.preventDefault(); toggleAIAssistant(); }},
        'ArrowLeft': () => { if (document.querySelector('.tab-btn[onclick*="flashcards"]').classList.contains('active')) previousCard(); },
        'ArrowRight': () => { if (document.querySelector('.tab-btn[onclick*="flashcards"]').classList.contains('active')) nextCard(); },
        'ArrowUp': () => { if (document.querySelector('.tab-btn[onclick*="flashcards"]').classList.contains('active')) flipCard(); },
        'Escape': () => { if (aiAssistantOpen) toggleAIAssistant(); }
    };
    
    document.addEventListener('keydown', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        const key = e.code;
        if (shortcuts[key]) {
            e.preventDefault();
            shortcuts[key](e);
        }
    });
}

// Enhanced sidebar functions
function toggleSidebar() {
    const sidebar = document.getElementById('courseSidebar');
    const collapseBtn = document.querySelector('.collapse-btn i');
    const mainContent = document.querySelector('.main-content');
    
    sidebarCollapsed = !sidebarCollapsed;
    sidebar.classList.toggle('collapsed');
    
    // Smooth icon transition
    if (sidebarCollapsed) {
        collapseBtn.style.transform = 'rotate(180deg)';
        mainContent.style.marginLeft = '60px';
    } else {
        collapseBtn.style.transform = 'rotate(0deg)';
        mainContent.style.marginLeft = '380px';
    }
    
    // Store preference
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed);
    
    // Track event
    trackEvent('sidebar_toggle', { collapsed: sidebarCollapsed });
}

// Enhanced module toggle with animation
function toggleModule(moduleHeader) {
    const moduleGroup = moduleHeader.parentElement;
    const chevron = moduleHeader.querySelector('.fa-chevron-down');
    const moduleContent = moduleGroup.querySelector('.module-content');
    
    // Close other modules with animation
    document.querySelectorAll('.module-group').forEach(group => {
        if (group !== moduleGroup && group.classList.contains('active')) {
            group.classList.remove('active');
            const otherChevron = group.querySelector('.fa-chevron-down');
            if (otherChevron) {
                otherChevron.style.transform = 'rotate(0deg)';
            }
        }
    });
    
    // Toggle current module
    const isActive = moduleGroup.classList.contains('active');
    moduleGroup.classList.toggle('active');
    
    // Smooth chevron animation
    if (chevron) {
        chevron.style.transform = isActive ? 'rotate(0deg)' : 'rotate(180deg)';
    }
    
    // Update current module tracking
    currentModule = isActive ? null : moduleGroup.getAttribute('data-module-id');
    
    // Track event
    trackEvent('module_toggle', { 
        module_id: moduleGroup.getAttribute('data-module-id'),
        expanded: !isActive 
    });
}

// Enhanced lesson loading with YouTube support
function loadLesson(lessonElement) {
    if (lessonElement.classList.contains('locked')) {
        showLockedMessage();
        return;
    }
    
    // Remove active class from all lessons with animation
    document.querySelectorAll('.lesson-item').forEach(item => {
        item.classList.remove('active');
        item.style.background = '';
    });
    
    // Add active class to clicked lesson with animation
    lessonElement.classList.add('active');
    lessonElement.style.background = 'linear-gradient(135deg, rgba(95, 96, 245, 0.1), rgba(118, 75, 162, 0.1))';
    
    // Get lesson data
    const videoId = lessonElement.getAttribute('data-video-id');
    const sourceType = lessonElement.getAttribute('data-source-type') || 'local';
    const youtubeId = lessonElement.getAttribute('data-youtube-id');
    const lessonTitle = lessonElement.querySelector('.lesson-title').textContent;
    const lessonDuration = lessonElement.getAttribute('data-duration');
    
    // Load video based on source type
    if (sourceType === 'youtube' && youtubeId) {
        loadYouTubeVideo(youtubeId, lessonTitle);
    } else {
        loadStandardVideo(videoId, lessonTitle);
    }
    
    // Update lesson progress
    updateLessonProgress(lessonElement);
    
    // Track event
    trackEvent('lesson_loaded', { 
        video_id: videoId, 
        source_type: sourceType,
        youtube_id: youtubeId,
        lesson_title: lessonTitle,
        duration: lessonDuration
    });
    
    // Show success notification
    showNotification(`📚 Loaded: ${lessonTitle}`, 'success');
}

// YouTube video loading function
async function loadYouTubeVideo(youtubeId, title) {
    try {
        // Show loading state
        showVideoLoading();
        
        // Hide standard player and show YouTube player
        const standardPlayer = document.getElementById('standardPlayer');
        const youtubePlayer = document.getElementById('youtubePlayer');
        
        if (standardPlayer) standardPlayer.style.display = 'none';
        if (youtubePlayer) youtubePlayer.style.display = 'block';
        
        // Update video info
        updateVideoInfo(title, 'YouTube Video');
        
        // Load YouTube video
        await youtubeManager.loadVideo(youtubeId, 'youtubeFrame');
        
        // Set current video type
        isYouTubeVideo = true;
        
        // Hide loading state
        hideVideoLoading();
        
        console.log(`✅ YouTube video loaded: ${youtubeId}`);
        
    } catch (error) {
        console.error('❌ Error loading YouTube video:', error);
        showNotification('Failed to load YouTube video. Please try again.', 'error');
        hideVideoLoading();
        
        // Fallback to error message
        showVideoError('Unable to load YouTube video');
    }
}

// Standard video loading function
function loadStandardVideo(videoId, title) {
    try {
        // Show loading state
        showVideoLoading();
        
        // Hide YouTube player and show standard player
        const standardPlayer = document.getElementById('standardPlayer');
        const youtubePlayer = document.getElementById('youtubePlayer');
        
        if (youtubePlayer) youtubePlayer.style.display = 'none';
        if (standardPlayer) standardPlayer.style.display = 'block';
        
        // Update video source
        const videoElement = document.getElementById('mainVideo');
        if (videoElement) {
            const source = videoElement.querySelector('source');
            if (source) {
                source.src = `/static/videos/${videoId}.mp4`;
                videoElement.load(); // Reload the video element
            }
            
            // Update poster
            videoElement.poster = `/static/images/video-poster-${videoId}.jpg`;
        }
        
        // Update video info
        updateVideoInfo(title, 'Video Lesson');
        
        // Set current video type
        isYouTubeVideo = false;
        currentVideo = videoElement;
        
        // Hide loading state when video is ready
        videoElement.addEventListener('canplay', hideVideoLoading, { once: true });
        
        console.log(`✅ Standard video loaded: ${videoId}`);
        
    } catch (error) {
        console.error('❌ Error loading standard video:', error);
        showNotification('Failed to load video. Please try again.', 'error');
        hideVideoLoading();
        showVideoError('Unable to load video file');
    }
}

// Update video information display
function updateVideoInfo(title, type) {
    const videoTitle = document.querySelector('.video-title');
    const videoMeta = document.querySelector('.video-meta');
    
    if (videoTitle) {
        videoTitle.textContent = title;
    }
    
    // Add source type indicator
    let sourceIndicator = document.querySelector('.video-source-indicator');
    if (!sourceIndicator) {
        sourceIndicator = document.createElement('span');
        sourceIndicator.className = 'video-source-indicator';
        if (videoMeta) {
            videoMeta.insertBefore(sourceIndicator, videoMeta.firstChild);
        }
    }
    
    sourceIndicator.innerHTML = `<i class="fab fa-youtube"></i> ${type}`;
    sourceIndicator.className = `video-source-indicator ${isYouTubeVideo ? 'youtube' : 'local'}`;
}

// Enhanced video functions
function playVideo() {
    if (isYouTubeVideo) {
        youtubeManager.play();
    } else if (currentVideo) {
        currentVideo.play();
    }
    hideVideoOverlay();
}

function pauseVideo() {
    if (isYouTubeVideo) {
        youtubeManager.pause();
    } else if (currentVideo) {
        currentVideo.pause();
    }
}

function toggleVideoPlayback() {
    if (isYouTubeVideo) {
        const state = youtubeManager.player?.getPlayerState();
        if (state === YT.PlayerState.PLAYING) {
            youtubeManager.pause();
        } else {
            youtubeManager.play();
        }
    } else if (currentVideo) {
        if (currentVideo.paused) {
            currentVideo.play();
        } else {
            currentVideo.pause();
        }
    }
}

// Enhanced tab switching with smooth animations
function switchTab(tabName) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.transform = '';
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        content.style.opacity = '0';
        content.style.transform = 'translateY(10px)';
    });
    
    // Add active class to selected tab with animation
    const activeTabBtn = document.querySelector(`.tab-btn[onclick*="${tabName}"]`);
    const activeTabContent = document.getElementById(`${tabName}Tab`);
    
    if (activeTabBtn && activeTabContent) {
        activeTabBtn.classList.add('active');
        activeTabBtn.style.transform = 'translateY(-2px)';
        
        // Smooth content transition
        setTimeout(() => {
            activeTabContent.classList.add('active');
            activeTabContent.style.opacity = '1';
            activeTabContent.style.transform = 'translateY(0)';
        }, 150);
        
        // Initialize tab-specific features
        initializeTabFeatures(tabName);
        
        // Track event
        trackEvent('tab_switched', { tab_name: tabName });
        
        // Update study session
        if (tabName === 'notes') studySession.notesViewed++;
        if (tabName === 'flashcards') studySession.flashcardsStudied++;
        if (tabName === 'discussion') studySession.discussionParticipated = true;
    }
}

// Initialize tab-specific features
function initializeTabFeatures(tabName) {
    switch(tabName) {
        case 'notes':
            animateNotesSections();
            break;
        case 'flashcards':
            initializeEnhancedFlashcards();
            break;
        case 'discussion':
            scrollToBottomOfDiscussion();
            break;
        case 'resources':
            animateResourceItems();
            break;
    }
}

// Enhanced flashcards with improved animations
function initializeEnhancedFlashcards() {
    if (flashcards.length === 0) return;
    
    updateFlashcardDisplay();
    updateFlashcardStats();
    setupFlashcardGestures();
}

function flipCard() {
    const cardElement = document.getElementById('currentCard');
    if (!cardElement) return;
    
    isFlipped = !isFlipped;
    cardElement.classList.toggle('flipped');
    
    // Add flip sound effect (if available)
    playSound('flip');
    
    // Track flip
    trackEvent('flashcard_flipped', { 
        card_id: currentFlashcard, 
        flipped_to: isFlipped ? 'back' : 'front' 
    });
}

// Enhanced AI Assistant
function toggleAIAssistant() {
    const panel = document.getElementById('aiAssistantPanel');
    const fab = document.querySelector('.ai-assistant-fab');
    
    aiAssistantOpen = !aiAssistantOpen;
    panel.classList.toggle('active');
      // Animate FAB
    if (aiAssistantOpen) {
        fab.style.transform = 'rotate(45deg) scale(0.9)';
        fab.innerHTML = '<i class="fas fa-times"></i>';
        
        // Focus on input
        setTimeout(() => {
            const input = document.getElementById('aiInput');
            if (input) input.focus();
        }, 300);
    } else {
        fab.style.transform = 'rotate(0deg) scale(1)';
        fab.innerHTML = '<i class="fas fa-robot"></i>';
    }
    
    // Track event
    trackEvent('ai_assistant_toggle', { opened: aiAssistantOpen });
}

// Enhanced AI message sending
function sendAIMessage() {
    const input = document.getElementById('aiInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addAIMessage(message, 'user');
    input.value = '';
    
    // Show typing indicator
    showAITyping();
    
    // Simulate AI response (replace with actual AI call)
    setTimeout(() => {
        hideAITyping();
        const aiResponse = generateAIResponse(message);
        addAIMessage(aiResponse, 'ai');
    }, 1500);
    
    // Track event
    trackEvent('ai_message_sent', { message_length: message.length });
}

// Generate AI response (placeholder - replace with actual AI integration)
function generateAIResponse(userMessage) {
    const responses = [
        "That's a great question! Let me help you understand this concept better.",
        "I can see you're working hard on this topic. Here's what I think...",
        "This is an important concept in programming. Let me break it down for you.",
        "Great observation! This relates to what we learned earlier about..."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
}

// AI typing indicator functions
function showAITyping() {
    const chatContainer = document.querySelector('.ai-chat');
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'chat-message ai-message typing-indicator';
    typingIndicator.innerHTML = `
        <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    chatContainer.appendChild(typingIndicator);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function hideAITyping() {
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Enhanced message adding
function addAIMessage(message, sender) {
    const chatContainer = document.querySelector('.ai-chat');
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${sender}-message`;
    
    messageElement.innerHTML = `
        <div class="message-content">
            ${message}
        </div>
        <div class="message-time">
            ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </div>
    `;
    
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    // Animate message in
    messageElement.style.opacity = '0';
    messageElement.style.transform = 'translateY(10px)';
    setTimeout(() => {
        messageElement.style.opacity = '1';
        messageElement.style.transform = 'translateY(0)';
        messageElement.style.transition = 'all 0.3s ease';
    }, 50);
}

// Study session tracking
function trackStudySession() {
    setInterval(() => {
        const sessionData = {
            ...studySession,
            duration: Date.now() - studySession.startTime,
            current_module: currentModule,
            current_tab: getCurrentActiveTab()
        };
        
        // Send to analytics (implement your analytics service)
        console.log('📊 Study session update:', sessionData);
    }, 30000); // Every 30 seconds
}

function pauseStudySession() {
    console.log('⏸️ Study session paused');
}

function resumeStudySession() {
    console.log('▶️ Study session resumed');
}

function getCurrentActiveTab() {
    const activeTab = document.querySelector('.tab-btn.active');
    return activeTab ? activeTab.textContent.trim() : 'unknown';
}

// Enhanced progress tracking
function updateProgressAnimations() {
    const progressBars = document.querySelectorAll('.progress-fill');
    progressBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0%';
        setTimeout(() => {
            bar.style.width = width;
            bar.style.transition = 'width 1s ease-out';
        }, 300);
    });
}

function updateLessonProgress(lessonElement) {
    // Mark lesson as completed
    lessonElement.classList.add('completed');
    const icon = lessonElement.querySelector('.lesson-icon');
    if (icon) {
        icon.className = 'fas fa-check lesson-icon';
        icon.style.color = '#10b981';
    }
    
    // Update overall progress
    updateCourseProgress();
}

function updateCourseProgress() {
    const totalLessons = document.querySelectorAll('.lesson-item').length;
    const completedLessons = document.querySelectorAll('.lesson-item.completed').length;
    const progress = Math.round((completedLessons / totalLessons) * 100);
    
    // Update progress bar
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-percent');
    
    if (progressFill) {
        progressFill.style.width = `${progress}%`;
    }
    if (progressText) {
        progressText.textContent = `${progress}%`;
    }
}

// Video progress tracking
function updateVideoProgress() {
    if (!currentVideo) return;
    
    const progress = (currentVideo.currentTime / currentVideo.duration) * 100;
    
    // Update progress bar if exists
    const videoProgress = document.querySelector('.video-progress-bar');
    if (videoProgress) {
        videoProgress.style.width = `${progress}%`;
    }
}

function toggleVideoPlayback() {
    if (!currentVideo) return;
    
    if (currentVideo.paused) {
        playVideo();
    } else {
        currentVideo.pause();
        showVideoOverlay();
    }
}

function toggleVideoMute() {
    if (!currentVideo) return;
    
    currentVideo.muted = !currentVideo.muted;
    const muteBtn = document.querySelector('.mute-btn');
    if (muteBtn) {
        muteBtn.innerHTML = currentVideo.muted ? 
            '<i class="fas fa-volume-mute"></i>' : 
            '<i class="fas fa-volume-up"></i>';
    }
}

// Loading states
function showVideoLoading() {
    const playerContainer = document.getElementById('videoPlayerContainer');
    if (!playerContainer) return;
    
    let loadingOverlay = document.getElementById('videoLoadingOverlay');
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'videoLoadingOverlay';
        loadingOverlay.className = 'video-loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Loading video...</p>
        `;
        playerContainer.appendChild(loadingOverlay);
    }
    
    loadingOverlay.style.display = 'flex';
}

function hideVideoLoading() {
    const loadingOverlay = document.getElementById('videoLoadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

function showVideoError(message) {
    const playerContainer = document.getElementById('videoPlayerContainer');
    if (!playerContainer) return;
    
    let errorOverlay = document.getElementById('videoErrorOverlay');
    if (!errorOverlay) {
        errorOverlay = document.createElement('div');
        errorOverlay.id = 'videoErrorOverlay';
        errorOverlay.className = 'video-error-overlay';
        playerContainer.appendChild(errorOverlay);
    }
    
    errorOverlay.innerHTML = `
        <div class="error-content">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Video Error</h3>
            <p>${message}</p>
            <button onclick="retryVideoLoad()" class="retry-btn">Try Again</button>
        </div>
    `;
    
    errorOverlay.style.display = 'flex';
}

// Animation helpers
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.note-section, .flashcard, .message, .resource-item');
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

function animateNotesSections() {
    const sections = document.querySelectorAll('.note-section');
    sections.forEach((section, index) => {
        setTimeout(() => {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
            section.style.transition = 'all 0.4s ease';
        }, index * 100);
    });
}

function animateResourceItems() {
    const items = document.querySelectorAll('.resource-item');
    items.forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
            item.style.transition = 'all 0.3s ease';
        }, index * 100);
    });
}

// Accessibility setup
function setupAccessibility() {
    // Add ARIA labels
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach((btn, index) => {
        btn.setAttribute('aria-label', `Switch to ${btn.textContent.trim()} tab`);
        btn.setAttribute('role', 'tab');
        btn.setAttribute('tabindex', index === 0 ? '0' : '-1');
    });
    
    // Add keyboard navigation for flashcards
    const flashcard = document.getElementById('currentCard');
    if (flashcard) {
        flashcard.setAttribute('tabindex', '0');
        flashcard.setAttribute('aria-label', 'Press Enter to flip card');
        flashcard.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                flipCard();
            }
        });
    }
}

// Enhanced flashcard gestures (touch support)
function setupFlashcardGestures() {
    const flashcard = document.getElementById('currentCard');
    if (!flashcard) return;
    
    let startX = 0;
    let startY = 0;
    
    flashcard.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });
    
    flashcard.addEventListener('touchend', (e) => {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const diffX = startX - endX;
        const diffY = startY - endY;
        
        // Determine swipe direction
        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (Math.abs(diffX) > 50) { // Minimum swipe distance
                if (diffX > 0) {
                    nextCard(); // Swipe left = next
                } else {
                    previousCard(); // Swipe right = previous
                }
            }
        } else {
            if (Math.abs(diffY) > 50) {
                flipCard(); // Swipe up/down = flip
            }
        }
    });
}

// Handle responsive design
function handleResize() {
    const width = window.innerWidth;
    const sidebar = document.getElementById('courseSidebar');
    
    if (width <= 768) {
        // Mobile layout
        if (!sidebarCollapsed) {
            sidebar.classList.add('mobile-overlay');
        }
    } else {
        // Desktop layout
        sidebar.classList.remove('mobile-overlay');
    }
}

function trackScrollProgress() {
    const scrolled = (window.pageYOffset / (document.body.scrollHeight - window.innerHeight)) * 100;
    
    // Update scroll progress indicator if exists
    const scrollIndicator = document.querySelector('.scroll-progress');
    if (scrollIndicator) {
        scrollIndicator.style.width = `${scrolled}%`;
    }
}

// Enhanced video overlay functions
function showVideoOverlay() {
    const overlay = document.getElementById('videoOverlay');
    if (overlay) {
        overlay.classList.remove('hidden');
        overlay.style.opacity = '1';
    }
}

function hideVideoOverlay() {
    const overlay = document.getElementById('videoOverlay');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.classList.add('hidden');
        }, 300);
    }
}

function onVideoEnded() {
    showVideoOverlay();
    
    // Show completion message
    showNotification('🎉 Video completed! Great job!', 'success');
    
    // Auto-advance to next lesson if available
    const currentLesson = document.querySelector('.lesson-item.active');
    const nextLesson = currentLesson ? currentLesson.nextElementSibling : null;
    
    if (nextLesson && !nextLesson.classList.contains('locked')) {
        setTimeout(() => {
            loadLesson(nextLesson);
        }, 2000);
    }
}
