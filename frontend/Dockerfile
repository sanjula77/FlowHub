# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for layer caching
COPY package*.json ./

# Install all dependencies
# --legacy-peer-deps needed because eslint-config-next@16 requires ESLint 9
# but the project uses ESLint 8 — this flag ignores the peer dep conflict
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Ensure public directory always exists (Git doesn't track empty directories)
RUN mkdir -p /app/public

# NEXT_PUBLIC_* vars are baked in at build time — pass via --build-arg in Choreo
ARG NEXT_PUBLIC_API_URL=https://bcf4980a-7849-4fca-99b1-fb7d5f04a3ea-dev.e1-us-east-azure.choreoapis.dev/flowhub/flowhub-backend/v1.0
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build Next.js in standalone mode (required for containerised deployments)
RUN npm run build

# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Copy the standalone server bundle produced by Next.js
COPY --from=builder /app/.next/standalone ./

# Copy static assets and public folder
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Run as non-root user for security
# UID must be between 10000-20000 per Choreo security policy (CKV_CHOREO_1)
RUN addgroup -g 10001 -S nodejs && \
    adduser -S nextjs -u 10001
USER 10001

# Choreo web applications default to port 8080
EXPOSE 8080
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
