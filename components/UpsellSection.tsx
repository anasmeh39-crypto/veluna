'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import ProductImage from './ProductImage'
import type { Product } from '@/lib/products'
import { packs } from '@/lib/products'

interface Props {
  complement: Product
  currentProductName: string
}

export default function UpsellSection({ complement, currentProductName }: Props) {
  const { addItem } = useCart()
  const bundle = packs[0]

  const upsells = [
    {
      id: complement.id,
      type: complement.type,
      name: complement.name,
      desc: 'المنتج المكمل للروتين الكامل',
      price: complement.price,
      colorFrom: complement.colorFrom,
      colorTo: complement.colorTo,
      href: `/products/${complement.slug}`,
      badge: 'مكمل مثالي',
      badgeColor: 'bg-veluna-blush text-veluna-plum',
    },
    {
      id: bundle.id,
      type: null,
      name: bundle.name,
      desc: 'الاثنين مع بعضهم بسعر أحسن',
      price: bundle.price,
      originalPrice: bundle.originalPrice,
      colorFrom: '#DCC7FF',
      colorTo: '#7A3E68',
      href: '/packs',
      badge: 'وفري أكثر',
      badgeColor: 'bg-veluna-lavender/40 text-veluna-plum',
    },
    {
      id: `${complement.id}-x2`,
      type: complement.type,
      name: `${complement.name} × 2`,
      desc: 'علبتين – وفري على المدى الطويل',
      price: Math.round(complement.price * 1.85),
      originalPrice: complement.price * 2,
      colorFrom: complement.colorFrom,
      colorTo: complement.colorTo,
      href: '/packs',
      badge: 'باقة',
      badgeColor: 'bg-purple-100 text-purple-700',
    },
  ]

  return (
    <section className="bg-veluna-blush py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold text-veluna-dark mb-6">
          قد يعجبك أيضاً
        </h2>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 md:grid md:grid-cols-3 md:overflow-visible">
          {upsells.map((u) => (
            <div
              key={u.id}
              className="flex-shrink-0 w-56 md:w-auto bg-white rounded-2xl border border-veluna-petal p-4 flex flex-col gap-3 hover:shadow-md transition-shadow"
            >
              {/* Badge */}
              <span className={`self-start text-xs font-bold px-2.5 py-1 rounded-full ${u.badgeColor}`}>
                {u.badge}
              </span>

              {/* Image */}
              <div className="h-28 flex items-center justify-center">
                {u.type ? (
                  <ProductImage type={u.type as 'oil' | 'cream'} colorFrom={u.colorFrom} colorTo={u.colorTo} />
                ) : (
                  <div className="flex gap-2 h-full items-center">
                    <div className="h-full w-16">
                      <ProductImage type="oil" colorFrom="#DCC7FF" colorTo="#8B5E9E" />
                    </div>
                    <div className="h-20 w-16">
                      <ProductImage type="cream" colorFrom="#F8BBD0" colorTo="#C4738A" />
                    </div>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <p className="font-bold text-veluna-dark text-sm leading-tight">{u.name}</p>
                <p className="text-xs text-veluna-muted mt-0.5">{u.desc}</p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1.5">
                <span className="font-extrabold text-veluna-plum">{u.price}</span>
                <span className="text-xs text-veluna-muted">درهم</span>
                {'originalPrice' in u && u.originalPrice && (
                  <span className="text-xs text-veluna-mauve line-through">{u.originalPrice}</span>
                )}
              </div>

              {/* CTA */}
              <button
                onClick={() => {
                  if (u.type) {
                    addItem({
                      id: u.id,
                      name: u.name,
                      price: u.price,
                      type: 'product',
                      colorFrom: u.colorFrom,
                      colorTo: u.colorTo,
                    })
                  }
                }}
                className="w-full btn-primary py-2.5 text-xs"
              >
                {u.type ? 'أضيفي للسلة' : 'اشتري الباقة'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
