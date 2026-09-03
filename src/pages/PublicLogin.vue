<template>
    <div class="public-login-container">
        <div class="login-card">
            <div class="text-center mb-4">
                <img src="/icon.svg" width="70" height="70" alt="0Code-Monit Logo" />
                <h2 class="mt-3 brand-title">0Code-Monit</h2>
                <p class="text-muted">Real-time Website & Uptime Monitoring</p>
            </div>

            <!-- Tabs: OTP vs Password -->
            <ul class="nav nav-pills nav-fill mb-4 custom-nav-pills">
                <li class="nav-item">
                    <button 
                        class="nav-link" 
                        :class="{ active: authMode === 'otp' }" 
                        @click="authMode = 'otp'"
                    >
                        <i class="fas fa-envelope-open-text me-1"></i> Email Code (OTP)
                    </button>
                </li>
                <li class="nav-item">
                    <button 
                        class="nav-link" 
                        :class="{ active: authMode === 'password' }" 
                        @click="authMode = 'password'"
                    >
                        <i class="fas fa-key me-1"></i> Password
                    </button>
                </li>
            </ul>

            <!-- Alerts -->
            <div v-if="errorMessage" class="alert alert-danger mb-3 d-flex align-items-center" role="alert">
                <i class="fas fa-exclamation-circle me-2 flex-shrink-0"></i>
                <div>{{ errorMessage }}</div>
            </div>
            <div v-if="successMessage" class="alert alert-success mb-3 d-flex align-items-center" role="alert">
                <i class="fas fa-check-circle me-2 flex-shrink-0"></i>
                <div>{{ successMessage }}</div>
            </div>

            <!-- MODE 1: Email Verification Code (OTP) -->
            <div v-if="authMode === 'otp'">
                <!-- Step 1: Request OTP -->
                <form v-if="otpStep === 1" @submit.prevent="sendOtp">
                    <div class="mb-3">
                        <label class="form-label text-secondary fw-semibold">Email Address (Gmail / Any)</label>
                        <div class="input-group">
                            <span class="input-group-text"><i class="fas fa-at"></i></span>
                            <input 
                                v-model="email" 
                                type="email" 
                                class="form-control form-control-lg" 
                                placeholder="you@gmail.com" 
                                required 
                                :disabled="loading"
                                autofocus
                            />
                        </div>
                        <div class="form-text">We will send a 6-digit login verification code to your email.</div>
                    </div>

                    <button type="submit" class="btn btn-primary btn-lg w-100 py-3 mt-2" :disabled="loading">
                        <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                        <i v-else class="fas fa-paper-plane me-2"></i>
                        Send Verification Code
                    </button>
                </form>

                <!-- Step 2: Verify OTP -->
                <form v-else-if="otpStep === 2" @submit.prevent="verifyOtp">
                    <div class="mb-3">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <label class="form-label text-secondary fw-semibold mb-0">Enter 6-Digit Code</label>
                            <button type="button" class="btn btn-link btn-sm p-0 text-decoration-none" @click="otpStep = 1">
                                Change Email
                            </button>
                        </div>
                        <p class="small text-muted mb-2">Sent to: <strong>{{ email }}</strong></p>
                        <input 
                            v-model="otpCode" 
                            type="text" 
                            class="form-control form-control-lg text-center fw-bold fs-3 letter-spacing-4" 
                            placeholder="000000" 
                            maxlength="6"
                            pattern="[0-9]{6}"
                            required 
                            :disabled="loading"
                            autofocus
                        />
                    </div>

                    <button type="submit" class="btn btn-primary btn-lg w-100 py-3 mt-2" :disabled="loading || otpCode.length < 6">
                        <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                        <i v-else class="fas fa-sign-in-alt me-2"></i>
                        Verify & Login
                    </button>

                    <div class="text-center mt-3">
                        <button 
                            type="button" 
                            class="btn btn-link btn-sm text-decoration-none" 
                            @click="resendOtp" 
                            :disabled="resendCooldown > 0 || loading"
                        >
                            {{ resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend Verification Code" }}
                        </button>
                    </div>
                </form>
            </div>

            <!-- MODE 2: Password Login -->
            <div v-else-if="authMode === 'password'">
                <form @submit.prevent="loginWithPassword">
                    <div class="mb-3">
                        <label class="form-label text-secondary fw-semibold">Email or Username</label>
                        <div class="input-group">
                            <span class="input-group-text"><i class="fas fa-user"></i></span>
                            <input 
                                v-model="email" 
                                type="text" 
                                class="form-control form-control-lg" 
                                placeholder="you@gmail.com" 
                                required 
                                :disabled="loading"
                            />
                        </div>
                    </div>

                    <div class="mb-4">
                        <label class="form-label text-secondary fw-semibold">Password</label>
                        <div class="input-group">
                            <span class="input-group-text"><i class="fas fa-lock"></i></span>
                            <input 
                                v-model="password" 
                                :type="showPassword ? 'text' : 'password'" 
                                class="form-control form-control-lg" 
                                placeholder="••••••••" 
                                required 
                                :disabled="loading"
                            />
                            <button class="btn btn-outline-secondary" type="button" @click="showPassword = !showPassword">
                                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                            </button>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary btn-lg w-100 py-3" :disabled="loading">
                        <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                        <i v-else class="fas fa-sign-in-alt me-2"></i>
                        Sign In
                    </button>
                </form>
            </div>

            <div class="divider">
                <span>OR</span>
            </div>

            <router-link to="/home" class="btn btn-outline-secondary btn-lg w-100 py-2">
                <i class="fas fa-home me-2"></i> Back to Homepage
            </router-link>

            <div class="mt-4 text-center">
                <p class="text-muted small mb-0">
                    By continuing, you agree to 0Code-Monit Terms & Privacy Policy
                </p>
            </div>
        </div>
    </div>
</template>

<script>
import axios from "axios";

export default {
    name: "PublicLogin",
    data() {
        return {
            authMode: "otp", // "otp" or "password"
            otpStep: 1,      // 1: input email, 2: input otp
            email: "",
            otpCode: "",
            password: "",
            showPassword: false,
            loading: false,
            errorMessage: "",
            successMessage: "",
            resendCooldown: 0,
            cooldownTimer: null,
        };
    },
    mounted() {
        // Redirect if already logged in
        const existingToken = localStorage.getItem("publicToken");
        if (existingToken) {
            try {
                const payload = JSON.parse(atob(existingToken.split(".")[1]));
                if (payload && payload.exp && payload.exp * 1000 > Date.now()) {
                    this.$router.push("/public-dashboard");
                    return;
                }
            } catch (_) {}
        }

        const error = this.$route.query.error;
        if (error) {
            this.errorMessage = error;
        }
    },
    beforeUnmount() {
        if (this.cooldownTimer) clearInterval(this.cooldownTimer);
    },
    methods: {
        async sendOtp() {
            this.errorMessage = "";
            this.successMessage = "";
            this.loading = true;

            try {
                const res = await axios.post("/api/public/send-login-otp", {
                    email: this.email,
                });

                if (res.data && res.data.success) {
                    this.otpStep = 2;
                    this.successMessage = `Verification code sent to ${this.email}! Check your inbox.`;
                    this.startCooldown();
                } else {
                    this.errorMessage = res.data?.error || "Failed to send verification code.";
                }
            } catch (err) {
                this.errorMessage = err.response?.data?.error || err.message || "Failed to send verification code.";
            } finally {
                this.loading = false;
            }
        },

        async verifyOtp() {
            this.errorMessage = "";
            this.successMessage = "";
            this.loading = true;

            try {
                const res = await axios.post("/api/public/verify-login-otp", {
                    email: this.email,
                    otp: this.otpCode,
                });

                if (res.data && res.data.token) {
                    localStorage.setItem("publicToken", res.data.token);
                    this.successMessage = "Login successful! Redirecting...";
                    setTimeout(() => {
                        this.$router.push("/public-dashboard");
                    }, 500);
                } else {
                    this.errorMessage = res.data?.error || "Invalid verification code.";
                }
            } catch (err) {
                this.errorMessage = err.response?.data?.error || err.message || "Verification failed.";
            } finally {
                this.loading = false;
            }
        },

        async resendOtp() {
            if (this.resendCooldown > 0) return;
            await this.sendOtp();
        },

        startCooldown() {
            this.resendCooldown = 60;
            if (this.cooldownTimer) clearInterval(this.cooldownTimer);
            this.cooldownTimer = setInterval(() => {
                this.resendCooldown--;
                if (this.resendCooldown <= 0) {
                    clearInterval(this.cooldownTimer);
                }
            }, 1000);
        },

        async loginWithPassword() {
            this.errorMessage = "";
            this.successMessage = "";
            this.loading = true;

            try {
                const res = await axios.post("/api/public/password-login", {
                    email: this.email,
                    password: this.password,
                });

                if (res.data && res.data.token) {
                    localStorage.setItem("publicToken", res.data.token);
                    this.successMessage = "Login successful! Redirecting...";
                    setTimeout(() => {
                        this.$router.push("/public-dashboard");
                    }, 500);
                } else {
                    this.errorMessage = res.data?.error || "Invalid credentials.";
                }
            } catch (err) {
                this.errorMessage = err.response?.data?.error || err.message || "Login failed.";
            } finally {
                this.loading = false;
            }
        },
    }
};
</script>

<style scoped>
.public-login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
    padding: 24px;
}

.login-card {
    background: #ffffff;
    border-radius: 20px;
    padding: 40px;
    max-width: 480px;
    width: 100%;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35);
}

.brand-title {
    color: #0f172a;
    font-weight: 800;
    letter-spacing: -0.5px;
}

.custom-nav-pills {
    background: #f1f5f9;
    padding: 4px;
    border-radius: 12px;
}

.custom-nav-pills .nav-link {
    color: #64748b;
    font-weight: 600;
    border-radius: 10px;
    padding: 10px 16px;
    transition: all 0.2s ease;
}

.custom-nav-pills .nav-link.active {
    background: #ffffff;
    color: #0d6efd;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.letter-spacing-4 {
    letter-spacing: 8px;
}

.btn-primary {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    border: none;
    font-weight: 600;
    border-radius: 12px;
    box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
    transition: all 0.2s ease;
}

.btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
}

.btn-outline-secondary {
    border-radius: 12px;
    border: 1px solid #cbd5e1;
    color: #475569;
    font-weight: 600;
    transition: all 0.2s ease;
}

.btn-outline-secondary:hover {
    background: #f8fafc;
    border-color: #94a3b8;
    color: #0f172a;
}

.input-group-text {
    background: #f8fafc;
    border-color: #cbd5e1;
    color: #64748b;
}

.form-control {
    border-color: #cbd5e1;
}

.form-control:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15);
}

.divider {
    text-align: center;
    position: relative;
    margin: 24px 0 20px 0;
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
    font-size: 13px;
    font-weight: 600;
}

@media (max-width: 576px) {
    .login-card {
        padding: 28px 20px;
    }
}
</style>
