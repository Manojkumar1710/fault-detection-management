document.addEventListener('DOMContentLoaded', () => {

    // --- FORM & ELEMENT SELECTION ---
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const loginError = document.getElementById('login-error');
    const signupError = document.getElementById('signup-error');

    // --- UI TOGGLING ELEMENTS ---
    const toggleToSignup = document.getElementById('toggle-to-signup');
    const toggleToLogin = document.getElementById('toggle-to-login');

    // --- HELPER FEATURE ELEMENTS ---
    const passwordInput = document.getElementById('password');
    const passwordToggleBtn = document.getElementById('password-toggle');
    const demoAccounts = document.querySelectorAll('.demo-account');

    // ===================================================================
    // 1. UI & HELPER FUNCTIONALITY
    // ===================================================================

    // --- Logic to switch between Login and Registration forms ---
    if (toggleToSignup) {
        toggleToSignup.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.classList.add('hidden');
            signupForm.classList.remove('hidden');
            toggleToSignup.classList.add('hidden');
            toggleToLogin.classList.remove('hidden');
        });
    }

    if (toggleToLogin) {
        toggleToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            signupForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
            toggleToLogin.classList.add('hidden');
            toggleToSignup.classList.remove('hidden');
        });
    }

    // --- Logic for the password visibility toggle button ---
    if (passwordToggleBtn && passwordInput) {
        passwordToggleBtn.addEventListener('click', () => {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                passwordToggleBtn.textContent = '🙈';
            } else {
                passwordInput.type = 'password';
                passwordToggleBtn.textContent = '👁️';
            }
        });
    }

    // --- Logic for the demo account buttons ---
    demoAccounts.forEach(account => {
        account.addEventListener('click', () => {
            const usernameField = document.getElementById('username');
            const passwordField = document.getElementById('password');
            usernameField.value = account.dataset.username;
            passwordField.value = account.dataset.password;
        });
    });

    // ===================================================================
    // 2. FORM SUBMISSION LOGIC
    // ===================================================================

    // --- LOGIN FORM HANDLER ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            loginError.textContent = ''; // Clear previous errors

            // IMPORTANT: Your HTML uses 'username' but the backend expects 'email'.
            const email = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('http://localhost:5000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.msg || 'Login failed.');

                alert('Login successful! Redirecting to dashboard...');
                window.location.href = 'Dashboard.html'; // Redirect on success

            } catch (error) {
                loginError.textContent = error.message;
            }
        });
    }

    // --- SIGN-UP FORM HANDLER ---
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            signupError.textContent = ''; // Clear previous errors

            const firstName = document.getElementById('signup-firstname').value;
            const lastName = document.getElementById('signup-lastname').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('signup-confirm-password').value;

            if (password !== confirmPassword) {
                signupError.textContent = 'Passwords do not match.';
                return;
            }

            try {
                const response = await fetch('http://localhost:5000/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ firstName, lastName, email, password })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.msg || 'Registration failed.');

                alert('Registration successful! Please return to the login page.');
                // Trigger the click on the link to switch back to the login view
                toggleToLogin.querySelector('a').click();

            } catch (error) {
                signupError.textContent = error.message;
            }
        });
    }
});