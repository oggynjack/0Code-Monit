<template>
    <div class="public-dashboard" :class="{'dark-mode': isDarkMode}">
        <!-- Navbar -->
<nav class="navbar modern-navbar navbar-expand-lg" :class="isDarkMode ? 'navbar-dark' : 'navbar-dark'">
            <div class="container-fluid">
<a class="navbar-brand d-flex align-items-center" href="#">
                    <img src="/icon.svg" width="30" height="30" alt="Logo" class="d-inline-block align-top me-2" />
                    <span class="brand-text">0Code Monit</span>
                </a>
                <div class="ms-auto d-flex align-items-center flex-wrap gap-2">
<button class="btn btn-sm btn-outline-light" @click="showStatusPageModal = true">
                        <i class="fas fa-globe"></i> <span class="d-none d-sm-inline">Status Page</span>
                    </button>
                    <!-- Avatar Dropdown -->
                    <div class="dropdown">
                        <button class="btn btn-sm btn-outline-light btn-icon avatar-btn" @click.stop="toggleDropdown" type="button">
                            <i class="fas fa-user-circle fa-lg"></i>
                        </button>
                        <div class="dropdown-menu dropdown-menu-end" :class="{show: showDropdown}" @click.stop>
                            <div class="dropdown-header">
                                <i class="fas fa-user me-2"></i>{{ userEmail }}
                            </div>
                            <div class="dropdown-divider"></div>
                            <button class="dropdown-item" @click="showAccountSettings">
                                <i class="fas fa-cog me-2"></i>Account Settings
                            </button>
                            <button class="dropdown-item" @click="toggleThemeFromDropdown">
                                <i :class="isDarkMode ? 'fas fa-sun me-2' : 'fas fa-moon me-2'"></i>
                                {{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}
                            </button>
                            <div class="dropdown-divider"></div>
                            <button class="dropdown-item text-danger" @click="logout">
                                <i class="fas fa-sign-out-alt me-2"></i>Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>

        <div class="container-fluid py-4">
            <!-- Stats Cards -->
            <div class="row mb-4 g-3">
                <div class="col-md-4 col-sm-6">
                    <div class="card text-center stats-card" :class="monitorLimitClass">
                        <div class="card-body">
                            <div class="stats-icon mb-3">
                                <i class="fas fa-server"></i>
                            </div>
                            <h5 class="card-title mb-3">Monitors</h5>
                            <h2 class="display-4 animated-counter">
                                <span class="counter-value">{{ animatedMonitorCount }}</span>
                                <span class="counter-limit">/3</span>
                            </h2>
                            <div class="d-flex justify-content-center align-items-center gap-2 mt-2">
                                <span class="badge" :class="monitorLimitBadge">{{ monitorLimitText }}</span>
                                <span v-if="monitorTrend !== 0" class="trend-indicator" :class="monitorTrend > 0 ? 'trend-up' : 'trend-down'">
                                    <i :class="monitorTrend > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
                                    {{ Math.abs(monitorTrend) }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 col-sm-6">
                    <div class="card text-center stats-card stats-card-success">
                        <div class="card-body">
                            <div class="stats-icon stats-icon-success mb-3">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <h5 class="card-title mb-3">Operational</h5>
                            <h2 class="display-4 animated-counter text-success">
                                <span class="counter-value">{{ animatedUpCount }}</span>
                            </h2>
                            <div class="d-flex justify-content-center align-items-center gap-2 mt-2">
                                <span class="text-muted">Services online</span>
                                <span v-if="upTrend !== 0" class="trend-indicator" :class="upTrend > 0 ? 'trend-up' : 'trend-down'">
                                    <i :class="upTrend > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
                                    {{ Math.abs(upTrend) }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 col-sm-12">
                    <div class="card text-center stats-card stats-card-danger">
                        <div class="card-body">
                            <div class="stats-icon stats-icon-danger mb-3">
                                <i class="fas fa-times-circle"></i>
                            </div>
                            <h5 class="card-title mb-3">Down</h5>
                            <h2 class="display-4 animated-counter text-danger">
                                <span class="counter-value">{{ animatedDownCount }}</span>
                            </h2>
                            <div class="d-flex justify-content-center align-items-center gap-2 mt-2">
                                <span class="text-muted">Services offline</span>
                                <span v-if="downTrend !== 0" class="trend-indicator" :class="downTrend > 0 ? 'trend-up-danger' : 'trend-down-success'">
                                    <i :class="downTrend > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
                                    {{ Math.abs(downTrend) }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Add Monitor Button -->
            <div class="row mb-3">
                <div class="col-12">
                    <button 
                        v-if="monitorCount < 3"
                        class="btn btn-primary" 
                        @click="showAddMonitor = true"
                    >
                        <i class="fas fa-plus"></i> Add New Monitor
                    </button>
                    <div v-else class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        You've reached the limit of 3 monitors for the free tier.
                    </div>
                </div>
            </div>

            <!-- Monitors List -->
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0"><i class="fas fa-server me-2"></i>Your Monitors</h5>
                        </div>
                        <div class="card-body p-0">
                            <div v-if="monitors.length === 0" class="text-center p-5">
                                <i class="fas fa-desktop fa-3x text-muted mb-3"></i>
                                <p class="text-muted">No monitors yet. Add your first website!</p>
                            </div>
                            <div v-else class="table-responsive">
                                <table class="table table-hover mb-0 monitor-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th class="d-none d-md-table-cell">URL</th>
                                            <th>Status</th>
                                            <th class="d-none d-sm-table-cell">Response</th>
                                            <th>Webhook</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="monitor in monitors" :key="monitor.id">
                                            <td>
                                                <i class="fas fa-desktop me-2 text-primary"></i>
                                                {{ monitor.name }}
                                                <br class="d-md-none">
                                                <small class="text-muted d-md-none">{{ monitor.url }}</small>
                                            </td>
                                            <td class="d-none d-md-table-cell">
                                                <small class="text-muted">{{ monitor.url }}</small>
                                            </td>
                                            <td>
<span 
                                                    class="badge" 
                                                    :class="{
                                                        'bg-success': monitor.status === 'up',
                                                        'bg-danger': monitor.status === 'down',
                                                        'bg-secondary': !monitor.status || monitor.status === 'pending'
                                                    }"
                                                >
                                                    <i v-if="monitor.status === 'up'" class="fas fa-check"></i>
                                                    <i v-else-if="monitor.status === 'down'" class="fas fa-times"></i>
                                                    <i v-else class="fas fa-ellipsis"></i>
                                                    {{ monitor.status || 'pending' }}
                                                </span>
                                            </td>
                                            <td class="d-none d-sm-table-cell">
<span class="badge bg-info">{{ monitor.responseTime && monitor.responseTime > 0 ? monitor.responseTime + 'ms' : '-' }}</span>
                                            </td>
                                            <td>
<button 
                                                    class="btn btn-sm btn-icon" 
                                                    :class="monitor.webhook ? 'btn-success text-white' : 'btn-outline-secondary'"
                                                    @click="setupWebhook(monitor)"
                                                    :title="monitor.webhook ? 'Webhook configured' : 'Setup webhook'"
                                                >
                                                    <i class="fas fa-bell"></i>
                                                </button>
                                            </td>
                                            <td>
                                                <div class="btn-group" role="group">
<button class="btn btn-sm btn-outline-primary btn-icon" @click="editMonitor(monitor)" title="Edit">
                                                        <i class="fas fa-edit"></i>
                                                    </button>
<button class="btn btn-sm btn-outline-danger btn-icon" @click="confirmDelete(monitor)" title="Delete">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add/Edit Monitor Modal -->
        <div v-if="showAddMonitor" class="custom-modal" @click.self="closeModal">
            <div class="custom-modal-dialog">
                <div class="custom-modal-content">
                    <div class="custom-modal-header">
                        <h5 class="custom-modal-title">
                            <i class="fas fa-desktop me-2"></i>{{ editingMonitor ? 'Edit' : 'Add' }} Monitor
                        </h5>
                        <button type="button" class="custom-close-btn" @click="closeModal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="custom-modal-body">
                        <form @submit.prevent="saveMonitor">
                            <div class="mb-3">
                                <label class="form-label">Monitor Name</label>
                                <input v-model="monitorForm.name" type="text" class="form-control" required placeholder="My Website" />
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Website URL</label>
                                <input v-model="monitorForm.url" type="url" class="form-control" required placeholder="https://example.com" />
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Check Interval</label>
                                <select v-model="monitorForm.interval" class="form-select">
                                    <option value="60">1 minute</option>
                                    <option value="300">5 minutes</option>
                                    <option value="600">10 minutes</option>
                                    <option value="1800">30 minutes</option>
                                    <option value="3600">1 hour</option>
                                </select>
                            </div>
                            <div class="d-grid gap-2">
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save me-2"></i>Save Monitor
                                </button>
                                <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- Webhook Configuration Modal -->
        <div v-if="showWebhookModal" class="custom-modal" @click.self="showWebhookModal = false">
            <div class="custom-modal-dialog">
                <div class="custom-modal-content">
                    <div class="custom-modal-header">
                        <h5 class="custom-modal-title">
                            <i class="fas fa-bell me-2"></i>Setup Webhook Notification
                        </h5>
                        <button type="button" class="custom-close-btn" @click="showWebhookModal = false">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="custom-modal-body">
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            <small>Enter a webhook URL to receive notifications when <strong>{{ selectedMonitorForWebhook?.name }}</strong> goes up or down.</small>
                        </div>
                        <form @submit.prevent="saveWebhook">
                            <div class="mb-3">
                                <label class="form-label">Webhook URL</label>
                                <input 
                                    v-model="currentWebhook" 
                                    type="url" 
                                    class="form-control" 
                                    placeholder="https://hooks.slack.com/services/..." 
                                    required 
                                />
                                <div class="form-text">
                                    We'll send POST requests with monitor status updates to this URL.
                                </div>
                            </div>
                            <div class="d-grid gap-2">
                                <button type="submit" class="btn btn-success">
                                    <i class="fas fa-save me-2"></i>Save Webhook
                                </button>
                                <button type="button" class="btn btn-outline-primary" :disabled="!currentWebhook" @click="testWebhook">
                                    <i class="fas fa-paper-plane me-2"></i>Send Test
                                </button>
                                <button type="button" class="btn btn-secondary" @click="showWebhookModal = false">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- Status Page Creation Modal -->
        <div v-if="showStatusPageModal" class="custom-modal" @click.self="showStatusPageModal = false">
            <div class="custom-modal-dialog">
                <div class="custom-modal-content">
                    <div class="custom-modal-header">
                        <h5 class="custom-modal-title">
                            <i class="fas fa-globe me-2"></i>Create Status Page
                        </h5>
                        <button type="button" class="custom-close-btn" @click="showStatusPageModal = false">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="custom-modal-body">
                        <div class="alert alert-warning">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            <strong>Free Tier Limitations:</strong>
                            <ul class="mb-0 mt-2">
                                <li>Maximum 2 status pages</li>
                                <li>Random generated URLs (no customization)</li>
                                <li>No logo customization</li>
                                <li>"Powered by 0Code Monit" branding displayed</li>
                            </ul>
                        </div>
                        <div v-if="statusPages.length > 0" class="mb-3">
                            <h6>Your Status Pages:</h6>
                            <div v-for="page in statusPages" :key="page.id" class="card mb-2">
                                <div class="card-body p-2">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <a :href="page.url" target="_blank" class="text-decoration-none">
                                            <i class="fas fa-external-link-alt me-2"></i>{{ page.url }}
                                        </a>
                                        <div class="btn-group">
                                            <button class="btn btn-sm btn-outline-secondary" @click="openManageStatusPage(page)">
                                                <i class="fas fa-sliders-h"></i>
                                            </button>
                                            <button class="btn btn-sm btn-outline-danger" @click="confirmDeleteStatusPage(page)">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="d-grid gap-2">
                            <button 
                                class="btn btn-primary" 
                                @click="createStatusPage"
                                :disabled="statusPages.length >= 2"
                            >
                                <i class="fas fa-plus me-2"></i>Create New Status Page
                            </button>
                            <button type="button" class="btn btn-secondary" @click="showStatusPageModal = false">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Manage Status Page Modal -->
        <div v-if="showManageStatusPageModal" class="custom-modal" @click.self="showManageStatusPageModal = false">
            <div class="custom-modal-dialog">
                <div class="custom-modal-content">
                    <div class="custom-modal-header">
                        <h5 class="custom-modal-title"><i class="fas fa-sliders-h me-2"></i>Manage Status Page</h5>
                        <button type="button" class="custom-close-btn" @click="showManageStatusPageModal = false"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="custom-modal-body">
                        <p class="text-muted">Select which monitors to show on this page.</p>
                        <div class="list-group mb-3">
                            <label v-for="m in monitors" :key="m.id" class="list-group-item d-flex align-items-center">
                                <input type="checkbox" class="form-check-input me-2" :value="m.id" v-model="attachedMonitorIds" />
                                <span>{{ m.name }} <small class="text-muted">({{ m.url }})</small></span>
                            </label>
                        </div>
                        <div class="d-grid gap-2">
                            <button class="btn btn-primary" @click="saveStatusPageMonitors">
                                <i class="fas fa-save me-2"></i>Save
                            </button>
                            <button class="btn btn-secondary" @click="showManageStatusPageModal = false">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Custom Confirmation Modal -->
        <div v-if="confirmModal.show" class="custom-modal" @click.self="confirmModal.show = false">
            <div class="custom-modal-dialog modal-sm">
                <div class="custom-modal-content">
                    <div class="custom-modal-header bg-danger text-white">
                        <h5 class="custom-modal-title">
                            <i class="fas fa-exclamation-triangle me-2"></i>Confirm Action
                        </h5>
                        <button type="button" class="custom-close-btn text-white" @click="confirmModal.show = false">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="custom-modal-body">
                        <p>{{ confirmModal.message }}</p>
                        <div class="d-grid gap-2">
                            <button class="btn btn-danger" @click="confirmModal.callback">
                                <i class="fas fa-check me-2"></i>Yes, Delete
                            </button>
                            <button class="btn btn-secondary" @click="confirmModal.show = false">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Account Settings Modal -->
        <div v-if="showAccountSettingsModal" class="custom-modal" @click.self="showAccountSettingsModal = false">
            <div class="custom-modal-dialog">
                <div class="custom-modal-content">
                    <div class="custom-modal-header">
                        <h5 class="custom-modal-title">
                            <i class="fas fa-cog me-2"></i>Account Settings
                        </h5>
                        <button type="button" class="custom-close-btn" @click="showAccountSettingsModal = false">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="custom-modal-body">
                        <div class="mb-3">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-control" :value="userEmail" disabled />
                        </div>

                        <div class="d-grid gap-2 mt-4">
                            <button class="btn btn-primary" @click="initPasswordReset">
                                <i class="fas fa-key me-2"></i>Reset Password
                            </button>
                            <button class="btn btn-secondary" @click="showAccountSettingsModal = false">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Reset Password Modal -->
        <div v-if="showResetPasswordModal" class="custom-modal" @click.self="showResetPasswordModal = false">
            <div class="custom-modal-dialog">
                <div class="custom-modal-content">
                    <div class="custom-modal-header">
                        <h5 class="custom-modal-title">
                            <i class="fas fa-key me-2"></i>Reset Password
                        </h5>
                        <button type="button" class="custom-close-btn" @click="closeResetPassword">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="custom-modal-body">
                        <div v-if="resetSuccess" class="alert alert-success">
                            <i class="fas fa-check-circle me-2"></i>{{ resetSuccess }}
                        </div>
                        <div v-if="resetError" class="alert alert-danger">
                            <i class="fas fa-exclamation-circle me-2"></i>{{ resetError }}
                        </div>

                        <form @submit.prevent="!otpSent ? sendOTP : resetPassword">
                            <div v-if="!otpSent">
                                <div class="alert alert-info">
                                    <i class="fas fa-info-circle me-2"></i>
                                    We'll send a verification code to <strong>{{ userEmail }}</strong>
                                </div>
                                <div class="d-grid">
                                    <button type="submit" class="btn btn-primary">
                                        <i class="fas fa-paper-plane me-2"></i>Send Verification Code
                                    </button>
                                </div>
                            </div>

                            <div v-else>
                                <div class="mb-3">
                                    <label class="form-label">Verification Code</label>
                                    <input 
                                        v-model="accountForm.otp" 
                                        type="text" 
                                        class="form-control" 
                                        required 
                                        placeholder="Enter 6-digit code"
                                        maxlength="6"
                                    />
                                    <small class="form-text text-muted">Check your email for the verification code</small>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">New Password</label>
                                    <input 
                                        v-model="accountForm.newPassword" 
                                        type="password" 
                                        class="form-control" 
                                        required 
                                        placeholder="Enter new password"
                                        minlength="6"
                                    />
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">Confirm New Password</label>
                                    <input 
                                        v-model="accountForm.confirmPassword" 
                                        type="password" 
                                        class="form-control" 
                                        required 
                                        placeholder="Confirm new password"
                                    />
                                </div>

                                <div class="d-grid gap-2">
                                    <button type="submit" class="btn btn-success">
                                        <i class="fas fa-check me-2"></i>Reset Password
                                    </button>
                                    <button type="button" class="btn btn-outline-secondary" @click="otpSent = false">
                                        <i class="fas fa-arrow-left me-2"></i>Back
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "PublicDashboard",
    data() {
        return {
            userEmail: "",
            userId: null,
            monitors: [],
            statusPages: [],
            showAddMonitor: false,
            showWebhookModal: false,
            showStatusPageModal: false,
            showManageStatusPageModal: false,
            selectedStatusPage: null,
            attachedMonitorIds: [],
            editingMonitor: null,
            currentWebhook: "",
            selectedMonitorForWebhook: null,
            isDarkMode: false,
            showDropdown: false,
            showAccountSettingsModal: false,
            showResetPasswordModal: false,
            accountForm: {
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
                email: "",
                otp: ""
            },
            otpSent: false,
            resetError: "",
            resetSuccess: "",
            monitorForm: {
                name: "",
                url: "",
                interval: 60
            },
            confirmModal: {
                show: false,
                message: "",
                callback: null
            },
            // Animated counters
            animatedMonitorCount: 0,
            animatedUpCount: 0,
            animatedDownCount: 0,
            // Previous values for trend tracking
            prevMonitorCount: 0,
            prevUpCount: 0,
            prevDownCount: 0,
            // Trends
            monitorTrend: 0,
            upTrend: 0,
            downTrend: 0
        };
    },
    computed: {
        monitorCount() {
            return this.monitors.length;
        },
        upCount() {
            return this.monitors.filter(m => m.status === "up").length;
        },
        downCount() {
            return this.monitors.filter(m => m.status === "down").length;
        },
        monitorLimitClass() {
            if (this.monitorCount >= 3) return 'stats-card-limit-reached';
            if (this.monitorCount >= 2) return 'stats-card-limit-warning';
            return 'stats-card-limit-ok';
        },
        monitorLimitBadge() {
            if (this.monitorCount >= 3) return 'badge-danger';
            if (this.monitorCount >= 2) return 'badge-warning';
            return 'badge-success';
        },
        monitorLimitText() {
            if (this.monitorCount >= 3) return 'Limit Reached';
            if (this.monitorCount >= 2) return `${3 - this.monitorCount} Remaining`;
            return `${3 - this.monitorCount} Available`;
        }
    },
    mounted() {
        // Load theme preference
        const savedTheme = localStorage.getItem('publicDashboardTheme');
        this.isDarkMode = savedTheme === 'dark';

        // Close dropdown when clicking outside
        document.addEventListener('click', this.closeDropdown);

        // Get token from URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (token) {
            localStorage.setItem('publicToken', token);
            const payload = JSON.parse(atob(token.split('.')[1]));
            this.userEmail = payload.email || 'User';
            this.userId = payload.userId;
            window.history.replaceState({}, document.title, "/public-dashboard");
        } else {
            const storedToken = localStorage.getItem('publicToken');
            if (!storedToken) {
                this.$router.push('/public-login');
                return;
            }
            const payload = JSON.parse(atob(storedToken.split('.')[1]));
            this.userEmail = payload.email || 'User';
            this.userId = payload.userId;
        }
        
        this.loadMonitors();
        this.loadStatusPages();
        // Auto-refresh monitors
        this._refreshTimer = setInterval(() => this.loadMonitors(), 30000);
        // Initialize animated counters
        this.initializeCounters();
    },
    beforeUnmount() {
        if (this._refreshTimer) clearInterval(this._refreshTimer);
        document.removeEventListener('click', this.closeDropdown);
    },
    methods: {
        toggleTheme() {
            this.isDarkMode = !this.isDarkMode;
            localStorage.setItem('publicDashboardTheme', this.isDarkMode ? 'dark' : 'light');
        },
        toggleThemeFromDropdown() {
            this.toggleTheme();
            this.showDropdown = false;
        },
        toggleDropdown() {
            this.showDropdown = !this.showDropdown;
        },
        closeDropdown() {
            this.showDropdown = false;
        },
        showAccountSettings() {
            this.showAccountSettingsModal = true;
            this.showDropdown = false;
            this.accountForm.email = this.userEmail;
        },
        async loadMonitors() {
            try {
                const response = await fetch('/api/public/monitors', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('publicToken')}`
                    }
                });
                
                if (response.ok) {
                    // Store previous values before updating
                    this.prevMonitorCount = this.monitorCount;
                    this.prevUpCount = this.upCount;
                    this.prevDownCount = this.downCount;
                    
                    this.monitors = await response.json();
                    
                    // Calculate trends
                    this.calculateTrends();
                    
                    // Animate counters
                    this.animateCounter('animatedMonitorCount', this.monitorCount);
                    this.animateCounter('animatedUpCount', this.upCount);
                    this.animateCounter('animatedDownCount', this.downCount);
                } else {
                    console.error('Failed to load monitors:', response.statusText);
                }
            } catch (error) {
                console.error('Error loading monitors:', error);
            }
        },
        initializeCounters() {
            // Set initial values without animation
            this.animatedMonitorCount = this.monitorCount;
            this.animatedUpCount = this.upCount;
            this.animatedDownCount = this.downCount;
        },
        animateCounter(property, targetValue) {
            const startValue = this[property];
            const duration = 500; // ms
            const startTime = performance.now();
            
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function (easeOutCubic)
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                
                this[property] = Math.round(startValue + (targetValue - startValue) * easeProgress);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            
            requestAnimationFrame(animate);
        },
        calculateTrends() {
            this.monitorTrend = this.monitorCount - this.prevMonitorCount;
            this.upTrend = this.upCount - this.prevUpCount;
            this.downTrend = this.downCount - this.prevDownCount;
        },
        async loadStatusPages() {
            try {
                const response = await fetch('/api/public/status-pages', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('publicToken')}`
                    }
                });
                
                if (response.ok) {
                    this.statusPages = await response.json();
                } else {
                    console.error('Failed to load status pages:', response.statusText);
                }
            } catch (error) {
                console.error('Error loading status pages:', error);
            }
        },
        setupWebhook(monitor) {
            this.selectedMonitorForWebhook = monitor;
            this.currentWebhook = monitor.webhook || '';
            this.showWebhookModal = true;
        },
        async saveWebhook() {
            if (this.selectedMonitorForWebhook) {
                try {
                    const response = await fetch(`/api/public/monitors/${this.selectedMonitorForWebhook.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('publicToken')}`
                        },
                        body: JSON.stringify({ webhook: this.currentWebhook })
                    });
                    
                    if (response.ok) {
                        this.selectedMonitorForWebhook.webhook = this.currentWebhook;
                        this.showWebhookModal = false;
                    } else {
                        console.error('Failed to save webhook:', response.statusText);
                        alert('Failed to save webhook. Please try again.');
                    }
                } catch (error) {
                    console.error('Error saving webhook:', error);
                    alert('Failed to save webhook. Please try again.');
                }
            }
        },
        async testWebhook() {
            try {
                const response = await fetch('/api/public/test-webhook', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('publicToken')}`
                    },
                    body: JSON.stringify({ url: this.currentWebhook })
                });
                if (response.ok) {
                    alert('Test webhook sent successfully. Check your channel.');
                } else {
                    const e = await response.json().catch(() => ({}));
                    alert(e.error || 'Failed to send test webhook');
                }
            } catch (e) {
                alert('Failed to send test webhook');
            }
        },
        async createStatusPage() {
            if (this.statusPages.length >= 2) {
                return;
            }
            
            try {
                const response = await fetch('/api/public/status-pages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('publicToken')}`
                    }
                });
                
                if (response.ok) {
                    const statusPage = await response.json();
                    this.statusPages.push(statusPage);
                    this.showStatusPageModal = false;
                } else {
                    const error = await response.json();
                    console.error('Failed to create status page:', error);
                    alert(error.error || 'Failed to create status page.');
                }
            } catch (error) {
                console.error('Error creating status page:', error);
                alert('Failed to create status page. Please try again.');
            }
        },
        async saveMonitor() {
            try {
                if (this.editingMonitor) {
                    // Update existing
                    const response = await fetch(`/api/public/monitors/${this.editingMonitor.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('publicToken')}`
                        },
                        body: JSON.stringify(this.monitorForm)
                    });
                    
                    if (response.ok) {
                        const updated = await response.json();
                        Object.assign(this.editingMonitor, updated);
                    } else {
                        throw new Error('Failed to update monitor');
                    }
                } else {
                    // Add new
                    const response = await fetch('/api/public/monitors', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('publicToken')}`
                        },
                        body: JSON.stringify(this.monitorForm)
                    });
                    
                    if (response.ok) {
                        const newMonitor = await response.json();
                        this.monitors.push(newMonitor);
                    } else {
                        const error = await response.json();
                        throw new Error(error.error || 'Failed to create monitor');
                    }
                }
                this.closeModal();
            } catch (error) {
                console.error('Error saving monitor:', error);
                alert(error.message || 'Failed to save monitor. Please try again.');
            }
        },
        editMonitor(monitor) {
            this.editingMonitor = monitor;
            this.monitorForm = { ...monitor };
            this.showAddMonitor = true;
        },
        confirmDelete(monitor) {
            this.confirmModal = {
                show: true,
                message: `Are you sure you want to delete the monitor "${monitor.name}"?`,
                callback: () => {
                    this.deleteMonitor(monitor.id);
                    this.confirmModal.show = false;
                }
            };
        },
        async deleteMonitor(id) {
            try {
                const response = await fetch(`/api/public/monitors/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('publicToken')}`
                    }
                });
                
                if (response.ok) {
                    this.monitors = this.monitors.filter(m => m.id !== id);
                } else {
                    throw new Error('Failed to delete monitor');
                }
            } catch (error) {
                console.error('Error deleting monitor:', error);
                alert('Failed to delete monitor. Please try again.');
            }
        },
        confirmDeleteStatusPage(page) {
            this.confirmModal = {
                show: true,
                message: `Are you sure you want to delete this status page?`,
                callback: () => {
                    this.deleteStatusPage(page.id);
                    this.confirmModal.show = false;
                }
            };
        },
        async deleteStatusPage(id) {
            try {
                const response = await fetch(`/api/public/status-pages/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('publicToken')}`
                    }
                });
                
                if (response.ok) {
                    this.statusPages = this.statusPages.filter(p => p.id !== id);
                } else {
                    throw new Error('Failed to delete status page');
                }
            } catch (error) {
                console.error('Error deleting status page:', error);
                alert('Failed to delete status page. Please try again.');
            }
        },
        async openManageStatusPage(page) {
            this.selectedStatusPage = page;
            this.showManageStatusPageModal = true;
            try {
                const res = await fetch(`/api/public/status-pages/${page.id}/monitors`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('publicToken')}` }
                });
                const data = await res.json();
                this.attachedMonitorIds = data.monitorIds || [];
            } catch (e) {
                this.attachedMonitorIds = [];
            }
        },
        async saveStatusPageMonitors() {
            if (!this.selectedStatusPage) return;
            try {
                const res = await fetch(`/api/public/status-pages/${this.selectedStatusPage.id}/monitors`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('publicToken')}`
                    },
                    body: JSON.stringify({ monitorIds: this.attachedMonitorIds })
                });
                if (res.ok) {
                    alert('Status page updated.');
                    this.showManageStatusPageModal = false;
                } else {
                    const e = await res.json().catch(() => ({}));
                    alert(e.error || 'Failed to save');
                }
            } catch (e) {
                alert('Failed to save');
            }
        },
        closeModal() {
            this.showAddMonitor = false;
            this.editingMonitor = null;
            this.monitorForm = {
                name: "",
                url: "",
                interval: 60
            };
        },
        logout() {
            localStorage.removeItem('publicToken');
            this.$router.push('/public-login');
        },
        initPasswordReset() {
            this.showAccountSettingsModal = false;
            this.showResetPasswordModal = true;
            this.resetError = "";
            this.resetSuccess = "";
            this.otpSent = false;
            this.accountForm = {
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
                email: this.userEmail,
                otp: ""
            };
        },
        closeResetPassword() {
            this.showResetPasswordModal = false;
            this.resetError = "";
            this.resetSuccess = "";
            this.otpSent = false;
        },
        async sendOTP() {
            this.resetError = "";
            this.resetSuccess = "";
            
            try {
                const response = await fetch('/api/public/send-reset-otp', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('publicToken')}`
                    },
                    body: JSON.stringify({ email: this.userEmail })
                });

                if (response.ok) {
                    this.otpSent = true;
                    this.resetSuccess = "Verification code sent to your email!";
                } else {
                    const error = await response.json();
                    this.resetError = error.error || 'Failed to send verification code';
                }
            } catch (error) {
                console.error('Send OTP error:', error);
                this.resetError = 'Failed to send verification code. Please try again.';
            }
        },
        async resetPassword() {
            this.resetError = "";
            this.resetSuccess = "";

            if (this.accountForm.newPassword !== this.accountForm.confirmPassword) {
                this.resetError = "Passwords do not match";
                return;
            }

            if (this.accountForm.newPassword.length < 6) {
                this.resetError = "Password must be at least 6 characters";
                return;
            }

            try {
                const response = await fetch('/api/public/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('publicToken')}`
                    },
                    body: JSON.stringify({
                        otp: this.accountForm.otp,
                        newPassword: this.accountForm.newPassword
                    })
                });

                if (response.ok) {
                    this.resetSuccess = "Password reset successfully!";
                    setTimeout(() => {
                        this.closeResetPassword();
                    }, 2000);
                } else {
                    const error = await response.json();
                    this.resetError = error.error || 'Failed to reset password';
                }
            } catch (error) {
                console.error('Reset password error:', error);
                this.resetError = 'Failed to reset password. Please try again.';
            }
        }
    }
};
</script>

<style scoped>
/* Dark Mode */
.dark-mode {
    background: #1a1a2e;
    color: #eee;
    min-height: 100vh;
}

.dark-mode .card {
    background: #16213e;
    border-color: #0f3460;
    color: #eee;
}

.dark-mode .table {
    color: #eee;
}

.dark-mode .table-hover tbody tr:hover {
    background: #0f3460;
}

.dark-mode .form-control,
.dark-mode .form-select {
    background: #0f3460;
    border-color: #0f3460;
    color: #eee;
}

.dark-mode .custom-modal-content {
    background: #16213e;
    color: #eee;
}

.dark-mode .custom-modal-header {
    border-bottom-color: #0f3460;
}

/* General look tweaks */
.card { border-radius: 8px; }
.navbar .btn { border-radius: 8px; }
.btn-icon { width: 36px; height: 36px; display: inline-flex; align-items: center; justify-content: center; padding: 0; border-radius: 10px; }
.monitor-table thead th { background: #f8f9fc; }

/* Modern navbar */
.modern-navbar { position: sticky; top: 0; z-index: 100; backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.08); background: linear-gradient(135deg,#0d6efd,#6610f2); box-shadow: 0 4px 24px rgba(0,0,0,0.2); }
.brand-text { font-weight: 700; letter-spacing: .2px; background: linear-gradient(135deg,#fff,#e2e8f0); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.free-badge { background: linear-gradient(135deg, #22c55e, #16a34a); border: none; }

/* Stats Cards */
.stats-card {
    transition: all 0.3s ease;
    border: none;
    overflow: hidden;
    position: relative;
}

.stats-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.stats-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.15);
}

.stats-card-success::before {
    background: linear-gradient(90deg, #10b981 0%, #059669 100%);
}

.stats-card-danger::before {
    background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
}

.stats-card-limit-ok::before {
    background: linear-gradient(90deg, #10b981 0%, #059669 100%);
}

.stats-card-limit-warning::before {
    background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
}

.stats-card-limit-reached::before {
    background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
}

.stats-icon {
    width: 64px;
    height: 64px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-size: 28px;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.stats-icon-success {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.stats-icon-danger {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.animated-counter {
    font-weight: 700;
    font-size: 3rem;
}

.counter-value {
    display: inline-block;
    min-width: 60px;
}

.counter-limit {
    opacity: 0.5;
    font-size: 0.8em;
}

.trend-indicator {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 600;
}

.trend-up {
    background: #d1fae5;
    color: #065f46;
}

.trend-down {
    background: #fee2e2;
    color: #991b1b;
}

.trend-up-danger {
    background: #fee2e2;
    color: #991b1b;
}

.trend-down-success {
    background: #d1fae5;
    color: #065f46;
}

.badge-success {
    background: #10b981;
    color: white;
}

.badge-warning {
    background: #f59e0b;
    color: white;
}

.badge-danger {
    background: #ef4444;
    color: white;
}

.dark-mode .stats-card {
    background: #16213e;
    border-color: #0f3460;
}

.dark-mode .stats-icon {
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.5);
}

.dark-mode .stats-icon-success {
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.5);
}

.dark-mode .stats-icon-danger {
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.5);
}

/* Monitor Table */
.monitor-table thead th {
    background: #f8f9fc;
    font-weight: 600;
}

.dark-mode .monitor-table thead th {
    background: #0f3460;
}

/* Custom Modal */
.custom-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1050;
    padding: 1rem;
}

.custom-modal-dialog {
    width: 100%;
    max-width: 500px;
    animation: slideDown 0.3s ease-out;
}

.custom-modal-dialog.modal-sm {
    max-width: 400px;
}

.custom-modal-content {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
}

.custom-modal-header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #dee2e6;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.custom-modal-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
}

.custom-close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6c757d;
    padding: 0;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: background 0.2s;
}

.custom-close-btn:hover {
    background: rgba(0,0,0,0.1);
}

.custom-modal-body {
    padding: 1.5rem;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-50px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Responsive */
@media (max-width: 768px) {
    .custom-modal-dialog {
        max-width: 90%;
    }
    
    .stats-card {
        margin-bottom: 1rem;
    }
}

/* Loading State */
.loading {
    text-align: center;
    padding: 3rem;
}

/* Dropdown Styles */
.dropdown {
    position: relative;
}

.dropdown-menu {
    display: none;
    position: absolute;
    top: 100%;
    right: 0;
    z-index: 1000;
    min-width: 220px;
    padding: 0.5rem 0;
    margin: 0.5rem 0 0;
    background-color: #fff;
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-radius: 8px;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);
}

.dropdown-menu.show {
    display: block;
}

.dropdown-header {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    color: #6c757d;
    font-weight: 600;
    white-space: nowrap;
}

.dropdown-item {
    display: block;
    width: 100%;
    padding: 0.5rem 1rem;
    clear: both;
    font-weight: 400;
    color: #212529;
    text-align: left;
    background-color: transparent;
    border: 0;
    cursor: pointer;
    transition: background-color 0.2s, color 0.2s;
}

.dropdown-item:hover,
.dropdown-item:focus {
    background-color: #f8f9fa;
    color: #16181b;
}

.dropdown-item.text-danger:hover {
    background-color: #dc3545;
    color: #fff;
}

.dropdown-divider {
    height: 0;
    margin: 0.5rem 0;
    overflow: hidden;
    border-top: 1px solid #e9ecef;
}

.dark-mode .dropdown-menu {
    background-color: #16213e;
    border-color: #0f3460;
}

.dark-mode .dropdown-header {
    color: #94a3b8;
}

.dark-mode .dropdown-item {
    color: #eee;
}

.dark-mode .dropdown-item:hover,
.dark-mode .dropdown-item:focus {
    background-color: #0f3460;
    color: #fff;
}

.dark-mode .dropdown-divider {
    border-top-color: #0f3460;
}

.avatar-btn {
    width: 40px;
    height: 40px;
}
</style>
