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

interface Props {
  product: Product
  onSelectedChange?: (price: number) => void
}

export default function OfferSelector({ product, onSelectedChange }: Props) {
  const router = useRouter()
  const { setCart } = useCart()
  const [selected, setSelected] = useState<OfferKey>('bundle')

  const complement    = getProductById(product.complementId)
  const singlePrice   = product.price
  const doublePrice   = product.price * 2
  const perUnitSaving = product.originalPrice ? product.originalPrice - product.price : 0
  const totalSavings  = perUnitSaving * 2
  const bundleSaving  = BUNDLE_ORIGINAL - BUNDLE_PRICE
  const photo         = PHOTOS[product.type]

  function handleSelect(key: OfferKey) {
    setSelected(key)
    const prices: Record<OfferKey, number> = {
      single: singlePrice,
      double: doublePrice,
      bundle: BUNDLE_PRICE,
    }
    onSelectedChange?.(prices[key])
  }

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

  const cardCls = (active: boolean) =>
    `w-full text-start rounded-2xl border-2 overflow-hidden transition-all duration-200 ${
      active
        ? 'border-veluna-plum shadow-veluna-sm'
        : 'border-veluna-petal hover:border-veluna-mauve'
    }`

  const infoCls = (active: boolean) =>
    `flex-1 px-4 py-3.5 flex flex-col justify-center gap-1 ${active ? 'bg-veluna-blush/30' : 'bg-white'}`

  /* Image panel — same size & background for all three options */
  const imgPanel = 'relative flex-shrink-0 w-24 bg-veluna-blush flex items-center justify-center py-4 overflow-hidden'

  return (
    <div className="flex flex-col gap-3">
      <p className="font-bold text-veluna-dark text-sm">اختاري العرض المناسب لك</p>

      {/* ── قطعة واحدة ── */}
      <button type="button" onClick={() => handleSelect('single')} className={cardCls(selected === 'single')}>
        <div className="flex items-stretch">
          <div className={imgPanel}>
            <div
              className="relative w-12 h-[72px]"
              style={{ filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.18))' }}
            >
              <Image src={photo} alt={product.name} fill className="object-contain" sizes="48px" />
            </div>
          </div>
          <div className={infoCls(selected === 'single')}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Radio active={selected === 'single'} />
                <span className="font-bold text-veluna-dark text-sm">قطعة واحدة</span>
              </div>
              <span className="font-extrabold text-veluna-plum tabular-nums text-sm flex-shrink-0">
                {singlePrice} <span className="text-xs font-normal">درهم</span>
              </span>
            </div>
            <p className="text-xs text-veluna-muted leading-relaxed ps-6">
              جربي المنتج وشوفي الفرق فالبشرة
            </p>
          </div>
        </div>
      </button>

      {/* ── جوج قطع ── */}
      <div className="relative">
        <span className="absolute -top-2.5 start-4 z-10 bg-veluna-plum text-white text-[10px] font-bold px-3 py-0.5 rounded-full">
          الأكثر طلباً
        </span>
        <button type="button" onClick={() => handleSelect('double')} className={cardCls(selected === 'double')}>
          <div className="flex items-stretch">
            <div className={imgPanel}>
              {/* quantity badge */}
              <span className="absolute top-2 end-2 w-5 h-5 rounded-full bg-veluna-plum text-white text-[10px] font-extrabold flex items-center justify-center shadow-sm z-10">
                2
              </span>
              {/* back bottle */}
              <div
                className="absolute w-12 h-[72px]"
                style={{ transform: 'rotate(-9deg) translateX(-10px) translateY(4px)', opacity: 0.65 }}
              >
                <Image src={photo} alt="" fill className="object-contain" sizes="48px" />
              </div>
              {/* front bottle */}
              <div
                className="relative w-12 h-[72px]"
                style={{
                  transform: 'rotate(5deg) translateX(6px)',
                  filter: 'drop-shadow(2px 6px 10px rgba(0,0,0,0.22))',
                  zIndex: 1,
                }}
              >
                <Image src={photo} alt="" fill className="object-contain" sizes="48px" />
              </div>
            </div>
            <div className={infoCls(selected === 'double')}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Radio active={selected === 'double'} />
                  <span className="font-bold text-veluna-dark text-sm">جوج قطع</span>
                </div>
                <div className="text-end flex-shrink-0">
                  <p className="font-extrabold text-veluna-plum tabular-nums text-sm leading-tight">
                    {doublePrice} <span className="text-xs font-normal">درهم</span>
                  </p>
                  {product.originalPrice && (
                    <p className="text-[10px] text-veluna-muted line-through">{product.originalPrice * 2} درهم</p>
                  )}
                </div>
              </div>
              <p className="text-xs text-veluna-muted leading-relaxed ps-6">
                قطعة عندك وقطعة احتياطي
              </p>
              <div className="ps-6 space-y-0.5">
                {perUnitSaving > 0 && (
                  <p className="text-[11px] text-veluna-muted">
                    ثمن القطعة: {singlePrice} درهم — وفري {perUnitSaving} درهم فالقطعة
                  </p>
                )}
                {totalSavings > 0 && (
                  <p className="text-xs font-semibold text-[#25D366]">وفري {totalSavings} درهم فالمجموع</p>
                )}
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* ── الروتين الكامل (bundle) ── */}
      {complement && (
        <div className="relative">
          <span className="absolute -top-2.5 start-4 z-10 bg-gradient-to-r from-[#7A3E68] to-veluna-plum text-white text-[10px] font-bold px-3 py-0.5 rounded-full shadow-sm">
            ✦ الاختيار الأمثل — وفري أكثر
          </span>
          <button type="button" onClick={() => handleSelect('bundle')} className={cardCls(selected === 'bundle')}>
            <div className="flex items-stretch">
              <div className={imgPanel}>
                {/* cream jar — back left */}
                <div
                  className="absolute w-11 h-11"
                  style={{ transform: 'rotate(-8deg) translateX(-10px) translateY(6px)', opacity: 0.85 }}
                >
                  <Image src="/products/cream.png" alt="" fill className="object-contain" sizes="44px" />
                </div>
                {/* oil bottle — front right */}
                <div
                  className="relative w-10 h-[68px]"
                  style={{
                    transform: 'rotate(6deg) translateX(8px)',
                    filter: 'drop-shadow(2px 6px 10px rgba(0,0,0,0.2))',
                    zIndex: 1,
                  }}
                >
                  <Image src="/products/oil.png" alt="" fill className="object-contain" sizes="40px" />
                </div>
              </div>
              <div className={infoCls(selected === 'bundle')}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Radio active={selected === 'bundle'} />
                    <span className="font-bold text-veluna-dark text-sm">الروتين الكامل</span>
                  </div>
                  <div className="text-end flex-shrink-0">
                    <p className="font-extrabold text-veluna-plum tabular-nums text-sm leading-tight">
                      {BUNDLE_PRICE} <span className="text-xs font-normal">درهم</span>
                    </p>
                    <p className="text-[10px] text-veluna-muted line-through">{BUNDLE_ORIGINAL} درهم</p>
                  </div>
                </div>
                <p className="text-[11px] text-veluna-muted leading-relaxed ps-6">الزيت + الكريم معاً</p>
                <p className="text-xs font-semibold text-[#25D366] ps-6">
                  وفري {bundleSaving} درهم — أحسن قيمة
                </p>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* ── CTA ── */}
      <button type="button" onClick={handleConfirm} className="w-full btn-primary py-4 text-base mt-1">
        طلبي دابا
      </button>

      {/* ── Trust strip ── */}
      <div className="grid grid-cols-3 gap-2">
        {['الدفع عند الاستلام', 'التوصيل داخل المغرب', 'طلب آمن وسهل'].map((t) => (
          <div key={t} className="flex flex-col items-center gap-0.5 bg-veluna-blush rounded-xl px-2 py-2.5 text-center">
            <span className="text-veluna-plum text-xs font-bold">✓</span>
            <span className="text-[10px] font-medium text-veluna-text leading-tight">{t}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Radio({ active }: { active: boolean }) {
  return (
    <div
      className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors duration-150 ${
        active ? 'border-veluna-plum bg-veluna-plum' : 'border-veluna-petal bg-white'
      }`}
    >
      {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
    </div>
  )
}