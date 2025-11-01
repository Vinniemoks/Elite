// Authentication functionality

document.addEventListener('DOMContentLoaded', function() {
    // Toggle password visibility
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const passwordInput = this.previousElementSibling;
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    });

    // Password strength meter
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        const strengthBar = document.querySelector('.strength-bar');
        const strengthText = document.querySelector('.strength-text');

        passwordInput.addEventListener('input', function() {
            const password = this.value;
            let strength = 0;
            
            if (password.length >= 8) strength += 25;
            if (password.match(/[A-Z]/)) strength += 25;
            if (password.match(/[0-9]/)) strength += 25;
            if (password.match(/[^A-Za-z0-9]/)) strength += 25;
            
            strengthBar.style.width = strength + '%';
            
            if (strength <= 25) {
                strengthBar.style.backgroundColor = '#ff4d4d';
                strengthText.textContent = 'Weak password';
            } else if (strength <= 50) {
                strengthBar.style.backgroundColor = '#ffa64d';
                strengthText.textContent = 'Moderate password';
            } else if (strength <= 75) {
                strengthBar.style.backgroundColor = '#ffff4d';
                strengthText.textContent = 'Good password';
            } else {
                strengthBar.style.backgroundColor = '#4CAF50';
                strengthText.textContent = 'Strong password';
            }
        });
    }

    // Form validation
    const authForms = document.querySelectorAll('.auth-form');
    
    authForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic validation
            let isValid = true;
            const inputs = form.querySelectorAll('input[required]');
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.classList.add('error');
                } else {
                    input.classList.remove('error');
                }
            });
            
            // Check if passwords match on signup form
            const password = form.querySelector('#password');
            const confirmPassword = form.querySelector('#confirm-password');
            
            if (password && confirmPassword && password.value !== confirmPassword.value) {
                isValid = false;
                confirmPassword.classList.add('error');
                alert('Passwords do not match');
            }
            
            if (isValid) {
                // Simulate form submission
                const submitButton = form.querySelector('button[type="submit"]');
                submitButton.textContent = 'Processing...';
                submitButton.disabled = true;
                
                // Simulate API call
                setTimeout(() => {
                    // Redirect to dashboard after successful login/signup
                    window.location.href = 'dashboard.html';
                }, 1500);
            }
        });
    });
});