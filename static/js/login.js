// ===== LOGIN FORM HANDLER =====
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = new FormHandler('login-form', {
        showSuccessMessage: true,
        resetFormOnSuccess: false,
        redirectOnSuccess: true,
        redirectUrl: '/'
    });

    // Remember me functionality
    const rememberMe = document.getElementById('remember-me');
    const usernameField = document.getElementById('id_username');
    
    if (rememberMe && usernameField) {
        // Load saved username
        const savedUsername = localStorage.getItem('remembered_username');
        if (savedUsername) {
            usernameField.value = savedUsername;
            rememberMe.checked = true;
        }

        // Save username on form submit
        loginForm.form.addEventListener('submit', function() {
            if (rememberMe.checked) {
                localStorage.setItem('remembered_username', usernameField.value);
            } else {
                localStorage.removeItem('remembered_username');
            }
        });
    }

    // Show/hide password functionality
    const passwordField = document.getElementById('id_password');
    const togglePassword = document.getElementById('toggle-password');
    
    if (passwordField && togglePassword) {
        togglePassword.addEventListener('click', function() {
            const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordField.setAttribute('type', type);
            
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }

    // Auto-focus on username field
    if (usernameField) {
        usernameField.focus();
    }
});
