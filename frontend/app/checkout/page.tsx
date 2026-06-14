'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { MOROCCAN_CITIES, FREE_DELIVERY_THRESHOLD } from '@/lib/delivery'

const DELIVERY_FEES: Record<string, number> = {
  'الدار البيضاء': 20, 'سلا': 20, 'تمارة': 20,
  'الرباط': 25, 'مراكش': 25, 'فاس': 25, 'طنجة': 25,
  'أكادير': 25, 'مكناس': 25, 'القنيطرة': 25,
  'المحمدية': 25, 'وجدة': 30, 'تطوان': 30,
  'الجديدة': 30, 'آسفي': 30, 'بني ملال': 30,
  'خريبكة': 30, 'الناظور': 30, 'العرائش': 30,
  'القصر الكبير': 30, 'سطات': 30, 'برشيد': 30,
  'بركان': 35, 'تزنيت': 35, 'طاطا': 35, 'إفران': 35,
  'ورزازات': 40, 'الراشيدية': 40, 'العيون': 45, 'الداخلة': 50, 'السمارة': 50,
}

function clientDeliveryFee(city: string, subtotal: number): number {
  if (subtotal >= FREE_DELIVERY_THRESHOLD) return 0
  return DELIVERY_FEES[city.trim()] ?? 35
}

interface FormState {
  customer_name: string
  phone: string
  city: string
  address: string
  notes: string
}

interface FieldErrors {
  customer_name?: string
  phone?: string
  city?: string
  address?: string
  items?: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart } = useCart()

  const [form, setForm] = useState<FormState>({
    customer_name: '',
    phone: '',
    city: '',
    address: '',
    notes: '',
  })

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [cityOpen, setCityOpen] = useState(false)
  const cityRef = useRef<HTMLDivElement>(null)

  // Close city dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setCityOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Capture UTM params from URL on mount
  const utmRef = useRef<Record<string, string>>({})
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    utmRef.current = {
      utm_source: params.get('utm_source') ?? '',
      utm_medium: params.get('utm_medium') ?? '',
      utm_campaign: params.get('utm_campaign') ?? '',
      utm_content: params.get('utm_content') ?? '',
      fbclid: params.get('fbclid') ?? '',
    }
  }, [])

  const subtotal = total
  const delivery = form.city ? clientDeliveryFee(form.city, subtotal) : 35
  const orderTotal = subtotal + delivery

  const field = (key: keyof FormState) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }))
      setFieldErrors((err) => ({ ...err, [key]: undefined }))
    },
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError(null)

    // Client-side quick validation
    const errors: FieldErrors = {}
    if (!form.customer_name.trim()) errors.customer_name = 'دخلي الاسم الكامل'
    if (!form.phone.trim()) errors.phone = 'دخلي رقم الهاتف'
    if (!form.city) errors.city = 'اختاري المدينة'
    if (!form.address.trim()) errors.address = 'دخلي العنوان'
    if (items.length === 0) errors.items = 'السلة فارغة'

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setLoading(true)

    // 30-second timeout — prevents silent hangs from showing a socket error
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30_000)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          customer_name: form.customer_name.trim(),
          phone: form.phone.trim(),
          city: form.city,
          address: form.address.trim(),
          notes: form.notes.trim() || undefined,
          items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
          ...utmRef.current,
          source: 'website',
        }),
      })

      clearTimeout(timeoutId)

      // Always parse JSON — every code path in the API returns JSON
      let data: Record<string, unknown> = {}
      try {
        data = await res.json()
      } catch {
        throw new Error('invalid-json')
      }

      if (!res.ok) {
        const msgs = data.errors as string[] | undefined
        setServerError(
          msgs && msgs.length > 0
            ? msgs.join(' · ')
            : (data.error as string | undefined) ?? 'وقع خطأ، عاودي المحاولة'
        )
        return
      }

      clearCart()
      router.push(`/thank-you?order=${(data.order as { id: string }).id}`)
    } catch (err: unknown) {
      clearTimeout(timeoutId)
      const isAbort = err instanceof Error && err.name === 'AbortError'
      if (isAbort) {
        setServerError('الطلب استغرق وقتاً طويلاً. تحققي من الاتصال وعاودي المحاولة.')
      } else {
        setServerError('وقع خطأ في الاتصال. عاودي المحاولة أو تواصلي معنا فالواتساب.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-veluna-blush flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-veluna-mauve" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-veluna-dark mb-2">السلة فارغة</h1>
          <p className="text-veluna-muted text-sm mb-6">ارجعي للصفحة الرئيسية واختاري منتجاتك</p>
          <a href="/" className="btn-primary">تسوقي الآن</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-veluna-cream">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-5">
            <Image
              src="/logo.png"
              alt="فيلونا"
              width={130}
              height={40}
              className="h-9 w-auto mx-auto transition-opacity hover:opacity-75"
              priority
              sizes="130px"
            />
          </Link>
          <span className="tag">إتمام الطلب</span>
          <h1 className="section-heading mt-3">تفاصيل التوصيل</h1>
          <p className="text-veluna-muted text-sm mt-2">الدفع عند الاستلام — ما كاين حتى مخاطرة</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

          {/* ── Checkout form ── */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} noValidate className="bg-white rounded-2xl border border-veluna-petal p-6 space-y-5">

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-veluna-text mb-1.5">
                  الاسم الكامل <span className="text-veluna-rose">*</span>
                </label>
                <input
                  type="text"
                  placeholder="اسمك الكامل"
                  className={`input-field ${fieldErrors.customer_name ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                  {...field('customer_name')}
                  disabled={loading}
                />
                {fieldErrors.customer_name && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.customer_name}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-veluna-text mb-1.5">
                  رقم الهاتف <span className="text-veluna-rose">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="06XXXXXXXX"
                  dir="ltr"
                  className={`input-field text-right ${fieldErrors.phone ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                  {...field('phone')}
                  disabled={loading}
                />
                {fieldErrors.phone && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>
                )}
              </div>

              {/* City dropdown */}
              <div>
                <label className="block text-sm font-semibold text-veluna-text mb-1.5">
                  المدينة <span className="text-veluna-rose">*</span>
                </label>
                <div ref={cityRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setCityOpen((o) => !o)}
                    disabled={loading}
                    className={`input-field flex items-center justify-between cursor-pointer text-right ${
                      fieldErrors.city ? 'border-red-400 ring-1 ring-red-400' : ''
                    } ${!form.city ? 'text-veluna-muted' : 'text-veluna-text'}`}
                  >
                    <span>{form.city || 'اختاري المدينة'}</span>
                    <svg className={`w-4 h-4 transition-transform ${cityOpen ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {cityOpen && (
                    <ul className="absolute z-30 w-full bg-white border border-veluna-petal rounded-xl shadow-lg max-h-56 overflow-y-auto mt-1">
                      {MOROCCAN_CITIES.map((c) => (
                        <li key={c}>
                          <button
                            type="button"
                            className="w-full text-right px-4 py-2.5 text-sm hover:bg-veluna-blush transition-colors text-veluna-text"
                            onClick={() => {
                              setForm((f) => ({ ...f, city: c }))
                              setFieldErrors((err) => ({ ...err, city: undefined }))
                              setCityOpen(false)
                            }}
                          >
                            {c}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {fieldErrors.city && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.city}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-veluna-text mb-1.5">
                  العنوان بالتفصيل <span className="text-veluna-rose">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="الحي، الشارع، رقم البناية..."
                  className={`input-field resize-none ${fieldErrors.address ? 'border-red-400 ring-1 ring-red-400' : ''}`}
                  {...field('address')}
                  disabled={loading}
                />
                {fieldErrors.address && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.address}</p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-veluna-text mb-1.5">
                  ملاحظات <span className="text-veluna-muted font-normal text-xs">(اختياري)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="أي تفاصيل إضافية للتوصيل..."
                  className="input-field resize-none"
                  {...field('notes')}
                  disabled={loading}
                />
              </div>

              {/* Payment method */}
              <div className="bg-veluna-blush rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-veluna-plum/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-veluna-plum" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-veluna-dark text-sm">الدفع عند الاستلام</p>
                  <p className="text-xs text-veluna-muted">تستقبلي طلبيتك وبعداه تخلصي</p>
                </div>
                <div className="ms-auto">
                  <div className="w-5 h-5 rounded-full border-2 border-veluna-plum flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-veluna-plum" />
                  </div>
                </div>
              </div>

              {/* Server error */}
              {serverError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                  {serverError}
                  <div className="mt-2">
                    <a
                      href="https://wa.me/212600000000"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#25D366] font-semibold underline"
                    >
                      أو تواصلي معنا فالواتساب
                    </a>
                  </div>
                </div>
              )}

              {fieldErrors.items && (
                <p className="text-red-500 text-sm">{fieldErrors.items}</p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || items.length === 0}
                className="w-full btn-primary py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    جاري تأكيد طلبك...
                  </span>
                ) : (
                  `تأكيد الطلب — ${orderTotal} درهم`
                )}
              </button>
            </form>
          </div>

          {/* ── Order summary ── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-veluna-petal p-5">
              <h2 className="font-bold text-veluna-dark mb-4">ملخص الطلب</h2>

              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-veluna-dark leading-tight">{item.name}</p>
                      <p className="text-xs text-veluna-muted mt-0.5">× {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-veluna-plum flex-shrink-0">
                      {item.price * item.quantity} درهم
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-veluna-petal pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-veluna-muted">المجموع الجزئي</span>
                  <span className="font-semibold">{subtotal} درهم</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-veluna-muted">التوصيل</span>
                  <span className="font-semibold">
                    {form.city
                      ? delivery === 0
                        ? <span className="text-[#25D366]">مجاني</span>
                        : `${delivery} درهم`
                      : '—'}
                  </span>
                </div>
                {subtotal > 0 && subtotal < FREE_DELIVERY_THRESHOLD && (
                  <p className="text-xs text-veluna-muted bg-veluna-blush rounded-lg p-2 text-center">
                    أضيفي {FREE_DELIVERY_THRESHOLD - subtotal} درهم للتوصيل المجاني
                  </p>
                )}
                <div className="flex justify-between font-bold text-base pt-2 border-t border-veluna-petal">
                  <span className="text-veluna-dark">المجموع</span>
                  <span className="text-veluna-plum text-lg">{orderTotal} درهم</span>
                </div>
              </div>
            </div>

            {/* Trust signals */}
            <div className="bg-veluna-blush rounded-2xl p-4 space-y-2.5">
              {[
                { icon: '✓', text: 'الدفع عند الاستلام في كل المغرب' },
                { icon: '✓', text: 'توصيل 2-4 أيام للمدن الكبرى' },
                { icon: '✓', text: 'تأكيد الطلب عبر واتساب' },
                { icon: '↩', text: 'ضمان رضا الزبونة' },
              ].map((t) => (
                <div key={t.text} className="flex items-center gap-2 text-xs text-veluna-text">
                  <span className="text-veluna-plum font-bold">{t.icon}</span>
                  <span>{t.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
