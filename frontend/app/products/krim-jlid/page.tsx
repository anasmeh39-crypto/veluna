'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { getProductBySlug } from '@/lib/products'
import StickyMobileCart from '@/components/StickyMobileCart'
import OfferSelector from '@/components/OfferSelector'

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
  { Icon: IconGrowth,     title: 'الشعر كيبان بسرعة',          desc: 'مهما داوزتيه يرجع في أيام — ما كاين حل حقيقي' },
  { Icon: IconBumps,      title: 'الحبوب من بعد الحلاقة',       desc: 'كل مرة تحلقي يطلعو حبيبات مزعجة' },
  { Icon: IconIrritation, title: 'الحمرة والتهيج',              desc: 'البشرة كتحمر وكتتهيج من بعد كل إزالة' },
  { Icon: IconIngrown,    title: 'جلد الوزة والشعر تحت الجلد', desc: 'ملمس خشن وحبيبات مؤلمة تحت البشرة' },
]

const REVIEWS = [
  {
    name: 'إيمان', city: 'فاس', stars: 5,
    text: 'من بعد أسبوع من الاستعمال بدات نشوف فرق فالحبيبات ديال جلد الوزة. كريم رائع صراحة.',
  },
  {
    name: 'خديجة', city: 'طنجة', stars: 5,
    text: 'بشرتي ولات أنعم وما عادش كيزعجني الملمس الخشن فالرجلين. ننصح بيه لكل واحدة.',
  },
  {
    name: 'سارة', city: 'أكادير', stars: 4,
    text: 'جربتو وكيخدم. تحتاجي صبر شوية باش نشوف النتيجة ولكن يستاهل.',
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-10">
          {['الدفع عند الاستلام', 'توصيل داخل المغرب', 'دعم واتساب', 'طلب آمن'].map((label) => (
            <div key={label} className="flex items-center gap-2.5 bg-veluna-blush rounded-2xl px-4 py-3">
              <span className="w-7 h-7 rounded-full bg-veluna-plum text-white text-xs font-bold flex items-center justify-center flex-shrink-0" aria-hidden="true">✓</span>
              <span className="text-xs font-semibold text-veluna-dark leading-tight">{label}</span>
            </div>
          ))}
        </div>

        {/* ══ 3. PROBLEMS ══ */}
        <section className="py-10">
          <div className="text-center mb-8">
            <span className="tag">هاد المشاكل تعرفيها؟</span>
            <h2 className="section-heading mt-3">البشرة كتعاني — ودابا كاين الحل</h2>
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

        {/* ══ 4. SOLUTION + HOW TO USE ══ */}
        <section className="py-10 bg-veluna-blush rounded-2xl px-6 md:px-10">
          <div className="text-center mb-8">
            <span className="tag">الحل</span>
            <h2 className="section-heading mt-3">كريم Veluna — بشرة ناعمة وخالية من الحبيبات</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-veluna-dark text-base mb-4">فوائد المنتج</h3>
              <ul className="space-y-3" role="list">
                {product.benefits.map((b, i) => (
                  <li key={i} className="flex gap-3 text-sm text-veluna-text">
                    <span className="w-5 h-5 rounded-full bg-veluna-plum text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5" aria-hidden="true">✓</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-veluna-dark text-base mb-4">طريقة الاستخدام</h3>
              <ol className="space-y-3">
                {product.howToUse.map((s) => (
                  <li key={s.step} className="flex gap-3">
                    <span className="w-7 h-7 rounded-full bg-veluna-plum text-white font-bold text-sm flex items-center justify-center flex-shrink-0" aria-hidden="true">{s.step}</span>
                    <p className="text-sm text-veluna-text leading-relaxed pt-0.5">{s.text}</p>
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

        {/* ══ 5. BEFORE / AFTER (text-based — no dedicated photo yet) ══ */}
        <section className="py-12">
          <div className="text-center mb-8">
            <span className="tag">النتائج</span>
            <h2 className="section-heading mt-3">قبل وبعد الكريم</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="rounded-2xl p-7 text-center border border-veluna-petal bg-white">
              <p className="font-bold text-veluna-muted text-xs uppercase tracking-widest mb-5">قبل</p>
              <ul className="space-y-3 text-sm text-veluna-muted">
                <li>جلد الوزة والملمس الخشن</li>
                <li>حبيبات وشعر تحت الجلد</li>
                <li>تهيج وحمرة بعد الحلاقة</li>
                <li>بشرة غير متناسقة</li>
              </ul>
            </div>
            <div className="rounded-2xl p-7 text-center border-2 border-veluna-plum bg-veluna-blush">
              <p className="font-bold text-veluna-plum text-xs uppercase tracking-widest mb-5">بعد</p>
              <ul className="space-y-3 text-sm text-veluna-text font-medium">
                <li>بشرة ناعمة ومريحة</li>
                <li>ملمس متناسق وأنعم</li>
                <li>راحة من الحبيبات</li>
                <li>جلد أكثر تناسق ولمعان</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-veluna-muted text-center mt-4 italic">النتائج كتختلف من بشرة لبشرة. مع الاستعمال المنتظم.</p>
        </section>

        {/* ══ 6. REVIEWS ══ */}
        <section className="py-10">
          <div className="text-center mb-8">
            <span className="tag">آراء العملاء</span>
            <h2 className="section-heading mt-3">شنو كيقولو الناس</h2>
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
              <span className="tag">اختاري عرضك</span>
              <h2 className="text-xl font-extrabold text-veluna-dark mt-2">احصلي على Veluna دابا</h2>
              <p className="text-sm text-veluna-muted mt-1">الدفع عند الاستلام · بدون مخاطرة</p>
            </div>
            <OfferSelector product={product} onSelectedChange={setSelectedPrice} />
          </div>
        </section>

        {/* ══ 8. BRAND CONFIDENCE ══ */}
        <section className="py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: '🌿', title: 'مكونات طبيعية',     desc: 'حمض الساليسيليك وزيت شجرة الشاي — مكونات مختارة لبشرة أنعم' },
              { icon: '💧', title: 'تقشير لطيف',         desc: 'مصمم باش يساعد يزيل الجلد الميت بلطف دون تهيج' },
              { icon: '✦',  title: 'مصنوع للمرأة',       desc: 'مصمم خصيصاً لاحتياجات بشرة المرأة — فعال ومريح' },
            ].map((c) => (
              <div key={c.title} className="bg-white rounded-2xl p-6 border border-veluna-petal text-center">
                <p className="text-3xl mb-3 leading-none">{c.icon}</p>
                <p className="font-bold text-veluna-dark text-sm mb-2">{c.title}</p>
                <p className="text-xs text-veluna-muted leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══ 9. FAQ ══ */}
        <section className="py-10">
          <div className="text-center mb-8">
            <span className="tag">أسئلة شائعة</span>
            <h2 className="section-heading mt-3">عندك سؤال؟</h2>
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
          النتائج كتختلف من بشرة لبشرة. المنتج مخصص للعناية التجميلية وليس علاجاً طبياً. ديري اختبار قبل الاستعمال الكامل.
        </p>
      </div>

      {/* ══ 10. STICKY MOBILE CTA ══ */}
      <StickyMobileCart product={product} ctaRef={offerRef} selectedPrice={selectedPrice} />
    </>
  )
}