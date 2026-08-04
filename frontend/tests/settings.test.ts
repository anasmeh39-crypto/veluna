import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TEST_KEY } from './helpers'

// In-memory stand-in for the ad_settings table.
const table: { config: string | null; updated_at: string } = { config: null, updated_at: '' }

vi.mock('@/lib/db', () => ({
  pool: {
    query: vi.fn(async (sql: string, params?: unknown[]) => {
      if (sql.includes('CREATE TABLE')) return { rows: [], rowCount: 0 }
      if (sql.startsWith('SELECT config')) {
        return table.config
          ? { rows: [{ config: table.config, updated_at: table.updated_at }], rowCount: 1 }
          : { rows: [], rowCount: 0 }
      }
      if (sql.includes('INSERT INTO ad_settings')) {
        table.config = params![1] as string
        table.updated_at = params![2] as string
        return { rows: [], rowCount: 1 }
      }
      return { rows: [], rowCount: 0 }
    }),
  },
}))

const {
  CLEAR_TOKEN,
  browserReady,
  getAdSettings,
  invalidateSettingsCache,
  resolveAccessToken,
  saveAdSettings,
  serverReady,
  toAdminView,
  toPublicConfig,
} = await import('@/lib/tracking/settings')
const { TrackingConfigError, isEncrypted } = await import('@/lib/tracking/crypto')

const EMPTY_STATUS = {
  meta: { browser_ready: false, server_ready: false, last_success_at: null, last_error: null, last_error_at: null },
  tiktok: { browser_ready: false, server_ready: false, last_success_at: null, last_error: null, last_error_at: null },
  snapchat: { browser_ready: false, server_ready: false, last_success_at: null, last_error: null, last_error_at: null },
}

beforeEach(() => {
  table.config = null
  table.updated_at = ''
  invalidateSettingsCache()
  process.env.AD_TRACKING_ENCRYPTION_KEY = TEST_KEY
  delete process.env.NEXT_PUBLIC_META_PIXEL_ID
  delete process.env.META_ACCESS_TOKEN
  delete process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID
  delete process.env.TIKTOK_ACCESS_TOKEN
})

describe('token encryption at rest', () => {
  it('stores the token encrypted, never in plaintext', async () => {
    const result = await saveAdSettings({
      meta: { pixel_enabled: true, pixel_id: '123456789012345', capi_enabled: true, access_token: 'EAAsecrettoken1234' },
    })

    expect(result.ok).toBe(true)
    expect(table.config).not.toContain('EAAsecrettoken1234')
    expect(isEncrypted(JSON.parse(table.config!).meta.access_token)).toBe(true)
  })

  it('round-trips the token through decryption', async () => {
    await saveAdSettings({
      meta: { pixel_enabled: true, pixel_id: '123456789012345', capi_enabled: true, access_token: 'EAAsecrettoken1234' },
    })
    invalidateSettingsCache()
    const settings = await getAdSettings()
    expect(resolveAccessToken(settings, 'meta')).toBe('EAAsecrettoken1234')
  })

  it('refuses to save a token when the encryption key is missing', async () => {
    delete process.env.AD_TRACKING_ENCRYPTION_KEY
    await expect(
      saveAdSettings({ meta: { capi_enabled: true, access_token: 'plaintext-should-never-land' } })
    ).rejects.toBeInstanceOf(TrackingConfigError)
    expect(table.config).toBeNull()
  })

  it('rejects a malformed encryption key', async () => {
    process.env.AD_TRACKING_ENCRYPTION_KEY = 'too-short'
    await expect(saveAdSettings({ meta: { access_token: 'x' } })).rejects.toBeInstanceOf(TrackingConfigError)
  })
})

describe('token edit semantics', () => {
  const seed = () =>
    saveAdSettings({
      meta: { pixel_enabled: true, pixel_id: '123456789012345', capi_enabled: true, access_token: 'ORIGINAL-TOKEN-9876' },
    })

  it('keeps the stored token when the field is submitted empty', async () => {
    await seed()
    await saveAdSettings({ meta: { pixel_id: '999999999999999', access_token: '' } })
    invalidateSettingsCache()
    expect(resolveAccessToken(await getAdSettings(), 'meta')).toBe('ORIGINAL-TOKEN-9876')
  })

  it('keeps the stored token when the field is omitted entirely', async () => {
    await seed()
    await saveAdSettings({ meta: { pixel_id: '999999999999999' } })
    invalidateSettingsCache()
    expect(resolveAccessToken(await getAdSettings(), 'meta')).toBe('ORIGINAL-TOKEN-9876')
  })

  it('replaces the token when a new one is supplied', async () => {
    await seed()
    await saveAdSettings({ meta: { access_token: 'REPLACEMENT-TOKEN-4321' } })
    invalidateSettingsCache()
    expect(resolveAccessToken(await getAdSettings(), 'meta')).toBe('REPLACEMENT-TOKEN-4321')
  })

  it('clears the token with the explicit sentinel', async () => {
    await seed()
    await saveAdSettings({ meta: { capi_enabled: false, access_token: CLEAR_TOKEN } })
    invalidateSettingsCache()
    expect(resolveAccessToken(await getAdSettings(), 'meta')).toBe('')
  })
})

describe('masking in the admin view', () => {
  it('shows only the last four characters', async () => {
    await saveAdSettings({
      meta: { pixel_enabled: true, pixel_id: '123456789012345', capi_enabled: true, access_token: 'EAAsecrettoken1234' },
    })
    invalidateSettingsCache()
    const view = toAdminView(await getAdSettings(), EMPTY_STATUS)

    expect(view.meta.access_token.configured).toBe(true)
    expect(view.meta.access_token.preview).toBe('••••••••1234')
    expect(JSON.stringify(view)).not.toContain('EAAsecrettoken1234')
  })

  it('reports an unset token as not configured', async () => {
    const view = toAdminView(await getAdSettings(), EMPTY_STATUS)
    expect(view.snapchat.access_token.configured).toBe(false)
    expect(view.snapchat.access_token.preview).toBe('')
  })
})

describe('browser-safe config', () => {
  it('exposes ids and flags only — never a token', async () => {
    await saveAdSettings({
      meta: { pixel_enabled: true, pixel_id: '123456789012345', capi_enabled: true, access_token: 'EAAsecrettoken1234' },
    })
    invalidateSettingsCache()
    const config = toPublicConfig(await getAdSettings())

    expect(config.meta).toEqual({ enabled: true, id: '123456789012345' })
    expect(JSON.stringify(config)).not.toContain('EAAsecrettoken1234')
    expect(JSON.stringify(config)).not.toContain('access_token')
  })

  it('hides the id when the pixel is disabled', async () => {
    await saveAdSettings({ meta: { pixel_enabled: false, pixel_id: '123456789012345' } })
    invalidateSettingsCache()
    expect(toPublicConfig(await getAdSettings()).meta).toEqual({ enabled: false, id: '' })
  })

  it('treats a missing id as not enabled', async () => {
    await saveAdSettings({ tiktok: { pixel_enabled: true, pixel_code: '' } })
    invalidateSettingsCache()
    expect(toPublicConfig(await getAdSettings()).tiktok.enabled).toBe(false)
  })
})

describe('validation', () => {
  it('rejects a non-numeric Meta pixel id', async () => {
    const result = await saveAdSettings({ meta: { pixel_enabled: true, pixel_id: 'not-a-pixel' } })
    expect(result.ok).toBe(false)
    expect(result.issues?.[0].field).toBe('meta.pixel_id')
  })

  it('rejects a malformed Meta API version', async () => {
    const result = await saveAdSettings({ meta: { api_version: '23' } })
    expect(result.ok).toBe(false)
    expect(result.issues?.some((i) => i.field === 'meta.api_version')).toBe(true)
  })

  it('requires a pixel id before the pixel can be enabled', async () => {
    const result = await saveAdSettings({ snapchat: { pixel_enabled: true, pixel_id: '' } })
    expect(result.ok).toBe(false)
    expect(result.issues?.[0].field).toBe('snapchat.pixel_id')
  })

  it('requires a token before a server API can be enabled', async () => {
    const result = await saveAdSettings({
      tiktok: { events_api_enabled: true, pixel_code: 'CABCDEF1234567890' },
    })
    expect(result.ok).toBe(false)
    expect(result.issues?.some((i) => i.field === 'tiktok.access_token')).toBe(true)
  })

  it('does not persist anything when validation fails', async () => {
    await saveAdSettings({ meta: { pixel_enabled: true, pixel_id: 'bad' } })
    expect(table.config).toBeNull()
  })
})

describe('readiness flags', () => {
  it('reports server_ready only with an enabled API, an id and a token', async () => {
    await saveAdSettings({
      meta: { pixel_enabled: true, pixel_id: '123456789012345', capi_enabled: true, access_token: 'TOKEN1234' },
    })
    invalidateSettingsCache()
    const settings = await getAdSettings()

    expect(browserReady(settings, 'meta')).toBe(true)
    expect(serverReady(settings, 'meta')).toBe(true)
    expect(serverReady(settings, 'tiktok')).toBe(false)
    expect(browserReady(settings, 'snapchat')).toBe(false)
  })
})

describe('legacy env compatibility', () => {
  it('uses NEXT_PUBLIC_META_PIXEL_ID when the admin has not set one', async () => {
    process.env.NEXT_PUBLIC_META_PIXEL_ID = '555555555555555'
    invalidateSettingsCache()
    const config = toPublicConfig(await getAdSettings())
    expect(config.meta).toEqual({ enabled: true, id: '555555555555555' })
  })

  it('lets the admin value win over the env value', async () => {
    process.env.NEXT_PUBLIC_META_PIXEL_ID = '555555555555555'
    await saveAdSettings({ meta: { pixel_enabled: true, pixel_id: '123456789012345' } })
    invalidateSettingsCache()
    expect(toPublicConfig(await getAdSettings()).meta.id).toBe('123456789012345')
  })

  it('falls back to META_ACCESS_TOKEN when no token is stored', async () => {
    process.env.META_ACCESS_TOKEN = 'ENV-TOKEN-1111'
    invalidateSettingsCache()
    expect(resolveAccessToken(await getAdSettings(), 'meta')).toBe('ENV-TOKEN-1111')
  })
})

describe('database outage', () => {
  it('falls back to defaults instead of throwing', async () => {
    const { pool } = await import('@/lib/db')
    vi.mocked(pool.query).mockRejectedValueOnce(new Error('ECONNREFUSED'))
    invalidateSettingsCache()

    const settings = await getAdSettings()
    expect(settings.meta.pixel_enabled).toBe(false)
    expect(toPublicConfig(settings).meta.enabled).toBe(false)
  })
})
