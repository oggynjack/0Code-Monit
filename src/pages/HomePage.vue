<template>
    <div class="modern-homepage">
        <!-- Parallax Background -->
        <div class="parallax-bg">
            <div class="parallax-layer sky"></div>
            <div class="parallax-layer sun"></div>
            <div class="parallax-layer horizon"></div>
            <div class="parallax-layer clouds"></div>
        </div>

        <!-- Navigation -->
        <nav class="top-nav">
            <div class="container-pro">
                <div class="nav-content">
                    <div class="logo-section">
<img src="/icon.svg" width="45" height="45" alt="Logo" class="logo-img" />
                        <span class="logo-text">0Code Monit</span>
                    </div>
                    <div class="nav-links">
<router-link to="/docs" class="nav-link">Documentation</router-link>
                        <router-link to="/pricing" class="nav-link">Pricing</router-link>
                        <router-link to="/support" class="nav-link">Support</router-link>
                        <router-link to="/public-login" class="btn-ghost">Login</router-link>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Hero Section -->
<section class="hero-section enhanced">
            <div class="container-pro">
                <div class="hero-content">
                    <div class="hero-badge">
                        <span class="status-dot"></span>
                        <span>Fast & Reliable Monitoring</span>
                    </div>
                    
                    <h1 class="hero-title">
                        Monitor Your<br />
                        <span class="gradient-text">Uptime & Performance</span>
                    </h1>
                    
                    <p class="hero-description">
                        Professional website monitoring with real-time alerts, status pages, and detailed analytics. 
                        Fast, reliable uptime monitoring with beautiful status pages and real-time alerts.
                    </p>
                    
                    <div class="hero-actions">
                        <router-link to="/public-login" class="btn-primary-large">
                            Get Started Free
                            <i class="fas fa-arrow-right ml-2"></i>
                        </router-link>
<router-link to="/docs" class="btn-ghost-large">
                            Learn More
                            <i class="fas fa-book-open ml-2"></i>
                        </router-link>
                    </div>

                    <!-- Animated visual mock -->
                    <div class="hero-visual">
                        <div class="mock-card">
                            <div class="mock-header">
                                <span class="dot red"></span>
                                <span class="dot yellow"></span>
                                <span class="dot green"></span>
                                <div class="mock-title">Live Uptime</div>
                            </div>
                            <div class="mock-body">
                                <div class="uptime-row" v-for="(label, idx) in heroLabels" :key="idx">
                                    <div class="uptime-label">{{ label }}</div>
                                    <div class="uptime-track">
                                        <span v-for="i in 96" :key="i" class="uptime-seg" :class="{ down: (i % 37) === (idx*7+11) }" :style="{ animationDelay: (i*0.03) + 's' }"></span>
                                    </div>
                                </div>
                                <div class="stats-strip">
                                    <div class="stat-chip ok"><i class="fas fa-check"></i> 99.98% Uptime</div>
                                    <div class="stat-chip ping"><i class="fas fa-bolt"></i> 320ms Avg</div>
                                    <div class="stat-chip incidents"><i class="fas fa-bell"></i> 0 Incidents</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Features Section -->
        <section id="features" class="features-section">
            <div class="container-pro">
                <div class="section-header">
                    <h2 class="section-title">Powerful Features</h2>
                    <p class="section-subtitle">Everything you need to keep your services online</p>
                </div>

                <div class="features-grid">
                    <!-- Feature Card 1 -->
                    <div class="feature-card" :style="{'--delay': '0s'}">
                        <div class="feature-gradient gradient-blue"></div>
                        <div class="feature-content">
                            <div class="feature-icon">
                                <i class="fas fa-heartbeat"></i>
                            </div>
                            <h3 class="feature-title">Real-time Monitoring</h3>
                            <p class="feature-description">
                                Continuous monitoring with configurable intervals. Get instant alerts when your website goes down.
                            </p>
                            <ul class="feature-list">
                                <li><span class="check-icon">✓</span> 1-minute check intervals</li>
                                <li><span class="check-icon">✓</span> HTTP/HTTPS monitoring</li>
                                <li><span class="check-icon">✓</span> Response time tracking</li>
                            </ul>
                        </div>
                    </div>

                    <!-- Feature Card 2 -->
                    <div class="feature-card" :style="{'--delay': '0.1s'}">
                        <div class="feature-gradient gradient-purple"></div>
                        <div class="feature-content">
                            <div class="feature-icon">
                                <i class="fas fa-bell"></i>
                            </div>
                            <h3 class="feature-title">Webhook Notifications</h3>
                            <p class="feature-description">
                                Configure custom webhooks to receive instant notifications via Slack, Discord, or any service.
                            </p>
                            <ul class="feature-list">
                                <li><span class="check-icon">✓</span> Slack integration</li>
                                <li><span class="check-icon">✓</span> Discord webhooks</li>
                                <li><span class="check-icon">✓</span> Custom endpoints</li>
                            </ul>
                        </div>
                    </div>

                    <!-- Feature Card 3 -->
                    <div class="feature-card" :style="{'--delay': '0.2s'}">
                        <div class="feature-gradient gradient-green"></div>
                        <div class="feature-content">
                            <div class="feature-icon">
                                <i class="fas fa-globe"></i>
                            </div>
                            <h3 class="feature-title">Status Pages</h3>
                            <p class="feature-description">
                                Create beautiful public status pages to keep your users informed about your service health.
                            </p>
                            <ul class="feature-list">
                                <li><span class="check-icon">✓</span> Customizable URLs</li>
                                <li><span class="check-icon">✓</span> Real-time updates</li>
                                <li><span class="check-icon">✓</span> Uptime history</li>
                            </ul>
                        </div>
                    </div>

                    <!-- Feature Card 4 -->
                    <div class="feature-card" :style="{'--delay': '0.3s'}">
                        <div class="feature-gradient gradient-orange"></div>
                        <div class="feature-content">
                            <div class="feature-icon">
                                <i class="fas fa-chart-line"></i>
                            </div>
                            <h3 class="feature-title">Detailed Analytics</h3>
                            <p class="feature-description">
                                Track performance metrics, uptime percentages, and response times with beautiful visualizations.
                            </p>
                            <ul class="feature-list">
                                <li><span class="check-icon">✓</span> Response time graphs</li>
                                <li><span class="check-icon">✓</span> Uptime statistics</li>
                                <li><span class="check-icon">✓</span> Historical data</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>




        <!-- Footer -->
        <footer class="footer">
            <div class="container-pro">
                <div class="footer-content">
                    <div class="footer-brand">
                        <img src="/icon.svg" width="32" height="32" alt="Logo" />
                        <span class="footer-logo-text">0Code Monit</span>
                        <p class="footer-tagline">Professional website monitoring made simple.</p>
                    </div>
                    <div class="footer-links two-col">
                        <div class="footer-column">
                            <h4>Explore</h4>
                            <router-link to="/docs">Documentation</router-link>
                            <router-link to="/pricing">Pricing</router-link>
                            <router-link to="/support">Support</router-link>
                            <a href="https://0code.uk" target="_blank">About Us</a>
                        </div>
                        <div class="footer-column">
                            <h4>Connect</h4>
                            <a href="#"><i class="fab fa-twitter"></i> Twitter</a>
                            <a href="#"><i class="fab fa-github"></i> GitHub</a>
                            <a href="#"><i class="fab fa-discord"></i> Discord</a>
                        </div>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>© 2025 0Code Monit. All rights reserved.</p>
                    <router-link to="/dashboard" class="admin-link">Admin Panel</router-link>
                </div>
            </div>
        </footer>
    </div>
</template>

<script>
export default {
    name: "ModernHomePage",
    data() {
        return {
            heroLabels: ["Projects", "BOTS", "WEBSITES"],
        };
    }
};
</script>

<style scoped>
/* Parallax Background */
.parallax-bg {
    position: fixed;
    inset: 0;
    z-index: -1;
    overflow: hidden;
}

.parallax-layer {
    position: absolute;
    inset: -20%;
    will-change: transform;
}

.sky {
    background: radial-gradient(1200px 600px at 50% -10%, rgba(99, 102, 241, 0.15), transparent),
                radial-gradient(1000px 600px at 50% 110%, rgba(59, 130, 246, 0.15), transparent),
                linear-gradient(180deg, #0a0f1a 0%, #060a12 60%, #030508 100%);
}

.sun {
    background: radial-gradient(closest-side, rgba(139, 92, 246, 0.4), rgba(99, 102, 241, 0.3), rgba(59, 130, 246, 0.1), transparent 70%);
    mix-blend-mode: screen;
    filter: blur(8px);
    animation: sunGlow 8s ease-in-out infinite;
}

.horizon {
    background: radial-gradient(1200px 400px at 50% 95%, rgba(99, 102, 241, 0.2), rgba(59, 130, 246, 0.15), transparent);
    mix-blend-mode: screen;
}

.clouds {
    background: radial-gradient(300px 120px at 20% 30%, rgba(255,255,255,0.04), transparent),
                radial-gradient(400px 160px at 80% 40%, rgba(255,255,255,0.03), transparent),
                radial-gradient(350px 140px at 40% 70%, rgba(255,255,255,0.03), transparent);
    filter: blur(12px);
    animation: cloudDrift 30s linear infinite;
}

@keyframes sunGlow {
    0%, 100% { opacity: 0.8; }
    50% { opacity: 1; }
}

@keyframes cloudDrift {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50px); }
}

/* Base Styles */
.modern-homepage {
    min-height: 100vh;
    color: #e6e6e6;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.container-pro {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
}

/* Navigation */
.top-nav {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(10, 15, 26, 0.8);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding: 1rem 0;
}

.nav-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.logo-section {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.logo-img {
    filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.5));
}

.logo-text {
    font-size: 1.25rem;
    font-weight: 700;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.nav-links {
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.nav-link {
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    transition: color 0.3s;
}

.nav-link:hover {
    color: rgba(255, 255, 255, 0.95);
}

.admin-link-nav {
    opacity: 0.5;
    font-size: 0.75rem;
}

/* Hero Section */
.hero-section {
    padding: 8rem 0 6rem;
    text-align: center;
}

.hero-section.enhanced {
    padding: 9rem 0 7rem;
    text-align: center;
}

.hero-section.enhanced .hero-title { letter-spacing: -0.025em; }
.hero-section.enhanced .btn-primary-large { box-shadow: 0 10px 30px rgba(99,102,241,.45); }

.hero-section.enhanced .hero-stats { border-radius: 1.25rem; box-shadow: 0 10px 40px rgba(0,0,0,.25); }
.hero-content {
    max-width: 1000px;
    margin: 0 auto;
}

.hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 9999px;
    font-size: 0.875rem;
    margin-bottom: 2rem;
}

.status-dot {
    width: 8px;
    height: 8px;
    background: #10b981;
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

.hero-title {
    font-size: clamp(2.5rem, 6vw, 4.5rem);
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: 1.5rem;
    letter-spacing: -0.02em;
}

.gradient-text {
    background: linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: gradientShift 5s ease infinite;
}

@keyframes gradientShift {
    0%, 100% { filter: hue-rotate(0deg); }
    50% { filter: hue-rotate(10deg); }
}

.hero-description {
    font-size: 1.25rem;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.8;
    margin-bottom: 2.5rem;
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
}

.hero-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 4rem;
}

.btn-primary-large, .btn-ghost-large {
    display: inline-flex;
    align-items: center;
    padding: 1rem 2rem;
    border-radius: 9999px;
    font-weight: 600;
    font-size: 1rem;
    text-decoration: none;
    transition: all 0.3s;
}

.btn-primary-large {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
    box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}

.btn-primary-large:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6);
}

.btn-ghost-large {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.15);
}

.btn-ghost-large:hover {
    background: rgba(255, 255, 255, 0.1);
}

.btn-ghost {
    display: inline-flex;
    align-items: center;
    padding: 0.625rem 1.5rem;
    border-radius: 9999px;
    font-weight: 500;
    font-size: 0.875rem;
    text-decoration: none;
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.15);
    transition: all 0.3s;
}

.btn-ghost:hover {
    background: rgba(255, 255, 255, 0.1);
}

.btn-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.75rem;
    border-radius: 9999px;
    font-weight: 600;
    font-size: 0.875rem;
    text-decoration: none;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
    box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
    transition: all 0.3s;
    width: 100%;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6);
}

/* Hero Stats (removed per request) */
.hero-stats { display:none; }

.stat-item {
    text-align: center;
}

.stat-number {
    font-size: 2rem;
    font-weight: 700;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.stat-label {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.6);
    margin-top: 0.25rem;
}

.stat-divider {
    width: 1px;
    height: 40px;
    background: rgba(255, 255, 255, 0.1);
}

/* Animated visual mock */
.hero-visual { margin-top: 1.5rem; display:flex; justify-content:center; }
.mock-card { width: 100%; max-width: 980px; background: rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius: 1rem; overflow:hidden; box-shadow: 0 10px 40px rgba(0,0,0,.25); }
.mock-header { display:flex; align-items:center; gap:.5rem; padding:.75rem 1rem; background: rgba(255,255,255,.04); border-bottom:1px solid rgba(255,255,255,.08); position:relative; }
.mock-header .dot{ width:10px; height:10px; border-radius:999px; display:inline-block; }
.mock-header .red{ background:#ef4444; } .mock-header .yellow{ background:#f59e0b; } .mock-header .green{ background:#22c55e; }
.mock-title{ position:absolute; left:50%; transform:translateX(-50%); font-weight:600; font-size:.9rem; opacity:.8; }
.mock-body{ padding:1rem; }
.uptime-row{ display:flex; align-items:center; gap:1rem; padding:.6rem 0; }
.uptime-label{ width:140px; text-align:right; opacity:.85; font-size:.9rem; font-weight:600; }
.uptime-track{ flex:1; display:flex; gap:3px; overflow:hidden; mask-image: linear-gradient(90deg, transparent 0, white 30px, white calc(100% - 30px), transparent 100%); }
.uptime-seg{ width:10px; height:18px; border-radius:4px; background: linear-gradient(180deg, #22c55e, #16a34a); opacity:.9; animation: flow 2.8s linear infinite; }
.uptime-seg.down{ background: linear-gradient(180deg, #ef4444, #b91c1c); }
.uptime-seg:nth-child(3n){ opacity:.8 }
.uptime-seg:nth-child(5n){ opacity:.7 }
@keyframes flow { 0%{transform:translateX(60px)} 100%{transform:translateX(-60px)} }
.stats-strip{ display:flex; gap:.6rem; flex-wrap:wrap; margin-top:1rem; }
.stat-chip{ background: rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1); padding:.45rem .85rem; border-radius:999px; font-size:.8rem; display:flex; align-items:center; gap:.5rem; box-shadow: 0 6px 18px rgba(0,0,0,.15); }
.stat-chip.ok{ border-color: rgba(34,197,94,.35); }
.stat-chip.ping{ border-color: rgba(99,102,241,.35); }
.stat-chip.incidents{ border-color: rgba(239,68,68,.35); }

/* Sections */
.features-section, .pricing-section, .docs-section, .support-section {
    padding: 6rem 0;
}

.section-header {
    text-align: center;
    margin-bottom: 4rem;
}

.section-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
}

.section-subtitle {
    font-size: 1.125rem;
    color: rgba(255, 255, 255, 0.6);
}

/* Features Grid */
.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
}

.feature-card {
    position: relative;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 1.5rem;
    padding: 2rem;
    transition: all 0.4s;
    animation: fadeInUp 0.8s ease-out var(--delay);
    animation-fill-mode: both;
    overflow: hidden;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.feature-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.15);
}

.feature-gradient {
    position: absolute;
    inset: -1px;
    border-radius: 1.5rem;
    opacity: 0;
    transition: opacity 0.4s;
    z-index: 0;
}

.feature-card:hover .feature-gradient {
    opacity: 0.4;
}

.gradient-blue {
    background: radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.4), transparent);
}

.gradient-purple {
    background: radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.4), transparent);
}

.gradient-green {
    background: radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.4), transparent);
}

.gradient-orange {
    background: radial-gradient(circle at 50% 50%, rgba(251, 146, 60, 0.4), transparent);
}

.feature-content {
    position: relative;
    z-index: 1;
}

.feature-icon {
    width: 3.5rem;
    height: 3.5rem;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
}

.feature-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.feature-description {
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.6;
    margin-bottom: 1.5rem;
}

.feature-list {
    list-style: none;
    padding: 0;
}

.feature-list li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
}

.check-icon {
    color: #10b981;
    font-weight: 700;
}

/* Pricing */
.pricing-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    max-width: 1000px;
    margin: 0 auto;
}

.pricing-card {
    position: relative;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 1.5rem;
    padding: 2.5rem;
    transition: all 0.4s;
}

.pricing-card.featured {
    border-color: rgba(99, 102, 241, 0.4);
    background: rgba(99, 102, 241, 0.05);
}

.pricing-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.popular-badge {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    padding: 0.375rem 1rem;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
}

.pricing-header {
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding-bottom: 2rem;
    margin-bottom: 2rem;
}

.pricing-name {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.pricing-price {
    margin-bottom: 0.5rem;
}

.price-amount {
    font-size: 3rem;
    font-weight: 700;
}

.price-period {
    color: rgba(255, 255, 255, 0.6);
    font-size: 1rem;
}

.pricing-description {
    color: rgba(255, 255, 255, 0.6);
}

.pricing-features {
    list-style: none;
    padding: 0;
    margin-bottom: 2rem;
}

.pricing-features li {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 0;
    color: rgba(255, 255, 255, 0.8);
}

.pricing-features i {
    color: #10b981;
}

/* Docs */
.docs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
}

.doc-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 1rem;
    padding: 2rem;
    text-decoration: none;
    color: inherit;
    transition: all 0.3s;
    display: block;
}

.doc-card:hover {
    transform: translateY(-4px);
    border-color: rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.05);
}

.doc-icon {
    width: 3rem;
    height: 3rem;
    background: rgba(99, 102, 241, 0.15);
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    color: #6366f1;
    margin-bottom: 1rem;
}

.doc-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.doc-description {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.875rem;
    line-height: 1.6;
    margin-bottom: 1rem;
}

.doc-link {
    color: #6366f1;
    font-size: 0.875rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

/* Support */
.support-section {
    background: rgba(99, 102, 241, 0.05);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.support-content {
    text-align: center;
    max-width: 600px;
    margin: 0 auto;
}

.support-title {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 1rem;
}

.support-description {
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 2rem;
}

.support-channels {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    flex-wrap: wrap;
}

.support-channel {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 9999px;
    text-decoration: none;
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.875rem;
    transition: all 0.3s;
}

.support-channel:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
}

/* Footer */
.footer {
    padding: 5rem 0 2rem;
    border-top: 0;
    background: radial-gradient(800px 200px at 50% 0%, rgba(99,102,241,0.15), transparent), rgba(0,0,0,0.25);
    position: relative;
}
.footer::before { content: ""; position: absolute; top: 0; left: 0; right:0; height: 2px; background: linear-gradient(90deg,#6366f1,#8b5cf6,#22c55e); opacity: .6; }

.footer-content {
    display: grid;
    grid-template-columns: 2fr 2fr;
    gap: 3rem;
    margin-bottom: 2rem;
}
.footer-links.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }

.footer-brand {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.footer-logo-text {
    font-size: 1.25rem;
    font-weight: 700;
}

.footer-tagline {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.875rem;
}

.footer-column h4 {
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: rgba(255, 255, 255, 0.9);
}

.footer-column a {
    display: block;
    color: rgba(255, 255, 255, 0.6);
    text-decoration: none;
    font-size: 0.875rem;
    margin-bottom: 0.75rem;
    transition: color 0.3s;
}

.footer-column a:hover {
    color: rgba(255, 255, 255, 0.9);
}

.footer-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.875rem;
}

.admin-link {
    opacity: 0.4;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
    text-decoration: none;
    transition: opacity 0.3s;
}

.admin-link:hover {
    opacity: 0.7;
}

/* Responsive */
@media (max-width: 1024px) {
    .footer-content {
        grid-template-columns: 1fr 1fr;
    }
}

@media (max-width: 768px) {
    .nav-links {
        gap: 1rem;
    }
    
    .nav-link {
        font-size: 0.75rem;
    }
    
    .hero-section {
        padding: 6rem 0 4rem;
    }
    
    .hero-stats {
        flex-direction: column;
        gap: 1.5rem;
    }
    
    .stat-divider {
        width: 40px;
        height: 1px;
    }
    
    .footer-content {
        grid-template-columns: 1fr;
        gap: 2rem;
    }
    
    .footer-bottom {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
    }
}

@media (max-width: 640px) {
    .nav-links {
        display: none;
    }
}
</style>
