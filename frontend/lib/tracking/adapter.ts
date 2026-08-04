// The contract every ad platform implements. Each adapter owns its own event
// names, payload shape, hashing rules, click IDs, endpoint and error handling —
// the dispatcher knows none of that.

import type { AdSettings, AdPlatform, CanonicalEvent, ServerEventContext, TrackingEventName } from './types'

export interface AdapterInput {
  settings: AdSettings
  event: CanonicalEvent
  context: ServerEventContext
  /** Test sends use the platform's validate endpoint / test event code. */
  test?: boolean
}

export interface AdapterResult {
  ok: boolean
  /** Safe to persist and show in the admin UI — never contains secrets or PII. */
  error?: string
  /** Platform-side trace id, useful when opening a support ticket. */
  trace?: string
}

export interface PlatformAdapter {
  platform: AdPlatform
  /** Platform event name, or null when the platform has no equivalent. */
  eventName(name: TrackingEventName): string | null
  /** Builds the exact request body. Exported for tests and payload-parity checks. */
  buildPayload(input: AdapterInput): Record<string, unknown> | null
  send(input: AdapterInput): Promise<AdapterResult>
}
