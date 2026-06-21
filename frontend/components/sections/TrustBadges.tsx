const badges = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'الدفع عند الاستلام',
    desc: 'خلصي بعد ما توصلك الطلبية – بلا مخاطرة',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
    title: 'توصيل داخل المغرب',
    desc: 'كنوصلو في جميع أنحاء المغرب خلال 2-4 أيام',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'منتجات موثوقة',
    desc: 'مكونات مختارة بعناية للعناية الفعلية بالبشرة',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    title: 'مصنوع للمرأة المغربية',
    desc: 'روتين عناية مخصص لاحتياجات بشرتك من بعد إزالة الشعر',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.99.583 3.842 1.588 5.392L2 22l4.741-1.555A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 11.999 2zm.001 18c-1.617 0-3.129-.47-4.404-1.28l-.316-.188-3.28 1.077 1.098-3.192-.206-.327A7.945 7.945 0 014 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8z" />
      </svg>
    ),
    title: 'دعم عبر واتساب',
    desc: 'فريقنا متاح للإجابة على كل أسئلتك',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'توصيل سريع',
    desc: 'طلبيتك كتوصلك في أسرع وقت ممكن',
  },
]

export default function TrustBadges() {
  return (
    <section className="bg-gradient-to-b from-white to-[#F6EEFF] py-10 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <span className="tag">ليش فيلونا؟</span>
          <h2 className="section-heading mt-4">
            ثقي فيها —{' '}
            <span className="text-veluna-plum">عناية حقيقية</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {badges.map((b) => (
            <div
              key={b.title}
              className="flex flex-col items-center text-center gap-3 bg-veluna-blush rounded-2xl p-5 border border-veluna-petal hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-veluna-plum shadow-sm">
                {b.icon}
              </div>
              <div>
                <h3 className="font-bold text-veluna-dark text-sm mb-1">{b.title}</h3>
                <p className="text-xs text-veluna-muted leading-relaxed">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
