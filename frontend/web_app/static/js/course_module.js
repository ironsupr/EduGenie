// Course Module JavaScript - EduGenie

// Global Variables
let currentVideo = null;
let currentFlashcard = 0;
let flashcards = [];
let isFlipped = false;
let aiAssistantOpen = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadFlashcards();
    setupEventListeners();
});

// Initialize application
function initializeApp() {
    // Set up video player
    currentVideo = document.getElementById('mainVideo');
    
    // Initialize first tab
    switchTab('notes');
    
    // Setup responsive behavior
    handleResize();
    window.addEventListener('resize', handleResize);
}

// Setup event listeners
function setupEventListeners() {
    // Video events
    if (currentVideo) {
        currentVideo.addEventListener('loadstart', showVideoOverlay);
        currentVideo.addEventListener('canplay', hideVideoOverlay);
        currentVideo.addEventListener('play', hideVideoOverlay);
        currentVideo.addEventListener('pause', showVideoOverlay);
        currentVideo.addEventListener('ended', onVideoEnded);
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Click outside to close AI assistant
    document.addEventListener('click', function(e) {
        const aiPanel = document.getElementById('aiAssistantPanel');
        const aiButton = document.querySelector('.ai-assistant-fab');
        
        if (aiAssistantOpen && 
            !aiPanel.contains(e.target) && 
            !aiButton.contains(e.target)) {
            toggleAIAssistant();
        }
    });
}

// Sidebar Functions
function toggleSidebar() {
    const sidebar = document.getElementById('courseSidebar');
    const collapseBtn = document.querySelector('.collapse-btn i');
    
    sidebar.classList.toggle('collapsed');
    
    if (sidebar.classList.contains('collapsed')) {
        collapseBtn.classList.remove('fa-chevron-left');
        collapseBtn.classList.add('fa-chevron-right');
    } else {
        collapseBtn.classList.remove('fa-chevron-right');
        collapseBtn.classList.add('fa-chevron-left');
    }
}

function toggleModule(moduleHeader) {
    const moduleGroup = moduleHeader.parentElement;
    const chevron = moduleHeader.querySelector('.fa-chevron-down');
    
    // Close other modules
    document.querySelectorAll('.module-group').forEach(group => {
        if (group !== moduleGroup) {
            group.classList.remove('active');
        }
    });
    
    // Toggle current module
    moduleGroup.classList.toggle('active');
    
    // Animate chevron
    chevron.style.transform = moduleGroup.classList.contains('active') ? 
        'rotate(180deg)' : 'rotate(0deg)';
}

function loadLesson(lessonElement) {
    if (lessonElement.classList.contains('locked')) {
        showLockedMessage();
        return;
    }
    
    // Remove active class from all lessons
    document.querySelectorAll('.lesson-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to clicked lesson
    lessonElement.classList.add('active');
    
    // Get video ID and load video
    const videoId = lessonElement.getAttribute('data-video-id');
    const lessonTitle = lessonElement.querySelector('.lesson-title').textContent;
    
    loadVideo(videoId, lessonTitle);
    
    // Mark lesson as completed if not already
    setTimeout(() => {
        if (!lessonElement.classList.contains('completed')) {
            markLessonCompleted(lessonElement);
        }
    }, 1000); // Mark complete after 1 second of viewing
}

function showLockedMessage() {
    showNotification('This lesson is locked. Complete previous lessons to unlock.', 'warning');
}

function markLessonCompleted(lessonElement) {
    lessonElement.classList.add('completed');
    const icon = lessonElement.querySelector('.lesson-icon');
    icon.classList.remove('fa-play', 'fa-circle');
    icon.classList.add('fa-check');
    
    updateCourseProgress();
}

function updateCourseProgress() {
    const totalLessons = document.querySelectorAll('.lesson-item:not(.locked)').length;
    const completedLessons = document.querySelectorAll('.lesson-item.completed').length;
    const progress = Math.round((completedLessons / totalLessons) * 100);
    
    document.querySelector('.progress-percent').textContent = progress + '%';
    document.querySelector('.progress-fill').style.width = progress + '%';
}

// Video Functions
function loadVideo(videoId, title) {
    if (!currentVideo) return;
    
    // Update video source
    currentVideo.src = `/static/videos/${videoId}.mp4`;
    currentVideo.load();
    
    // Update video title
    document.querySelector('.video-title').textContent = title;
    
    showVideoOverlay();
}

function playVideo() {
    if (!currentVideo) return;
    
    currentVideo.play();
    hideVideoOverlay();
}

function showVideoOverlay() {
    const overlay = document.getElementById('videoOverlay');
    if (overlay) {
        overlay.classList.remove('hidden');
    }
}

function hideVideoOverlay() {
    const overlay = document.getElementById('videoOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

function onVideoEnded() {
    showVideoOverlay();
    showNotification('Lesson completed! Ready for the next one?', 'success');
}

function toggleBookmark() {
    const btn = event.target.closest('.action-btn');
    const icon = btn.querySelector('i');
    
    if (icon.classList.contains('fas')) {
        icon.classList.remove('fas');
        icon.classList.add('far');
        showNotification('Bookmark removed', 'info');
    } else {
        icon.classList.remove('far');
        icon.classList.add('fas');
        showNotification('Bookmarked!', 'success');
    }
}

function toggleSpeed() {
    if (!currentVideo) return;
    
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(currentVideo.playbackRate);
    const nextIndex = (currentIndex + 1) % speeds.length;
    
    currentVideo.playbackRate = speeds[nextIndex];
    showNotification(`Speed: ${speeds[nextIndex]}x`, 'info');
}

function toggleFullscreen() {
    if (!currentVideo) return;
    
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        currentVideo.requestFullscreen();
    }
}

// Tab Functions
function switchTab(tabName) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Add active class to clicked tab and corresponding content
    document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active');
    document.getElementById(`${tabName}Tab`).classList.add('active');
    
    // Special handling for different tabs
    if (tabName === 'flashcards') {
        initializeFlashcards();
    } else if (tabName === 'discussion') {
        scrollToBottomOfDiscussion();
    }
}

// Notes Functions
function regenerateNotes() {
    const btn = event.target.closest('.btn-secondary');
    const icon = btn.querySelector('i');
    
    btn.disabled = true;
    icon.classList.add('fa-spin');
    
    // Simulate API call
    setTimeout(() => {
        btn.disabled = false;
        icon.classList.remove('fa-spin');
        showNotification('Notes regenerated successfully!', 'success');
    }, 2000);
}

function exportNotes() {
    // Create a simple text export of the notes
    const notes = document.querySelector('.notes-content');
    const content = notes.innerText;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lesson-notes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Notes exported successfully!', 'success');
}

function copyCode(btn) {
    const codeBlock = btn.previousElementSibling;
    const code = codeBlock.textContent;
    
    navigator.clipboard.writeText(code).then(() => {
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i>';
        btn.style.background = 'rgba(16, 185, 129, 0.2)';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
        }, 2000);
        
        showNotification('Code copied to clipboard!', 'success');
    });
}

// Flashcards Functions
function loadFlashcards() {
    flashcards = [
        {
            front: "What is Python?",
            back: "Python is a high-level, interpreted programming language known for its simplicity, readability, and versatility. It's widely used in web development, data science, machine learning, and automation."
        },
        {
            front: "What does 'interpreted' mean in programming?",
            back: "An interpreted language is executed line by line by an interpreter at runtime, rather than being compiled into machine code beforehand. This makes development faster but execution slower than compiled languages."
        },
        {
            front: "Name three key features of Python",
            back: "1. Simple and readable syntax\n2. Dynamic typing\n3. Extensive standard library and third-party packages"
        },
        {
            front: "What is the difference between Python 2 and Python 3?",
            back: "Python 3 is the current version with improved Unicode support, better syntax, and new features. Python 2 reached end-of-life in 2020 and is no longer supported."
        },
        {
            front: "How do you print 'Hello, World!' in Python?",
            back: "print('Hello, World!')\n\nNote: In Python 2, you could use print 'Hello, World!' without parentheses, but Python 3 requires the parentheses."
        }
    ];
    
    currentFlashcard = 0;
    updateFlashcardDisplay();
}

function initializeFlashcards() {
    updateFlashcardDisplay();
    updateFlashcardStats();
}

function updateFlashcardDisplay() {
    if (flashcards.length === 0) return;
    
    const card = flashcards[currentFlashcard];
    const cardElement = document.getElementById('currentCard');
    const frontContent = cardElement.querySelector('.flashcard-front .card-content');
    const backContent = cardElement.querySelector('.flashcard-back .card-content');
    const counter = document.querySelector('.card-counter');
    
    frontContent.innerHTML = `<h4>${card.front}</h4><p class="card-hint">Click to reveal answer</p>`;
    backContent.innerHTML = `<p>${card.back.replace(/\n/g, '<br>')}</p>`;
    counter.textContent = `${currentFlashcard + 1} / ${flashcards.length}`;
    
    // Reset flip state
    cardElement.classList.remove('flipped');
    isFlipped = false;
}

function flipCard() {
    const cardElement = document.getElementById('currentCard');
    cardElement.classList.toggle('flipped');
    isFlipped = !isFlipped;
}

function nextCard() {
    if (currentFlashcard < flashcards.length - 1) {
        currentFlashcard++;
        updateFlashcardDisplay();
    }
}

function previousCard() {
    if (currentFlashcard > 0) {
        currentFlashcard--;
        updateFlashcardDisplay();
    }
}

function markDifficulty(difficulty) {
    const colors = {
        easy: '#10b981',
        medium: '#f59e0b',
        hard: '#ef4444'
    };
    
    // Visual feedback
    const btn = event.target.closest('.difficulty-btn');
    const originalBg = btn.style.background;
    btn.style.background = colors[difficulty];
    btn.style.color = 'white';
    
    setTimeout(() => {
        btn.style.background = originalBg;
        btn.style.color = '';
    }, 500);
    
    showNotification(`Marked as ${difficulty}`, 'info');
    
    // Auto-advance to next card
    setTimeout(() => {
        if (currentFlashcard < flashcards.length - 1) {
            nextCard();
        }
    }, 1000);
}

function shuffleCards() {
    // Fisher-Yates shuffle
    for (let i = flashcards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [flashcards[i], flashcards[j]] = [flashcards[j], flashcards[i]];
    }
    
    currentFlashcard = 0;
    updateFlashcardDisplay();
    showNotification('Flashcards shuffled!', 'info');
}

function resetProgress() {
    currentFlashcard = 0;
    updateFlashcardDisplay();
    showNotification('Progress reset', 'info');
}

function createFlashcard() {
    const front = prompt('Enter the question:');
    if (!front) return;
    
    const back = prompt('Enter the answer:');
    if (!back) return;
    
    flashcards.push({ front, back });
    updateFlashcardStats();
    showNotification('Flashcard created!', 'success');
}

function updateFlashcardStats() {
    const totalCards = flashcards.length;
    document.querySelector('.flashcard-stats .stat:first-child').innerHTML = 
        `<i class="fas fa-cards-blank"></i> ${totalCards} cards`;
}

// Discussion Functions
function scrollToBottomOfDiscussion() {
    const thread = document.querySelector('.discussion-thread');
    if (thread) {
        thread.scrollTop = thread.scrollHeight;
    }
}

function likeMessage(btn) {
    const countSpan = btn.querySelector('span');
    const icon = btn.querySelector('i');
    let count = parseInt(countSpan.textContent);
    
    if (btn.classList.contains('liked')) {
        // Unlike
        btn.classList.remove('liked');
        icon.classList.remove('fas');
        icon.classList.add('far');
        count--;
    } else {
        // Like
        btn.classList.add('liked');
        icon.classList.remove('far');
        icon.classList.add('fas');
        count++;
    }
    
    countSpan.textContent = count;
}

function replyToMessage(btn) {
    const message = btn.closest('.message');
    const author = message.querySelector('.message-author').textContent;
    const input = document.getElementById('messageInput');
    
    input.value = `@${author} `;
    input.focus();
}

function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Create new message element
    const messageElement = createMessageElement(message, 'You', 'just now');
    
    // Add to discussion thread
    const thread = document.querySelector('.discussion-thread');
    thread.appendChild(messageElement);
    
    // Clear input and scroll to bottom
    input.value = '';
    scrollToBottomOfDiscussion();
    
    showNotification('Message sent!', 'success');
}

function createMessageElement(text, author, time) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <img src="/static/images/your-avatar.jpg" alt="${author}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2NzY2NzkiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSI4IiB5PSI4Ij4KPHBhdGggZD0iTTEyIDEyQzE0LjIwOTEgMTIgMTYgMTAuMjA5MSAxNiA4QzE2IDUuNzkwODYgMTQuMjA5MSA0IDEyIDRDOS43OTA4NiA0IDggNS43OTA4NiA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTIgMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTIgMTRDOC42ODYyOSAxNCA2IDE2LjY4NjMgNiAyMFYyMkgxOFYyMEMxOCAxNi42ODYzIDE1LjMxMzcgMTQgMTIgMTRaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPC9zdmc+'">
        </div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-author">${author}</span>
                <span class="message-time">${time}</span>
            </div>
            <div class="message-text">
                <p>${text}</p>
            </div>
            <div class="message-actions">
                <button class="message-action" onclick="likeMessage(this)">
                    <i class="far fa-heart"></i>
                    <span>0</span>
                </button>
                <button class="message-action" onclick="replyToMessage(this)">
                    <i class="fas fa-reply"></i>
                    Reply
                </button>
            </div>
        </div>
    `;
    
    return messageDiv;
}

function handleMessageInput(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// Resources Functions
function downloadResource(filename) {
    // Simulate file download
    const link = document.createElement('a');
    link.href = `/static/resources/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification(`Downloading ${filename}...`, 'info');
}

function viewResource(filename) {
    // Open resource in new tab
    window.open(`/static/resources/${filename}`, '_blank');
}

function uploadResource() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.txt,.zip';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            showNotification(`Uploading ${file.name}...`, 'info');
            
            // Simulate upload
            setTimeout(() => {
                showNotification(`${file.name} uploaded successfully!`, 'success');
            }, 2000);
        }
    };
    
    input.click();
}

function openLink(url) {
    window.open(url, '_blank');
}

// AI Assistant Functions
function toggleAIAssistant() {
    const panel = document.getElementById('aiAssistantPanel');
    const fab = document.querySelector('.ai-assistant-fab');
    
    aiAssistantOpen = !aiAssistantOpen;
    
    if (aiAssistantOpen) {
        panel.classList.add('active');
        fab.style.transform = 'scale(0.9)';
    } else {
        panel.classList.remove('active');
        fab.style.transform = 'scale(1)';
    }
}

function sendAIMessage() {
    const input = document.getElementById('aiInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addAIMessage(message, 'user');
    
    // Clear input
    input.value = '';
    
    // Simulate AI response
    setTimeout(() => {
        const responses = [
            "That's a great question! Python is particularly useful for beginners because of its readable syntax that resembles natural English.",
            "I'd be happy to help! Can you tell me more about what specific aspect you're struggling with?",
            "Here's a tip: Try breaking down the problem into smaller steps. What's the first thing you need to accomplish?",
            "Python's versatility makes it perfect for web development, data science, automation, and more. What interests you most?",
            "Remember, practice is key in programming. Try writing small programs to reinforce what you've learned!"
        ];
        
        const response = responses[Math.floor(Math.random() * responses.length)];
        addAIMessage(response, 'ai');
    }, 1000);
}

function addAIMessage(message, sender) {
    const chat = document.querySelector('.ai-chat');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}-message`;
    
    messageDiv.innerHTML = `
        <div class="message-content">${message}</div>
    `;
    
    chat.appendChild(messageDiv);
    chat.scrollTop = chat.scrollHeight;
}

function handleAIInput(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendAIMessage();
    }
}

// Utility Functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '80px',
        right: '20px',
        background: getNotificationColor(type),
        color: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        zIndex: '10000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        minWidth: '300px',
        animation: 'slideInRight 0.3s ease'
    });
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function getNotificationColor(type) {
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#5f60f5'
    };
    return colors[type] || '#5f60f5';
}

// Keyboard Shortcuts
function handleKeyboardShortcuts(event) {
    // Space bar to play/pause video
    if (event.code === 'Space' && event.target === document.body) {
        event.preventDefault();
        if (currentVideo) {
            if (currentVideo.paused) {
                playVideo();
            } else {
                currentVideo.pause();
            }
        }
    }
    
    // Arrow keys for flashcard navigation (when flashcard tab is active)
    if (document.getElementById('flashcardsTab').classList.contains('active')) {
        if (event.code === 'ArrowLeft') {
            event.preventDefault();
            previousCard();
        } else if (event.code === 'ArrowRight') {
            event.preventDefault();
            nextCard();
        } else if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
            event.preventDefault();
            flipCard();
        }
    }
    
    // Tab switching (1-4 keys)
    if (event.code >= 'Digit1' && event.code <= 'Digit4') {
        const tabNames = ['notes', 'flashcards', 'discussion', 'resources'];
        const index = parseInt(event.code.replace('Digit', '')) - 1;
        if (index < tabNames.length) {
            switchTab(tabNames[index]);
        }
    }
    
    // Toggle sidebar (S key)
    if (event.code === 'KeyS' && event.ctrlKey) {
        event.preventDefault();
        toggleSidebar();
    }
    
    // Toggle AI assistant (A key)
    if (event.code === 'KeyA' && event.ctrlKey) {
        event.preventDefault();
        toggleAIAssistant();
    }
}

// Responsive handling
function handleResize() {
    const sidebar = document.getElementById('courseSidebar');
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        sidebar.classList.add('mobile');
    } else {
        sidebar.classList.remove('mobile', 'active');
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        opacity: 0.8;
        transition: opacity 0.3s ease;
    }
    
    .notification-close:hover {
        opacity: 1;
        background: rgba(255, 255, 255, 0.1);
    }
`;

document.head.appendChild(style);

// Export functions for global access
window.toggleSidebar = toggleSidebar;
window.toggleModule = toggleModule;
window.loadLesson = loadLesson;
window.showLockedMessage = showLockedMessage;
window.playVideo = playVideo;
window.toggleBookmark = toggleBookmark;
window.toggleSpeed = toggleSpeed;
window.toggleFullscreen = toggleFullscreen;
window.switchTab = switchTab;
window.regenerateNotes = regenerateNotes;
window.exportNotes = exportNotes;
window.copyCode = copyCode;
window.flipCard = flipCard;
window.nextCard = nextCard;
window.previousCard = previousCard;
window.markDifficulty = markDifficulty;
window.shuffleCards = shuffleCards;
window.resetProgress = resetProgress;
window.createFlashcard = createFlashcard;
window.likeMessage = likeMessage;
window.replyToMessage = replyToMessage;
window.sendMessage = sendMessage;
window.handleMessageInput = handleMessageInput;
window.downloadResource = downloadResource;
window.viewResource = viewResource;
window.uploadResource = uploadResource;
window.openLink = openLink;
window.toggleAIAssistant = toggleAIAssistant;
window.sendAIMessage = sendAIMessage;
window.handleAIInput = handleAIInput;
