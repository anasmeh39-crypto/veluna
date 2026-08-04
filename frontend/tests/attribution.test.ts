import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { captureAttribution, clearAttribution, getAttribution, readCookie } from '@/lib/tracking/attribution'

const storage = new Map<string, string>()

function visit(url: string, opts: { referrer?: string; cookies?: string } = {}) {
  const parsed = new URL(url)
  ;(globalThis as Record<string, any>).window = {
    location: { href: url, search: parsed.search },
    localStorage: {
      getItem: (k: string) => storage.get(k) ?? null,
      setItem: (k: string, v: string) => void storage.set(k, v),
      removeItem: (k: string) => void storage.delete(k),
    },
  }
  ;(globalThis as Record<string, any>).document = {
    referrer: opts.referrer ?? '',
    cookie: opts.cookies ?? '',
  }
}

beforeEach(() => {
  storage.clear()
  visit('https://veluna.ma/')
  clearAttribution()
})

afterEach(() => {
  delete (globalThis as Record<string, unknown>).window
  delete (globalThis as Record<string, unknown>).document
})

describe('capture from the landing URL', () => {
  it('stores UTMs and click ids', () => {
    visit(
      'https://veluna.ma/products/zit-manaa?utm_source=facebook&utm_medium=cpc&utm_campaign=aug-oil' +
        '&utm_content=video1&utm_term=epilation&fbclid=FB123&ttclid=TT456',
      { referrer: 'https://l.facebook.com/' }
    )
    captureAttribution()

    const attribution = getAttribution()
    expect(attribution.utm_source).toBe('facebook')
    expect(attribution.utm_medium).toBe('cpc')
    expect(attribution.utm_campaign).toBe('aug-oil')
    expect(attribution.utm_content).toBe('video1')
    expect(attribution.utm_term).toBe('epilation')
    expect(attribution.fbclid).toBe('FB123')
    expect(attribution.ttclid).toBe('TT456')
    expect(attribution.landing_page).toContain('/products/zit-manaa')
    expect(attribution.referrer).toBe('https://l.facebook.com/')
  })

  it('accepts every spelling of the Snapchat click id', () => {
    for (const key of ['ScCid', 'sccid', 'sc_click_id']) {
      storage.clear()
      visit(`https://veluna.ma/?${key}=SC789`)
      clearAttribution()
      captureAttribution()
      expect(getAttribution().sccid).toBe('SC789')
    }
  })

  it('returns nothing when the visit carries no campaign data', () => {
    visit('https://veluna.ma/')
    captureAttribution()
    const attribution = getAttribution()
    expect(attribution.utm_source).toBeUndefined()
    expect(attribution.fbclid).toBeUndefined()
    expect(attribution.landing_page).toBe('https://veluna.ma/')
  })
})

describe('first-touch preservation', () => {
  it('does not let a later organic visit erase the original campaign', () => {
    visit('https://veluna.ma/?utm_source=facebook&utm_campaign=aug-oil&fbclid=FB123')
    captureAttribution()

    // Internal navigation with no campaign parameters.
    visit('https://veluna.ma/checkout')
    captureAttribution()

    const attribution = getAttribution()
    expect(attribution.utm_source).toBe('facebook')
    expect(attribution.utm_campaign).toBe('aug-oil')
    expect(attribution.fbclid).toBe('FB123')
    expect(attribution.landing_page).toBe('https://veluna.ma/?utm_source=facebook&utm_campaign=aug-oil&fbclid=FB123')
  })

  it('prefers the newest campaign when the visitor clicks a second ad', () => {
    visit('https://veluna.ma/?utm_source=facebook&utm_campaign=first')
    captureAttribution()
    visit('https://veluna.ma/?utm_source=tiktok&utm_campaign=second&ttclid=TT999')
    captureAttribution()

    const attribution = getAttribution()
    expect(attribution.utm_source).toBe('tiktok')
    expect(attribution.utm_campaign).toBe('second')
    expect(attribution.ttclid).toBe('TT999')
    // …while the original entry point is still recorded.
    expect(attribution.landing_page).toContain('utm_campaign=first')
  })

  it('survives a page reload through localStorage', () => {
    visit('https://veluna.ma/?utm_source=facebook&fbclid=FB123')
    captureAttribution()

    // New "page load": memory is gone, storage remains.
    visit('https://veluna.ma/checkout')
    expect(getAttribution().fbclid).toBe('FB123')
  })
})

describe('first-party cookies', () => {
  it('reads the pixel cookies live on every call', () => {
    visit('https://veluna.ma/checkout', {
      cookies: '_fbp=fb.1.123.456; _fbc=fb.1.123.CLICK; _ttp=TTP1; _scid=SCID1; other=x',
    })
    captureAttribution()

    const attribution = getAttribution()
    expect(attribution.fbp).toBe('fb.1.123.456')
    expect(attribution.fbc).toBe('fb.1.123.CLICK')
    expect(attribution.ttp).toBe('TTP1')
    expect(attribution.scid).toBe('SCID1')
  })

  it('omits cookies that are not set', () => {
    visit('https://veluna.ma/checkout', { cookies: '_fbp=fb.1.123.456' })
    const attribution = getAttribution()
    expect(attribution.fbp).toBe('fb.1.123.456')
    expect(attribution.ttp).toBeUndefined()
    expect('scid' in attribution).toBe(false)
  })

  it('reads a cookie by exact name, not by prefix', () => {
    visit('https://veluna.ma/', { cookies: 'x_fbp=wrong; _fbp=right' })
    expect(readCookie('_fbp')).toBe('right')
  })
})

describe('storage failures', () => {
  it('keeps working when localStorage throws', () => {
    ;(globalThis as Record<string, any>).window = {
      location: { href: 'https://veluna.ma/?utm_source=facebook', search: '?utm_source=facebook' },
      localStorage: {
        getItem: () => {
          throw new Error('blocked')
        },
        setItem: () => {
          throw new Error('blocked')
        },
        removeItem: () => {},
      },
    }
    expect(() => captureAttribution()).not.toThrow()
    // In-memory fallback still serves the current page view.
    expect(getAttribution().utm_source).toBe('facebook')
  })
})
