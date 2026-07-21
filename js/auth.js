// Authentication functionality (real API integration via js/api.js)

document.addEventListener('DOMContentLoaded', function() {
    // Redirect away if already logged in
    if (window.EliteAPI && EliteAPI.isLoggedIn() &&
        (window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('signup.html'))) {
        window.location.href = 'dashboard.html';
        return;
    }

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

        if (strengthBar && strengthText) {
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
    }

    // Form submission
    const authForms = document.querySelectorAll('.auth-form');

    authForms.forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            clearFormError(form);

            // Basic required-field validation
            let isValid = true;
            const inputs = form.querySelectorAll('input[required]');

            inputs.forEach(input => {
                if (input.type === 'checkbox' ? !input.checked : !input.value.trim()) {
                    isValid = false;
                    input.classList.add('error');
                } else {
                    input.classList.remove('error');
                }
            });

            if (!isValid) {
                showFormError(form, 'Please fill in all required fields.');
                return;
            }

            const password = form.querySelector('#password');
            const confirmPassword = form.querySelector('#confirm-password');
            const isSignup = Boolean(confirmPassword);

            if (isSignup && password.value !== confirmPassword.value) {
                confirmPassword.classList.add('error');
                showFormError(form, 'Passwords do not match.');
                return;
            }

            if (isSignup && password.value.length < 8) {
                password.classList.add('error');
                showFormError(form, 'Password must be at least 8 characters.');
                return;
            }

            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Processing...';
            submitButton.disabled = true;

            try {
                const email = form.querySelector('#email').value.trim();

                if (isSignup) {
                    const fullName = form.querySelector('#fullname').value.trim();
                    const [firstName, ...rest] = fullName.split(/\s+/);
                    const lastName = rest.join(' ') || firstName;
                    const phoneInput = form.querySelector('#phone');

                    await EliteAPI.register({
                        email,
                        password: password.value,
                        firstName,
                        lastName,
                        phoneNumber: phoneInput && phoneInput.value.trim() ? phoneInput.value.trim() : undefined
                    });

                    // Log straight in after successful registration
                    await EliteAPI.login(email, password.value);
                } else {
                    await EliteAPI.login(email, password.value);
                }

                // Return user to the page they came from, if provided
                const params = new URLSearchParams(window.location.search);
                const redirect = params.get('redirect');
                window.location.href = redirect && redirect.startsWith('http') === false
                    ? redirect
                    : 'dashboard.html';
            } catch (error) {
                showFormError(form, error.message);
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        });
    });

    function showFormError(form, message) {
        let errorDiv = form.querySelector('.auth-form-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'auth-form-error';
            errorDiv.setAttribute('role', 'alert');
            errorDiv.style.cssText =
                'background:#fdecea;color:#b3261e;border:1px solid #f5c6c2;padding:10px 14px;border-radius:6px;margin-bottom:14px;font-size:14px;';
            form.prepend(errorDiv);
        }
        errorDiv.textContent = message;
    }

    function clearFormError(form) {
        const errorDiv = form.querySelector('.auth-form-error');
        if (errorDiv) errorDiv.remove();
    }
});
