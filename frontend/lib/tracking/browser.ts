'use client'

// Browser tracking layer.
//
// Components never call fbq / ttq / snaptr directly — they emit a
// CanonicalEvent through `trackBrowserEvent` and this module translates it per
// platform. Every call is wrapped so a blocked pixel, an ad blocker or a
// half-loaded script can never break checkout or navigation.

import { newEventId, nowInSeconds, type CartLike } from './events'
import { toContents, contentsValue, numItems } from './events'
import { STORE_CURRENCY, type CanonicalEvent, type PublicTrackingConfig, type TrackingEventName } from './types'

type Fbq = (...args: unknown[]) => void
type Ttq = { track: (name: string, props?: unknown, opts?: unknown) => void; page: () => void }
type Snaptr = (...args: unknown[]) => void

interface TrackingWindow extends Window {
  fbq?: Fbq
  ttq?: Ttq
  snaptr?: Snaptr
}

function w(): TrackingWindow | undefined {
  return typeof window === 'undefined' ? undefined : (window as TrackingWindow)
}

/** Runs a pixel call, swallowing anything the third-party script throws. */
function safely(label: string, fn: () => void): void {
  try {
    fn()
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[tracking] ${label} call failed`, err)
    }
  }
}

// ─── Platform event names (browser side) ─────────────────────────────────────
// These must match the adapters in meta.ts / tiktok.ts / snapchat.ts so that
// browser and server events dedupe against each other.

const META_EVENTS: Record<TrackingEventName, string | null> = {
  PageView: 'PageView',
  ViewContent: 'ViewContent',
  AddToCart: 'AddToCart',
  InitiateCheckout: 'InitiateCheckout',
  Purchase: 'Purchase',
  OrderConfirmed: null,
  OrderShipped: null,
  OrderDelivered: null,
  OrderCancelled: null,
  OrderReturned: null,
}

const TIKTOK_EVENTS: Record<TrackingEventName, string | null> = {
  PageView: 'Pageview',
  ViewContent: 'ViewContent',
  AddToCart: 'AddToCart',
  InitiateCheckout: 'InitiateCheckout',
  Purchase: 'CompletePayment',
  OrderConfirmed: null,
  OrderShipped: null,
  OrderDelivered: null,
  OrderCancelled: null,
  OrderReturned: null,
}

const SNAP_EVENTS: Record<TrackingEventName, string | null> = {
  PageView: 'PAGE_VIEW',
  ViewContent: 'VIEW_CONTENT',
  AddToCart: 'ADD_CART',
  InitiateCheckout: 'START_CHECKOUT',
  Purchase: 'PURCHASE',
  OrderConfirmed: null,
  OrderShipped: null,
  OrderDelivered: null,
  OrderCancelled: null,
  OrderReturned: null,
}

// ─── Payload builders (pure — unit tested) ───────────────────────────────────

export function buildMetaBrowserPayload(event: CanonicalEvent): Record<string, unknown> {
  const payload: Record<string, unknown> = {}
  if (event.value !== undefined) {
    payload.value = event.value
    payload.currency = event.currency
  }
  if (event.contents.length > 0) {
    payload.content_type = 'product'
    payload.content_ids = event.contents.map((c) => c.id)
    payload.contents = event.contents.map((c) => ({ id: c.id, quantity: c.quantity, item_price: c.price }))
    const names = event.contents.map((c) => c.name).filter(Boolean).join(' + ')
    if (names) payload.content_name = names
    if (event.num_items !== undefined) payload.num_items = event.num_items
  }
  if (event.order_id) payload.order_id = event.order_id
  return payload
}

export function buildTikTokBrowserPayload(event: CanonicalEvent): Record<string, unknown> {
  const payload: Record<string, unknown> = {}
  if (event.value !== undefined) {
    payload.value = event.value
    payload.currency = event.currency
  }
  if (event.contents.length > 0) {
    payload.content_type = 'product'
    payload.contents = event.contents.map((c) => ({
      content_id: c.id,
      content_type: 'product',
      content_name: c.name,
      price: c.price,
      quantity: c.quantity,
    }))
  }
  if (event.order_id) payload.order_id = event.order_id
  return payload
}

export function buildSnapBrowserPayload(event: CanonicalEvent): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    // Snapchat dedupes on client_dedup_id ⇄ CAPI event_id.
    client_dedup_id: event.event_id,
  }
  if (event.value !== undefined) {
    payload.price = event.value
    payload.currency = event.currency
  }
  if (event.contents.length > 0) {
    payload.item_ids = event.contents.map((c) => c.id)
    if (event.num_items !== undefined) payload.number_items = event.num_items
  }
  if (event.order_id) payload.transaction_id = event.order_id
  return payload
}

// ─── Dispatch ────────────────────────────────────────────────────────────────

type PixelName = 'meta' | 'tiktok' | 'snapchat'

function pixelReady(platform: PixelName): boolean {
  const win = w()
  if (!win) return false
  if (platform === 'meta') return typeof win.fbq === 'function'
  if (platform === 'tiktok') return typeof win.ttq?.track === 'function'
  return typeof win.snaptr === 'function'
}

/**
 * Events can be emitted before a deferred pixel script has finished loading
 * (ViewContent on a cold product page, for example). Rather than dropping them
 * we hold them briefly and flush once the global appears. Entries expire so a
 * blocked script never leaves work queued forever.
 */
const QUEUE_TTL_MS = 10_000
const pending: { platform: PixelName; run: () => void; expires: number }[] = []
let drainTimer: ReturnType<typeof setInterval> | null = null

function drain(): void {
  const now = Date.now()
  for (let i = pending.length - 1; i >= 0; i--) {
    const item = pending[i]
    if (pixelReady(item.platform)) {
      pending.splice(i, 1)
      safely(item.platform, item.run)
    } else if (now > item.expires) {
      pending.splice(i, 1)
    }
  }
  if (pending.length === 0 && drainTimer) {
    clearInterval(drainTimer)
    drainTimer = null
  }
}

function call(platform: PixelName, run: () => void): void {
  if (pixelReady(platform)) {
    safely(platform, run)
    return
  }
  pending.push({ platform, run, expires: Date.now() + QUEUE_TTL_MS })
  if (!drainTimer) drainTimer = setInterval(drain, 300)
}

export function trackBrowserEvent(event: CanonicalEvent, config: PublicTrackingConfig): void {
  const win = w()
  if (!win) return

  const metaName = META_EVENTS[event.name]
  if (config.meta.enabled && metaName) {
    call('meta', () => {
      win.fbq?.('track', metaName, buildMetaBrowserPayload(event), { eventID: event.event_id })
    })
  }

  const tiktokName = TIKTOK_EVENTS[event.name]
  if (config.tiktok.enabled && tiktokName) {
    call('tiktok', () => {
      win.ttq?.track(tiktokName, buildTikTokBrowserPayload(event), { event_id: event.event_id })
    })
  }

  const snapName = SNAP_EVENTS[event.name]
  if (config.snapchat.enabled && snapName) {
    call('snapchat', () => {
      win.snaptr?.('track', snapName, buildSnapBrowserPayload(event))
    })
  }
}

/** Convenience builder for funnel events assembled from local cart state. */
export function cartEvent(
  name: TrackingEventName,
  items: CartLike[],
  opts: { eventId?: string; orderId?: string; value?: number } = {}
): CanonicalEvent {
  const contents = toContents(items)
  // PageView and other content-less events carry no value at all rather than a
  // misleading 0.
  const value = opts.value ?? (contents.length > 0 ? contentsValue(contents) : undefined)

  return {
    name,
    event_id: opts.eventId ?? newEventId(name.toLowerCase()),
    event_time: nowInSeconds(),
    event_source_url: typeof window === 'undefined' ? undefined : window.location.href,
    currency: STORE_CURRENCY,
    value,
    contents,
    order_id: opts.orderId,
    num_items: contents.length > 0 ? numItems(contents) : undefined,
  }
}

// ─── Browser-side purchase idempotency ───────────────────────────────────────
// Refreshing /thank-you must not fire a second Purchase. The platforms would
// also dedupe on event_id, but not sending it at all is cheaper and exact.

const PURCHASE_KEY_PREFIX = 'veluna_purchase_'

export function wasPurchaseTracked(orderId: string): boolean {
  try {
    return window.localStorage.getItem(PURCHASE_KEY_PREFIX + orderId) === '1'
  } catch {
    return false
  }
}

export function markPurchaseTracked(orderId: string): void {
  try {
    window.localStorage.setItem(PURCHASE_KEY_PREFIX + orderId, '1')
  } catch {
    /* storage blocked — the shared event_id still protects against duplicates */
  }
}
