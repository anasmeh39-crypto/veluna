// Dispatch log for server-side ad events.
//
// Two jobs:
//  1. Idempotency — `claimEvent` is an atomic claim so a Purchase can only be
//     sent once per (order, platform), no matter how many times the thank-you
//     page is refreshed or the order flow retried.
//  2. Diagnostics — last success / last error per platform for the admin UI.
//
// Nothing here stores tokens, raw PII, or full payloads.

import { pool } from '@/lib/db'
import type { AdminPlatformStatus, AdPlatform, TrackingEventName } from './types'

export type DispatchStatus = 'pending' | 'sent' | 'failed'

const MAX_ERROR_LEN = 300

let schemaReady = false

/**
 * Process-local fallback used only when Postgres is unreachable. Bounded so a
 * long-lived container cannot leak memory; losing it can at worst allow a
 * duplicate event after a restart, which the platforms then dedupe by event_id.
 */
const memoryClaims = new Map<string, DispatchStatus>()
const MEMORY_LIMIT = 5000

function rememberInMemory(key: string, status: DispatchStatus): void {
  if (memoryClaims.size >= MEMORY_LIMIT) {
    const oldest = memoryClaims.keys().next().value
    if (oldest !== undefined) memoryClaims.delete(oldest)
  }
  memoryClaims.set(key, status)
}

async function ensureSchema(): Promise<void> {
  if (schemaReady) return
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tracking_events (
      event_key   VARCHAR(160) PRIMARY KEY,
      order_id    VARCHAR(20),
      platform    VARCHAR(20)  NOT NULL,
      event_name  VARCHAR(40)  NOT NULL,
      event_id    VARCHAR(120) NOT NULL,
      status      VARCHAR(20)  NOT NULL,
      attempts    INTEGER      NOT NULL DEFAULT 1,
      error       TEXT,
      created_at  VARCHAR(30)  NOT NULL,
      updated_at  VARCHAR(30)  NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_tracking_events_order   ON tracking_events(order_id);
    CREATE INDEX IF NOT EXISTS idx_tracking_events_created ON tracking_events(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_tracking_events_lookup  ON tracking_events(platform, status);
  `)
  schemaReady = true
}

/** Stable key for one logical event on one platform. */
export function dispatchKey(
  platform: AdPlatform,
  eventName: TrackingEventName,
  eventId: string
): string {
  return `${platform}:${eventName}:${eventId}`.slice(0, 160)
}

export interface ClaimInput {
  platform: AdPlatform
  eventName: TrackingEventName
  eventId: string
  orderId?: string
}

/**
 * Attempts to claim an event for sending.
 *
 * Returns false when this event was already delivered successfully — the caller
 * must then skip. A previously *failed* event can be re-claimed, so retries stay
 * possible while successful sends stay exactly-once.
 */
export async function claimEvent(input: ClaimInput): Promise<boolean> {
  const key = dispatchKey(input.platform, input.eventName, input.eventId)
  const now = new Date().toISOString()

  try {
    await ensureSchema()
    const result = await pool.query(
      `INSERT INTO tracking_events
         (event_key, order_id, platform, event_name, event_id, status, attempts, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,'pending',1,$6,$6)
       ON CONFLICT (event_key) DO UPDATE
         SET attempts   = tracking_events.attempts + 1,
             status     = 'pending',
             updated_at = EXCLUDED.updated_at
         WHERE tracking_events.status <> 'sent'
       RETURNING event_key`,
      [key, input.orderId ?? null, input.platform, input.eventName, input.eventId, now]
    )
    return (result.rowCount ?? 0) > 0
  } catch (err) {
    console.error('[tracking-log] claim failed, using in-memory guard:', err instanceof Error ? err.message : err)
    if (memoryClaims.get(key) === 'sent') return false
    rememberInMemory(key, 'pending')
    return true
  }
}

export interface RecordInput extends ClaimInput {
  status: Exclude<DispatchStatus, 'pending'>
  error?: string
}

/** Records the outcome of a send. Never throws. */
export async function recordEvent(input: RecordInput): Promise<void> {
  const key = dispatchKey(input.platform, input.eventName, input.eventId)
  const now = new Date().toISOString()
  const error = input.error ? input.error.slice(0, MAX_ERROR_LEN) : null

  try {
    await ensureSchema()
    await pool.query(
      `UPDATE tracking_events SET status = $1, error = $2, updated_at = $3 WHERE event_key = $4`,
      [input.status, error, now, key]
    )
  } catch (err) {
    console.error('[tracking-log] record failed:', err instanceof Error ? err.message : err)
  }
  rememberInMemory(key, input.status)
}

const EMPTY_STATUS: AdminPlatformStatus = {
  browser_ready: false,
  server_ready: false,
  last_success_at: null,
  last_error: null,
  last_error_at: null,
}

/** Last success / last error per platform for the admin diagnostics panel. */
export async function getPlatformStatuses(): Promise<Record<AdPlatform, AdminPlatformStatus>> {
  const statuses: Record<AdPlatform, AdminPlatformStatus> = {
    meta:     { ...EMPTY_STATUS },
    tiktok:   { ...EMPTY_STATUS },
    snapchat: { ...EMPTY_STATUS },
  }

  try {
    await ensureSchema()
    const result = await pool.query(`
      SELECT platform,
             MAX(CASE WHEN status = 'sent'   THEN updated_at END) AS last_success_at,
             MAX(CASE WHEN status = 'failed' THEN updated_at END) AS last_error_at
      FROM tracking_events
      GROUP BY platform
    `)
    for (const row of result.rows) {
      const platform = row.platform as AdPlatform
      if (!statuses[platform]) continue
      statuses[platform].last_success_at = row.last_success_at ?? null
      statuses[platform].last_error_at = row.last_error_at ?? null
    }

    const errors = await pool.query(`
      SELECT DISTINCT ON (platform) platform, error
      FROM tracking_events
      WHERE status = 'failed' AND error IS NOT NULL
      ORDER BY platform, updated_at DESC
    `)
    for (const row of errors.rows) {
      const platform = row.platform as AdPlatform
      if (statuses[platform]) statuses[platform].last_error = row.error ?? null
    }
  } catch (err) {
    console.error('[tracking-log] status read failed:', err instanceof Error ? err.message : err)
  }

  return statuses
}

export interface DispatchLogRow {
  event_key: string
  order_id: string | null
  platform: string
  event_name: string
  status: string
  attempts: number
  error: string | null
  updated_at: string
}

/** Recent dispatches for the admin diagnostics table (safe fields only). */
export async function listRecentDispatches(limit = 20): Promise<DispatchLogRow[]> {
  try {
    await ensureSchema()
    const result = await pool.query(
      `SELECT event_key, order_id, platform, event_name, status, attempts, error, updated_at
       FROM tracking_events ORDER BY updated_at DESC LIMIT $1`,
      [Math.min(limit, 100)]
    )
    return result.rows as DispatchLogRow[]
  } catch {
    return []
  }
}
