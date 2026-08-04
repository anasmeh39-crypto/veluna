import { describe, expect, it } from 'vitest'
import { createHash } from 'node:crypto'
import {
  hashOrUndefined,
  normalizeCity,
  normalizeEmail,
  normalizeMoroccanPhone,
  normalizeName,
  normalizePhoneForMeta,
  normalizePhoneForSnapchat,
  normalizePhoneForTikTok,
  sha256,
  splitName,
} from '@/lib/tracking/hash'

const CANONICAL = '+212612345678'

describe('normalizeMoroccanPhone', () => {
  const accepted: [string, string][] = [
    ['0612345678', CANONICAL],
    ['0712345678', '+212712345678'],
    ['0512345678', '+212512345678'],
    ['+212612345678', CANONICAL],
    ['00212612345678', CANONICAL],
    ['212612345678', CANONICAL],
    ['612345678', CANONICAL],
    ['06 12 34 56 78', CANONICAL],
    ['06-12-34-56-78', CANONICAL],
    ['(06) 12.34.56.78', CANONICAL],
    ['  +212 (6) 12-34-56-78  ', CANONICAL],
    ['00212 06 12 34 56 78', CANONICAL],
  ]

  it.each(accepted)('normalizes %s → %s', (input, expected) => {
    expect(normalizeMoroccanPhone(input)).toBe(expected)
  })

  const rejected = ['', '  ', 'abc', '06123', '061234567890123', '0912345678', '+212912345678']

  it.each(rejected)('rejects %s', (input) => {
    expect(normalizeMoroccanPhone(input)).toBeUndefined()
  })

  it('returns undefined for null/undefined', () => {
    expect(normalizeMoroccanPhone(undefined)).toBeUndefined()
    expect(normalizeMoroccanPhone(null)).toBeUndefined()
  })

  it('passes through an already-international non-Moroccan number', () => {
    expect(normalizeMoroccanPhone('+33612345678')).toBe('+33612345678')
  })
})

describe('platform-specific phone normalization', () => {
  it('Meta drops the + and keeps the country code', () => {
    expect(normalizePhoneForMeta('0612345678')).toBe('212612345678')
  })

  it('TikTok keeps E.164 including the +', () => {
    expect(normalizePhoneForTikTok('0612345678')).toBe('+212612345678')
  })

  it('Snapchat drops the + and keeps the country code', () => {
    expect(normalizePhoneForSnapchat('0612345678')).toBe('212612345678')
  })

  it('TikTok differs from Meta and Snapchat for the same input', () => {
    const input = '06 12 34 56 78'
    expect(normalizePhoneForTikTok(input)).not.toBe(normalizePhoneForMeta(input))
    expect(normalizePhoneForMeta(input)).toBe(normalizePhoneForSnapchat(input))
  })

  it('produces different hashes per platform for the same phone', () => {
    const input = '0612345678'
    const meta = sha256(normalizePhoneForMeta(input)!)
    const tiktok = sha256(normalizePhoneForTikTok(input)!)
    expect(meta).not.toBe(tiktok)
    expect(meta).toBe(sha256(normalizePhoneForSnapchat(input)!))
  })

  it('every input spelling of one number hashes identically per platform', () => {
    const spellings = ['0612345678', '+212612345678', '00212612345678', '06 12-34.56 78']
    const metaHashes = new Set(spellings.map((s) => sha256(normalizePhoneForMeta(s)!)))
    const tiktokHashes = new Set(spellings.map((s) => sha256(normalizePhoneForTikTok(s)!)))
    expect(metaHashes.size).toBe(1)
    expect(tiktokHashes.size).toBe(1)
  })
})

describe('sha256', () => {
  it('matches node crypto and is lowercase hex', () => {
    const value = '212612345678'
    expect(sha256(value)).toBe(createHash('sha256').update(value, 'utf8').digest('hex'))
    expect(sha256(value)).toMatch(/^[0-9a-f]{64}$/)
  })

  it('hashOrUndefined skips empty values instead of hashing an empty string', () => {
    expect(hashOrUndefined('')).toBeUndefined()
    expect(hashOrUndefined(undefined)).toBeUndefined()
    expect(hashOrUndefined('x')).toBe(sha256('x'))
  })
})

describe('email / name / city normalization', () => {
  it('lowercases and trims email', () => {
    expect(normalizeEmail('  Sara@Example.COM ')).toBe('sara@example.com')
  })

  it('rejects malformed email', () => {
    expect(normalizeEmail('not-an-email')).toBeUndefined()
  })

  it('strips punctuation and spaces from names', () => {
    expect(normalizeName("  O'Brien-Smith ")).toBe('obriensmith')
  })

  it('preserves Arabic names', () => {
    expect(normalizeName(' سلمى  ')).toBe('سلمى')
  })

  it('splits first and last name', () => {
    expect(splitName('Salma El Idrissi')).toEqual({ first: 'salma', last: 'elidrissi' })
    expect(splitName('سلمى')).toEqual({ first: 'سلمى' })
    expect(splitName('')).toEqual({})
  })

  it('normalizes city like a name', () => {
    expect(normalizeCity('Casablanca ')).toBe('casablanca')
    expect(normalizeCity('الدار البيضاء')).toBe('الدارالبيضاء')
  })
})
