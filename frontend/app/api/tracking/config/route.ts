import { NextResponse } from 'next/server'
import { getAdSettings, toPublicConfig } from '@/lib/tracking/settings'
import { EMPTY_PUBLIC_CONFIG } from '@/lib/tracking/types'

export const dynamic = 'force-dynamic'

/**
 * Public pixel config for the browser: enable flags and pixel IDs only.
 *
 * Access tokens are never part of this response — they exist only inside the
 * server process. A short cache keeps this off the hot path while still letting
 * an admin change take effect within a minute.
 */
export async function GET() {
  try {
    const settings = await getAdSettings()
    return NextResponse.json(
      { config: toPublicConfig(settings) },
      { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
    )
  } catch (err) {
    console.error('[GET /api/tracking/config]', err instanceof Error ? err.message : err)
    // Fail closed: no config means no pixels, never a broken page.
    return NextResponse.json({ config: EMPTY_PUBLIC_CONFIG })
  }
}
