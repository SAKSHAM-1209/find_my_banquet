document.addEventListener('DOMContentLoaded', function () {

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

        dateField.addEventListener('change', function () {
            const selectedDate = new Date(this.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                this.setCustomValidity('Please select a valid future date.');
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

        // Clear existing options
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

    // ===== INITIALIZE TIME SLOTS ON LOAD =====
    if (reasonField) {
        updateTimeSlots(reasonField.value || 'default');

        reasonField.addEventListener('change', function () {
            updateTimeSlots(this.value);
        });
    } else {
        // fallback if reason not found
        updateTimeSlots('default');
    }

    // ===== PHONE FIELD VALIDATION =====
    if (phoneField) {
        phoneField.addEventListener('input', function () {
            let value = this.value.replace(/\D/g, '');
            if (value.length > 10) value = value.slice(0, 10);
            this.value = value;
        });
    }

    // ===== NOTES CHARACTER COUNTER =====
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

    // ===== FORM SUBMISSION VALIDATION =====
    if (scheduleForm && scheduleForm.form) {
        scheduleForm.form.addEventListener('submit', function (e) {
            const dateValue = dateField?.value;
            const timeSlotValue = timeSlotField?.value;

            if (!dateValue) {
                alert('Please select a date.');
                e.preventDefault();
                return;
            }

            if (!timeSlotValue) {
                alert('Please select a time slot.');
                e.preventDefault();
                return;
            }

            const date = new Date(dateValue);
            const today = new Date();
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(today.getDate() + 30);

            if (date.getDay() === 0 || date.getDay() === 6) {
                if (!confirm('You selected a weekend. Are you sure you want to continue?')) {
                    e.preventDefault();
                    return;
                }
            }

            if (date > thirtyDaysFromNow) {
                if (!confirm('You selected a date more than 30 days ahead. Continue?')) {
                    e.preventDefault();
                    return;
                }
            }
        });
    }
});
