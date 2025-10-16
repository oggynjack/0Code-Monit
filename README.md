<div align="center" width="100%">
  <img src="public/icon-512x512.png" width="128" alt="0Code-Monit" />
</div>

# 0Code-Monit

> Self-hosted monitoring with beautiful status pages, fast UI, and rich notifications.

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Inter&weight=600&size=24&pause=1200&color=00C2A8&center=true&vCenter=true&width=700&lines=Self-hosted+Monitoring;HTTP%2C+TCP%2C+Ping%2C+MQTT%2C+SMTP;Status+Pages+%26+Uptime+Charts;Powerful+Alerts+%26+Integrations" alt="typing" />
</p>

<p align="center">
  <a href="https://github.com/oggynjack/0Code-Monit"><img alt="Stars" src="https://img.shields.io/github/stars/oggynjack/0Code-Monit?style=flat" /></a>
  <a href="https://github.com/oggynjack/0Code-Monit/releases"><img alt="Release" src="https://img.shields.io/github/v/release/oggynjack/0Code-Monit?include_prereleases&sort=semver" /></a>
  <a href="https://github.com/oggynjack/0Code-Monit/actions"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/oggynjack/0Code-Monit/auto-release.yml?branch=main&label=auto-release" /></a>
  <a href="LICENSE"><img alt="License" src="https://img.shields.io/github/license/oggynjack/0Code-Monit" /></a>
</p>

<p align="center">
  <img alt="200 OK" src="https://img.shields.io/badge/HTTP-200%20OK-2ea44f?labelColor=1b1f23" />
  <img alt="404" src="https://img.shields.io/badge/HTTP-404-ffcc00?labelColor=1b1f23" />
  <img alt="500" src="https://img.shields.io/badge/HTTP-500-ea4a5a?labelColor=1b1f23" />
  <img alt="PING" src="https://img.shields.io/badge/PING-live-00c2a8?labelColor=1b1f23&logo=sonarcloud&logoColor=white" />
</p>

## ⭐ Features

- HTTP(S) / TCP / Keyword / JSON Query / Ping / DNS / Push / Steam game server / Docker containers
- Beautiful, reactive UI/UX with charts and dark mode
- 90+ Notification providers (Telegram, Discord, Slack, Email/SMTP, etc.)
- 20-second intervals
- Multi-language support
- Multiple status pages and custom domains
- SSL certificate info, proxy support, and 2FA

## 🔧 Quick Start

### 🐳 Docker

```bash path=null start=null
docker run -d --restart=unless-stopped \
  -p 3001:3001 \
  -v 0code-monit:/app/data \
  --name 0code-monit \
  oggynjack/0code-monit:1.0.1
```

> File systems like NFS are not supported for the data volume. Use a local path or Docker volume.

### 💪 Non-Docker

Requirements: Node.js 20, npm 9, Git, PM2 (recommended)

```bash path=null start=null
git clone https://github.com/oggynjack/0Code-Monit.git
cd 0Code-Monit
npm run setup
# Try it
node server/server.js
# Or run in background with PM2
npm i -g pm2 && pm2 install pm2-logrotate
pm2 start server/server.js --name 0code-monit
```

0Code-Monit will be available at http://localhost:3001

## 📸 Screenshots

Light Mode:

![Dashboard](https://github.com/user-attachments/assets/76e47ac9-fb5d-4961-8cd8-9137ab80fcaf)

Status Page:

![Status Page](https://github.com/user-attachments/assets/35edf031-f502-4f68-bffc-1b51b06aef01)

Settings:

![Settings](https://github.com/user-attachments/assets/dee407b6-a63d-4eaf-a8e2-ecf588b19c9a)

## 🌐 Translations

Want to translate? See [src/lang/README.md](src/lang/README.md).

## ✍️ Spelling & Grammar

PRs improving documentation wording are welcome.
