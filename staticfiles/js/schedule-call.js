// ===== SCHEDULE CALL FORM HANDLER =====
document.addEventListener('DOMContentLoaded', function() {
    const scheduleForm = new FormHandler('schedule-call-form', {
        showSuccessMessage: true,
        resetFormOnSuccess: true,
        redirectOnSuccess: false
    });

    // Date validation - cannot be in the past
    const dateField = document.getElementById('id_date');
    if (dateField) {
        const today = new Date().toISOString().split('T')[0];
        dateField.setAttribute('min', today);
        
        dateField.addEventListener('change', function() {
            const selectedDate = new Date(this.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                this.setCustomValidity('Please select a future date');
            } else {
                this.setCustomValidity('');
            }
        });
    }

    // Time slot availability (mock implementation)
    const timeSlotField = document.getElementById('id_time_slot');
    const reasonField = document.getElementById('id_reason');
    
    if (timeSlotField && reasonField) {
        reasonField.addEventListener('change', function() {
            updateTimeSlots(this.value);
        });
        
        // Initialize time slots
        updateTimeSlots(reasonField.value);
    }

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

    // Notes character counter
    const notesField = document.getElementById('id_notes');
    if (notesField) {
        const maxLength = 500;
        const counter = document.createElement('div');
        counter.className = 'character-counter';
        counter.style.cssText = `
            font-size: 0.875rem;
            color: #6c757d;
            text-align: right;
            margin-top: 0.25rem;
        `;
        notesField.parentNode.appendChild(counter);
        
        function updateCounter() {
            const remaining = maxLength - notesField.value.length;
            counter.textContent = `${remaining} characters remaining`;
            counter.style.color = remaining < 50 ? '#dc3545' : '#6c757d';
        }
        
        notesField.addEventListener('input', updateCounter);
        updateCounter();
    }

    // Form submission with additional validation
    scheduleForm.form.addEventListener('submit', function(e) {
        const date = new Date(dateField.value);
        const timeSlot = timeSlotField.value;
        
        // Check if it's a weekend
        if (date.getDay() === 0 || date.getDay() === 6) {
            if (!confirm('You selected a weekend. Are you sure you want to schedule a call for this date?')) {
                e.preventDefault();
                return;
            }
        }
        
        // Check if it's too far in the future (more than 30 days)
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        if (date > thirtyDaysFromNow) {
            if (!confirm('You selected a date more than 30 days in the future. Are you sure?')) {
                e.preventDefault();
                return;
            }
        }
    });
});

function updateTimeSlots(reason) {
    const timeSlotField = document.getElementById('id_time_slot');
    if (!timeSlotField) return;
    
    // Clear existing options
    timeSlotField.innerHTML = '';
    
    // Define time slots based on reason
    let timeSlots = [];
    
    switch(reason) {
        case 'Consultation':
            timeSlots = [
                '09:00 AM - 10:00 AM',
                '10:00 AM - 11:00 AM',
                '11:00 AM - 12:00 PM',
                '02:00 PM - 03:00 PM',
                '03:00 PM - 04:00 PM'
            ];
            break;
        case 'Support':
            timeSlots = [
                '10:00 AM - 11:00 AM',
                '11:00 AM - 12:00 PM',
                '02:00 PM - 03:00 PM',
                '03:00 PM - 04:00 PM',
                '04:00 PM - 05:00 PM'
            ];
            break;
        case 'Partnership':
            timeSlots = [
                '09:00 AM - 10:00 AM',
                '10:00 AM - 11:00 AM',
                '11:00 AM - 12:00 PM',
                '02:00 PM - 03:00 PM',
                '03:00 PM - 04:00 PM',
                '04:00 PM - 05:00 PM'
            ];
            break;
        default:
            timeSlots = [
                '09:00 AM - 10:00 AM',
                '10:00 AM - 11:00 AM',
                '11:00 AM - 12:00 PM',
                '02:00 PM - 03:00 PM',
                '03:00 PM - 04:00 PM',
                '04:00 PM - 05:00 PM'
            ];
    }
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a time slot';
    timeSlotField.appendChild(defaultOption);
    
    // Add time slot options
    timeSlots.forEach(slot => {
        const option = document.createElement('option');
        option.value = slot;
        option.textContent = slot;
        timeSlotField.appendChild(option);
    });
}