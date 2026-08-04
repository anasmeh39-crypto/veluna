// Meta (Facebook) Conversions API adapter.
//
// Endpoint : POST https://graph.facebook.com/{version}/{dataset|pixel}/events
// Dedup    : identical `event_name` + `event_id` on the browser pixel
//            (fbq('track', name, data, { eventID })) and here.
// Hashing  : email/phone/name/city are SHA-256 hashed. IP and user agent are
//            sent RAW — Meta hashes those itself and hashing them breaks matching.

import type { AdapterInput, AdapterResult, PlatformAdapter } from './adapter'
import { compact, postJson } from './http'
import {
  hashOrUndefined,
  normalizeCity,
  normalizeEmail,
  normalizePhoneForMeta,
  splitName,
} from './hash'
import { resolveAccessToken, resolveTestEventCode } from './settings'
import type { TrackingEventName } from './types'

const EVENT_NAMES: Record<TrackingEventName, string | null> = {
  PageView:         'PageView',
  ViewContent:      'ViewContent',
  AddToCart:        'AddToCart',
  InitiateCheckout: 'InitiateCheckout',
  Purchase:         'Purchase',
  // Lifecycle events are custom event names — Meta accepts arbitrary strings.
  OrderConfirmed:   'OrderConfirmed',
  OrderShipped:     'OrderShipped',
  OrderDelivered:   'OrderDelivered',
  OrderCancelled:   'OrderCancelled',
  OrderReturned:    'OrderReturned',
}

/**
 * Builds the `fbc` cookie value from a click id when the browser pixel has not
 * written one yet (e.g. an ad blocker stopped the script but the click is real).
 * Format: fb.{subdomainIndex}.{creationTimeMs}.{fbclid}
 */
export function deriveFbc(
  fbc: string | undefined,
  fbclid: string | undefined,
  nowMs: number = Date.now()
): string | undefined {
  if (fbc) return fbc
  if (!fbclid) return undefined
  return `fb.1.${nowMs}.${fbclid}`
}

function endpoint(settings: AdapterInput['settings']): string {
  const target = settings.meta.dataset_id || settings.meta.pixel_id
  return `https://graph.facebook.com/${settings.meta.api_version}/${target}/events`
}

function buildUserData(input: AdapterInput): Record<string, unknown> {
  const { context } = input
  const identity = context.identity ?? {}
  const { first, last } = splitName(identity.name)

  return compact({
    em: hashOrUndefined(normalizeEmail(identity.email)),
    ph: hashOrUndefined(normalizePhoneForMeta(identity.phone)),
    fn: hashOrUndefined(first),
    ln: hashOrUndefined(last),
    ct: hashOrUndefined(normalizeCity(identity.city)),
    country: hashOrUndefined('ma'),
    external_id: hashOrUndefined(identity.external_id),
    // Raw on purpose — Meta requires these unhashed.
    client_ip_address: context.ip,
    client_user_agent: context.user_agent,
    fbp: context.fbp,
    fbc: deriveFbc(context.fbc, context.fbclid),
  })
}

function buildCustomData(input: AdapterInput): Record<string, unknown> {
  const { event } = input
  return compact({
    currency: event.currency,
    value: event.value,
    content_type: 'product',
    content_ids: event.contents.map((c) => c.id),
    contents: event.contents.map((c) => ({
      id: c.id,
      quantity: c.quantity,
      item_price: c.price,
    })),
    num_items: event.num_items,
    order_id: event.order_id,
    // COD context so the advertiser can segment submitted vs delivered orders.
    order_status: event.order_status,
  })
}

export const metaAdapter: PlatformAdapter = {
  platform: 'meta',

  eventName(name: TrackingEventName): string | null {
    return EVENT_NAMES[name] ?? null
  },

  buildPayload(input: AdapterInput): Record<string, unknown> | null {
    const eventName = this.eventName(input.event.name)
    if (!eventName) return null

    const testCode = resolveTestEventCode(input.settings, 'meta')

    return compact({
      data: [
        compact({
          event_name: eventName,
          event_time: input.event.event_time,
          event_id: input.event.event_id,
          event_source_url: input.event.event_source_url,
          action_source: 'website',
          user_data: buildUserData(input),
          custom_data: buildCustomData(input),
        }),
      ],
      test_event_code: testCode || undefined,
    }) as Record<string, unknown>
  },

  async send(input: AdapterInput): Promise<AdapterResult> {
    const token = resolveAccessToken(input.settings, 'meta')
    if (!token) return { ok: false, error: 'missing access token' }
    if (!input.settings.meta.pixel_id) return { ok: false, error: 'missing pixel id' }

    const payload = this.buildPayload(input)
    if (!payload) return { ok: false, error: `unsupported event ${input.event.name}` }

    const res = await postJson(endpoint(input.settings), { ...payload, access_token: token })
    const body = res.body as { fbtrace_id?: string; error?: { message?: string; code?: number } } | null

    if (!res.ok || body?.error) {
      const message = body?.error?.message ?? res.error ?? 'unknown error'
      return { ok: false, error: `meta: ${message}`.slice(0, 300), trace: body?.fbtrace_id }
    }
    return { ok: true, trace: body?.fbtrace_id }
  },
}
