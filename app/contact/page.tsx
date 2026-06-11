'use client'

import { useState } from 'react'

const deliveryFAQ = [
  {
    q: 'شحال كتاخذ التوصيلة؟',
    a: 'عادةً 2-4 أيام عمل في المدن الكبرى. للمناطق النائية قد تاخذ 4-6 أيام.',
  },
  {
    q: 'واش الدفع عند الاستلام متوفر؟',
    a: 'أيه، الدفع عند الاستلام متوفر في كل المغرب. كتستقبلي طلبيتك وتتأكدي منها وبعداه تخلصي.',
  },
  {
    q: 'كيفاش نتتبع طلبيتي؟',
    a: 'بعد تأكيد الطلبية، كنبعثوا ليك رسالة واتساب فيها تفاصيل التتبع.',
  },
  {
    q: 'واش نقدر نرجع المنتج؟',
    a: 'في حال أي مشكلة في المنتج، تواصلي معنا على واتساب وكنحلو المشكلة مع بعض.',
  },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', phone: '', message: '' })
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = encodeURIComponent(
      `مرحباً، اسمي ${form.name}\nرقمي: ${form.phone}\n\n${form.message}`
    )
    window.open(`https://wa.me/212600000000?text=${text}`, '_blank')
    setSent(true)
    setForm({ name: '', phone: '', message: '' })
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">

      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="tag">تواصلي معنا</span>
        <h1 className="section-heading mt-4">
          كيف نقدرو
          <span className="text-veluna-plum"> نساعدوك؟</span>
        </h1>
        <p className="section-sub">
          فريق فيلونا هنا باش يجاوب على كل أسئلتك ويساعدك تختاري المنتج المناسب.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* ── Left: Contact methods ── */}
        <div className="space-y-5">

          {/* WhatsApp – primary */}
          <div className="bg-[#25D366]/10 border border-[#25D366]/30 rounded-2xl p-6">
            <h2 className="font-bold text-veluna-dark text-lg mb-2 flex items-center gap-2">
              <span className="text-[#25D366] text-2xl">💬</span>
              تواصلي عبر واتساب
            </h2>
            <p className="text-sm text-veluna-muted mb-4">
              أسرع طريقة للحصول على إجابة. كنجاوبو عادةً خلال ساعات.
            </p>
            <a
              href="https://wa.me/212600000000"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp inline-flex"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.99.583 3.842 1.588 5.392L2 22l4.741-1.555A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 11.999 2zm.001 18c-1.617 0-3.129-.47-4.404-1.28l-.316-.188-3.28 1.077 1.098-3.192-.206-.327A7.945 7.945 0 014 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8z" />
              </svg>
              تحدثي معنا الآن
            </a>
          </div>

          {/* Email */}
          <div className="bg-veluna-blush rounded-2xl p-5 border border-veluna-petal">
            <h3 className="font-bold text-veluna-dark mb-1">البريد الإلكتروني</h3>
            <a href="mailto:contact@veluna.ma" className="text-veluna-plum font-semibold text-sm hover:underline">
              contact@veluna.ma
            </a>
            <p className="text-xs text-veluna-muted mt-1">كنرد خلال 24-48 ساعة</p>
          </div>

          {/* Instagram */}
          <div className="bg-veluna-blush rounded-2xl p-5 border border-veluna-petal">
            <h3 className="font-bold text-veluna-dark mb-1">إنستغرام</h3>
            <a
              href="https://instagram.com/veluna.ma"
              target="_blank"
              rel="noopener noreferrer"
              className="text-veluna-plum font-semibold text-sm hover:underline"
            >
              @veluna.ma
            </a>
            <p className="text-xs text-veluna-muted mt-1">تابعينا للعروض والنصائح</p>
          </div>

          {/* Shipping info */}
          <div className="bg-veluna-dark text-white rounded-2xl p-5">
            <h3 className="font-bold mb-3 flex items-center gap-2">🚚 التوصيل والدفع</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>✓ الدفع عند الاستلام في كل المغرب</li>
              <li>✓ توصيل 2-4 أيام في المدن الكبرى</li>
              <li>✓ تتبع الطلبية عبر واتساب</li>
              <li>✓ دعم ما بعد البيع</li>
            </ul>
          </div>
        </div>

        {/* ── Right: Contact form ── */}
        <div>
          <div className="bg-white rounded-2xl border border-veluna-petal p-6 shadow-sm">
            <h2 className="font-bold text-veluna-dark text-lg mb-5">ابعثي لينا رسالة</h2>

            {sent ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full bg-[#25D366]/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✓</span>
                </div>
                <p className="font-bold text-veluna-dark mb-1">شكراً على رسالتك!</p>
                <p className="text-sm text-veluna-muted">كيفتح واتساب باش تكملي معنا.</p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-4 text-sm text-veluna-plum hover:underline"
                >
                  ارسلي رسالة أخرى
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-veluna-text mb-1.5">
                    الاسم
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="اسمك الكامل"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-veluna-text mb-1.5">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="06XXXXXXXX"
                    className="input-field"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-veluna-text mb-1.5">
                    رسالتك
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="اكتبي سؤالك أو ملاحظتك هنا..."
                    className="input-field resize-none"
                  />
                </div>

                <button type="submit" className="w-full btn-whatsapp py-4">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.99.583 3.842 1.588 5.392L2 22l4.741-1.555A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 11.999 2zm.001 18c-1.617 0-3.129-.47-4.404-1.28l-.316-.188-3.28 1.077 1.098-3.192-.206-.327A7.945 7.945 0 014 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8z"/>
                  </svg>
                  ارسلي عبر واتساب
                </button>

                <p className="text-xs text-center text-veluna-muted">
                  ستنتقلي إلى واتساب لإتمام الرسالة
                </p>
              </form>
            )}
          </div>

          {/* Delivery FAQ */}
          <div className="mt-6">
            <h3 className="font-bold text-veluna-dark mb-4">أسئلة عن التوصيل والدفع</h3>
            <div className="space-y-2">
              {deliveryFAQ.map((f, i) => (
                <details key={i} className="group border border-veluna-petal rounded-xl overflow-hidden">
                  <summary className="flex justify-between items-center px-4 py-3.5 cursor-pointer bg-white hover:bg-veluna-blush transition-colors list-none">
                    <span className="font-semibold text-veluna-dark text-sm">{f.q}</span>
                    <span className="text-veluna-plum font-bold group-open:rotate-45 transition-transform duration-200">+</span>
                  </summary>
                  <div className="px-4 py-3 bg-veluna-blush border-t border-veluna-petal">
                    <p className="text-sm text-veluna-text">{f.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
