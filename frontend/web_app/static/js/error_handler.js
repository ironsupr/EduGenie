// Centralized Error Handling Utility for EduGenie
// This utility provides consistent error handling and notifications across the application

class ErrorHandler {
    constructor() {
        this.defaultRedirect = '/login';
        this.notificationDuration = 5000; // 5 seconds
    }

    /**
     * Handle API responses consistently across the application
     * @param {Response} response - Fetch API response
     * @param {string} successMessage - Optional message to show on success
     * @param {string} redirectUrl - URL to redirect to on session expiry (defaults to login)
     * @returns {Promise<Object>} - Response JSON data if successful
     */
    async handleApiResponse(response, successMessage = null, redirectUrl = null) {
        if (response.ok) {
            if (successMessage) {
                this.showNotification(successMessage, 'success');
            }
            return await response.json().catch(() => ({}));
        } else if (response.status === 401) {
            this.handleSessionExpiry(redirectUrl);
            throw new Error('Unauthorized');
        } else if (response.status === 403) {
            this.showNotification('You do not have permission to perform this action.', 'error');
            throw new Error('Forbidden');
        } else {
            const error = await response.json().catch(() => ({ detail: 'An unknown error occurred.' }));
            this.showNotification(error.detail || 'An unknown error occurred.', 'error');
            throw new Error(error.detail || 'An unknown error occurred.');
        }
    }

    /**
     * Handle session expiry by showing notification and redirecting to login
     * @param {string} redirectUrl - URL to redirect to after login (defaults to current page)
     */
    handleSessionExpiry(redirectUrl = null) {
        const currentPath = window.location.pathname + window.location.search;
        redirectUrl = redirectUrl || this.defaultRedirect + '?redirect_url=' + encodeURIComponent(currentPath);
        
        this.showNotification('Your session has expired. Please log in again.', 'error');
        
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 2000);
    }

    /**
     * Show user-friendly notification
     * @param {string} message - Message to display
     * @param {string} type - Notification type: 'success', 'error', 'warning', 'info'
     * @param {number} duration - How long to show the notification (ms)
     */
    showNotification(message, type = 'info', duration = null) {
        duration = duration || this.notificationDuration;
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `app-notification ${type}`;
        
        // Set icon based on notification type
        const iconClass = 
            type === 'success' ? 'fa-check-circle' : 
            type === 'error' ? 'fa-exclamation-circle' : 
            type === 'warning' ? 'fa-exclamation-triangle' : 
            'fa-info-circle';
        
        notification.innerHTML = `
            <i class="fas ${iconClass}"></i>
            <span>${message}</span>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Add close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.removeNotification(notification);
            });
        }
        
        // Show with animation
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Auto-hide after duration
        setTimeout(() => {
            this.removeNotification(notification);
        }, duration);
    }

    /**
     * Remove notification with animation
     * @param {HTMLElement} notification - Notification element to remove
     */
    removeNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300); // Match CSS transition duration
    }

    /**
     * Handle form validation errors
     * @param {Object} errors - Object with field names as keys and error messages as values
     * @param {string} formId - ID of the form containing the fields with errors
     */
    handleFormValidationErrors(errors, formId) {
        const form = document.getElementById(formId);
        if (!form) return;
        
        // Clear previous errors
        form.querySelectorAll('.field-error').forEach(el => el.remove());
        form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        
        // Add new error messages
        for (const [field, message] of Object.entries(errors)) {
            const input = form.querySelector(`[name="${field}"]`);
            if (input) {
                input.classList.add('is-invalid');
                
                const errorElement = document.createElement('div');
                errorElement.className = 'field-error';
                errorElement.textContent = message;
                
                // Insert after the input or its parent form group
                const formGroup = input.closest('.form-group') || input.parentNode;
                formGroup.appendChild(errorElement);
            }
        }
        
        // Focus the first field with an error
        const firstError = form.querySelector('.is-invalid');
        if (firstError) {
            firstError.focus();
        }
    }
}

// Create global instance
const errorHandler = new ErrorHandler();
