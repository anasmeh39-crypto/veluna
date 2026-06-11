'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import ProductImage from './ProductImage'
import type { Product } from '@/lib/products'

interface Props {
  product: Product
  featured?: boolean
}

function Stars({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="stars text-sm" aria-label={`${rating} نجوم من 5`}>
        {'★'.repeat(Math.round(rating))}
      </span>
      <span className="text-xs text-veluna-muted">({count})</span>
    </div>
  )
}

export default function ProductCard({ product, featured }: Props) {
  const { addItem } = useCart()
  const displayName = product.shortName || product.name

  function handleAdd() {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      type: 'product',
      colorFrom: product.colorFrom,
      colorTo: product.colorTo,
    })
  }

  return (
    <article className={`flex flex-col bg-white rounded-2xl overflow-hidden border transition-all duration-300
                         hover:shadow-veluna-md group ${
                           featured
                             ? 'border-veluna-lavender ring-2 ring-veluna-lavender/60 shadow-veluna-sm'
                             : 'border-veluna-petal shadow-none'
                         }`}>
      {/* Featured badge */}
      {featured && (
        <div className="bg-veluna-plum text-white text-xs font-bold text-center py-1.5 tracking-wider">
          الأكثر طلباً ✦
        </div>
      )}

      {/* Product image area */}
      <Link href={`/products/${product.slug}`} className="block relative bg-veluna-blush aspect-[4/5] overflow-hidden">
        {/* Discount badge */}
        {product.originalPrice && (
          <span className="absolute top-3 start-3 z-10 bg-veluna-plum text-white text-xs font-bold px-2.5 py-1 rounded-full">
            خصم {Math.round((1 - product.price / product.originalPrice) * 100)}%
          </span>
        )}
        {/* Image with hover zoom */}
        <div className="absolute inset-0 p-8 flex items-center justify-center
                        transition-transform duration-500 group-hover:scale-105">
          <ProductImage type={product.type} colorFrom={product.colorFrom} colorTo={product.colorTo} />
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-veluna-plum/0 group-hover:bg-veluna-plum/4 transition-colors duration-300" />
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <Stars rating={product.rating} count={product.reviewCount} />

        <Link href={`/products/${product.slug}`}>
          <h3 className="font-bold text-veluna-dark text-sm leading-snug hover:text-veluna-plum
                         transition-colors line-clamp-2 min-h-[2.5rem]">
            {displayName}
          </h3>
        </Link>

        <p className="text-xs text-veluna-muted leading-relaxed line-clamp-2 flex-1">
          {product.tagline}
        </p>

        {/* Price row */}
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-xl font-extrabold text-veluna-plum">
            {product.price} <span className="text-sm font-semibold">درهم</span>
          </span>
          {product.originalPrice && (
            <span className="text-sm text-veluna-muted line-through">{product.originalPrice} درهم</span>
          )}
        </div>

        {/* Micro trust line */}
        <p className="text-[11px] text-veluna-muted">✓ الدفع عند الاستلام</p>

        <button
          onClick={handleAdd}
          aria-label={`أضف ${displayName} للسلة`}
          className="mt-1 w-full btn-primary py-3 text-sm"
        >
          أضيفي للسلة
        </button>
      </div>
    </article>
  )
}
