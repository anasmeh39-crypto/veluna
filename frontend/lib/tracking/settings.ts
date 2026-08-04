// Advertising settings: persistence, validation, encryption and the two safe
// projections (browser-public config, masked admin view).
//
// SERVER ONLY — this module decrypts access tokens. Never import it from a
// client component.

import { pool } from '@/lib/db'
import {
  decryptSecret,
  encryptSecret,
  encryptionStatus,
  isEncrypted,
  maskSecret,
  TrackingConfigError,
} from './crypto'
import {
  DEFAULT_META_API_VERSION,
  PURCHASE_MILESTONES,
  type AdminAdSettingsView,
  type AdPlatform,
  type AdSettings,
  type MaskedToken,
  type PublicTrackingConfig,
  type PurchaseMilestone,
} from './types'

const SETTINGS_ID = 'default'
const CACHE_TTL_MS = 60_000

/** Sentinel a client sends to explicitly wipe a stored token. */
export const CLEAR_TOKEN = '__CLEAR__'

let cache: { value: AdSettings; at: number } | null = null
let schemaReady = false

export function defaultAdSettings(): AdSettings {
  return {
    meta: {
      pixel_enabled: false,
      pixel_id: '',
      capi_enabled: false,
      access_token: '',
      api_version: DEFAULT_META_API_VERSION,
      test_event_code: '',
      dataset_id: '',
    },
    tiktok: {
      pixel_enabled: false,
      pixel_code: '',
      events_api_enabled: false,
      access_token: '',
      test_event_code: '',
    },
    snapchat: {
      pixel_enabled: false,
      pixel_id: '',
      capi_enabled: false,
      access_token: '',
      test_event_code: '',
    },
    purchase_milestone: 'order_created',
    lifecycle_events_enabled: true,
    updated_at: new Date(0).toISOString(),
  }
}

async function ensureSchema(): Promise<void> {
  if (schemaReady) return
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ad_settings (
      id         VARCHAR(20)  PRIMARY KEY,
      config     TEXT         NOT NULL,
      updated_at VARCHAR(30)  NOT NULL
    );
  `)
  schemaReady = true
}

function str(value: unknown, max = 255): string {
  if (value === undefined || value === null) return ''
  return String(value).trim().slice(0, max)
}

function bool(value: unknown): boolean {
  return value === true || value === 'true' || value === 1 || value === '1'
}

/** Merges a persisted JSON blob over the defaults, tolerating older shapes. */
function coerce(raw: unknown): AdSettings {
  const base = defaultAdSettings()
  if (!raw || typeof raw !== 'object') return base

  const stored = raw as Record<string, unknown>
  const section = (key: string): Record<string, unknown> =>
    (stored[key] ?? {}) as Record<string, unknown>

  const meta = section('meta')
  const tiktok = section('tiktok')
  const snapchat = section('snapchat')
  const milestone = str(stored.purchase_milestone) as PurchaseMilestone

  return {
    meta: {
      pixel_enabled: bool(meta.pixel_enabled),
      pixel_id:      str(meta.pixel_id, 64),
      capi_enabled:  bool(meta.capi_enabled),
      access_token:  str(meta.access_token, 2048),
      api_version:   str(meta.api_version, 16) || DEFAULT_META_API_VERSION,
      test_event_code: str(meta.test_event_code, 64),
      dataset_id:    str(meta.dataset_id, 64),
    },
    tiktok: {
      pixel_enabled:      bool(tiktok.pixel_enabled),
      pixel_code:         str(tiktok.pixel_code, 64),
      events_api_enabled: bool(tiktok.events_api_enabled),
      access_token:       str(tiktok.access_token, 2048),
      test_event_code:    str(tiktok.test_event_code, 64),
    },
    snapchat: {
      pixel_enabled:   bool(snapchat.pixel_enabled),
      pixel_id:        str(snapchat.pixel_id, 64),
      capi_enabled:    bool(snapchat.capi_enabled),
      access_token:    str(snapchat.access_token, 2048),
      test_event_code: str(snapchat.test_event_code, 64),
    },
    purchase_milestone: PURCHASE_MILESTONES.includes(milestone) ? milestone : 'order_created',
    lifecycle_events_enabled:
      stored.lifecycle_events_enabled === undefined ? true : bool(stored.lifecycle_events_enabled),
    updated_at: str(stored.updated_at, 30) || base.updated_at,
  }
}

/**
 * Legacy env compatibility: values from the pre-admin setup are used only when
 * the admin has not configured that field. Admin config always wins.
 */
function applyLegacyEnv(settings: AdSettings): AdSettings {
  const legacyMetaPixel = str(process.env.NEXT_PUBLIC_META_PIXEL_ID, 64)
  const legacyTikTokPixel = str(process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID, 64)

  if (!settings.meta.pixel_id && legacyMetaPixel) {
    settings.meta.pixel_id = legacyMetaPixel
    settings.meta.pixel_enabled = true
  }
  if (!settings.tiktok.pixel_code && legacyTikTokPixel) {
    settings.tiktok.pixel_code = legacyTikTokPixel
    settings.tiktok.pixel_enabled = true
  }
  return settings
}

export function invalidateSettingsCache(): void {
  cache = null
}

/**
 * Current settings (tokens still encrypted). Falls back to defaults + legacy
 * env when the database is unreachable so a DB outage disables tracking rather
 * than breaking the storefront.
 */
export async function getAdSettings(): Promise<AdSettings> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.value

  let settings: AdSettings
  try {
    await ensureSchema()
    const result = await pool.query('SELECT config, updated_at FROM ad_settings WHERE id = $1', [SETTINGS_ID])
    if (result.rows[0]) {
      const parsed = JSON.parse(result.rows[0].config as string)
      settings = coerce({ ...parsed, updated_at: result.rows[0].updated_at })
    } else {
      settings = defaultAdSettings()
    }
  } catch (err) {
    console.error('[ad-settings] read failed, using defaults:', err instanceof Error ? err.message : err)
    settings = defaultAdSettings()
  }

  settings = applyLegacyEnv(settings)
  cache = { value: settings, at: Date.now() }
  return settings
}

export interface PlatformTokenInput {
  /** '' / undefined keeps the stored token; CLEAR_TOKEN wipes it. */
  access_token?: string
}

export type AdSettingsInput = {
  meta?: Partial<Omit<AdSettings['meta'], 'access_token'>> & PlatformTokenInput
  tiktok?: Partial<Omit<AdSettings['tiktok'], 'access_token'>> & PlatformTokenInput
  snapchat?: Partial<Omit<AdSettings['snapchat'], 'access_token'>> & PlatformTokenInput
  purchase_milestone?: string
  lifecycle_events_enabled?: boolean
}

export interface ValidationIssue {
  field: string
  message: string
}

const ID_PATTERNS: Record<string, { re: RegExp; message: string }> = {
  'meta.pixel_id': {
    re: /^\d{5,25}$/,
    message: 'معرّف Meta Pixel خاصو يكون أرقام فقط (مثال: 123456789012345)',
  },
  'meta.dataset_id': {
    re: /^\d{5,25}$/,
    message: 'معرّف Dataset خاصو يكون أرقام فقط',
  },
  'meta.api_version': {
    re: /^v\d{1,3}\.\d{1,2}$/,
    message: 'نسخة API خاصها تكون بهاد الشكل: v23.0',
  },
  'tiktok.pixel_code': {
    re: /^[A-Za-z0-9]{8,40}$/,
    message: 'TikTok Pixel Code خاصو يكون حروف وأرقام فقط',
  },
  'snapchat.pixel_id': {
    re: /^[A-Za-z0-9-]{8,64}$/,
    message: 'معرّف Snap Pixel غير صالح',
  },
}

const TEST_CODE_RE = /^[A-Za-z0-9_-]{1,64}$/

function validate(next: AdSettings): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  const check = (field: string, value: string, required: boolean) => {
    if (!value) {
      if (required) issues.push({ field, message: 'هاد الخانة مطلوبة باش تفعّلي هاد الخيار' })
      return
    }
    const rule = ID_PATTERNS[field]
    if (rule && !rule.re.test(value)) issues.push({ field, message: rule.message })
  }

  check('meta.pixel_id', next.meta.pixel_id, next.meta.pixel_enabled || next.meta.capi_enabled)
  check('meta.api_version', next.meta.api_version, true)
  check('meta.dataset_id', next.meta.dataset_id, false)
  check('tiktok.pixel_code', next.tiktok.pixel_code, next.tiktok.pixel_enabled || next.tiktok.events_api_enabled)
  check('snapchat.pixel_id', next.snapchat.pixel_id, next.snapchat.pixel_enabled || next.snapchat.capi_enabled)

  if (next.meta.capi_enabled && !next.meta.access_token) {
    issues.push({ field: 'meta.access_token', message: 'خاصك تدخّلي Access Token باش تفعّلي Conversions API' })
  }
  if (next.tiktok.events_api_enabled && !next.tiktok.access_token) {
    issues.push({ field: 'tiktok.access_token', message: 'خاصك تدخّلي Access Token باش تفعّلي Events API' })
  }
  if (next.snapchat.capi_enabled && !next.snapchat.access_token) {
    issues.push({ field: 'snapchat.access_token', message: 'خاصك تدخّلي Access Token باش تفعّلي Conversions API' })
  }

  for (const [field, value] of [
    ['meta.test_event_code', next.meta.test_event_code],
    ['tiktok.test_event_code', next.tiktok.test_event_code],
    ['snapchat.test_event_code', next.snapchat.test_event_code],
  ] as const) {
    if (value && !TEST_CODE_RE.test(value)) {
      issues.push({ field, message: 'رمز الاختبار فيه حروف غير مسموحة' })
    }
  }

  return issues
}

/** Applies a token field's keep / replace / clear semantics. */
function nextToken(current: string, input: string | undefined): string {
  if (input === undefined || input === '') return current
  if (input === CLEAR_TOKEN) return ''
  return encryptSecret(input.trim())
}

export interface SaveResult {
  ok: boolean
  issues?: ValidationIssue[]
  settings?: AdSettings
}

/**
 * Persists settings. Throws TrackingConfigError when a new token is supplied
 * but AD_TRACKING_ENCRYPTION_KEY is missing — we never store plaintext.
 */
export async function saveAdSettings(input: AdSettingsInput): Promise<SaveResult> {
  const current = await getAdSettings()

  const next: AdSettings = {
    meta: {
      pixel_enabled:   input.meta?.pixel_enabled ?? current.meta.pixel_enabled,
      pixel_id:        str(input.meta?.pixel_id ?? current.meta.pixel_id, 64),
      capi_enabled:    input.meta?.capi_enabled ?? current.meta.capi_enabled,
      access_token:    nextToken(current.meta.access_token, input.meta?.access_token),
      api_version:     str(input.meta?.api_version ?? current.meta.api_version, 16) || DEFAULT_META_API_VERSION,
      test_event_code: str(input.meta?.test_event_code ?? current.meta.test_event_code, 64),
      dataset_id:      str(input.meta?.dataset_id ?? current.meta.dataset_id, 64),
    },
    tiktok: {
      pixel_enabled:      input.tiktok?.pixel_enabled ?? current.tiktok.pixel_enabled,
      pixel_code:         str(input.tiktok?.pixel_code ?? current.tiktok.pixel_code, 64),
      events_api_enabled: input.tiktok?.events_api_enabled ?? current.tiktok.events_api_enabled,
      access_token:       nextToken(current.tiktok.access_token, input.tiktok?.access_token),
      test_event_code:    str(input.tiktok?.test_event_code ?? current.tiktok.test_event_code, 64),
    },
    snapchat: {
      pixel_enabled:   input.snapchat?.pixel_enabled ?? current.snapchat.pixel_enabled,
      pixel_id:        str(input.snapchat?.pixel_id ?? current.snapchat.pixel_id, 64),
      capi_enabled:    input.snapchat?.capi_enabled ?? current.snapchat.capi_enabled,
      access_token:    nextToken(current.snapchat.access_token, input.snapchat?.access_token),
      test_event_code: str(input.snapchat?.test_event_code ?? current.snapchat.test_event_code, 64),
    },
    purchase_milestone: PURCHASE_MILESTONES.includes(input.purchase_milestone as PurchaseMilestone)
      ? (input.purchase_milestone as PurchaseMilestone)
      : current.purchase_milestone,
    lifecycle_events_enabled: input.lifecycle_events_enabled ?? current.lifecycle_events_enabled,
    updated_at: new Date().toISOString(),
  }

  const issues = validate(next)
  if (issues.length > 0) return { ok: false, issues }

  await ensureSchema()
  await pool.query(
    `INSERT INTO ad_settings (id, config, updated_at) VALUES ($1, $2, $3)
     ON CONFLICT (id) DO UPDATE SET config = EXCLUDED.config, updated_at = EXCLUDED.updated_at`,
    [SETTINGS_ID, JSON.stringify(next), next.updated_at]
  )

  invalidateSettingsCache()
  return { ok: true, settings: next }
}

/**
 * Decrypted access token for a platform, or '' when unavailable.
 * Falls back to the legacy server env vars when the admin has not set one.
 */
export function resolveAccessToken(settings: AdSettings, platform: AdPlatform): string {
  const stored =
    platform === 'meta' ? settings.meta.access_token
    : platform === 'tiktok' ? settings.tiktok.access_token
    : settings.snapchat.access_token

  if (stored) {
    try {
      return isEncrypted(stored) ? decryptSecret(stored) : ''
    } catch (err) {
      // Never log the token itself — only why it could not be read.
      console.error(
        `[ad-settings] cannot decrypt ${platform} token:`,
        err instanceof TrackingConfigError ? err.message : 'decryption error'
      )
      return ''
    }
  }

  if (platform === 'meta') return (process.env.META_ACCESS_TOKEN ?? '').trim()
  if (platform === 'tiktok') return (process.env.TIKTOK_ACCESS_TOKEN ?? '').trim()
  return (process.env.SNAPCHAT_ACCESS_TOKEN ?? '').trim()
}

/** Test event code, admin value first then legacy env. */
export function resolveTestEventCode(settings: AdSettings, platform: AdPlatform): string {
  if (platform === 'meta') {
    return settings.meta.test_event_code || (process.env.META_TEST_EVENT_CODE ?? '').trim()
  }
  if (platform === 'tiktok') return settings.tiktok.test_event_code
  return settings.snapchat.test_event_code
}

/** Browser-safe config — IDs and enable flags only, never a token. */
export function toPublicConfig(settings: AdSettings): PublicTrackingConfig {
  return {
    meta: {
      enabled: settings.meta.pixel_enabled && !!settings.meta.pixel_id,
      id: settings.meta.pixel_enabled ? settings.meta.pixel_id : '',
    },
    tiktok: {
      enabled: settings.tiktok.pixel_enabled && !!settings.tiktok.pixel_code,
      id: settings.tiktok.pixel_enabled ? settings.tiktok.pixel_code : '',
    },
    snapchat: {
      enabled: settings.snapchat.pixel_enabled && !!settings.snapchat.pixel_id,
      id: settings.snapchat.pixel_enabled ? settings.snapchat.pixel_id : '',
    },
  }
}

function maskToken(settings: AdSettings, platform: AdPlatform): MaskedToken {
  const stored =
    platform === 'meta' ? settings.meta.access_token
    : platform === 'tiktok' ? settings.tiktok.access_token
    : settings.snapchat.access_token

  if (!stored) {
    // Surface a legacy env token as configured so the admin knows it is live.
    const legacy = resolveAccessToken(settings, platform)
    return legacy
      ? { configured: true, preview: maskSecret(legacy) + ' (env)' }
      : { configured: false, preview: '' }
  }

  try {
    return { configured: true, preview: maskSecret(decryptSecret(stored)) }
  } catch {
    return { configured: true, preview: '•••••••• (خطأ فك التشفير)' }
  }
}

/** Admin projection — tokens replaced by masked previews. */
export function toAdminView(
  settings: AdSettings,
  status: AdminAdSettingsView['status']
): AdminAdSettingsView {
  const { meta, tiktok, snapchat } = settings
  return {
    meta:     { ...meta,     access_token: maskToken(settings, 'meta') },
    tiktok:   { ...tiktok,   access_token: maskToken(settings, 'tiktok') },
    snapchat: { ...snapchat, access_token: maskToken(settings, 'snapchat') },
    purchase_milestone: settings.purchase_milestone,
    lifecycle_events_enabled: settings.lifecycle_events_enabled,
    updated_at: settings.updated_at,
    status,
    encryption: encryptionStatus(),
    legacy_env: {
      meta_pixel_id:   !!process.env.NEXT_PUBLIC_META_PIXEL_ID,
      meta_token:      !!process.env.META_ACCESS_TOKEN,
      tiktok_pixel_id: !!process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID,
      tiktok_token:    !!process.env.TIKTOK_ACCESS_TOKEN,
    },
  }
}

/** True when the platform can receive server-side events right now. */
export function serverReady(settings: AdSettings, platform: AdPlatform): boolean {
  if (platform === 'meta') {
    return settings.meta.capi_enabled && !!settings.meta.pixel_id && !!resolveAccessToken(settings, 'meta')
  }
  if (platform === 'tiktok') {
    return settings.tiktok.events_api_enabled && !!settings.tiktok.pixel_code && !!resolveAccessToken(settings, 'tiktok')
  }
  return settings.snapchat.capi_enabled && !!settings.snapchat.pixel_id && !!resolveAccessToken(settings, 'snapchat')
}

/** True when the browser pixel will be injected. */
export function browserReady(settings: AdSettings, platform: AdPlatform): boolean {
  const pub = toPublicConfig(settings)
  return pub[platform].enabled
}
