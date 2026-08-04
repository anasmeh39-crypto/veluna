import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/admin-auth'
import { sendTestEvent } from '@/lib/tracking/server'
import { AD_PLATFORMS, type AdPlatform } from '@/lib/tracking/types'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/advertising/test — sends a synthetic server-side event.
 *
 * The credentials never leave the server: the browser only names a platform and
 * receives a pass/fail result.
 */
export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  let platform: AdPlatform
  try {
    const body = (await req.json()) as { platform?: string }
    platform = body.platform as AdPlatform
  } catch {
    return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 })
  }

  if (!AD_PLATFORMS.includes(platform)) {
    return NextResponse.json({ error: 'منصة غير معروفة' }, { status: 400 })
  }

  try {
    const result = await sendTestEvent(platform)
    return NextResponse.json({ result })
  } catch (err) {
    console.error('[POST /api/admin/advertising/test]', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
