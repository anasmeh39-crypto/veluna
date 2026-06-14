'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import { getProductById } from '@/lib/products'

const BUNDLE_ID       = 'routine-complete'
const BUNDLE_PRICE    = 249
const BUNDLE_ORIGINAL = 278
const OFFER_SECONDS   = 5 * 60 // urgency countdown

export default function UpsellPage() {
  const router = useRouter()
  const { items, total, setCart } = useCart()
  const [mounted, setMounted] = useState(false)
  const [shown, setShown] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(OFFER_SECONDS)

  useEffect(() => { setMounted(true) }, [])

  // Skip the upsell only when it makes no sense: empty cart, already the
  // bundle, or the customer already has BOTH products. (We still show it for
  // one OR two bottles — that's the whole point.)
  useEffect(() => {
    if (!mounted) return
    const hasOil    = items.some(i => i.id === 'zit-manaa')
    const hasCream  = items.some(i => i.id === 'krim-jlid')
    const hasBundle = items.some(i => i.id === BUNDLE_ID)
    const skip = items.length === 0 || hasBundle || (hasOil && hasCream)
    if (skip) router.replace('/checkout')
  }, [mounted, items, router])

  // Entrance animation
  useEffect(() => {
    if (!mounted) return
    const t = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(t)
  }, [mounted])

  // Urgency countdown
  useEffect(() => {
    if (!mounted) return
    const id = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [mounted])

  if (!mounted) return <div className="min-h-screen bg-veluna-blush" />

  const hasOil = items.some(i => i.id === 'zit-manaa')
  const upsellId      = hasOil ? 'krim-jlid' : 'zit-manaa'
  const upsellProduct = getProductById(upsellId)
  if (!upsellProduct) return null

  const isCream = upsellProduct.type === 'cream'
  const name    = upsellProduct.shortName ?? upsellProduct.name

  // Pricing: accepting always upgrades to the routine-complete bundle (249,
  // a real backend product → server total stays correct).
  const showAddon       = total < BUNDLE_PRICE      // one bottle in cart
  const addonPrice      = BUNDLE_PRICE - total       // e.g. +100 for 1 oil
  const complementPrice = upsellProduct.price        // cream 129 / oil 149
  const addonSaving     = complementPrice - addonPrice
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')

  const subheader = isCream
    ? 'زيدي كريم الشعر تحت الجلد وكمّلي الروتين — الزيت كيزيل الشعر، والكريم كيمنعو ما يرجعش تحت الجلد.'
    : 'زيدي زيت إزالة الشعر وكمّلي الروتين — كيسهّل الإزالة ويرطّب البشرة من البداية.'

  const benefits = isCream
    ? [
        'كيمنع الشعر من الرجوع تحت الجلد بعد الإزالة',
        'كيعالج حبيبات جلد الوزة ويخلي الملمس أنعم',
        'ترطيب عميق يدوم — بشرة مرتاحة لأسابيع',
      ]
    : [
        'إزالة الشعر أسهل وأقل قساوة على البشرة',
        'كيرطّب ويهدّئ البشرة أثناء وبعد الإزالة',
        'ينقّص التهيج والحبيبات من الخطوة الأولى',
      ]

  function acceptUpsell() {
    setCart([{
      id:        BUNDLE_ID,
      name:      'روتين فيلونا الكامل',
      price:     BUNDLE_PRICE,
      quantity:  1,
      type:      'pack',
      colorFrom: '#DCC7FF',
      colorTo:   '#7A3E68',
    }])
    router.push('/checkout')
  }

  function declineUpsell() {
    router.push('/checkout')
  }

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4
                 bg-veluna-dark/60 backdrop-blur-sm overflow-y-auto"
      onClick={declineUpsell}
    >
      {/* Modal card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-md my-auto bg-white rounded-3xl shadow-2xl overflow-hidden
                    transition-all duration-300 ${shown ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      >
        {/* Urgency bar */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-center py-2 px-4 flex items-center justify-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2M9 2h6" />
          </svg>
          <span className="text-xs font-bold">العرض ديال اليوم كيسالي من بعد</span>
          <span className="text-sm font-extrabold tabular-nums bg-white/25 rounded-md px-2 py-0.5">{mm}:{ss}</span>
        </div>

        {/* Close */}
        <button
          type="button"
          onClick={declineUpsell}
          aria-label="إغلاق"
          className="absolute top-12 end-3 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white
                     text-veluna-muted hover:text-veluna-dark flex items-center justify-center
                     shadow-sm text-lg leading-none transition-colors"
        >
          ×
        </button>

        <div className="p-6 max-h-[78vh] overflow-y-auto">

          {/* Header */}
          <div className="text-center mb-4">
            <span className="inline-flex items-center gap-1.5 bg-veluna-blush text-veluna-plum text-[11px] font-bold px-3 py-1 rounded-full mb-3">
              ⏳ تسنّاي شوية... روتينك ما كملش!
            </span>
            <h1 className="text-xl font-extrabold text-veluna-dark leading-snug">
              زيدي {name} وكمّلي الروتين
            </h1>
            <p className="text-sm text-veluna-muted mt-2 leading-relaxed">{subheader}</p>
          </div>

          {/* Product + why */}
          <div className="flex gap-4 bg-gradient-to-br from-veluna-blush to-white rounded-2xl p-4 border border-veluna-petal">
            <div className="relative w-24 h-32 flex-shrink-0">
              <Image
                src={isCream ? '/products/cream-cutout.png' : '/products/oil-cutout.png'}
                alt={upsellProduct.name}
                fill
                className="object-contain"
                style={{ filter: 'drop-shadow(0 6px 12px rgba(122,62,104,0.25))' }}
                sizes="96px"
                priority
              />
            </div>
            <ul className="flex-1 space-y-2 self-center">
              {benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-veluna-plum/10 text-veluna-plum text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
                  <span className="text-[12px] text-veluna-text leading-snug">{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Discount callout */}
          <div className="mt-4 bg-veluna-blush rounded-2xl border-2 border-veluna-lavender p-4">
            {showAddon ? (
              <>
                <p className="text-xs text-veluna-muted mb-2">زيديها لطلبك دابا بثمن خاص:</p>
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-extrabold text-veluna-plum tabular-nums leading-none">+{addonPrice}</span>
                      <span className="text-sm font-bold text-veluna-plum">درهم فقط</span>
                    </div>
                    <p className="text-xs text-veluna-muted line-through mt-1">بدل {complementPrice} درهم لوحدها</p>
                  </div>
                  {addonSaving > 0 && (
                    <div className="bg-[#25D366] text-white rounded-2xl px-3.5 py-2.5 text-center flex-shrink-0">
                      <p className="text-[10px] font-bold leading-none mb-0.5">وفري</p>
                      <p className="text-xl font-extrabold tabular-nums leading-none">{addonSaving}</p>
                      <p className="text-[10px] font-semibold leading-none mt-0.5">درهم</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="text-xs text-veluna-muted mb-2">خذي الروتين الكامل (الزيت + الكريم) بثمن أحسن:</p>
                <div className="flex items-end justify-between gap-3">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-extrabold text-veluna-plum tabular-nums leading-none">{BUNDLE_PRICE}</span>
                    <span className="text-sm font-bold text-veluna-plum">درهم</span>
                    <span className="text-xs text-veluna-muted line-through">بدل {BUNDLE_ORIGINAL}</span>
                  </div>
                  <div className="bg-[#25D366] text-white rounded-2xl px-3.5 py-2.5 text-center flex-shrink-0">
                    <p className="text-[10px] font-bold leading-none mb-0.5">وفري</p>
                    <p className="text-xl font-extrabold tabular-nums leading-none">{BUNDLE_ORIGINAL - BUNDLE_PRICE}</p>
                    <p className="text-[10px] font-semibold leading-none mt-0.5">درهم</p>
                  </div>
                </div>
              </>
            )}

            <div className="mt-3 pt-3 border-t border-veluna-lavender/50 flex items-center justify-between text-sm">
              <span className="text-veluna-muted">مجموع الروتين الكامل</span>
              <span className="font-extrabold text-veluna-dark tabular-nums">{BUNDLE_PRICE} درهم</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-2.5 mt-5">
            <button
              type="button"
              onClick={acceptUpsell}
              className="w-full bg-veluna-plum text-white font-extrabold py-4 px-5 rounded-2xl
                         hover:bg-[#653156] active:scale-[0.97] transition-all duration-150
                         text-[15px] shadow-veluna-md"
            >
              {showAddon
                ? `نعم! زيدي ${name} لطلبي (+${addonPrice} درهم)`
                : `نعم! خذي الروتين الكامل — ${BUNDLE_PRICE} درهم`}
            </button>
            <button
              type="button"
              onClick={declineUpsell}
              className="text-sm text-veluna-muted hover:text-veluna-text transition-colors py-1.5 text-center"
            >
              لا شكراً، كمّلي بالطلب الحالي
            </button>
          </div>

          {/* Reassurance */}
          <div className="flex items-center justify-center gap-4 mt-3 text-[11px] text-veluna-muted">
            <span>✓ الدفع عند الاستلام</span>
            <span>✓ توصيل سريع</span>
          </div>
        </div>
      </div>
    </div>
  )
}
