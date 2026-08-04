// TikTok Events API (v1.3) adapter.
//
// Endpoint : POST https://business-api.tiktok.com/open_api/v1.3/event/track/
//            header `Access-Token: <token>`
// Dedup    : identical `event_id` on ttq.track(name, props, { event_id }) and here.
// Hashing  : phone must be E.164 **with the leading +** before SHA-256 — this is
//            deliberately different from Meta and Snapchat. Email and external_id
//            are also SHA-256. IP and user agent stay raw.

import type { AdapterInput, AdapterResult, PlatformAdapter } from './adapter'
import { compact, postJson } from './http'
import { hashOrUndefined, normalizeEmail, normalizePhoneForTikTok } from './hash'
import { resolveAccessToken, resolveTestEventCode } from './settings'
import type { TrackingEventName } from './types'

const ENDPOINT = 'https://business-api.tiktok.com/open_api/v1.3/event/track/'

/**
 * Purchase → CompletePayment.
 *
 * TikTok also offers `PlaceAnOrder`, which maps more literally to a COD order
 * submission. We use CompletePayment because it is the event TikTok's Value
 * Optimization and Smart Performance campaigns optimise for; the COD nuance is
 * carried in `properties.order_status` instead. Change this one constant if you
 * decide to bid on PlaceAnOrder instead.
 */
const PURCHASE_EVENT = 'CompletePayment'

const EVENT_NAMES: Record<TrackingEventName, string | null> = {
  PageView:         'Pageview',
  ViewContent:      'ViewContent',
  AddToCart:        'AddToCart',
  InitiateCheckout: 'InitiateCheckout',
  Purchase:         PURCHASE_EVENT,
  OrderConfirmed:   'OrderConfirmed',
  OrderShipped:     'OrderShipped',
  OrderDelivered:   'OrderDelivered',
  OrderCancelled:   'OrderCancelled',
  OrderReturned:    'OrderReturned',
}

function buildUser(input: AdapterInput): Record<string, unknown> {
  const { context } = input
  const identity = context.identity ?? {}

  return compact({
    email: hashOrUndefined(normalizeEmail(identity.email)),
    phone: hashOrUndefined(normalizePhoneForTikTok(identity.phone)),
    external_id: hashOrUndefined(identity.external_id),
    ttclid: context.ttclid,
    ttp: context.ttp,
    ip: context.ip,
    user_agent: context.user_agent,
  })
}

export const tiktokAdapter: PlatformAdapter = {
  platform: 'tiktok',

  eventName(name: TrackingEventName): string | null {
    return EVENT_NAMES[name] ?? null
  },

  buildPayload(input: AdapterInput): Record<string, unknown> | null {
    const eventName = this.eventName(input.event.name)
    if (!eventName) return null

    const { event, context, settings } = input
    const testCode = resolveTestEventCode(settings, 'tiktok')

    return compact({
      event_source: 'web',
      event_source_id: settings.tiktok.pixel_code,
      test_event_code: testCode || undefined,
      data: [
        compact({
          event: eventName,
          event_time: event.event_time,
          event_id: event.event_id,
          user: buildUser(input),
          properties: compact({
            currency: event.currency,
            value: event.value,
            content_type: 'product',
            contents: event.contents.map((c) =>
              compact({
                content_id: c.id,
                content_type: 'product',
                content_name: c.name,
                price: c.price,
                quantity: c.quantity,
              })
            ),
            order_id: event.order_id,
            order_status: event.order_status,
          }),
          page: compact({
            url: event.event_source_url,
            referrer: context.referrer,
          }),
        }),
      ],
    }) as Record<string, unknown>
  },

  async send(input: AdapterInput): Promise<AdapterResult> {
    const token = resolveAccessToken(input.settings, 'tiktok')
    if (!token) return { ok: false, error: 'missing access token' }
    if (!input.settings.tiktok.pixel_code) return { ok: false, error: 'missing pixel code' }

    const payload = this.buildPayload(input)
    if (!payload) return { ok: false, error: `unsupported event ${input.event.name}` }

    const res = await postJson(ENDPOINT, payload, { headers: { 'Access-Token': token } })
    const body = res.body as { code?: number; message?: string; request_id?: string } | null

    // TikTok returns HTTP 200 with a non-zero `code` for application errors.
    if (!res.ok || (body?.code !== undefined && body.code !== 0)) {
      const message = body?.message ?? res.error ?? 'unknown error'
      return { ok: false, error: `tiktok: ${message}`.slice(0, 300), trace: body?.request_id }
    }
    return { ok: true, trace: body?.request_id }
  },
}
