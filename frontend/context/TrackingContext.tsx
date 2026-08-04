'use client'

// The single entry point components use for tracking.
//
// Responsibilities:
//  • fetch the browser-safe pixel config (IDs + enable flags, never a token)
//  • inject the enabled pixels through <TrackingScripts />
//  • capture attribution on entry and on every client-side navigation
//  • fire exactly one PageView per navigation
//
// `useTracking()` is safe to call anywhere: outside the provider (e.g. the admin
// area, which loads no pixels) it returns a no-op implementation.

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import TrackingScripts from '@/components/TrackingScripts'
import { captureAttribution } from '@/lib/tracking/attribution'
import { cartEvent, trackBrowserEvent } from '@/lib/tracking/browser'
import type { CartLike } from '@/lib/tracking/events'
import {
  EMPTY_PUBLIC_CONFIG,
  type CanonicalEvent,
  type PublicTrackingConfig,
  type TrackingEventName,
} from '@/lib/tracking/types'

interface TrackingApi {
  config: PublicTrackingConfig
  /** True once the config has loaded and at least one pixel is live. */
  enabled: boolean
  track: (event: CanonicalEvent) => void
  trackCart: (
    name: TrackingEventName,
    items: CartLike[],
    opts?: { eventId?: string; orderId?: string; value?: number }
  ) => void
}

const NOOP_API: TrackingApi = {
  config: EMPTY_PUBLIC_CONFIG,
  enabled: false,
  track: () => {},
  trackCart: () => {},
}

const TrackingCtx = createContext<TrackingApi | null>(null)

function anyEnabled(config: PublicTrackingConfig): boolean {
  return config.meta.enabled || config.tiktok.enabled || config.snapchat.enabled
}

export function TrackingProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<PublicTrackingConfig>(EMPTY_PUBLIC_CONFIG)
  const pathname = usePathname()
  const lastPageView = useRef<string | null>(null)

  // One fetch per page load. The response is short-cached, so an admin change
  // reaches visitors within a minute without a redeploy.
  useEffect(() => {
    let alive = true
    fetch('/api/tracking/config')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (alive && data?.config) setConfig(data.config as PublicTrackingConfig)
      })
      .catch(() => {
        /* tracking is never allowed to surface an error to the customer */
      })
    return () => {
      alive = false
    }
  }, [])

  // Attribution is captured regardless of whether any pixel is configured —
  // UTMs and click IDs still need to reach the order record.
  useEffect(() => {
    captureAttribution()
  }, [pathname])

  const track = useCallback(
    (event: CanonicalEvent) => {
      if (!anyEnabled(config)) return
      trackBrowserEvent(event, config)
    },
    [config]
  )

  const trackCart = useCallback<TrackingApi['trackCart']>(
    (name, items, opts) => {
      if (!anyEnabled(config)) return
      trackBrowserEvent(cartEvent(name, items, opts ?? {}), config)
    },
    [config]
  )

  // PageView: once per pathname, and re-armed when the config arrives after the
  // first paint. The ref guard makes React re-renders harmless.
  useEffect(() => {
    if (!anyEnabled(config)) return
    if (lastPageView.current === pathname) return
    lastPageView.current = pathname
    trackBrowserEvent(cartEvent('PageView', []), config)
  }, [pathname, config])

  const api = useMemo<TrackingApi>(
    () => ({ config, enabled: anyEnabled(config), track, trackCart }),
    [config, track, trackCart]
  )

  return (
    <TrackingCtx.Provider value={api}>
      <TrackingScripts config={config} />
      {children}
    </TrackingCtx.Provider>
  )
}

export function useTracking(): TrackingApi {
  return useContext(TrackingCtx) ?? NOOP_API
}
