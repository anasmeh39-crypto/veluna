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
    const required = ['ADMIN_PASSWORD', 'ADMIN_SECRET_TOKEN', 'DATABASE_URL']
    const missing = required.filter((key) => !process.env[key])
    if (missing.length > 0) {
      throw new Error(
        `[Veluna] Missing required environment variables: ${missing.join(', ')}\n` +
        `Add them in Easypanel → veluna → backend → Environment tab.`
      )
    }
  }
  return nextConfig
}