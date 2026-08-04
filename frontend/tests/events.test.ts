import { describe, expect, it } from 'vitest'
import { makeOrder } from './helpers'
import {
  buildOrderEvent,
  contentsValue,
  lifecycleEventId,
  newEventId,
  numItems,
  purchaseEventId,
  STATUS_EVENT_NAMES,
  toContents,
} from '@/lib/tracking/events'

describe('event ids', () => {
  it('derives the same Purchase event id from the same order id', () => {
    expect(purchaseEventId('VL260803-AB12')).toBe('vl-purchase-VL260803-AB12')
    expect(purchaseEventId('VL260803-AB12')).toBe(purchaseEventId('VL260803-AB12'))
  })

  it('gives different orders different Purchase event ids', () => {
    expect(purchaseEventId('VL1')).not.toBe(purchaseEventId('VL2'))
  })

  it('scopes lifecycle event ids by status', () => {
    expect(lifecycleEventId('VL1', 'confirmed')).toBe('vl-confirmed-VL1')
    expect(lifecycleEventId('VL1', 'confirmed')).not.toBe(lifecycleEventId('VL1', 'delivered'))
    expect(lifecycleEventId('VL1', 'confirmed')).not.toBe(purchaseEventId('VL1'))
  })

  it('generates unique ids for funnel events', () => {
    const ids = new Set(Array.from({ length: 200 }, () => newEventId('addtocart')))
    expect(ids.size).toBe(200)
  })
})

describe('buildOrderEvent', () => {
  it('takes value, currency and contents from the server order', () => {
    const order = makeOrder()
    const event = buildOrderEvent(order, 'Purchase', purchaseEventId(order.id), 'https://veluna.ma/thank-you')

    expect(event.value).toBe(537)
    expect(event.currency).toBe('MAD')
    expect(event.order_id).toBe('VL260803-AB12')
    expect(event.order_status).toBe('new')
    expect(event.num_items).toBe(3)
    expect(event.event_source_url).toBe('https://veluna.ma/thank-you')
    expect(event.contents).toEqual([
      { id: 'zit-manaa', name: 'زيت إزالة الشعر', quantity: 2, price: 219 },
      { id: 'krim-jlid', name: 'كريم الشعر تحت الجلد', quantity: 1, price: 99 },
    ])
  })

  it('uses the order total, not the sum of line items', () => {
    // Delivery fee is part of the order value the store actually collects.
    const order = makeOrder({ subtotal: 537, delivery_fee: 30, total: 567 })
    expect(buildOrderEvent(order, 'Purchase', 'x').value).toBe(567)
  })

  it('carries the current order status for lifecycle events', () => {
    const order = makeOrder({ status: 'delivered' })
    expect(buildOrderEvent(order, 'OrderDelivered', 'x').order_status).toBe('delivered')
  })

  it('stamps event_time in unix seconds', () => {
    const event = buildOrderEvent(makeOrder(), 'Purchase', 'x')
    expect(event.event_time).toBeGreaterThan(1_700_000_000)
    expect(event.event_time).toBeLessThan(4_000_000_000)
    expect(Number.isInteger(event.event_time)).toBe(true)
  })
})

describe('content helpers', () => {
  it('sums value and item count', () => {
    const contents = toContents([
      { id: 'a', price: 219, quantity: 2 },
      { id: 'b', price: 99, quantity: 1 },
    ])
    expect(contentsValue(contents)).toBe(537)
    expect(numItems(contents)).toBe(3)
  })
})

describe('status → lifecycle event mapping', () => {
  it('has no lifecycle event for a new order', () => {
    expect(STATUS_EVENT_NAMES.new).toBeUndefined()
  })

  it('maps every other status', () => {
    expect(STATUS_EVENT_NAMES.confirmed).toBe('OrderConfirmed')
    expect(STATUS_EVENT_NAMES.shipped).toBe('OrderShipped')
    expect(STATUS_EVENT_NAMES.delivered).toBe('OrderDelivered')
    expect(STATUS_EVENT_NAMES.cancelled).toBe('OrderCancelled')
    expect(STATUS_EVENT_NAMES.returned).toBe('OrderReturned')
  })
})
