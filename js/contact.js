// Contact Form Functionality with Validation

document.addEventListener('DOMContentLoaded', function() {
    initializeContactForm();
});

function initializeContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactFormSubmit);
        
        // Real-time validation
        const inputs = contactForm.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    validateField(this);
                }
            });
        });
    }
}

function handleContactFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const messageDiv = document.getElementById('form-message');
    
    // Validate all fields
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        showFormMessage('Please fill in all required fields correctly.', 'error');
        return;
    }
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    
    // Simulate API call (replace with actual API endpoint)
    setTimeout(() => {
        // In production, send data to backend
        // fetch('/api/contact', {
        //     method: 'POST',
        //     body: formData
        // })
        
        // Success response
        showFormMessage('Thank you for your message! We\'ll get back to you within 24 hours.', 'success');
        form.reset();
        
        // Reset button
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
        
        // Optional: Redirect after success
        // setTimeout(() => {
        //     window.location.href = 'thank-you.html';
        // }, 2000);
    }, 1500);
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';
    
    // Remove previous error
    removeFieldError(field);
    
    // Required field validation
    if (field.hasAttribute('required') && value === '') {
        isValid = false;
        errorMessage = 'This field is required';
    }
    
    // Email validation
    if (fieldName === 'email' && value !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    }
    
    // Phone validation (optional but if provided, should be valid)
    if (fieldName === 'phone' && value !== '') {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(value) || value.length < 10) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number';
        }
    }
    
    // Name validation
    if ((fieldName === 'first-name' || fieldName === 'last-name') && value !== '') {
        if (value.length < 2) {
            isValid = false;
            errorMessage = 'Name must be at least 2 characters';
        }
    }
    
    // Message validation
    if (fieldName === 'message' && value !== '') {
        if (value.length < 10) {
            isValid = false;
            errorMessage = 'Message must be at least 10 characters';
        }
    }
    
    if (!isValid) {
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    
    field.parentElement.appendChild(errorDiv);
}

function removeFieldError(field) {
    field.classList.remove('error');
    
    const existingError = field.parentElement.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

function showFormMessage(message, type) {
    const messageDiv = document.getElementById('form-message');
    
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `form-message ${type}`;
        messageDiv.style.display = 'block';
        
        // Scroll to message
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }
    }
}
