// Debug Authentication State Manager
// This version includes extensive console logging to help diagnose issues

class AuthStateManagerDebug {
    constructor() {
        console.log('🔧 AuthStateManagerDebug: Initializing...');
        this.currentUser = null;
        this.isAuthenticated = false;
        this.checkInterval = null;
        
        this.init();
    }

    async init() {
        console.log('🔧 AuthStateManagerDebug: Starting initialization...');
        
        // Check if required DOM elements exist
        const navActions = document.querySelector('.nav-actions');
        console.log('🔧 Nav actions element:', navActions);
        
        if (!navActions) {
            console.error('❌ .nav-actions element not found! Navigation updates will not work.');
            return;
        }
        
        // Check authentication status on page load
        console.log('🔧 Checking authentication status...');
        await this.checkAuthStatus();
        
        // Update navigation based on auth state
        console.log('🔧 Updating navigation...');
        this.updateNavigation();
        
        console.log('🔧 AuthStateManagerDebug: Initialization complete');
    }

    async checkAuthStatus() {
        console.log('🔧 Making request to /api/user/profile...');
        
        try {
            const response = await fetch('/api/user/profile', {
                method: 'GET',
                credentials: 'include'  // Include cookies
            });

            console.log('🔧 Response status:', response.status);
            console.log('🔧 Response headers:', Object.fromEntries(response.headers.entries()));

            if (response.ok) {
                this.currentUser = await response.json();
                this.isAuthenticated = true;
                console.log('✅ User authenticated:', this.currentUser.full_name);
                console.log('🔧 User data:', this.currentUser);
            } else {
                this.currentUser = null;
                this.isAuthenticated = false;
                console.log('❌ User not authenticated, status:', response.status);
                
                if (response.status === 401) {
                    console.log('🔧 401 Unauthorized - user needs to log in');
                } else {
                    const errorText = await response.text();
                    console.log('🔧 Error response:', errorText);
                }
            }
        } catch (error) {
            console.error('❌ Auth check failed:', error);
            this.currentUser = null;
            this.isAuthenticated = false;
        }

        console.log('🔧 Final auth state:', {
            isAuthenticated: this.isAuthenticated,
            currentUser: this.currentUser
        });

        return this.isAuthenticated;
    }

    updateNavigation() {
        console.log('🔧 Updating navigation, auth state:', this.isAuthenticated);
        
        const navActions = document.querySelector('.nav-actions');
        
        if (!navActions) {
            console.error('❌ .nav-actions element not found during update!');
            return;
        }

        console.log('🔧 Current nav-actions HTML:', navActions.innerHTML);

        if (this.isAuthenticated && this.currentUser) {
            console.log('🔧 Setting authenticated navigation...');
            navActions.innerHTML = this.getAuthenticatedNavHTML();
        } else {
            console.log('🔧 Setting unauthenticated navigation...');
            navActions.innerHTML = this.getUnauthenticatedNavHTML();
        }

        console.log('🔧 Updated nav-actions HTML:', navActions.innerHTML);

        // Re-setup logout handlers after DOM update
        this.setupLogoutHandlers();
    }

    getUnauthenticatedNavHTML() {
        const html = `
            <a href="/login" class="btn btn-outline">Sign In</a>
            <a href="/register" class="btn btn-primary">Get Started</a>
        `;
        console.log('🔧 Unauthenticated HTML:', html);
        return html;
    }

    getAuthenticatedNavHTML() {
        const user = this.currentUser;
        const avatarUrl = user.avatar_url || '/static/images/default-avatar.svg';
        
        const html = `
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
                    <button class="dropdown-item logout-btn" onclick="authManagerDebug.logout()">
                        <i class="fas fa-sign-out-alt"></i>
                        Sign Out
                    </button>
                </div>
            </div>
        `;
        console.log('🔧 Authenticated HTML:', html);
        return html;
    }

    setupLogoutHandlers() {
        console.log('🔧 Setting up logout handlers...');
        const logoutButtons = document.querySelectorAll('.logout-btn');
        console.log('🔧 Found logout buttons:', logoutButtons.length);
        
        logoutButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🔧 Logout button clicked');
                this.logout();
            });
        });
    }

    async logout() {
        console.log('🔧 Starting logout process...');
        
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

            console.log('🔧 Logout response status:', response.status);

            if (response.ok || response.status === 303) {
                // Clear auth state
                this.currentUser = null;
                this.isAuthenticated = false;
                
                console.log('✅ Logout successful');
                
                // Update navigation immediately
                this.updateNavigation();
                
                // Redirect to home page after short delay
                setTimeout(() => {
                    console.log('🔧 Redirecting to home page...');
                    window.location.href = '/';
                }, 1000);
            } else {
                throw new Error(`Logout failed with status ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Logout error:', error);
            
            // Reset logout buttons
            const logoutButtons = document.querySelectorAll('.logout-btn');
            logoutButtons.forEach(btn => {
                btn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Sign Out';
                btn.disabled = false;
            });
        }
    }
}

// Global functions
function toggleUserDropdown() {
    console.log('🔧 Toggle user dropdown called');
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
        console.log('🔧 Dropdown toggled, show class:', dropdown.classList.contains('show'));
    } else {
        console.error('❌ User dropdown not found');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const userMenu = document.querySelector('.nav-user-menu');
    const dropdown = document.getElementById('userDropdown');
    
    if (dropdown && userMenu && !userMenu.contains(event.target)) {
        dropdown.classList.remove('show');
        console.log('🔧 Dropdown closed by outside click');
    }
});

// Initialize debug auth manager when DOM is loaded
let authManagerDebug;
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 DOM loaded, initializing debug auth manager...');
    authManagerDebug = new AuthStateManagerDebug();
});

// Export for debugging
window.authManagerDebug = authManagerDebug;
