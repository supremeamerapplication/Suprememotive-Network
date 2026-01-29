// ============================================
// AUTHENTICATION MANAGEMENT
// ============================================

const AuthManager = {
    handleLogin: function() {
        const loginForm = document.getElementById('login-form');
        if (!loginForm) return;

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (!validateEmail(email)) return showFormError(document.getElementById('email'), 'Please enter a valid email');
            if (!validatePassword(password)) return showFormError(document.getElementById('password'), 'Password must be at least 6 characters');

            try {
                await window.SupabaseClient.init();
                const { data, error } = await window.SupabaseClient.auth.signIn(email, password);
                if (error) throw error;
                showNotification('Login successful!', 'success');

                const params = new URLSearchParams(window.location.search);
                const returnTo = params.get('returnTo') || 'index.html';
                setTimeout(() => window.location.href = returnTo, 800);
            } catch (err) {
                console.error(err);
                showNotification(err.message || 'Login failed', 'error');
            }
        });
    },

    handleSignup: function() {
        const signupForm = document.getElementById('signup-form');
        if (!signupForm) return;

        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const fullname = document.getElementById('fullname').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const terms = document.getElementById('terms') ? document.getElementById('terms').checked : true;

            if (fullname.trim().length < 2) return showFormError(document.getElementById('fullname'), 'Please enter a valid name');
            if (!validateEmail(email)) return showFormError(document.getElementById('email'), 'Please enter a valid email');
            if (!validatePassword(password)) return showFormError(document.getElementById('password'), 'Password must be at least 6 characters');
            if (password !== confirmPassword) return showFormError(document.getElementById('confirm-password'), 'Passwords do not match');
            if (!terms) return showNotification('You must agree to the terms and conditions', 'error');

            try {
                await window.SupabaseClient.init();
                const { data, error } = await window.SupabaseClient.auth.signUp(email, password);
                if (error) throw error;
                showNotification('Signup successful! Check your email to confirm.', 'success');
                setTimeout(() => window.location.href = 'login.html', 1000);
            } catch (err) {
                console.error(err);
                showNotification(err.message || 'Signup failed', 'error');
            }
        });
    },

    handleSocialLogin: function() {
        document.querySelectorAll('.social-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                showNotification('Social login is not configured. Use email/password.', 'info');
            });
        });
    },

    attachFormValidation: function() {
        document.querySelectorAll('.form-group input, .form-group textarea').forEach(field => {
            field.addEventListener('focus', () => clearFormError(field));
            field.addEventListener('blur', function() {
                if (this.id === 'email' && this.value && !validateEmail(this.value)) showFormError(this, 'Please enter a valid email');
                if (this.id === 'password' && this.value && !validatePassword(this.value)) showFormError(this, 'Password must be at least 6 characters');
            });
        });
    }
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    AuthManager.handleLogin();
    AuthManager.handleSignup();
    AuthManager.handleSocialLogin();
    AuthManager.attachFormValidation();
});

// Redirect logged-in users away from login/signup
document.addEventListener('DOMContentLoaded', async () => {
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'login.html' || currentPage === 'signup.html') {
        await window.SupabaseClient.init();
        const resp = await window.SupabaseClient.auth.getUser();
        const user = resp && resp.data ? resp.data.user : null;
        if (user) window.location.href = 'index.html';
    }
});
