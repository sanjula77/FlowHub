# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for layer caching
COPY package*.json ./

# Install ALL dependencies (including devDependencies needed for the build)
RUN npm ci

# Copy source code
COPY . .

# Compile TypeScript → dist/
RUN npm run build

# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Copy compiled output from builder stage
COPY --from=builder /app/dist ./dist

# Run as non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001
USER nestjs

# Choreo / Kubernetes will inject PORT — default to 3001
EXPOSE 3001

CMD ["node", "dist/main"]
