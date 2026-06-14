'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { getProductBySlug } from '@/lib/products'
import StickyMobileCart from '@/components/StickyMobileCart'
import OfferSelector from '@/components/OfferSelector'
import BeforeAfterSlider from '@/components/BeforeAfterSlider'
import ProductTrustStrip from '@/components/ProductTrustStrip'
import ResultsGallery from '@/components/ResultsGallery'

// ── Problem card icons ──────────────────────────────────────────
function IconGrowth() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  )
}
function IconBumps() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <circle cx="8" cy="8" r="2.5" /><circle cx="16" cy="8" r="2.5" />
      <circle cx="8" cy="16" r="2.5" /><circle cx="16" cy="16" r="2.5" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  )
}
function IconIrritation() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M12 2s-5 6-5 10a5 5 0 0010 0c0-1.5-.7-3-2-4 0 2.5-1.5 4-3 4s-2-1.5-2-2.5C10 7 12 2 12 2z" />
    </svg>
  )
}
function IconIngrown() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-6 h-6">
      <line x1="3" y1="10" x2="21" y2="10" />
      <circle cx="9" cy="16" r="2" /><circle cx="15" cy="14" r="2" />
      <line x1="9" y1="10" x2="9" y2="14" /><line x1="15" y1="10" x2="15" y2="12" />
    </svg>
  )
}

const PROBLEMS = [
  { Icon: IconGrowth,     title: 'الشعر تحت الجلد',            desc: 'الشعر كيبقى محبوس وكيبان بحال نقط صغيرة' },
  { Icon: IconBumps,      title: 'الحبيبات من بعد الحلاقة',     desc: 'حبيبات صغيرة كتخلي ملمس البشرة غير ناعم' },
  { Icon: IconIrritation, title: 'تهيج وحمرة',                  desc: 'البشرة كتتحسس خصوصاً من بعد الموس أو الحلاوة' },
  { Icon: IconIngrown,    title: 'جلد الوزة',                   desc: 'خشونة ونقط كتظهر فالرجلين، اليدين، أو مناطق الجسم' },
]

const REVIEWS = [
  {
    name: 'إيمان', city: 'فاس', stars: 5,
    text: 'كنت كنحس بملمس خشن فالرجلين. مع الاستعمال المنتظم بدا الملمس كيتحسن وولات البشرة أنعم.',
  },
  {
    name: 'خديجة', city: 'طنجة', stars: 5,
    text: 'عجبني حيث ماشي روتين معقد. كنستعملو من بعد 24 ساعة من الحلاقة وكيعاونني على الحبيبات.',
  },
  {
    name: 'سارة', city: 'أكادير', stars: 4,
    text: 'خاصو شوية ديال الانتظام، ولكن كيبان الفرق فنعومة البشرة مع الوقت.',
  },
]

const FAQ = [
  { q: 'واش نقدر نستعمل الكريم مباشرة من بعد الحلاقة؟', a: 'لا. من الأفضل تستناي 24 ساعة على الأقل من بعد إزالة الشعر، خصوصاً إلا كانت البشرة حساسة.' },
  { q: 'واش الكريم كيساعد على الشعر تحت الجلد؟',         a: 'أيه، كيساعد يحسن مظهر الشعر النامي تحت الجلد بفضل التقشير اللطيف بحمض الساليسيليك.' },
  { q: 'واش الكريم مناسب للمناطق الحساسة؟',              a: 'الكريم مصنوع لبشرة الجسم العامة. ديري اختبار صغير أولاً، وتجنبي المناطق الحساسة جداً.' },
  { q: 'متى كنبدأ نشوف نتيجة؟',                         a: 'النتائج كتختلف من بشرة لبشرة. مع الاستعمال المنتظم كيبان تحسن في ملمس البشرة خلال أسابيع.' },
  { q: 'فاش كيوصل الطلب وشحال كيتأخر؟',                a: 'كنوصلو لجميع مدن المغرب خلال 2-5 أيام عمل. غادي نتصلو بك باش نأكدو تفاصيل التوصيل.' },
  { q: 'واش الدفع عند الاستلام متاح؟',                  a: 'أيه! ما كاين حتى مبلغ مقدم. كتخلصي فقط من بعد ما تستقبلي المنتج فالباب.' },
]

export default function CreamProductPage() {
  const product      = getProductBySlug('krim-jlid')!
  const [activeImg, setActiveImg] = useState(0)
  const [selectedPrice, setSelectedPrice] = useState(249)
  const offerRef     = useRef<HTMLDivElement>(null)

  const gallery = [
    { src: '/products/cream.png',   alt: 'كريم الشعر تحت الجلد Veluna — صورة المنتج',    bg: 'from-[#F8EEF5] to-[#FDF6FA]', pad: 'p-6', thumbCover: false },
    { src: '/products/cream-2.jpg', alt: 'روتين Veluna الكامل — الكريم والزيت معاً',      bg: 'from-[#F8EEF5] to-[#F0E8F2]', pad: 'p-0', thumbCover: true  },
  ]
  const active = gallery[activeImg]

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ══ 1. HERO ══ */}
        <div className="py-8 md:py-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          {/* Gallery */}
          <div className="space-y-3">
            <div className={`aspect-square bg-gradient-to-br ${active.bg} rounded-2xl overflow-hidden relative shadow-veluna-sm`}>
              {gallery.map((g, i) => (
                <Image
                  key={g.src} src={g.src} alt={g.alt} fill
                  className={`object-contain ${g.pad} transition-opacity duration-300 ${i === activeImg ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority={i === 0}
                />
              ))}
            </div>
            <div className="flex gap-3">
              {gallery.map((g, i) => (
                <button key={g.src} onClick={() => setActiveImg(i)} aria-label={g.alt}
                  className={`relative flex-1 aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 ${i === activeImg ? 'border-veluna-plum shadow-veluna-sm' : 'border-veluna-petal hover:border-veluna-mauve'}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${g.bg}`} />
                  <Image src={g.src} alt="" fill
                    className={`${g.thumbCover ? 'object-cover' : 'object-contain p-2'} relative`}
                    sizes="(max-width: 1024px) 50vw, 200px"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product info */}
          <div className="flex flex-col gap-4">
            <nav aria-label="المسار" className="text-xs text-veluna-muted">
              الرئيسية / <span className="text-veluna-text font-semibold">{product.shortName || product.name}</span>
            </nav>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-veluna-dark leading-tight">{product.name}</h1>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="stars text-sm" aria-label={`${product.rating} نجوم من 5`}>{'★'.repeat(Math.round(product.rating))}</span>
                <span className="text-xs text-veluna-muted font-medium">{product.rating} ({product.reviewCount} تقييم)</span>
              </div>
              <p className="text-veluna-plum font-semibold mt-1.5">{product.tagline}</p>
            </div>

            {/* 24h notice */}
            <div className="flex items-start gap-2.5 bg-veluna-blush border border-veluna-petal rounded-2xl px-4 py-3.5 text-sm text-veluna-text">
              <span className="text-veluna-plum mt-0.5 flex-shrink-0 font-bold text-base" aria-hidden="true">!</span>
              <span>
                استعملي الكريم على الأقل{' '}
                <strong className="text-veluna-plum">24 ساعة بعد</strong>{' '}
                إزالة الشعر، وماشي مباشرة من بعدها.
              </span>
            </div>

            <p className="text-veluna-muted text-sm leading-relaxed">{product.shortDesc}</p>
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
            <button
              onClick={() => offerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="btn-primary w-full py-4 text-base"
            >
              طلبي دابا
            </button>
          </div>
        </div>

        {/* ══ 2. TRUST STRIP ══ */}
        <ProductTrustStrip />

        {/* ══ 3. PROBLEMS ══ */}
        <section className="py-10">
          <div className="text-center mb-8">
            <span className="tag">هاد الملمس كيزعجك؟</span>
            <h2 className="section-heading mt-3">الحبيبات والشعر تحت الجلد محتاجين روتين منتظم</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PROBLEMS.map(({ Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-5 border border-veluna-petal hover:shadow-veluna-sm transition-shadow text-center">
                <div className="w-12 h-12 rounded-2xl bg-veluna-plum text-white flex items-center justify-center mx-auto mb-3">
                  <Icon />
                </div>
                <p className="font-bold text-veluna-dark text-sm leading-tight mb-1.5">{title}</p>
                <p className="text-xs text-veluna-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══ 3.5 RESULTS GALLERY ══ */}
        <ResultsGallery
          header="بشرة أنعم... وحبيبات أقل بروزاً"
          subheadline="كريم Veluna كيساعد يحسن مظهر جلد الوزة والشعر تحت الجلد مع الاستعمال المنتظم."
        />

        {/* ══ 4. SOLUTION + HOW TO USE ══ */}
        <section className="py-12">
          <div className="text-center mb-10">
            <span className="tag">الروتين الصحيح</span>
            <h2 className="section-heading mt-3">كريم Veluna لملمس أنعم ومظهر أصفى</h2>
            <p className="section-sub mt-2">فوائد واضحة وطريقة استعمال بسيطة فخطوات</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Benefits — premium card with check pills */}
            <div className="bg-gradient-to-br from-veluna-blush to-white rounded-3xl p-7 border border-veluna-petal">
              <div className="flex items-center gap-2.5 mb-5">
                <span className="w-9 h-9 rounded-xl bg-veluna-plum text-white flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M20 6L9 17l-5-5" /></svg>
                </span>
                <h3 className="font-extrabold text-veluna-dark text-lg">فوائد المنتج</h3>
              </div>
              <ul className="space-y-2.5" role="list">
                {product.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-3 bg-white rounded-2xl px-4 py-3 border border-veluna-petal/70 shadow-veluna-sm">
                    <span className="w-5 h-5 rounded-full bg-veluna-plum/10 text-veluna-plum text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5" aria-hidden="true">✓</span>
                    <span className="text-sm text-veluna-text leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* How to use — vertical timeline */}
            <div className="bg-white rounded-3xl p-7 border border-veluna-petal">
              <div className="flex items-center gap-2.5 mb-5">
                <span className="w-9 h-9 rounded-xl bg-veluna-plum text-white flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
                </span>
                <h3 className="font-extrabold text-veluna-dark text-lg">طريقة الاستخدام</h3>
              </div>
              <ol className="relative space-y-4 ps-2">
                <span className="absolute top-2 bottom-2 start-[18px] w-0.5 bg-gradient-to-b from-veluna-plum/60 to-veluna-lavender/40" aria-hidden="true" />
                {product.howToUse.map((s) => (
                  <li key={s.step} className="relative flex gap-4">
                    <span className="relative z-10 w-9 h-9 rounded-full bg-veluna-plum text-white font-bold text-sm flex items-center justify-center flex-shrink-0 ring-4 ring-white" aria-hidden="true">{s.step}</span>
                    <p className="text-sm text-veluna-text leading-relaxed pt-1.5">{s.text}</p>
                  </li>
                ))}
              </ol>
              <div className="mt-5 warning-box">
                <p className="font-bold text-amber-900 mb-2 text-sm">تحذيرات</p>
                <ul className="space-y-1" role="list">
                  {product.warnings.map((w, i) => (
                    <li key={i} className="flex gap-2 text-xs"><span className="flex-shrink-0">•</span><span>{w}</span></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ══ 5. BEFORE / AFTER (interactive slider) ══ */}
        <section className="py-12">
          <div className="text-center mb-8">
            <span className="tag">الفرق مع الاستعمال المنتظم</span>
            <h2 className="section-heading mt-3">من ملمس خشن لروتين عناية أوضح</h2>
            <p className="section-sub mt-2">زلّي الزر باش تشوفي الفرق قبل وبعد</p>
          </div>
          <BeforeAfterSlider caption="النتائج كتختلف من بشرة لبشرة. مع الاستعمال المنتظم." />
        </section>

        {/* ══ 6. REVIEWS ══ */}
        <section className="py-10">
          <div className="text-center mb-8">
            <span className="tag">تجارب العملاء</span>
            <h2 className="section-heading mt-3">شنو قالو على روتين الكريم</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {REVIEWS.map((r) => (
              <div key={r.name} className="bg-white rounded-2xl p-5 border border-veluna-petal">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-veluna-plum text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                    {r.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-veluna-dark text-sm">{r.name}</p>
                    <p className="text-xs text-veluna-muted">{r.city}</p>
                  </div>
                </div>
                <p className="stars text-sm mb-2" aria-label={`${r.stars} نجوم من 5`}>
                  {'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}
                </p>
                <p className="text-sm text-veluna-text leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══ 7. OFFER BLOCK ══ */}
        <section className="py-10">
          <div ref={offerRef} className="bg-gradient-to-br from-veluna-blush to-white rounded-2xl p-6 md:p-10 max-w-xl mx-auto">
            <div className="text-center mb-6">
              <span className="tag">اختاري العرض المناسب لك</span>
              <h2 className="text-xl font-extrabold text-veluna-dark mt-2">بداي روتين العناية بالملمس</h2>
              <p className="text-sm text-veluna-muted mt-1">الدفع عند الاستلام · تأكيد الطلب بالهاتف</p>
            </div>
            <OfferSelector product={product} onSelectedChange={setSelectedPrice} />
          </div>
        </section>

        {/* ══ 9. FAQ ══ */}
        <section className="py-10">
          <div className="text-center mb-8">
            <span className="tag">أسئلة شائعة</span>
            <h2 className="section-heading mt-3">قبل ما تطلبي، هادي أهم الأجوبة</h2>
          </div>
          <div className="space-y-2 max-w-2xl mx-auto">
            {FAQ.map((f, i) => (
              <details key={i} className="group border border-veluna-petal rounded-xl overflow-hidden">
                <summary className="flex justify-between items-center px-5 py-4 cursor-pointer bg-white hover:bg-veluna-blush transition-colors list-none">
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

        {/* ══ 9.5 FINAL OFFER — أطلبي الآن ══ */}
        <section className="py-10">
          <div className="bg-gradient-to-br from-veluna-blush via-white to-veluna-blush rounded-2xl p-6 md:p-10 max-w-xl mx-auto border-2 border-veluna-lavender shadow-veluna-md">
            <div className="text-center mb-6">
              <span className="tag">آخر خطوة</span>
              <h2 className="text-xl md:text-2xl font-extrabold text-veluna-dark mt-2">أطلبي الآن وخلصي عند الاستلام</h2>
              <p className="text-sm text-veluna-muted mt-1">اختاري العرض اللي يناسبك — التوصيل لكل المغرب</p>
            </div>
            <OfferSelector product={product} onSelectedChange={setSelectedPrice} />
          </div>
        </section>

        <p className="text-xs text-veluna-muted italic mt-2 mb-10 text-center">
          النتائج كتختلف من بشرة لبشرة. المنتج مخصص للعناية التجميلية وليس علاجاً طبياً. ديري اختبار صغير قبل الاستعمال الكامل.
        </p>
      </div>

      {/* ══ 10. STICKY MOBILE CTA ══ */}
      <StickyMobileCart product={product} ctaRef={offerRef} selectedPrice={selectedPrice} />
    </>
  )
}
