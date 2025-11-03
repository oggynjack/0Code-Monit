<template>
    <div class="public-login-container">
        <div class="login-card">
            <div class="text-center mb-4">
                <img src="/icon.svg" width="80" height="80" alt="Logo" />
                <h2 class="mt-3">Welcome to 0Code Monit</h2>
                <p class="text-muted">Monitor up to 3 websites for free</p>
            </div>

            <div class="d-grid gap-3">
                <button class="btn btn-google btn-lg" @click="loginWithGoogle">
                    <svg class="me-2" width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                        <path fill="none" d="M0 0h48v48H0z"/>
                    </svg>
                    Sign in with Google
                </button>

                <div class="divider">
                    <span>OR</span>
                </div>

                <router-link to="/home" class="btn btn-outline-secondary btn-lg">
                    Go to Homepage
                </router-link>
            </div>

            <div class="mt-4 text-center">
                <p class="text-muted small">
                    By signing in, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "PublicLogin",
    methods: {
        loginWithGoogle() {
            // Redirect to Google OAuth endpoint
            window.location.href = "/auth/google";
        }
    }
};
</script>

<style scoped>
.public-login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
}

.login-card {
    background: #ffffff;
    border-radius: 20px;
    padding: 48px;
    max-width: 480px;
    width: 100%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-card h2 {
    color: #1e293b;
    font-weight: 700;
}

.text-muted {
    color: #64748b !important;
}

.btn-google {
    background: #ffffff;
    color: #3c4043;
    border: 2px solid #e2e8f0;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    padding: 12px 24px;
}

.btn-google:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.btn-outline-secondary {
    border: 2px solid #e2e8f0;
    color: #475569;
    font-weight: 600;
    padding: 12px 24px;
    transition: all 0.3s ease;
}

.btn-outline-secondary:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    color: #1e293b;
    transform: translateY(-2px);
}

.divider {
    text-align: center;
    position: relative;
    margin: 24px 0;
}

.divider::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: #e2e8f0;
}

.divider span {
    background: #ffffff;
    padding: 0 16px;
    position: relative;
    color: #94a3b8;
    font-size: 14px;
    font-weight: 600;
}

@media (max-width: 576px) {
    .login-card {
        padding: 32px 24px;
    }
}
</style>
