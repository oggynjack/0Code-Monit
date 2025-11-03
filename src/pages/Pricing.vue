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
            <router-link to="/support" class="nav-link">Support</router-link>
          </div>
        </div>
      </div>
    </nav>

    <section class="hero-section small">
      <div class="container-pro">
        <h1 class="page-title"><i class="fas fa-tags me-2"></i>Pricing</h1>
        <p class="page-subtitle">Simple and transparent pricing. Upgrade anytime.</p>
      </div>
    </section>

    <section class="content-section">
      <div class="container-pro">
        <div class="doc-grid">
          <div class="doc-card">
            <h3>Free</h3>
            <ul>
              <li>Up to 3 monitors</li>
              <li>5-minute intervals</li>
              <li>2 status pages</li>
              <li>Webhook notifications</li>
            </ul>
          </div>
          <div class="doc-card">
            <h3>Pro</h3>
            <ul>
              <li>Up to 50 monitors</li>
              <li>1-minute intervals</li>
              <li>Unlimited status pages</li>
              <li>Advanced analytics</li>
            </ul>
          </div>
          <div class="doc-card">
            <h3>Enterprise</h3>
            <ul>
              <li>Unlimited monitors</li>
              <li>30-second intervals</li>
              <li>White-label solution</li>
              <li>Dedicated support</li>
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
export default { name: 'PricingPage' };
</script>

<style scoped>
@import "./SharedModernStyles.css";
</style>
