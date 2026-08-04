// AES-256-GCM encryption for advertising access tokens at rest.
//
// SERVER ONLY. The key comes from AD_TRACKING_ENCRYPTION_KEY and is never sent
// to the browser. If the key is missing or malformed we throw — callers must
// surface a configuration error rather than fall back to storing plaintext.

import { createCipheriv, createDecipheriv, randomBytes, timingSafeEqual } from 'node:crypto'

const PREFIX = 'v1'
const IV_BYTES = 12   // GCM standard nonce length
const KEY_BYTES = 32  // AES-256

export class TrackingConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TrackingConfigError'
  }
}

const MISSING_KEY_MESSAGE =
  'AD_TRACKING_ENCRYPTION_KEY is not set. Advertising access tokens cannot be stored ' +
  'without it. Generate one with: openssl rand -hex 32'

function parseKey(raw: string): Buffer {
  const value = raw.trim()

  if (/^[0-9a-fA-F]{64}$/.test(value)) return Buffer.from(value, 'hex')

  // Accept base64 / base64url of exactly 32 bytes as a convenience.
  try {
    const buf = Buffer.from(value, 'base64')
    if (buf.length === KEY_BYTES) return buf
  } catch {
    /* fall through to the error below */
  }

  throw new TrackingConfigError(
    'AD_TRACKING_ENCRYPTION_KEY must be 32 bytes — 64 hex characters (openssl rand -hex 32) ' +
    'or a 32-byte base64 string.'
  )
}

function getKey(): Buffer {
  const raw = process.env.AD_TRACKING_ENCRYPTION_KEY
  if (!raw || !raw.trim()) throw new TrackingConfigError(MISSING_KEY_MESSAGE)
  return parseKey(raw)
}

/** Non-throwing probe used by the admin UI to render a configuration banner. */
export function encryptionStatus(): { ok: boolean; error?: string } {
  try {
    getKey()
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown encryption error' }
  }
}

export function encryptSecret(plaintext: string): string {
  if (!plaintext) return ''
  const key = getKey()
  const iv = randomBytes(IV_BYTES)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return [PREFIX, iv.toString('base64'), tag.toString('base64'), ciphertext.toString('base64')].join('.')
}

export function isEncrypted(value: string | undefined | null): boolean {
  return typeof value === 'string' && value.startsWith(PREFIX + '.') && value.split('.').length === 4
}

/**
 * Decrypts a stored token. Throws TrackingConfigError when the key is missing
 * or the payload has been tampered with (GCM auth tag mismatch).
 */
export function decryptSecret(stored: string): string {
  if (!stored) return ''
  if (!isEncrypted(stored)) {
    throw new TrackingConfigError(
      'Stored advertising token is not in the expected encrypted format. ' +
      'Re-enter the token in /admin/advertising.'
    )
  }
  const key = getKey()
  const [, ivB64, tagB64, dataB64] = stored.split('.')
  try {
    const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivB64, 'base64'))
    decipher.setAuthTag(Buffer.from(tagB64, 'base64'))
    return Buffer.concat([
      decipher.update(Buffer.from(dataB64, 'base64')),
      decipher.final(),
    ]).toString('utf8')
  } catch {
    throw new TrackingConfigError(
      'Failed to decrypt an advertising token. AD_TRACKING_ENCRYPTION_KEY has probably changed ' +
      'since it was saved — re-enter the token in /admin/advertising.'
    )
  }
}

/** Last-4 preview for the admin UI. Never returns more than 4 real characters. */
export function maskSecret(plaintext: string): string {
  if (!plaintext) return ''
  const tail = plaintext.length > 4 ? plaintext.slice(-4) : ''
  return '••••••••' + tail
}

/** Constant-time string compare for admin cookie checks. */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8')
  const bufB = Buffer.from(b, 'utf8')
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}
