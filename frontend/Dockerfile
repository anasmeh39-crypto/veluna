# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

# better-sqlite3 needs Python + C++ build tools for native compilation
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Install dependencies first (layer cache)
COPY package.json package-lock.json ./
RUN npm ci

# Ensure public dir exists even if empty
RUN mkdir -p /app/public

# Copy source and build
COPY . .
RUN npm run build

# ── Stage 2: Production image ─────────────────────────────────────────────────
FROM node:20-alpine AS runner

RUN apk add --no-cache python3 make g++

WORKDIR /app

ENV NODE_ENV=production

# Copy built app and production dependencies
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Create the data directory (SQLite lives here)
# Mount a persistent volume at /app/data in Easypanel
RUN mkdir -p /app/data

EXPOSE 3000

CMD ["node_modules/.bin/next", "start", "-p", "3000"]
