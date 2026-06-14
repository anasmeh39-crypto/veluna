'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import { getProductById } from '@/lib/products'

const BUNDLE_ID       = 'routine-complete'
const BUNDLE_PRICE    = 249
const BUNDLE_ORIGINAL = 278

export default function UpsellPage() {
  const router = useRouter()
  const { items, total, setCart } = useCart()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Redirect if cart state doesn't need upsell
  useEffect(() => {
    if (!mounted) return
    const hasOil    = items.some(i => i.id === 'zit-manaa')
    const hasCream  = items.some(i => i.id === 'krim-jlid')
    const hasBundle = items.some(i => i.id === BUNDLE_ID)
    const skip = items.length === 0 || hasBundle || (hasOil && hasCream) || total >= BUNDLE_PRICE
    if (skip) router.replace('/checkout')
  }, [mounted, items, total, router])

  if (!mounted) return <div className="min-h-screen bg-veluna-blush" />

  const hasOil = items.some(i => i.id === 'zit-manaa')
  const upsellId      = hasOil ? 'krim-jlid' : 'zit-manaa'
  const upsellProduct = getProductById(upsellId)
  if (!upsellProduct) return null

  const addonPrice = BUNDLE_PRICE - total
  const saving     = total + upsellProduct.price - BUNDLE_PRICE

  const isCream = upsellProduct.type === 'cream'

  const headline = isCream ? 'روتينك ما اكتملش بعد' : 'الكريم وحده ما يكفيش'

  const narrative = isCream
    ? 'الزيت يساعدك تزيلي الشعر — والكريم هو اللي يمنع الشعر من الرجوع تحت الجلد وكيعالج حبيبات جلد الوزة. بدون الكريم، المشكل كيرجع.'
    : 'الكريم كيعالج البشرة من بعد الإزالة — بس الزيت هو اللي يسهل عليك الإزالة ويرطب البشرة من البداية. الاثنين مع بعض كيفركو.'

  const benefits = isCream
    ? [
        'كيمنع الشعر من الرجوع تحت الجلد بعد الإزالة',
        'كيعالج حبيبات جلد الوزة ويخلي البشرة ناعمة',
        'ترطيب عميق يدوم — بشرة ناعمة لأسابيع',
      ]
    : [
        'إزالة الشعر أسهل وأقل قساوة على البشرة',
        'كيرطب ويهدئ البشرة أثناء وبعد الإزالة',
        'ينقص التهيج والحبيبات من الخطوة الأولى',
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
    <div className="min-h-screen bg-gradient-to-b from-veluna-blush via-white to-veluna-cream" dir="rtl">

      {/* ── Top bar ── */}
      <div className="pt-6 pb-4 px-4 flex flex-col items-center gap-5 border-b border-veluna-petal/50 bg-white/70 backdrop-blur-sm sticky top-0 z-10">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="فيلونا"
            width={110}
            height={34}
            className="h-8 w-auto"
            sizes="110px"
            priority
          />
        </Link>

        {/* Progress steps */}
        <div className="flex items-center gap-1.5 text-[11px]">
          <Step n={1} label="العرض" done />
          <div className="w-6 h-px bg-veluna-lavender" />
          <Step n={2} label="كملي الروتين" active />
          <div className="w-6 h-px bg-veluna-petal" />
          <Step n={3} label="معلوماتك" />
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-6 pb-12 space-y-4">

        {/* ── Hero dark card ── */}
        <div className="relative bg-gradient-to-br from-[#1E1424] via-veluna-dark to-veluna-plum rounded-3xl overflow-hidden p-6 text-white">
          {/* Ambient glow */}
          <div
            className="absolute inset-0 opacity-25 pointer-events-none"
            style={{ background: 'radial-gradient(circle at 20% 60%, #DCC7FF 0%, transparent 55%)' }}
          />

          {/* Pill badge */}
          <div className="relative mb-4">
            <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white/90 text-[11px] font-bold px-3 py-1 rounded-full border border-white/20">
              <span className="text-amber-400">★</span>
              عرض خاص — فقط مع هاد الطلب
            </span>
          </div>

          <div className="relative flex items-end gap-5">
            {/* Product photo */}
            <div className="flex-shrink-0 relative w-32 h-48">
              <Image
                src={upsellProduct.type === 'oil' ? '/products/oil-cutout.png' : '/products/cream-cutout.png'}
                alt={upsellProduct.name}
                fill
                className="object-contain"
                style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.35))' }}
                sizes="128px"
                priority
              />
            </div>

            {/* Copy */}
            <div className="flex-1 pb-2">
              <h1 className="text-2xl font-extrabold leading-tight">
                {headline}
              </h1>
              <p className="text-white/70 text-xs mt-2 leading-relaxed">
                {narrative}
              </p>
            </div>
          </div>
        </div>

        {/* ── Benefits ── */}
        <div className="bg-white rounded-2xl border border-veluna-petal p-5 space-y-3.5">
          <p className="text-xs font-bold text-veluna-muted uppercase tracking-wide">
            علاش {upsellProduct.shortName ?? upsellProduct.name}؟
          </p>
          {benefits.map((b, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-veluna-plum/10 text-veluna-plum text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                ✓
              </span>
              <p className="text-sm text-veluna-text leading-snug">{b}</p>
            </div>
          ))}
        </div>

        {/* ── Price callout ── */}
        <div className="bg-veluna-blush rounded-2xl border-2 border-veluna-lavender p-5">
          <p className="text-xs text-veluna-muted mb-3">
            أضيفي {upsellProduct.shortName ?? upsellProduct.name} لطلبك الحالي:
          </p>
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-extrabold text-veluna-plum tabular-nums leading-none">
                  {addonPrice}
                </span>
                <span className="text-base font-bold text-veluna-plum">درهم فقط</span>
              </div>
              <p className="text-xs text-veluna-muted line-through mt-1">
                بدل {upsellProduct.price} درهم لو اشتريتيها لوحدها
              </p>
            </div>

            {saving > 0 && (
              <div className="bg-[#25D366] text-white rounded-2xl px-4 py-3 text-center flex-shrink-0">
                <p className="text-[10px] font-bold leading-none mb-0.5">توفري</p>
                <p className="text-2xl font-extrabold tabular-nums leading-none">{saving}</p>
                <p className="text-[10px] font-semibold leading-none mt-0.5">درهم</p>
              </div>
            )}
          </div>

          {/* Total line */}
          <div className="mt-4 pt-3 border-t border-veluna-lavender/40 flex items-center justify-between text-sm">
            <span className="text-veluna-muted">مجموع الروتين الكامل</span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-veluna-dark tabular-nums">{BUNDLE_PRICE}</span>
              <span className="text-xs font-semibold text-veluna-muted">درهم</span>
              <span className="text-xs text-veluna-muted line-through tabular-nums">({BUNDLE_ORIGINAL})</span>
            </div>
          </div>
        </div>

        {/* ── CTA buttons ── */}
        <div className="flex flex-col gap-3 pt-1">
          <button
            type="button"
            onClick={acceptUpsell}
            className="w-full bg-veluna-plum text-white font-extrabold py-4 px-6 rounded-2xl
                       hover:bg-[#653156] active:scale-[0.97] transition-all duration-150
                       text-[15px] shadow-veluna-md"
          >
            نعم! كملي الروتين — {BUNDLE_PRICE} درهم
          </button>

          <button
            type="button"
            onClick={declineUpsell}
            className="text-sm text-veluna-muted hover:text-veluna-text transition-colors py-2.5 text-center"
          >
            لا شكراً، أكملي الطلب بدون إضافة
          </button>
        </div>

        {/* ── Reassurance strip ── */}
        <div className="flex items-center justify-center gap-5 pt-1 text-[11px] text-veluna-muted">
          <span>✓ الدفع عند الاستلام</span>
          <span>✓ توصيل سريع</span>
          <span>✓ ضمان الجودة</span>
        </div>
      </div>
    </div>
  )
}

function Step({ n, label, done, active }: { n: number; label: string; done?: boolean; active?: boolean }) {
  return (
    <div className="flex items-center gap-1">
      <div className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0 ${
        done
          ? 'bg-veluna-plum text-white'
          : active
            ? 'bg-veluna-lavender text-veluna-plum border-2 border-veluna-plum'
            : 'border-2 border-veluna-petal text-veluna-muted'
      }`}>
        {done ? '✓' : n}
      </div>
      <span className={`${active ? 'text-veluna-dark font-semibold' : 'text-veluna-muted'}`}>
        {label}
      </span>
    </div>
  )
}
