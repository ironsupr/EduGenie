// Enhanced Dashboard JavaScript - Modern Interactions

document.addEventListener('DOMContentLoaded', function() {
    initDashboard();
    initCharts();
    initInteractiveElements();
    initAIAssistant();
    initDailyPlanner();
    initGamificationAnimations();
    initProgressTracking();
});

// Main dashboard initialization
function initDashboard() {
    // Initialize real-time updates
    startRealTimeUpdates();
    
    // Initialize tooltips
    initTooltips();
    
    // Initialize keyboard shortcuts
    initKeyboardShortcuts();
    
    // Initialize theme persistence
    initTheme();
}

// Initialize Chart.js charts
function initCharts() {
    const progressChart = document.getElementById('progressChart');
    
    if (progressChart) {
        const ctx = progressChart.getContext('2d');
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Study Hours',
                    data: [2.5, 3.2, 1.8, 4.1, 3.6, 2.9, 3.8],
                    borderColor: '#5F60F5',
                    backgroundColor: 'rgba(95, 96, 245, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#5F60F5',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }, {
                    label: 'XP Gained',
                    data: [150, 180, 120, 220, 200, 160, 190],
                    borderColor: '#FCD34D',
                    backgroundColor: 'rgba(252, 211, 77, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#FCD34D',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                family: 'Inter',
                                size: 12,
                                weight: 500
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            font: {
                                family: 'Inter',
                                size: 11
                            }
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: {
                            drawOnChartArea: false,
                        },
                        ticks: {
                            font: {
                                family: 'Inter',
                                size: 11
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            font: {
                                family: 'Inter',
                                size: 11
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }
}

// Interactive elements
function initInteractiveElements() {
    // Course item interactions
    const courseItems = document.querySelectorAll('.course-item');
    courseItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            courseItems.forEach(i => i.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');
            
            // Animate progress bars
            const progressBar = this.querySelector('.progress-fill');
            if (progressBar) {
                animateProgressBar(progressBar);
            }
        });
    });
    
    // Navigation profile dropdown
    const profileDropdown = document.querySelector('.nav-profile');
    if (profileDropdown) {
        profileDropdown.addEventListener('click', function() {
            // Toggle dropdown menu (implement dropdown menu)
            console.log('Profile dropdown clicked');
        });
    }
    
    // Period selector
    const periodSelect = document.querySelector('.period-select');
    if (periodSelect) {
        periodSelect.addEventListener('change', function() {
            updateProgressData(this.value);
        });
    }
}

// AI Assistant functionality
function initAIAssistant() {
    const aiInput = document.querySelector('.ai-input');
    const aiSendBtn = document.querySelector('.ai-send-btn');
    const suggestionBtns = document.querySelectorAll('.suggestion-btn');
    
    if (aiInput && aiSendBtn) {
        // Handle AI input
        aiInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendAIMessage();
            }
        });
        
        aiSendBtn.addEventListener('click', sendAIMessage);
        
        // Handle suggestion buttons
        suggestionBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const action = this.textContent.trim();
                handleAISuggestion(action);
            });
        });
    }
    
    function sendAIMessage() {
        const message = aiInput.value.trim();
        if (message) {
            // Add user message to chat
            addMessageToChat(message, 'user');
            
            // Clear input
            aiInput.value = '';
            
            // Simulate AI response
            setTimeout(() => {
                const responses = [
                    "I'd be happy to help you with that! Let me generate some practice problems for quadratic functions.",
                    "Great question! Here's a detailed explanation with examples.",
                    "I've created a personalized study plan based on your current progress.",
                    "Let me break that concept down into simpler steps for you."
                ];
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                addMessageToChat(randomResponse, 'ai');
            }, 1000);
        }
    }
    
    function addMessageToChat(message, sender) {
        const chatContainer = document.querySelector('.ai-chat-container');
        const messageElement = document.createElement('div');
        messageElement.className = `${sender}-message`;
        
        if (sender === 'ai') {
            messageElement.innerHTML = `
                <div class="ai-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <p>${message}</p>
                    <div class="message-time">Just now</div>
                </div>
            `;
        } else {
            messageElement.innerHTML = `
                <div class="message-content user-message-content">
                    <p>${message}</p>
                    <div class="message-time">Just now</div>
                </div>
            `;
            messageElement.style.flexDirection = 'row-reverse';
        }
        
        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    function handleAISuggestion(action) {
        const suggestions = {
            'Ask Question': "What would you like to know about your current topic?",
            'Get Hint': "Here's a helpful hint for your current problem...",
            'Practice Problems': "I've generated 5 practice problems for you!",
            'Study Plan': "Here's your optimized study plan for this week..."
        };
        
        const response = suggestions[action] || "I'm here to help! What can I do for you?";
        addMessageToChat(response, 'ai');
    }
}

// Daily planner functionality
function initDailyPlanner() {
    const dateNavs = document.querySelectorAll('.date-nav');
    const currentDate = document.querySelector('.current-date');
    let currentDateObj = new Date();
    
    dateNavs.forEach(nav => {
        nav.addEventListener('click', function() {
            const isNext = this.querySelector('.fa-chevron-right');
            
            if (isNext) {
                currentDateObj.setDate(currentDateObj.getDate() + 1);
            } else {
                currentDateObj.setDate(currentDateObj.getDate() - 1);
            }
            
            updateDateDisplay();
            updateTimelineForDate();
        });
    });
    
    function updateDateDisplay() {
        const options = { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
        };
        const dateString = currentDateObj.toLocaleDateString('en-US', options);
        
        if (currentDate) {
            currentDate.textContent = isToday(currentDateObj) ? 'Today, ' + dateString.split(', ')[1] : dateString;
        }
    }
    
    function isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }
    
    function updateTimelineForDate() {
        // Simulate updating timeline items based on selected date
        const timelineItems = document.querySelectorAll('.timeline-item');
        
        timelineItems.forEach((item, index) => {
            // Animate timeline items
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, index * 100);
        });
    }
    
    // Timeline item interactions
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach(item => {
        item.addEventListener('click', function() {
            if (!this.classList.contains('completed')) {
                // Mark as active or start session
                timelineItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                
                // Add visual feedback
                this.style.transform = 'scale(1.02)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 200);
            }
        });
    });
}

// Gamification animations
function initGamificationAnimations() {
    // Animate XP progress bar
    const xpFill = document.querySelector('.xp-fill');
    if (xpFill) {
        setTimeout(() => {
            animateProgressBar(xpFill);
        }, 500);
    }
    
    // Animate streak dots
    const streakDots = document.querySelectorAll('.streak-dot.active');
    streakDots.forEach((dot, index) => {
        setTimeout(() => {
            dot.style.transform = 'scale(1.2)';
            setTimeout(() => {
                dot.style.transform = 'scale(1)';
            }, 200);
        }, index * 100);
    });
    
    // Achievement hover effects
    const achievementItems = document.querySelectorAll('.achievement-item');
    achievementItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.achievement-icon');
            if (icon.classList.contains('earned')) {
                icon.style.transform = 'rotate(10deg) scale(1.1)';
            }
        });
        
        item.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.achievement-icon');
            icon.style.transform = 'rotate(0deg) scale(1)';
        });
    });
    
    // Rank change animation
    const rankChange = document.querySelector('.rank-change');
    if (rankChange) {
        setTimeout(() => {
            rankChange.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                rankChange.style.transform = 'translateY(0)';
            }, 300);
        }, 1000);
    }
}

// Progress tracking and updates
function initProgressTracking() {
    // Update progress bars with animation
    const progressBars = document.querySelectorAll('.progress-fill');
    progressBars.forEach((bar, index) => {
        setTimeout(() => {
            animateProgressBar(bar);
        }, index * 200);
    });
    
    // Course progress interactions
    const courseActions = document.querySelectorAll('.course-actions .btn');
    courseActions.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const action = this.textContent.trim().toLowerCase();
            const courseItem = this.closest('.course-item');
            
            if (action === 'continue' || action === 'resume' || action === 'start') {
                // Simulate progress update
                updateCourseProgress(courseItem);
            }
        });
    });
}

// Utility functions
function animateProgressBar(progressBar) {
    const targetWidth = progressBar.style.width;
    progressBar.style.width = '0%';
    
    setTimeout(() => {
        progressBar.style.width = targetWidth;
    }, 100);
}

function updateCourseProgress(courseItem) {
    const progressBar = courseItem.querySelector('.progress-fill');
    const progressText = courseItem.querySelector('.progress-text');
    
    if (progressBar && progressText) {
        // Simulate progress increase
        const currentProgress = parseInt(progressBar.style.width) || 0;
        const newProgress = Math.min(currentProgress + 5, 100);
        
        progressBar.style.width = newProgress + '%';
        progressText.textContent = newProgress + '% Complete';
        
        // Add visual feedback
        courseItem.style.background = 'rgba(95, 96, 245, 0.1)';
        setTimeout(() => {
            courseItem.style.background = '';
        }, 1000);
    }
}

function updateProgressData(period) {
    // Simulate updating progress data based on selected period
    console.log('Updating progress data for period:', period);
    
    const statValues = document.querySelectorAll('.stat-value');
    const periodData = {
        'This Week': ['24.5h', '47', '89%', '12/15'],
        'This Month': ['98.2h', '156', '91%', '45/50'],
        'This Year': ['1,250h', '2,847', '87%', '156/180']
    };
    
    const data = periodData[period] || periodData['This Week'];
    
    statValues.forEach((stat, index) => {
        if (data[index]) {
            // Animate value change
            stat.style.opacity = '0.5';
            setTimeout(() => {
                stat.textContent = data[index];
                stat.style.opacity = '1';
            }, 200);
        }
    });
}

function startRealTimeUpdates() {
    // Simulate real-time updates every 30 seconds
    setInterval(() => {
        updateOnlineStatus();
        updateNotifications();
    }, 30000);
}

function updateOnlineStatus() {
    const statusIndicator = document.querySelector('.status-indicator');
    if (statusIndicator) {
        // Pulse animation for online status
        statusIndicator.style.animation = 'pulse 1s ease-in-out';
        setTimeout(() => {
            statusIndicator.style.animation = '';
        }, 1000);
    }
}

function updateNotifications() {
    // Check for new notifications or updates
    console.log('Checking for updates...');
}

function initTooltips() {
    // Add tooltips to various elements
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(e) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = e.target.getAttribute('data-tooltip');
    document.body.appendChild(tooltip);
    
    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
}

function hideTooltip() {
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'k':
                    e.preventDefault();
                    // Focus AI assistant input
                    const aiInput = document.querySelector('.ai-input');
                    if (aiInput) aiInput.focus();
                    break;
                case 'p':
                    e.preventDefault();
                    // Open daily planner
                    const plannerCard = document.querySelector('.planner-card');
                    if (plannerCard) plannerCard.scrollIntoView({ behavior: 'smooth' });
                    break;
            }
        }
    });
}

function initTheme() {
    // Initialize theme persistence and switching
    const savedTheme = localStorage.getItem('dashboard-theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
}

// Export functions for external use
window.dashboardAPI = {
    updateProgress: updateCourseProgress,
    sendAIMessage: (message) => {
        const aiInput = document.querySelector('.ai-input');
        if (aiInput) {
            aiInput.value = message;
            document.querySelector('.ai-send-btn').click();
        }
    },
    updatePeriod: updateProgressData,
    animateProgress: animateProgressBar
};
