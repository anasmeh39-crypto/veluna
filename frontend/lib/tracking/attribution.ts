'use client'

// First-party attribution capture.
//
// Two records are kept in localStorage:
//   first — the very first campaign that brought this visitor in. Written once
//           and never overwritten, so a later organic visit cannot erase the ad
//           that actually earned the sale.
//   last  — refreshed whenever a visit arrives with new campaign parameters.
//
// Click IDs and cookie identifiers are opaque strings. No customer PII is ever
// written here.

import type { AttributionContext } from './types'

const STORAGE_KEY = 'veluna_attr'

const URL_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'fbclid',
  'ttclid',
] as const

/** Snapchat spells its click id differently depending on the placement. */
const SNAP_CLICK_KEYS = ['ScCid', 'sccid', 'sc_click_id']

interface AttributionRecord extends AttributionContext {
  captured_at?: string
}

interface AttributionStore {
  first?: AttributionRecord
  last?: AttributionRecord
}

/** Used when localStorage is unavailable (private mode, blocked storage). */
let memoryStore: AttributionStore = {}

function readStore(): AttributionStore {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return memoryStore
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as AttributionStore) : memoryStore
  } catch {
    return memoryStore
  }
}

function writeStore(store: AttributionStore): void {
  memoryStore = store
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    /* storage blocked — the in-memory copy still serves this page view */
  }
}

export function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : undefined
}

function paramsFromUrl(search: string): AttributionRecord {
  const params = new URLSearchParams(search)
  const record: AttributionRecord = {}

  for (const key of URL_KEYS) {
    const value = params.get(key)
    if (value) record[key] = value.slice(0, 255)
  }
  for (const key of SNAP_CLICK_KEYS) {
    const value = params.get(key)
    if (value) {
      record.sccid = value.slice(0, 255)
      break
    }
  }
  return record
}

function hasCampaignData(record: AttributionRecord): boolean {
  return Object.keys(record).some((k) => k !== 'landing_page' && k !== 'referrer' && k !== 'captured_at')
}

/**
 * Records attribution for the current page view. Safe to call on every route
 * change: the first-touch record is only ever written once.
 */
export function captureAttribution(): void {
  if (typeof window === 'undefined') return

  const fromUrl = paramsFromUrl(window.location.search)
  const store = readStore()
  const now = new Date().toISOString()

  const record: AttributionRecord = {
    ...fromUrl,
    landing_page: window.location.href.slice(0, 500),
    referrer: document.referrer ? document.referrer.slice(0, 500) : undefined,
    captured_at: now,
  }

  let changed = false

  if (!store.first) {
    store.first = record
    changed = true
  }

  // Only overwrite last-touch when this visit actually carries campaign data —
  // an internal navigation must not wipe the campaign that is in progress.
  if (hasCampaignData(fromUrl) || !store.last) {
    store.last = record
    changed = true
  }

  if (changed) writeStore(store)
}

/**
 * The attribution payload submitted with an order.
 *
 * Click IDs and UTMs come from last-touch when present (that is the click that
 * led to this session) and otherwise fall back to first-touch. Landing page and
 * referrer always describe the original entry point.
 */
export function getAttribution(): AttributionContext {
  if (typeof window === 'undefined') return {}

  const { first = {}, last = {} } = readStore()
  const pick = (key: keyof AttributionContext) => last[key] ?? first[key]

  const attribution: AttributionContext = {
    utm_source: pick('utm_source'),
    utm_medium: pick('utm_medium'),
    utm_campaign: pick('utm_campaign'),
    utm_content: pick('utm_content'),
    utm_term: pick('utm_term'),
    fbclid: pick('fbclid'),
    ttclid: pick('ttclid'),
    sccid: pick('sccid'),
    landing_page: first.landing_page ?? last.landing_page,
    referrer: first.referrer ?? last.referrer,
    // Cookies are read live — the pixels refresh them on every page view.
    fbp: readCookie('_fbp'),
    fbc: readCookie('_fbc'),
    ttp: readCookie('_ttp'),
    scid: readCookie('_scid'),
  }

  for (const key of Object.keys(attribution) as (keyof AttributionContext)[]) {
    if (!attribution[key]) delete attribution[key]
  }
  return attribution
}

/** Test seam / manual reset. */
export function clearAttribution(): void {
  memoryStore = {}
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
