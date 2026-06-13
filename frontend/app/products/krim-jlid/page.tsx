'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { getProductBySlug } from '@/lib/products'
import StickyMobileCart from '@/components/StickyMobileCart'
import OfferSelector from '@/components/OfferSelector'

export default function CreamProductPage() {
  const product    = getProductBySlug('krim-jlid')!
  const [activeImg, setActiveImg] = useState(0)
  const offerRef = useRef<HTMLDivElement>(null)

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        {/* ── Hero grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          {/* Gallery */}
          <div className="space-y-3">
            <div className="aspect-square bg-gradient-to-br from-veluna-blush to-white rounded-2xl overflow-hidden
                            flex items-center justify-center shadow-veluna-sm relative p-8">
              <Image
                src="/products/cream.png"
                alt={product.name}
                fill
                className="object-contain p-8"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
            <div className="flex gap-3">
              {[0, 1].map((i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  aria-label={`صورة ${i + 1}`}
                  className={`relative w-20 h-20 rounded-xl bg-veluna-blush overflow-hidden border-2
                              transition-all duration-200 ${
                                activeImg === i ? 'border-veluna-plum shadow-veluna-sm' : 'border-transparent'
                              }`}
                >
                  <Image src="/products/cream.png" alt="" fill className="object-contain p-2" sizes="80px" />
                </button>
              ))}
            </div>
          </div>

          {/* Product info */}
          <div className="flex flex-col gap-4">

            {/* Breadcrumb */}
            <nav aria-label="المسار" className="text-xs text-veluna-muted">
              الرئيسية / <span className="text-veluna-text font-semibold">{product.shortName || product.name}</span>
            </nav>

            {/* Stars */}
            <div className="flex items-center gap-2">
              <span className="stars" aria-label={`${product.rating} نجوم`}>
                {'★'.repeat(Math.round(product.rating))}
              </span>
              <span className="text-sm text-veluna-muted">({product.reviewCount} تقييم)</span>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-veluna-dark leading-tight">{product.name}</h1>
              <p className="text-veluna-plum font-semibold mt-1">{product.tagline}</p>
            </div>

            <p className="text-veluna-muted text-sm leading-relaxed">{product.shortDesc}</p>

            {/* 24h important notice — prominent for this product */}
            <div className="flex items-start gap-2.5 bg-veluna-blush border border-veluna-petal
                            rounded-2xl px-4 py-3.5 text-sm text-veluna-text">
              <span className="text-veluna-plum mt-0.5 flex-shrink-0 text-base" aria-hidden="true">ℹ️</span>
              <span>
                استعملي الكريم على الأقل{' '}
                <strong className="text-veluna-plum">24 ساعة بعد</strong>{' '}
                إزالة الشعر، وماشي مباشرة من بعدها.
              </span>
            </div>

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

            {/* ── Offer selector ── */}
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
                  <span className="w-5 h-5 rounded-full bg-veluna-plum text-white text-xs flex items-center
                                   justify-center flex-shrink-0 mt-0.5" aria-hidden="true">
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
                  <span className="w-7 h-7 rounded-full bg-veluna-plum text-white font-bold text-sm
                                   flex items-center justify-center flex-shrink-0" aria-hidden="true">
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
            <p className="font-bold text-amber-900 mb-3 flex items-center gap-2">
              تحذيرات وإرشادات السلامة
            </p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
            {product.ingredients.map((ing) => (
              <div key={ing.name} className="bg-white rounded-xl p-4 border border-veluna-petal
                                             hover:shadow-veluna-sm transition-shadow">
                <p className="font-bold text-veluna-dark text-sm">{ing.name}</p>
                <p className="text-xs text-veluna-muted mt-1 leading-relaxed">{ing.benefit}</p>
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

        {/* ── Mini FAQ ── */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-veluna-dark mb-4">أسئلة عن المنتج</h2>
          <div className="space-y-2">
            {product.faq.map((f, i) => (
              <details key={i} className="group border border-veluna-petal rounded-xl overflow-hidden">
                <summary className="flex justify-between items-center px-5 py-4 cursor-pointer
                                    bg-white hover:bg-veluna-cream transition-colors list-none">
                  <span className="font-semibold text-veluna-dark text-sm">{f.q}</span>
                  <span className="text-veluna-plum font-bold text-lg flex-shrink-0 ms-3
                                   group-open:rotate-45 transition-transform duration-200">
                    +
                  </span>
                </summary>
                <div className="px-5 py-4 bg-veluna-blush border-t border-veluna-petal">
                  <p className="text-sm text-veluna-text leading-relaxed">{f.a}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        <p className="text-xs text-veluna-muted italic mt-6 text-center">
          النتائج كتختلف من بشرة لبشرة. المنتج مخصص للعناية التجميلية وليس علاجاً طبياً.
          ديري اختبار قبل الاستعمال الكامل.
        </p>
      </div>

      <StickyMobileCart product={product} ctaRef={offerRef} />
    </>
  )
}
