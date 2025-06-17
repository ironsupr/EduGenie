// Authentication State Manager for EduGenie
// Handles navigation bar updates and authentication state checking

class AuthStateManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.checkInterval = null;
        
        this.init();
    }

    async init() {
        // Check authentication status on page load
        await this.checkAuthStatus();
        
        // Update navigation based on auth state
        this.updateNavigation();
        
        // Set up periodic auth checks (every 5 minutes)
        this.startPeriodicCheck();
        
        // Add logout button handlers
        this.setupLogoutHandlers();
    }    async checkAuthStatus() {
        try {
            const response = await fetch('/api/me', {
                method: 'GET',
                credentials: 'include'  // Include cookies
            });

            if (response.ok) {
                this.currentUser = await response.json();
                this.isAuthenticated = true;
                console.log('User authenticated:', this.currentUser.full_name);
            } else {
                this.currentUser = null;
                this.isAuthenticated = false;
                console.log('User not authenticated');
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            this.currentUser = null;
            this.isAuthenticated = false;
        }

        return this.isAuthenticated;
    }

    updateNavigation() {
        const navActions = document.querySelector('.nav-actions');
        const navProfile = document.querySelector('.nav-profile');
        
        if (!navActions) return;

        if (this.isAuthenticated && this.currentUser) {
            // Show authenticated navigation
            navActions.innerHTML = this.getAuthenticatedNavHTML();
        } else {
            // Show unauthenticated navigation
            navActions.innerHTML = this.getUnauthenticatedNavHTML();
        }

        // Re-setup logout handlers after DOM update
        this.setupLogoutHandlers();
    }

    getUnauthenticatedNavHTML() {
        return `
            <a href="/login" class="btn btn-outline">Sign In</a>
            <a href="/register" class="btn btn-primary">Get Started</a>
        `;
    }    getAuthenticatedNavHTML() {
        const user = this.currentUser;
        const avatarUrl = user.avatar_url || '/static/images/default-avatar.svg';
        
        return `
            <div class="nav-user-menu">
                <div class="nav-user-info" onclick="toggleUserDropdown()">
                    <img src="${avatarUrl}" alt="${user.full_name}" class="nav-avatar">
                    <span class="nav-user-name">${user.full_name}</span>
                    <i class="fas fa-chevron-down nav-dropdown-icon"></i>
                </div>
                <div class="nav-user-dropdown" id="userDropdown">
                    <div class="dropdown-header">
                        <img src="${avatarUrl}" alt="${user.full_name}" class="dropdown-avatar">
                        <div class="dropdown-user-info">
                            <div class="dropdown-name">${user.full_name}</div>
                            <div class="dropdown-email">${user.email}</div>
                        </div>
                    </div>
                    <div class="dropdown-divider"></div>
                    <a href="/dashboard" class="dropdown-item">
                        <i class="fas fa-tachometer-alt"></i>
                        Dashboard
                    </a>
                    <a href="/profile" class="dropdown-item">
                        <i class="fas fa-user"></i>
                        Profile Settings
                    </a>
                    <a href="/learning" class="dropdown-item">
                        <i class="fas fa-book"></i>
                        Your Learning
                    </a>
                    <div class="dropdown-divider"></div>
                    <button class="dropdown-item logout-btn" onclick="authManager.logout()">
                        <i class="fas fa-sign-out-alt"></i>
                        Sign Out
                    </button>
                </div>
            </div>
        `;
    }

    setupLogoutHandlers() {
        // Setup logout button handlers
        const logoutButtons = document.querySelectorAll('.logout-btn');
        logoutButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        });
    }

    async logout() {
        try {
            // Show loading state
            const logoutButtons = document.querySelectorAll('.logout-btn');
            logoutButtons.forEach(btn => {
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing out...';
                btn.disabled = true;
            });

            const response = await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok || response.status === 303) {
                // Clear auth state
                this.currentUser = null;
                this.isAuthenticated = false;
                
                // Show success message
                this.showNotification('Signed out successfully', 'success');
                
                // Redirect to home page after short delay
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            } else {
                throw new Error('Logout failed');
            }
        } catch (error) {
            console.error('Logout error:', error);
            this.showNotification('Error signing out. Please try again.', 'error');
            
            // Reset logout buttons
            const logoutButtons = document.querySelectorAll('.logout-btn');
            logoutButtons.forEach(btn => {
                btn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Sign Out';
                btn.disabled = false;
            });
        }
    }

    startPeriodicCheck() {
        // Check auth status every 5 minutes
        this.checkInterval = setInterval(() => {
            this.checkAuthStatus().then(() => {
                this.updateNavigation();
            });
        }, 5 * 60 * 1000);
    }

    stopPeriodicCheck() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    showNotification(message, type = 'info') {
        // Create or update notification
        let notification = document.querySelector('.auth-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'auth-notification';
            document.body.appendChild(notification);
        }

        notification.className = `auth-notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        notification.style.display = 'block';

        // Auto-hide after 3 seconds
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
}

// Global functions
function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const userMenu = document.querySelector('.nav-user-menu');
    const dropdown = document.getElementById('userDropdown');
    
    if (dropdown && userMenu && !userMenu.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// Initialize auth manager when DOM is loaded
let authManager;
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing auth manager...');
    authManager = new AuthStateManager();
});

// Also initialize on window load as a fallback
window.addEventListener('load', function() {
    if (!authManager) {
        console.log('Fallback: Initializing auth manager on window load...');
        authManager = new AuthStateManager();
    }
});

// Export for other scripts
window.authManager = authManager;
