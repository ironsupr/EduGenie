// Register Page JavaScript Functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeRegisterForm();
    initializePasswordStrength();
    initializeFormValidation();
    initializePlanSelection();
});

function initializeRegisterForm() {
    const form = document.querySelector('.register-form');
    if (!form) return;

    form.addEventListener('submit', handleFormSubmit);
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    
    // Validate form before submission
    if (!validateForm(form)) {
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
            // Success - redirect to dashboard or show success message
            showSuccessMessage('Account created successfully! Redirecting...');
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 2000);
        } else {
            const errorData = await response.json();
            showErrorMessage(errorData.message || 'Registration failed. Please try again.');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showErrorMessage('An error occurred. Please check your connection and try again.');
    } finally {
        // Remove loading state
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

function validateForm(form) {
    let isValid = true;
    const formData = new FormData(form);
    
    // Clear previous error states
    clearValidationStates(form);
    
    // Validate required fields
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showFieldError(field, 'This field is required');
            isValid = false;
        }
    });
    
    // Validate email format
    const emailField = form.querySelector('input[type="email"]');
    if (emailField && emailField.value && !isValidEmail(emailField.value)) {
        showFieldError(emailField, 'Please enter a valid email address');
        isValid = false;
    }
    
    // Validate password strength
    const passwordField = form.querySelector('input[name="password"]');
    if (passwordField && passwordField.value) {
        const strength = calculatePasswordStrength(passwordField.value);
        if (strength < 3) {
            showFieldError(passwordField, 'Password is too weak. Please choose a stronger password.');
            isValid = false;
        }
    }
    
    // Validate password confirmation
    const confirmPasswordField = form.querySelector('input[name="confirm_password"]');
    if (confirmPasswordField && confirmPasswordField.value !== passwordField.value) {
        showFieldError(confirmPasswordField, 'Passwords do not match');
        isValid = false;
    }
    
    return isValid;
}

function clearValidationStates(form) {
    form.querySelectorAll('.form-input, .form-select').forEach(field => {
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

function initializePasswordStrength() {
    const passwordField = document.querySelector('input[name="password"]');
    if (!passwordField) return;
    
    passwordField.addEventListener('input', function() {
        const strength = calculatePasswordStrength(this.value);
        updatePasswordStrengthDisplay(strength);
    });
}

function calculatePasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    
    return strength;
}

function updatePasswordStrengthDisplay(strength) {
    const strengthFill = document.getElementById('password-strength-fill');
    const strengthText = document.getElementById('password-strength-text');
    
    if (!strengthFill || !strengthText) return;
    
    strengthFill.className = 'password-strength-fill';
    
    switch (strength) {
        case 0:
        case 1:
            strengthFill.classList.add('weak');
            strengthText.textContent = 'Weak password';
            break;
        case 2:
            strengthFill.classList.add('fair');
            strengthText.textContent = 'Fair password';
            break;
        case 3:
            strengthFill.classList.add('good');
            strengthText.textContent = 'Good password';
            break;
        case 4:
        case 5:
            strengthFill.classList.add('strong');
            strengthText.textContent = 'Strong password';
            break;
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
    
    // Real-time validation for password confirmation
    const confirmPasswordField = document.querySelector('input[name="confirm_password"]');
    const passwordField = document.querySelector('input[name="password"]');
    
    if (confirmPasswordField && passwordField) {
        confirmPasswordField.addEventListener('blur', function() {
            if (this.value && this.value === passwordField.value) {
                showFieldSuccess(this);
            } else if (this.value) {
                showFieldError(this, 'Passwords do not match');
            }
        });
    }
}

function initializePlanSelection() {
    const planOptions = document.querySelectorAll('.plan-option');
    
    planOptions.forEach(option => {
        option.addEventListener('click', function() {
            const radio = this.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                selectPlan(radio.value);
            }
        });
    });
}

function selectPlan(planValue) {
    const planOptions = document.querySelectorAll('.plan-option');
    
    planOptions.forEach(option => {
        option.classList.remove('selected');
    });
    
    const selectedOption = document.querySelector(`input[value="${planValue}"]`).closest('.plan-option');
    if (selectedOption) {
        selectedOption.classList.add('selected');
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

// Add CSS for notification animations
const notificationStyles = document.createElement('style');
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
