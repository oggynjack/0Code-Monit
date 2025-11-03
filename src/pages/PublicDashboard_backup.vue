<template>
    <div class="public-dashboard">
        <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">
                    <img src="/icon.svg" width="30" height="30" alt="Logo" class="d-inline-block align-top me-2" />
                    0Code Monit
                </a>
                <div class="ms-auto d-flex align-items-center">
                    <span class="text-white me-3">{{ userEmail }}</span>
                    <button class="btn btn-sm btn-outline-light me-2" @click="showStatusPageModal = true" :disabled="statusPages.length >= 2">
                        <i class="fas fa-globe"></i> Status Page
                    </button>
                    <button class="btn btn-outline-light btn-sm" @click="logout">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
            </div>
        </nav>

        <div class="container-fluid py-4">
            <!-- Stats Cards -->
            <div class="row mb-4">
                <div class="col-md-4">
                    <div class="card text-center">
                        <div class="card-body">
                            <h5 class="card-title text-muted">Monitors</h5>
                            <h2 class="display-4">{{ monitorCount }}/3</h2>
                            <p class="text-muted mb-0">Free tier limit</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card text-center">
                        <div class="card-body">
                            <h5 class="card-title text-success">Up</h5>
                            <h2 class="display-4 text-success">{{ upCount }}</h2>
                            <p class="text-muted mb-0">Services online</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card text-center">
                        <div class="card-body">
                            <h5 class="card-title text-danger">Down</h5>
                            <h2 class="display-4 text-danger">{{ downCount }}</h2>
                            <p class="text-muted mb-0">Services offline</p>
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
                        You've reached the limit of 3 monitors for the free tier.
                    </div>
                </div>
            </div>

            <!-- Monitors List -->
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">Your Monitors</h5>
                        </div>
                        <div class="card-body p-0">
                            <div v-if="monitors.length === 0" class="text-center p-5">
                                <i class="fas fa-desktop fa-3x text-muted mb-3"></i>
                                <p class="text-muted">No monitors yet. Add your first website!</p>
                            </div>
                            <table v-else class="table table-hover mb-0">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>URL</th>
                                <th>Status</th>
                                <th>Response Time</th>
                                <th>Webhook</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="monitor in monitors" :key="monitor.id">
                                <td><i class="fas fa-desktop me-2 text-primary"></i>{{ monitor.name }}</td>
                                <td><small class="text-muted">{{ monitor.url }}</small></td>
                                <td>
                                    <span 
                                        class="badge" 
                                        :class="monitor.status === 'up' ? 'bg-success' : 'bg-danger'"
                                    >
                                        <i :class="monitor.status === 'up' ? 'fas fa-check' : 'fas fa-times'"></i>
                                        {{ monitor.status }}
                                    </span>
                                </td>
                                <td><span class="badge bg-info">{{ monitor.responseTime }}ms</span></td>
                                <td>
                                    <button 
                                        class="btn btn-sm" 
                                        :class="monitor.webhook ? 'btn-success' : 'btn-outline-secondary'"
                                        @click="setupWebhook(monitor)"
                                        :title="monitor.webhook ? 'Webhook configured' : 'Setup webhook'"
                                    >
                                        <i class="fas fa-bell"></i>
                                    </button>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary me-1" @click="editMonitor(monitor)" title="Edit">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger" @click="deleteMonitor(monitor.id)" title="Delete">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add/Edit Monitor Modal -->
        <div v-if="showAddMonitor" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{{ editingMonitor ? 'Edit' : 'Add' }} Monitor</h5>
                        <button type="button" class="btn-close" @click="closeModal"></button>
                    </div>
                    <div class="modal-body">
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
                                <label class="form-label">Check Interval (seconds)</label>
                                <select v-model="monitorForm.interval" class="form-select">
                                    <option value="60">1 minute</option>
                                    <option value="300">5 minutes</option>
                                    <option value="600">10 minutes</option>
                                    <option value="1800">30 minutes</option>
                                    <option value="3600">1 hour</option>
                                </select>
                            </div>
                            <div class="d-grid">
                                <button type="submit" class="btn btn-primary">Save Monitor</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- Webhook Configuration Modal -->
        <div v-if="showWebhookModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"><i class="fas fa-bell me-2"></i>Setup Webhook Notification</h5>
                        <button type="button" class="btn-close" @click="showWebhookModal = false"></button>
                    </div>
                    <div class="modal-body">
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
                                <button type="button" class="btn btn-outline-secondary" @click="showWebhookModal = false">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- Status Page Creation Modal -->
        <div v-if="showStatusPageModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"><i class="fas fa-globe me-2"></i>Create Status Page</h5>
                        <button type="button" class="btn-close" @click="showStatusPageModal = false"></button>
                    </div>
                    <div class="modal-body">
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
                                        <button class="btn btn-sm btn-outline-danger" @click="deleteStatusPage(page.id)">
                                            <i class="fas fa-trash"></i>
                                        </button>
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
                            <button type="button" class="btn btn-outline-secondary" @click="showStatusPageModal = false">
                                Close
                            </button>
                        </div>
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
            editingMonitor: null,
            currentWebhook: "",
            selectedMonitorForWebhook: null,
            monitorForm: {
                name: "",
                url: "",
                interval: 60
            }
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
        }
    },
    mounted() {
        // Get token from URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (token) {
            // Store token in localStorage
            localStorage.setItem('publicToken', token);
            // Decode JWT to get user info
            const payload = JSON.parse(atob(token.split('.')[1]));
            this.userEmail = payload.email || 'User';
            this.userId = payload.userId;
            // Remove token from URL
            window.history.replaceState({}, document.title, "/public-dashboard");
        } else {
            // Check if token exists in localStorage
            const storedToken = localStorage.getItem('publicToken');
            if (!storedToken) {
                // No token, redirect to login
                this.$router.push('/public-login');
                return;
            }
            // Decode existing token
            const payload = JSON.parse(atob(storedToken.split('.')[1]));
            this.userEmail = payload.email || 'User';
            this.userId = payload.userId;
        }
        
        // Load user data and monitors
        this.loadMonitors();
        this.loadStatusPages();
    },
    methods: {
        loadMonitors() {
            // TODO: Load from API
            // For now, mock data
            this.monitors = [];
        },
        loadStatusPages() {
            // TODO: Load from API
            this.statusPages = [];
        },
        setupWebhook(monitor) {
            this.selectedMonitorForWebhook = monitor;
            this.currentWebhook = monitor.webhook || '';
            this.showWebhookModal = true;
        },
        saveWebhook() {
            if (this.selectedMonitorForWebhook) {
                this.selectedMonitorForWebhook.webhook = this.currentWebhook;
                // TODO: Save to API
                this.showWebhookModal = false;
            }
        },
        createStatusPage() {
            if (this.statusPages.length >= 2) {
                alert('You can only create 2 status pages on the free tier');
                return;
            }
            // Generate random slug
            const randomSlug = Math.random().toString(36).substring(2, 10);
            // TODO: Create status page via API
            this.statusPages.push({
                id: Date.now(),
                slug: randomSlug,
                url: `${window.location.origin}/public-status/${randomSlug}`
            });
            this.showStatusPageModal = false;
        },
        deleteStatusPage(id) {
            if (confirm('Are you sure you want to delete this status page?')) {
                this.statusPages = this.statusPages.filter(p => p.id !== id);
                // TODO: Delete via API
            }
        },
        saveMonitor() {
            // TODO: Save to API
            if (this.editingMonitor) {
                // Update existing
            } else {
                // Add new
                this.monitors.push({
                    id: Date.now(),
                    name: this.monitorForm.name,
                    url: this.monitorForm.url,
                    status: "up",
                    responseTime: 0
                });
            }
            this.closeModal();
        },
        editMonitor(monitor) {
            this.editingMonitor = monitor;
            this.monitorForm = { ...monitor };
            this.showAddMonitor = true;
        },
        deleteMonitor(id) {
            if (confirm("Are you sure you want to delete this monitor?")) {
                this.monitors = this.monitors.filter(m => m.id !== id);
            }
        },
        closeModal() {
            this.showAddMonitor = false;
            this.editingMonitor = null;
            this.monitorForm = { name: "", url: "", interval: 60 };
        },
        logout() {
            // TODO: Logout and redirect
            this.$router.push("/public-login");
        }
    }
};
</script>

<style scoped>
.public-dashboard {
    min-height: 100vh;
    background: #f5f7fa;
}

.card {
    border: none;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    margin-bottom: 20px;
}

.navbar-brand img {
    filter: brightness(0) invert(1);
}

.table {
    background: white;
}
</style>
