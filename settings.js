document.addEventListener('DOMContentLoaded', () => {
    
    // --- Update System Time ---
    const updateSystemTime = () => {
        const timeElement = document.getElementById('system-time');
        if (timeElement) {
            timeElement.textContent = new Date().toLocaleTimeString('en-IN', { hour12: false });
        }
    };
    setInterval(updateSystemTime, 1000);
    updateSystemTime();

    // --- Password Form Handler ---
    const passwordForm = document.getElementById('password-form');
    const messageElement = document.getElementById('settings-message');

    passwordForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        // Clear previous messages
        messageElement.textContent = '';
        messageElement.className = 'message';

        // Validation
        if (newPassword.length < 8) {
            showMessage('Password must be at least 8 characters long.', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showMessage('New passwords do not match.', 'error');
            return;
        }

        if (currentPassword === newPassword) {
            showMessage('New password must be different from current password.', 'error');
            return;
        }

        // Simulate password strength check
        if (!isPasswordStrong(newPassword)) {
            showMessage('Password should contain uppercase, lowercase, numbers and special characters.', 'error');
            return;
        }

        // Simulate password change (since backend is not implemented)
        showMessage('Password updated successfully! (Note: Backend implementation pending)', 'success');
        passwordForm.reset();
    });

    // --- Preferences Form Handler ---
    const preferencesForm = document.getElementById('preferences-form');
    const preferencesMessage = document.getElementById('preferences-message');

    preferencesForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const refreshInterval = document.getElementById('refresh-interval').value;
        const alertSound = document.getElementById('alert-sound').value;
        const theme = document.getElementById('theme').value;

        // Save preferences to localStorage (since no backend)
        const preferences = {
            refreshInterval: refreshInterval,
            alertSound: alertSound,
            theme: theme,
            timestamp: new Date().toISOString()
        };

        try {
            localStorage.setItem('ksebl-preferences', JSON.stringify(preferences));
            preferencesMessage.textContent = 'Preferences saved successfully!';
            preferencesMessage.className = 'success-message';
            
            // Apply theme change immediately (basic implementation)
            if (theme === 'light') {
                document.body.classList.add('light-theme');
            } else {
                document.body.classList.remove('light-theme');
            }
            
        } catch (error) {
            preferencesMessage.textContent = 'Error saving preferences. Please try again.';
            preferencesMessage.className = 'error-message';
        }
    });

    // --- Load Saved Preferences ---
    const loadPreferences = () => {
        try {
            const savedPreferences = localStorage.getItem('ksebl-preferences');
            if (savedPreferences) {
                const preferences = JSON.parse(savedPreferences);
                
                document.getElementById('refresh-interval').value = preferences.refreshInterval || '5';
                document.getElementById('alert-sound').value = preferences.alertSound || 'enabled';
                document.getElementById('theme').value = preferences.theme || 'dark';
                
                // Apply saved theme
                if (preferences.theme === 'light') {
                    document.body.classList.add('light-theme');
                }
            }
        } catch (error) {
            console.warn('Could not load saved preferences:', error);
        }
    };

    // --- Utility Functions ---
    function showMessage(text, type) {
        messageElement.textContent = text;
        messageElement.className = type === 'error' ? 'error-message' : 'success-message';
        
        // Auto-clear message after 5 seconds
        setTimeout(() => {
            messageElement.textContent = '';
            messageElement.className = 'message';
        }, 5000);
    }

    function isPasswordStrong(password) {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
    }

    // --- Password Strength Indicator ---
    const newPasswordInput = document.getElementById('new-password');
    
    // Create strength indicator
    const strengthIndicator = document.createElement('div');
    strengthIndicator.className = 'password-strength-indicator';
    strengthIndicator.innerHTML = `
        <div class="strength-bar"></div>
        <div class="strength-text">Password strength will appear here</div>
    `;
    newPasswordInput.parentNode.appendChild(strengthIndicator);

    newPasswordInput.addEventListener('input', (e) => {
        const password = e.target.value;
        const strength = calculatePasswordStrength(password);
        
        const strengthBar = strengthIndicator.querySelector('.strength-bar');
        const strengthText = strengthIndicator.querySelector('.strength-text');
        
        // Update visual indicator
        strengthBar.style.setProperty('--strength', `${strength.score}%`);
        strengthText.textContent = strength.text;
        strengthText.className = `strength-text ${strength.class}`;
    });

    function calculatePasswordStrength(password) {
        if (password.length === 0) {
            return { score: 0, text: 'Password strength will appear here', class: '' };
        }
        
        let score = 0;
        let feedback = [];
        
        // Length check
        if (password.length >= 8) score += 25;
        else feedback.push('at least 8 characters');
        
        // Character variety checks
        if (/[A-Z]/.test(password)) score += 25;
        else feedback.push('uppercase letters');
        
        if (/[a-z]/.test(password)) score += 25;
        else feedback.push('lowercase letters');
        
        if (/\d/.test(password)) score += 12.5;
        else feedback.push('numbers');
        
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 12.5;
        else feedback.push('special characters');
        
        // Determine strength level
        let text, className;
        if (score < 50) {
            text = feedback.length > 0 ? `Weak - Add ${feedback.join(', ')}` : 'Weak';
            className = 'weak';
        } else if (score < 75) {
            text = 'Medium - Good but can be stronger';
            className = 'medium';
        } else {
            text = 'Strong - Excellent password!';
            className = 'strong';
        }
        
        return { score, text, class: className };
    }

    // --- Initialize ---
    loadPreferences();
    
    // --- Export Settings (Advanced Feature) ---
    const exportSettings = () => {
        const settings = {
            preferences: JSON.parse(localStorage.getItem('ksebl-preferences') || '{}'),
            profile: {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                email: document.getElementById('email').value,
                role: document.getElementById('role').value,
                department: document.getElementById('department').value
            },
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(settings, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'ksebl-settings-export.json';
        link.click();
    };
    
    // Add export button functionality (if you add the button to HTML)
    const exportBtn = document.getElementById('export-settings');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportSettings);
    }
});