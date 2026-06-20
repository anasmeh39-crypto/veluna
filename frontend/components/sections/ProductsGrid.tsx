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
  featured?: boolean
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
    featured: true,
  },
  {
    id: 'zit-manaa',
    href: '/products/zit-manaa',
    img: '/products/home-oil.jpg',
    name: 'زيت إزالة الشعر',
    tagline: 'إزالة أسهل، بشرة مرطبة وأنعم',
    price: 149,
    originalPrice: 179,
    rating: 4.8,
    reviews: 214,
    type: 'product',
  },
]

export default function ProductsGrid() {
  const { addItem } = useCart()

  return (
    <section className="bg-veluna-blush py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="tag">منتجاتنا</span>
          <h2 className="section-heading mt-4">
            اختاري ما{' '}
            <span className="text-veluna-plum">يناسبك</span>
          </h2>
          <p className="section-sub">
            الروتين الكامل بالزيت والكريم، أو الزيت بوحدو — كل واحد يحل مشكلة حقيقية.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {CARDS.map((c) => {
            const discount = Math.round((1 - c.price / c.originalPrice) * 100)
            return (
              <article
                key={c.id}
                className={`flex flex-col bg-white rounded-2xl overflow-hidden border transition-all duration-300
                            hover:shadow-veluna-md group ${
                              c.featured
                                ? 'border-veluna-lavender ring-2 ring-veluna-lavender/60 shadow-veluna-sm'
                                : 'border-veluna-petal shadow-none'
                            }`}
              >
                {c.featured && (
                  <div className="bg-veluna-plum text-white text-xs font-bold text-center py-1.5 tracking-wider">
                    الأكثر طلباً ✦
                  </div>
                )}

                {/* Image */}
                <Link href={c.href} className="block relative bg-veluna-blush aspect-[4/5] overflow-hidden">
                  {discount > 0 && (
                    <span className="absolute top-3 start-3 z-10 bg-veluna-plum text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      خصم {discount}%
                    </span>
                  )}
                  <Image
                    src={c.img}
                    alt={c.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 320px"
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
                    <h3 className="font-bold text-veluna-dark text-sm leading-snug hover:text-veluna-plum
                                   transition-colors line-clamp-2 min-h-[2.5rem]">
                      {c.name}
                    </h3>
                  </Link>

                  <p className="text-xs text-veluna-muted leading-relaxed line-clamp-2 flex-1">
                    {c.tagline}
                  </p>

                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-extrabold text-veluna-plum">
                      {c.price} <span className="text-sm font-semibold">درهم</span>
                    </span>
                    <span className="text-sm text-veluna-muted line-through">{c.originalPrice} درهم</span>
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
                    className="mt-1 w-full btn-primary py-3 text-sm"
                  >
                    أضيفي للسلة
                  </button>
                </div>
              </article>
            )
          })}
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-veluna-mauve mt-8 max-w-lg mx-auto">
          * النتائج كتختلف من بشرة لبشرة. المنتجات مخصصة للعناية التجميلية وليست علاجاً طبياً.
        </p>
      </div>
    </section>
  )
}
