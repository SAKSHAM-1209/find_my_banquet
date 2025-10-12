// ===== BANQUET REGISTRATION FORM HANDLER =====
document.addEventListener('DOMContentLoaded', function() {
    const banquetForm = new FormHandler('banquet-form', {
        showSuccessMessage: true,
        resetFormOnSuccess: true,
        redirectOnSuccess: true,
        redirectUrl: '/'
    });

    // Multiple image upload handling
    const imageInput = document.getElementById('id_image');
    const imagePreview = document.getElementById('image-preview');
    const maxFiles = 5;
    const maxFileSize = 5 * 1024 * 1024; // 5MB

    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            handleImageUpload(e.target.files);
        });

        // Drag and drop functionality
        const dropZone = document.getElementById('drop-zone');
        if (dropZone) {
            dropZone.addEventListener('dragover', function(e) {
                e.preventDefault();
                dropZone.classList.add('drag-over');
            });

            dropZone.addEventListener('dragleave', function(e) {
                e.preventDefault();
                dropZone.classList.remove('drag-over');
            });

            dropZone.addEventListener('drop', function(e) {
                e.preventDefault();
                dropZone.classList.remove('drag-over');
                handleImageUpload(e.dataTransfer.files);
            });
        }
    }

    function handleImageUpload(files) {
        if (!imagePreview) return;

        // Clear previous previews
        imagePreview.innerHTML = '';

        if (files.length === 0) return;

        // Validate file count
        if (files.length > maxFiles) {
            showError(`Maximum ${maxFiles} files allowed`);
            return;
        }

        Array.from(files).forEach((file, index) => {
            // Validate file size
            if (file.size > maxFileSize) {
                showError(`File ${file.name} is too large. Maximum size is 5MB.`);
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                showError(`File ${file.name} is not an image.`);
                return;
            }

            // Create preview
            const reader = new FileReader();
            reader.onload = function(e) {
                const previewDiv = document.createElement('div');
                previewDiv.className = 'image-preview-item';
                previewDiv.innerHTML = `
                    <img src="${e.target.result}" alt="Preview ${index + 1}">
                    <button type="button" class="remove-image" data-index="${index}">×</button>
                `;
                imagePreview.appendChild(previewDiv);
            };
            reader.readAsDataURL(file);
        });
    }

    // Remove image functionality
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-image')) {
            e.target.closest('.image-preview-item').remove();
        }
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

    // Capacity validation
    const capacityField = document.getElementById('id_capacity');
    if (capacityField) {
        capacityField.addEventListener('input', function() {
            const value = parseInt(this.value);
            if (value < 1) {
                this.setCustomValidity('Capacity must be at least 1');
            } else if (value > 10000) {
                this.setCustomValidity('Capacity cannot exceed 10,000');
            } else {
                this.setCustomValidity('');
            }
        });
    }

    // Google Maps link validation
    const googleLinkField = document.getElementById('id_google_link');
    if (googleLinkField) {
        googleLinkField.addEventListener('blur', function() {
            const url = this.value;
            if (url && !isValidGoogleMapsUrl(url)) {
                this.setCustomValidity('Please enter a valid Google Maps URL');
            } else {
                this.setCustomValidity('');
            }
        });
    }
});

function isValidGoogleMapsUrl(url) {
    const googleMapsRegex = /^https?:\/\/(www\.)?(maps\.google\.com|goo\.gl\/maps|maps\.app\.goo\.gl)/;
    return googleMapsRegex.test(url);
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
    
    const form = document.getElementById('banquet-form');
    form.insertBefore(errorDiv, form.firstChild);
    
    setTimeout(() => errorDiv.remove(), 5000);
}
