import Link from 'next/link'
import ProductImage from '../ProductImage'
import { products } from '@/lib/products'

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
      badge:   'bg-veluna-lavender/40 text-veluna-plum',
      border:  'border-veluna-lavender',
      bg:      'from-veluna-blush to-veluna-cream',
      warning: 'ما تفوتيش 10 دقايق',
    },
    {
      number:  '٢',
      product:  cream,
      timing:  'من بعد 24 ساعة على الأقل',
      action:  'ضعي الكريم على المناطق المتأثرة بعد 24 ساعة من الإزالة واستعمليه كروتين يومي',
      why:     'كيساعد يحسن مظهر الشعر تحت الجلد والحبيبات ويخلي البشرة ناعمة ومرطبة',
      badge:   'bg-veluna-pink/50 text-veluna-plum',
      border:  'border-veluna-pink',
      bg:      'from-[#FFF0F5] to-veluna-cream',
      warning: null,
    },
  ]

  return (
    <section className="bg-veluna-cream py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="tag">روتين Veluna</span>
          <h2 className="section-heading mt-4">
            خطوتين فقط —{' '}
            <span className="text-veluna-plum">بشرة مثالية</span>
          </h2>
          <p className="section-sub">
            ما محتاجة منتجات كثيرة. روتين Veluna من خطوتين كيعطيك نتيجة حقيقية.
          </p>
          <div className="lavender-line mx-auto mt-6" />
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`rounded-2xl border-2 ${step.border} bg-gradient-to-br ${step.bg} p-6 flex flex-col gap-4`}
            >
              {/* Step + timing */}
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-full bg-veluna-plum text-white font-extrabold text-xl flex items-center justify-center">
                  {step.number}
                </span>
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${step.badge}`}>
                  {step.timing}
                </span>
              </div>

              {/* Product */}
              <div className="flex gap-4 items-center">
                <div className="w-20 h-28 flex-shrink-0">
                  <ProductImage
                    type={step.product.type}
                    colorFrom={step.product.colorFrom}
                    colorTo={step.product.colorTo}
                  />
                </div>
                <div>
                  <Link href={`/products/${step.product.slug}`}>
                    <h3 className="font-bold text-veluna-dark text-sm leading-snug hover:text-veluna-plum transition-colors">
                      {step.product.shortName || step.product.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-veluna-text mt-1.5 leading-relaxed">{step.action}</p>
                </div>
              </div>

              {/* Why */}
              <div className="bg-white/70 rounded-xl px-4 py-3 text-xs text-veluna-text leading-relaxed">
                ✓ {step.why}
              </div>

              {/* Warning if any */}
              {step.warning && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
                  <span>⚠️</span>
                  <span className="font-medium">{step.warning}</span>
                </div>
              )}

              {/* Price + link */}
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/50">
                <span className="font-extrabold text-veluna-plum">
                  {step.product.price} <span className="text-xs font-semibold">درهم</span>
                </span>
                <Link href={`/products/${step.product.slug}`} className="text-xs font-bold text-veluna-plum hover:underline">
                  اعرفي أكثر ←
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bundle CTA */}
        <div className="text-center mt-10">
          <p className="text-veluna-muted text-sm mb-4">
            أو خذي الاثنين مع بعضهم بسعر أحسن مع الباقة الكاملة
          </p>
          <Link href="/packs" className="btn-primary">
            شوفي روتين Veluna الكامل
          </Link>
        </div>
      </div>
    </section>
  )
}
