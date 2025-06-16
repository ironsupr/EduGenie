// This file can contain shared authentication-related client-side scripts
// For now, it will handle password reset.

document.addEventListener('DOMContentLoaded', function() {
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handlePasswordReset);
    }
});

async function handlePasswordReset(event) {
    event.preventDefault();
    const emailInput = document.getElementById('email');
    const messageDiv = document.getElementById('reset-message');

    if (!emailInput || !messageDiv) {
        console.error("Required form elements not found for password reset.");
        return;
    }

    const email = emailInput.value;
    messageDiv.textContent = ''; // Clear previous messages
    messageDiv.className = 'form-message'; // Reset class

    if (!email) {
        messageDiv.textContent = 'Please enter your email address.';
        messageDiv.classList.add('error'); // Add error class for styling
        return;
    }

    // Ensure Firebase Auth is available (initialized via <script type="module"> in HTML)
    if (!window.firebaseAuth || !window.firebaseApp) {
        console.error("Firebase Auth is not initialized. Ensure Firebase SDKs are loaded and initialized correctly.");
        messageDiv.textContent = 'Password reset service is unavailable. Please try again later.';
        messageDiv.classList.add('error');
        return;
    }

    const auth = window.firebaseAuth; // Use the globally initialized auth instance

    try {
        // Dynamically import sendPasswordResetEmail from the Firebase Auth SDK
        const { sendPasswordResetEmail } = await import('https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js');

        await sendPasswordResetEmail(auth, email);

        messageDiv.textContent = 'Password reset email sent! Please check your inbox (and spam folder).';
        messageDiv.classList.add('success'); // Add success class for styling
        emailInput.value = ''; // Clear the input field

        console.log('Password reset email sent successfully for:', email);

    } catch (error) {
        console.error('Error sending password reset email:', error);
        let friendlyMessage = 'An error occurred. Please try again.';
        if (error.code) {
            switch (error.code) {
                case 'auth/invalid-email':
                    friendlyMessage = 'The email address is not valid.';
                    break;
                case 'auth/user-not-found':
                    // For security, you might not want to reveal if an email is registered or not.
                    // So, a generic message is often preferred.
                    friendlyMessage = 'If your email is registered, a password reset link has been sent.';
                    // Or, if you want to be more specific (consider security implications):
                    // friendlyMessage = 'No user found with this email address.';
                    break;
                default:
                    friendlyMessage = `Error: ${error.message}`; // More specific for debugging if needed
            }
        }
        messageDiv.textContent = friendlyMessage;
        messageDiv.classList.add('error');
    }
}

console.log("auth_scripts.js loaded.");
