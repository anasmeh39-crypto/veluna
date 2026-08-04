import { beforeEach, describe, expect, it, vi } from 'vitest'
import { makeOrder, TEST_KEY } from './helpers'

// ── In-memory ad_settings table ──────────────────────────────────────────────
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

// ── Dispatch log with the real claim semantics, in memory ────────────────────
const claims = new Map<string, string>()

vi.mock('@/lib/tracking/log', () => ({
  dispatchKey: (p: string, e: string, id: string) => `${p}:${e}:${id}`,
  claimEvent: vi.fn(async (input: { platform: string; eventName: string; eventId: string }) => {
    const key = `${input.platform}:${input.eventName}:${input.eventId}`
    if (claims.get(key) === 'sent') return false
    claims.set(key, 'pending')
    return true
  }),
  recordEvent: vi.fn(async (input: { platform: string; eventName: string; eventId: string; status: string }) => {
    claims.set(`${input.platform}:${input.eventName}:${input.eventId}`, input.status)
  }),
  getPlatformStatuses: vi.fn(async () => ({})),
  listRecentDispatches: vi.fn(async () => []),
}))

const { saveAdSettings, invalidateSettingsCache } = await import('@/lib/tracking/settings')
const { dispatchOrderPurchase, dispatchOrderStatusChange, sendTestEvent, contextFromOrder } = await import(
  '@/lib/tracking/server'
)

function okResponse(url: string): Response {
  if (url.includes('graph.facebook.com')) {
    return new Response(JSON.stringify({ events_received: 1, fbtrace_id: 'FBTRACE' }), { status: 200 })
  }
  if (url.includes('business-api.tiktok.com')) {
    return new Response(JSON.stringify({ code: 0, message: 'OK', request_id: 'TTREQ' }), { status: 200 })
  }
  return new Response(JSON.stringify({ status: 'SUCCESS' }), { status: 200 })
}

const fetchMock = vi.fn(async (url: string | URL, _init?: RequestInit) => okResponse(String(url)))

async function configureAll() {
  await saveAdSettings({
    meta: { pixel_enabled: true, pixel_id: '123456789012345', capi_enabled: true, access_token: 'META-TOKEN' },
    tiktok: {
      pixel_enabled: true,
      pixel_code: 'CABCDEF1234567890',
      events_api_enabled: true,
      access_token: 'TT-TOKEN',
    },
    snapchat: {
      pixel_enabled: true,
      pixel_id: '11111111-2222-3333-4444-555555555555',
      capi_enabled: true,
      access_token: 'SNAP-TOKEN',
    },
  })
  invalidateSettingsCache()
}

function urlsCalled(): string[] {
  return fetchMock.mock.calls.map((c) => String(c[0]))
}

beforeEach(async () => {
  table.config = null
  table.updated_at = ''
  claims.clear()
  fetchMock.mockClear()
  fetchMock.mockImplementation(async (url: string | URL) => okResponse(String(url)))
  vi.stubGlobal('fetch', fetchMock)
  invalidateSettingsCache()
  process.env.AD_TRACKING_ENCRYPTION_KEY = TEST_KEY
  process.env.NEXT_PUBLIC_SITE_URL = 'https://veluna.ma'
  delete process.env.META_ACCESS_TOKEN
  delete process.env.TIKTOK_ACCESS_TOKEN
  delete process.env.SNAPCHAT_ACCESS_TOKEN
  delete process.env.NEXT_PUBLIC_META_PIXEL_ID
  delete process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID
})

describe('order purchase dispatch', () => {
  it('sends one server event per configured platform', async () => {
    await configureAll()
    const order = makeOrder()
    const results = await dispatchOrderPurchase(order, contextFromOrder(order))

    expect(results.filter((r) => r.status === 'sent')).toHaveLength(3)
    expect(urlsCalled()).toHaveLength(3)
    expect(urlsCalled().some((u) => u.includes('graph.facebook.com/v23.0/123456789012345/events'))).toBe(true)
    expect(urlsCalled().some((u) => u.includes('business-api.tiktok.com/open_api/v1.3/event/track/'))).toBe(true)
    expect(urlsCalled().some((u) => u.includes('tr.snapchat.com/v3/'))).toBe(true)
  })

  it('never sends a second Purchase for the same order', async () => {
    await configureAll()
    const order = makeOrder()

    await dispatchOrderPurchase(order, contextFromOrder(order))
    fetchMock.mockClear()

    const second = await dispatchOrderPurchase(order, contextFromOrder(order))
    expect(second.every((r) => r.status === 'duplicate')).toBe(true)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('sends a different order its own Purchase', async () => {
    await configureAll()
    const first = makeOrder()
    const second = makeOrder({ id: 'VL260803-ZZ99' })

    await dispatchOrderPurchase(first, contextFromOrder(first))
    fetchMock.mockClear()

    const results = await dispatchOrderPurchase(second, contextFromOrder(second))
    expect(results.filter((r) => r.status === 'sent')).toHaveLength(3)
  })

  it('keeps delivering to the other platforms when one fails', async () => {
    await configureAll()
    fetchMock.mockImplementation(async (url: string | URL) => {
      if (String(url).includes('graph.facebook.com')) {
        return new Response(JSON.stringify({ error: { message: 'Invalid OAuth token' } }), { status: 400 })
      }
      return okResponse(String(url))
    })

    const order = makeOrder()
    const results = await dispatchOrderPurchase(order, contextFromOrder(order))

    expect(results.find((r) => r.platform === 'meta')?.status).toBe('failed')
    expect(results.find((r) => r.platform === 'tiktok')?.status).toBe('sent')
    expect(results.find((r) => r.platform === 'snapchat')?.status).toBe('sent')
  })

  it('does not throw when a platform network call blows up', async () => {
    await configureAll()
    fetchMock.mockImplementation(async () => {
      throw new Error('socket hang up')
    })

    const order = makeOrder()
    await expect(dispatchOrderPurchase(order, contextFromOrder(order))).resolves.toBeDefined()
  })

  it('reports a TikTok application error (HTTP 200, non-zero code) as failed', async () => {
    await configureAll()
    fetchMock.mockImplementation(async (url: string | URL) => {
      if (String(url).includes('tiktok')) {
        return new Response(JSON.stringify({ code: 40001, message: 'Invalid access token' }), { status: 200 })
      }
      return okResponse(String(url))
    })

    const order = makeOrder()
    const results = await dispatchOrderPurchase(order, contextFromOrder(order))
    const tiktok = results.find((r) => r.platform === 'tiktok')
    expect(tiktok?.status).toBe('failed')
    expect(tiktok?.reason).toContain('Invalid access token')
  })

  it('skips platforms with no credentials and platforms with the API disabled', async () => {
    await saveAdSettings({
      meta: { pixel_enabled: true, pixel_id: '123456789012345', capi_enabled: true, access_token: 'META-TOKEN' },
      // TikTok: pixel on, Events API off.
      tiktok: { pixel_enabled: true, pixel_code: 'CABCDEF1234567890', events_api_enabled: false },
      // Snapchat: nothing configured at all.
    })
    invalidateSettingsCache()

    const order = makeOrder()
    const results = await dispatchOrderPurchase(order, contextFromOrder(order))

    expect(results.find((r) => r.platform === 'meta')?.status).toBe('sent')
    expect(results.find((r) => r.platform === 'tiktok')?.status).toBe('skipped')
    expect(results.find((r) => r.platform === 'snapchat')?.status).toBe('skipped')
    expect(urlsCalled()).toHaveLength(1)
  })

  it('sends nothing at all when no platform is configured', async () => {
    const order = makeOrder()
    const results = await dispatchOrderPurchase(order, contextFromOrder(order))
    expect(results.every((r) => r.status === 'skipped')).toBe(true)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('never puts raw customer data on the wire', async () => {
    await configureAll()
    const order = makeOrder()
    await dispatchOrderPurchase(order, contextFromOrder(order))

    const bodies = fetchMock.mock.calls.map((c) => String(c[1]?.body ?? ''))
    for (const body of bodies) {
      expect(body).not.toContain('0612345678')
      expect(body).not.toContain('سلمى العلوي')
      expect(body).not.toContain('حي المعاريف')
    }
    // …while the technical match keys the platforms need are present, un-hashed.
    const joined = bodies.join()
    expect(joined).toContain('196.200.10.5')
    expect(joined).toContain('Mozilla/5.0 (iPhone)')
    expect(joined).toContain('fb.1.1717000000000.1234567890')
    expect(joined).toContain('tt-click-id')
    expect(joined).toContain('sc-click-id')
  })

  it('forwards the attribution stored on the order to each platform', async () => {
    await configureAll()
    const order = makeOrder()
    await dispatchOrderPurchase(order, contextFromOrder(order))

    const byUrl = (needle: string) =>
      JSON.parse(
        String(
          fetchMock.mock.calls.find((c) => String(c[0]).includes(needle))![1]!.body
        )
      )

    expect(byUrl('graph.facebook.com').data[0].user_data.fbc).toBe('fb.1.1717000000000.IwAR-click-id')
    expect(byUrl('tiktok').data[0].user.ttclid).toBe('tt-click-id')
    expect(byUrl('tiktok').data[0].user.ttp).toBe('ttp-cookie')
    expect(byUrl('snapchat').data[0].user_data.sc_click_id).toBe('sc-click-id')
    expect(byUrl('snapchat').data[0].user_data.sc_cookie1).toBe('scid-cookie')
  })

  it('never puts the access token in a URL for Meta or TikTok', async () => {
    await configureAll()
    const order = makeOrder()
    await dispatchOrderPurchase(order, contextFromOrder(order))

    for (const url of urlsCalled()) {
      if (url.includes('snapchat')) continue // Snapchat v3 documents access_token as a query param
      expect(url).not.toContain('META-TOKEN')
      expect(url).not.toContain('TT-TOKEN')
    }
  })
})

describe('COD purchase milestone', () => {
  it('holds the Purchase back when the milestone is `delivered`', async () => {
    await configureAll()
    await saveAdSettings({ purchase_milestone: 'delivered' })
    invalidateSettingsCache()

    const order = makeOrder()
    expect(await dispatchOrderPurchase(order, contextFromOrder(order))).toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('sends the Purchase when the order reaches the configured milestone', async () => {
    await configureAll()
    await saveAdSettings({ purchase_milestone: 'delivered', lifecycle_events_enabled: false })
    invalidateSettingsCache()

    const order = makeOrder({ status: 'delivered' })
    const results = await dispatchOrderStatusChange(order, 'delivered')

    expect(results.filter((r) => r.event === 'Purchase' && r.status === 'sent')).toHaveLength(3)
  })

  it('uses the same Purchase event id whichever milestone fires it', async () => {
    await configureAll()
    await saveAdSettings({ purchase_milestone: 'confirmed', lifecycle_events_enabled: false })
    invalidateSettingsCache()

    const order = makeOrder({ status: 'confirmed' })
    const results = await dispatchOrderStatusChange(order, 'confirmed')
    expect(results[0].event_id).toBe('vl-purchase-VL260803-AB12')
  })

  it('emits lifecycle events without a second Purchase', async () => {
    await configureAll()
    const order = makeOrder({ status: 'delivered' })
    const results = await dispatchOrderStatusChange(order, 'delivered')

    expect(results.every((r) => r.event === 'OrderDelivered')).toBe(true)
    expect(results.filter((r) => r.status === 'sent')).toHaveLength(3)
  })

  it('emits no lifecycle event when lifecycle events are turned off', async () => {
    await configureAll()
    await saveAdSettings({ lifecycle_events_enabled: false })
    invalidateSettingsCache()

    const order = makeOrder({ status: 'shipped' })
    expect(await dispatchOrderStatusChange(order, 'shipped')).toEqual([])
  })

  it('sends a lifecycle event only once per order and status', async () => {
    await configureAll()
    const order = makeOrder({ status: 'confirmed' })

    await dispatchOrderStatusChange(order, 'confirmed')
    fetchMock.mockClear()

    const again = await dispatchOrderStatusChange(order, 'confirmed')
    expect(again.every((r) => r.status === 'duplicate')).toBe(true)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('admin test events', () => {
  it('sends a synthetic event with no customer data', async () => {
    await configureAll()
    const result = await sendTestEvent('meta')

    expect(result.status).toBe('sent')
    const body = String(fetchMock.mock.calls[0][1]!.body)
    expect(body).toContain('veluna-test')
    expect(body).not.toContain('0612345678')
  })

  it('uses the Snapchat validate endpoint', async () => {
    await configureAll()
    await sendTestEvent('snapchat')
    expect(urlsCalled()[0]).toContain('/events/validate')
  })

  it('does not consume the idempotency claim for real events', async () => {
    await configureAll()
    await sendTestEvent('meta')
    expect(claims.size).toBe(0)
  })

  it('reports a clear failure when the platform is not configured', async () => {
    const result = await sendTestEvent('tiktok')
    expect(result.status).toBe('skipped')
    expect(result.reason).toContain('not configured')
  })
})
