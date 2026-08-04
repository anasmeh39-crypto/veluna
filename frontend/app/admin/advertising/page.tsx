'use client'

// Admin → الإعلانات والبكسلات
//
// Configure the browser pixels and the server-side conversion APIs for Meta,
// TikTok and Snapchat. Access tokens are write-only from here: the API only
// ever returns a masked preview, and an empty token field means "keep what is
// already stored".

import { useCallback, useEffect, useState } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import {
  PURCHASE_MILESTONES,
  type AdminAdSettingsView,
  type AdPlatform,
  type PurchaseMilestone,
} from '@/lib/tracking/types'

interface DispatchRow {
  event_key: string
  order_id: string | null
  platform: string
  event_name: string
  status: string
  attempts: number
  error: string | null
  updated_at: string
}

interface Issue {
  field: string
  message: string
}

interface TestResult {
  status: string
  reason?: string
  trace?: string
}

const MILESTONE_LABELS: Record<PurchaseMilestone, string> = {
  order_created: 'عند إرسال الطلب (موصى به)',
  confirmed: 'عند تأكيد الطلب',
  delivered: 'عند التوصيل',
}

const MILESTONE_HINTS: Record<PurchaseMilestone, string> = {
  order_created:
    'الإشارة كتوصل للمنصات فالحين — أحسن حاجة لتعلّم الخوارزمية. كتدخل فيها حتى الطلبات اللي غادي تتلغى من بعد.',
  confirmed: 'إشارة أنقى، ولكن كتوصل متأخرة (ساعات) وكتنقص من دقة النسب للإعلان.',
  delivered:
    'أنقى إشارة (فلوس حقيقية)، ولكن التأخير ديال أيام كيخرج برا نافذة الإسناد ديال المنصات.',
}

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  hint?: string
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 mt-0.5 ${
          checked ? 'bg-veluna-plum' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
            checked ? 'start-0.5' : 'start-[22px]'
          }`}
        />
      </button>
      <span>
        <span className="block text-sm font-semibold text-veluna-dark">{label}</span>
        {hint && <span className="block text-xs text-veluna-muted mt-0.5">{hint}</span>}
      </span>
    </label>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  error,
  hint,
  type = 'text',
  dir = 'ltr',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  error?: string
  hint?: string
  type?: string
  dir?: 'ltr' | 'rtl'
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-veluna-text mb-1.5">{label}</label>
      <input
        type={type}
        dir={dir}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`input-field py-2.5 text-sm ${error ? 'border-red-400 ring-1 ring-red-400' : ''}`}
      />
      {hint && !error && <p className="text-[11px] text-veluna-muted mt-1">{hint}</p>}
      {error && <p className="text-[11px] text-red-600 mt-1">{error}</p>}
    </div>
  )
}

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full ${
        ok ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-green-600' : 'bg-gray-400'}`} />
      {label}
    </span>
  )
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('ar-MA', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export default function AdvertisingPage() {
  const [view, setView] = useState<AdminAdSettingsView | null>(null)
  const [recent, setRecent] = useState<DispatchRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<AdPlatform | 'general' | null>(null)
  const [testing, setTesting] = useState<AdPlatform | null>(null)
  const [issues, setIssues] = useState<Issue[]>([])
  const [banner, setBanner] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const [testResults, setTestResults] = useState<Partial<Record<AdPlatform, TestResult>>>({})

  // Token inputs are kept apart from `view` — they are write-only.
  const [tokens, setTokens] = useState<Record<AdPlatform, string>>({ meta: '', tiktok: '', snapchat: '' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/advertising')
      if (res.status === 401) { window.location.href = '/admin/login'; return }
      const data = await res.json()
      setView(data.settings ?? null)
      setRecent(data.recent ?? [])
    } catch {
      setBanner({ kind: 'error', text: 'ما قدرناش نجيبو الإعدادات. عاودي المحاولة.' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function issueFor(field: string): string | undefined {
    return issues.find((i) => i.field === field)?.message
  }

  function patch<K extends 'meta' | 'tiktok' | 'snapchat'>(
    platform: K,
    changes: Partial<AdminAdSettingsView[K]>
  ) {
    setView((v) => (v ? { ...v, [platform]: { ...v[platform], ...changes } } : v))
  }

  async function save(section: AdPlatform | 'general') {
    if (!view) return
    setSaving(section)
    setIssues([])
    setBanner(null)

    const tokenValue = (p: AdPlatform) => (tokens[p] ? tokens[p] : undefined)

    const payload: Record<string, unknown> =
      section === 'general'
        ? {
            purchase_milestone: view.purchase_milestone,
            lifecycle_events_enabled: view.lifecycle_events_enabled,
          }
        : section === 'meta'
        ? {
            meta: {
              pixel_enabled: view.meta.pixel_enabled,
              pixel_id: view.meta.pixel_id,
              capi_enabled: view.meta.capi_enabled,
              api_version: view.meta.api_version,
              test_event_code: view.meta.test_event_code,
              dataset_id: view.meta.dataset_id,
              access_token: tokenValue('meta'),
            },
          }
        : section === 'tiktok'
        ? {
            tiktok: {
              pixel_enabled: view.tiktok.pixel_enabled,
              pixel_code: view.tiktok.pixel_code,
              events_api_enabled: view.tiktok.events_api_enabled,
              test_event_code: view.tiktok.test_event_code,
              access_token: tokenValue('tiktok'),
            },
          }
        : {
            snapchat: {
              pixel_enabled: view.snapchat.pixel_enabled,
              pixel_id: view.snapchat.pixel_id,
              capi_enabled: view.snapchat.capi_enabled,
              test_event_code: view.snapchat.test_event_code,
              access_token: tokenValue('snapchat'),
            },
          }

    try {
      const res = await fetch('/api/admin/advertising', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (res.status === 401) { window.location.href = '/admin/login'; return }
      if (res.status === 422) {
        setIssues(data.issues ?? [])
        setBanner({ kind: 'error', text: data.error ?? 'راجعي الخانات' })
        return
      }
      if (!res.ok) {
        setBanner({ kind: 'error', text: data.error ?? 'وقع خطأ فالتسجيل' })
        return
      }

      setView(data.settings)
      if (section !== 'general') setTokens((t) => ({ ...t, [section]: '' }))
      setBanner({ kind: 'ok', text: 'تسجلات الإعدادات ✓' })
    } catch {
      setBanner({ kind: 'error', text: 'وقع خطأ فالاتصال' })
    } finally {
      setSaving(null)
    }
  }

  async function runTest(platform: AdPlatform) {
    setTesting(platform)
    setTestResults((r) => ({ ...r, [platform]: undefined }))
    try {
      const res = await fetch('/api/admin/advertising/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      })
      const data = await res.json()
      setTestResults((r) => ({
        ...r,
        [platform]: data.result ?? { status: 'failed', reason: data.error ?? 'خطأ غير معروف' },
      }))
      load()
    } catch {
      setTestResults((r) => ({ ...r, [platform]: { status: 'failed', reason: 'خطأ فالاتصال' } }))
    } finally {
      setTesting(null)
    }
  }

  if (loading || !view) {
    return (
      <div className="min-h-screen bg-veluna-cream">
        <AdminHeader />
        <div className="p-6 text-center text-veluna-muted text-sm">جاري التحميل...</div>
      </div>
    )
  }

  const platformCards: {
    key: AdPlatform
    title: string
    accent: string
    idLabel: string
    idValue: string
    idField: string
    idPlaceholder: string
    onIdChange: (v: string) => void
    pixelEnabled: boolean
    onPixelToggle: (v: boolean) => void
    serverEnabled: boolean
    onServerToggle: (v: boolean) => void
    serverLabel: string
    testCode: string
    onTestCodeChange: (v: string) => void
    extra?: React.ReactNode
  }[] = [
    {
      key: 'meta',
      title: 'Meta / Facebook',
      accent: 'bg-[#1877F2]',
      idLabel: 'Meta Pixel ID',
      idValue: view.meta.pixel_id,
      idField: 'meta.pixel_id',
      idPlaceholder: '123456789012345',
      onIdChange: (v) => patch('meta', { pixel_id: v }),
      pixelEnabled: view.meta.pixel_enabled,
      onPixelToggle: (v) => patch('meta', { pixel_enabled: v }),
      serverEnabled: view.meta.capi_enabled,
      onServerToggle: (v) => patch('meta', { capi_enabled: v }),
      serverLabel: 'Conversions API (سيرفر)',
      testCode: view.meta.test_event_code,
      onTestCodeChange: (v) => patch('meta', { test_event_code: v }),
      extra: (
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="نسخة API"
            value={view.meta.api_version}
            onChange={(v) => patch('meta', { api_version: v })}
            placeholder="v23.0"
            error={issueFor('meta.api_version')}
          />
          <Field
            label="Dataset ID (اختياري)"
            value={view.meta.dataset_id}
            onChange={(v) => patch('meta', { dataset_id: v })}
            placeholder="خليها خاوية إلا ما كنتيش عارفة"
            error={issueFor('meta.dataset_id')}
          />
        </div>
      ),
    },
    {
      key: 'tiktok',
      title: 'TikTok',
      accent: 'bg-black',
      idLabel: 'TikTok Pixel Code',
      idValue: view.tiktok.pixel_code,
      idField: 'tiktok.pixel_code',
      idPlaceholder: 'CXXXXXXXXXXXXXXXXXXX',
      onIdChange: (v) => patch('tiktok', { pixel_code: v }),
      pixelEnabled: view.tiktok.pixel_enabled,
      onPixelToggle: (v) => patch('tiktok', { pixel_enabled: v }),
      serverEnabled: view.tiktok.events_api_enabled,
      onServerToggle: (v) => patch('tiktok', { events_api_enabled: v }),
      serverLabel: 'Events API (سيرفر)',
      testCode: view.tiktok.test_event_code,
      onTestCodeChange: (v) => patch('tiktok', { test_event_code: v }),
    },
    {
      key: 'snapchat',
      title: 'Snapchat',
      accent: 'bg-[#FFFC00]',
      idLabel: 'Snap Pixel ID',
      idValue: view.snapchat.pixel_id,
      idField: 'snapchat.pixel_id',
      idPlaceholder: '00000000-0000-0000-0000-000000000000',
      onIdChange: (v) => patch('snapchat', { pixel_id: v }),
      pixelEnabled: view.snapchat.pixel_enabled,
      onPixelToggle: (v) => patch('snapchat', { pixel_enabled: v }),
      serverEnabled: view.snapchat.capi_enabled,
      onServerToggle: (v) => patch('snapchat', { capi_enabled: v }),
      serverLabel: 'Conversions API (سيرفر)',
      testCode: view.snapchat.test_event_code,
      onTestCodeChange: (v) => patch('snapchat', { test_event_code: v }),
    },
  ]

  return (
    <div className="min-h-screen bg-veluna-cream pb-16">
      <AdminHeader />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        <div>
          <h2 className="text-xl font-extrabold text-veluna-dark">الإعلانات والبكسلات</h2>
          <p className="text-xs text-veluna-muted mt-1">
            دخّلي غير المعرّفات والتوكنات — الكود ديال البكسل كيتزاد بوحدو فالموقع.
            آخر تحديث: {formatDate(view.updated_at)}
          </p>
        </div>

        {!view.encryption.ok && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-800">
            <p className="font-bold mb-1">مشكل فالإعداد: التوكنات ما يمكنش تتسجل</p>
            <p className="text-xs leading-relaxed">{view.encryption.error}</p>
            <p className="text-xs mt-2">
              زيدي <code className="bg-red-100 px-1 rounded">AD_TRACKING_ENCRYPTION_KEY</code> فالسيرفر
              (<code className="bg-red-100 px-1 rounded">openssl rand -hex 32</code>) وعاودي بدّلي الخدمة.
            </p>
          </div>
        )}

        {banner && (
          <div
            className={`rounded-2xl p-3.5 text-sm ${
              banner.kind === 'ok'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {banner.text}
          </div>
        )}

        {/* ── Diagnostics ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-veluna-petal p-5">
          <h3 className="font-bold text-veluna-dark text-sm mb-3">التشخيص</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {platformCards.map((p) => {
              const s = view.status[p.key]
              return (
                <div key={p.key} className="border border-veluna-petal rounded-xl p-3">
                  <p className="font-bold text-veluna-dark text-xs mb-2">{p.title}</p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <StatusPill ok={s.browser_ready} label="بكسل المتصفح" />
                    <StatusPill ok={s.server_ready} label="سيرفر API" />
                  </div>
                  <p className="text-[11px] text-veluna-muted">
                    آخر إرسال ناجح: {formatDate(s.last_success_at)}
                  </p>
                  {s.last_error && (
                    <p className="text-[11px] text-red-600 mt-1 break-words">
                      آخر خطأ ({formatDate(s.last_error_at)}): {s.last_error}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Platform cards ──────────────────────────────────────── */}
        {platformCards.map((p) => {
          const masked = view[p.key].access_token
          const result = testResults[p.key]
          return (
            <div key={p.key} className="bg-white rounded-2xl border border-veluna-petal p-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${p.accent}`} />
                <h3 className="font-extrabold text-veluna-dark">{p.title}</h3>
                <div className="ms-auto flex gap-1.5">
                  <StatusPill ok={view.status[p.key].browser_ready} label="متصفح" />
                  <StatusPill ok={view.status[p.key].server_ready} label="سيرفر" />
                </div>
              </div>

              <div className="space-y-3">
                <Toggle
                  checked={p.pixelEnabled}
                  onChange={p.onPixelToggle}
                  label="تفعيل بكسل المتصفح"
                  hint="كيزيد سكريبت البكسل فالموقع ويرسل PageView و ViewContent و AddToCart..."
                />
                <Field
                  label={p.idLabel}
                  value={p.idValue}
                  onChange={p.onIdChange}
                  placeholder={p.idPlaceholder}
                  error={issueFor(p.idField)}
                />
              </div>

              {p.extra}

              <div className="border-t border-veluna-petal pt-4 space-y-3">
                <Toggle
                  checked={p.serverEnabled}
                  onChange={p.onServerToggle}
                  label={p.serverLabel}
                  hint="كيرسل الأحداث من السيرفر — كيتجاوز حاجزات الإعلانات ويحسّن جودة الإسناد."
                />

                <div>
                  <label className="block text-xs font-semibold text-veluna-text mb-1.5">
                    Access Token
                  </label>
                  {masked.configured && (
                    <p className="text-[11px] text-veluna-muted mb-1.5 font-mono" dir="ltr">
                      {masked.preview}
                    </p>
                  )}
                  <input
                    type="password"
                    dir="ltr"
                    autoComplete="new-password"
                    value={tokens[p.key]}
                    placeholder={masked.configured ? 'خليها خاوية باش تبقى كيف ما هي' : 'الصقي التوكن هنا'}
                    onChange={(e) => setTokens((t) => ({ ...t, [p.key]: e.target.value }))}
                    className={`input-field py-2.5 text-sm ${
                      issueFor(`${p.key}.access_token`) ? 'border-red-400 ring-1 ring-red-400' : ''
                    }`}
                  />
                  {issueFor(`${p.key}.access_token`) ? (
                    <p className="text-[11px] text-red-600 mt-1">{issueFor(`${p.key}.access_token`)}</p>
                  ) : (
                    <p className="text-[11px] text-veluna-muted mt-1">
                      التوكن كيتخزن مشفّر (AES-256-GCM) وما كيوصلش أبداً للمتصفح.
                      {masked.configured && ' باش تمسحيه، كتبي __CLEAR__.'}
                    </p>
                  )}
                </div>

                <Field
                  label="رمز حدث الاختبار (اختياري)"
                  value={p.testCode}
                  onChange={p.onTestCodeChange}
                  placeholder="TEST12345"
                  error={issueFor(`${p.key}.test_event_code`)}
                />
              </div>

              {result && (
                <div
                  className={`rounded-xl p-3 text-xs ${
                    result.status === 'sent'
                      ? 'bg-green-50 border border-green-200 text-green-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}
                >
                  {result.status === 'sent'
                    ? `الحدث التجريبي تبعث بنجاح ✓${result.trace ? ` (trace: ${result.trace})` : ''}`
                    : `ما تبعثش: ${result.reason ?? result.status}`}
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => save(p.key)}
                  disabled={saving === p.key}
                  className="bg-veluna-plum text-white text-sm font-bold px-5 py-2.5 rounded-xl
                             hover:bg-[#653156] active:scale-[0.97] transition-all disabled:opacity-60"
                >
                  {saving === p.key ? 'كيتسجل...' : 'سجّلي'}
                </button>
                <button
                  type="button"
                  onClick={() => runTest(p.key)}
                  disabled={testing === p.key || !view.status[p.key].server_ready}
                  title={!view.status[p.key].server_ready ? 'فعّلي API ديال السيرفر وسجّلي التوكن أولاً' : ''}
                  className="border-2 border-veluna-plum text-veluna-plum text-sm font-bold px-5 py-2.5
                             rounded-xl hover:bg-veluna-blush active:scale-[0.97] transition-all
                             disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {testing === p.key ? 'كيتبعت...' : 'بعثي حدث تجريبي'}
                </button>
              </div>
            </div>
          )
        })}

        {/* ── Conversion model ────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-veluna-petal p-5 space-y-4">
          <div>
            <h3 className="font-extrabold text-veluna-dark">نموذج التحويل (الدفع عند الاستلام)</h3>
            <p className="text-xs text-veluna-muted mt-1">
              فوقاش كيتبعث حدث Purchase. كيتبعث مرة وحدة لكل طلب مهما كان الاختيار.
            </p>
          </div>

          <div className="space-y-2">
            {PURCHASE_MILESTONES.map((m) => (
              <label
                key={m}
                className={`flex items-start gap-3 border-2 rounded-xl p-3 cursor-pointer transition-colors ${
                  view.purchase_milestone === m
                    ? 'border-veluna-plum bg-veluna-blush/40'
                    : 'border-veluna-petal hover:border-veluna-mauve'
                }`}
              >
                <input
                  type="radio"
                  name="milestone"
                  className="mt-1"
                  checked={view.purchase_milestone === m}
                  onChange={() => setView((v) => (v ? { ...v, purchase_milestone: m } : v))}
                />
                <span>
                  <span className="block text-sm font-bold text-veluna-dark">{MILESTONE_LABELS[m]}</span>
                  <span className="block text-[11px] text-veluna-muted mt-0.5 leading-relaxed">
                    {MILESTONE_HINTS[m]}
                  </span>
                </span>
              </label>
            ))}
          </div>

          <Toggle
            checked={view.lifecycle_events_enabled}
            onChange={(v) => setView((s) => (s ? { ...s, lifecycle_events_enabled: v } : s))}
            label="إرسال أحداث دورة حياة الطلب"
            hint="أحداث منفصلة (مأكد / تم الشحن / تم التوصيل / ملغي / مرجع) بلا ما تعوّض Purchase."
          />

          <button
            type="button"
            onClick={() => save('general')}
            disabled={saving === 'general'}
            className="bg-veluna-plum text-white text-sm font-bold px-5 py-2.5 rounded-xl
                       hover:bg-[#653156] active:scale-[0.97] transition-all disabled:opacity-60"
          >
            {saving === 'general' ? 'كيتسجل...' : 'سجّلي'}
          </button>
        </div>

        {/* ── Recent dispatches ───────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-veluna-petal p-5">
          <h3 className="font-bold text-veluna-dark text-sm mb-3">آخر الأحداث المرسلة من السيرفر</h3>
          {recent.length === 0 ? (
            <p className="text-xs text-veluna-muted">ما كاين حتى حدث حتى دابا.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-veluna-muted border-b border-veluna-petal">
                    <th className="text-start pb-2 font-semibold">المنصة</th>
                    <th className="text-start pb-2 font-semibold">الحدث</th>
                    <th className="text-start pb-2 font-semibold">الطلب</th>
                    <th className="text-start pb-2 font-semibold">الحالة</th>
                    <th className="text-start pb-2 font-semibold">الوقت</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((row) => (
                    <tr key={row.event_key} className="border-b border-veluna-petal/50 last:border-0">
                      <td className="py-2">{row.platform}</td>
                      <td className="py-2">{row.event_name}</td>
                      <td className="py-2 font-mono" dir="ltr">{row.order_id ?? '—'}</td>
                      <td className="py-2">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold ${
                            row.status === 'sent'
                              ? 'bg-green-100 text-green-800'
                              : row.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {row.status}
                        </span>
                        {row.error && (
                          <span className="block text-[10px] text-red-600 mt-0.5 max-w-xs break-words">
                            {row.error}
                          </span>
                        )}
                      </td>
                      <td className="py-2 whitespace-nowrap">{formatDate(row.updated_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
