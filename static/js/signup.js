// ===== SIGNUP FORM HANDLER =====
document.addEventListener('DOMContentLoaded', function() {
    const signupForm = new FormHandler('signup-form', {
        showSuccessMessage: true,
        resetFormOnSuccess: true,
        redirectOnSuccess: true,
        redirectUrl: '/'
    });

    // Additional validation for password confirmation
    const password1 = document.getElementById('id_password1');
    const password2 = document.getElementById('id_password2');
    
    if (password1 && password2) {
        password2.addEventListener('input', function() {
            if (password1.value !== password2.value) {
                password2.setCustomValidity('Passwords do not match');
            } else {
                password2.setCustomValidity('');
            }
        });
    }

    // Real-time email validation
    const emailField = document.getElementById('id_email');
    if (emailField) {
        emailField.addEventListener('blur', function() {
            const email = this.value;
            if (email && !isValidEmail(email)) {
                this.setCustomValidity('Please enter a valid email address');
            } else {
                this.setCustomValidity('');
            }
        });
    }

    // Phone number formatting
    const phoneField = document.querySelector('input[name="phone"]');
    if (phoneField) {
        phoneField.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length > 10) {
                value = value.substring(0, 10);
            }
            this.value = value;
        });
    }
});

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}