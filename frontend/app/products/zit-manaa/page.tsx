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
  { Icon: IconGrowth,     title: 'الشعر كيبان بسرعة',          desc: 'الحلاقة كتحتاج تعاوديها بزاف وكتخلي البشرة خشنة' },
  { Icon: IconBumps,      title: 'الحبوب من بعد الحلاقة',       desc: 'حبيبات صغيرة كتظهر من بعد الموس أو الحلاوة' },
  { Icon: IconIrritation, title: 'الحمرة والتهيج',              desc: 'البشرة كتولي حساسة ومحمرة من بعد الإزالة' },
  { Icon: IconIngrown,    title: 'جلد الوزة والشعر تحت الجلد', desc: 'ملمس غير ناعم ونقط كيبانو خصوصاً فالرجلين واليدين' },
]

const REVIEWS = [
  {
    name: 'سلمى', city: 'الدار البيضاء', stars: 5,
    text: 'كنت كنستعمل الموس بزاف وبشرتي كتولي ناشفة. مع فيلونا ولات الإزالة أسهل والملمس أنعم من قبل.',
  },
  {
    name: 'نادية', city: 'الرباط', stars: 5,
    text: 'عجبني حيث الاستعمال ديالو واضح وسريع. كنديرو غير الوقت المحدد ومن بعد كنرطب البشرة مزيان.',
  },
  {
    name: 'مريم', city: 'مراكش', stars: 4,
    text: 'منتج عملي للي باغية تبدل من الحلاقة اليومية. غير خاصك تتبعي التعليمات وما تفوتيش الوقت.',
  },
]

const FAQ = [
  { q: 'واش الزيت كيحبس الشعر نهائياً؟',  a: 'لا. الزيت كيساعد يزيل الشعر من سطح البشرة بطريقة أسهل وألطف. ماشي منتج لإيقاف نمو الشعر.' },
  { q: 'شحال خاص نخلي الزيت على البشرة؟', a: 'من 5 حتى 8 دقايق فقط. ما تفوتيش 10 دقايق باش تتجنبي أي تهيج.' },
  { q: 'واش الزيت مناسب للمناطق الحساسة؟', a: 'لا، الزيت ما يستعملش على المناطق الحساسة بزاف أو على البشرة المتهيجة. ديري دائماً اختبار صغير أولاً.' },
  { q: 'واش نقدر نستعمله مع الكريم؟',      a: 'أيه، المنتجين مكملين لبعضهم. الزيت لإزالة الشعر، والكريم يستعمل من بعد 24 ساعة للعناية بالبشرة.' },
  { q: 'فاش كيوصل الطلب وشحال كيتأخر؟',   a: 'كنوصلو لجميع مدن المغرب خلال 2-5 أيام عمل. غادي نتصلو بك باش نأكدو تفاصيل التوصيل.' },
  { q: 'واش الدفع عند الاستلام متاح؟',      a: 'أيه! ما كاين حتى مبلغ مقدم. كتخلصي فقط من بعد ما تستقبلي المنتج فالباب.' },
]

export default function OilProductPage() {
  const product      = getProductBySlug('zit-manaa')!
  const [activeImg, setActiveImg] = useState(0)
  const [selectedPrice, setSelectedPrice] = useState(149 * 3 - 50)
  const offerRef     = useRef<HTMLDivElement>(null)

  const gallery = [
    { src: '/products/oil-lifestyle.jpg', alt: 'زيت إزالة الشعر فيلونا — صورة المنتج',          bg: 'from-[#EDD0C3] to-[#F4E3DA]', thumbCover: true },
    { src: '/products/oil-2.jpg',         alt: 'نتائج قبل وبعد استخدام زيت إزالة الشعر فيلونا', bg: 'from-[#EDD0C3] to-[#F4E3DA]', thumbCover: true },
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
                  className={`${g.thumbCover ? 'object-cover' : 'object-contain p-10'} transition-opacity duration-300 ${i === activeImg ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
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
              الرئيسية / <span className="text-veluna-text font-semibold">{product.name}</span>
            </nav>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-veluna-dark leading-tight">{product.name}</h1>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="stars text-sm" aria-label={`${product.rating} نجوم من 5`}>{'★'.repeat(Math.round(product.rating))}</span>
                <span className="text-xs text-veluna-muted font-medium">{product.rating} ({product.reviewCount} تقييم)</span>
              </div>
            <p className="text-veluna-plum font-semibold mt-1.5">{product.tagline}</p>
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

            {/* ── Offer / bundle selector — primary buy box, right under the price ── */}
            <div ref={offerRef} className="mt-2 pt-5 border-t border-veluna-petal">
              <OfferSelector product={product} onSelectedChange={setSelectedPrice} />
            </div>
          </div>
        </div>

        {/* ══ 2. TRUST STRIP ══ */}
        <ProductTrustStrip />

        {/* ══ 3. PROBLEMS ══ */}
        <section className="py-10">
          <div className="text-center mb-8">
            <span className="tag">واش هادشي كيتكرر معاك؟</span>
            <h2 className="section-heading mt-3">إزالة الشعر ما خاصهاش تخلي بشرتك متعبة</h2>
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
          header="تخيلي إزالة الشعر بلا توتر وبلا وجع كل مرة"
          subheadline="روتين فيلونا كيساعدك تزيلي الشعر بسهولة ويخلي البشرة أنعم ومرتاحة."
        />

        {/* ══ 4. SOLUTION + HOW TO USE ══ */}
        <section className="py-12">
          <div className="text-center mb-10">
            <span className="tag">الروتين الصحيح</span>
            <h2 className="section-heading mt-3">زيت فيلونا لإزالة سهلة وملمس ناعم</h2>
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
                {/* connecting line */}
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
            <span className="tag">الفرق فالإحساس والملمس</span>
            <h2 className="section-heading mt-3">بشرة أهدأ وأنعم مع روتين واضح</h2>
            <p className="section-sub mt-2">زلّي الزر باش تشوفي الفرق قبل وبعد</p>
          </div>
          <BeforeAfterSlider caption="النتائج كتختلف من بشرة لبشرة." />
        </section>

        {/* ══ 6. REVIEWS ══ */}
        <section className="py-10">
          <div className="text-center mb-8">
            <span className="tag">تجارب العملاء</span>
            <h2 className="section-heading mt-3">آراء بسيطة من نساء جربو الروتين</h2>
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

        {/* ══ 7. OFFER BLOCK (mid-page recap) ══ */}
        <section className="py-10">
          <div className="bg-gradient-to-br from-veluna-blush to-white rounded-2xl p-6 md:p-10 max-w-xl mx-auto">
            <div className="text-center mb-6">
              <span className="tag">اختاري العرض المناسب لك</span>
              <h2 className="text-xl font-extrabold text-veluna-dark mt-2">بداي روتين فيلونا اليوم</h2>
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

        <p className="text-xs text-veluna-muted italic mt-2 mb-10 text-center">
          النتائج كتختلف من بشرة لبشرة. المنتج مخصص للعناية التجميلية وليس علاجاً طبياً. ديري اختبار صغير قبل الاستعمال الكامل.
        </p>
      </div>

      {/* ══ 10. STICKY MOBILE CTA ══ */}
      <StickyMobileCart product={product} ctaRef={offerRef} selectedPrice={selectedPrice} />
    </>
  )
}
