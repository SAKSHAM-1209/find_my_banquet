// ===== FORM UTILITIES =====
// Common utilities for all forms with CSRF handling

class FormHandler {
    constructor(formId, options = {}) {
        this.form = document.getElementById(formId);
        this.submitBtn = this.form.querySelector('button[type="submit"]');
        this.originalBtnText = this.submitBtn.textContent;
        this.options = {
            showSuccessMessage: true,
            showErrorMessage: true,
            resetFormOnSuccess: true,
            redirectOnSuccess: false,
            redirectUrl: '/',
            ...options
        };
        
        this.init();
    }

    init() {
        if (!this.form) {
            console.error(`Form with ID "${this.formId}" not found`);
            return;
        }

        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.setupCSRF();
    }

    setupCSRF() {
        // Get CSRF token from cookie or meta tag
        const csrfToken = this.getCSRFToken();
        if (csrfToken) {
            // Add CSRF token to form if not already present
            const existingToken = this.form.querySelector('input[name="csrfmiddlewaretoken"]');
            if (!existingToken) {
                const csrfInput = document.createElement('input');
                csrfInput.type = 'hidden';
                csrfInput.name = 'csrfmiddlewaretoken';
                csrfInput.value = csrfToken;
                this.form.appendChild(csrfInput);
            }
        }
    }

    getCSRFToken() {
        // Try to get CSRF token from cookie
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'csrftoken') {
                return value;
            }
        }
        
        // Try to get from meta tag
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        if (metaTag) {
            return metaTag.getAttribute('content');
        }
        
        return null;
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        this.setLoading(true);
        this.clearMessages();

        try {
            const formData = new FormData(this.form);
            const response = await fetch(this.form.action || window.location.pathname, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': this.getCSRFToken()
                }
            });

            const data = await response.json();

            if (data.success) {
                this.handleSuccess(data);
            } else {
                this.handleError(data);
            }
        } catch (error) {
            console.error('Form submission error:', error);
            this.showError('An error occurred. Please try again.');
        } finally {
            this.setLoading(false);
        }
    }

    handleSuccess(data) {
        if (this.options.showSuccessMessage) {
            this.showSuccess(data.message || 'Success!');
        }

        if (this.options.resetFormOnSuccess) {
            this.form.reset();
        }

        if (this.options.redirectOnSuccess && data.redirect) {
            setTimeout(() => {
                window.location.href = data.redirect;
            }, 1500);
        }
    }

    handleError(data) {
        if (data.errors) {
            this.showFieldErrors(data.errors);
        }
        
        if (this.options.showErrorMessage) {
            this.showError(data.message || 'Please correct the errors below.');
        }
    }

    showFieldErrors(errors) {
        // Clear previous field errors
        this.form.querySelectorAll('.field-error').forEach(el => el.remove());
        this.form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

        // Show new field errors
        Object.keys(errors).forEach(fieldName => {
            const field = this.form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                field.classList.add('error');
                
                const errorDiv = document.createElement('div');
                errorDiv.className = 'field-error';
                errorDiv.textContent = errors[fieldName][0];
                errorDiv.style.color = '#dc3545';
                errorDiv.style.fontSize = '0.875rem';
                errorDiv.style.marginTop = '0.25rem';
                
                field.parentNode.insertBefore(errorDiv, field.nextSibling);
            }
        });
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type) {
        // Remove existing messages
        this.clearMessages();

        const messageDiv = document.createElement('div');
        messageDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            padding: 0.75rem 1rem;
            margin-bottom: 1rem;
            border: 1px solid transparent;
            border-radius: 0.375rem;
            background-color: ${type === 'success' ? '#d1edff' : '#f8d7da'};
            color: ${type === 'success' ? '#0c5460' : '#721c24'};
            border-color: ${type === 'success' ? '#bee5eb' : '#f5c6cb'};
        `;

        this.form.insertBefore(messageDiv, this.form.firstChild);
    }

    clearMessages() {
        this.form.querySelectorAll('.alert, .field-error').forEach(el => el.remove());
        this.form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    }

    setLoading(loading) {
        if (loading) {
            this.submitBtn.disabled = true;
            this.submitBtn.textContent = 'Processing...';
            this.submitBtn.style.opacity = '0.6';
        } else {
            this.submitBtn.disabled = false;
            this.submitBtn.textContent = this.originalBtnText;
            this.submitBtn.style.opacity = '1';
        }
    }
}

// ===== UTILITY FUNCTIONS =====

// Get CSRF token for fetch requests
function getCSRFToken() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'csrftoken') {
            return value;
        }
    }
    return null;
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        border-radius: 4px;
        z-index: 9999;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .error {
        border-color: #dc3545 !important;
        box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
    }
`;
document.head.appendChild(style);
