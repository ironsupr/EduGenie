// Login Page JavaScript Functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeLoginForm();
    initializeFormValidation();
    initializeOAuthButtons();
    initializePasswordStrength();
    initializeTooltips();
    checkLoginState();
});

function initializeLoginForm() {
    const form = document.querySelector('.login-form');
    if (!form) return;

    form.addEventListener('submit', handleLoginSubmit);
    
    // Add input event listeners for real-time validation
    const inputs = form.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input));
    });
}

function initializePasswordStrength() {
    const passwordField = document.getElementById('password');
    const strengthMeter = document.getElementById('password-strength');
    
    if (passwordField && strengthMeter) {
        passwordField.addEventListener('input', function() {
            const password = this.value;
            if (password.length > 0) {
                strengthMeter.style.display = 'block';
                updatePasswordStrength(password);
            } else {
                strengthMeter.style.display = 'none';
            }
        });
    }
}

function updatePasswordStrength(password) {
    const strengthFill = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');
    
    if (!strengthFill || !strengthText) return;
    
    const strength = calculatePasswordStrength(password);
    
    strengthFill.className = `strength-fill ${strength.level}`;
    strengthText.textContent = `Password strength: ${strength.text}`;
}

function calculatePasswordStrength(password) {
    let score = 0;
    let level = 'weak';
    let text = 'Weak';
    
    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    // Determine strength level
    if (score >= 5) {
        level = 'strong';
        text = 'Strong';
    } else if (score >= 4) {
        level = 'good';
        text = 'Good';
    } else if (score >= 2) {
        level = 'fair';
        text = 'Fair';
    }
    
    return { level, text, score };
}

function initializeTooltips() {
    // Add tooltips for better UX
    const rememberCheckbox = document.getElementById('remember_me');
    if (rememberCheckbox) {
        rememberCheckbox.addEventListener('change', function() {
            if (this.checked) {
                showTooltip(this, 'You\'ll stay signed in for 30 days on this device');
            }
        });
    }
}

function checkLoginState() {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken') || getCookie('auth_token') || getCookie('session_token');
    const authUser = getCookie('auth_user');
    
    if (token || authUser) {
        // Verify with server
        fetch('/api/auth/status', {
            credentials: 'same-origin',
            headers: {
                'Authorization': token ? `Bearer ${token}` : ''
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.authenticated) {
                showInfoMessage(`You are already signed in as ${data.user.name}. Redirecting to dashboard...`);
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 2000);
            } else {
                // Clear invalid tokens
                localStorage.removeItem('authToken');
                if (getCookie('auth_token')) {
                    setCookie('auth_token', '', -1);
                }
            }
        })
        .catch(error => {
            console.log('Auth check failed:', error);
            // Clear potentially invalid tokens
            localStorage.removeItem('authToken');
        });
    }
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
    setButtonLoading(submitBtn, true);
    hideMessages(); // Clear any previous messages
    
    try {
        // First attempt: AJAX request
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin'
        });
        
        // Handle response based on content type
        const contentType = response.headers.get('content-type');
        let data = null;
        let isJson = false;
        
        if (contentType && contentType.includes('application/json')) {
            try {
                data = await response.json();
                isJson = true;
            } catch (e) {
                console.warn('Failed to parse JSON response:', e);
                isJson = false;
            }
        }
        
        if (response.ok) {
            // Success handling
            if (isJson && data) {
                // JSON response with data
                if (data.token) {
                    localStorage.setItem('authToken', data.token);
                    setCookie('auth_token', data.token, 7); // 7 days
                }
                
                showSuccessMessage(data.message || 'Login successful! Redirecting...');
                
                // Track successful login
                trackEvent('login_success', {
                    method: 'email',
                    remember_me: formData.get('remember_me') === 'on'
                });
                
                // Redirect after success message
                setTimeout(() => {
                    const redirectUrl = data.redirect_url || '/dashboard';
                    console.log('Redirecting to:', redirectUrl);
                    window.location.href = redirectUrl;
                }, 1200);
                
            } else {
                // Non-JSON success response (likely redirect)
                showSuccessMessage('Login successful! Redirecting...');
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1000);
            }
        } else {
            // Error handling
            let errorMessage = 'Login failed. Please try again.';
            
            if (isJson && data) {
                errorMessage = data.error || data.detail || errorMessage;
            } else if (response.status === 401) {
                errorMessage = 'Invalid email or password. Please check your credentials.';
            } else if (response.status === 422) {
                errorMessage = 'Please check your input and try again.';
            } else if (response.status >= 500) {
                errorMessage = 'Server error. Please try again later.';
            }
            
            showErrorMessage(errorMessage);
            
            // Track failed login attempt
            trackEvent('login_failed', {
                method: 'email',
                error: errorMessage,
                status: response.status
            });
        }
        
    } catch (error) {
        console.error('Login AJAX error:', error);
        
        // For network errors or other issues, fall back to form submission
        showInfoMessage('Attempting login...');
        
        setTimeout(() => {
            // Create a clean form for submission without AJAX
            const fallbackForm = document.createElement('form');
            fallbackForm.method = 'POST';
            fallbackForm.action = form.action;
            
            // Copy form data
            for (let [key, value] of formData.entries()) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = value;
                fallbackForm.appendChild(input);
            }
            
            document.body.appendChild(fallbackForm);
            fallbackForm.submit();
        }, 500);
        
    } finally {
        // Remove loading state
        setButtonLoading(submitBtn, false);
    }
}

function setButtonLoading(button, isLoading) {
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');
    
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
        if (btnText) btnText.style.opacity = '0';
        if (btnLoader) btnLoader.style.display = 'flex';
    } else {
        button.classList.remove('loading');
        button.disabled = false;
        if (btnText) btnText.style.opacity = '1';
        if (btnLoader) btnLoader.style.display = 'none';
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

function showInfoMessage(message) {
    showNotification(message, 'info');
}

function showNotification(message, type) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    let icon = 'fa-info-circle';
    let backgroundColor = 'var(--primary)';
    
    if (type === 'success') {
        icon = 'fa-check-circle';
        backgroundColor = 'var(--success)';
    } else if (type === 'error') {
        icon = 'fa-exclamation-circle';
        backgroundColor = 'var(--error)';
    } else if (type === 'info') {
        icon = 'fa-info-circle';
        backgroundColor = 'var(--primary)';
    }
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${icon}"></i>
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
        background: ${backgroundColor};
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
    
    // Auto-remove after appropriate time
    const autoRemoveTime = type === 'error' ? 7000 : 5000; // Errors stay longer
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }
    }, autoRemoveTime);
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

function hideMessages() {
    const messageContainer = document.getElementById('login-messages');
    const successMessage = document.getElementById('success-message');
    const errorMessage = document.getElementById('error-message');
    
    if (messageContainer) messageContainer.style.display = 'none';
    if (successMessage) successMessage.style.display = 'none';
    if (errorMessage) errorMessage.style.display = 'none';
}

function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function validateField(field) {
    if (field.type === 'email') {
        if (field.value && isValidEmail(field.value)) {
            showFieldSuccess(field);
            return true;
        } else if (field.value) {
            showFieldError(field, 'Please enter a valid email address');
            return false;
        }
    } else if (field.name === 'password') {
        if (field.value.length >= 8) {
            showFieldSuccess(field);
            return true;
        } else if (field.value) {
            showFieldError(field, 'Password must be at least 8 characters');
            return false;
        }
    }
    return true;
}

function clearFieldError(field) {
    field.classList.remove('error');
    const errorMessage = field.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

function trackEvent(eventName, data = {}) {
    // Simple event tracking - can be enhanced with analytics
    console.log(`Event: ${eventName}`, data);
    
    // If Google Analytics is available
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, data);
    }
    
    // If other analytics services are available, add here
}

function showTooltip(element, message) {
    // Simple tooltip implementation
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = message;
    tooltip.style.cssText = `
        position: absolute;
        background: var(--dark);
        color: white;
        padding: 0.5rem;
        border-radius: var(--radius);
        font-size: 0.875rem;
        z-index: 1000;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        margin-bottom: 0.5rem;
        white-space: nowrap;
    `;
    
    element.style.position = 'relative';
    element.appendChild(tooltip);
    
    setTimeout(() => {
        if (tooltip.parentElement) {
            tooltip.remove();
        }
    }, 3000);
}
