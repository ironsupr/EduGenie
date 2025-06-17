// Profile page JavaScript functionality
// frontend/web_app/static/js/profile.js

class ProfileManager {
    constructor() {
        this.init();
    }

    init() {
        this.initTabs();
        this.initAvatarUpload();
        this.initFormHandlers();
        this.initSecuritySettings();
        this.initNotificationSettings();
        this.initGoalProgress();
    }

    // Tab navigation
    initTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanes = document.querySelectorAll('.tab-pane');

        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const targetTab = button.getAttribute('data-tab');

                // Remove active class from all tabs and panes
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));

                // Add active class to clicked tab and corresponding pane
                button.classList.add('active');
                const targetPane = document.getElementById(`${targetTab}-tab`);
                if (targetPane) {
                    targetPane.classList.add('active');
                }
            });
        });
    }

    // Avatar upload functionality
    initAvatarUpload() {
        const avatarContainer = document.querySelector('.profile-avatar-container');
        const avatarUpload = document.getElementById('avatar-upload');
        const profileAvatar = document.getElementById('profile-avatar');

        if (avatarContainer && avatarUpload) {
            avatarContainer.addEventListener('click', () => {
                avatarUpload.click();
            });

            avatarUpload.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    if (file.size > 5 * 1024 * 1024) { // 5MB limit
                        this.showAlert('File size must be less than 5MB', 'error');
                        return;
                    }

                    if (!file.type.startsWith('image/')) {
                        this.showAlert('Please select a valid image file', 'error');
                        return;
                    }

                    const reader = new FileReader();
                    reader.onload = (e) => {
                        profileAvatar.src = e.target.result;
                        this.uploadAvatar(file);
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }

    // Form handlers
    initFormHandlers() {
        // Personal information form
        const personalForm = document.getElementById('personal-form');
        if (personalForm) {
            personalForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.savePersonalInfo();
            });
        }

        // Learning preferences form
        const learningForm = document.getElementById('learning-form');
        if (learningForm) {
            learningForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveLearningPreferences();
            });
        }
    }

    // Security settings
    initSecuritySettings() {
        const changePasswordBtn = document.getElementById('change-password-btn');
        const enableTwoFactorBtn = document.getElementById('enable-2fa-btn');

        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => {
                this.showChangePasswordModal();
            });
        }

        if (enableTwoFactorBtn) {
            enableTwoFactorBtn.addEventListener('click', () => {
                this.toggle2FA();
            });
        }
    }

    // Notification settings
    initNotificationSettings() {
        const notificationToggles = document.querySelectorAll('.notification-toggle');
        
        notificationToggles.forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const setting = e.target.getAttribute('data-setting');
                const enabled = e.target.checked;
                this.updateNotificationSetting(setting, enabled);
            });
        });
    }

    // Goal progress
    initGoalProgress() {
        this.animateProgressBars();
        this.updateStreakCalendar();
    }

    // API Methods
    async uploadAvatar(file) {
        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const response = await fetch('/api/user/avatar', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (response.ok) {
                this.showAlert('Profile picture updated successfully!', 'success');
            } else {
                throw new Error('Failed to upload avatar');
            }
        } catch (error) {
            console.error('Avatar upload error:', error);
            this.showAlert('Failed to update profile picture', 'error');
        }
    }

    async savePersonalInfo() {
        try {
            const formData = new FormData(document.getElementById('personal-form'));
            const data = Object.fromEntries(formData.entries());

            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                credentials: 'include'
            });

            if (response.ok) {
                this.showAlert('Personal information updated successfully!', 'success');
            } else {
                throw new Error('Failed to update personal information');
            }
        } catch (error) {
            console.error('Save personal info error:', error);
            this.showAlert('Failed to update personal information', 'error');
        }
    }

    async saveLearningPreferences() {
        try {
            const formData = new FormData(document.getElementById('learning-form'));
            const data = Object.fromEntries(formData.entries());

            const response = await fetch('/api/user/preferences', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                credentials: 'include'
            });

            if (response.ok) {
                this.showAlert('Learning preferences updated successfully!', 'success');
            } else {
                throw new Error('Failed to update learning preferences');
            }
        } catch (error) {
            console.error('Save learning preferences error:', error);
            this.showAlert('Failed to update learning preferences', 'error');
        }
    }

    async updateNotificationSetting(setting, enabled) {
        try {
            const response = await fetch('/api/user/notifications', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ [setting]: enabled }),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to update notification setting');
            }
        } catch (error) {
            console.error('Update notification setting error:', error);
            this.showAlert('Failed to update notification setting', 'error');
        }
    }

    // UI Methods
    showChangePasswordModal() {
        // Create and show change password modal
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Change Password</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <form id="change-password-form">
                    <div class="form-group">
                        <label for="current-password">Current Password</label>
                        <input type="password" id="current-password" name="current_password" required>
                    </div>
                    <div class="form-group">
                        <label for="new-password">New Password</label>
                        <input type="password" id="new-password" name="new_password" required>
                        <div class="password-strength" id="password-strength"></div>
                    </div>
                    <div class="form-group">
                        <label for="confirm-password">Confirm New Password</label>
                        <input type="password" id="confirm-password" name="confirm_password" required>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn btn-outline modal-cancel">Cancel</button>
                        <button type="submit" class="btn btn-primary">Update Password</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Handle modal close
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('.modal-cancel').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // Handle form submission
        modal.querySelector('#change-password-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.changePassword(new FormData(e.target));
            document.body.removeChild(modal);
        });

        // Password strength indicator
        const newPasswordInput = modal.querySelector('#new-password');
        const strengthIndicator = modal.querySelector('#password-strength');
        
        newPasswordInput.addEventListener('input', (e) => {
            const strength = this.calculatePasswordStrength(e.target.value);
            strengthIndicator.className = `password-strength ${strength.class}`;
            strengthIndicator.textContent = strength.text;
        });
    }

    async changePassword(formData) {
        try {
            const data = Object.fromEntries(formData.entries());
            
            if (data.new_password !== data.confirm_password) {
                this.showAlert('New passwords do not match', 'error');
                return;
            }

            const response = await fetch('/api/user/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    current_password: data.current_password,
                    new_password: data.new_password
                }),
                credentials: 'include'
            });

            if (response.ok) {
                this.showAlert('Password changed successfully!', 'success');
            } else {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to change password');
            }
        } catch (error) {
            console.error('Change password error:', error);
            this.showAlert(error.message || 'Failed to change password', 'error');
        }
    }

    calculatePasswordStrength(password) {
        let score = 0;
        
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (score < 3) return { class: 'weak', text: 'Weak password' };
        if (score < 5) return { class: 'medium', text: 'Medium strength' };
        return { class: 'strong', text: 'Strong password' };
    }

    async toggle2FA() {
        try {
            const response = await fetch('/api/user/2fa/toggle', {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                const result = await response.json();
                this.showAlert(
                    result.enabled ? '2FA enabled successfully!' : '2FA disabled successfully!',
                    'success'
                );
                
                // Update button text
                const btn = document.getElementById('enable-2fa-btn');
                if (btn) {
                    btn.textContent = result.enabled ? 'Disable 2FA' : 'Enable 2FA';
                }
            } else {
                throw new Error('Failed to toggle 2FA');
            }
        } catch (error) {
            console.error('Toggle 2FA error:', error);
            this.showAlert('Failed to toggle 2FA', 'error');
        }
    }

    animateProgressBars() {
        const progressBars = document.querySelectorAll('.progress-fill');
        
        progressBars.forEach(bar => {
            const width = bar.style.width;
            bar.style.width = '0%';
            
            setTimeout(() => {
                bar.style.transition = 'width 1s ease-out';
                bar.style.width = width;
            }, 100);
        });
    }

    updateStreakCalendar() {
        // Add animation to streak calendar
        const calendarDays = document.querySelectorAll('.calendar-day');
        
        calendarDays.forEach((day, index) => {
            setTimeout(() => {
                day.style.opacity = '1';
                day.style.transform = 'scale(1)';
            }, index * 100);
        });
    }

    showAlert(message, type = 'info') {
        // Create alert element
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <div class="alert-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="alert-close">&times;</button>
        `;

        // Add to page
        document.body.appendChild(alert);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(alert)) {
                document.body.removeChild(alert);
            }
        }, 5000);

        // Handle manual close
        alert.querySelector('.alert-close').addEventListener('click', () => {
            if (document.body.contains(alert)) {
                document.body.removeChild(alert);
            }
        });
    }
}

// Global functions for template usage
function editProfile() {
    // Switch to personal info tab
    document.querySelector('[data-tab="personal"]').click();
    // Focus on first input
    setTimeout(() => {
        document.getElementById('full_name').focus();
    }, 100);
}

function shareProfile() {
    if (navigator.share) {
        navigator.share({
            title: 'My EduGenie Profile',
            text: 'Check out my learning progress on EduGenie!',
            url: window.location.href
        });
    } else {
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(window.location.href).then(() => {
            profileManager.showAlert('Profile link copied to clipboard!', 'success');
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.profileManager = new ProfileManager();
});

// Add CSS for modals and alerts
const style = document.createElement('style');
style.textContent = `
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .modal-content {
        background: white;
        border-radius: 12px;
        padding: 2rem;
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e5e7eb;
    }

    .modal-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #6b7280;
    }

    .modal-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        margin-top: 1.5rem;
    }

    .password-strength {
        height: 4px;
        margin-top: 0.5rem;
        border-radius: 2px;
        transition: all 0.3s ease;
    }

    .password-strength.weak { background: #ef4444; }
    .password-strength.medium { background: #f59e0b; }
    .password-strength.strong { background: #10b981; }

    .alert {
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: white;
        border-radius: 8px;
        padding: 1rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        z-index: 1100;
        display: flex;
        align-items: center;
        gap: 1rem;
        min-width: 300px;
        animation: slideIn 0.3s ease-out;
    }

    .alert-success { border-left: 4px solid #10b981; }
    .alert-error { border-left: 4px solid #ef4444; }
    .alert-info { border-left: 4px solid #3b82f6; }

    .alert-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex: 1;
    }

    .alert-close {
        background: none;
        border: none;
        cursor: pointer;
        color: #6b7280;
        font-size: 1.2rem;
    }

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
`;
document.head.appendChild(style);
