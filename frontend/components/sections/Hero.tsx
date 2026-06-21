'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-veluna-cream">

      {/* ══════════════════════════════
          MOBILE  (< lg)
          Photo on top, content below
      ══════════════════════════════ */}
      <div className="lg:hidden">

        {/* Hero photo — full width, 4:3 crop */}
        <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
          <Image
            src="/hero-duo.jpg"
            alt="منتجات فيلونا — الزيت والكريم"
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
          />
          {/* Fade into brand background at bottom */}
          <div
            className="absolute inset-x-0 bottom-0 h-28 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, transparent, #FFF7FB)' }}
          />

          {/* Floating COD badge — overlaps photo */}
          <div className="absolute bottom-5 start-4 bg-veluna-plum text-white rounded-2xl
                          px-3.5 py-2.5 shadow-veluna-md z-10">
            <p className="text-[11px] font-extrabold leading-tight">✓ الدفع عند الاستلام</p>
            <p className="text-[10px] font-medium leading-tight opacity-80 mt-0.5">بلا مخاطرة</p>
          </div>
        </div>

        {/* Mobile content */}
        <div className="px-5 pt-1 pb-10 space-y-5">
          <span className="tag">روتين العناية بالجسم</span>

          <h1 className="text-[1.75rem] font-extrabold text-veluna-dark leading-[1.25]">
            ماشي غير إزالة الشعر...{' '}
            <span className="text-veluna-plum">العناية بالبشرة</span>{' '}
            من بعده هي الأهم
          </h1>

          <p className="text-veluna-muted text-[15px] leading-relaxed">
            فيلونا كتجمع بين{' '}
            <span className="text-veluna-plum font-semibold">زيت إزالة الشعر</span>{' '}
            و<span className="text-veluna-plum font-semibold">كريم الشعر تحت الجلد</span>،
            باش تبقى بشرتك ناعمة ومرتاحة بعد كل إزالة.
          </p>

          {/* Price badges */}
          <div className="flex gap-2">
            <div className="bg-white rounded-xl border border-veluna-petal px-3 py-2 text-center shadow-veluna-sm flex-1">
              <p className="text-[10px] text-veluna-muted leading-tight">الزيت</p>
              <p className="font-extrabold text-veluna-plum text-sm">219 درهم</p>
            </div>
            <div className="bg-white rounded-xl border border-veluna-petal px-3 py-2 text-center shadow-veluna-sm flex-1">
              <p className="text-[10px] text-veluna-muted leading-tight">الكريم</p>
              <p className="font-extrabold text-veluna-plum text-sm">219 درهم</p>
            </div>
            <div className="bg-veluna-plum text-white rounded-xl px-3 py-2 text-center shadow-veluna-sm flex-1">
              <p className="text-[10px] font-bold leading-tight opacity-80">الروتين كامل</p>
              <p className="font-extrabold text-sm">249 درهم</p>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex gap-3 pt-1">
            <Link href="/packs" className="btn-primary text-sm px-5 py-3.5 flex-1 text-center">
              طلبي روتين فيلونا
            </Link>
            <Link href="/products/zit-manaa" className="btn-outline text-sm px-4 py-3.5">
              اكتشفي
            </Link>
          </div>

          {/* Trust row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-2 border-t border-veluna-petal">
            <div className="flex items-center gap-1 text-xs text-veluna-muted">
              <span className="stars text-sm">★★★★★</span>
              <span>+400 زبونة راضية</span>
            </div>
            <span className="text-xs text-veluna-muted">✓ توصيل لكل المغرب</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════
          DESKTOP  (≥ lg)
          Text RIGHT · Photo LEFT (RTL flex — first child = right)
      ══════════════════════════════ */}
      <div className="hidden lg:flex min-h-[88vh]">

        {/* ── Text column (RIGHT in RTL — first in DOM) ── */}
        <div className="flex-1 flex items-center px-10 xl:px-16 py-20 relative z-10">

          {/* Decorative blob */}
          <div className="absolute -bottom-24 -start-16 w-96 h-96 rounded-full
                          bg-veluna-lavender opacity-15 blur-3xl pointer-events-none" />

          <div className="flex flex-col gap-6 max-w-[520px] relative">

            <span className="tag self-start">روتين العناية بالجسم</span>

            <h1 className="text-4xl xl:text-5xl font-extrabold text-veluna-dark leading-[1.2]">
              ماشي غير إزالة الشعر...{' '}
              <span className="relative inline-block text-veluna-plum">
                العناية بالبشرة
                <span className="absolute -bottom-1 start-0 end-0 h-[3px] rounded-full bg-veluna-lavender" />
              </span>{' '}
              من بعده هي الأهم
            </h1>

            <p className="text-veluna-muted text-base lg:text-[17px] leading-relaxed">
              فيلونا كتجمع بين{' '}
              <span className="text-veluna-plum font-semibold">زيت إزالة الشعر</span>{' '}
              و{' '}
              <span className="text-veluna-plum font-semibold">كريم الشعر تحت الجلد</span>،
              باش تبقى بشرتك ناعمة ومرتاحة بعد كل إزالة.
            </p>

            {/* Price cards */}
            <div className="flex gap-3">
              <div className="bg-white rounded-2xl border border-veluna-petal px-4 py-3 text-center shadow-veluna-sm">
                <p className="text-[11px] text-veluna-muted leading-tight">زيت إزالة الشعر</p>
                <p className="font-extrabold text-veluna-plum mt-1">219 <span className="text-xs font-normal">درهم</span></p>
              </div>
              <div className="bg-white rounded-2xl border border-veluna-petal px-4 py-3 text-center shadow-veluna-sm">
                <p className="text-[11px] text-veluna-muted leading-tight">كريم الشعر تحت الجلد</p>
                <p className="font-extrabold text-veluna-plum mt-1">219 <span className="text-xs font-normal">درهم</span></p>
              </div>
              <div className="bg-veluna-plum text-white rounded-2xl px-4 py-3 text-center shadow-veluna-md">
                <p className="text-[11px] font-bold leading-tight opacity-80">الروتين الكامل</p>
                <p className="font-extrabold mt-1">249 <span className="text-xs font-normal">درهم</span></p>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3 pt-1">
              <Link href="/packs" className="btn-primary text-sm px-8 py-4">
                طلبي روتين فيلونا
              </Link>
              <Link href="/products/zit-manaa" className="btn-outline text-sm px-7 py-4">
                اكتشفي المنتجات
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex flex-wrap items-center gap-5 pt-3 border-t border-veluna-petal">
              <div className="flex items-center gap-1.5 text-sm text-veluna-muted">
                <span className="stars text-base">★★★★★</span>
                <span>+400 زبونة راضية</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-veluna-muted">
                <svg className="w-4 h-4 text-veluna-plum" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                الدفع عند الاستلام
              </div>
              <div className="flex items-center gap-1.5 text-sm text-veluna-muted">
                <svg className="w-4 h-4 text-veluna-plum" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" />
                </svg>
                توصيل في كل المغرب
              </div>
            </div>
          </div>
        </div>

        {/* ── Photo column (LEFT in RTL — second in DOM) ── */}
        <div className="relative w-[56%] xl:w-[58%] flex-shrink-0">
          <Image
            src="/hero-duo.jpg"
            alt="منتجات فيلونا — الزيت والكريم على طبق رخامي"
            fill
            className="object-cover object-center"
            sizes="(max-width: 1280px) 56vw, 58vw"
            priority
          />

          {/* Gradient — cream bleeds in from the text side (right edge in RTL → physically left edge) */}
          <div
            className="absolute inset-y-0 right-0 w-52 pointer-events-none"
            style={{ background: 'linear-gradient(to left, #FFF7FB 0%, transparent 100%)' }}
          />

          {/* Floating "خطوتين فقط" card */}
          <div className="absolute top-10 end-10 bg-white/90 backdrop-blur-sm rounded-2xl
                          shadow-veluna-md px-4 py-3 text-center border border-veluna-petal z-10">
            <p className="text-sm font-extrabold text-veluna-plum">خطوتين فقط</p>
            <p className="text-[11px] text-veluna-muted mt-0.5">لبشرة مثالية بعد الإزالة</p>
          </div>

          {/* Floating COD badge bottom */}
          <div className="absolute bottom-10 start-10 bg-veluna-plum text-white
                          rounded-2xl px-4 py-3 shadow-veluna-md z-10">
            <p className="text-[11px] font-extrabold leading-tight">الدفع عند الاستلام ✓</p>
            <p className="text-[10px] leading-tight opacity-80 mt-0.5">بلا مخاطرة — توصيل سريع</p>
          </div>
        </div>
      </div>

      {/* Bottom wave transition */}
      <div className="absolute bottom-0 inset-x-0 pointer-events-none">
        <svg viewBox="0 0 1440 56" fill="none" className="w-full" preserveAspectRatio="none">
          <path d="M0 56V28C240 0 480 56 720 28C960 0 1200 56 1440 28V56H0Z" fill="#F6EEFF" />
        </svg>
      </div>
    </section>
  )
}
