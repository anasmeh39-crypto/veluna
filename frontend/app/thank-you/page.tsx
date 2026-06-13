'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getProductById } from '@/lib/products'

interface OrderItem {
  id: string
  name_ar: string
  price_mad: number
  quantity: number
}

interface Order {
  id: string
  customer_name: string
  phone: string
  city: string
  items: OrderItem[]
  subtotal: number
  delivery_fee: number
  total: number
  status: string
}

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '212600000000'

function buildWhatsAppMessage(order: Order): string {
  const itemLines = order.items
    .map((i) => `• ${i.name_ar} × ${i.quantity} = ${i.price_mad * i.quantity} درهم`)
    .join('\n')

  return `سلام، بغيت نأكد الطلب ديالي من Veluna

رقم الطلب: ${order.id}
الاسم: ${order.customer_name}

المنتجات:
${itemLines}

التوصيل: ${order.delivery_fee === 0 ? 'مجاني' : `${order.delivery_fee} درهم`}
المجموع: ${order.total} درهم

المدينة: ${order.city}
طريقة الدفع: الدفع عند الاستلام ✓`
}

function ThankYouContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [upsellDismissed, setUpsellDismissed] = useState(false)

  useEffect(() => {
    if (!orderId) { setLoading(false); return }

    // Poll the public order lookup — we expose a minimal endpoint for this
    fetch(`/api/orders/${orderId}/public`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.order) setOrder(data.order)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [orderId])

  const waMessage = order ? buildWhatsAppMessage(order) : ''
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`

  // Determine post-purchase upsell: if customer ordered only oil → show cream, and vice versa
  const orderedIds = order?.items.map((i) => i.id) ?? []
  const hasOil   = orderedIds.some((id) => id === 'zit-manaa')
  const hasCream = orderedIds.some((id) => id === 'krim-jlid')
  const upsellId = (hasOil && !hasCream) ? 'krim-jlid' : (hasCream && !hasOil) ? 'zit-manaa' : null
  const upsellProduct = upsellId ? getProductById(upsellId) : null
  const showUpsell = !!upsellProduct && !upsellDismissed && !!order

  const upsellWaText = upsellProduct && orderId
    ? `سلام، عندي طلب رقم ${orderId} وبغيت نزيد ${upsellProduct.name} للطلب ديالي`
    : ''
  const upsellWaLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(upsellWaText)}`

  return (
    <div className="min-h-screen bg-gradient-to-b from-veluna-blush to-veluna-cream flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full space-y-6">

        {/* Logo */}
        <div className="flex justify-center mb-2">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Veluna"
              width={130}
              height={40}
              className="h-9 w-auto transition-opacity hover:opacity-75"
              priority
              sizes="130px"
            />
          </Link>
        </div>

        {/* Success header */}
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-[#25D366]/15 flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-[#25D366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-veluna-dark">شكراً لك!</h1>
          <p className="text-veluna-muted mt-2 leading-relaxed">
            توصلنا بطلبك.
            غادي نتاصلو بك قريباً باش نأكدو تفاصيل التوصيل.
          </p>
          {orderId && (
            <div className="mt-3 inline-block bg-veluna-blush rounded-xl px-4 py-2">
              <span className="text-xs text-veluna-muted">رقم الطلب: </span>
              <span className="font-bold text-veluna-plum">{orderId}</span>
            </div>
          )}
        </div>

        {/* Order summary card */}
        {loading && (
          <div className="bg-white rounded-2xl border border-veluna-petal p-6 animate-pulse">
            <div className="h-4 bg-veluna-blush rounded w-1/2 mb-4" />
            <div className="h-3 bg-veluna-blush rounded w-full mb-2" />
            <div className="h-3 bg-veluna-blush rounded w-3/4" />
          </div>
        )}

        {!loading && order && (
          <div className="bg-white rounded-2xl border border-veluna-petal p-6">
            <h2 className="font-bold text-veluna-dark mb-4 text-sm">تفاصيل طلبك</h2>
            <div className="space-y-2 mb-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-veluna-text">{item.name_ar} × {item.quantity}</span>
                  <span className="font-semibold text-veluna-plum">{item.price_mad * item.quantity} درهم</span>
                </div>
              ))}
            </div>
            <div className="border-t border-veluna-petal pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-veluna-muted">التوصيل</span>
                <span>{order.delivery_fee === 0 ? 'مجاني' : `${order.delivery_fee} درهم`}</span>
              </div>
              <div className="flex justify-between font-bold text-base">
                <span className="text-veluna-dark">المجموع</span>
                <span className="text-veluna-plum">{order.total} درهم</span>
              </div>
            </div>
            <p className="text-xs text-veluna-muted mt-3 text-center">
              المدينة: {order.city} · الدفع عند الاستلام
            </p>
          </div>
        )}

        {/* WhatsApp CTA */}
        {order && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp w-full py-4 text-base"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.99.583 3.842 1.588 5.392L2 22l4.741-1.555A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 11.999 2zm.001 18c-1.617 0-3.129-.47-4.404-1.28l-.316-.188-3.28 1.077 1.098-3.192-.206-.327A7.945 7.945 0 014 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8z" />
            </svg>
            أكدي طلبك عبر واتساب
          </a>
        )}

        {!order && !loading && (
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp w-full py-4 text-base"
          >
            تواصلي معنا فالواتساب
          </a>
        )}

        {/* ── Post-purchase upsell ── */}
        {showUpsell && upsellProduct && (
          <div className="bg-white rounded-2xl border-2 border-veluna-lavender p-5 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="tag text-xs mb-2 inline-block">كملي الروتين</span>
                <h3 className="font-bold text-veluna-dark text-sm leading-snug">
                  {upsellProduct.name === 'كريم الشعر تحت الجلد و جلد الوزة'
                    ? 'كملي الروتين مع كريم جلد الوزة'
                    : `كملي الروتين مع ${upsellProduct.shortName ?? upsellProduct.name}`}
                </h3>
              </div>
              <button
                onClick={() => setUpsellDismissed(true)}
                className="text-veluna-muted hover:text-veluna-text transition-colors flex-shrink-0 text-lg leading-none mt-0.5"
                aria-label="إغلاق"
              >
                ×
              </button>
            </div>

            <p className="text-xs text-veluna-muted leading-relaxed">
              {upsellProduct.type === 'cream'
                ? 'من بعد إزالة الشعر، البشرة كتحتاج عناية باش ما يبقاش الشعر تحت الجلد والحبيبات.'
                : 'الزيت كيساعد تزيلي الشعر بطريقة أسهل وألطف وبدون تهيج.'}
            </p>

            <div className="flex items-center justify-between">
              <span className="font-extrabold text-veluna-plum text-lg">
                {upsellProduct.price} <span className="text-sm font-normal">درهم</span>
              </span>
              {upsellProduct.originalPrice && (
                <span className="text-xs text-veluna-muted line-through">
                  {upsellProduct.originalPrice} درهم
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <a
                href={upsellWaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp w-full py-3 text-sm"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.99.583 3.842 1.588 5.392L2 22l4.741-1.555A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 11.999 2zm.001 18c-1.617 0-3.129-.47-4.404-1.28l-.316-.188-3.28 1.077 1.098-3.192-.206-.327A7.945 7.945 0 014 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8z" />
                </svg>
                زيدي {upsellProduct.shortName ?? upsellProduct.name} للطلب
              </a>
              <button
                onClick={() => setUpsellDismissed(true)}
                className="text-xs text-veluna-muted hover:text-veluna-text transition-colors py-1"
              >
                لا شكراً، سأكمل بالطلب الحالي
              </button>
            </div>
          </div>
        )}

        {/* Next steps info */}
        <div className="bg-veluna-blush rounded-2xl p-5 space-y-3">
          <h3 className="font-bold text-veluna-dark text-sm">الخطوات القادمة</h3>
          {[
            { n: '1', text: 'غادي نتصلو بك قريباً باش نأكدو الطلب' },
            { n: '2', text: 'يتبعث ليك تتبع التوصيل' },
            { n: '3', text: 'تستقبلي منتجاتك وبعداه تخلصي' },
          ].map((s) => (
            <div key={s.n} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-veluna-plum text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {s.n}
              </div>
              <p className="text-sm text-veluna-text">{s.text}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-veluna-plum hover:underline">
            ارجعي للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-veluna-muted">جاري التحميل...</div>
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  )
}
