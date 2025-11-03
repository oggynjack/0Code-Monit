<template>
  <div class="modern-page">
    <div class="parallax-bg">
      <div class="parallax-layer sky"></div>
      <div class="parallax-layer sun"></div>
      <div class="parallax-layer horizon"></div>
      <div class="parallax-layer clouds"></div>
    </div>

    <nav class="top-nav">
      <div class="container-pro">
        <div class="nav-content">
          <div class="logo-section">
            <img src="/icon.svg" width="45" height="45" alt="Logo" class="logo-img" />
            <span class="logo-text">0Code Monit</span>
          </div>
          <div class="nav-links">
            <router-link to="/home" class="nav-link">Home</router-link>
            <router-link to="/docs" class="nav-link">Documentation</router-link>
            <router-link to="/pricing" class="nav-link">Pricing</router-link>
          </div>
        </div>
      </div>
    </nav>

    <section class="hero-section small">
      <div class="container-pro">
        <h1 class="page-title"><i class="fas fa-life-ring me-2"></i>Support</h1>
        <p class="page-subtitle">We’re here to help you 24/7.</p>
      </div>
    </section>

    <section class="content-section">
      <div class="container-pro">
        <div class="doc-grid">
          <div class="doc-card">
            <h3>Contact</h3>
            <p>Email: <a href="mailto:support@0code.uk">support@0code.uk</a></p>
            <p>Discord: <a href="#">Join our Discord</a></p>
          </div>
          <div class="doc-card">
            <h3>Knowledge Base</h3>
            <p>Read articles and FAQs to get quick answers.</p>
            <router-link to="/docs" class="nav-link">Go to Docs →</router-link>
          </div>
          <div class="doc-card">
            <h3>Status</h3>
            <p>View system status and uptime information.</p>
            <a href="/status" class="nav-link">Status Page →</a>
          </div>
        </div>
      </div>
    </section>

    <footer class="footer">
      <div class="container-pro">
        <div class="footer-bottom">
          <p>© 2025 0Code Monit. All rights reserved.</p>
          <router-link to="/dashboard" class="admin-link">Admin Panel</router-link>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default { name: 'SupportPage' };
</script>

<style scoped>
@import "./SharedModernStyles.css";
</style>
