// ===== CONTACT FORM HANDLER =====
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = new FormHandler('contact-form', {
        showSuccessMessage: true,
        resetFormOnSuccess: true,
        redirectOnSuccess: false
    });

    // Phone number formatting
    const phoneField = document.getElementById('id_phone');
    if (phoneField) {
        phoneField.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length > 10) {
                value = value.substring(0, 10);
            }
            this.value = value;
        });
    }

    // Message character counter
    const messageField = document.getElementById('id_message');
    if (messageField) {
        const maxLength = 500;
        const counter = document.createElement('div');
        counter.className = 'character-counter';
        counter.style.cssText = `
            font-size: 0.875rem;
            color: #6c757d;
            text-align: right;
            margin-top: 0.25rem;
        `;
        messageField.parentNode.appendChild(counter);
        
        function updateCounter() {
            const remaining = maxLength - messageField.value.length;
            counter.textContent = `${remaining} characters remaining`;
            counter.style.color = remaining < 50 ? '#dc3545' : '#6c757d';
        }
        
        messageField.addEventListener('input', updateCounter);
        updateCounter();
    }

    // Subject-based form customization
    const subjectField = document.getElementById('id_subject');
    const messageLabel = document.querySelector('label[for="id_message"]');
    
    if (subjectField && messageLabel) {
        subjectField.addEventListener('change', function() {
            updateMessagePlaceholder(this.value);
        });
        
        // Initialize placeholder
        updateMessagePlaceholder(subjectField.value);
    }

    // Email validation
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

    // Form submission with additional validation
    contactForm.form.addEventListener('submit', function(e) {
        const subject = subjectField.value;
        const message = messageField.value;
        
        // Check for minimum message length based on subject
        const minLength = getMinimumMessageLength(subject);
        if (message.length < minLength) {
            e.preventDefault();
            showError(`Please provide at least ${minLength} characters for your message.`);
            return;
        }
        
        // Check for spam-like content (basic implementation)
        if (isSpamLike(message)) {
            if (!confirm('Your message appears to be very short or repetitive. Are you sure you want to send it?')) {
                e.preventDefault();
                return;
            }
        }
    });
});

function updateMessagePlaceholder(subject) {
    const messageField = document.getElementById('id_message');
    if (!messageField) return;
    
    const placeholders = {
        'Booking': 'Please provide details about your event, including date, number of guests, and any specific requirements...',
        'Partnership': 'Please describe your venue, location, capacity, and why you\'d like to partner with us...',
        'Support': 'Please describe the issue you\'re experiencing and any error messages you\'ve seen...',
        'General': 'Please provide details about your inquiry...',
        'Feedback': 'Please share your feedback about our service...',
        'Other': 'Please provide details about your inquiry...'
    };
    
    const placeholder = placeholders[subject] || 'Please provide details about your inquiry...';
    messageField.placeholder = placeholder;
}

function getMinimumMessageLength(subject) {
    const minLengths = {
        'Booking': 50,
        'Partnership': 100,
        'Support': 30,
        'General': 30,
        'Feedback': 20,
        'Other': 30
    };
    
    return minLengths[subject] || 30;
}

function isSpamLike(message) {
    // Basic spam detection
    const words = message.toLowerCase().split(' ');
    const uniqueWords = new Set(words);
    const repetitionRatio = uniqueWords.size / words.length;
    
    // Check for excessive repetition
    if (repetitionRatio < 0.3 && words.length > 10) {
        return true;
    }
    
    // Check for very short messages
    if (message.length < 20) {
        return true;
    }
    
    // Check for common spam patterns
    const spamPatterns = [
        /(.)\1{4,}/, // Repeated characters
        /(.)\1{3,}/g, // Multiple repeated characters
        /(.)\1{2,}/g // Triple repeated characters
    ];
    
    return spamPatterns.some(pattern => pattern.test(message));
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        padding: 0.75rem 1rem;
        margin-bottom: 1rem;
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
        border-radius: 0.375rem;
    `;
    
    const form = document.getElementById('contact-form');
    form.insertBefore(errorDiv, form.firstChild);
    
    setTimeout(() => errorDiv.remove(), 5000);
}