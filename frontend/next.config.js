const { PHASE_PRODUCTION_BUILD } = require('next/constants')

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
}

module.exports = (phase) => {
  // Validate critical env vars at server startup only — not during build.
  if (phase !== PHASE_PRODUCTION_BUILD && process.env.NODE_ENV === 'production') {
    const required = ['ADMIN_PASSWORD', 'ADMIN_SECRET_TOKEN']
    const missing = required.filter((key) => !process.env[key])
    if (missing.length > 0) {
      throw new Error(
        `[Veluna] Missing required environment variables: ${missing.join(', ')}\n` +
        `Add them in Easypanel → veluna → backend → Environment tab.`
      )
    }
    // DATABASE_URL is strongly recommended but not fatal: without it (or if
    // Postgres is unreachable) orders fall back to a local store so the site
    // keeps taking orders. Set it for durable storage.
    if (!process.env.DATABASE_URL) {
      console.warn('[Veluna] DATABASE_URL is not set — orders will use the fallback store (not durable across redeploys).')
    }
  }
  return nextConfig
}