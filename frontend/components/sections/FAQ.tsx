'use client'

import { useState } from 'react'

const faqs = [
  {
    q: 'واش الزيت كيحبس الشعر نهائياً؟',
    a: 'لا. زيت فيلونا كيساعد يزيل الشعر من سطح البشرة بطريقة أسهل وألطف، وماشي منتج لإيقاف نمو الشعر نهائياً. النتائج كتختلف من بشرة لبشرة.',
  },
  {
    q: 'واش نقدر نستعمل الكريم مباشرة من بعد الحلاقة؟',
    a: 'لا. من الأفضل تستناي على الأقل 24 ساعة قبل استعمال الكريم، خصوصاً إلا كانت البشرة حساسة أو كان فيها أي تهيج.',
  },
  {
    q: 'واش الكريم مناسب للشعر النامي تحت الجلد؟',
    a: 'أيه، كيساعد يحسن مظهر الشعر النامي تحت الجلد والحبيبات بفضل التقشير اللطيف بحمض الساليسيليك.',
  },
  {
    q: 'واش المنتجات مناسبة للمناطق الحساسة؟',
    a: 'الزيت ما يستعملش على المناطق الحساسة بزاف أو على البشرة المتهيجة. الكريم كذلك مناسب لبشرة الجسم بشكل عام. ديري دائماً اختبار صغير قبل الاستعمال.',
  },
  {
    q: 'شحال خاص باش تبان النتيجة؟',
    a: 'النتائج كتختلف من بشرة لبشرة. مع الاستعمال المنتظم كيبان تحسن في ملمس البشرة ومظهر الحبيبات خلال أسابيع.',
  },
  {
    q: 'كيفاش نستعمل روتين فيلونا بشكل صحيح؟',
    a: 'الخطوة 1: استعملي زيت إزالة الشعر على البشرة الجافة من 5 إلى 8 دقايق ثم اغسليه بالماء الدافئ.\nالخطوة 2: بعد 24 ساعة على الأقل، ضعي كريم الشعر تحت الجلد على المناطق المتأثرة واستعمليه كروتين يومي.',
  },
  {
    q: 'واش كاين الدفع عند الاستلام؟',
    a: 'أيه! الدفع عند الاستلام متوفر في جميع أنحاء المغرب. كتستقبلي الطلبية أولاً وتتأكدي منها، وبعداه تخلصي. ما كاين حتى مخاطرة.',
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-veluna-petal rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-start bg-white hover:bg-veluna-cream transition-colors"
        aria-expanded={open}
      >
        <span className="font-semibold text-veluna-dark text-sm leading-relaxed">{q}</span>
        <span className={`flex-shrink-0 w-6 h-6 rounded-full bg-veluna-blush flex items-center justify-center text-veluna-plum font-bold text-sm transition-transform duration-200 ${open ? 'rotate-45' : ''}`}>
          +
        </span>
      </button>
      {open && (
        <div className="bg-veluna-blush px-5 py-4 border-t border-veluna-petal animate-fade-in">
          <p className="text-sm text-veluna-text leading-relaxed whitespace-pre-line">{a}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQ() {
  return (
    <section className="bg-veluna-cream py-10 md:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <span className="tag">أسئلة شائعة</span>
          <h2 className="section-heading mt-4">
            عندك سؤال؟{' '}
            <span className="text-veluna-plum">هنا الجواب</span>
          </h2>
          <div className="lavender-line mx-auto mt-5" />
        </div>

        <div className="space-y-3">
          {faqs.map((f, i) => (
            <FAQItem key={i} q={f.q} a={f.a} />
          ))}
        </div>

        <div className="mt-10 text-center bg-veluna-blush rounded-2xl p-6 border border-veluna-petal">
          <p className="font-semibold text-veluna-dark mb-1">ما لقيتيش جوابك؟</p>
          <p className="text-sm text-veluna-muted mb-4">تواصلي معنا على واتساب</p>
          <a href="https://wa.me/212600000000" target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.99.583 3.842 1.588 5.392L2 22l4.741-1.555A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 11.999 2zm.001 18c-1.617 0-3.129-.47-4.404-1.28l-.316-.188-3.28 1.077 1.098-3.192-.206-.327A7.945 7.945 0 014 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8z"/>
            </svg>
            اسألي على واتساب
          </a>
        </div>
      </div>
    </section>
  )
}
