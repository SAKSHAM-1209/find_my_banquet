document.addEventListener('DOMContentLoaded', function() {
    // ===== FORM HANDLER =====
    const scheduleForm = new FormHandler('schedule-call-form', {
        showSuccessMessage: true,
        resetFormOnSuccess: true,
        redirectOnSuccess: false
    });

    // ===== FORM FIELDS =====
    const dateField = document.getElementById('id_date');
    const timeSlotField = document.getElementById('id_time_slot');
    const reasonField = document.getElementById('id_reason');
    const phoneField = document.getElementById('id_phone');
    const notesField = document.getElementById('id_notes');

    // ===== DATE VALIDATION =====
    if (dateField) {
        const todayStr = new Date().toISOString().split('T')[0];
        dateField.setAttribute('min', todayStr);

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

    // ===== TIME SLOT POPULATION =====
    function updateTimeSlots(reason) {
        if (!timeSlotField) return;

        const slotsMap = {
            'Consultation': [
                '09:00 AM - 10:00 AM',
                '10:00 AM - 11:00 AM',
                '11:00 AM - 12:00 PM',
                '02:00 PM - 03:00 PM',
                '03:00 PM - 04:00 PM'
            ],
            'Support': [
                '10:00 AM - 11:00 AM',
                '11:00 AM - 12:00 PM',
                '02:00 PM - 03:00 PM',
                '03:00 PM - 04:00 PM',
                '04:00 PM - 05:00 PM'
            ],
            'Partnership': [
                '09:00 AM - 10:00 AM',
                '10:00 AM - 11:00 AM',
                '11:00 AM - 12:00 PM',
                '02:00 PM - 03:00 PM',
                '03:00 PM - 04:00 PM',
                '04:00 PM - 05:00 PM'
            ],
            'default': [
                '09:00 AM - 10:00 AM',
                '10:00 AM - 11:00 AM',
                '11:00 AM - 12:00 PM',
                '02:00 PM - 03:00 PM',
                '03:00 PM - 04:00 PM',
                '04:00 PM - 05:00 PM'
            ]
        };

        const slots = slotsMap[reason] || slotsMap['default'];

        // Clear previous options
        timeSlotField.innerHTML = '';

        // Add default placeholder
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select a time slot';
        timeSlotField.appendChild(defaultOption);

        // Add new slots
        slots.forEach(slot => {
            const option = document.createElement('option');
            option.value = slot;
            option.textContent = slot;
            timeSlotField.appendChild(option);
        });
    }

    // ===== REASON FIELD LISTENER =====
    if (reasonField) {
        reasonField.addEventListener('change', function() {
            updateTimeSlots(this.value);
        });

        // Initialize on page load
        updateTimeSlots(reasonField.value || 'default');
    }

    // ===== PHONE FIELD =====
    if (phoneField) {
        phoneField.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length > 10) value = value.substring(0, 10);
            this.value = value;
        });
    }

    // ===== NOTES COUNTER =====
    if (notesField) {
        const maxLength = 500;
        const counter = document.createElement('div');
        counter.className = 'character-counter';
        counter.style.cssText = 'font-size:0.875rem;color:#6c757d;text-align:right;margin-top:0.25rem;';
        notesField.parentNode.appendChild(counter);

        function updateCounter() {
            const remaining = maxLength - notesField.value.length;
            counter.textContent = `${remaining} characters remaining`;
            counter.style.color = remaining < 50 ? '#dc3545' : '#6c757d';
        }

        notesField.addEventListener('input', updateCounter);
        updateCounter();
    }

    // ===== FORM SUBMIT VALIDATION =====
    scheduleForm.form.addEventListener('submit', function(e) {
        const date = new Date(dateField.value);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        // Weekend warning
        if (date.getDay() === 0 || date.getDay() === 6) {
            if (!confirm('You selected a weekend. Are you sure?')) {
                e.preventDefault();
                return;
            }
        }

        // Future date check
        if (date > thirtyDaysFromNow) {
            if (!confirm('You selected a date more than 30 days in the future. Are you sure?')) {
                e.preventDefault();
                return;
            }
        }

        // Ensure time slot selected
        if (!timeSlotField.value) {
            alert('Please select a time slot.');
            e.preventDefault();
            return;
        }
    });
});
