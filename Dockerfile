# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

# better-sqlite3 requires Python + C++ build tools for native compilation
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Install dependencies first (better layer caching)
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Copy all frontend source and build
COPY frontend/ .
RUN npm run build

# ── Stage 2: Production image ─────────────────────────────────────────────────
FROM node:20-alpine AS runner

RUN apk add --no-cache python3 make g++

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# SQLite database lives here — mount a persistent volume at /app/data in Easypanel
RUN mkdir -p /app/data

EXPOSE 3000

CMD ["node_modules/.bin/next", "start", "-p", "3000"]
