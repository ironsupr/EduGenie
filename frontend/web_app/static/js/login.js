// Login Page JavaScript Functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeLoginForm();
    initializeFormValidation();
    initializeOAuthButtons();
});

function initializeLoginForm() {
    const form = document.querySelector('.login-form');
    if (!form) return;

    form.addEventListener('submit', handleLoginSubmit);
}

async function handleLoginSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    
    // Validate form before submission
    if (!validateLoginForm(form)) {
        return;
    }
    
    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    try {
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            // Success - redirect to dashboard
            showSuccessMessage('Welcome back! Redirecting to your dashboard...');
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1500);
        } else {
            const errorData = await response.json();
            showErrorMessage(errorData.message || 'Invalid email or password. Please try again.');
        }
    } catch (error) {
        console.error('Login error:', error);
        showErrorMessage('An error occurred. Please check your connection and try again.');
    } finally {
        // Remove loading state
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

function validateLoginForm(form) {
    let isValid = true;
    
    // Clear previous error states
    clearValidationStates(form);
    
    // Validate email
    const emailField = form.querySelector('input[type="email"]');
    if (!emailField.value.trim()) {
        showFieldError(emailField, 'Email is required');
        isValid = false;
    } else if (!isValidEmail(emailField.value)) {
        showFieldError(emailField, 'Please enter a valid email address');
        isValid = false;
    }
    
    // Validate password
    const passwordField = form.querySelector('input[name="password"]');
    if (!passwordField.value.trim()) {
        showFieldError(passwordField, 'Password is required');
        isValid = false;
    }
    
    return isValid;
}

function clearValidationStates(form) {
    form.querySelectorAll('.form-input').forEach(field => {
        field.classList.remove('error', 'success');
    });
    form.querySelectorAll('.error-message').forEach(msg => msg.remove());
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    
    field.parentNode.appendChild(errorElement);
}

function showFieldSuccess(field) {
    field.classList.remove('error');
    field.classList.add('success');
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function initializeFormValidation() {
    // Real-time validation for email
    const emailField = document.querySelector('input[type="email"]');
    if (emailField) {
        emailField.addEventListener('blur', function() {
            if (this.value && isValidEmail(this.value)) {
                showFieldSuccess(this);
            } else if (this.value) {
                showFieldError(this, 'Please enter a valid email address');
            }
        });
    }
}

function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const eyeIcon = document.getElementById(fieldId + '-eye');
    
    if (field.type === 'password') {
        field.type = 'text';
        eyeIcon.className = 'fas fa-eye-slash';
    } else {
        field.type = 'password';
        eyeIcon.className = 'fas fa-eye';
    }
}

function showSuccessMessage(message) {
    showNotification(message, 'success');
}

function showErrorMessage(message) {
    showNotification(message, 'error');
}

function showNotification(message, type) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success)' : 'var(--error)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 1rem;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Add CSS for notification animations (if not already present)
if (!document.querySelector('#notification-styles')) {
    const notificationStyles = document.createElement('style');
    notificationStyles.id = 'notification-styles';
    notificationStyles.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
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
            gap: 0.5rem;
            flex: 1;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 0.25rem;
            border-radius: var(--radius-sm);
            opacity: 0.8;
            transition: opacity 0.3s ease;
        }
        
        .notification-close:hover {
            opacity: 1;
        }
    `;
    
    document.head.appendChild(notificationStyles);
}

function initializeOAuthButtons() {
    // Google OAuth button
    const googleBtn = document.querySelector('.social-btn[onclick*="google"], .social-btn:has(.fab.fa-google)');
    if (googleBtn) {
        googleBtn.removeAttribute('onclick'); // Remove any existing onclick
        googleBtn.addEventListener('click', () => handleOAuthLogin('google'));
    }
    
    // GitHub OAuth button
    const githubBtn = document.querySelector('.social-btn[onclick*="github"], .social-btn:has(.fab.fa-github)');
    if (githubBtn) {
        githubBtn.removeAttribute('onclick'); // Remove any existing onclick
        githubBtn.addEventListener('click', () => handleOAuthLogin('github'));
    }
}

async function handleOAuthLogin(provider) {
    try {
        // Show loading state
        const button = event.target.closest('.social-btn');
        const originalText = button.innerHTML;
        button.disabled = true;
        button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Connecting...`;
        
        // Redirect to OAuth login endpoint
        window.location.href = `/auth/login/${provider}`;
    } catch (error) {
        console.error(`${provider} login error:`, error);
        showErrorMessage(`Failed to connect with ${provider}. Please try again.`);
        
        // Reset button state
        const button = event.target.closest('.social-btn');
        button.disabled = false;
        button.innerHTML = originalText;
    }
}
