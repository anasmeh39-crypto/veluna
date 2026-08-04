// Small fetch wrapper for ad-platform APIs: hard timeout, no throwing, and
// error text that is safe to persist (never echoes the request body).

export interface HttpResult {
  ok: boolean
  status: number
  body: unknown
  error?: string
}

export const DEFAULT_TIMEOUT_MS = 6000

export async function postJson(
  url: string,
  payload: unknown,
  opts: { headers?: Record<string, string>; timeoutMs?: number } = {}
): Promise<HttpResult> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? DEFAULT_TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(opts.headers ?? {}) },
      body: JSON.stringify(payload),
      signal: controller.signal,
      cache: 'no-store',
    })

    const text = await res.text()
    let body: unknown = text
    try {
      body = text ? JSON.parse(text) : {}
    } catch {
      /* keep raw text */
    }

    return {
      ok: res.ok,
      status: res.status,
      body,
      error: res.ok ? undefined : `HTTP ${res.status}: ${text.slice(0, 200)}`,
    }
  } catch (err) {
    const aborted = err instanceof Error && err.name === 'AbortError'
    return {
      ok: false,
      status: 0,
      body: null,
      error: aborted ? `timeout after ${opts.timeoutMs ?? DEFAULT_TIMEOUT_MS}ms` : `network error: ${
        err instanceof Error ? err.message : 'unknown'
      }`,
    }
  } finally {
    clearTimeout(timeout)
  }
}

/** Drops undefined/empty values so we never send empty match keys. */
export function compact<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === '') continue
    if (Array.isArray(v) && v.length === 0) continue
    out[k] = v
  }
  return out as Partial<T>
}
