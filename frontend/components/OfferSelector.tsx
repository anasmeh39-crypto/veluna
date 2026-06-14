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

/* Clean transparent cutouts (composed in advance for a premium look) */
const SINGLE_IMG: Record<'oil' | 'cream', string> = {
  oil:   '/products/oil-cutout.png',
  cream: '/products/cream-cutout.png',
}
const PAIR_IMG: Record<'oil' | 'cream', string> = {
  oil:   '/products/oil-pair.png',
  cream: '/products/cream-pair.png',
}
const BUNDLE_IMG = '/products/bundle-duo.png'

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

  return (
    <div className="flex flex-col gap-3">
      <p className="font-bold text-veluna-dark text-sm">اختاري العرض المناسب لك</p>

      {/* ── قطعة واحدة ── */}
      <button type="button" onClick={() => handleSelect('single')} className={cardCls(selected === 'single')}>
        <div className="flex items-stretch">
          <OfferImage src={SINGLE_IMG[product.type]} alt={product.name} />
          <div className={infoCls(selected === 'single')}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Radio active={selected === 'single'} />
                <span className="font-bold text-veluna-dark text-sm">واحد فقط</span>
              </div>
              <span className="font-extrabold text-veluna-plum tabular-nums text-sm flex-shrink-0">
                {singlePrice} <span className="text-xs font-normal">درهم</span>
              </span>
            </div>
            <p className="text-xs text-veluna-muted leading-relaxed ps-6">
              مناسب إذا بغيتي تجربي الروتين لأول مرة
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
            <OfferImage src={PAIR_IMG[product.type]} alt={`${product.name} × 2`} badge="×2" />
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
                وفري أكثر وخلي الروتين واجد عندك
              </p>
              <div className="ps-6 space-y-0.5">
                {perUnitSaving > 0 && (
                  <p className="text-[11px] text-veluna-muted">
                    ثمن القطعة: {singlePrice} درهم — توفير {perUnitSaving} درهم فالقطعة
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
            ✦ أحسن اختيار للروتين الكامل
          </span>
          <button type="button" onClick={() => handleSelect('bundle')} className={cardCls(selected === 'bundle')}>
            <div className="flex items-stretch">
              <OfferImage src={BUNDLE_IMG} alt="روتين Veluna الكامل — الزيت والكريم" />
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
                <p className="text-[11px] text-veluna-muted leading-relaxed ps-6">إزالة الشعر + العناية بالملمس من بعده</p>
                <p className="text-xs font-semibold text-[#25D366] ps-6">
                  وفري {bundleSaving} درهم — العرض الأنسب
                </p>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* ── CTA ── */}
      <button type="button" onClick={handleConfirm} className="w-full btn-primary py-4 text-base mt-1">
        كملي الطلب
      </button>

      {/* ── Trust strip ── */}
      <div className="grid grid-cols-3 gap-2">
        {['الدفع عند الاستلام', 'توصيل داخل المغرب', 'غادي نتاصلو بك للتأكيد'].map((t) => (
          <div key={t} className="flex flex-col items-center gap-0.5 bg-veluna-blush rounded-xl px-2 py-2.5 text-center">
            <span className="text-veluna-plum text-xs font-bold">✓</span>
            <span className="text-[10px] font-medium text-veluna-text leading-tight">{t}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* Shared image panel — clean, same footprint for every option */
function OfferImage({ src, alt, badge }: { src: string; alt: string; badge?: string }) {
  return (
    <div className="relative flex-shrink-0 w-[124px] bg-gradient-to-br from-veluna-blush to-[#F1E5EE] overflow-hidden">
      {badge && (
        <span className="absolute top-2 end-2 z-10 bg-veluna-plum text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full shadow-sm leading-none">
          {badge}
        </span>
      )}
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain p-1.5"
        sizes="124px"
        style={{ filter: 'drop-shadow(0 5px 9px rgba(122,62,104,0.20))' }}
      />
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
