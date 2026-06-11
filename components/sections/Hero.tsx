'use client'

import Link from 'next/link'
import ProductImage from '../ProductImage'
import { products } from '@/lib/products'

export default function Hero() {
  const oil   = products[0]
  const cream = products[1]

  return (
    <section className="relative overflow-hidden bg-veluna-cream min-h-[90vh] flex items-center">
      {/* Decorative blobs */}
      <div className="absolute -top-20 -end-20 w-80 h-80 rounded-full bg-veluna-lavender opacity-25 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 start-0 w-72 h-64 rounded-full bg-veluna-pink opacity-25 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

          {/* ── Text side ── */}
          <div className="order-2 lg:order-1 flex flex-col gap-5">
            <span className="tag self-start animate-fade-in">روتين العناية بالجسم</span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-veluna-dark leading-[1.22] animate-fade-up">
              ماشي غير إزالة الشعر...{' '}
              <span className="relative inline-block text-veluna-plum">
                العناية بالبشرة
                <span className="absolute -bottom-1 start-0 end-0 h-1 rounded-full bg-veluna-lavender opacity-80" />
              </span>{' '}
              من بعده هي الأهم
            </h1>

            <p className="text-veluna-muted text-base md:text-lg leading-relaxed max-w-md">
              Veluna كتجمع بين{' '}
              <span className="text-veluna-plum font-semibold">زيت إزالة الشعر</span>{' '}
              و{' '}
              <span className="text-veluna-plum font-semibold">كريم الشعر تحت الجلد</span>،
              باش تبقى بشرتك ناعمة ومرتاحة بعد كل إزالة.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <Link href="/packs" className="btn-primary text-sm px-6">
                طلبي روتين Veluna
              </Link>
              <Link href="/products/zit-manaa" className="btn-outline text-sm px-6">
                اكتشفي المنتجات
              </Link>
            </div>

            {/* Social proof row */}
            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-veluna-petal">
              <div className="flex items-center gap-1.5 text-sm text-veluna-muted">
                <span className="stars text-base">★★★★★</span>
                <span>+400 زبونة راضية</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-veluna-muted">
                <svg className="w-4 h-4 text-veluna-plum flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                الدفع عند الاستلام
              </div>
              <div className="flex items-center gap-1.5 text-sm text-veluna-muted">
                <svg className="w-4 h-4 text-veluna-plum flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" />
                </svg>
                توصيل في كل المغرب
              </div>
            </div>
          </div>

          {/* ── Products visual side ── */}
          <div className="order-1 lg:order-2 relative flex items-center justify-center">
            {/* Circle background */}
            <div className="absolute w-64 h-64 md:w-[360px] md:h-[360px] rounded-full
                            bg-gradient-to-br from-veluna-lavender/30 to-veluna-pink/30" />

            {/* Products — now links, not click-to-add */}
            <div className="relative flex items-end justify-center gap-4 z-10">

              {/* Oil bottle */}
              <Link
                href="/products/zit-manaa"
                className="w-28 sm:w-36 group -mb-4 cursor-pointer"
                aria-label={`شوفي ${oil.name}`}
              >
                <div className="h-48 sm:h-60 transition-transform duration-300 group-hover:scale-105">
                  <ProductImage type="oil" colorFrom={oil.colorFrom} colorTo={oil.colorTo} />
                </div>
                <div className="text-center mt-2">
                  <p className="text-xs font-bold text-veluna-dark leading-tight">{oil.shortName || oil.name}</p>
                  <p className="text-sm font-extrabold text-veluna-plum mt-0.5">{oil.price} درهم</p>
                </div>
              </Link>

              {/* Cream jar */}
              <Link
                href="/products/krim-jlid"
                className="w-32 sm:w-40 group cursor-pointer"
                aria-label={`شوفي ${cream.shortName || cream.name}`}
              >
                <div className="h-40 sm:h-48 transition-transform duration-300 group-hover:scale-105">
                  <ProductImage type="cream" colorFrom={cream.colorFrom} colorTo={cream.colorTo} />
                </div>
                <div className="text-center mt-2">
                  <p className="text-xs font-bold text-veluna-dark leading-tight">{cream.shortName || cream.name}</p>
                  <p className="text-sm font-extrabold text-veluna-plum mt-0.5">{cream.price} درهم</p>
                </div>
              </Link>
            </div>

            {/* Floating trust badge top */}
            <div className="absolute -top-2 start-2 md:start-6 bg-white rounded-2xl shadow-veluna-sm
                            px-3 py-2.5 text-center z-20 border border-veluna-petal">
              <p className="text-xs font-extrabold text-veluna-plum">خطوتين فقط</p>
              <p className="text-[10px] text-veluna-muted mt-0.5">لبشرة مثالية</p>
            </div>

            {/* Floating COD badge bottom */}
            <div className="absolute -bottom-2 end-2 md:end-6 bg-veluna-plum text-white
                            rounded-2xl px-3 py-2 text-center z-20 shadow-veluna-sm">
              <p className="text-[10px] font-bold leading-tight">الدفع عند الاستلام</p>
              <p className="text-[10px] font-bold leading-tight">✓ بلا مخاطرة</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 inset-x-0 pointer-events-none">
        <svg viewBox="0 0 1440 56" fill="none" className="w-full" preserveAspectRatio="none">
          <path d="M0 56V28C240 0 480 56 720 28C960 0 1200 56 1440 28V56H0Z" fill="#F6EEFF" />
        </svg>
      </div>
    </section>
  )
}
