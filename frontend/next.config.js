/** @type {import('next').NextConfig} */

// Fail fast in production if critical env vars are missing.
// This surfaces a clear error at container startup instead of a silent runtime failure.
if (process.env.NODE_ENV === 'production') {
  const required = ['ADMIN_PASSWORD', 'ADMIN_SECRET_TOKEN']
  const missing = required.filter((key) => !process.env[key])
  if (missing.length > 0) {
    throw new Error(
      `[Veluna] Missing required environment variables: ${missing.join(', ')}\n` +
      `Add them in Easypanel → veluna → backend → Environment tab.`
    )
  }
}

const nextConfig = {
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
