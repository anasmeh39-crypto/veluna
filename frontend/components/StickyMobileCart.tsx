'use client'

import { useEffect, useState } from 'react'
import ProductImage from './ProductImage'
import type { Product } from '@/lib/products'

interface Props {
  product: Product
  ctaRef: React.RefObject<HTMLElement>
}

export default function StickyMobileCart({ product, ctaRef }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ctaRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [ctaRef])

  function scrollToOffer() {
    ctaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div
      className={`fixed bottom-0 inset-x-0 z-40 md:hidden bg-white border-t border-veluna-petal
                  transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
                  ${visible ? 'translate-y-0' : 'translate-y-full'}`}
      style={{ boxShadow: '0 -4px 24px rgba(122,62,104,0.14)' }}
      aria-hidden={!visible}
    >
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="w-11 h-11 flex-shrink-0 bg-veluna-blush rounded-xl p-1">
          <ProductImage
            type={product.type}
            colorFrom={product.colorFrom}
            colorTo={product.colorTo}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-veluna-dark text-sm truncate leading-tight">
            {product.shortName || product.name}
          </p>
          <p className="text-veluna-plum font-extrabold text-sm tabular-nums">
            {product.price} <span className="text-xs font-semibold">درهم</span>
          </p>
        </div>

        <button
          onClick={scrollToOffer}
          aria-label="اختاري العرض"
          className="flex-shrink-0 bg-veluna-plum text-white font-bold text-sm
                     px-5 py-3 rounded-full hover:bg-[#653156] active:scale-95
                     transition-all duration-150 min-h-[48px]"
        >
          اختاري العرض
        </button>
      </div>
    </div>
  )
}
