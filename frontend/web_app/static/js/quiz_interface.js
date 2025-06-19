// Quiz Interface JavaScript
class QuizInterface {
    constructor() {
        this.currentQuestion = 0;
        this.answers = {};
        this.flaggedQuestions = new Set();
        this.timeRemaining = window.quizData.timeLimit * 60; // Convert to seconds
        this.timerInterval = null;
        this.isPaused = false;
        this.autoSaveInterval = null;
        this.lastSaveTime = Date.now();
        this.startTime = Date.now();
        
        this.initializeQuiz();
        this.setupEventListeners();
        this.startTimer();
        this.setupAutoSave();
        this.setupKeyboardShortcuts();
    }

    initializeQuiz() {
        this.updateQuestionDisplay();
        this.updateNavigationState();
        this.updateProgressInfo();
        this.loadSavedAnswers();
    }

    setupEventListeners() {
        // Navigation buttons
        document.getElementById('prevBtn').addEventListener('click', () => this.previousQuestion());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextQuestion());
        
        // Question navigation grid
        document.querySelectorAll('.question-nav-item').forEach((btn, index) => {
            btn.addEventListener('click', () => this.goToQuestion(index));
        });
        
        // Answer selection
        document.addEventListener('change', (e) => {
            if (e.target.name === 'answer') {
                this.saveAnswer(this.currentQuestion, e.target.value);
                this.showAutoSaveIndicator();
            }
        });
        
        // Action buttons
        document.getElementById('flagBtn').addEventListener('click', () => this.toggleFlag());
        document.getElementById('hintBtn').addEventListener('click', () => this.showHints());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearAnswer());
        
        // Timer controls
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('resumeBtn').addEventListener('click', () => this.togglePause());
        
        // Submit quiz
        document.getElementById('submitBtn').addEventListener('click', () => this.showSubmitModal());
        document.getElementById('confirmSubmit').addEventListener('click', () => this.submitQuiz());
        document.getElementById('cancelSubmit').addEventListener('click', () => this.hideSubmitModal());
        
        // Modal controls
        document.getElementById('closeHints').addEventListener('click', () => this.hideHints());
        document.getElementById('closeExplanation').addEventListener('click', () => this.hideExplanation());
        
        // Exit quiz
        document.getElementById('exitBtn').addEventListener('click', () => this.exitQuiz());
        
        // Prevent page refresh/navigation during quiz
        window.addEventListener('beforeunload', (e) => {
            if (!this.isSubmitted) {
                e.preventDefault();
                e.returnValue = 'Are you sure you want to leave? Your progress will be saved.';
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            switch(e.key) {
                case 'ArrowRight':
                case 'n':
                case 'N':
                    e.preventDefault();
                    this.nextQuestion();
                    break;
                case 'ArrowLeft':
                case 'p':
                case 'P':
                    e.preventDefault();
                    this.previousQuestion();
                    break;
                case 'f':
                case 'F':
                    e.preventDefault();
                    this.toggleFlag();
                    break;
                case 'h':
                case 'H':
                    e.preventDefault();
                    this.showHints();
                    break;
                case 'c':
                case 'C':
                    e.preventDefault();
                    this.clearAnswer();
                    break;
                case ' ':
                    e.preventDefault();
                    this.togglePause();
                    break;
                case 'Enter':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.showSubmitModal();
                    }
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                    e.preventDefault();
                    this.selectOption(parseInt(e.key) - 1);
                    break;
            }
        });
    }

    updateQuestionDisplay() {
        const question = window.quizData.questions[this.currentQuestion];
        
        // Update question content
        document.getElementById('currentQuestionNum').textContent = this.currentQuestion + 1;
        document.getElementById('questionText').textContent = question.question_text;
        
        // Update difficulty badge
        const difficultyBadge = document.getElementById('difficultyBadge');
        difficultyBadge.textContent = question.difficulty;
        difficultyBadge.className = `difficulty-badge ${question.difficulty}`;
        
        // Update image if exists
        const questionImage = document.getElementById('questionImage');
        const imageContainer = questionImage ? questionImage.parentElement : null;
        if (question.question_image && imageContainer) {
            questionImage.src = question.question_image;
            imageContainer.style.display = 'block';
        } else if (imageContainer) {
            imageContainer.style.display = 'none';
        }
        
        // Update answer options
        this.updateAnswerOptions(question);
        
        // Update navigation buttons
        document.getElementById('prevBtn').disabled = this.currentQuestion === 0;
        document.getElementById('nextBtn').textContent = 
            this.currentQuestion === window.quizData.questions.length - 1 ? 'Finish' : 'Next →';
    }

    updateAnswerOptions(question) {
        const container = document.getElementById('answerOptions');
        container.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const label = document.createElement('label');
            label.className = 'answer-option';
            
            const savedAnswer = this.answers[this.currentQuestion];
            const isChecked = savedAnswer === option.value;
            
            label.innerHTML = `
                <input type="radio" name="answer" value="${option.value}" ${isChecked ? 'checked' : ''}>
                <div class="option-content">
                    <div class="option-marker">${option.label}</div>
                    <div class="option-text">${option.text}</div>
                </div>
            `;
            
            container.appendChild(label);
        });
    }

    updateNavigationState() {
        // Update all navigation buttons
        document.querySelectorAll('.question-nav-item').forEach((btn, index) => {
            btn.classList.remove('current', 'answered', 'flagged');
            
            // Current question
            if (index === this.currentQuestion) {
                btn.classList.add('current');
            }
            
            // Answered questions
            if (this.answers[index] !== undefined) {
                btn.classList.add('answered');
            }
            
            // Flagged questions
            if (this.flaggedQuestions.has(index)) {
                btn.classList.add('flagged');
            }
        });
        
        // Update flag button
        const flagBtn = document.getElementById('flagBtn');
        if (this.flaggedQuestions.has(this.currentQuestion)) {
            flagBtn.textContent = '🚩 Flagged';
            flagBtn.classList.add('flagged');
        } else {
            flagBtn.textContent = '🚩 Flag';
            flagBtn.classList.remove('flagged');
        }
    }

    updateProgressInfo() {
        const answeredCount = Object.keys(this.answers).length;
        const totalQuestions = window.quizData.questions.length;
        
        document.getElementById('answeredCount').textContent = answeredCount;
        document.getElementById('totalQuestions').textContent = totalQuestions;
    }

    // Centralized API response handler for consistent error handling    async handleApiResponse(response, successMessage) {
        if (response.ok) {
            if (successMessage) {
                // Show success message if provided
                errorHandler.showNotification(successMessage, 'success');
            }
            return await response.json().catch(() => ({}));
        } else if (response.status === 401) {
            // Handle authentication errors
            errorHandler.showNotification('Your session has expired. Please log in again.', 'error');
            
            // Save quiz progress before redirecting
            await this.autoSaveProgress();
            
            // Redirect to login after a short delay
            setTimeout(() => {
                window.location.href = '/login?redirect_url=/quiz';
            }, 2000);
            
            throw new Error('Unauthorized');
        } else {
            // Handle other API errors
            const error = await response.json().catch(() => ({ detail: 'An unknown error occurred.' }));
            throw new Error(error.detail || 'An unknown error occurred.');
        }
    }

    goToQuestion(index) {
        if (index >= 0 && index < window.quizData.questions.length) {
            this.currentQuestion = index;
            this.updateQuestionDisplay();
            this.updateNavigationState();
            this.scrollToTop();
        }
    }

    nextQuestion() {
        if (this.currentQuestion < window.quizData.questions.length - 1) {
            this.currentQuestion++;
            this.updateQuestionDisplay();
            this.updateNavigationState();
            this.scrollToTop();
        } else {
            this.showSubmitModal();
        }
    }

    previousQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            this.updateQuestionDisplay();
            this.updateNavigationState();
            this.scrollToTop();
        }
    }

    selectOption(index) {
        const options = document.querySelectorAll('input[name="answer"]');
        if (options[index]) {
            options[index].checked = true;
            this.saveAnswer(this.currentQuestion, options[index].value);
            this.showAutoSaveIndicator();
        }
    }

    saveAnswer(questionIndex, value) {
        this.answers[questionIndex] = value;
        this.updateNavigationState();
        this.updateProgressInfo();
        this.autoSaveProgress();
    }

    clearAnswer() {
        delete this.answers[this.currentQuestion];
        const checkedOption = document.querySelector('input[name="answer"]:checked');
        if (checkedOption) {
            checkedOption.checked = false;
        }
        this.updateNavigationState();
        this.updateProgressInfo();
        this.showAutoSaveIndicator();
    }

    toggleFlag() {
        if (this.flaggedQuestions.has(this.currentQuestion)) {
            this.flaggedQuestions.delete(this.currentQuestion);
        } else {
            this.flaggedQuestions.add(this.currentQuestion);
        }
        this.updateNavigationState();
    }

    async showHints() {
        if (!window.quizData.aiHintsEnabled) {
            alert('AI hints are not available for this quiz.');
            return;
        }

        const hintsPanel = document.getElementById('hintsPanel');
        const hintsContent = document.getElementById('hintsContent');
        
        // Show panel with loading state
        hintsPanel.style.display = 'block';
        hintsContent.innerHTML = `
            <div class="hint-loading">
                <div class="loading-spinner"></div>
                <p>Getting AI hints for you...</p>
            </div>
        `;

        try {
            const question = window.quizData.questions[this.currentQuestion];
            const response = await fetch('/api/quiz/hints', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    quiz_id: window.quizData.quizId,
                    question_id: this.currentQuestion,
                    question_text: question.question_text,
                    student_id: window.quizData.studentId
                })
            });

            const data = await this.handleApiResponse(response);
            if (data.hint) {
                hintsContent.innerHTML = `
                    <div class="hint-content">
                        <h5>💡 Hint</h5>
                        <p>${data.hint}</p>
                        ${data.explanation ? `
                            <h5>📚 Learning Tip</h5>
                            <p>${data.explanation}</p>
                        ` : ''}
                    </div>
                `;
            } else {
                throw new Error('Failed to get hints');
            }
        } catch (error) {
            hintsContent.innerHTML = `
                <div class="hint-content">
                    <h5>💡 Study Tip</h5>
                    <p>Try breaking down the question into smaller parts. Look for key terms and think about what concepts they relate to.</p>
                    <p>If you're unsure, eliminate options that seem clearly incorrect first.</p>
                </div>
            `;
        }
    }

    hideHints() {
        document.getElementById('hintsPanel').style.display = 'none';
    }

    hideExplanation() {
        document.getElementById('explanationModal').style.display = 'none';
    }

    startTimer() {
        this.updateTimerDisplay();
        this.timerInterval = setInterval(() => {
            if (!this.isPaused) {
                this.timeRemaining--;
                this.updateTimerDisplay();
                
                if (this.timeRemaining <= 0) {
                    this.timeUp();
                }
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('timer').textContent = timeString;
        
        // Update progress bar
        const totalTime = window.quizData.timeLimit * 60;
        const progressPercentage = (this.timeRemaining / totalTime) * 100;
        const progressBar = document.getElementById('timerProgress');
        progressBar.style.width = `${progressPercentage}%`;
        
        // Change colors based on time remaining
        const header = document.querySelector('.quiz-header');
        if (this.timeRemaining <= 300) { // 5 minutes
            progressBar.className = 'timer-progress-bar danger';
            header.classList.add('time-danger');
        } else if (this.timeRemaining <= 600) { // 10 minutes
            progressBar.className = 'timer-progress-bar warning';
            header.classList.add('time-warning');
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            document.getElementById('pauseBtn').textContent = '▶️ Resume';
            document.getElementById('pauseModal').style.display = 'flex';
        } else {
            document.getElementById('pauseBtn').textContent = '⏸️ Pause';
            document.getElementById('pauseModal').style.display = 'none';
        }
    }

    timeUp() {
        clearInterval(this.timerInterval);
        alert('Time is up! The quiz will be submitted automatically.');
        this.submitQuiz();
    }

    showSubmitModal() {
        const answeredCount = Object.keys(this.answers).length;
        const totalQuestions = window.quizData.questions.length;
        const unansweredCount = totalQuestions - answeredCount;
        
        // Calculate time used
        const timeUsed = Math.floor((Date.now() - this.startTime) / 1000);
        const timeUsedMinutes = Math.floor(timeUsed / 60);
        const timeUsedSeconds = timeUsed % 60;
        const timeUsedString = `${timeUsedMinutes}:${timeUsedSeconds.toString().padStart(2, '0')}`;
        
        // Update modal content
        document.getElementById('finalAnsweredCount').textContent = answeredCount;
        document.getElementById('timeUsed').textContent = timeUsedString;
        document.getElementById('unansweredCount').textContent = unansweredCount;
        
        // Show warning if there are unanswered questions
        const warningMessage = document.getElementById('warningMessage');
        if (unansweredCount > 0) {
            warningMessage.style.display = 'block';
        } else {
            warningMessage.style.display = 'none';
        }
        
        document.getElementById('submitModal').style.display = 'flex';
    }

    hideSubmitModal() {
        document.getElementById('submitModal').style.display = 'none';
    }

    async submitQuiz() {
        this.isSubmitted = true;
        clearInterval(this.timerInterval);
        clearInterval(this.autoSaveInterval);
        
        try {
            const response = await fetch('/api/quiz/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    quiz_id: window.quizData.quizId,
                    student_id: window.quizData.studentId,
                    answers: this.answers,
                    flagged_questions: Array.from(this.flaggedQuestions),
                    time_taken: Math.floor((Date.now() - this.startTime) / 1000)
                })
            });

            const result = await this.handleApiResponse(response);
            window.location.href = `/quiz/results/${result.submission_id}`;
        } catch (error) {
            alert('There was an error submitting your quiz. Please try again.');
            console.error('Quiz submission error:', error);
            this.isSubmitted = false;
        }
    }

    setupAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            this.autoSaveProgress();
        }, 30000); // Auto-save every 30 seconds
    }

    async autoSaveProgress() {
        if (window.quizData.autoSave && Date.now() - this.lastSaveTime > 5000) {
            try {
                const response = await fetch('/api/quiz/save-progress', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        quiz_id: window.quizData.quizId,
                        student_id: window.quizData.studentId,
                        answers: this.answers,
                        current_question: this.currentQuestion,
                        flagged_questions: Array.from(this.flaggedQuestions),
                        time_remaining: this.timeRemaining
                    })
                });
                await this.handleApiResponse(response);
                this.lastSaveTime = Date.now();
            } catch (error) {
                console.warn('Auto-save failed:', error);
            }
        }
    }

    async loadSavedAnswers() {
        try {
            const response = await fetch(`/api/quiz/progress/${window.quizData.quizId}/${window.quizData.studentId}`);
            if (response.ok) {
                const data = await response.json();
                if (data.answers) {
                    this.answers = data.answers;
                    this.currentQuestion = data.current_question || 0;
                    this.flaggedQuestions = new Set(data.flagged_questions || []);
                    if (data.time_remaining) {
                        this.timeRemaining = data.time_remaining;
                    }
                    
                    this.updateQuestionDisplay();
                    this.updateNavigationState();
                    this.updateProgressInfo();
                }
            } else {
                await this.handleApiResponse(response);
            }
        } catch (error) {
            console.warn('Failed to load saved progress:', error);
        }
    }

    showAutoSaveIndicator() {
        const indicator = document.getElementById('autoSaveIndicator');
        indicator.classList.add('visible');
        setTimeout(() => {
            indicator.classList.remove('visible');
        }, 2000);
    }

    scrollToTop() {
        document.querySelector('.quiz-main').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }

    exitQuiz() {
        if (confirm('Are you sure you want to exit the quiz? Your progress will be saved.')) {
            this.autoSaveProgress();
            window.location.href = '/dashboard';
        }
    }
}

// Initialize quiz when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Check if quiz data is available
    if (typeof window.quizData === 'undefined') {
        console.error('Quiz data not found');
        alert('Quiz data is not available. Please refresh the page.');
        return;
    }
    
    // Initialize the quiz interface
    window.quiz = new QuizInterface();
    
    // Add some helpful console commands for testing
    if (console && typeof console.log === 'function') {
        console.log('🎓 EduGenie Quiz Interface Loaded');
        console.log('Available commands:');
        console.log('- quiz.goToQuestion(index) - Go to specific question');
        console.log('- quiz.showHints() - Show AI hints');
        console.log('- quiz.toggleFlag() - Flag current question');
        console.log('- quiz.clearAnswer() - Clear current answer');
    }
});

// Utility functions for quiz management
const QuizUtils = {
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    },
    
    calculateScore(answers, correctAnswers) {
        let correct = 0;
        for (const [questionIndex, answer] of Object.entries(answers)) {
            if (correctAnswers[questionIndex] === answer) {
                correct++;
            }
        }
        return Math.round((correct / Object.keys(correctAnswers).length) * 100);
    },
    
    exportProgress() {
        if (window.quiz) {
            const data = {
                answers: window.quiz.answers,
                flaggedQuestions: Array.from(window.quiz.flaggedQuestions),
                currentQuestion: window.quiz.currentQuestion,
                timeRemaining: window.quiz.timeRemaining
            };
            console.log('Quiz Progress:', data);
            return data;
        }
    }
};

// Make utils available globally
window.QuizUtils = QuizUtils;
