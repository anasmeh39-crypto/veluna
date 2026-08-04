import type { NextRequest } from 'next/server'
import { safeEqual } from './tracking/crypto'

/**
 * Admin session check for API routes.
 *
 * Mirrors middleware.ts (which only covers /admin pages) — every admin API
 * route must call this itself. Comparison is constant-time.
 */
export function isAdminRequest(req: NextRequest): boolean {
  const token = req.cookies.get('admin_token')?.value
  const expected = process.env.ADMIN_SECRET_TOKEN
  if (!expected || !token) return false
  return safeEqual(token, expected)
}
