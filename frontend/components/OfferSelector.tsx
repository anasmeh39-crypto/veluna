'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import { getProductById } from '@/lib/products'
import type { Product } from '@/lib/products'

type OfferKey = 'single' | 'double' | 'bundle'

const BUNDLE_ID       = 'routine-complete'
const BUNDLE_PRICE    = 249
const BUNDLE_ORIGINAL = 278

const PHOTOS: Record<'oil' | 'cream', string> = {
  oil:   '/products/oil.png',
  cream: '/products/cream.png',
}

interface Props { product: Product }

export default function OfferSelector({ product }: Props) {
  const router = useRouter()
  const { setCart } = useCart()
  const [selected, setSelected] = useState<OfferKey>('double')

  const complement  = getProductById(product.complementId)
  const singlePrice = product.price
  const doublePrice = product.price * 2
  const savings     = product.originalPrice ? (product.originalPrice - product.price) * 2 : 0
  const bundleSaving = BUNDLE_ORIGINAL - BUNDLE_PRICE

  const photo = PHOTOS[product.type]

  function handleConfirm() {
    if (selected === 'bundle') {
      setCart([{
        id:        BUNDLE_ID,
        name:      'روتين Veluna الكامل',
        price:     BUNDLE_PRICE,
        quantity:  1,
        type:      'pack',
        colorFrom: '#DCC7FF',
        colorTo:   '#7A3E68',
      }])
      router.push('/checkout')
    } else {
      const qty = selected === 'single' ? 1 : 2
      setCart([{
        id:        product.id,
        name:      qty === 1 ? product.name : `${product.name} × 2`,
        price:     product.price,
        quantity:  qty,
        type:      'product',
        colorFrom: product.colorFrom,
        colorTo:   product.colorTo,
      }])
      router.push('/upsell')
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="font-bold text-veluna-dark text-sm">اختاري العرض المناسب لك</p>

      {/* ── Offer 1: single ── */}
      <button
        type="button"
        onClick={() => setSelected('single')}
        className={`w-full text-start rounded-2xl border-2 p-4 transition-all duration-200 ${
          selected === 'single'
            ? 'border-veluna-plum bg-veluna-blush shadow-veluna-sm'
            : 'border-veluna-petal bg-white hover:border-veluna-mauve'
        }`}
      >
        <div className="flex items-center gap-3">
          <Radio active={selected === 'single'} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-veluna-dark text-sm">واحد فقط</span>
              <span className="font-extrabold text-veluna-plum tabular-nums text-sm flex-shrink-0">
                {singlePrice} <span className="text-xs font-normal">درهم</span>
              </span>
            </div>
            <p className="text-xs text-veluna-muted mt-0.5 leading-relaxed">
              جربي المنتج وشوفي الفرق فالبشرة ديالك
            </p>
          </div>

          {/* Single product photo */}
          <div className="flex-shrink-0 relative w-14 h-16">
            <Image
              src={photo}
              alt={product.name}
              fill
              className="object-contain"
              style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.18))' }}
              sizes="56px"
            />
          </div>
        </div>
      </button>

      {/* ── Offer 2: double — pre-selected / highlighted ── */}
      <div className="relative">
        <span className="absolute -top-3 start-4 z-10 bg-veluna-plum text-white text-[10px] font-bold px-3 py-1 rounded-full">
          الأكثر طلباً
        </span>
        <button
          type="button"
          onClick={() => setSelected('double')}
          className={`w-full text-start rounded-2xl border-2 p-4 pt-5 transition-all duration-200 ${
            selected === 'double'
              ? 'border-veluna-plum bg-veluna-blush shadow-veluna-sm'
              : 'border-veluna-lavender bg-[#FAFAFF] hover:border-veluna-mauve'
          }`}
        >
          <div className="flex items-center gap-3">
            <Radio active={selected === 'double'} />

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-veluna-dark text-sm">جوج قطع</span>
                <div className="text-end flex-shrink-0">
                  <p className="font-extrabold text-veluna-plum tabular-nums text-sm leading-tight">
                    {doublePrice} <span className="text-xs font-normal">درهم</span>
                  </p>
                  {product.originalPrice && (
                    <p className="text-xs text-veluna-muted line-through leading-tight">
                      بدل {product.originalPrice * 2}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-xs text-veluna-muted mt-0.5 leading-relaxed">
                خلي واحدة عندك وواحدة احتياطي للروتين
              </p>
              {savings > 0 && (
                <p className="text-xs font-semibold text-[#25D366] mt-1">وفري {savings} درهم</p>
              )}
            </div>

            {/* Two products — layered depth effect */}
            <div className="flex-shrink-0 relative w-[4.5rem] h-16">
              {/* Back bottle — rotated left, slightly faded */}
              <div
                className="absolute left-0 top-2 w-11 h-14"
                style={{ transform: 'rotate(-8deg)', opacity: 0.75 }}
              >
                <Image src={photo} alt="" fill className="object-contain" sizes="44px" />
              </div>
              {/* Front bottle — slight right tilt, full opacity, shadow */}
              <div
                className="absolute right-0 top-0 w-11 h-14"
                style={{
                  transform: 'rotate(4deg)',
                  filter: 'drop-shadow(2px 5px 8px rgba(0,0,0,0.22))',
                }}
              >
                <Image src={photo} alt="" fill className="object-contain" sizes="44px" />
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* ── Offer 3: "عرض اليوم" bundle ── */}
      {complement && (
        <div className="relative">
          <span className="absolute -top-3 start-4 z-10 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
            ⭐ عرض اليوم — الاختيار الأمثل
          </span>
          <button
            type="button"
            onClick={() => setSelected('bundle')}
            className={`w-full text-start rounded-2xl border-2 p-4 pt-5 transition-all duration-200 ${
              selected === 'bundle'
                ? 'border-amber-500 bg-amber-50 shadow-veluna-sm'
                : 'border-amber-300/80 bg-[#FFFDF5] hover:border-amber-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <Radio active={selected === 'bundle'} amber />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-veluna-dark text-sm leading-tight">
                    الروتين الكامل
                    <span className="block text-veluna-muted font-normal text-[11px] mt-0.5">
                      الزيت + الكريم معاً
                    </span>
                  </span>
                  <div className="text-end flex-shrink-0">
                    <p className="font-extrabold text-amber-600 tabular-nums text-sm leading-tight">
                      {BUNDLE_PRICE} <span className="text-xs font-normal">درهم</span>
                    </p>
                    <p className="text-xs text-veluna-muted line-through leading-tight">
                      بدل {BUNDLE_ORIGINAL}
                    </p>
                  </div>
                </div>
                <p className="text-xs font-semibold text-[#25D366] mt-1">
                  وفري {bundleSaving} درهم — أحسن قيمة
                </p>
              </div>

              {/* Oil bottle + cream jar — duo composition */}
              <div className="flex-shrink-0 relative w-[4.5rem] h-16">
                {/* Cream jar — left, slightly lower, gentle tilt */}
                <div
                  className="absolute left-0 bottom-0 w-11 h-11"
                  style={{ transform: 'rotate(-5deg)', opacity: 0.9 }}
                >
                  <Image src="/products/cream.png" alt="" fill className="object-contain" sizes="44px" />
                </div>
                {/* Oil bottle — right, taller, front */}
                <div
                  className="absolute right-0 top-0 w-9 h-14"
                  style={{
                    transform: 'rotate(5deg)',
                    filter: 'drop-shadow(2px 5px 8px rgba(0,0,0,0.2))',
                  }}
                >
                  <Image src="/products/oil.png" alt="" fill className="object-contain" sizes="36px" />
                </div>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* ── Confirm CTA ── */}
      <button
        type="button"
        onClick={handleConfirm}
        className="w-full btn-primary py-4 text-base mt-1"
      >
        أكدي الطلب
      </button>

      {/* ── Trust strip ── */}
      <div className="grid grid-cols-3 gap-2">
        {['الدفع عند الاستلام', 'التوصيل داخل المغرب', 'طلب آمن وسهل'].map((t) => (
          <div
            key={t}
            className="flex flex-col items-center gap-0.5 bg-veluna-blush rounded-xl px-2 py-2.5 text-center"
          >
            <span className="text-veluna-plum text-xs font-bold">✓</span>
            <span className="text-[10px] font-medium text-veluna-text leading-tight">{t}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Radio({ active, amber = false }: { active: boolean; amber?: boolean }) {
  return (
    <div
      className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors duration-150 ${
        active
          ? amber
            ? 'border-amber-500 bg-amber-500'
            : 'border-veluna-plum bg-veluna-plum'
          : 'border-veluna-petal bg-white'
      }`}
    >
      {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
    </div>
  )
}
