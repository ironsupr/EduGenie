// EduGenie - Main JavaScript functionality

class EduGenie {
  constructor() {
    this.currentQuestion = 0;
    this.answers = {};
    this.startTime = null;
    this.timer = null;
    this.init();
  }

  init() {
    this.addEventListeners();
    this.initializeAnimations();
    this.startQuizTimer();
  }

  addEventListeners() {
    // Form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('submit', this.handleFormSubmit.bind(this));
    });

    // Radio button interactions
    const radioButtons = document.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(radio => {
      radio.addEventListener('change', this.handleAnswerSelect.bind(this));
    });

    // Button hover effects
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
      button.addEventListener('mouseenter', this.handleButtonHover.bind(this));
    });

    // Progress tracking
    this.updateProgress();
  }

  handleFormSubmit(event) {
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Add loading state
    if (submitButton) {
      const originalText = submitButton.textContent;
      submitButton.innerHTML = '<span class="loading"></span> Processing...';
      submitButton.disabled = true;
      
      // Re-enable after a delay (in case of errors)
      setTimeout(() => {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
      }, 10000);
    }

    // Validate required fields
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        this.showFieldError(field, 'This field is required');
        isValid = false;
      } else {
        this.clearFieldError(field);
      }
    });

    // Validate quiz answers
    if (form.action.includes('submit-quiz')) {
      const radioGroups = this.getRadioGroups(form);
      radioGroups.forEach(groupName => {
        const checked = form.querySelector(`input[name="${groupName}"]:checked`);
        if (!checked) {
          this.showError(`Please answer question: ${groupName}`);
          isValid = false;
        }
      });
    }

    if (!isValid) {
      event.preventDefault();
      if (submitButton) {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
      }
    }
  }

  handleAnswerSelect(event) {
    const radio = event.target;
    const questionCard = radio.closest('.question-card');
    
    if (questionCard) {
      // Add visual feedback
      questionCard.classList.add('answered');
      
      // Store answer with timestamp
      this.answers[radio.name] = {
        value: radio.value,
        timestamp: Date.now()
      };
      
      // Update progress
      this.updateProgress();
      
      // Animate selection
      const optionGroup = radio.closest('.option-group');
      if (optionGroup) {
        optionGroup.classList.add('selected');
        
        // Remove selected class from siblings
        const siblings = optionGroup.parentNode.querySelectorAll('.option-group');
        siblings.forEach(sibling => {
          if (sibling !== optionGroup) {
            sibling.classList.remove('selected');
          }
        });
      }
    }
  }

  handleButtonHover(event) {
    const button = event.target;
    if (!button.disabled) {
      button.style.transform = 'translateY(-2px)';
    }
    
    button.addEventListener('mouseleave', () => {
      button.style.transform = '';
    }, { once: true });
  }

  getRadioGroups(form) {
    const radioButtons = form.querySelectorAll('input[type="radio"]');
    const groups = new Set();
    radioButtons.forEach(radio => groups.add(radio.name));
    return Array.from(groups);
  }

  showFieldError(field, message) {
    this.clearFieldError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error error-message';
    errorDiv.textContent = message;
    errorDiv.style.marginTop = '0.5rem';
    errorDiv.style.fontSize = '0.875rem';
    
    field.parentNode.appendChild(errorDiv);
    field.style.borderColor = 'var(--error-color)';
  }

  clearFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }
    field.style.borderColor = '';
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) {
      existing.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}-message fade-in`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '1000';
    notification.style.maxWidth = '400px';

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

  updateProgress() {
    const progressBar = document.querySelector('.progress-fill');
    if (!progressBar) return;

    const totalQuestions = document.querySelectorAll('.question-card').length;
    const answeredQuestions = Object.keys(this.answers).length;
    const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

    progressBar.style.width = `${progress}%`;
  }

  startQuizTimer() {
    const timerElement = document.querySelector('.quiz-timer');
    if (!timerElement) return;

    this.startTime = Date.now();
    const timeLimit = parseInt(timerElement.dataset.timeLimit) || 1800; // 30 minutes default

    this.timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      const remaining = Math.max(0, timeLimit - elapsed);
      
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      
      timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      // Warning when 5 minutes left
      if (remaining <= 300 && remaining > 0) {
        timerElement.style.color = 'var(--warning-color)';
      }
      
      // Auto-submit when time is up
      if (remaining === 0) {
        this.showError('Time is up! Submitting quiz automatically...');
        setTimeout(() => {
          const quizForm = document.querySelector('form[action*="submit-quiz"]');
          if (quizForm) {
            quizForm.submit();
          }
        }, 2000);
        clearInterval(this.timer);
      }
    }, 1000);
  }

  initializeAnimations() {
    // Add fade-in animation to content
    const contentCards = document.querySelectorAll('.content-card');
    contentCards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('fade-in');
      }, index * 200);
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('slide-in');
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.topic-card, .question-card');
    animatedElements.forEach(element => {
      observer.observe(element);
    });
  }

  // Accessibility improvements
  initializeAccessibility() {
    // Add keyboard navigation for radio buttons
    const radioButtons = document.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(radio => {
      radio.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          radio.checked = true;
          this.handleAnswerSelect(event);
        }
      });
    });

    // Add focus indicators
    const focusableElements = document.querySelectorAll('input, button, a');
    focusableElements.forEach(element => {
      element.addEventListener('focus', () => {
        element.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.2)';
      });
      
      element.addEventListener('blur', () => {
        element.style.boxShadow = '';
      });
    });
  }

  // Performance monitoring
  trackPerformance() {
    if ('performance' in window) {
      window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0];
        const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
        
        console.log(`Page load time: ${loadTime}ms`);
        
        // Track quiz completion time
        if (this.startTime) {
          const completionTime = (Date.now() - this.startTime) / 1000;
          console.log(`Quiz completion time: ${completionTime}s`);
        }
      });
    }
  }
}

// Utility functions
const utils = {
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
  },

  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  },

  saveToLocalStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn('Could not save to localStorage:', error);
    }
  },

  loadFromLocalStorage(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('Could not load from localStorage:', error);
      return null;
    }
  }
};

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new EduGenie();
  app.initializeAccessibility();
  app.trackPerformance();
  
  // Global error handling
  window.addEventListener('error', (event) => {
    console.error('Application error:', event.error);
    app.showError('An unexpected error occurred. Please try again.');
  });
  
  // Service worker registration for PWA capabilities
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/static/js/sw.js')
      .then(registration => {
        console.log('Service Worker registered successfully');
      })
      .catch(error => {
        console.log('Service Worker registration failed');
      });
  }
});
