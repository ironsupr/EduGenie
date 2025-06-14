// Dashboard-specific JavaScript functionality

class DashboardManager {
    constructor() {
        this.studentId = this.getStudentIdFromUrl();
        this.init();
    }

    init() {
        this.initializeProgressChart();
        this.loadStudentProgress();
        this.setupEventListeners();
        this.startProgressPolling();
    }

    getStudentIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('student_id');
    }

    initializeProgressChart() {
        const canvas = document.getElementById('progressChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Mock data for weekly progress
        const weeklyData = {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Study Time (minutes)',
                data: [45, 60, 30, 90, 75, 40, 55],
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        };

        new Chart(ctx, {
            type: 'line',
            data: weeklyData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#f3f4f6'
                        },
                        ticks: {
                            color: '#6b7280'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#6b7280'
                        }
                    }
                },
                elements: {
                    point: {
                        radius: 4,
                        hoverRadius: 8
                    }
                }
            }
        });
    }

    async loadStudentProgress() {
        if (!this.studentId) return;

        try {
            const response = await fetch(`/api/student/${this.studentId}/progress`);
            if (response.ok) {
                const progressData = await response.json();
                this.updateProgressDisplay(progressData);
            }
        } catch (error) {
            console.warn('Could not load progress data:', error);
        }
    }

    updateProgressDisplay(progressData) {
        // Update topic cards based on actual progress
        const topicCards = document.querySelectorAll('.topic-card');
        
        progressData.topics.forEach((topic, index) => {
            if (topicCards[index]) {
                const card = topicCards[index];
                const progressBar = card.querySelector('.progress-fill');
                const progressText = card.querySelector('.topic-progress span');
                
                if (progressBar) {
                    progressBar.style.width = `${topic.progress}%`;
                }
                
                if (progressText) {
                    progressText.textContent = `${topic.progress}% Complete`;
                }

                // Update card status
                card.className = 'topic-card';
                if (topic.status === 'completed') {
                    card.classList.add('completed');
                } else if (topic.status === 'in_progress') {
                    card.classList.add('in-progress');
                } else {
                    card.classList.add('not-started');
                }
            }
        });

        // Update overall progress
        const overallProgress = document.querySelector('.progress-percentage');
        if (overallProgress) {
            overallProgress.textContent = `${progressData.overall_progress.toFixed(1)}%`;
        }

        const overallProgressBar = document.querySelector('.progress-card .progress-fill');
        if (overallProgressBar) {
            overallProgressBar.style.width = `${progressData.overall_progress}%`;
        }
    }

    setupEventListeners() {
        // Quick action cards
        const quickActionCards = document.querySelectorAll('.quick-action-card');
        quickActionCards.forEach(card => {
            card.addEventListener('click', this.handleQuickAction.bind(this));
        });

        // Topic cards continue buttons
        const continueButtons = document.querySelectorAll('.topic-card .btn-primary');
        continueButtons.forEach(button => {
            button.addEventListener('click', this.handleContinueTopic.bind(this));
        });

        // Activity items
        const activityItems = document.querySelectorAll('.activity-item');
        activityItems.forEach(item => {
            item.addEventListener('click', this.handleActivityClick.bind(this));
        });
    }

    handleQuickAction(event) {
        const card = event.currentTarget;
        const actionText = card.querySelector('h4').textContent;
        
        // Add click animation
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
            card.style.transform = '';
        }, 150);

        // Track action
        this.trackUserAction('quick_action', actionText);
    }

    handleContinueTopic(event) {
        const button = event.currentTarget;
        const topicCard = button.closest('.topic-card');
        const topicName = topicCard.querySelector('h4').textContent;
        
        // Show loading state
        const originalText = button.textContent;
        button.textContent = 'Loading...';
        button.disabled = true;
        
        // Track action
        this.trackUserAction('continue_topic', topicName);
        
        // Reset button after navigation (in case it fails)
        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
        }, 3000);
    }

    handleActivityClick(event) {
        const item = event.currentTarget;
        const topicName = item.querySelector('h4').textContent;
        
        // Add visual feedback
        item.style.backgroundColor = '#f0f9ff';
        setTimeout(() => {
            item.style.backgroundColor = '';
        }, 300);

        // Could navigate to detailed view
        console.log('Activity clicked:', topicName);
    }

    startProgressPolling() {
        // Poll for progress updates every 30 seconds
        setInterval(() => {
            this.loadStudentProgress();
        }, 30000);
    }

    trackUserAction(actionType, actionDetail) {
        // Track user interactions for analytics
        const eventData = {
            student_id: this.studentId,
            action_type: actionType,
            action_detail: actionDetail,
            timestamp: new Date().toISOString(),
            page: 'dashboard'
        };

        // Store in localStorage for now (could send to analytics service)
        const existingEvents = JSON.parse(localStorage.getItem('user_events') || '[]');
        existingEvents.push(eventData);
        
        // Keep only last 100 events
        if (existingEvents.length > 100) {
            existingEvents.splice(0, existingEvents.length - 100);
        }
        
        localStorage.setItem('user_events', JSON.stringify(existingEvents));
        
        console.log('User action tracked:', eventData);
    }

    // Utility methods
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}-message fade-in`;
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '1000';
        notification.style.maxWidth = '400px';
        notification.style.padding = '1rem';
        notification.style.borderRadius = '0.5rem';
        notification.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);

        // Click to dismiss
        notification.addEventListener('click', () => {
            notification.remove();
        });
    }

    updateStreak(newStreak) {
        const streakElement = document.querySelector('.stat-number');
        if (streakElement && streakElement.textContent !== newStreak.toString()) {
            streakElement.textContent = newStreak;
            
            // Animate the update
            streakElement.style.transform = 'scale(1.2)';
            streakElement.style.color = '#16a34a';
            
            setTimeout(() => {
                streakElement.style.transform = '';
                streakElement.style.color = '';
            }, 600);
            
            if (newStreak > parseInt(streakElement.dataset.previousValue || '0')) {
                this.showNotification(`🔥 Great job! You're on a ${newStreak}-day streak!`, 'success');
            }
            
            streakElement.dataset.previousValue = newStreak;
        }
    }
}

// Utility functions for dashboard
const dashboardUtils = {
    formatDuration(minutes) {
        if (minutes < 60) {
            return `${minutes} min`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}m`;
    },

    calculateCompletionRate(completed, total) {
        return total > 0 ? Math.round((completed / total) * 100) : 0;
    },

    getMotivationalMessage(completionRate) {
        if (completionRate >= 90) {
            return "🏆 Outstanding progress! You're almost there!";
        } else if (completionRate >= 70) {
            return "🎯 Great work! Keep up the momentum!";
        } else if (completionRate >= 50) {
            return "📈 You're making solid progress!";
        } else if (completionRate >= 25) {
            return "💪 Good start! Let's keep building!";
        } else {
            return "🚀 Ready to begin your learning journey?";
        }
    },

    exportProgress() {
        const progressData = {
            student_id: dashboard.studentId,
            exported_at: new Date().toISOString(),
            // Add more data as needed
        };
        
        const blob = new Blob([JSON.stringify(progressData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `progress_${dashboard.studentId}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};

// Initialize dashboard when DOM is ready
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new DashboardManager();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (event) => {
        // Ctrl/Cmd + D for dashboard
        if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
            event.preventDefault();
            window.location.href = `/dashboard?student_id=${dashboard.studentId}`;
        }
        
        // Ctrl/Cmd + Q for quiz
        if ((event.ctrlKey || event.metaKey) && event.key === 'q') {
            event.preventDefault();
            window.location.href = '/start-quiz';
        }
    });
});
