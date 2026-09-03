# 0Code-Monit Deployment Guide

This guide covers deploying 0Code-Monit on **Render.com**, Docker, and local PM2 with reverse proxy.

## 🚀 Deploying to Render.com (Recommended Cloud Deployment)

### Method 1: Render Blueprint (1-Click)
1. Push your repository to GitHub.
2. In your Render Dashboard, click **New +** -> **Blueprint**.
3. Connect your `0Code-Monit` repository. Render will automatically detect [`render.yaml`](file:///d:/Projects/0code-monit/render.yaml).
4. Render will provision:
   - Web Service with Node.js runtime
   - 10GB Persistent Disk mounted at `/app/data`
   - Automated health checks on `/api/health`
   - SSL certificates on your custom domain

### Method 2: Manual Web Service on Render
1. Create a new **Web Service** on Render.
2. Set **Runtime**: `Node`.
3. Set **Build Command**: `npm install --legacy-peer-deps && npm run build`
4. Set **Start Command**: `node server/server.js`
5. Under **Disks**, add a persistent disk:
   - **Name**: `0code-monit-data`
   - **Mount Path**: `/app/data`
   - **Size**: 10 GB
6. Set **Environment Variables**:
   - `NODE_ENV`: `production`
   - `DATA_DIR`: `/app/data`
   - `CODE_MONIT_WS_ORIGIN_CHECK`: `cors-like`
   - `GOOGLE_CLIENT_ID`: (Optional for Google OAuth)
   - `GOOGLE_CLIENT_SECRET`: (Optional for Google OAuth)
   - `GOOGLE_REDIRECT_URI`: `https://<your-render-subdomain>.onrender.com/auth/google/callback`

---

## 🖥️ Local / VM Deployment (PM2 + Nginx)

- Node.js 18+ or 20.4+
- PM2 installed globally: `npm install -g pm2`
- Nginx installed and running
- Cloudflare Tunnel agent installed and configured
- Domain: `monit.0code.uk`

## Step 1: Build the Project

```bash
cd D:\Projects\0code-monit
npm ci --omit dev
npm run build
```

## Step 2: Start with PM2

### First Time Setup
```bash
# Create logs directory
mkdir -p logs

# Start the application with ecosystem config
pm2 start ecosystem.config.js

# Save PM2 process list for auto-restart on reboot
pm2 save
pm2 startup
```

### Manage the Process
```bash
# Check status
pm2 status

# View logs
pm2 logs 0Code-Monit

# Restart
pm2 restart 0Code-Monit

# Stop
pm2 stop 0Code-Monit

# Delete
pm2 delete 0Code-Monit
```

## Step 3: Configure Nginx

### Windows/WSL2:
Nginx config file location: Usually `C:\nginx\conf\nginx.conf` or via WSL

Add this to your nginx.conf or include the provided `nginx-0code-monit.conf`:

```nginx
include "path/to/nginx-0code-monit.conf";
```

### Test and Reload:
```bash
# Test configuration
nginx -t

# Reload
nginx -s reload
```

## Step 4: Configure Cloudflare Tunnel

### Edit tunnel config:
```bash
# Open your Cloudflare Tunnel config
nano ~/.cloudflared/config.yaml
```

Add the ingress rules from `cloudflare-tunnel-config.yaml`:

```yaml
ingress:
  - hostname: monit.0code.uk
    service: http://localhost:4010
    originRequest:
      httpHostHeader: monit.0code.uk
  - service: http_status:404
```

### Restart Cloudflare Tunnel:
```bash
cloudflared service restart
# or
systemctl restart cloudflared
```

## Step 5: Verify Setup

1. **Check PM2 process:**
   ```bash
   pm2 status
   ```

2. **Check Nginx:**
   ```bash
   curl http://localhost:4010
   ```

3. **Check Cloudflare Tunnel:**
   ```bash
   curl https://monit.0code.uk
   ```

4. **View logs:**
   ```bash
   # 0Code-Monit logs
   pm2 logs 0Code-Monit

   # Nginx logs
   tail -f /var/log/nginx/access.log
   tail -f /var/log/nginx/error.log

   # Cloudflare logs
   journalctl -u cloudflared -f
   ```

## Environment Variables

Key environment variables (already set in ecosystem.config.js):
- `NODE_ENV`: production
- `ZEROCODE_MONIT_PORT`: 4010
- `ZEROCODE_MONIT_HOST`: localhost

Optional variables:
- `ZEROCODE_MONIT_WS_ORIGIN_CHECK`: cors-like (default)

## Port Isolation

The configuration ensures 0Code-Monit runs on port 4010 only:
- PM2 manages the process independently
- Only Nginx and Cloudflare Tunnel can access it via reverse proxy
- Other Node.js/PM2 processes are unaffected

## Troubleshooting

### 0Code-Monit not starting
```bash
pm2 logs 0Code-Monit
# Check if port 4010 is already in use
netstat -an | grep 4010
```

### Nginx connection refused
```bash
curl -v http://localhost:4010
# Check if 0Code-Monit is running
pm2 status
```

### Cloudflare tunnel not working
```bash
# Check tunnel status
cloudflared tunnel list
cloudflared tunnel info 0code-monit
# View tunnel logs
journalctl -u cloudflared -f
```

### WebSocket connection issues
Ensure these headers are present in Nginx config:
```nginx
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
proxy_http_version 1.1;
```

## Backup

Important files to backup:
- `db/` - Database directory
- `logs/` - Application logs

```bash
# Create backup
cp -r db backup/db-$(date +%Y%m%d)
```

## References

- 0Code Monit Docs: https://github.com/oggynjack/0code-monit
- PM2 Docs: https://pm2.keymetrics.io/
- Cloudflare Tunnel Docs: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
