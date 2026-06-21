'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { getProductBySlug } from '@/lib/products'
import StickyMobileCart from '@/components/StickyMobileCart'
import OfferSelector from '@/components/OfferSelector'
import BeforeAfterSlider from '@/components/BeforeAfterSlider'
import ProductTrustStrip from '@/components/ProductTrustStrip'
import ResultsGallery from '@/components/ResultsGallery'
import ProblemCard from '@/components/ProblemCard'
import HowToSteps from '@/components/HowToSteps'

const HOWTO_STEPS = [
  { img: '/howto/oil-1.jpg', text: 'طبقي طبقة كافية على بشرة ناشفة ونقية فالمكان اللي بغيتي تزيلي منو الشعر' },
  { img: '/howto/oil-2.jpg', text: 'خليه من 5 حتى 8 دقايق، وراقبي البشرة ديالك' },
  { img: '/howto/oil-3.jpg', text: 'ما تفوتيش 10 دقايق نهائياً', warn: true },
  { img: '/howto/oil-4.jpg', text: 'مسحيه بلطف بقطعة قماش مبللة أو غسليه بالماء الدافئ' },
  { img: '/howto/oil-5.jpg', text: 'نشفي البشرة بلا فرك قوي، ومن بعد ديري مرطب مهدئ' },
]

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
  { Icon: IconGrowth,     title: 'الشعر كيبان بسرعة',          desc: 'الحلاقة كتحتاج تعاوديها بزاف وكتخلي البشرة خشنة',           img: '/problems/regrowth.jpg' },
  { Icon: IconBumps,      title: 'الحبوب من بعد الحلاقة',       desc: 'حبيبات صغيرة كتظهر من بعد الموس أو الحلاوة',              img: '/problems/bumps.jpg' },
  { Icon: IconIrritation, title: 'الحمرة والتهيج',              desc: 'البشرة كتولي حساسة ومحمرة من بعد الإزالة',                img: '/problems/redness.jpg' },
  { Icon: IconIngrown,    title: 'جلد الوزة والشعر تحت الجلد', desc: 'ملمس غير ناعم ونقط كيبانو خصوصاً فالرجلين واليدين',      img: '/problems/ingrown.jpg' },
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
  const [selectedPrice, setSelectedPrice] = useState(299)
  const offerRef     = useRef<HTMLDivElement>(null)

  const gallery = [
    { src: '/products/oil-lifestyle.jpg',  alt: 'زيت إزالة الشعر فيلونا — صورة المنتج',          bg: 'from-[#EDD0C3] to-[#F4E3DA]', thumbCover: true },
    { src: '/products/oil-2.jpg',          alt: 'نتائج قبل وبعد استخدام زيت إزالة الشعر فيلونا', bg: 'from-[#EDD0C3] to-[#F4E3DA]', thumbCover: true },
    { src: '/products/duo-lifestyle.jpg',  alt: 'روتين فيلونا الكامل — الزيت والكريم معاً',      bg: 'from-[#EDD0C3] to-[#F4E3DA]', thumbCover: true },
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
            {PROBLEMS.map(({ Icon, title, desc, img }) => (
              <ProblemCard key={title} icon={<Icon />} title={title} desc={desc} img={img} />
            ))}
          </div>
        </section>

        {/* ══ 3.5 RESULTS GALLERY ══ */}
        <ResultsGallery
          header="تخيلي إزالة الشعر بلا توتر وبلا وجع كل مرة"
          subheadline="روتين فيلونا كيساعدك تزيلي الشعر بسهولة ويخلي البشرة أنعم ومرتاحة."
        />

        {/* ══ 4. BENEFITS ══ */}
        <section className="py-12">
          <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-[#F9F0F6] to-white border border-veluna-petal shadow-veluna-sm">
            <div className="flex flex-col md:flex-row">

              {/* Photo */}
              <div className="relative md:w-[44%] flex-shrink-0 min-h-[300px] md:min-h-[480px]">
                <Image
                  src="/products/oil-lifestyle-2.jpg"
                  alt="زيت فيلونا — طريقة الاستعمال"
                  fill
                  className="object-contain object-center"
                  sizes="(max-width: 768px) 100vw, 44vw"
                />
                {/* Subtle overlay badge */}
                <div className="absolute bottom-4 start-4 bg-veluna-plum/90 backdrop-blur-sm text-white rounded-2xl px-4 py-2.5 shadow-veluna-md">
                  <p className="text-[11px] font-extrabold leading-tight">✓ طبيعي 100٪</p>
                  <p className="text-[10px] opacity-80 mt-0.5">زيوت نباتية نقية</p>
                </div>
              </div>

              {/* Benefits */}
              <div className="flex-1 p-7 md:p-10 flex flex-col justify-center gap-5">
                <div>
                  <span className="tag">فوائد المنتج</span>
                  <h2 className="section-heading mt-3 text-start">
                    زيت فيلونا لإزالة{' '}
                    <span className="text-veluna-plum">سهلة وملمس ناعم</span>
                  </h2>
                  <p className="text-veluna-muted text-sm mt-2 leading-relaxed">
                    مركّب من زيوت نباتية مختارة — كيزيل الشعر بلطف ويرطب البشرة من بعد الإزالة.
                  </p>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" role="list">
                  {product.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-3 bg-white rounded-2xl px-4 py-3 border border-veluna-petal/70 shadow-veluna-sm">
                      <span className="w-5 h-5 rounded-full bg-veluna-plum/10 text-veluna-plum text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5" aria-hidden="true">✓</span>
                      <span className="text-sm text-veluna-text leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ══ 4.5 HOW TO USE (photo steps) ══ */}
        <HowToSteps
          title="زيت إزالة الشعر فخمس خطوات"
          subtitle="استعمال بسيط — تابعي الخطوات وحصلي على بشرة ناعمة"
          steps={HOWTO_STEPS}
          warnings={product.warnings}
        />

        {/* ══ 5. BEFORE / AFTER (interactive slider) ══ */}
        <section className="py-12">
          <div className="text-center mb-8">
            <span className="tag">الفرق فالإحساس والملمس</span>
            <h2 className="section-heading mt-3">بشرة أهدأ وأنعم مع روتين واضح</h2>
            <p className="section-sub mt-2">زلّي الزر باش تشوفي الفرق قبل وبعد</p>
          </div>
          <BeforeAfterSlider
            beforeSrc="/results/oil-before.jpg"
            afterSrc="/results/oil-after.jpg"
            caption="النتائج كتختلف من بشرة لبشرة."
          />
        </section>

        {/* ══ 6. REVIEWS ══ */}
        <section className="py-10">
          <div className="text-center mb-8">
            <span className="tag">تجارب العملاء</span>
            <h2 className="section-heading mt-3">تجارب نساء رجعات ليهم نعومة البشرة بثقة</h2>
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
