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
# UID must be between 10000-20000 per Choreo security policy (CKV_CHOREO_1)
RUN addgroup -g 10001 -S nodejs && \
    adduser -S nestjs -u 10001
USER 10001

# Choreo / Kubernetes will inject PORT — default to 3001
EXPOSE 3001

CMD ["node", "dist/main"]
