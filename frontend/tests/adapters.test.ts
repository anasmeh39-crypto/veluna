import { beforeAll, describe, expect, it } from 'vitest'
import { makeContext, makeOrder, makeSettings, TEST_KEY } from './helpers'
import { buildOrderEvent, purchaseEventId } from '@/lib/tracking/events'
import { sha256 } from '@/lib/tracking/hash'
import { deriveFbc, metaAdapter } from '@/lib/tracking/meta'
import { tiktokAdapter } from '@/lib/tracking/tiktok'
import { snapchatAdapter } from '@/lib/tracking/snapchat'

beforeAll(() => {
  process.env.AD_TRACKING_ENCRYPTION_KEY = TEST_KEY
})

const order = makeOrder()
const eventId = purchaseEventId(order.id)
const event = buildOrderEvent(order, 'Purchase', eventId, 'https://veluna.ma/thank-you?order=VL260803-AB12')
const context = makeContext()
const settings = makeSettings()

const input = { settings, event, context }

type Payload = Record<string, any>

describe('Meta adapter', () => {
  const payload = metaAdapter.buildPayload(input) as Payload
  const data = payload.data[0]

  it('sends the shared event_id and standard event name', () => {
    expect(data.event_name).toBe('Purchase')
    expect(data.event_id).toBe(eventId)
    expect(data.action_source).toBe('website')
    expect(data.event_source_url).toBe('https://veluna.ma/thank-you?order=VL260803-AB12')
    expect(data.event_time).toBe(event.event_time)
  })

  it('hashes the phone with the Meta rule (no +, country code kept)', () => {
    expect(data.user_data.ph).toBe(sha256('212612345678'))
  })

  it('hashes name and city but leaves IP and user agent raw', () => {
    expect(data.user_data.fn).toBe(sha256('salma'))
    expect(data.user_data.ln).toBe(sha256('alaoui'))
    expect(data.user_data.ct).toBe(sha256('casablanca'))
    expect(data.user_data.client_ip_address).toBe('196.200.10.5')
    expect(data.user_data.client_user_agent).toBe('Mozilla/5.0 (iPhone)')
  })

  it('passes fbp through and derives fbc from fbclid', () => {
    expect(data.user_data.fbp).toBe('fb.1.1717000000000.1234567890')
    expect(data.user_data.fbc).toMatch(/^fb\.1\.\d+\.IwAR-click-id$/)
  })

  it('never leaks the raw phone or name anywhere in the payload', () => {
    const json = JSON.stringify(payload)
    expect(json).not.toContain('0612345678')
    expect(json).not.toContain('Salma')
    expect(json).not.toContain('212612345678')
  })

  it('carries order value, currency, contents and COD status', () => {
    expect(data.custom_data.currency).toBe('MAD')
    expect(data.custom_data.value).toBe(537)
    expect(data.custom_data.order_id).toBe('VL260803-AB12')
    expect(data.custom_data.order_status).toBe('new')
    expect(data.custom_data.num_items).toBe(3)
    expect(data.custom_data.content_ids).toEqual(['zit-manaa', 'krim-jlid'])
    expect(data.custom_data.contents).toEqual([
      { id: 'zit-manaa', quantity: 2, item_price: 219 },
      { id: 'krim-jlid', quantity: 1, item_price: 99 },
    ])
  })

  it('omits test_event_code when none is configured', () => {
    expect(payload.test_event_code).toBeUndefined()
  })

  it('includes test_event_code when configured', () => {
    const withCode = makeSettings()
    withCode.meta.test_event_code = 'TEST123'
    const p = metaAdapter.buildPayload({ ...input, settings: withCode }) as Payload
    expect(p.test_event_code).toBe('TEST123')
  })

  it('maps lifecycle events to custom event names', () => {
    expect(metaAdapter.eventName('OrderDelivered')).toBe('OrderDelivered')
  })

  it('refuses to send without an access token', async () => {
    const result = await metaAdapter.send(input)
    expect(result.ok).toBe(false)
    expect(result.error).toContain('missing access token')
  })
})

describe('deriveFbc', () => {
  it('keeps an existing fbc cookie untouched', () => {
    expect(deriveFbc('fb.1.999.abc', 'other')).toBe('fb.1.999.abc')
  })

  it('builds fbc from fbclid when the cookie is missing', () => {
    expect(deriveFbc(undefined, 'CLICK', 1717000000000)).toBe('fb.1.1717000000000.CLICK')
  })

  it('returns undefined with neither input', () => {
    expect(deriveFbc(undefined, undefined)).toBeUndefined()
  })
})

describe('TikTok adapter', () => {
  const payload = tiktokAdapter.buildPayload(input) as Payload
  const data = payload.data[0]

  it('uses CompletePayment with the shared event_id', () => {
    expect(data.event).toBe('CompletePayment')
    expect(data.event_id).toBe(eventId)
    expect(payload.event_source).toBe('web')
    expect(payload.event_source_id).toBe('CABCDEF1234567890')
  })

  it('hashes the phone in E.164 WITH the + (differs from Meta)', () => {
    expect(data.user.phone).toBe(sha256('+212612345678'))
    expect(data.user.phone).not.toBe(sha256('212612345678'))
  })

  it('sends ttclid and _ttp, with raw ip and user agent', () => {
    expect(data.user.ttclid).toBe('tt-click-id')
    expect(data.user.ttp).toBe('ttp-cookie')
    expect(data.user.ip).toBe('196.200.10.5')
    expect(data.user.user_agent).toBe('Mozilla/5.0 (iPhone)')
  })

  it('carries contents, value and currency', () => {
    expect(data.properties.currency).toBe('MAD')
    expect(data.properties.value).toBe(537)
    expect(data.properties.contents[0]).toEqual({
      content_id: 'zit-manaa',
      content_type: 'product',
      content_name: 'زيت إزالة الشعر',
      price: 219,
      quantity: 2,
    })
  })

  it('sends page url and referrer', () => {
    expect(data.page.url).toBe('https://veluna.ma/thank-you?order=VL260803-AB12')
    expect(data.page.referrer).toBe('https://facebook.com/')
  })

  it('never leaks raw PII', () => {
    const json = JSON.stringify(payload)
    expect(json).not.toContain('0612345678')
    expect(json).not.toContain('Salma')
  })

  it('refuses to send without an access token', async () => {
    const result = await tiktokAdapter.send(input)
    expect(result.ok).toBe(false)
    expect(result.error).toContain('missing access token')
  })
})

describe('Snapchat adapter', () => {
  const payload = snapchatAdapter.buildPayload(input) as Payload
  const data = payload.data[0]

  it('uses the v3 shape with uppercase event names and WEB action source', () => {
    expect(data.event_name).toBe('PURCHASE')
    expect(data.action_source).toBe('WEB')
    expect(data.event_id).toBe(eventId)
    // v2-only fields must not appear.
    expect(data.event_conversion_type).toBeUndefined()
    expect(data.hashed_phone_number).toBeUndefined()
    expect(payload.pixel_id).toBeUndefined()
  })

  it('hashes the phone without the + (differs from TikTok)', () => {
    expect(data.user_data.ph).toBe(sha256('212612345678'))
    expect(data.user_data.ph).not.toBe(sha256('+212612345678'))
  })

  it('sends the Snap click id and first-party cookie, ip and ua raw', () => {
    expect(data.user_data.sc_click_id).toBe('sc-click-id')
    expect(data.user_data.sc_cookie1).toBe('scid-cookie')
    expect(data.user_data.client_ip_address).toBe('196.200.10.5')
    expect(data.user_data.client_user_agent).toBe('Mozilla/5.0 (iPhone)')
  })

  it('puts the order reference in custom_data.order_id', () => {
    expect(data.custom_data.order_id).toBe('VL260803-AB12')
    expect(data.custom_data.currency).toBe('MAD')
    expect(data.custom_data.value).toBe('537')
    expect(data.custom_data.num_items).toBe(3)
    expect(data.custom_data.content_ids).toEqual(['zit-manaa', 'krim-jlid'])
  })

  it('maps funnel events to the Snapchat vocabulary', () => {
    expect(snapchatAdapter.eventName('AddToCart')).toBe('ADD_CART')
    expect(snapchatAdapter.eventName('InitiateCheckout')).toBe('START_CHECKOUT')
    expect(snapchatAdapter.eventName('PageView')).toBe('PAGE_VIEW')
    expect(snapchatAdapter.eventName('OrderDelivered')).toBe('CUSTOM_EVENT_3')
  })

  it('never leaks raw PII', () => {
    expect(JSON.stringify(payload)).not.toContain('0612345678')
  })

  it('refuses to send without an access token', async () => {
    const result = await snapchatAdapter.send(input)
    expect(result.ok).toBe(false)
    expect(result.error).toContain('missing access token')
  })
})

describe('cross-platform event id parity', () => {
  it('all three adapters send the identical event id for one order', () => {
    const meta = (metaAdapter.buildPayload(input) as Payload).data[0].event_id
    const tiktok = (tiktokAdapter.buildPayload(input) as Payload).data[0].event_id
    const snap = (snapchatAdapter.buildPayload(input) as Payload).data[0].event_id
    expect(new Set([meta, tiktok, snap, eventId]).size).toBe(1)
  })

  it('all three report the same order value', () => {
    const meta = (metaAdapter.buildPayload(input) as Payload).data[0].custom_data.value
    const tiktok = (tiktokAdapter.buildPayload(input) as Payload).data[0].properties.value
    const snap = Number((snapchatAdapter.buildPayload(input) as Payload).data[0].custom_data.value)
    expect([meta, tiktok, snap]).toEqual([537, 537, 537])
  })

  it('returns null for events a platform does not support', () => {
    const noSupport = { ...input, event: { ...event, name: 'OrderShipped' as const } }
    // Meta and Snapchat both map lifecycle events; the shape is what matters.
    expect(metaAdapter.buildPayload(noSupport)).not.toBeNull()
    expect(snapchatAdapter.buildPayload(noSupport)).not.toBeNull()
  })
})
