import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { makeOrder } from './helpers'
import { buildOrderEvent, purchaseEventId } from '@/lib/tracking/events'
import {
  buildMetaBrowserPayload,
  buildSnapBrowserPayload,
  buildTikTokBrowserPayload,
  cartEvent,
  markPurchaseTracked,
  trackBrowserEvent,
  wasPurchaseTracked,
} from '@/lib/tracking/browser'
import type { PublicTrackingConfig } from '@/lib/tracking/types'

const ALL_ON: PublicTrackingConfig = {
  meta: { enabled: true, id: '123456789012345' },
  tiktok: { enabled: true, id: 'CABCDEF1234567890' },
  snapchat: { enabled: true, id: '1111-2222' },
}

const ALL_OFF: PublicTrackingConfig = {
  meta: { enabled: false, id: '' },
  tiktok: { enabled: false, id: '' },
  snapchat: { enabled: false, id: '' },
}

const fbq = vi.fn()
const ttqTrack = vi.fn()
const snaptr = vi.fn()

function installWindow(opts: { pixels?: boolean } = {}) {
  const storage = new Map<string, string>()
  const win: Record<string, unknown> = {
    location: { href: 'https://veluna.ma/thank-you?order=VL260803-AB12' },
    localStorage: {
      getItem: (k: string) => storage.get(k) ?? null,
      setItem: (k: string, v: string) => void storage.set(k, v),
      removeItem: (k: string) => void storage.delete(k),
    },
  }
  if (opts.pixels !== false) {
    win.fbq = fbq
    win.ttq = { track: ttqTrack, page: vi.fn() }
    win.snaptr = snaptr
  }
  ;(globalThis as Record<string, unknown>).window = win
}

beforeEach(() => {
  fbq.mockClear()
  ttqTrack.mockClear()
  snaptr.mockClear()
  installWindow()
})

afterEach(() => {
  delete (globalThis as Record<string, unknown>).window
})

const order = makeOrder()
const eventId = purchaseEventId(order.id)
const purchase = buildOrderEvent(order, 'Purchase', eventId, 'https://veluna.ma/thank-you')

describe('browser dedup ids', () => {
  it('Meta receives eventID equal to the server event_id', () => {
    trackBrowserEvent(purchase, ALL_ON)
    const [verb, name, payload, opts] = fbq.mock.calls[0]
    expect(verb).toBe('track')
    expect(name).toBe('Purchase')
    expect((opts as { eventID: string }).eventID).toBe(eventId)
    expect((payload as { value: number }).value).toBe(537)
  })

  it('TikTok receives event_id equal to the server event_id', () => {
    trackBrowserEvent(purchase, ALL_ON)
    const [name, , opts] = ttqTrack.mock.calls[0]
    expect(name).toBe('CompletePayment')
    expect((opts as { event_id: string }).event_id).toBe(eventId)
  })

  it('Snapchat receives client_dedup_id equal to the server event_id', () => {
    trackBrowserEvent(purchase, ALL_ON)
    const [verb, name, payload] = snaptr.mock.calls[0]
    expect(verb).toBe('track')
    expect(name).toBe('PURCHASE')
    expect((payload as { client_dedup_id: string }).client_dedup_id).toBe(eventId)
    expect((payload as { transaction_id: string }).transaction_id).toBe('VL260803-AB12')
  })
})

describe('disabled and unconfigured platforms', () => {
  it('sends nothing when every platform is off', () => {
    trackBrowserEvent(purchase, ALL_OFF)
    expect(fbq).not.toHaveBeenCalled()
    expect(ttqTrack).not.toHaveBeenCalled()
    expect(snaptr).not.toHaveBeenCalled()
  })

  it('only calls the enabled platform', () => {
    trackBrowserEvent(purchase, { ...ALL_OFF, meta: { enabled: true, id: '123' } })
    expect(fbq).toHaveBeenCalledTimes(1)
    expect(ttqTrack).not.toHaveBeenCalled()
    expect(snaptr).not.toHaveBeenCalled()
  })

  it('does not throw when a pixel global is missing (ad blocker)', () => {
    installWindow({ pixels: false })
    expect(() => trackBrowserEvent(purchase, ALL_ON)).not.toThrow()
  })

  it('does not throw when a pixel itself throws', () => {
    fbq.mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(() => trackBrowserEvent(purchase, ALL_ON)).not.toThrow()
    fbq.mockReset()
  })

  it('skips lifecycle events in the browser — they are server-only', () => {
    const lifecycle = buildOrderEvent(order, 'OrderDelivered', 'vl-delivered-x')
    trackBrowserEvent(lifecycle, ALL_ON)
    expect(fbq).not.toHaveBeenCalled()
    expect(ttqTrack).not.toHaveBeenCalled()
    expect(snaptr).not.toHaveBeenCalled()
  })
})

describe('browser payload parity with the server', () => {
  it('reports the same value and currency on all three platforms', () => {
    expect(buildMetaBrowserPayload(purchase).value).toBe(537)
    expect(buildMetaBrowserPayload(purchase).currency).toBe('MAD')
    expect(buildTikTokBrowserPayload(purchase).value).toBe(537)
    expect(buildTikTokBrowserPayload(purchase).currency).toBe('MAD')
    expect(buildSnapBrowserPayload(purchase).price).toBe(537)
    expect(buildSnapBrowserPayload(purchase).currency).toBe('MAD')
  })

  it('reports the same content ids as the server payload', () => {
    expect(buildMetaBrowserPayload(purchase).content_ids).toEqual(['zit-manaa', 'krim-jlid'])
    expect(buildSnapBrowserPayload(purchase).item_ids).toEqual(['zit-manaa', 'krim-jlid'])
  })

  it('carries the order id in each platform’s field', () => {
    expect(buildMetaBrowserPayload(purchase).order_id).toBe('VL260803-AB12')
    expect(buildTikTokBrowserPayload(purchase).order_id).toBe('VL260803-AB12')
    expect(buildSnapBrowserPayload(purchase).transaction_id).toBe('VL260803-AB12')
  })

  it('never sends customer PII from the browser', () => {
    const json = JSON.stringify([
      buildMetaBrowserPayload(purchase),
      buildTikTokBrowserPayload(purchase),
      buildSnapBrowserPayload(purchase),
    ])
    expect(json).not.toContain('0612345678')
    expect(json).not.toContain('سلمى')
  })

  it('omits value and contents on PageView instead of sending zero', () => {
    const pv = cartEvent('PageView', [])
    expect(pv.value).toBeUndefined()
    expect(buildMetaBrowserPayload(pv)).toEqual({})
    expect(buildTikTokBrowserPayload(pv)).toEqual({})
  })

  it('computes cart value from the items for funnel events', () => {
    const atc = cartEvent('AddToCart', [{ id: 'zit-manaa', name: 'زيت', price: 219, quantity: 2 }])
    expect(atc.value).toBe(438)
    expect(atc.currency).toBe('MAD')
    expect(atc.num_items).toBe(2)
    expect(atc.event_id).toMatch(/^vl-addtocart-/)
  })
})

describe('thank-you refresh idempotency', () => {
  it('marks a purchase as tracked and reports it on the next read', () => {
    expect(wasPurchaseTracked('VL260803-AB12')).toBe(false)
    markPurchaseTracked('VL260803-AB12')
    expect(wasPurchaseTracked('VL260803-AB12')).toBe(true)
  })

  it('scopes the flag per order id', () => {
    markPurchaseTracked('VL-A')
    expect(wasPurchaseTracked('VL-B')).toBe(false)
  })

  it('degrades safely when storage is blocked', () => {
    ;(globalThis as Record<string, any>).window.localStorage = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
    }
    expect(() => markPurchaseTracked('VL-C')).not.toThrow()
    expect(wasPurchaseTracked('VL-C')).toBe(false)
  })
})
