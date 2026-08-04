'use client'

// Fires ViewContent once per product page.
//
// The guard keys on the product id and only arms after the pixel config has
// loaded, so re-renders never duplicate the event and the event is not lost
// when the config arrives after first paint.

import { useEffect, useRef } from 'react'
import { useTracking } from '@/context/TrackingContext'
import type { Product } from '@/lib/products'

export default function TrackViewContent({ product }: { product: Product }) {
  const { enabled, trackCart } = useTracking()
  const fired = useRef<string | null>(null)

  useEffect(() => {
    if (!enabled) return
    if (fired.current === product.id) return
    fired.current = product.id

    trackCart('ViewContent', [
      { id: product.id, name: product.name, price: product.price, quantity: 1 },
    ])
  }, [enabled, product, trackCart])

  return null
}
