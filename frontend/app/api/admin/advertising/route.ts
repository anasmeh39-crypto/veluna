import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/admin-auth'
import { TrackingConfigError } from '@/lib/tracking/crypto'
import { getPlatformStatuses, listRecentDispatches } from '@/lib/tracking/log'
import {
  browserReady,
  getAdSettings,
  saveAdSettings,
  serverReady,
  toAdminView,
  type AdSettingsInput,
} from '@/lib/tracking/settings'
import { AD_PLATFORMS, type AdminAdSettingsView } from '@/lib/tracking/types'

export const dynamic = 'force-dynamic'

async function buildView(): Promise<AdminAdSettingsView> {
  const settings = await getAdSettings()
  const statuses = await getPlatformStatuses()

  for (const platform of AD_PLATFORMS) {
    statuses[platform].browser_ready = browserReady(settings, platform)
    statuses[platform].server_ready = serverReady(settings, platform)
  }

  return toAdminView(settings, statuses)
}

// GET /api/admin/advertising — masked settings + diagnostics
export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  try {
    const [settings, recent] = await Promise.all([buildView(), listRecentDispatches(15)])
    return NextResponse.json({ settings, recent })
  } catch (err) {
    console.error('[GET /api/admin/advertising]', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}

// PUT /api/admin/advertising — save settings
export async function PUT(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  let body: AdSettingsInput
  try {
    body = (await req.json()) as AdSettingsInput
  } catch {
    return NextResponse.json({ error: 'طلب غير صالح' }, { status: 400 })
  }

  try {
    const result = await saveAdSettings(body)
    if (!result.ok) {
      return NextResponse.json({ error: 'راجعي الخانات المحددة', issues: result.issues }, { status: 422 })
    }
    return NextResponse.json({ settings: await buildView() })
  } catch (err) {
    // Missing/!valid AD_TRACKING_ENCRYPTION_KEY — we refuse rather than store
    // a token in plaintext, and tell the admin exactly what to fix.
    if (err instanceof TrackingConfigError) {
      return NextResponse.json(
        {
          error:
            'ما تسجلاتش الإعدادات: مفتاح التشفير AD_TRACKING_ENCRYPTION_KEY ماشي مضبوط فالسيرفر. ' +
            'التوكن ما غاديش يتخزن بلا تشفير.',
          detail: err.message,
        },
        { status: 500 }
      )
    }
    console.error('[PUT /api/admin/advertising]', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
