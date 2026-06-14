'use client'

import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import { packs, getProductById } from '@/lib/products'
import Link from 'next/link'

const PHOTOS: Record<string, string> = {
  'zit-manaa': '/products/oil-cutout.png',
  'krim-jlid': '/products/cream-cutout.png',
}

const descriptions: Record<string, string> = {
  'routine-complete': 'روتين كامل لإزالة الشعر والعناية بالبشرة من بعده. الزيت يوم الإزالة — والكريم من بعد 24 ساعة.',
  'pack-oil-x2':      'علبتين من زيت إزالة الشعر لشهرين. أحسن قيمة للي كتستعمل الزيت بانتظام.',
  'pack-cream-x2':    'علبتين من الكريم للعناية المستمرة بالشعر تحت الجلد وجلد الوزة — بسعر أحسن.',
}

export default function PacksPage() {
  const { addItem } = useCart()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">

      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-14">
        <span className="tag">الباقات والعروض</span>
        <h1 className="section-heading mt-4">
          وفري أكثر مع{' '}
          <span className="text-veluna-plum">باقات Veluna</span>
        </h1>
        <p className="section-sub">اختاري الباقة اللي تناسبك وابدأي روتين العناية بسعر أحسن.</p>
      </div>

      {/* Packs grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packs.map((pack) => {
          const uniqueIds  = [...new Set(pack.productIds)]
          const packProducts = uniqueIds.map(id => getProductById(id)).filter(Boolean)
          const saving     = pack.originalPrice - pack.price

          return (
            <article
              key={pack.id}
              className={`relative bg-white rounded-2xl overflow-hidden flex flex-col
                          transition-all duration-300 hover:shadow-veluna-lg ${
                            pack.featured
                              ? 'border-2 border-veluna-plum shadow-veluna-md ring-2 ring-veluna-plum/20'
                              : 'border border-veluna-petal shadow-veluna-sm hover:border-veluna-petal'
                          }`}
            >
              {/* Top badge */}
              <div className={`py-2.5 text-center text-xs font-bold tracking-wider ${
                pack.featured
                  ? 'bg-veluna-plum text-white'
                  : 'bg-veluna-blush text-veluna-plum'
              }`}>
                {pack.badge}
              </div>

              {/* Product photos */}
              <div className="bg-gradient-to-br from-veluna-blush to-white px-6 pt-6 pb-4 flex items-end justify-center gap-4 min-h-[200px] relative">
                {packProducts.map((p, i) => {
                  const src = PHOTOS[p!.id]
                  const isSingle = packProducts.length === 1
                  return src ? (
                    <div
                      key={`${p!.id}-${i}`}
                      className="relative"
                      style={{
                        width:  isSingle ? 120 : 88,
                        height: isSingle ? 160 : 128,
                        filter: i > 0 ? 'drop-shadow(4px 6px 12px rgba(0,0,0,0.18))' : 'drop-shadow(0 6px 14px rgba(0,0,0,0.14))',
                        transform: packProducts.length === 2
                          ? i === 0 ? 'rotate(-5deg) translateY(6px)' : 'rotate(4deg)'
                          : undefined,
                      }}
                    >
                      <Image
                        src={src}
                        alt={p!.name}
                        fill
                        className="object-contain"
                        sizes={isSingle ? '120px' : '88px'}
                      />
                    </div>
                  ) : null
                })}
              </div>

              {/* Info */}
              <div className="p-5 flex flex-col gap-3 flex-1">
                <div>
                  <h2 className="text-xl font-extrabold text-veluna-dark">{pack.name}</h2>
                  <p className="text-sm text-veluna-muted mt-1 leading-relaxed">{descriptions[pack.id]}</p>
                </div>

                {/* What's inside */}
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-veluna-muted uppercase tracking-wide">محتوى الباقة</p>
                  {pack.productIds.map((id, i) => {
                    const p = getProductById(id)
                    return (
                      <div key={`${id}-${i}`} className="flex items-center gap-2 text-sm">
                        <span className="text-veluna-plum font-bold" aria-hidden="true">✓</span>
                        <span className="text-veluna-text">{p?.shortName || p?.name}</span>
                      </div>
                    )
                  })}
                </div>

                {/* Best for */}
                <div className="bg-veluna-blush rounded-xl p-3 text-xs text-veluna-muted">
                  <span className="font-bold text-veluna-text">مناسبة لـ: </span>
                  {pack.bestFor}
                </div>

                {/* Price block */}
                <div className="mt-auto pt-2">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="text-3xl font-extrabold text-veluna-plum tabular-nums">
                      {pack.price}
                    </span>
                    <span className="text-sm font-semibold text-veluna-plum">درهم</span>
                    <span className="text-veluna-mauve line-through text-sm tabular-nums">
                      {pack.originalPrice} درهم
                    </span>
                  </div>
                  <p className="text-[#25D366] text-xs font-bold mb-4">
                    وفري {saving} درهم
                  </p>

                  <button
                    onClick={() =>
                      addItem({
                        id: pack.id,
                        name: pack.name,
                        price: pack.price,
                        type: 'pack',
                        colorFrom: '#DCC7FF',
                        colorTo: '#7A3E68',
                      })
                    }
                    className={`w-full py-3.5 font-bold rounded-full text-sm transition-all duration-200
                                active:scale-[0.97] ${
                                  pack.featured
                                    ? 'bg-veluna-plum text-white hover:bg-[#653156] shadow-veluna-sm'
                                    : 'btn-primary'
                                }`}
                  >
                    أضيفي للسلة
                  </button>

                  <a
                    href={`https://wa.me/212600000000?text=${encodeURIComponent(`مرحباً، بغيت نطلب: ${pack.name}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center text-xs text-veluna-muted hover:text-veluna-plum mt-3
                               transition-colors underline underline-offset-2"
                  >
                    أو اطلبي عبر واتساب
                  </a>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {/* COD trust banner */}
      <div className="mt-12 bg-veluna-dark text-white rounded-2xl p-6
                      flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-bold text-lg">الدفع عند الاستلام متوفر ✓</p>
          <p className="text-white/60 text-sm mt-1">
            كل الباقات كتوصلك قبل ما تخلصي. ما كاين حتى مخاطرة.
          </p>
        </div>
        <div className="flex items-center gap-5 text-sm text-white/70">
          <span>✓ توصيل سريع</span>
          <span>✓ دعم واتساب</span>
          <span>✓ ضمان الجودة</span>
        </div>
      </div>

      {/* Individual product links */}
      <div className="mt-8 text-center">
        <p className="text-sm text-veluna-muted mb-3">أو اشتري منتجاً واحداً:</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/products/zit-manaa" className="btn-outline text-sm py-2.5 px-5">
            زيت إزالة الشعر — 149 درهم
          </Link>
          <Link href="/products/krim-jlid" className="btn-outline text-sm py-2.5 px-5">
            كريم الشعر تحت الجلد — 129 درهم
          </Link>
        </div>
      </div>

      <p className="text-center text-xs text-veluna-mauve mt-8">
        النتائج كتختلف من بشرة لبشرة. المنتجات مخصصة للعناية التجميلية وليست علاجاً طبياً.
      </p>
    </div>
  )
}
