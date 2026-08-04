// Server-side event dispatch.
//
// Rules enforced here:
//  • one platform failing never affects the others (Promise.allSettled)
//  • nothing throws — order creation must never fail because of tracking
//  • every send is claimed first, so a Purchase is delivered at most once
//  • payloads are built from the validated order, never from client input
//  • logs carry platform + event + error only: no tokens, no PII, no payloads

import type { NextRequest } from 'next/server'
import type { Order, OrderStatus } from '@/lib/db'
import { metaAdapter } from './meta'
import { snapchatAdapter } from './snapchat'
import { tiktokAdapter } from './tiktok'
import { claimEvent, recordEvent } from './log'
import { getAdSettings, serverReady } from './settings'
import {
  buildOrderEvent,
  lifecycleEventId,
  newEventId,
  nowInSeconds,
  purchaseEventId,
  STATUS_EVENT_NAMES,
} from './events'
import type { PlatformAdapter } from './adapter'
import {
  AD_PLATFORMS,
  STORE_CURRENCY,
  type AdPlatform,
  type AdSettings,
  type CanonicalEvent,
  type DispatchResult,
  type ServerEventContext,
  type TrackingEventName,
} from './types'

const ADAPTERS: Record<AdPlatform, PlatformAdapter> = {
  meta: metaAdapter,
  tiktok: tiktokAdapter,
  snapchat: snapchatAdapter,
}

export interface DispatchInput {
  event: CanonicalEvent
  context: ServerEventContext
  platforms?: AdPlatform[]
  /** Bypasses the idempotency claim and uses the platform's validate/test path. */
  test?: boolean
  settings?: AdSettings
}

async function dispatchToPlatform(
  platform: AdPlatform,
  input: DispatchInput,
  settings: AdSettings
): Promise<DispatchResult> {
  const { event } = input
  const base = { platform, event: event.name, event_id: event.event_id }

  if (!serverReady(settings, platform)) {
    return { ...base, status: 'skipped', reason: 'server tracking not configured' }
  }

  const adapter = ADAPTERS[platform]
  if (!adapter.eventName(event.name)) {
    return { ...base, status: 'skipped', reason: 'event not supported by platform' }
  }

  if (!input.test) {
    const claimed = await claimEvent({
      platform,
      eventName: event.name,
      eventId: event.event_id,
      orderId: event.order_id,
    })
    if (!claimed) {
      return { ...base, status: 'duplicate', reason: 'already delivered' }
    }
  }

  let result
  try {
    result = await adapter.send({ settings, event, context: input.context, test: input.test })
  } catch (err) {
    result = { ok: false, error: err instanceof Error ? err.message : 'adapter threw' }
  }

  if (!input.test) {
    await recordEvent({
      platform,
      eventName: event.name,
      eventId: event.event_id,
      orderId: event.order_id,
      status: result.ok ? 'sent' : 'failed',
      error: result.error,
    })
  }

  if (!result.ok) {
    console.error(`[tracking] ${platform} ${event.name} failed: ${result.error ?? 'unknown'}`)
    return { ...base, status: 'failed', reason: result.error, trace: result.trace }
  }
  return { ...base, status: 'sent', trace: result.trace }
}

/** Dispatches one canonical event to every requested platform. Never throws. */
export async function dispatchEvent(input: DispatchInput): Promise<DispatchResult[]> {
  try {
    const settings = input.settings ?? (await getAdSettings())
    const platforms = input.platforms ?? AD_PLATFORMS

    const settled = await Promise.allSettled(
      platforms.map((p) => dispatchToPlatform(p, input, settings))
    )

    return settled.map((r, i) =>
      r.status === 'fulfilled'
        ? r.value
        : {
            platform: platforms[i],
            event: input.event.name,
            event_id: input.event.event_id,
            status: 'failed' as const,
            reason: 'dispatch error',
          }
    )
  } catch (err) {
    console.error('[tracking] dispatch aborted:', err instanceof Error ? err.message : err)
    return []
  }
}

// ─── Order conversions ───────────────────────────────────────────────────────

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '')
}

/**
 * Sends the Purchase conversion for a newly created order — but only when the
 * configured milestone is `order_created`. With `confirmed` / `delivered` the
 * Purchase is held back until the admin moves the order to that status.
 */
export async function dispatchOrderPurchase(
  order: Order,
  context: ServerEventContext,
  eventSourceUrl?: string
): Promise<DispatchResult[]> {
  const settings = await getAdSettings()
  if (settings.purchase_milestone !== 'order_created') return []

  const event = buildOrderEvent(
    order,
    'Purchase',
    purchaseEventId(order.id),
    eventSourceUrl || `${siteUrl()}/thank-you?order=${order.id}`
  )
  return dispatchEvent({ event, context, settings })
}

/**
 * Handles an admin status change: emits the lifecycle event, and emits the
 * Purchase here instead if the configured milestone is this status.
 */
export async function dispatchOrderStatusChange(
  order: Order,
  status: OrderStatus
): Promise<DispatchResult[]> {
  const settings = await getAdSettings()
  const context = contextFromOrder(order)
  const results: DispatchResult[] = []

  const milestoneReached =
    (settings.purchase_milestone === 'confirmed' && status === 'confirmed') ||
    (settings.purchase_milestone === 'delivered' && status === 'delivered')

  if (milestoneReached) {
    const event = buildOrderEvent(
      order,
      'Purchase',
      purchaseEventId(order.id),
      `${siteUrl()}/thank-you?order=${order.id}`
    )
    results.push(...(await dispatchEvent({ event, context, settings })))
  }

  const lifecycleName = STATUS_EVENT_NAMES[status]
  if (settings.lifecycle_events_enabled && lifecycleName) {
    const event = buildOrderEvent(
      order,
      lifecycleName,
      lifecycleEventId(order.id, status),
      `${siteUrl()}/thank-you?order=${order.id}`
    )
    results.push(...(await dispatchEvent({ event, context, settings })))
  }

  return results
}

/** Rebuilds the tracking context from the attribution stored on the order. */
export function contextFromOrder(order: Order): ServerEventContext {
  return {
    ip: order.ip_address,
    user_agent: order.user_agent,
    fbclid: order.fbclid,
    fbp: order.fbp,
    fbc: order.fbc,
    ttclid: order.ttclid,
    ttp: order.ttp,
    sccid: order.sccid,
    scid: order.scid,
    referrer: order.referrer,
    landing_page: order.landing_page,
    utm_source: order.utm_source,
    utm_medium: order.utm_medium,
    utm_campaign: order.utm_campaign,
    utm_content: order.utm_content,
    utm_term: order.utm_term,
    identity: {
      phone: order.phone,
      name: order.customer_name,
      city: order.city,
      external_id: order.phone,
    },
  }
}

// ─── Request helpers ─────────────────────────────────────────────────────────

function clean(value: unknown, max = 255): string | undefined {
  if (value === undefined || value === null) return undefined
  const s = String(value).trim().slice(0, max)
  return s || undefined
}

/**
 * Attribution from the incoming request: first-party cookies written by the
 * pixels, plus whatever the client captured from the landing URL. Client values
 * are treated as untrusted strings — they are length-capped and only ever used
 * as opaque match keys, never for pricing or order state.
 */
export function attributionFromRequest(
  req: NextRequest,
  body: Record<string, unknown> = {}
): ServerEventContext {
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : undefined
  const cookie = (name: string) => req.cookies.get(name)?.value

  return {
    ip,
    user_agent: req.headers.get('user-agent') ?? undefined,
    fbclid: clean(body.fbclid),
    ttclid: clean(body.ttclid),
    sccid: clean(body.sccid),
    // Cookies are the authoritative source for the browser identifiers; the
    // body is a fallback for when the request carries no cookies.
    fbp: cookie('_fbp') ?? clean(body.fbp),
    fbc: cookie('_fbc') ?? clean(body.fbc),
    ttp: cookie('_ttp') ?? clean(body.ttp),
    scid: cookie('_scid') ?? clean(body.scid),
    landing_page: clean(body.landing_page, 500),
    referrer: clean(body.referrer, 500),
    utm_source: clean(body.utm_source, 100),
    utm_medium: clean(body.utm_medium, 100),
    utm_campaign: clean(body.utm_campaign, 100),
    utm_content: clean(body.utm_content, 100),
    utm_term: clean(body.utm_term, 100),
  }
}

// ─── Test events ─────────────────────────────────────────────────────────────

/**
 * Sends a harmless synthetic event through the real server-side integration so
 * the admin can confirm credentials work. No customer data is involved and the
 * platform's validate/test path is used where one exists.
 */
export async function sendTestEvent(platform: AdPlatform): Promise<DispatchResult> {
  const settings = await getAdSettings()
  const event: CanonicalEvent = {
    name: 'ViewContent',
    event_id: newEventId('test'),
    event_time: nowInSeconds(),
    event_source_url: `${siteUrl()}/`,
    currency: STORE_CURRENCY,
    value: 0,
    contents: [{ id: 'veluna-test', name: 'Veluna test event', quantity: 1, price: 0 }],
    num_items: 1,
  }

  const [result] = await dispatchEvent({
    event,
    context: { user_agent: 'Veluna-Admin-Test/1.0' },
    platforms: [platform],
    test: true,
    settings,
  })

  return (
    result ?? {
      platform,
      event: 'ViewContent' as TrackingEventName,
      event_id: event.event_id,
      status: 'failed',
      reason: 'no dispatch result',
    }
  )
}
