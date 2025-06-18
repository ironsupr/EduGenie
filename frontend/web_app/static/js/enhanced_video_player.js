/**
 * Enhanced Video Player for EduGenie Course Modules
 * Supports multiple video sources and adaptive streaming
 */

class EnhancedVideoPlayer {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            autoplay: false,
            controls: true,
            loop: false,
            muted: false,
            preload: 'metadata',
            playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
            defaultQuality: '720p',
            enableAnalytics: true,
            enableSubtitles: true,
            enableKeyboardShortcuts: true,
            ...options
        };
        
        this.currentVideo = null;
        this.videoSources = [];
        this.analyticsData = {
            startTime: null,
            watchTime: 0,
            pauseCount: 0,
            seekCount: 0,
            qualityChanges: 0
        };
        
        this.init();
    }
    
    init() {
        this.setupVideoContainer();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        console.log('🎥 Enhanced Video Player initialized');
    }
    
    /**
     * Load video from different sources
     */
    async loadVideo(videoData) {
        try {
            const sourceType = videoData.source_type || 'local';
            
            switch (sourceType) {
                case 'local':
                    await this.loadLocalVideo(videoData);
                    break;
                case 'youtube':
                    await this.loadYouTubeVideo(videoData);
                    break;
                case 'vimeo':
                    await this.loadVimeoVideo(videoData);
                    break;
                case 's3':
                case 'cdn':
                    await this.loadCloudVideo(videoData);
                    break;
                case 'streaming':
                    await this.loadStreamingVideo(videoData);
                    break;
                default:
                    throw new Error(`Unsupported video source type: ${sourceType}`);
            }
            
            this.setupVideoAnalytics();
            console.log(`✅ Video loaded: ${videoData.video_id}`);
            
        } catch (error) {
            console.error('❌ Error loading video:', error);
            this.showErrorMessage('Failed to load video. Please try again.');
        }
    }
    
    /**
     * Load local video files with multiple quality options
     */
    async loadLocalVideo(videoData) {
        const videoElement = this.createVideoElement();
        
        // Add multiple source elements for different qualities/formats
        videoData.sources.forEach(source => {
            const sourceElement = document.createElement('source');
            sourceElement.src = source.src;
            sourceElement.type = source.type;
            sourceElement.setAttribute('data-quality', source.quality);
            videoElement.appendChild(sourceElement);
        });
        
        // Add poster image
        if (videoData.poster) {
            videoElement.poster = videoData.poster;
        }
        
        // Add subtitle tracks
        if (videoData.subtitles) {
            videoData.subtitles.forEach(subtitle => {
                const trackElement = document.createElement('track');
                trackElement.src = subtitle.src;
                trackElement.srclang = subtitle.srclang;
                trackElement.label = subtitle.label;
                trackElement.kind = 'subtitles';
                if (subtitle.default) {
                    trackElement.default = true;
                }
                videoElement.appendChild(trackElement);
            });
        }
        
        this.replaceVideoElement(videoElement);
        await this.waitForVideoLoad();
    }
    
    /**
     * Load YouTube video with embedded player
     */
    async loadYouTubeVideo(videoData) {
        const source = videoData.sources[0];
        
        // Create YouTube iframe
        const iframe = document.createElement('iframe');
        iframe.src = source.embed_url;
        iframe.width = '100%';
        iframe.height = '100%';
        iframe.frameBorder = '0';
        iframe.allowFullscreen = true;
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        
        // Create container for iframe
        const iframeContainer = document.createElement('div');
        iframeContainer.className = 'youtube-container';
        iframeContainer.appendChild(iframe);
        
        this.replaceVideoElement(iframeContainer);
        
        // Load YouTube IFrame API if not already loaded
        if (!window.YT) {
            await this.loadYouTubeAPI();
        }
        
        this.setupYouTubePlayer(source);
    }
    
    /**
     * Load Vimeo video with embedded player
     */
    async loadVimeoVideo(videoData) {
        const source = videoData.sources[0];
        
        const iframe = document.createElement('iframe');
        iframe.src = source.embed_url;
        iframe.width = '100%';
        iframe.height = '100%';
        iframe.frameBorder = '0';
        iframe.allowFullscreen = true;
        iframe.allow = 'autoplay; fullscreen; picture-in-picture';
        
        const iframeContainer = document.createElement('div');
        iframeContainer.className = 'vimeo-container';
        iframeContainer.appendChild(iframe);
        
        this.replaceVideoElement(iframeContainer);
        
        // Load Vimeo Player API if needed
        if (window.Vimeo) {
            this.setupVimeoPlayer(iframe);
        }
    }
    
    /**
     * Load cloud-hosted video (S3, CDN, etc.)
     */
    async loadCloudVideo(videoData) {
        // Similar to local video but with cloud URLs
        await this.loadLocalVideo(videoData);
        
        // Add cloud-specific optimizations
        if (this.currentVideo) {
            // Enable cross-origin for cloud videos
            this.currentVideo.crossOrigin = 'anonymous';
            
            // Optimize loading for cloud sources
            this.currentVideo.preload = 'metadata';
        }
    }
    
    /**
     * Load adaptive streaming video (HLS/DASH)
     */
    async loadStreamingVideo(videoData) {
        const videoElement = this.createVideoElement();
        
        // Check for HLS support
        const hlsSource = videoData.sources.find(s => s.streaming_protocol === 'HLS');
        const dashSource = videoData.sources.find(s => s.streaming_protocol === 'DASH');
        
        if (hlsSource && this.canPlayHLS()) {
            await this.setupHLSPlayer(videoElement, hlsSource);
        } else if (dashSource && this.canPlayDASH()) {
            await this.setupDASHPlayer(videoElement, dashSource);
        } else {
            throw new Error('No compatible streaming format available');
        }
        
        this.replaceVideoElement(videoElement);
    }
    
    /**
     * Create standard HTML5 video element
     */
    createVideoElement() {
        const video = document.createElement('video');
        video.controls = this.options.controls;
        video.autoplay = this.options.autoplay;
        video.loop = this.options.loop;
        video.muted = this.options.muted;
        video.preload = this.options.preload;
        video.className = 'enhanced-video-player';
        video.style.width = '100%';
        video.style.height = '100%';
        
        return video;
    }
    
    /**
     * Replace current video element
     */
    replaceVideoElement(newElement) {
        const playerContainer = this.container.querySelector('.video-player');
        
        // Remove existing video
        const existingVideo = playerContainer.querySelector('video, iframe, .youtube-container, .vimeo-container');
        if (existingVideo) {
            existingVideo.remove();
        }
        
        // Add new video element
        playerContainer.appendChild(newElement);
        this.currentVideo = newElement;
    }
    
    /**
     * Setup video container with controls
     */
    setupVideoContainer() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="enhanced-video-container">
                <div class="video-player">
                    <!-- Video element will be inserted here -->
                </div>
                <div class="video-controls">
                    <div class="control-bar">
                        <button class="play-pause-btn" title="Play/Pause">
                            <i class="fas fa-play"></i>
                        </button>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-filled"></div>
                                <div class="progress-buffered"></div>
                            </div>
                        </div>
                        <span class="time-display">0:00 / 0:00</span>
                        <div class="volume-container">
                            <button class="volume-btn" title="Mute/Unmute">
                                <i class="fas fa-volume-up"></i>
                            </button>
                            <div class="volume-slider">
                                <input type="range" min="0" max="100" value="100">
                            </div>
                        </div>
                        <div class="settings-container">
                            <button class="settings-btn" title="Settings">
                                <i class="fas fa-cog"></i>
                            </button>
                            <div class="settings-menu">
                                <div class="quality-selector">
                                    <label>Quality:</label>
                                    <select class="quality-select">
                                        <option value="auto">Auto</option>
                                        <option value="1080p">1080p</option>
                                        <option value="720p">720p</option>
                                        <option value="480p">480p</option>
                                        <option value="360p">360p</option>
                                    </select>
                                </div>
                                <div class="playback-speed-selector">
                                    <label>Speed:</label>
                                    <select class="speed-select">
                                        <option value="0.5">0.5x</option>
                                        <option value="0.75">0.75x</option>
                                        <option value="1" selected>1x</option>
                                        <option value="1.25">1.25x</option>
                                        <option value="1.5">1.5x</option>
                                        <option value="2">2x</option>
                                    </select>
                                </div>
                                <div class="subtitle-selector">
                                    <label>Subtitles:</label>
                                    <select class="subtitle-select">
                                        <option value="off">Off</option>
                                        <option value="en">English</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <button class="fullscreen-btn" title="Fullscreen">
                            <i class="fas fa-expand"></i>
                        </button>
                    </div>
                </div>
                <div class="video-overlay">
                    <div class="loading-spinner" style="display: none;">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>Loading video...</span>
                    </div>
                    <div class="error-message" style="display: none;">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>Error loading video</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Setup event listeners for video controls
     */
    setupEventListeners() {
        // Play/Pause button
        const playPauseBtn = this.container.querySelector('.play-pause-btn');
        playPauseBtn?.addEventListener('click', () => this.togglePlayPause());
        
        // Progress bar
        const progressBar = this.container.querySelector('.progress-bar');
        progressBar?.addEventListener('click', (e) => this.seekTo(e));
        
        // Volume controls
        const volumeBtn = this.container.querySelector('.volume-btn');
        const volumeSlider = this.container.querySelector('.volume-slider input');
        volumeBtn?.addEventListener('click', () => this.toggleMute());
        volumeSlider?.addEventListener('input', (e) => this.setVolume(e.target.value));
        
        // Settings controls
        const qualitySelect = this.container.querySelector('.quality-select');
        const speedSelect = this.container.querySelector('.speed-select');
        const subtitleSelect = this.container.querySelector('.subtitle-select');
        
        qualitySelect?.addEventListener('change', (e) => this.changeQuality(e.target.value));
        speedSelect?.addEventListener('change', (e) => this.changePlaybackSpeed(e.target.value));
        subtitleSelect?.addEventListener('change', (e) => this.changeSubtitles(e.target.value));
        
        // Fullscreen button
        const fullscreenBtn = this.container.querySelector('.fullscreen-btn');
        fullscreenBtn?.addEventListener('click', () => this.toggleFullscreen());
    }
    
    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        if (!this.options.enableKeyboardShortcuts) return;
        
        document.addEventListener('keydown', (e) => {
            if (!this.isVideoFocused()) return;
            
            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    this.togglePlayPause();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.skipTime(-10);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.skipTime(10);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.adjustVolume(0.1);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.adjustVolume(-0.1);
                    break;
                case 'KeyF':
                    e.preventDefault();
                    this.toggleFullscreen();
                    break;
                case 'KeyM':
                    e.preventDefault();
                    this.toggleMute();
                    break;
            }
        });
    }
    
    /**
     * Video control methods
     */
    togglePlayPause() {
        if (!this.currentVideo) return;
        
        if (this.currentVideo.paused) {
            this.play();
        } else {
            this.pause();
        }
    }
    
    play() {
        if (this.currentVideo && this.currentVideo.play) {
            this.currentVideo.play();
            this.updatePlayPauseIcon(false);
            this.startAnalyticsTracking();
        }
    }
    
    pause() {
        if (this.currentVideo && this.currentVideo.pause) {
            this.currentVideo.pause();
            this.updatePlayPauseIcon(true);
            this.analyticsData.pauseCount++;
        }
    }
    
    seekTo(event) {
        if (!this.currentVideo || !this.currentVideo.duration) return;
        
        const progressBar = event.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const percentage = clickX / rect.width;
        const newTime = percentage * this.currentVideo.duration;
        
        this.currentVideo.currentTime = newTime;
        this.analyticsData.seekCount++;
    }
    
    skipTime(seconds) {
        if (!this.currentVideo) return;
        
        this.currentVideo.currentTime += seconds;
    }
    
    setVolume(volume) {
        if (!this.currentVideo) return;
        
        this.currentVideo.volume = volume / 100;
        this.updateVolumeIcon(volume > 0);
    }
    
    toggleMute() {
        if (!this.currentVideo) return;
        
        this.currentVideo.muted = !this.currentVideo.muted;
        this.updateVolumeIcon(!this.currentVideo.muted);
    }
    
    toggleFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            this.container.requestFullscreen();
        }
    }
    
    changeQuality(quality) {
        console.log(`🎯 Changing video quality to: ${quality}`);
        this.analyticsData.qualityChanges++;
        // Implementation depends on video source type
    }
    
    changePlaybackSpeed(speed) {
        if (!this.currentVideo) return;
        
        this.currentVideo.playbackRate = parseFloat(speed);
        console.log(`⚡ Playback speed changed to: ${speed}x`);
    }
    
    changeSubtitles(language) {
        const tracks = this.currentVideo?.textTracks;
        if (!tracks) return;
        
        for (let track of tracks) {
            track.mode = track.language === language ? 'showing' : 'hidden';
        }
        
        console.log(`📝 Subtitles changed to: ${language}`);
    }
    
    /**
     * Analytics and tracking
     */
    setupVideoAnalytics() {
        if (!this.options.enableAnalytics) return;
        
        this.analyticsData.startTime = Date.now();
        
        // Track various video events
        this.currentVideo?.addEventListener('play', () => {
            this.trackEvent('video_play');
        });
        
        this.currentVideo?.addEventListener('pause', () => {
            this.trackEvent('video_pause');
        });
        
        this.currentVideo?.addEventListener('ended', () => {
            this.trackEvent('video_completed');
        });
        
        this.currentVideo?.addEventListener('timeupdate', () => {
            this.updateWatchTime();
        });
    }
    
    trackEvent(eventName, data = {}) {
        if (window.gtag) {
            window.gtag('event', eventName, {
                'video_id': this.currentVideoId,
                'current_time': this.currentVideo?.currentTime,
                'duration': this.currentVideo?.duration,
                ...data
            });
        }
        
        console.log(`📊 Video Event: ${eventName}`, data);
    }
    
    /**
     * Utility methods
     */
    showLoadingSpinner() {
        const spinner = this.container.querySelector('.loading-spinner');
        if (spinner) spinner.style.display = 'flex';
    }
    
    hideLoadingSpinner() {
        const spinner = this.container.querySelector('.loading-spinner');
        if (spinner) spinner.style.display = 'none';
    }
    
    showErrorMessage(message) {
        const errorDiv = this.container.querySelector('.error-message span');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.parentElement.style.display = 'flex';
        }
    }
    
    waitForVideoLoad() {
        return new Promise((resolve, reject) => {
            if (!this.currentVideo) {
                reject('No video element');
                return;
            }
            
            this.currentVideo.addEventListener('loadedmetadata', resolve);
            this.currentVideo.addEventListener('error', reject);
        });
    }
    
    isVideoFocused() {
        return this.container.contains(document.activeElement) || 
               document.activeElement === this.currentVideo;
    }
    
    updatePlayPauseIcon(isPaused) {
        const icon = this.container.querySelector('.play-pause-btn i');
        if (icon) {
            icon.className = isPaused ? 'fas fa-play' : 'fas fa-pause';
        }
    }
    
    updateVolumeIcon(hasVolume) {
        const icon = this.container.querySelector('.volume-btn i');
        if (icon) {
            icon.className = hasVolume ? 'fas fa-volume-up' : 'fas fa-volume-mute';
        }
    }
}

// Export for use in course modules
window.EnhancedVideoPlayer = EnhancedVideoPlayer;
