'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import { getProductById } from '@/lib/products'
import type { Product } from '@/lib/products'

type OfferKey = 'single' | 'double' | 'triple'

// ── Pricing discounts (درهم off total) — edit here to change promos ──
const DOUBLE_SAVINGS = 20
const TRIPLE_SAVINGS = 50

const OIL_IMGS: Record<OfferKey, string> = {
  single: '/products/oil-studio.jpg',
  double: '/products/oil-x2.jpg',
  triple: '/products/oil-x3.jpg',
}
const CREAM_IMG = '/products/cream.png'

const CREAM_ID = 'krim-jlid'

interface Props {
  product: Product
  onSelectedChange?: (price: number) => void
}

export default function OfferSelector({ product, onSelectedChange }: Props) {
  const router = useRouter()
  const { setCart, items: cartItems, openCart } = useCart()
  const [selected, setSelected] = useState<OfferKey>('triple')
  const [upsellChecked, setUpsellChecked] = useState(false)

  const cream = product.type === 'oil' ? getProductById(CREAM_ID) : undefined
  const singlePrice = product.price
  const doublePrice = singlePrice * 2 - DOUBLE_SAVINGS
  const triplePrice = singlePrice * 3 - TRIPLE_SAVINGS

  function priceFor(key: OfferKey) {
    return key === 'single' ? singlePrice : key === 'double' ? doublePrice : triplePrice
  }

  function handleSelect(key: OfferKey) {
    setSelected(key)
    onSelectedChange?.(priceFor(key))
  }

  function buildCartItems(includeCream: boolean) {
    const qty = selected === 'single' ? 1 : selected === 'double' ? 2 : 3
    const total = priceFor(selected)
    const perUnit = Math.round(total / qty)
    const result = [{
      id:        product.id,
      name:      qty === 1 ? product.name : `${product.name} × ${qty}`,
      price:     perUnit,
      quantity:  qty,
      type:      'product' as const,
      colorFrom: product.colorFrom,
      colorTo:   product.colorTo,
    }]
    if (includeCream && cream) {
      result.push({
        id:        cream.id,
        name:      cream.name,
        price:     cream.price,
        quantity:  1,
        type:      'product' as const,
        colorFrom: cream.colorFrom,
        colorTo:   cream.colorTo,
      })
    }
    return result
  }

  function handleConfirm() {
    setCart(buildCartItems(upsellChecked))
    // Route through the upsell popup. If the complement (cream) is already in
    // the cart, /upsell auto-forwards to /checkout — so it only shows when the
    // customer hasn't added the cream yet.
    router.push('/upsell')
  }

  function handleAddToCart() {
    const newItems = buildCartItems(upsellChecked)
    const kept = cartItems.filter(i => i.id !== product.id && i.id !== CREAM_ID)
    setCart([...kept, ...newItems])
    openCart()
  }

  const cardCls = (active: boolean) =>
    `w-full text-start rounded-2xl border-2 overflow-hidden transition-all duration-200 ${
      active ? 'border-veluna-plum shadow-veluna-sm' : 'border-veluna-petal hover:border-veluna-mauve'
    }`

  const infoCls = (active: boolean) =>
    `flex-1 px-4 py-3.5 flex flex-col justify-center gap-1 ${active ? 'bg-veluna-blush/30' : 'bg-white'}`

  function imgFor(key: OfferKey) {
    return product.type === 'oil' ? OIL_IMGS[key] : CREAM_IMG
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="font-bold text-veluna-dark text-sm">اختاري العرض المناسب لك</p>

      {/* ── واحد فقط ── */}
      <button type="button" onClick={() => handleSelect('single')} className={cardCls(selected === 'single')}>
        <div className="flex items-stretch">
          <OfferImage src={imgFor('single')} alt={product.name} />
          <div className={infoCls(selected === 'single')}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Radio active={selected === 'single'} />
                <span className="font-bold text-veluna-dark text-sm">واحد فقط</span>
              </div>
              <span className="font-extrabold text-veluna-plum tabular-nums text-sm flex-shrink-0">
                {singlePrice} <span className="text-xs font-normal">درهم</span>
              </span>
            </div>
            <p className="text-xs text-veluna-muted leading-relaxed ps-6">
              مناسب إذا بغيتي تجربي لأول مرة
            </p>
          </div>
        </div>
      </button>

      {/* ── جوج قنينات ── */}
      <div className="relative">
        <span className="absolute -top-2.5 start-4 z-10 bg-veluna-plum text-white text-[10px] font-bold px-3 py-0.5 rounded-full">
          الأكثر طلباً
        </span>
        <button type="button" onClick={() => handleSelect('double')} className={cardCls(selected === 'double')}>
          <div className="flex items-stretch">
            <OfferImage src={imgFor('double')} alt={`${product.name} × 2`} />
            <div className={infoCls(selected === 'double')}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Radio active={selected === 'double'} />
                  <span className="font-bold text-veluna-dark text-sm">جوج قنينات</span>
                </div>
                <div className="text-end flex-shrink-0">
                  <p className="font-extrabold text-veluna-plum tabular-nums text-sm leading-tight">
                    {doublePrice} <span className="text-xs font-normal">درهم</span>
                  </p>
                  <p className="text-[10px] text-veluna-muted line-through">{singlePrice * 2} درهم</p>
                </div>
              </div>
              <p className="text-xs font-semibold text-[#25D366] ps-6">
                وفري {DOUBLE_SAVINGS} درهم
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* ── ثلاث قنينات ── */}
      <div className="relative">
        <span className="absolute -top-2.5 start-4 z-10 bg-gradient-to-r from-[#7A3E68] to-veluna-plum text-white text-[10px] font-bold px-3 py-0.5 rounded-full shadow-sm">
          أفضل توفير
        </span>
        <button type="button" onClick={() => handleSelect('triple')} className={cardCls(selected === 'triple')}>
          <div className="flex items-stretch">
            <OfferImage src={imgFor('triple')} alt={`${product.name} × 3`} />
            <div className={infoCls(selected === 'triple')}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Radio active={selected === 'triple'} />
                  <span className="font-bold text-veluna-dark text-sm">ثلاث قنينات</span>
                </div>
                <div className="text-end flex-shrink-0">
                  <p className="font-extrabold text-veluna-plum tabular-nums text-sm leading-tight">
                    {triplePrice} <span className="text-xs font-normal">درهم</span>
                  </p>
                  <p className="text-[10px] text-veluna-muted line-through">{singlePrice * 3} درهم</p>
                </div>
              </div>
              <p className="text-xs font-semibold text-[#25D366] ps-6">
                وفري {TRIPLE_SAVINGS} درهم — أحسن سعر
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* ── Cream upsell (oil page only) ── */}
      {product.type === 'oil' && cream && (
        <label className="flex items-start gap-3 mt-1 rounded-2xl border border-veluna-petal bg-veluna-blush/20 p-4 cursor-pointer">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-veluna-dark text-sm mb-1">كملي الروتين مع كريم جلد الوزة</p>
            <div className="flex items-start gap-3">
              <div className="relative w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-white">
                <Image
                  src="/products/cream.png"
                  alt={cream.name}
                  fill
                  className="object-contain p-1"
                  sizes="56px"
                  loading="lazy"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-veluna-dark text-xs leading-snug">{cream.name}</p>
                <p className="text-[11px] text-veluna-muted leading-relaxed mt-0.5">
                  من بعد إزالة الشعر، البشرة كتحتاج عناية باش يتحسن مظهر الحبيبات والشعر تحت الجلد.
                </p>
                <p className="font-bold text-veluna-plum text-sm mt-1">
                  {cream.price} <span className="text-xs font-normal">درهم</span>
                </p>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 flex flex-col items-center gap-1 pt-1">
            <input
              type="checkbox"
              checked={upsellChecked}
              onChange={(e) => setUpsellChecked(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
              upsellChecked ? 'bg-veluna-plum border-veluna-plum' : 'bg-white border-veluna-petal'
            }`}>
              {upsellChecked && (
                <svg className="w-3 h-3 text-white" viewBox="0 0 12 10" fill="none">
                  <path d="M1 5l3.5 3.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span className="text-[10px] font-semibold text-veluna-dark text-center leading-tight max-w-[52px]">زيدي للطلب</span>
          </div>
        </label>
      )}

      {/* ── CTAs ── */}
      <div className="flex flex-col gap-2 mt-1">
        <button type="button" onClick={handleConfirm} className="w-full btn-primary py-4 text-base">
          تأكيد الطلب ـ الدفع عند الإستلام
        </button>
        <button
          type="button"
          onClick={handleAddToCart}
          className="w-full py-3.5 text-sm font-bold text-veluna-plum border-2 border-veluna-plum rounded-full hover:bg-veluna-blush active:scale-95 transition-all duration-150"
        >
          أضيفي إلى السلة
        </button>
      </div>

      {/* ── Trust strip ── */}
      <div className="grid grid-cols-3 gap-2">
        {['الدفع عند الاستلام', 'توصيل داخل المغرب', 'غادي نتاصلو بك للتأكيد'].map((t) => (
          <div key={t} className="flex flex-col items-center gap-0.5 bg-veluna-blush rounded-xl px-2 py-2.5 text-center">
            <span className="text-veluna-plum text-xs font-bold">✓</span>
            <span className="text-[10px] font-medium text-veluna-text leading-tight">{t}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function OfferImage({ src, alt, badge }: { src: string; alt: string; badge?: string }) {
  return (
    <div className="relative flex-shrink-0 w-[124px] bg-gradient-to-br from-veluna-blush to-[#F1E5EE] overflow-hidden">
      {badge && (
        <span className="absolute top-2 end-2 z-10 bg-veluna-plum text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full shadow-sm leading-none">
          {badge}
        </span>
      )}
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain p-1.5"
        sizes="124px"
        style={{ filter: 'drop-shadow(0 5px 9px rgba(122,62,104,0.20))' }}
      />
    </div>
  )
}

function Radio({ active }: { active: boolean }) {
  return (
    <div className={`flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors duration-150 ${
      active ? 'border-veluna-plum bg-veluna-plum' : 'border-veluna-petal bg-white'
    }`}>
      {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
    </div>
  )
}