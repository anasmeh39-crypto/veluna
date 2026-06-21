'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'

interface Card {
  id: string
  href: string
  img: string
  name: string
  tagline: string
  price: number
  originalPrice: number
  rating: number
  reviews: number
  type: 'product' | 'pack'
  topBadge?: string
  topBadgeStyle?: string
  priceBadge?: string
}

const CARDS: Card[] = [
  {
    id: 'routine-complete',
    href: '/packs',
    img: '/products/home-pack.jpg',
    name: 'روتين فيلونا الكامل',
    tagline: 'الزيت + الكريم — إزالة الشعر والعناية بالملمس من بعده',
    price: 249,
    originalPrice: 278,
    rating: 4.9,
    reviews: 312,
    type: 'pack',
    topBadge: 'الأكثر طلباً ✦',
    topBadgeStyle: 'bg-veluna-plum text-white',
  },
  {
    id: 'zit-manaa',
    href: '/products/zit-manaa',
    img: '/products/home-oil.jpg',
    name: 'زيت إزالة الشعر',
    tagline: 'إزالة أسهل وبشرة مرطبة — بدون موس',
    price: 219,
    originalPrice: 219,
    rating: 4.8,
    reviews: 214,
    type: 'product',
    topBadge: 'أفضل قيمة',
    topBadgeStyle: 'bg-veluna-blush text-veluna-plum',
  },
  {
    id: 'krim-jlid',
    href: '/products/krim-jlid',
    img: '/products/home-cream.jpg',
    name: 'كريم الشعر تحت الجلد',
    tagline: 'ملمس أنعم ومظهر أصفى بعد الحلاقة',
    price: 219,
    originalPrice: 219,
    rating: 4.9,
    reviews: 186,
    type: 'product',
    topBadge: 'خصم 19%',
    topBadgeStyle: 'bg-[#25D366] text-white',
  },
]

export default function ProductsGrid() {
  const { addItem } = useCart()

  return (
    <section className="bg-veluna-blush py-10 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-8 md:mb-12">
          <span className="tag">منتجاتنا</span>
          <h2 className="section-heading mt-4">
            اختاري ما{' '}
            <span className="text-veluna-plum">يناسبك</span>
          </h2>
          <p className="section-sub">
            منتجان مصنوعان خصيصاً لبشرة المرأة — كل واحد يحل مشكلة حقيقية.
          </p>
        </div>

        {/* Cards — 1 col mobile, 3 col md+ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {CARDS.map((c) => {
            const saving = c.originalPrice - c.price
            const isFeatured = c.id === 'routine-complete'
            return (
              <article
                key={c.id}
                className={`flex flex-col bg-white rounded-2xl overflow-hidden border transition-all duration-300
                            hover:shadow-veluna-md group ${
                              isFeatured
                                ? 'border-veluna-plum ring-2 ring-veluna-plum/20 shadow-veluna-sm'
                                : 'border-veluna-petal'
                            }`}
              >
                {/* Top badge */}
                {c.topBadge && (
                  <div className={`text-xs font-bold text-center py-1.5 tracking-wide ${c.topBadgeStyle}`}>
                    {c.topBadge}
                  </div>
                )}

                {/* Image — square crop, full-bleed */}
                <Link href={c.href} className="block relative aspect-square overflow-hidden">
                  <Image
                    src={c.img}
                    alt={c.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 320px"
                  />
                </Link>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1 gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="stars text-sm" aria-label={`${c.rating} نجوم من 5`}>
                      {'★'.repeat(Math.round(c.rating))}
                    </span>
                    <span className="text-xs text-veluna-muted">({c.reviews})</span>
                  </div>

                  <Link href={c.href}>
                    <h3 className="font-bold text-veluna-dark text-sm leading-snug hover:text-veluna-plum transition-colors">
                      {c.name}
                    </h3>
                  </Link>

                  <p className="text-xs text-veluna-muted leading-relaxed flex-1">
                    {c.tagline}
                  </p>

                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-extrabold text-veluna-plum">
                      {c.price} <span className="text-sm font-semibold">درهم</span>
                    </span>
                    {saving > 0 && <span className="text-sm text-veluna-muted line-through">{c.originalPrice} درهم</span>}
                    {saving > 0 && <span className="text-xs font-bold text-[#25D366] ms-auto">وفري {saving} درهم</span>}
                  </div>

                  <p className="text-[11px] text-veluna-muted">✓ الدفع عند الاستلام</p>

                  <button
                    onClick={() =>
                      addItem({
                        id: c.id,
                        name: c.name,
                        price: c.price,
                        type: c.type,
                        colorFrom: '#DCC7FF',
                        colorTo: '#7A3E68',
                      })
                    }
                    aria-label={`أضف ${c.name} للسلة`}
                    className={`mt-1 w-full py-3 text-sm font-bold rounded-full transition-all duration-200 active:scale-[0.97] ${
                      isFeatured
                        ? 'bg-veluna-plum text-white hover:bg-[#653156] shadow-veluna-sm'
                        : 'btn-primary'
                    }`}
                  >
                    أضيفي للسلة
                  </button>
                </div>
              </article>
            )
          })}
        </div>

        <p className="text-center text-xs text-veluna-mauve mt-8 max-w-lg mx-auto">
          * النتائج كتختلف من بشرة لبشرة. المنتجات مخصصة للعناية التجميلية وليست علاجاً طبياً.
        </p>
      </div>
    </section>
  )
}
