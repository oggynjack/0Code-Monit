<template>
    <div class="account-setup-container">
        <div class="setup-card">
            <div class="text-center mb-4">
                <img src="/icon.svg" width="80" height="80" alt="Logo" />
                <h2 class="mt-3">Complete Your Account Setup</h2>
                <p class="text-muted">Welcome! Set up your username and password to continue</p>
            </div>

            <form @submit.prevent="completeSetup">
                <div class="mb-3">
                    <label class="form-label">Email (from Google)</label>
                    <input type="email" class="form-control" :value="email" disabled />
                </div>

                <div class="mb-3">
                    <label class="form-label">Choose Username</label>
                    <input 
                        v-model="username" 
                        type="text" 
                        class="form-control" 
                        required 
                        placeholder="Enter username"
                        minlength="3"
                    />
                    <small class="form-text text-muted">Minimum 3 characters</small>
                </div>

                <div class="mb-3">
                    <label class="form-label">Choose Password</label>
                    <input 
                        v-model="password" 
                        type="password" 
                        class="form-control" 
                        required 
                        placeholder="Enter password"
                        minlength="6"
                    />
                    <small class="form-text text-muted">Minimum 6 characters</small>
                </div>

                <div class="mb-3">
                    <label class="form-label">Confirm Password</label>
                    <input 
                        v-model="confirmPassword" 
                        type="password" 
                        class="form-control" 
                        required 
                        placeholder="Confirm password"
                    />
                </div>

                <div v-if="error" class="alert alert-danger">
                    <i class="fas fa-exclamation-circle me-2"></i>{{ error }}
                </div>

                <div class="d-grid">
                    <button type="submit" class="btn btn-primary btn-lg" :disabled="loading">
                        <span v-if="loading">
                            <i class="fas fa-spinner fa-spin me-2"></i>Setting up...
                        </span>
                        <span v-else>
                            <i class="fas fa-check me-2"></i>Complete Setup
                        </span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
export default {
    name: "PublicAccountSetup",
    data() {
        return {
            email: "",
            userId: null,
            username: "",
            password: "",
            confirmPassword: "",
            error: "",
            loading: false
        };
    },
    mounted() {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                this.email = payload.email || '';
                this.userId = payload.userId;
                this.username = payload.username || '';
                localStorage.setItem('setupToken', token);
            } catch (e) {
                this.$router.push('/public-login');
            }
        } else {
            this.$router.push('/public-login');
        }
    },
    methods: {
        async completeSetup() {
            this.error = "";

            // Validation
            if (this.username.length < 3) {
                this.error = "Username must be at least 3 characters";
                return;
            }

            if (this.password.length < 6) {
                this.error = "Password must be at least 6 characters";
                return;
            }

            if (this.password !== this.confirmPassword) {
                this.error = "Passwords do not match";
                return;
            }

            this.loading = true;

            try {
                const response = await fetch('/api/public/complete-setup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('setupToken')}`
                    },
                    body: JSON.stringify({
                        username: this.username,
                        password: this.password
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    localStorage.removeItem('setupToken');
                    localStorage.setItem('publicToken', data.token);
                    this.$router.push('/public-dashboard');
                } else {
                    const error = await response.json();
                    this.error = error.error || 'Failed to complete setup. Please try again.';
                }
            } catch (error) {
                console.error('Setup error:', error);
                this.error = 'Failed to complete setup. Please try again.';
            } finally {
                this.loading = false;
            }
        }
    }
};
</script>

<style scoped>
.account-setup-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
}

.setup-card {
    background: #ffffff;
    border-radius: 20px;
    padding: 48px;
    max-width: 540px;
    width: 100%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.setup-card h2 {
    color: #1e293b;
    font-weight: 700;
}

.text-muted {
    color: #64748b !important;
}

.form-label {
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #334155;
}

.form-control {
    border: 2px solid #e2e8f0;
    padding: 10px 14px;
    border-radius: 8px;
    transition: all 0.3s ease;
    background-color: #ffffff;
    color: #1e293b;
}

.form-control:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    background-color: #ffffff;
}

.form-control:disabled {
    background-color: #f8fafc;
    border-color: #e2e8f0;
    color: #94a3b8;
}

.form-text {
    color: #64748b;
    font-size: 0.875rem;
}

.alert {
    border-radius: 8px;
    border: none;
}

.alert-danger {
    background: #fee2e2;
    color: #991b1b;
}

.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    font-weight: 600;
    padding: 12px 24px;
    transition: all 0.3s ease;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

@media (max-width: 576px) {
    .setup-card {
        padding: 32px 24px;
    }
}
</style>
