<template>
    <div class="status-page" :class="{'dark-theme': isDarkMode}">
        <!-- Main Content -->
        <div class="container-fluid px-4 py-5">
            <!-- Professional Header -->
            <header class="status-header">
                <nav class="navbar">
                    <div class="nav-brand">
                        <img src="/icon.svg" width="32" height="32" alt="Logo" class="nav-logo" />
                        <span class="brand-text">0Code Monit</span>
                    </div>
                    <div class="nav-actions">
                        <button class="theme-toggle-btn" @click="toggleTheme" title="Toggle Theme">
                            <i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
                        </button>
                    </div>
                </nav>
            </header>

            <!-- System Status Overview -->
            <div class="status-overview mb-5">
                <div class="status-indicator" :class="systemStatusClass">
                    <div class="status-icon">
                        <i :class="systemStatusIcon"></i>
                    </div>
                    <div class="status-info">
                        <h1 class="status-title">{{ systemStatusText }}</h1>
                        <p class="status-subtitle">{{ systemStatusSubtext }}</p>
                    </div>
                </div>
                
                <div class="status-summary">
                    <div class="summary-item operational">
                        <div class="summary-number">{{ operationalCount }}</div>
                        <div class="summary-label">Services Operational</div>
                    </div>
                    <div v-if="downServicesCount > 0" class="summary-item down">
                        <div class="summary-number">{{ downServicesCount }}</div>
                        <div class="summary-label">Services Down</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-number">{{ totalUptimePercentage }}%</div>
                        <div class="summary-label">Overall Uptime</div>
                    </div>
                </div>
            </div>

            <!-- Tooltip for segments -->
            <div v-if="tooltip.show" class="seg-tooltip" :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }" @click.stop>
                <div class="tooltip-header">
                    <strong>{{ tooltip.title }}</strong>
                    <button class="tooltip-close" @click="tooltip.show = false">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="tooltip-body">
                    <div v-if="tooltip.loading" class="text-center py-2">
                        <i class="fas fa-spinner fa-spin"></i> Loading...
                    </div>
                    <div v-else-if="!tooltip.events || tooltip.events.length === 0" class="text-muted py-2">
                        <i class="fas fa-info-circle me-2"></i>No events in this period
                    </div>
                    <div v-else class="events-list">
                        <div v-for="(e, idx) in tooltip.events" :key="idx" class="event-item">
                            <div class="d-flex align-items-center gap-2">
                                <i :class="statusIconClass(e.status)"></i>
                                <span class="event-status" :class="statusTextClass(e.status)">{{ e.status.toUpperCase() }}</span>
                            </div>
                            <div class="event-details">
                                <div class="event-time"><i class="fas fa-clock me-1"></i>{{ new Date(e.time).toLocaleString() }}</div>
                                <div class="event-ping"><i class="fas fa-tachometer-alt me-1"></i>{{ e.ping }}ms</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Services Monitor Grid -->
            <div class="services-section mb-5">
                <div class="section-title">
                    <h2>Service Status</h2>
                    <div class="section-underline"></div>
                </div>
                
                <div v-if="loading" class="text-center py-5">
                    <div class="loading-spinner">
                        <div class="spinner"></div>
                        <p>Loading services...</p>
                    </div>
                </div>
                
                <div v-else-if="services.length === 0" class="text-center py-5">
                    <div class="empty-state">
                        <i class="fas fa-server fa-3x mb-3"></i>
                        <h3>No Services Yet</h3>
                        <p>Services will appear here once they're configured</p>
                    </div>
                </div>
                
                <div v-else class="services-grid">
                    <div 
                        v-for="service in services" 
                        :key="service.id"
                        class="service-card"
                    >
                        <div class="service-header">
                            <div class="service-title">
                                <h3>{{ service.name }}</h3>
                                <p>{{ service.url }}</p>
                            </div>
                            <div class="service-status" :class="service.status">
                                <i :class="statusIconClass(service.status)"></i>
                                <span>{{ statusText(service.status) }}</span>
                            </div>
                        </div>
                        
                        <div class="service-metrics">
                            <div class="metric">
                                <div class="metric-value">{{ calculateUptime(service.id) }}%</div>
                                <div class="metric-label">Uptime</div>
                            </div>
                            <div class="metric">
                                <div class="metric-value">{{ calculateAvgResponse(service.id) }}ms</div>
                                <div class="metric-label">Response</div>
                            </div>
                        </div>
                        
                        <div class="service-uptime">
                            <div class="uptime-header">
                                <span>Last 24 Hours</span>
                                <span class="uptime-percentage">{{ calculateUptime(service.id) }}%</span>
                            </div>
                            <div class="uptime-graph">
                                <div class="uptime-line" :style="{ gridTemplateColumns: 'repeat(' + getSegments(service.id).length + ', 1fr)' }">
                                    <span 
                                        v-for="(s, i) in getSegments(service.id)"
                                        :key="i" 
                                        :class="['uptime-bar', s]" 
                                        @click="openBucket(service.id, i, $event)"
                                        :title="'Click for details'"
                                    ></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <!-- Footer -->
        <footer class="status-footer">
            <div class="container-fluid px-4">
                <div class="footer-content">
                    <div class="footer-left">
                        <div class="footer-brand">
                            <img src="/icon.svg" width="24" height="24" alt="Logo" class="footer-logo" />
                            <span class="footer-brand-text">0Code Monit</span>
                        </div>
                        <p class="footer-description">Real-time monitoring and status tracking for your services</p>
                    </div>
                    <div class="footer-right">
                        <div class="footer-links">
                            <a href="https://monit.0code.uk" class="footer-link">About</a>
                            <a href="https://0code.uk" class="footer-link">0Code.uk</a>
                            <a href="https://monit.0code.uk/upgrade" class="footer-link upgrade-cta">Remove Branding</a>
                        </div>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>&copy; 2024 0Code Monit. Monitoring made simple.</p>
                </div>
            </div>
        </footer>
    </div>
</template>

<script>
export default {
    name: 'PublicStatusPage',
    data() {
        return {
            lastChecked: new Date().toLocaleString(),
            services: [],
            segments: {},
            serverTime: null,
            bucket: 15,
            tooltip: { show: false, x:0, y:0, title:'', loading:false, events:[] },
            currentFeatureIndex: 0,
            loading: true,
            refreshInSec: 300,
            _countdownTimer: null,
            _refreshTimeout: null,
            isDarkMode: false
        };
    },
    computed: {
        operationalCount() {
            return this.services.filter(s => s.status === 'up').length;
        },
        downServicesCount() {
            return this.services.filter(s => s.status === 'down').length;
        },
        systemStatusClass() {
            if (this.downServicesCount > 0) return 'status-banner-degraded';
            if (this.services.length === 0) return 'status-banner-unknown';
            return 'status-banner-operational';
        },
        systemStatusIcon() {
            if (this.downServicesCount > 0) return 'fas fa-exclamation-triangle';
            if (this.services.length === 0) return 'fas fa-question-circle';
            return 'fas fa-check-circle';
        },
        systemStatusText() {
            if (this.downServicesCount > 0) return 'Partial Service Disruption';
            if (this.services.length === 0) return 'No Services Configured';
            return 'All Systems Operational';
        },
        systemStatusSubtext() {
            if (this.downServicesCount > 0) {
                return `${this.downServicesCount} service${this.downServicesCount > 1 ? 's' : ''} experiencing issues`;
            }
            if (this.services.length === 0) return 'Add services to start monitoring';
            return `All ${this.services.length} services are running normally`;
        },
        totalUptimePercentage() {
            if (this.services.length === 0) return '0.00';
            
            const uptimes = this.services.map(service => {
                const serviceSegments = this.segments[service.id] || [];
                if (serviceSegments.length === 0) return 0;
                const upCount = serviceSegments.filter(s => s === 'up').length;
                return (upCount / serviceSegments.length) * 100;
            });
            
            const avgUptime = uptimes.reduce((sum, uptime) => sum + uptime, 0) / uptimes.length;
            return avgUptime.toFixed(2);
        }
    },
    mounted() {
        // Load theme preference
        const savedTheme = localStorage.getItem('statusPageTheme');
        this.isDarkMode = savedTheme === 'dark';

        // Close tooltip when clicking outside
        document.addEventListener('click', this.closeTooltip);

        const slug = this.$route.params.slug;
        this.loadStatusPage(slug);
        this.startFeatureSlider();
    },
    beforeUnmount() {
        if (this._countdownTimer) clearInterval(this._countdownTimer);
        if (this._refreshTimeout) clearTimeout(this._refreshTimeout);
        document.removeEventListener('click', this.closeTooltip);
    },
    methods: {
        scheduleNextRefresh(serverTimeISO, nextRefreshISO) {
            if (this._countdownTimer) clearInterval(this._countdownTimer);
            if (this._refreshTimeout) clearTimeout(this._refreshTimeout);

            const now = serverTimeISO ? new Date(serverTimeISO).getTime() : Date.now();
            const nextAt = nextRefreshISO ? new Date(nextRefreshISO).getTime() : now + 300000;
            let delta = Math.max(0, Math.floor((nextAt - now) / 1000));
            this.refreshInSec = delta;

            // Countdown every second
            this._countdownTimer = setInterval(() => {
                if (this.refreshInSec > 0) {
                    this.refreshInSec -= 1;
                }
            }, 1000);

            // Exact refresh
            this._refreshTimeout = setTimeout(() => {
                this.loadStatusPage(this.$route.params.slug);
            }, Math.max(0, (nextAt - now)) + 250);
        },
        async loadStatusPage(slug) {
            this.loading = true;
            this.tooltip.show = false;
            try {
                const [pageRes, segRes] = await Promise.all([
                    fetch(`/api/public-status/${slug}`),
                    fetch(`/api/public-status/${slug}/segments?hours=24&bucket=15`)
                ]);

                if (pageRes.ok) {
                    const data = await pageRes.json();
                    this.services = data.monitors || [];
                } else {
                    this.services = [];
                }

                let serverTimeISO = null;
                let nextRefreshISO = null;
                if (segRes.ok) {
                    const sData = await segRes.json();
                    this.segments = sData.segments || {};
                    serverTimeISO = sData.serverTime || null;
                    nextRefreshISO = sData.nextRefreshAt || null;
                } else {
                    this.segments = {};
                }
            // Save serverTime and bucket for tooltip reference
            this.serverTime = serverTimeISO || new Date().toISOString();
            this.bucket = 15;
            this.scheduleNextRefresh(serverTimeISO, nextRefreshISO);
            } catch (error) {
                console.error('Error loading status page:', error);
                this.services = [];
                this.segments = {};
            } finally {
                this.loading = false;
            }
        },
        startFeatureSlider() {
            setInterval(() => {
                // Rotate through features in both ad banners
                const featureItems = document.querySelectorAll('.feature-item');
                featureItems.forEach((item, index) => {
                    item.classList.remove('active');
                });
                
                this.currentFeatureIndex = (this.currentFeatureIndex + 1) % 4;
                
                document.querySelectorAll('.feature-slider').forEach(slider => {
                    const items = slider.querySelectorAll('.feature-item');
                    if (items[this.currentFeatureIndex]) {
                        items[this.currentFeatureIndex].classList.add('active');
                    }
                });
            }, 30000);
        },
        getSegments(monitorId) {
            const arr = this.segments[monitorId];
            if (Array.isArray(arr) && arr.length) return arr;
            // fallback to 24h / 15m = 96 unknown cells so the grid always shows
            return new Array(96).fill('unknown');
        },
        openBucket(monitorId, idx, evt) {
            // Compute bucket window from serverTime & bucket=15
            const now = this.serverTime ? new Date(this.serverTime).getTime() : Date.now();
            const bucketMin = this.bucket || 15;
            const buckets = this.getSegments(monitorId).length;
            const end = now - (buckets - 1 - idx) * bucketMin * 60000;
            const start = end - bucketMin * 60000;
            const from = new Date(start).toISOString();
            const to = new Date(end).toISOString();

            const current = this.getSegments(monitorId)[idx] || 'unknown';
            this.tooltip = { show: true, x: evt.clientX + 10, y: evt.clientY + 10, title: this.statusText(current), loading: true, events: [] };
            fetch(`/api/public-status/${this.$route.params.slug}/events?monitorId=${monitorId}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
                .then(r => r.ok ? r.json() : { events: [] })
                .then(d => {
                    this.tooltip.loading = false;
                    this.tooltip.events = d.events || [];
                }).catch(() => { this.tooltip.loading = false; this.tooltip.events = []; });
        },
        toggleTheme() {
            this.isDarkMode = !this.isDarkMode;
            localStorage.setItem('statusPageTheme', this.isDarkMode ? 'dark' : 'light');
        },
        closeTooltip() {
            this.tooltip.show = false;
        },
        statusText(s) {
            if (s === 'up') return 'Operational';
            if (s === 'maintenance') return 'Maintenance';
            if (s === 'down') return 'Down';
            return 'Pending';
        },
        statusTextClass(s) {
            if (s === 'up') return 'text-success';
            if (s === 'maintenance') return 'text-warning';
            if (s === 'down') return 'text-danger';
            return 'text-muted';
        },
        statusBadgeClass(s) {
            if (s === 'up') return 'badge-success';
            if (s === 'maintenance') return 'badge-warning';
            if (s === 'down') return 'badge-danger';
            return 'badge-secondary';
        },
        statusIconClass(s) {
            if (s === 'up') return 'fas fa-check-circle';
            if (s === 'maintenance') return 'fas fa-wrench';
            if (s === 'down') return 'fas fa-times-circle';
            return 'fas fa-clock';
        },
        calculateUptime(serviceId) {
            const serviceSegments = this.segments[serviceId] || [];
            if (serviceSegments.length === 0) return '0.00';
            
            const upCount = serviceSegments.filter(s => s === 'up').length;
            const uptime = (upCount / serviceSegments.length) * 100;
            return uptime.toFixed(2);
        },
        calculateAvgResponse(serviceId) {
            // This is a placeholder - in a real implementation, you would
            // fetch actual response time data from the backend
            const service = this.services.find(s => s.id === serviceId);
            if (!service || !service.responseTime) return '—';
            return service.responseTime;
        }
    }
};
</script>

<style scoped>
.status-page {
    min-height: 100vh;
    background: #f8fafc;
    color: #1a202c;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.dark-theme {
    background: #0f172a;
    color: #f1f5f9;
}

/* Professional Header */
.status-header {
    background: white;
    border-bottom: 1px solid #e2e8f0;
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(10px);
}

.dark-theme .status-header {
    background: #1e293b;
    border-color: #334155;
}

.navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 0;
    max-width: 1200px;
    margin: 0 auto;
}

.nav-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.nav-logo {
    border-radius: 6px;
}

.brand-text {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1a202c;
}

.dark-theme .brand-text {
    color: #f1f5f9;
}

.theme-toggle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    background: white;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.2s;
}

.theme-toggle-btn:hover {
    background: #f9fafb;
    border-color: #9ca3af;
}

.dark-theme .theme-toggle-btn {
    background: #374151;
    border-color: #4b5563;
    color: #d1d5db;
}

.dark-theme .theme-toggle-btn:hover {
    background: #4b5563;
    border-color: #6b7280;
}

/* Status Overview */
.status-overview {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 0;
}

.status-indicator {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.dark-theme .status-indicator {
    background: #1e293b;
    border-color: #334155;
}

.status-indicator.status-banner-operational {
    border-left: 4px solid #10b981;
}

.status-indicator.status-banner-degraded {
    border-left: 4px solid #ef4444;
}

.status-indicator.status-banner-unknown {
    border-left: 4px solid #6366f1;
}

.status-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    flex-shrink: 0;
}

.status-banner-operational .status-icon {
    background: #ecfdf5;
    color: #10b981;
}

.status-banner-degraded .status-icon {
    background: #fef2f2;
    color: #ef4444;
}

.status-banner-unknown .status-icon {
    background: #eef2ff;
    color: #6366f1;
}

.dark-theme .status-banner-operational .status-icon {
    background: rgba(16, 185, 129, 0.1);
}

.dark-theme .status-banner-degraded .status-icon {
    background: rgba(239, 68, 68, 0.1);
}

.dark-theme .status-banner-unknown .status-icon {
    background: rgba(99, 102, 241, 0.1);
}

.status-title {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: #1a202c;
}

.dark-theme .status-title {
    color: #f1f5f9;
}

.status-subtitle {
    color: #6b7280;
    font-size: 1.125rem;
}

.dark-theme .status-subtitle {
    color: #9ca3af;
}

.status-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
}

.summary-item {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 1.5rem;
    text-align: center;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s;
}

.summary-item:hover {
    transform: translateY(-2px);
}

.dark-theme .summary-item {
    background: #1e293b;
    border-color: #334155;
}

.summary-item.operational {
    border-left: 4px solid #10b981;
}

.summary-item.down {
    border-left: 4px solid #ef4444;
}

.summary-number {
    font-size: 2.5rem;
    font-weight: 800;
    color: #1a202c;
    margin-bottom: 0.5rem;
}

.dark-theme .summary-number {
    color: #f1f5f9;
}

.summary-item.operational .summary-number {
    color: #10b981;
}

.summary-item.down .summary-number {
    color: #ef4444;
}

.summary-label {
    color: #6b7280;
    font-weight: 500;
    text-transform: uppercase;
    font-size: 0.875rem;
    letter-spacing: 0.05em;
}

.dark-theme .summary-label {
    color: #9ca3af;
}

/* Services Section */
.services-section {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 0;
}

.section-title {
    text-align: center;
    margin-bottom: 3rem;
}

.section-title h2 {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1a202c;
    margin-bottom: 1rem;
}

.dark-theme .section-title h2 {
    color: #f1f5f9;
}

.section-underline {
    width: 80px;
    height: 4px;
    background: linear-gradient(90deg, #6366f1, #8b5cf6);
    margin: 0 auto;
    border-radius: 2px;
}

.services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
    gap: 2rem;
}

.service-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    transition: all 0.3s;
}

.service-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.dark-theme .service-card {
    background: #1e293b;
    border-color: #334155;
}

.service-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 1.5rem;
}

.service-title {
    flex-grow: 1;
}

.service-title h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1a202c;
    margin-bottom: 0.25rem;
}

.dark-theme .service-title h3 {
    color: #f1f5f9;
}

.service-title p {
    color: #6b7280;
    font-size: 0.875rem;
    margin: 0;
}

.dark-theme .service-title p {
    color: #9ca3af;
}

.service-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 999px;
    font-weight: 600;
    font-size: 0.875rem;
    border: 2px solid;
}

.service-status.up {
    background: #ecfdf5;
    color: #10b981;
    border-color: #10b981;
}

.service-status.down {
    background: #fef2f2;
    color: #ef4444;
    border-color: #ef4444;
}

.service-status.pending {
    background: #fffbeb;
    color: #f59e0b;
    border-color: #f59e0b;
}

.dark-theme .service-status.up {
    background: rgba(16, 185, 129, 0.1);
}

.dark-theme .service-status.down {
    background: rgba(239, 68, 68, 0.1);
}

.dark-theme .service-status.pending {
    background: rgba(245, 158, 11, 0.1);
}

.service-metrics {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.metric {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1rem;
    text-align: center;
}

.dark-theme .metric {
    background: #0f172a;
    border-color: #1e293b;
}

.metric-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1a202c;
    margin-bottom: 0.25rem;
}

.dark-theme .metric-value {
    color: #f1f5f9;
}

.metric-label {
    font-size: 0.75rem;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 500;
}

.dark-theme .metric-label {
    color: #9ca3af;
}

.service-uptime {
    border-top: 1px solid #e5e7eb;
    padding-top: 1.5rem;
}

.dark-theme .service-uptime {
    border-color: #334155;
}

.uptime-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    color: #6b7280;
    font-size: 0.875rem;
    font-weight: 500;
}

.dark-theme .uptime-header {
    color: #9ca3af;
}

.uptime-percentage {
    color: #1a202c;
    font-weight: 700;
}

.dark-theme .uptime-percentage {
    color: #f1f5f9;
}

.uptime-graph {
    background: #f1f5f9;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    height: 32px;
    overflow: hidden;
}

.dark-theme .uptime-graph {
    background: #0f172a;
    border-color: #1e293b;
}

.uptime-line {
    display: grid;
    height: 100%;
    gap: 1px;
}

.uptime-bar {
    cursor: pointer;
    transition: all 0.2s ease;
}

.uptime-bar.up {
    background: #10b981;
}

.uptime-bar.down {
    background: #ef4444;
}

.uptime-bar.unknown {
    background: #d1d5db;
}

.dark-theme .uptime-bar.unknown {
    background: #374151;
}

.uptime-bar:hover {
    opacity: 0.8;
    transform: scaleY(1.2);
}

/* Loading States */
.loading-spinner {
    text-align: center;
    padding: 3rem;
    color: #6b7280;
}

.dark-theme .loading-spinner {
    color: #9ca3af;
}

.spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #e5e7eb;
    border-top: 3px solid #6366f1;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
}

.dark-theme .spinner {
    border-color: #374151;
    border-top-color: #8b5cf6;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.empty-state {
    text-align: center;
    padding: 3rem;
    color: #6b7280;
}

.dark-theme .empty-state {
    color: #9ca3af;
}

.empty-state i {
    color: #d1d5db;
    margin-bottom: 1rem;
}

.dark-theme .empty-state i {
    color: #4b5563;
}

.empty-state h3 {
    color: #1a202c;
    margin-bottom: 0.5rem;
}

.dark-theme .empty-state h3 {
    color: #f1f5f9;
}

/* Footer */
.status-footer {
    background: white;
    border-top: 1px solid #e5e7eb;
    padding: 3rem 0 2rem;
    margin-top: 4rem;
}

.dark-theme .status-footer {
    background: #0f172a;
    border-color: #1e293b;
}

.footer-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
}

.footer-left {
    flex: 1;
}

.footer-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
}

.footer-brand-text {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1a202c;
}

.dark-theme .footer-brand-text {
    color: #f1f5f9;
}

.footer-description {
    color: #6b7280;
    margin: 0;
    max-width: 300px;
}

.dark-theme .footer-description {
    color: #9ca3af;
}

.footer-right {
    flex-shrink: 0;
}

.footer-links {
    display: flex;
    gap: 2rem;
    align-items: center;
}

.footer-link {
    color: #6b7280;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
}

.footer-link:hover {
    color: #1a202c;
}

.dark-theme .footer-link {
    color: #9ca3af;
}

.dark-theme .footer-link:hover {
    color: #f1f5f9;
}

.footer-link.upgrade-cta {
    background: #6366f1;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-weight: 600;
}

.footer-link.upgrade-cta:hover {
    background: #5b21b6;
    color: white;
}

.footer-bottom {
    border-top: 1px solid #e5e7eb;
    padding-top: 2rem;
    text-align: center;
    max-width: 1200px;
    margin: 0 auto;
}

.dark-theme .footer-bottom {
    border-color: #1e293b;
}

.footer-bottom p {
    color: #6b7280;
    margin: 0;
    font-size: 0.875rem;
}

.dark-theme .footer-bottom p {
    color: #9ca3af;
}

/* Tooltip Styles */
.seg-tooltip {
    position: fixed;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    min-width: 320px;
    max-width: 400px;
    z-index: 9999;
    overflow: hidden;
}

.dark-theme .seg-tooltip {
    background: #1e293b;
    border-color: #334155;
}

.tooltip-header {
    background: #f8fafc;
    border-bottom: 1px solid #e5e7eb;
    padding: 1rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.dark-theme .tooltip-header {
    background: #0f172a;
    border-color: #1e293b;
}

.tooltip-header strong {
    font-weight: 600;
    color: #1a202c;
}

.dark-theme .tooltip-header strong {
    color: #f1f5f9;
}

.tooltip-close {
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    transition: all 0.2s;
}

.tooltip-close:hover {
    background: #f3f4f6;
    color: #1a202c;
}

.dark-theme .tooltip-close {
    color: #9ca3af;
}

.dark-theme .tooltip-close:hover {
    background: #374151;
    color: #f1f5f9;
}

.tooltip-body {
    padding: 1.5rem;
    max-height: 300px;
    overflow-y: auto;
}

.events-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.event-item {
    padding: 1rem;
    background: #f8fafc;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    border-left: 3px solid #6366f1;
}

.dark-theme .event-item {
    background: #0f172a;
    border-color: #1e293b;
}

.event-status {
    font-weight: 600;
    font-size: 0.875rem;
}

.event-details {
    margin-top: 0.5rem;
    font-size: 0.813rem;
    color: #6b7280;
}

.dark-theme .event-details {
    color: #9ca3af;
}

.event-time, .event-ping {
    margin-top: 0.25rem;
}

/* Responsive Design */
@media (max-width: 768px) {
    .navbar {
        padding: 1rem;
    }
    
    .status-overview {
        padding: 1rem;
    }
    
    .status-indicator {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
    }
    
    .status-summary {
        grid-template-columns: 1fr;
    }
    
    .services-grid {
        grid-template-columns: 1fr;
        padding: 0 1rem;
    }
    
    .service-metrics {
        grid-template-columns: 1fr;
    }
    
    .footer-content {
        flex-direction: column;
        gap: 2rem;
        text-align: center;
    }
    
    .footer-links {
        justify-content: center;
    }
    
    .section-title h2 {
        font-size: 2rem;
    }
}
</style>
