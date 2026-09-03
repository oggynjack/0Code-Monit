# Docker Deployment Guide for 0Code-Monit

This guide covers deploying 0Code-Monit using Docker and Docker Compose.

## Quick Start

### Option 1: Using Docker Compose (Recommended)

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down

# Stop and remove volumes (WARNING: This deletes all data)
docker-compose down -v
```

### Option 2: Using Docker CLI

```bash
# Build the image
docker build -t 0code-monit:latest .

# Run the container
docker run -d \
  --name 0code-monit \
  --restart unless-stopped \
  -p 3001:3001 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/db:/app/db \
  -e NODE_ENV=production \
  0code-monit:latest

# View logs
docker logs -f 0code-monit

# Stop and remove
docker stop 0code-monit
docker rm 0code-monit
```

## Configuration

### Environment Variables

You can configure the application using environment variables in `docker-compose.yml`:

```yaml
environment:
  - NODE_ENV=production
  - CODE_MONIT_IS_CONTAINER=1
  - PORT=3001  # Optional: Override default port
  - SMTP_HOST=smtp.example.com  # Optional: Email settings
  - SMTP_PORT=587
  - SMTP_USER=user@example.com
  - SMTP_PASS=yourpassword
```

### Volumes

The application uses two important volumes for data persistence:

- `./data:/app/data` - Application data and configuration
- `./db:/app/db` - SQLite database files

**IMPORTANT:** Always back up these directories before upgrading!

### Ports

By default, the application listens on port 3001. You can change the host port mapping:

```yaml
ports:
  - "8080:3001"  # Access via http://localhost:8080
```

## Building the Image

### Development Build

```bash
docker build --target production -t 0code-monit:dev .
```

### Production Build with Custom Tag

```bash
docker build -t 0code-monit:1.0.2 .
```

### Multi-platform Build (requires buildx)

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t 0code-monit:latest \
  --push .
```

## Deployment Scenarios

### 1. Development Environment

```yaml
services:
  0code-monit:
    build: .
    ports:
      - "3001:3001"
    volumes:
      - ./data:/app/data
      - ./db:/app/db
    environment:
      - NODE_ENV=development
```

### 2. Production with Nginx Reverse Proxy

```yaml
services:
  0code-monit:
    build: .
    expose:
      - "3001"
    environment:
      - NODE_ENV=production
    networks:
      - internal

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    networks:
      - internal
    depends_on:
      - 0code-monit

networks:
  internal:
```

### 3. Production with Resource Limits

```yaml
services:
  0code-monit:
    build: .
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

## Maintenance

### Viewing Logs

```bash
# All logs
docker-compose logs

# Follow logs
docker-compose logs -f

# Logs from specific service
docker-compose logs -f 0code-monit

# Last 100 lines
docker-compose logs --tail=100
```

### Updating the Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Or using Docker CLI
docker stop 0code-monit
docker rm 0code-monit
docker build -t 0code-monit:latest .
docker run -d --name 0code-monit ... (your run command)
```

### Backing Up Data

```bash
# Create backup directory
mkdir -p backups/$(date +%Y%m%d)

# Backup data and database
cp -r data backups/$(date +%Y%m%d)/
cp -r db backups/$(date +%Y%m%d)/

# Or create a tarball
tar -czf backups/0code-monit-backup-$(date +%Y%m%d).tar.gz data db
```

### Restoring from Backup

```bash
# Stop the container
docker-compose down

# Restore data
rm -rf data db
cp -r backups/20250111/data .
cp -r backups/20250111/db .

# Or extract from tarball
tar -xzf backups/0code-monit-backup-20250111.tar.gz

# Start the container
docker-compose up -d
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs

# Check if port is already in use
netstat -tulpn | grep 3001  # Linux
netstat -ano | findstr :3001  # Windows

# Check container status
docker ps -a
```

### Permission Issues

If you encounter permission errors with volumes:

```bash
# Fix ownership (Linux/Mac)
sudo chown -R 1000:1000 data db

# Or run container as root (not recommended for production)
docker-compose run --user root 0code-monit
```

### Database Corruption

```bash
# Stop container
docker-compose down

# Backup current database
cp -r db db.backup

# Restore from backup or start fresh
rm -rf db/*

# Restart
docker-compose up -d
```

### High Memory Usage

Adjust memory limits in `docker-compose.yml`:

```yaml
deploy:
  resources:
    limits:
      memory: 256M  # Reduce if needed
```

## Health Check

The container includes a health check that runs every 60 seconds:

```bash
# Check health status
docker inspect --format='{{.State.Health.Status}}' 0code-monit

# View health check logs
docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{end}}' 0code-monit
```

## Security Considerations

1. **Never commit `.env` files** with sensitive data to version control
2. **Use Docker secrets** for production deployments
3. **Run as non-root user** (already configured in Dockerfile)
4. **Keep images updated** with security patches
5. **Use HTTPS** in production with reverse proxy
6. **Limit container resources** to prevent DoS

## Performance Optimization

1. **Use Docker volumes** instead of bind mounts for better performance on Windows/Mac
2. **Limit logs** by configuring log rotation
3. **Use multi-stage builds** (already implemented)
4. **Enable BuildKit** for faster builds:
   ```bash
   export DOCKER_BUILDKIT=1
   docker build .
   ```

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure proper volume backups
- [ ] Set up reverse proxy (Nginx/Traefik)
- [ ] Enable HTTPS/SSL
- [ ] Configure resource limits
- [ ] Set up monitoring and alerts
- [ ] Enable log rotation
- [ ] Document recovery procedures
- [ ] Test backup and restore process

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [0Code-Monit GitHub](https://github.com/oggynjack/0code-monit)
