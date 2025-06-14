// Study page specific JavaScript functionality

class StudyManager {
    constructor() {
        this.startTime = Date.now();
        this.objectives = [];
        this.completedObjectives = 0;
        this.totalTimeSpent = 0;
        this.notes = '';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSavedProgress();
        this.startTimeTracking();
        this.initializeObjectives();
    }

    setupEventListeners() {
        // Objective checkboxes
        const objectiveItems = document.querySelectorAll('.objective-item');
        objectiveItems.forEach((item, index) => {
            item.addEventListener('click', () => this.toggleObjective(index));
        });

        // Practice questions
        const practiceButtons = document.querySelectorAll('.practice-item button');
        practiceButtons.forEach((button, index) => {
            button.addEventListener('click', () => this.checkPracticeAnswer(index));
        });

        // Interactive demo
        const demoButton = document.querySelector('#demoInput + button');
        if (demoButton) {
            demoButton.addEventListener('click', this.handleDemo.bind(this));
        }

        // Notes auto-save
        const notesPad = document.getElementById('notesPad');
        if (notesPad) {
            notesPad.addEventListener('input', this.debounce(this.autoSaveNotes.bind(this), 1000));
        }

        // Bookmark button
        const bookmarkBtn = document.getElementById('bookmarkBtn');
        if (bookmarkBtn) {
            bookmarkBtn.addEventListener('click', this.toggleBookmark.bind(this));
        }

        // Complete topic button
        const completeBtn = document.querySelector('button[onclick="completeTopic()"]');
        if (completeBtn) {
            completeBtn.addEventListener('click', this.completeTopic.bind(this));
        }
    }

    initializeObjectives() {
        const objectiveItems = document.querySelectorAll('.objective-item');
        this.objectives = Array.from(objectiveItems).map((item, index) => ({
            id: index,
            text: item.textContent.trim(),
            completed: false
        }));
        this.updateProgress();
    }

    toggleObjective(index) {
        const objectiveItem = document.querySelectorAll('.objective-item')[index];
        const checkbox = objectiveItem.querySelector('.objective-check');
        
        if (this.objectives[index]) {
            this.objectives[index].completed = !this.objectives[index].completed;
            
            if (this.objectives[index].completed) {
                objectiveItem.classList.add('completed');
                checkbox.textContent = '✓';
                this.showFeedback('Objective completed! 🎉', 'success');
                this.completedObjectives++;
            } else {
                objectiveItem.classList.remove('completed');
                checkbox.textContent = '□';
                this.completedObjectives--;
            }
            
            this.updateProgress();
            this.saveProgress();
        }
    }

    checkPracticeAnswer(questionIndex) {
        const practiceItem = document.querySelectorAll('.practice-item')[questionIndex];
        const input = practiceItem.querySelector('.practice-answer');
        const feedback = practiceItem.querySelector('.practice-feedback');
        const button = practiceItem.querySelector('button');
        
        const answer = input.value.trim();
        if (!answer) {
            this.showPracticeFeedback(feedback, '❌ Please enter an answer.', 'negative');
            return;
        }

        // Simulate answer checking (in production, this would validate against correct answers)
        const isCorrect = this.validateAnswer(questionIndex, answer);
        
        if (isCorrect) {
            this.showPracticeFeedback(feedback, '✅ Excellent! That\'s correct.', 'positive');
            button.textContent = 'Correct ✓';
            button.disabled = true;
            button.classList.add('btn-success');
        } else {
            this.showPracticeFeedback(feedback, '❌ Not quite right. Try again or check the examples above.', 'negative');
            
            // Provide hint after 2 attempts
            const attempts = parseInt(input.dataset.attempts || '0') + 1;
            input.dataset.attempts = attempts;
            
            if (attempts >= 2) {
                this.showPracticeFeedback(feedback, '💡 Hint: Look for patterns in the examples above.', 'hint');
            }
        }
        
        // Track attempt
        this.trackPracticeAttempt(questionIndex, answer, isCorrect);
    }

    validateAnswer(questionIndex, answer) {
        // Mock validation - in production, this would be more sophisticated
        const correctAnswers = [
            '(x-2)(x-4)', // For x² - 6x + 8
            '(x+4)(x-3)'  // For x² + x - 12
        ];
        
        return correctAnswers[questionIndex] && 
               answer.toLowerCase().replace(/\s/g, '') === correctAnswers[questionIndex].toLowerCase().replace(/\s/g, '');
    }

    showPracticeFeedback(feedbackElement, message, type) {
        feedbackElement.innerHTML = `<span class="feedback-${type}">${message}</span>`;
        feedbackElement.style.display = 'block';
        
        // Auto-hide after 5 seconds for hints
        if (type === 'hint') {
            setTimeout(() => {
                feedbackElement.style.display = 'none';
            }, 5000);
        }
    }

    handleDemo() {
        const input = document.getElementById('demoInput');
        const output = document.getElementById('demoOutput');
        const expression = input.value.trim();
        
        if (!expression) {
            output.innerHTML = '<p style="color: #ef4444;">Please enter an expression to solve.</p>';
            return;
        }
        
        // Simulate step-by-step solution
        const solution = this.generateSolution(expression);
        output.innerHTML = solution;
        
        // Track demo usage
        this.trackDemoUsage(expression);
    }

    generateSolution(expression) {
        // Mock solution generator - in production, this would use actual math processing
        return `
            <div class="demo-solution">
                <h4>Step-by-Step Solution:</h4>
                <div class="solution-steps">
                    <div class="step">
                        <strong>Step 1:</strong> Analyze the expression: <code>${expression}</code>
                    </div>
                    <div class="step">
                        <strong>Step 2:</strong> Look for patterns (a² ± 2ab + b² or difference of squares)
                    </div>
                    <div class="step">
                        <strong>Step 3:</strong> Factor using appropriate method
                    </div>
                    <div class="step">
                        <strong>Step 4:</strong> Verify by expanding the result
                    </div>
                </div>
                <p style="margin-top: 1rem; color: #16a34a;">
                    💡 <strong>Tip:</strong> Always check your work by expanding the factored form!
                </p>
            </div>
        `;
    }

    updateProgress() {
        const progressFill = document.querySelector('.sidebar-card .progress-fill');
        const progressText = document.querySelector('.sidebar-card .progress-info span');
        const objectivesCount = document.querySelector('.stat-value');
        
        const totalObjectives = this.objectives.length;
        const completionPercentage = totalObjectives > 0 ? 
            Math.round((this.completedObjectives / totalObjectives) * 100) : 0;
        
        if (progressFill) {
            progressFill.style.width = `${completionPercentage}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${completionPercentage}% Complete`;
        }
        
        if (objectivesCount) {
            objectivesCount.textContent = `${this.completedObjectives}/${totalObjectives}`;
        }
        
        // Update topic meta
        const topicProgress = document.querySelector('.topic-meta .progress');
        if (topicProgress) {
            topicProgress.textContent = `📊 ${completionPercentage}% Complete`;
        }
    }

    startTimeTracking() {
        setInterval(() => {
            this.updateTimeSpent();
        }, 60000); // Update every minute
        
        // Update immediately
        this.updateTimeSpent();
    }

    updateTimeSpent() {
        const elapsed = Math.floor((Date.now() - this.startTime) / 60000);
        const timeElement = document.getElementById('timeSpent');
        
        if (timeElement) {
            timeElement.textContent = `${elapsed} min`;
        }
        
        this.totalTimeSpent = elapsed;
    }

    autoSaveNotes() {
        const notesPad = document.getElementById('notesPad');
        if (notesPad) {
            this.notes = notesPad.value;
            this.saveNotes(false); // Save without showing notification
        }
    }

    saveNotes(showNotification = true) {
        const topicName = document.querySelector('.topic-info h1').textContent;
        const notesKey = `notes_${topicName.toLowerCase().replace(/\s+/g, '_')}`;
        
        localStorage.setItem(notesKey, this.notes);
        
        if (showNotification) {
            this.showFeedback('Notes saved! 📝', 'success');
        }
    }

    loadSavedProgress() {
        const topicName = document.querySelector('.topic-info h1').textContent;
        const progressKey = `progress_${topicName.toLowerCase().replace(/\s+/g, '_')}`;
        const notesKey = `notes_${topicName.toLowerCase().replace(/\s+/g, '_')}`;
        
        // Load saved progress
        const savedProgress = localStorage.getItem(progressKey);
        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            this.objectives = progress.objectives || this.objectives;
            this.completedObjectives = progress.completedObjectives || 0;
            
            // Restore objective states
            this.objectives.forEach((objective, index) => {
                if (objective.completed) {
                    const objectiveItem = document.querySelectorAll('.objective-item')[index];
                    const checkbox = objectiveItem.querySelector('.objective-check');
                    if (objectiveItem && checkbox) {
                        objectiveItem.classList.add('completed');
                        checkbox.textContent = '✓';
                    }
                }
            });
        }
        
        // Load saved notes
        const savedNotes = localStorage.getItem(notesKey);
        if (savedNotes) {
            const notesPad = document.getElementById('notesPad');
            if (notesPad) {
                notesPad.value = savedNotes;
                this.notes = savedNotes;
            }
        }
        
        this.updateProgress();
    }

    saveProgress() {
        const topicName = document.querySelector('.topic-info h1').textContent;
        const progressKey = `progress_${topicName.toLowerCase().replace(/\s+/g, '_')}`;
        
        const progressData = {
            objectives: this.objectives,
            completedObjectives: this.completedObjectives,
            timeSpent: this.totalTimeSpent,
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem(progressKey, JSON.stringify(progressData));
    }

    toggleBookmark() {
        const bookmarkBtn = document.getElementById('bookmarkBtn');
        const topicName = document.querySelector('.topic-info h1').textContent;
        
        let bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
        const isBookmarked = bookmarks.includes(topicName);
        
        if (isBookmarked) {
            bookmarks = bookmarks.filter(bookmark => bookmark !== topicName);
            bookmarkBtn.textContent = '📖 Bookmark';
            this.showFeedback('Bookmark removed', 'info');
        } else {
            bookmarks.push(topicName);
            bookmarkBtn.textContent = '📖 Bookmarked ✓';
            this.showFeedback('Topic bookmarked! 🔖', 'success');
        }
        
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    }

    completeTopic() {
        if (this.completedObjectives < this.objectives.length) {
            if (!confirm('You haven\'t completed all objectives yet. Are you sure you want to mark this topic as complete?')) {
                return;
            }
        }
        
        // Mark all objectives as complete
        this.objectives.forEach((objective, index) => {
            if (!objective.completed) {
                this.toggleObjective(index);
            }
        });
        
        // Save completion
        const topicName = document.querySelector('.topic-info h1').textContent;
        const completions = JSON.parse(localStorage.getItem('completed_topics') || '[]');
        if (!completions.includes(topicName)) {
            completions.push(topicName);
            localStorage.setItem('completed_topics', JSON.stringify(completions));
        }
        
        // Show celebration
        this.showCelebration();
        
        // Redirect after celebration
        setTimeout(() => {
            const studentId = new URLSearchParams(window.location.search).get('student_id');
            window.location.href = `/dashboard?student_id=${studentId}`;
        }, 3000);
    }

    showCelebration() {
        const celebration = document.createElement('div');
        celebration.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease;
            ">
                <div style="
                    background: white;
                    border-radius: 1rem;
                    padding: 3rem;
                    text-align: center;
                    max-width: 500px;
                    animation: slideIn 0.5s ease;
                ">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">🎉</div>
                    <h2 style="color: #16a34a; margin-bottom: 1rem;">Congratulations!</h2>
                    <p style="color: #6b7280; margin-bottom: 2rem; font-size: 1.1rem;">
                        You've successfully completed this topic! 
                        Time to move on to your next learning milestone.
                    </p>
                    <div style="
                        background: #f0fdf4;
                        border-radius: 0.5rem;
                        padding: 1rem;
                        margin-bottom: 2rem;
                    ">
                        <div style="color: #16a34a; font-weight: 600;">Study Session Summary:</div>
                        <div style="color: #6b7280; font-size: 0.9rem;">
                            Time spent: ${this.totalTimeSpent} minutes<br>
                            Objectives completed: ${this.completedObjectives}/${this.objectives.length}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(celebration);
        
        // Remove after 3 seconds
        setTimeout(() => {
            celebration.remove();
        }, 3000);
    }

    showFeedback(message, type = 'info') {
        const feedback = document.createElement('div');
        feedback.className = `study-feedback ${type}`;
        feedback.textContent = message;
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideInRight 0.3s ease;
        `;
        
        // Set color based on type
        const colors = {
            success: '#16a34a',
            error: '#dc2626',
            info: '#2563eb',
            warning: '#d97706'
        };
        
        feedback.style.backgroundColor = colors[type] || colors.info;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => feedback.remove(), 300);
        }, 3000);
    }

    // Analytics and tracking methods
    trackPracticeAttempt(questionIndex, answer, isCorrect) {
        const event = {
            type: 'practice_attempt',
            question_index: questionIndex,
            answer: answer,
            correct: isCorrect,
            timestamp: new Date().toISOString(),
            topic: document.querySelector('.topic-info h1').textContent
        };
        
        this.saveAnalyticsEvent(event);
    }

    trackDemoUsage(expression) {
        const event = {
            type: 'demo_usage',
            expression: expression,
            timestamp: new Date().toISOString(),
            topic: document.querySelector('.topic-info h1').textContent
        };
        
        this.saveAnalyticsEvent(event);
    }

    saveAnalyticsEvent(event) {
        const events = JSON.parse(localStorage.getItem('study_analytics') || '[]');
        events.push(event);
        
        // Keep only last 50 events
        if (events.length > 50) {
            events.splice(0, events.length - 50);
        }
        
        localStorage.setItem('study_analytics', JSON.stringify(events));
    }

    // Utility methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Add custom CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes slideIn {
        from { transform: translateY(-50px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100px); opacity: 0; }
    }
    
    .solution-steps .step {
        margin-bottom: 1rem;
        padding: 0.75rem;
        background: #f9fafb;
        border-radius: 0.375rem;
        border-left: 4px solid #6366f1;
    }
`;
document.head.appendChild(style);

// Initialize study manager when DOM is ready
let studyManager;
document.addEventListener('DOMContentLoaded', () => {
    studyManager = new StudyManager();
    
    // Add keyboard shortcuts for study page
    document.addEventListener('keydown', (event) => {
        // Ctrl/Cmd + S for save notes
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            event.preventDefault();
            studyManager.saveNotes(true);
        }
        
        // Ctrl/Cmd + Enter to complete topic
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            studyManager.completeTopic();
        }
    });
});
