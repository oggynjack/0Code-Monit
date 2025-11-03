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
            <router-link to="/pricing" class="nav-link">Pricing</router-link>
            <router-link to="/support" class="nav-link">Support</router-link>
          </div>
        </div>
      </div>
    </nav>

    <section class="hero-section small">
      <div class="container-pro">
        <h1 class="page-title"><i class="fas fa-book me-2"></i>Documentation</h1>
        <p class="page-subtitle">Minimal docs to get you started. You can expand this later.</p>
      </div>
    </section>

    <section class="content-section">
      <div class="container-pro">
        <div class="doc-grid">
          <div class="doc-card">
            <h3>Quick Start</h3>
            <ol>
              <li>Login with Google (Public Dashboard)</li>
              <li>Add your first website monitor</li>
              <li>Configure webhook notifications (optional)</li>
              <li>Create a public status page</li>
            </ol>
          </div>
          <div class="doc-card">
            <h3>Monitors</h3>
            <ul>
              <li>HTTP/HTTPS checks</li>
              <li>Intervals: 1m - 60m</li>
              <li>Response time tracking</li>
            </ul>
          </div>
          <div class="doc-card">
            <h3>Status Pages</h3>
            <ul>
              <li>Create up to 2 (Free tier)</li>
              <li>Random URL slug</li>
              <li>Public uptime overview</li>
            </ul>
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
export default { name: 'DocsPage' };
</script>

<style scoped>
@import "./SharedModernStyles.css";
</style>
