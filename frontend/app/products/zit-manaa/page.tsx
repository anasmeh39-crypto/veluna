'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { getProductBySlug } from '@/lib/products'
import StickyMobileCart from '@/components/StickyMobileCart'
import OfferSelector from '@/components/OfferSelector'

export default function OilProductPage() {
  const product    = getProductBySlug('zit-manaa')!
  const [activeImg, setActiveImg] = useState(0)
  const offerRef   = useRef<HTMLDivElement>(null)

  const gallery = [
    {
      src:        '/products/oil.png',
      alt:        'زيت إزالة الشعر Veluna — صورة المنتج',
      bg:         'from-[#F8EEF5] to-[#FDF6FA]',
      pad:        'p-10',
      thumbCover: false,
      hasBA:      false,
    },
    {
      src:        '/products/oil-2.jpg',
      alt:        'نتائج قبل وبعد استخدام زيت إزالة الشعر',
      bg:         'from-[#EDD0C3] to-[#F4E3DA]',
      pad:        'p-0',
      thumbCover: true,
      hasBA:      true,
    },
  ]
  const active = gallery[activeImg]

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        {/* ── Hero grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          {/* ── Gallery (2 images) ── */}
          <div className="space-y-3">
            {/* Main display */}
            <div className={`aspect-square bg-gradient-to-br ${active.bg} rounded-2xl overflow-hidden relative shadow-veluna-sm`}>
              {gallery.map((g, i) => (
                <Image
                  key={g.src}
                  src={g.src}
                  alt={g.alt}
                  fill
                  className={`object-contain ${g.pad} transition-opacity duration-300 ${
                    i === activeImg ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority={i === 0}
                />
              ))}
              {/* قبل / بعد overlay — only on before/after slide */}
              {active.hasBA && (
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3">
                  <div className="self-end flex flex-col gap-2">
                    <span className="bg-veluna-plum/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-sm self-end">
                      قبل
                    </span>
                    <span className="mt-auto" />
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnails (2) */}
            <div className="flex gap-3">
              {gallery.map((g, i) => (
                <button
                  key={g.src}
                  onClick={() => setActiveImg(i)}
                  aria-label={g.alt}
                  className={`relative flex-1 aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                    i === activeImg
                      ? 'border-veluna-plum shadow-veluna-sm'
                      : 'border-veluna-petal hover:border-veluna-mauve'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${g.bg}`} />
                  <Image
                    src={g.src}
                    alt=""
                    fill
                    className={`${g.thumbCover ? 'object-cover' : 'object-contain p-2'} relative`}
                    sizes="(max-width: 1024px) 50vw, 200px"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* ── Product info ── */}
          <div className="flex flex-col gap-4">

            {/* Breadcrumb */}
            <nav aria-label="المسار" className="text-xs text-veluna-muted">
              الرئيسية / <span className="text-veluna-text font-semibold">{product.name}</span>
            </nav>

            {/* Title + stars + tagline */}
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-veluna-dark leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="stars text-sm" aria-label={`${product.rating} نجوم من 5`}>
                  {'★'.repeat(Math.round(product.rating))}
                </span>
                <span className="text-xs text-veluna-muted font-medium">
                  {product.rating} ({product.reviewCount} تقييم)
                </span>
              </div>
              <p className="text-veluna-plum font-semibold mt-1.5">{product.tagline}</p>
            </div>

            <p className="text-veluna-muted text-sm leading-relaxed">{product.shortDesc}</p>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-veluna-plum tabular-nums">
                {product.price} <span className="text-base font-semibold">درهم</span>
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-veluna-muted line-through text-sm">{product.originalPrice} درهم</span>
                  <span className="bg-veluna-plum text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    خصم {Math.round((1 - product.price / product.originalPrice) * 100)}%
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-veluna-muted -mt-2">الحجم: {product.volume}</p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 py-2 border-y border-veluna-petal">
              {['الدفع عند الاستلام', 'توصيل سريع للمغرب', 'ضمان الجودة'].map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-xs text-veluna-muted font-medium">
                  <span className="text-veluna-plum font-bold">✓</span>
                  {t}
                </span>
              ))}
            </div>

            {/* Offer selector */}
            <div ref={offerRef}>
              <OfferSelector product={product} />
            </div>
          </div>
        </div>

        {/* ── Benefits + How to use ── */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-veluna-blush rounded-2xl p-6">
            <h2 className="text-lg font-bold text-veluna-dark mb-4">فوائد المنتج</h2>
            <ul className="space-y-3" role="list">
              {product.benefits.map((b, i) => (
                <li key={i} className="flex gap-3 text-sm text-veluna-text">
                  <span className="w-5 h-5 rounded-full bg-veluna-plum text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5" aria-hidden="true">
                    ✓
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-veluna-light rounded-2xl p-6">
            <h2 className="text-lg font-bold text-veluna-dark mb-4">طريقة الاستخدام</h2>
            <ol className="space-y-3">
              {product.howToUse.map((s) => (
                <li key={s.step} className="flex gap-3">
                  <span className="w-7 h-7 rounded-full bg-veluna-plum text-white font-bold text-sm flex items-center justify-center flex-shrink-0" aria-hidden="true">
                    {s.step}
                  </span>
                  <p className="text-sm text-veluna-text leading-relaxed pt-0.5">{s.text}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* ── Warnings ── */}
        <div className="mt-6">
          <div className="warning-box">
            <p className="font-bold text-amber-900 mb-3">تحذيرات وإرشادات السلامة</p>
            <ul className="space-y-2" role="list">
              {product.warnings.map((w, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="flex-shrink-0 mt-0.5" aria-hidden="true">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Ingredients ── */}
        <section className="mt-8">
          <h2 className="text-lg font-bold text-veluna-dark mb-4">المكونات الأساسية</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {product.ingredients.map((ing) => (
              <div key={ing.name} className="bg-white rounded-xl p-4 border border-veluna-petal hover:shadow-veluna-sm transition-shadow">
                <p className="font-bold text-veluna-dark text-xs leading-snug">{ing.name}</p>
                <p className="text-xs text-veluna-muted mt-1.5 leading-relaxed">{ing.benefit}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-veluna-muted mt-3 italic">
            * قائمة مبسطة للمكونات الأساسية. المنتج يحتوي على مكونات إضافية. ماشي ادعاء طبي.
          </p>
        </section>

        {/* ── Who for ── */}
        <div className="mt-6 bg-veluna-blush rounded-2xl p-5 border border-veluna-petal">
          <h2 className="text-base font-bold text-veluna-dark mb-2">لمن هذا المنتج؟</h2>
          <p className="text-sm text-veluna-text leading-relaxed">{product.whoFor}</p>
        </div>

        {/* ── FAQ ── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-veluna-dark mb-4">أسئلة عن المنتج</h2>
          <div className="space-y-2">
            {product.faq.map((f, i) => (
              <details key={i} className="group border border-veluna-petal rounded-xl overflow-hidden">
                <summary className="flex justify-between items-center px-5 py-4 cursor-pointer bg-white hover:bg-veluna-cream transition-colors list-none">
                  <span className="font-semibold text-veluna-dark text-sm">{f.q}</span>
                  <span className="text-veluna-plum font-bold text-lg flex-shrink-0 ms-3 group-open:rotate-45 transition-transform duration-200">+</span>
                </summary>
                <div className="px-5 py-4 bg-veluna-blush border-t border-veluna-petal">
                  <p className="text-sm text-veluna-text leading-relaxed">{f.a}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        <p className="text-xs text-veluna-muted italic mt-6 text-center">
          النتائج كتختلف من بشرة لبشرة. المنتج مخصص للعناية التجميلية وليس علاجاً طبياً. ديري اختبار قبل الاستعمال الكامل.
        </p>
      </div>

      <StickyMobileCart product={product} ctaRef={offerRef} />
    </>
  )
}