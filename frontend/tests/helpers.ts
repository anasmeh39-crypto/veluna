import type { Order } from '@/lib/db'
import type { AdSettings, ServerEventContext } from '@/lib/tracking/types'
import { DEFAULT_META_API_VERSION } from '@/lib/tracking/types'

/** 32-byte key used by every test that touches encryption. */
export const TEST_KEY = 'a'.repeat(64)

export function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'VL260803-AB12',
    customer_name: 'سلمى العلوي',
    phone: '0612345678',
    city: 'الدار البيضاء',
    address: 'حي المعاريف، شارع 12',
    items: [
      { id: 'zit-manaa', name_ar: 'زيت إزالة الشعر', price_mad: 219, quantity: 2 },
      { id: 'krim-jlid', name_ar: 'كريم الشعر تحت الجلد', price_mad: 99, quantity: 1 },
    ],
    subtotal: 537,
    delivery_fee: 0,
    total: 537,
    payment_method: 'cod',
    status: 'new',
    // Attribution as it is persisted by POST /api/orders.
    utm_source: 'facebook',
    utm_medium: 'cpc',
    utm_campaign: 'aug-oil',
    fbclid: 'IwAR-click-id',
    ttclid: 'tt-click-id',
    sccid: 'sc-click-id',
    fbp: 'fb.1.1717000000000.1234567890',
    fbc: 'fb.1.1717000000000.IwAR-click-id',
    ttp: 'ttp-cookie',
    scid: 'scid-cookie',
    landing_page: 'https://veluna.ma/products/zit-manaa?utm_source=facebook',
    referrer: 'https://l.facebook.com/',
    user_agent: 'Mozilla/5.0 (iPhone)',
    ip_address: '196.200.10.5',
    created_at: '2026-08-03T10:00:00.000Z',
    updated_at: '2026-08-03T10:00:00.000Z',
    ...overrides,
  }
}

export function makeSettings(overrides: Partial<AdSettings> = {}): AdSettings {
  return {
    meta: {
      pixel_enabled: true,
      pixel_id: '123456789012345',
      capi_enabled: true,
      access_token: '',
      api_version: DEFAULT_META_API_VERSION,
      test_event_code: '',
      dataset_id: '',
    },
    tiktok: {
      pixel_enabled: true,
      pixel_code: 'CABCDEF1234567890',
      events_api_enabled: true,
      access_token: '',
      test_event_code: '',
    },
    snapchat: {
      pixel_enabled: true,
      pixel_id: '11111111-2222-3333-4444-555555555555',
      capi_enabled: true,
      access_token: '',
      test_event_code: '',
    },
    purchase_milestone: 'order_created',
    lifecycle_events_enabled: true,
    updated_at: '2026-08-03T10:00:00.000Z',
    ...overrides,
  }
}

export function makeContext(overrides: Partial<ServerEventContext> = {}): ServerEventContext {
  return {
    ip: '196.200.10.5',
    user_agent: 'Mozilla/5.0 (iPhone)',
    fbp: 'fb.1.1717000000000.1234567890',
    fbclid: 'IwAR-click-id',
    ttclid: 'tt-click-id',
    sccid: 'sc-click-id',
    ttp: 'ttp-cookie',
    scid: 'scid-cookie',
    referrer: 'https://facebook.com/',
    identity: {
      phone: '0612345678',
      name: 'Salma Alaoui',
      city: 'Casablanca',
      external_id: '0612345678',
    },
    ...overrides,
  }
}
