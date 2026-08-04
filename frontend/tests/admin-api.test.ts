import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { TEST_KEY } from './helpers'

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

vi.mock('@/lib/tracking/log', () => ({
  claimEvent: vi.fn(async () => true),
  recordEvent: vi.fn(async () => {}),
  dispatchKey: (p: string, e: string, id: string) => `${p}:${e}:${id}`,
  getPlatformStatuses: vi.fn(async () => ({
    meta: { browser_ready: false, server_ready: false, last_success_at: null, last_error: null, last_error_at: null },
    tiktok: { browser_ready: false, server_ready: false, last_success_at: null, last_error: null, last_error_at: null },
    snapchat: { browser_ready: false, server_ready: false, last_success_at: null, last_error: null, last_error_at: null },
  })),
  listRecentDispatches: vi.fn(async () => []),
}))

const { GET, PUT } = await import('@/app/api/admin/advertising/route')
const { POST: TEST_POST } = await import('@/app/api/admin/advertising/test/route')
const { GET: PUBLIC_CONFIG } = await import('@/app/api/tracking/config/route')
const { invalidateSettingsCache } = await import('@/lib/tracking/settings')

const SECRET = 'admin-secret-token-value'

function request(opts: { auth?: boolean | string; method?: string; body?: unknown } = {}): NextRequest {
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (opts.auth) {
    const token = typeof opts.auth === 'string' ? opts.auth : SECRET
    headers.cookie = `admin_token=${token}`
  }
  return new NextRequest('https://veluna.ma/api/admin/advertising', {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  })
}

beforeEach(() => {
  table.config = null
  table.updated_at = ''
  invalidateSettingsCache()
  process.env.ADMIN_SECRET_TOKEN = SECRET
  process.env.AD_TRACKING_ENCRYPTION_KEY = TEST_KEY
  delete process.env.NEXT_PUBLIC_META_PIXEL_ID
  delete process.env.META_ACCESS_TOKEN
})

describe('admin authentication', () => {
  it('rejects a request with no cookie', async () => {
    const res = await GET(request())
    expect(res.status).toBe(401)
  })

  it('rejects a wrong token', async () => {
    const res = await GET(request({ auth: 'not-the-token' }))
    expect(res.status).toBe(401)
  })

  it('rejects a token that is merely a prefix of the real one', async () => {
    const res = await GET(request({ auth: SECRET.slice(0, 10) }))
    expect(res.status).toBe(401)
  })

  it('rejects everything when ADMIN_SECRET_TOKEN is unset on the server', async () => {
    delete process.env.ADMIN_SECRET_TOKEN
    expect((await GET(request({ auth: true }))).status).toBe(401)
    expect((await GET(request({ auth: 'anything' }))).status).toBe(401)
  })

  it('accepts the correct token', async () => {
    const res = await GET(request({ auth: true }))
    expect(res.status).toBe(200)
  })

  it('guards saving as well as reading', async () => {
    const res = await PUT(request({ method: 'PUT', body: { meta: { pixel_id: '123456789012345' } } }))
    expect(res.status).toBe(401)
    expect(table.config).toBeNull()
  })

  it('guards the test-event endpoint', async () => {
    const res = await TEST_POST(request({ method: 'POST', body: { platform: 'meta' } }))
    expect(res.status).toBe(401)
  })
})

describe('GET /api/admin/advertising', () => {
  it('returns masked tokens, never the real value', async () => {
    await PUT(
      request({
        method: 'PUT',
        auth: true,
        body: {
          meta: {
            pixel_enabled: true,
            pixel_id: '123456789012345',
            capi_enabled: true,
            access_token: 'EAAsupersecret9999',
          },
        },
      })
    )
    invalidateSettingsCache()

    const res = await GET(request({ auth: true }))
    const body = await res.text()

    expect(body).not.toContain('EAAsupersecret9999')
    expect(JSON.parse(body).settings.meta.access_token).toEqual({
      configured: true,
      preview: '••••••••9999',
    })
  })

  it('reports readiness per platform', async () => {
    await PUT(
      request({
        method: 'PUT',
        auth: true,
        body: {
          meta: { pixel_enabled: true, pixel_id: '123456789012345', capi_enabled: true, access_token: 'TOKEN1234' },
        },
      })
    )
    invalidateSettingsCache()

    const data = await (await GET(request({ auth: true }))).json()
    expect(data.settings.status.meta.browser_ready).toBe(true)
    expect(data.settings.status.meta.server_ready).toBe(true)
    expect(data.settings.status.snapchat.server_ready).toBe(false)
  })
})

describe('PUT /api/admin/advertising', () => {
  it('returns field-level validation errors', async () => {
    const res = await PUT(
      request({ method: 'PUT', auth: true, body: { meta: { pixel_enabled: true, pixel_id: 'nope' } } })
    )
    expect(res.status).toBe(422)
    const data = await res.json()
    expect(data.issues[0].field).toBe('meta.pixel_id')
    expect(table.config).toBeNull()
  })

  it('fails safely without storing plaintext when the encryption key is missing', async () => {
    delete process.env.AD_TRACKING_ENCRYPTION_KEY

    const res = await PUT(
      request({
        method: 'PUT',
        auth: true,
        body: { meta: { capi_enabled: true, pixel_id: '123456789012345', access_token: 'PLAINTEXT-TOKEN' } },
      })
    )

    expect(res.status).toBe(500)
    const data = await res.json()
    expect(data.error).toContain('AD_TRACKING_ENCRYPTION_KEY')
    expect(table.config).toBeNull()
  })

  it('rejects an unknown platform on the test endpoint', async () => {
    const res = await TEST_POST(request({ method: 'POST', auth: true, body: { platform: 'linkedin' } }))
    expect(res.status).toBe(400)
  })
})

describe('GET /api/tracking/config (public)', () => {
  it('exposes pixel ids but never a token', async () => {
    await PUT(
      request({
        method: 'PUT',
        auth: true,
        body: {
          meta: {
            pixel_enabled: true,
            pixel_id: '123456789012345',
            capi_enabled: true,
            access_token: 'EAAsupersecret9999',
          },
        },
      })
    )
    invalidateSettingsCache()

    const body = await (await PUBLIC_CONFIG()).text()
    expect(body).toContain('123456789012345')
    expect(body).not.toContain('EAAsupersecret9999')
    expect(body).not.toContain('access_token')
  })

  it('needs no authentication and reports nothing when unconfigured', async () => {
    const data = await (await PUBLIC_CONFIG()).json()
    expect(data.config).toEqual({
      meta: { enabled: false, id: '' },
      tiktok: { enabled: false, id: '' },
      snapchat: { enabled: false, id: '' },
    })
  })
})
