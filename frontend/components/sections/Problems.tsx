const problems = [
  {
    icon: '🔴',
    title: 'الشعر النامي تحت الجلد',
    desc: 'بعد الحلاقة أو الحلاوة كيبدأ الشعر يطلع تحت الجلد ويسبب حبيبات وتهيج؟',
  },
  {
    icon: '⚪',
    title: 'الحبيبات من بعد الحلاقة',
    desc: 'حبيبات صغيرة كتبان بعد كل مرة تحلقي فيها وما عارفة كيف تتخلصي منها؟',
  },
  {
    icon: '🪿',
    title: 'جلد الوزة',
    desc: 'الجلد الخشن والحبيبات على الرجلين أو اليدين اللي تحسي ببيهم بزاف؟',
  },
  {
    icon: '🔥',
    title: 'الحمرة والتهيج',
    desc: 'البشرة كتحمر وتتهيج بعد كل مرة تزيلي الشعر وتحتاج وقت باش تهدى؟',
  },
  {
    icon: '💧',
    title: 'الجفاف من بعد الإزالة',
    desc: 'البشرة كتجف وتتشد من بعد إزالة الشعر حتى لو كتحطي كريم عادي؟',
  },
  {
    icon: '🪒',
    title: 'الموس كيخلي البشرة خشنة',
    desc: 'الحلاقة اليومية بالموس كتخلي الجلد خشن وغير ناعم وكتعبتي منها؟',
  },
]

export default function Problems() {
  return (
    <section className="bg-veluna-blush py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="tag">مشاكل شائعة</span>
          <h2 className="section-heading mt-4">
            مشاكل كل واحدة عارفاها
            <span className="text-veluna-plum"> بجسمها</span>
          </h2>
          <p className="section-sub">
            مش أنتي وحدك. هاد المشاكل شائعة جداً — وللأسف المنتجات العادية ما كتعالجهاش.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {problems.map((p) => (
            <div
              key={p.title}
              className="bg-white rounded-2xl p-5 border border-veluna-petal flex gap-4 hover:shadow-md transition-shadow duration-200"
            >
              <span className="text-3xl flex-shrink-0 mt-0.5">{p.icon}</span>
              <div>
                <h3 className="font-bold text-veluna-dark text-sm mb-1">{p.title}</h3>
                <p className="text-xs text-veluna-muted leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Transition */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-2 bg-veluna-plum text-white px-6 py-3 rounded-full text-sm font-semibold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            روتين Veluna كيساعد تتعاملي مع هاد المشاكل
          </div>
        </div>
      </div>
    </section>
  )
}
