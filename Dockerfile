# =============================================================================
# Stage 1: Base - Dependencies
# =============================================================================
FROM node:26-alpine AS base

# Install corepack first (required for pnpm management)
RUN npm install -g pnpm@11.1.2

# Create app directory
WORKDIR /usr/src/app

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml ./

# =============================================================================
# Stage 2: Dependencies - Install production dependencies
# =============================================================================
FROM base AS deps

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Install dependencies (skip prepare script to avoid husky in prod)
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# =============================================================================
# Stage 3: Builder - Build the application
# =============================================================================
FROM base AS builder

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

# Install dev dependencies for building
RUN pnpm install --frozen-lockfile --ignore-scripts

# Install types (needed for build)
RUN pnpm install -D @types/pg --ignore-scripts

# Copy source code
COPY . .

# Build the application using npx
RUN npx @nestjs/cli build

# =============================================================================
# Stage 4: Production - Minimal runtime image
# =============================================================================
FROM base AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV} \
    PORT=3000 \
    NODE_OPTIONS="--max-old-space-size=256"

# Security: Create non-root user and group
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup -s /bin/sh

# Set working directory
WORKDIR /usr/src/app

# Copy built artifacts
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json

# Create necessary directories with proper ownership
RUN mkdir -p uploads logs && \
    chown -R appuser:appgroup /usr/src/app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))" || exit 1

# Start the application
CMD ["node", "dist/main.js"]

# =============================================================================
# Stage 5: Development - Local development environment
# =============================================================================
FROM base AS development

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

# Install development dependencies
RUN pnpm install --frozen-lockfile --ignore-scripts

# Install development tools
RUN apk add --no-cache dumb-init curl

# Copy source code for development
COPY . .

# Expose ports
EXPOSE 3000 9229

# Use dumb-init to handle signals properly
CMD ["dumb-init", "pnpm", "run", "dev"]
