# Multi-stage Dockerfile for Reply Speed Insights
# Optimized for microservices architecture

# Base stage with dependencies
FROM node:24-alpine AS base
WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++ py3-setuptools

# Install pnpm globally
RUN npm install -g pnpm@8

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies with frozen lockfile
RUN pnpm install --frozen-lockfile --prod=false

# Build stage
FROM base AS build
WORKDIR /app

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Production stage
FROM node:24-alpine AS production
WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++ py3-setuptools py3-setuptools

# Install pnpm
RUN npm install -g pnpm@8

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY .env.local ./.env.local

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Remove build dependencies to reduce image size
RUN apk del python3 make g++

# Copy built application from build stage

COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.js ./
COPY --from=build /app/next-env.d.ts ./

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Expose port
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]