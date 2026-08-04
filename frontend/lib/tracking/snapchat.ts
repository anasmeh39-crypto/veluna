// Snapchat Conversions API (v3) adapter.
//
// Endpoint : POST https://tr.snapchat.com/v3/{pixel_id}/events?access_token=…
// Validate : POST https://tr.snapchat.com/v3/{pixel_id}/events/validate  (test button)
// Dedup    : the browser pixel sends `client_dedup_id`; CAPI sends the exact
//            same string as `event_id`.
// Hashing  : phone = country code + digits, NO leading '+', then SHA-256 —
//            different from TikTok (which requires the '+'). IP and user agent
//            stay raw.
//
// v3 replaced the flat v2 payload (`event_conversion_type`, `hashed_phone_number`,
// `pixel_id` in the body) with this Meta-shaped data[]/user_data/custom_data body.

import type { AdapterInput, AdapterResult, PlatformAdapter } from './adapter'
import { compact, postJson } from './http'
import {
  hashOrUndefined,
  normalizeCity,
  normalizeEmail,
  normalizePhoneForSnapchat,
  splitName,
} from './hash'
import { resolveAccessToken, resolveTestEventCode } from './settings'
import type { TrackingEventName } from './types'

/**
 * Snapchat has a fixed vocabulary of event names. Order-lifecycle events have
 * no standard equivalent, so they map onto the CUSTOM_EVENT_* slots — record
 * this mapping in Snap Ads Manager when you build custom conversions.
 */
const EVENT_NAMES: Record<TrackingEventName, string | null> = {
  PageView:         'PAGE_VIEW',
  ViewContent:      'VIEW_CONTENT',
  AddToCart:        'ADD_CART',
  InitiateCheckout: 'START_CHECKOUT',
  Purchase:         'PURCHASE',
  OrderConfirmed:   'CUSTOM_EVENT_1',
  OrderShipped:     'CUSTOM_EVENT_2',
  OrderDelivered:   'CUSTOM_EVENT_3',
  OrderCancelled:   'CUSTOM_EVENT_4',
  OrderReturned:    'CUSTOM_EVENT_5',
}

function baseUrl(pixelId: string, validate: boolean): string {
  return `https://tr.snapchat.com/v3/${encodeURIComponent(pixelId)}/events${validate ? '/validate' : ''}`
}

function buildUserData(input: AdapterInput): Record<string, unknown> {
  const { context } = input
  const identity = context.identity ?? {}
  const { first, last } = splitName(identity.name)

  return compact({
    em: hashOrUndefined(normalizeEmail(identity.email)),
    ph: hashOrUndefined(normalizePhoneForSnapchat(identity.phone)),
    fn: hashOrUndefined(first),
    ln: hashOrUndefined(last),
    ct: hashOrUndefined(normalizeCity(identity.city)),
    country: hashOrUndefined('ma'),
    external_id: hashOrUndefined(identity.external_id),
    // Raw — Snapchat expects these unhashed.
    client_ip_address: context.ip,
    client_user_agent: context.user_agent,
    sc_click_id: context.sccid,
    sc_cookie1: context.scid,
  })
}

export const snapchatAdapter: PlatformAdapter = {
  platform: 'snapchat',

  eventName(name: TrackingEventName): string | null {
    return EVENT_NAMES[name] ?? null
  },

  buildPayload(input: AdapterInput): Record<string, unknown> | null {
    const eventName = this.eventName(input.event.name)
    if (!eventName) return null

    const { event } = input

    return {
      data: [
        compact({
          event_name: eventName,
          event_time: event.event_time,
          event_id: event.event_id,
          event_source_url: event.event_source_url,
          action_source: 'WEB',
          user_data: buildUserData(input),
          custom_data: compact({
            currency: event.currency,
            value: event.value === undefined ? undefined : String(event.value),
            content_type: 'product',
            content_ids: event.contents.map((c) => c.id),
            num_items: event.num_items,
            // v3 carries the order reference in custom_data; the browser pixel
            // sends the same value as `transaction_id`.
            order_id: event.order_id,
          }),
        }),
      ],
    }
  },

  async send(input: AdapterInput): Promise<AdapterResult> {
    const token = resolveAccessToken(input.settings, 'snapchat')
    if (!token) return { ok: false, error: 'missing access token' }

    const pixelId = input.settings.snapchat.pixel_id
    if (!pixelId) return { ok: false, error: 'missing pixel id' }

    const payload = this.buildPayload(input)
    if (!payload) return { ok: false, error: `unsupported event ${input.event.name}` }

    // Test sends go to /validate, which checks the payload without recording a
    // conversion. The stored test code is attached there only.
    const validate = !!input.test
    const testCode = resolveTestEventCode(input.settings, 'snapchat')
    const body = validate && testCode ? { ...payload, test_event_code: testCode } : payload

    const res = await postJson(
      `${baseUrl(pixelId, validate)}?access_token=${encodeURIComponent(token)}`,
      body
    )
    const parsed = res.body as
      | { status?: string; reason?: string; message?: string; request_id?: string }
      | null

    if (!res.ok || parsed?.status === 'ERROR' || parsed?.status === 'FAILED') {
      const message = parsed?.reason ?? parsed?.message ?? res.error ?? 'unknown error'
      return { ok: false, error: `snapchat: ${message}`.slice(0, 300), trace: parsed?.request_id }
    }
    return { ok: true, trace: parsed?.request_id }
  },
}
