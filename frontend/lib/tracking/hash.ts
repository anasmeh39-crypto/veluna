// Normalization + SHA-256 hashing for server-side advertising match keys.
//
// SERVER ONLY. Raw values must never reach the browser or the logs — only the
// hashed output leaves this module.
//
// Each platform documents its own normalization rules and they genuinely
// differ, so there is one helper per platform rather than one shared guess.

import { createHash } from 'node:crypto'

export function sha256(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex')
}

/** SHA-256 of an already-normalized value, or undefined for empty input. */
export function hashOrUndefined(value: string | undefined | null): string | undefined {
  if (!value) return undefined
  return sha256(value)
}

/**
 * Canonical Moroccan phone in E.164 (`+212XXXXXXXXX`).
 *
 * Accepts every shape the checkout form realistically receives:
 *   06XXXXXXXX · 07XXXXXXXX · 05XXXXXXXX · +2126XXXXXXXX · 002126XXXXXXXX
 *   6XXXXXXXX  · with spaces, dashes, dots or parentheses
 *
 * Returns undefined when the input cannot be a valid phone number, so callers
 * never hash garbage into an unmatchable audience key.
 */
export function normalizeMoroccanPhone(input: string | undefined | null): string | undefined {
  if (!input) return undefined

  // Keep digits, and a leading + if present.
  const raw = String(input).trim()
  let cleaned = raw.replace(/[^\d+]/g, '')
  if (cleaned.includes('+')) {
    cleaned = (raw.trimStart().startsWith('+') ? '+' : '') + cleaned.replace(/\+/g, '')
  }

  if (cleaned.startsWith('00')) cleaned = '+' + cleaned.slice(2)

  if (!cleaned.startsWith('+')) {
    if (cleaned.startsWith('212')) cleaned = '+' + cleaned
    else if (cleaned.startsWith('0')) cleaned = '+212' + cleaned.slice(1)
    else if (/^[5-7]\d{8}$/.test(cleaned)) cleaned = '+212' + cleaned
    else return undefined
  }

  const digits = cleaned.slice(1).replace(/\D/g, '')

  if (digits.startsWith('212')) {
    const national = digits.slice(3).replace(/^0+/, '')
    if (!/^[5-7]\d{8}$/.test(national)) return undefined
    return '+212' + national
  }

  // Already-international non-Moroccan number — keep it if plausibly E.164.
  if (digits.length >= 8 && digits.length <= 15) return '+' + digits
  return undefined
}

/**
 * Meta: country code included, digits only, no `+`, no leading zeros.
 * https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters
 */
export function normalizePhoneForMeta(input: string | undefined | null): string | undefined {
  const e164 = normalizeMoroccanPhone(input)
  return e164 ? e164.slice(1) : undefined
}

/** TikTok: E.164 including the leading `+`. */
export function normalizePhoneForTikTok(input: string | undefined | null): string | undefined {
  return normalizeMoroccanPhone(input)
}

/** Snapchat: country code + digits only, without `+`. */
export function normalizePhoneForSnapchat(input: string | undefined | null): string | undefined {
  const e164 = normalizeMoroccanPhone(input)
  return e164 ? e164.slice(1) : undefined
}

/** Trim + lowercase. All three platforms agree on email normalization. */
export function normalizeEmail(input: string | undefined | null): string | undefined {
  if (!input) return undefined
  const email = String(input).trim().toLowerCase()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : undefined
}

/**
 * Names: lowercase, trimmed, punctuation and whitespace removed. Arabic
 * letters are preserved — Veluna's customers enter Arabic names and stripping
 * them would destroy the match key.
 */
export function normalizeName(input: string | undefined | null): string | undefined {
  if (!input) return undefined
  const name = String(input)
    .trim()
    .toLowerCase()
    .replace(/[.,'"`~!@#$%^&*()_+=\-[\]{}|\\/:;<>?]/g, '')
    .replace(/\s+/g, '')
  return name || undefined
}

/** Splits a full name into first/last for platforms that want them apart. */
export function splitName(full: string | undefined | null): { first?: string; last?: string } {
  if (!full) return {}
  const parts = String(full).trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return {}
  if (parts.length === 1) return { first: normalizeName(parts[0]) }
  return {
    first: normalizeName(parts[0]),
    last:  normalizeName(parts.slice(1).join(' ')),
  }
}

/** City: lowercase, no spaces or punctuation (Meta / Snapchat `ct`). */
export function normalizeCity(input: string | undefined | null): string | undefined {
  return normalizeName(input)
}
