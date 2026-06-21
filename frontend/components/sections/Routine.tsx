import Link from 'next/link'
import Image from 'next/image'
import { products } from '@/lib/products'

// Clean transparent cutouts (no grey box) for a premium look
const PRODUCT_PHOTO: Record<'oil' | 'cream', string> = {
  oil:   '/products/oil-cutout.png',
  cream: '/products/cream-cutout.png',
}

export default function Routine() {
  const oil   = products[0]
  const cream = products[1]

  const steps = [
    {
      number:  '١',
      product:  oil,
      timing:  'يوم إزالة الشعر',
      action:  'ضعي الزيت على البشرة الجافة، خليه 5-8 دقايق، ومسحيه بماء دافئ',
      why:     'كيساعد يزيل الشعر بسهولة ويرطب البشرة، بدون ما يجفف أو يؤذي الجلد',
      timingCls: 'text-veluna-plum',
      border:  'border-veluna-lavender',
      bg:      'from-veluna-blush to-veluna-cream',
      band:    'from-veluna-lavender/30 to-veluna-blush',
      warning: 'ما تفوتيش 10 دقايق',
    },
    {
      number:  '٢',
      product:  cream,
      timing:  'من بعد 24 ساعة على الأقل',
      action:  'ضعي الكريم على المناطق المتأثرة بعد 24 ساعة من الإزالة واستعمليه كروتين يومي',
      why:     'كيساعد يحسن مظهر الشعر تحت الجلد والحبيبات ويخلي البشرة ناعمة ومرطبة',
      timingCls: 'text-veluna-plum',
      border:  'border-veluna-pink',
      bg:      'from-[#FFF0F5] to-veluna-cream',
      band:    'from-veluna-pink/30 to-[#FFF0F5]',
      warning: null as string | null,
    },
  ]

  return (
    <section className="bg-veluna-cream py-10 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
          <span className="tag">روتين فيلونا</span>
          <h2 className="section-heading mt-4">
            خطوتين فقط —{' '}
            <span className="text-veluna-plum">بشرة مثالية</span>
          </h2>
          <p className="section-sub">
            ما محتاجة منتجات كثيرة. روتين فيلونا من خطوتين كيعطيك نتيجة حقيقية.
          </p>
          <div className="lavender-line mx-auto mt-6" />
        </div>

        {/* Steps with connector */}
        <div className="flex flex-col md:flex-row items-stretch justify-center gap-4 md:gap-3 max-w-4xl mx-auto">
          {steps.map((step, idx) => (
            <div key={step.number} className="contents">
              <article
                className={`flex-1 flex flex-col bg-gradient-to-br ${step.bg} rounded-2xl border-2 ${step.border}
                            overflow-hidden transition-shadow duration-300 hover:shadow-veluna-md`}
              >
                {/* Image band */}
                <Link href={`/products/${step.product.slug}`} className={`relative block h-48 bg-gradient-to-br ${step.band}`}>
                  <Image
                    src={PRODUCT_PHOTO[step.product.type]}
                    alt={step.product.name}
                    fill
                    className="object-contain p-4 transition-transform duration-500 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 400px"
                    style={{ filter: 'drop-shadow(0 8px 16px rgba(122,62,104,0.18))' }}
                  />
                  {/* Step number */}
                  <span className="absolute top-3 start-3 w-9 h-9 rounded-full bg-veluna-plum text-white font-extrabold text-lg flex items-center justify-center shadow-veluna-sm">
                    {step.number}
                  </span>
                  {/* Timing chip */}
                  <span className={`absolute top-3 end-3 text-[11px] font-bold px-3 py-1.5 rounded-full bg-white/85 backdrop-blur-sm shadow-sm ${step.timingCls}`}>
                    {step.timing}
                  </span>
                </Link>

                {/* Body */}
                <div className="p-5 flex flex-col gap-3 flex-1">
                  <Link href={`/products/${step.product.slug}`}>
                    <h3 className="font-bold text-veluna-dark text-base leading-snug hover:text-veluna-plum transition-colors">
                      {step.product.shortName || step.product.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-veluna-text leading-relaxed">{step.action}</p>

                  <div className="bg-white/70 rounded-xl px-4 py-3 text-xs text-veluna-text leading-relaxed">
                    ✓ {step.why}
                  </div>

                  {step.warning && (
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
                      <span className="font-bold">!</span>
                      <span className="font-medium">{step.warning}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/60">
                    <span className="font-extrabold text-veluna-plum">
                      {step.product.price} <span className="text-xs font-semibold">درهم</span>
                    </span>
                    <Link href={`/products/${step.product.slug}`} className="text-xs font-bold text-veluna-plum hover:underline">
                      اعرفي أكثر ←
                    </Link>
                  </div>
                </div>
              </article>

              {/* Connector between step 1 and step 2 */}
              {idx === 0 && (
                <div className="flex md:flex-col items-center justify-center flex-shrink-0">
                  <span className="w-10 h-10 rounded-full bg-white border-2 border-veluna-lavender text-veluna-plum flex items-center justify-center shadow-veluna-sm">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 -rotate-90 md:rotate-0">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bundle CTA */}
        <div className="text-center mt-10">
          <p className="text-veluna-muted text-sm mb-4">
            أو خذي الاثنين مع بعضهم بسعر أحسن مع الباقة الكاملة
          </p>
          <Link href="/packs" className="btn-primary">
            شوفي روتين فيلونا الكامل
          </Link>
        </div>
      </div>
    </section>
  )
}
