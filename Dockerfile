# Multi-stage build for 0Code-Monit
# Production-ready Docker image

############################################
# Base Stage
############################################
FROM node:20-slim AS base

# Install dumb-init for proper signal handling and build tools for native modules
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    dumb-init \
    curl \
    ca-certificates \
    python3 \
    make \
    g++ && \
    rm -rf /var/lib/apt/lists/*

############################################
# Dependencies Stage
############################################
FROM base AS deps

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install production dependencies only (scripts needed for native modules like sqlite3)
RUN npm ci --omit=dev --legacy-peer-deps

############################################
# Build Stage
############################################
FROM base AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including dev dependencies)
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the frontend
RUN npm run build

############################################
# Production Stage
############################################
FROM base AS production

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production \
    CODE_MONIT_IS_CONTAINER=1 \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1

# Create node user if it doesn't exist
RUN groupadd -g 1000 node || true && \
    useradd -u 1000 -g node -s /bin/bash -m node || true

# Copy dependencies from deps stage
COPY --from=deps --chown=node:node /app/node_modules ./node_modules

# Copy built application from builder stage
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/public ./public

# Copy application code
COPY --chown=node:node server ./server
COPY --chown=node:node src ./src
COPY --chown=node:node extra ./extra
COPY --chown=node:node package.json ./
COPY --chown=node:node .env* ./

# Create data directory with correct permissions
RUN mkdir -p ./data ./db && \
    chown -R node:node ./data ./db

# Switch to non-root user
USER node

# Expose port
EXPOSE 4010

# Health check — use the .js script, not the .go source file
HEALTHCHECK --interval=60s --timeout=30s --start-period=180s --retries=5 \
    CMD node extra/healthcheck.js || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Start the application
CMD ["node", "server/server.js"]
