'use client'

import { useRef, useState } from 'react'
import { useCart } from '@/context/CartContext'
import { getProductBySlug, getProductById } from '@/lib/products'
import ProductImage from '@/components/ProductImage'
import StickyMobileCart from '@/components/StickyMobileCart'
import UpsellSection from '@/components/UpsellSection'

const WASvg = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.99.583 3.842 1.588 5.392L2 22l4.741-1.555A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 11.999 2zm.001 18c-1.617 0-3.129-.47-4.404-1.28l-.316-.188-3.28 1.077 1.098-3.192-.206-.327A7.945 7.945 0 014 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8z"/>
  </svg>
)

export default function OilProductPage() {
  const product    = getProductBySlug('zit-manaa')!
  const complement = getProductById(product.complementId)!
  const { addItem } = useCart()
  const [qty, setQty]       = useState(1)
  const [activeImg, setActiveImg] = useState(0)
  const ctaRef = useRef<HTMLDivElement>(null)

  function handleAdd() {
    for (let i = 0; i < qty; i++) {
      addItem({ id: product.id, name: product.name, price: product.price, type: 'product', colorFrom: product.colorFrom, colorTo: product.colorTo })
    }
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        {/* ── Hero grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          {/* Gallery */}
          <div className="space-y-3">
            <div className="aspect-square bg-veluna-blush rounded-2xl overflow-hidden
                            flex items-center justify-center p-10 shadow-veluna-sm">
              <ProductImage type="oil" colorFrom={product.colorFrom} colorTo={product.colorTo} />
            </div>
            <div className="flex gap-3">
              {[0, 1].map((i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  aria-label={`صورة ${i + 1}`}
                  className={`w-20 h-20 rounded-xl bg-veluna-blush flex items-center justify-center p-2 border-2
                              transition-all duration-200 ${
                                activeImg === i ? 'border-veluna-plum shadow-veluna-sm' : 'border-transparent'
                              }`}
                >
                  <ProductImage type="oil" colorFrom={product.colorFrom} colorTo={product.colorTo} />
                </button>
              ))}
            </div>
          </div>

          {/* Product info */}
          <div className="flex flex-col gap-4">

            {/* Breadcrumb */}
            <nav aria-label="المسار" className="text-xs text-veluna-muted">
              الرئيسية / <span className="text-veluna-text font-semibold">{product.name}</span>
            </nav>

            {/* Stars + reviews */}
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

            {/* ── Primary CTA ── */}
            <div ref={ctaRef} className="flex flex-col sm:flex-row gap-3">
              {/* Qty */}
              <div className="flex items-center border border-veluna-petal rounded-xl overflow-hidden">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  aria-label="إنقاص"
                  className="w-12 h-12 flex items-center justify-center text-veluna-plum hover:bg-veluna-blush
                             transition-colors font-bold text-lg"
                >
                  −
                </button>
                <span className="w-10 text-center font-bold text-veluna-dark tabular-nums">{qty}</span>
                <button
                  onClick={() => setQty(q => q + 1)}
                  aria-label="زيادة"
                  className="w-12 h-12 flex items-center justify-center text-veluna-plum hover:bg-veluna-blush
                             transition-colors font-bold text-lg"
                >
                  +
                </button>
              </div>
              <button onClick={handleAdd} className="flex-1 btn-primary py-3.5 text-base">
                أضيفي للسلة
              </button>
            </div>

            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/212600000000?text=${encodeURIComponent(`مرحباً، بغيت نطلب: ${product.name} × ${qty}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="btn-whatsapp py-3 text-sm flex items-center justify-center gap-2"
            >
              <WASvg />
              اطلبي عبر واتساب
            </a>

            {/* Trust badges — immediately under CTA per best practices */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: '✓', text: 'الدفع عند الاستلام' },
                { icon: '🚚', text: 'توصيل المغرب' },
                { icon: '💬', text: 'دعم واتساب' },
              ].map((b) => (
                <div key={b.text} className="flex flex-col items-center gap-1 bg-veluna-blush rounded-xl
                                             px-2 py-2.5 text-center text-xs font-medium text-veluna-text">
                  <span className="text-base">{b.icon}</span>
                  <span className="leading-tight">{b.text}</span>
                </div>
              ))}
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
              <span aria-hidden="true">⚠️</span> تحذيرات وإرشادات السلامة
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {product.ingredients.map((ing) => (
              <div key={ing.name} className="bg-white rounded-xl p-4 border border-veluna-petal
                                             hover:shadow-veluna-sm transition-shadow">
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

      <UpsellSection complement={complement} currentProductName={product.name} />
      <StickyMobileCart product={product} ctaRef={ctaRef} />
    </>
  )
}
