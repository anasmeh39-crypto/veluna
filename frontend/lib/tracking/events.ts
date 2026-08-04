// Event identity + canonical event construction.
//
// Isomorphic: imported by both the browser layer and the server dispatcher, so
// it must not import node-only modules.

import type { Order } from '@/lib/db'
import {
  STORE_CURRENCY,
  type CanonicalEvent,
  type TrackingContent,
  type TrackingEventName,
} from './types'

/**
 * Purchase event id — deterministic from the Veluna order id.
 *
 * The browser (thank-you page) and the server (order API) both derive the same
 * string without coordinating, which is what makes browser/server dedup work.
 */
export function purchaseEventId(orderId: string): string {
  return `vl-purchase-${orderId}`
}

/** Lifecycle events are one-per-order-per-status, so the id encodes both. */
export function lifecycleEventId(orderId: string, status: string): string {
  return `vl-${status}-${orderId}`
}

/** Random id for funnel events that have no server counterpart to match. */
export function newEventId(prefix: string): string {
  const g = globalThis as { crypto?: { randomUUID?: () => string } }
  const random =
    typeof g.crypto?.randomUUID === 'function'
      ? g.crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  return `vl-${prefix}-${random}`
}

export function nowInSeconds(): number {
  return Math.floor(Date.now() / 1000)
}

export interface CartLike {
  id: string
  name?: string
  price: number
  quantity: number
}

export function toContents(items: CartLike[]): TrackingContent[] {
  return items.map((i) => ({
    id: i.id,
    name: i.name,
    quantity: i.quantity,
    price: i.price,
  }))
}

export function contentsValue(contents: TrackingContent[]): number {
  return contents.reduce((sum, c) => sum + c.price * c.quantity, 0)
}

export function numItems(contents: TrackingContent[]): number {
  return contents.reduce((sum, c) => sum + c.quantity, 0)
}

/**
 * Builds the conversion event from the *validated server-side order*.
 * Prices, totals, currency and product names come from the persisted order —
 * never from the client payload.
 */
export function buildOrderEvent(
  order: Order,
  name: TrackingEventName,
  eventId: string,
  eventSourceUrl?: string
): CanonicalEvent {
  const contents: TrackingContent[] = order.items.map((i) => ({
    id: i.id,
    name: i.name_ar,
    quantity: i.quantity,
    price: i.price_mad,
  }))

  return {
    name,
    event_id: eventId,
    event_time: nowInSeconds(),
    event_source_url: eventSourceUrl,
    currency: STORE_CURRENCY,
    value: order.total,
    contents,
    order_id: order.id,
    order_status: order.status,
    num_items: numItems(contents),
  }
}

/** Order status → lifecycle event name. `new` has no lifecycle event. */
export const STATUS_EVENT_NAMES: Record<string, TrackingEventName | undefined> = {
  new:       undefined,
  confirmed: 'OrderConfirmed',
  shipped:   'OrderShipped',
  delivered: 'OrderDelivered',
  cancelled: 'OrderCancelled',
  returned:  'OrderReturned',
}
