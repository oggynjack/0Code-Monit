<template>
    <div class="homepage">
        <div class="hero-section">
            <div class="container text-center">
                <img src="/icon.svg" width="120" height="120" alt="Logo" class="mb-4" />
                <h1 class="display-3 fw-bold mb-3">Welcome to 0Code Monit</h1>
                <p class="lead mb-5">
                    Monitor your websites uptime and performance. Free monitoring for up to 3 websites.
                </p>
                
                <div class="d-grid gap-3 col-md-4 mx-auto">
                    <router-link to="/public-login" class="btn btn-primary btn-lg">
                        <i class="fas fa-sign-in-alt me-2"></i>
                        Login with Google
                    </router-link>
                </div>
            </div>
        </div>

        <div class="features-section py-5">
            <div class="container">
                <div class="row g-4">
                    <div class="col-md-4">
                        <div class="feature-card text-center p-4">
                            <i class="fas fa-clock fa-3x mb-3 text-primary"></i>
                            <h4>Real-time Monitoring</h4>
                            <p class="text-muted">Get instant alerts when your website goes down</p>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="feature-card text-center p-4">
                            <i class="fas fa-chart-line fa-3x mb-3 text-primary"></i>
                            <h4>Performance Tracking</h4>
                            <p class="text-muted">Monitor response times and uptime statistics</p>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="feature-card text-center p-4">
                            <i class="fas fa-shield-alt fa-3x mb-3 text-primary"></i>
                            <h4>Free & Secure</h4>
                            <p class="text-muted">Monitor up to 3 websites completely free</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <footer class="footer py-3 mt-5">
            <div class="container text-center">
                <p class="text-muted mb-0">
                    © 2025 0Code Monit. All rights reserved.
                    <span class="mx-2">|</span>
                    <router-link to="/dashboard" class="text-muted admin-link">Admin</router-link>
                </p>
            </div>
        </footer>
    </div>
</template>

<script>
export default {
    name: "HomePage"
};
</script>

<style scoped>
.homepage {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    flex-direction: column;
}

.hero-section {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    padding: 60px 20px;
}

h1 {
    color: white;
    text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.lead {
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.25rem;
}

.btn-primary {
    background: white;
    color: #667eea;
    border: none;
    font-weight: 600;
    transition: transform 0.3s, box-shadow 0.3s;
}

.btn-primary:hover {
    background: #f8f9fa;
    color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}

.features-section {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
}

.feature-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    transition: transform 0.3s;
}

.feature-card:hover {
    transform: translateY(-5px);
}

.footer {
    background: rgba(0, 0, 0, 0.2);
    color: white;
}

.admin-link {
    font-size: 0.875rem;
    text-decoration: none;
    opacity: 0.6;
    transition: opacity 0.3s;
}

.admin-link:hover {
    opacity: 1;
    text-decoration: underline;
}
</style>
