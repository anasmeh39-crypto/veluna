// Platform-neutral tracking types shared by the browser layer, the server
// dispatcher and the per-platform adapters.
//
// SECURITY: anything named *_token lives ONLY on the server. The browser is
// only ever given the values in `PublicTrackingConfig`.

export type AdPlatform = 'meta' | 'tiktok' | 'snapchat'

export const AD_PLATFORMS: AdPlatform[] = ['meta', 'tiktok', 'snapchat']

/** Meta Graph API version used for Conversions API calls. */
export const DEFAULT_META_API_VERSION = 'v23.0'

/** Currency is fixed for the Moroccan store — never taken from the client. */
export const STORE_CURRENCY = 'MAD'

// ─── Stored settings ─────────────────────────────────────────────────────────
// `access_token` is stored ENCRYPTED (AES-256-GCM). It is never returned to the
// browser and never logged.

export interface MetaSettings {
  pixel_enabled: boolean
  pixel_id: string
  capi_enabled: boolean
  access_token: string
  api_version: string
  test_event_code: string
  /** Optional dataset id — some API versions address the dataset, not the pixel. */
  dataset_id: string
}

export interface TikTokSettings {
  pixel_enabled: boolean
  pixel_code: string
  events_api_enabled: boolean
  access_token: string
  test_event_code: string
}

export interface SnapchatSettings {
  pixel_enabled: boolean
  pixel_id: string
  capi_enabled: boolean
  access_token: string
  test_event_code: string
}

/**
 * Which order milestone counts as the advertising "Purchase" conversion.
 *
 * COD tradeoff (see backend/ADVERTISING.md):
 *  - `order_created` (default) — optimises for submitted orders. Fastest signal,
 *    best for algorithm learning, but includes orders that later cancel.
 *  - `confirmed` / `delivered` — cleaner revenue, but the delay (hours to days)
 *    starves the ad platforms of signal and breaks click-attribution windows.
 */
export type PurchaseMilestone = 'order_created' | 'confirmed' | 'delivered'

export const PURCHASE_MILESTONES: PurchaseMilestone[] = [
  'order_created',
  'confirmed',
  'delivered',
]

export interface AdSettings {
  meta: MetaSettings
  tiktok: TikTokSettings
  snapchat: SnapchatSettings
  purchase_milestone: PurchaseMilestone
  /** Send OrderConfirmed / OrderDelivered / … as separate custom events. */
  lifecycle_events_enabled: boolean
  updated_at: string
}

// ─── Browser-safe projection ─────────────────────────────────────────────────

export interface PublicPlatformConfig {
  enabled: boolean
  id: string
}

export interface PublicTrackingConfig {
  meta: PublicPlatformConfig
  tiktok: PublicPlatformConfig
  snapchat: PublicPlatformConfig
}

export const EMPTY_PUBLIC_CONFIG: PublicTrackingConfig = {
  meta:     { enabled: false, id: '' },
  tiktok:   { enabled: false, id: '' },
  snapchat: { enabled: false, id: '' },
}

// ─── Admin view (masked) ─────────────────────────────────────────────────────

export interface MaskedToken {
  configured: boolean
  /** e.g. "••••••••4821" — never the real token. */
  preview: string
}

export interface AdminPlatformStatus {
  browser_ready: boolean
  server_ready: boolean
  last_success_at: string | null
  last_error: string | null
  last_error_at: string | null
}

export interface AdminAdSettingsView {
  meta: Omit<MetaSettings, 'access_token'> & { access_token: MaskedToken }
  tiktok: Omit<TikTokSettings, 'access_token'> & { access_token: MaskedToken }
  snapchat: Omit<SnapchatSettings, 'access_token'> & { access_token: MaskedToken }
  purchase_milestone: PurchaseMilestone
  lifecycle_events_enabled: boolean
  updated_at: string
  status: Record<AdPlatform, AdminPlatformStatus>
  encryption: { ok: boolean; error?: string }
  legacy_env: { meta_pixel_id: boolean; meta_token: boolean; tiktok_pixel_id: boolean; tiktok_token: boolean }
}

// ─── Events ──────────────────────────────────────────────────────────────────

export type TrackingEventName =
  | 'PageView'
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'Purchase'
  | 'OrderConfirmed'
  | 'OrderShipped'
  | 'OrderDelivered'
  | 'OrderCancelled'
  | 'OrderReturned'

export interface TrackingContent {
  id: string
  name?: string
  quantity: number
  price: number
}

/**
 * One platform-neutral event. Built server-side from the validated order for
 * conversions, and client-side from local state for funnel events.
 */
export interface CanonicalEvent {
  name: TrackingEventName
  /** Shared by browser + server for deduplication. */
  event_id: string
  /** Unix seconds. */
  event_time: number
  event_source_url?: string
  currency: string
  value?: number
  contents: TrackingContent[]
  order_id?: string
  order_status?: string
  num_items?: number
}

/** Click IDs / first-party cookies. Safe to move between browser and server. */
export interface AttributionContext {
  fbclid?: string
  fbp?: string
  fbc?: string
  ttclid?: string
  ttp?: string
  sccid?: string
  scid?: string
  landing_page?: string
  referrer?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
}

/** Raw customer identifiers. SERVER ONLY — hashed before leaving the process. */
export interface CustomerIdentity {
  phone?: string
  email?: string
  name?: string
  city?: string
  external_id?: string
}

export interface ServerEventContext extends AttributionContext {
  ip?: string
  user_agent?: string
  identity?: CustomerIdentity
}

export interface DispatchResult {
  platform: AdPlatform
  event: TrackingEventName
  event_id: string
  status: 'sent' | 'skipped' | 'failed' | 'duplicate'
  reason?: string
  /** Platform trace id when returned — useful for support tickets. */
  trace?: string
}
