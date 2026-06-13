'use client'

import { useEffect, useRef } from 'react'
import { useCart } from '@/context/CartContext'
import { products } from '@/lib/products'
import ProductImage from './ProductImage'
import Link from 'next/link'

const WASvg = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.99.583 3.842 1.588 5.392L2 22l4.741-1.555A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 11.999 2zm.001 18c-1.617 0-3.129-.47-4.404-1.28l-.316-.188-3.28 1.077 1.098-3.192-.206-.327A7.945 7.945 0 014 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8z" />
  </svg>
)

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total, itemCount, addItem } = useCart()
  const firstFocusRef = useRef<HTMLButtonElement>(null)

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Auto-focus close button when drawer opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstFocusRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Smart cross-sell: suggest the missing routine product
  const hasOil   = items.some(i => i.id === 'zit-manaa')
  const hasCream = items.some(i => i.id === 'krim-jlid')
  const upsell   = items.length > 0
    ? hasOil && !hasCream
      ? products.find(p => p.id === 'krim-jlid')!
      : !hasOil && hasCream
        ? products.find(p => p.id === 'zit-manaa')!
        : null
    : null

  const bothInCart = hasOil && hasCream

  const waOrderText = encodeURIComponent(
    `مرحباً، بغيت نطلب:\n${items.map(i => `${i.name} × ${i.quantity}`).join('\n')}\nالمجموع: ${total} درهم`
  )

  return (
    <>
      {/* Backdrop — always in DOM, opacity controlled */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer panel — always in DOM, slides in/out */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="سلة التسوق"
        className={`fixed inset-y-0 end-0 w-full max-w-sm bg-veluna-cream z-50
                    flex flex-col shadow-veluna-lg
                    transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-veluna-petal flex-shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-veluna-dark">سلتك</h2>
            {itemCount > 0 && (
              <span className="bg-veluna-plum text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </div>
          <button
            ref={firstFocusRef}
            onClick={closeCart}
            aria-label="إغلاق السلة"
            className="p-2 rounded-xl hover:bg-veluna-blush text-veluna-muted hover:text-veluna-dark
                       transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-veluna-plum"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Items list ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16 gap-4">
              <div className="w-16 h-16 rounded-full bg-veluna-blush flex items-center justify-center">
                <svg className="w-8 h-8 text-veluna-mauve" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <p className="text-veluna-text font-bold text-base">السلة فارغة</p>
                <p className="text-veluna-muted text-sm mt-1">ابدأي التسوق واختاري منتجاتك</p>
              </div>
              <button onClick={closeCart} className="btn-primary text-sm px-5 py-2.5">
                تسوقي الآن
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3 bg-white rounded-2xl p-3 border border-veluna-petal animate-fade-in">
                {/* Product image */}
                <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-veluna-blush p-1">
                  {item.colorFrom ? (
                    <ProductImage
                      type={item.id.startsWith('zit') ? 'oil' : 'cream'}
                      colorFrom={item.colorFrom}
                      colorTo={item.colorTo || item.colorFrom}
                    />
                  ) : (
                    <div className="w-full h-full bg-veluna-petal rounded-lg" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-veluna-dark leading-snug line-clamp-2">
                    {item.name}
                  </p>
                  <p className="text-veluna-plum font-extrabold mt-1">
                    {item.price} <span className="text-xs font-semibold">درهم</span>
                  </p>
                  {/* Qty controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      aria-label="إنقاص الكمية"
                      className="w-7 h-7 rounded-lg bg-veluna-blush text-veluna-plum font-bold flex items-center
                                 justify-center hover:bg-veluna-petal transition-colors text-base leading-none"
                    >
                      −
                    </button>
                    <span className="text-sm font-bold text-veluna-dark w-5 text-center tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label="زيادة الكمية"
                      className="w-7 h-7 rounded-lg bg-veluna-blush text-veluna-plum font-bold flex items-center
                                 justify-center hover:bg-veluna-petal transition-colors text-base leading-none"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.id)}
                  aria-label={`حذف ${item.name}`}
                  className="self-start p-1.5 text-veluna-mauve hover:text-veluna-rose hover:bg-veluna-blush
                             rounded-lg transition-colors flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* ── Cross-sell upsell ── */}
        {upsell && (
          <div className="px-5 py-3 bg-veluna-blush border-t border-veluna-petal flex-shrink-0 animate-fade-in">
            <p className="text-xs font-bold text-veluna-plum mb-2.5">
              🌿 اكملي روتينك
            </p>
            <div className="flex items-center gap-3 bg-white rounded-2xl p-3 border border-veluna-petal">
              <div className="w-12 h-14 flex-shrink-0">
                <ProductImage
                  type={upsell.type}
                  colorFrom={upsell.colorFrom}
                  colorTo={upsell.colorTo}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-veluna-dark leading-snug">
                  {upsell.shortName || upsell.name}
                </p>
                <p className="text-veluna-plum font-extrabold text-sm mt-0.5">
                  {upsell.price} درهم
                </p>
              </div>
              <button
                onClick={() =>
                  addItem({
                    id: upsell.id,
                    name: upsell.name,
                    price: upsell.price,
                    type: 'product',
                    colorFrom: upsell.colorFrom,
                    colorTo: upsell.colorTo,
                  })
                }
                className="flex-shrink-0 bg-veluna-plum text-white text-xs font-bold
                           px-3.5 py-2 rounded-full hover:bg-[#653156] transition-colors"
              >
                أضيفي
              </button>
            </div>
          </div>
        )}

        {/* ── Both in cart: celebrate ── */}
        {bothInCart && !items.some(i => i.id === 'routine-complete') && (
          <div className="px-5 py-2.5 bg-veluna-blush border-t border-veluna-petal flex-shrink-0">
            <p className="text-xs text-center text-veluna-plum font-semibold">
              ✦ روتين Veluna الكامل في سلتك!
            </p>
          </div>
        )}

        {/* ── Footer ── */}
        {items.length > 0 && (
          <div className="border-t border-veluna-petal px-5 py-4 space-y-3 flex-shrink-0 bg-white">
            {/* COD trust badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-veluna-muted
                            bg-veluna-blush rounded-xl py-2 px-3">
              <svg className="w-4 h-4 text-veluna-plum flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              الدفع عند الاستلام في جميع أنحاء المغرب
            </div>

            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-veluna-muted text-sm">المجموع</span>
              <span className="text-2xl font-extrabold text-veluna-plum tabular-nums">
                {total} <span className="text-sm font-semibold">درهم</span>
              </span>
            </div>

            {/* Primary CTA */}
            <Link
              href="/checkout"
              onClick={closeCart}
              className="w-full btn-primary py-4 text-base"
            >
              إتمام الطلب →
            </Link>

            {/* WhatsApp order */}
            <a
              href={`https://wa.me/212600000000?text=${waOrderText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full btn-whatsapp py-3 text-sm flex items-center justify-center gap-2"
            >
              <WASvg />
              اطلبي عبر واتساب
            </a>

            {/* View products link */}
            <Link
              href="/packs"
              onClick={closeCart}
              className="block text-center text-xs text-veluna-muted hover:text-veluna-plum
                         transition-colors underline underline-offset-2"
            >
              شوفي باقاتنا وعروضنا
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
