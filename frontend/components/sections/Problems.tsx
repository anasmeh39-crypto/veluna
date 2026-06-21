function IconIngrown() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* skin surface */}
      <line x1="6" y1="21" x2="34" y2="21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      {/* small raised bump */}
      <path d="M17 21 C17 17.5 20 15 20 15 C20 15 23 17.5 23 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      {/* hair looping under */}
      <path d="M20 21 C20 24 22 27 22 29 C22 31 19 32 18 30 C17 28 18 25 20 25 C22 25 22 28 20 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      {/* trapped dot */}
      <circle cx="20" cy="28.5" r="1.2" fill="currentColor"/>
    </svg>
  )
}

function IconBumps() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* skin base */}
      <path d="M5 28 L35 28" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      {/* three raised bumps of different sizes */}
      <path d="M9 28 C9 24 12 21 12 21 C12 21 15 24 15 28" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 28 C16 22 20 18 20 18 C20 18 24 22 24 28" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M25 28 C25 25 27.5 23 27.5 23 C27.5 23 30 25 30 28" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconGoosebumps() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* leg/arm silhouette */}
      <path d="M12 34 L12 10 C12 7.8 14 6 16 6 L24 6 C26 6 28 7.8 28 10 L28 34 Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      {/* pimple dots — goosebump pattern */}
      <circle cx="17" cy="13" r="1.5" fill="currentColor"/>
      <circle cx="23" cy="13" r="1.5" fill="currentColor"/>
      <circle cx="17" cy="20" r="1.5" fill="currentColor"/>
      <circle cx="23" cy="20" r="1.5" fill="currentColor"/>
      <circle cx="20" cy="27" r="1.5" fill="currentColor"/>
      <circle cx="17" cy="27" r="0" fill="currentColor"/>
    </svg>
  )
}

function IconRedness() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* skin patch */}
      <rect x="8" y="20" width="24" height="12" rx="4" stroke="currentColor" strokeWidth="1.8"/>
      {/* heat/irritation waves rising */}
      <path d="M15 19 C15 17 17 15 17 13 C17 11 15 9 15 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M20 19 C20 17 22 15 22 13 C22 11 20 9 20 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M25 19 C25 17 27 15 27 13 C27 11 25 9 25 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  )
}

function IconDryness() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* water drop outline */}
      <path d="M20 8 C20 8 10 19 10 25 C10 30.5 14.5 35 20 35 C25.5 35 30 30.5 30 25 C30 19 20 8 20 8 Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      {/* crack / dryness split inside */}
      <path d="M20 17 L17 23 L21 23 L18 30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconRazor() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* razor handle */}
      <rect x="17" y="6" width="6" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
      {/* razor blade head */}
      <rect x="9" y="17" width="22" height="8" rx="2" stroke="currentColor" strokeWidth="1.8"/>
      {/* blade slits */}
      <line x1="15" y1="19" x2="15" y2="23" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="20" y1="19" x2="20" y2="23" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="25" y1="19" x2="25" y2="23" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      {/* rough skin waves below */}
      <path d="M9 30 C11 28 13 32 15 30 C17 28 19 32 21 30 C23 28 25 32 27 30 C29 28 30 30 31 30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

const problems = [
  {
    Icon: IconIngrown,
    title: 'الشعر النامي تحت الجلد',
    desc: 'بعد الحلاقة أو الحلاوة كيبدأ الشعر يطلع تحت الجلد ويسبب حبيبات وتهيج؟',
  },
  {
    Icon: IconBumps,
    title: 'الحبيبات من بعد الحلاقة',
    desc: 'حبيبات صغيرة كتبان بعد كل مرة تحلقي فيها وما عارفة كيف تتخلصي منها؟',
  },
  {
    Icon: IconGoosebumps,
    title: 'جلد الوزة',
    desc: 'الجلد الخشن والحبيبات على الرجلين أو اليدين اللي تحسي ببيهم بزاف؟',
  },
  {
    Icon: IconRedness,
    title: 'الحمرة والتهيج',
    desc: 'البشرة كتحمر وتتهيج بعد كل مرة تزيلي الشعر وتحتاج وقت باش تهدى؟',
  },
  {
    Icon: IconDryness,
    title: 'الجفاف من بعد الإزالة',
    desc: 'البشرة كتجف وتتشد من بعد إزالة الشعر حتى لو كتحطي كريم عادي؟',
  },
  {
    Icon: IconRazor,
    title: 'الموس كيخلي البشرة خشنة',
    desc: 'الحلاقة اليومية بالموس كتخلي الجلد خشن وغير ناعم وكتعبتي منها؟',
  },
]

export default function Problems() {
  return (
    <section className="bg-veluna-blush py-10 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
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
              className="bg-white rounded-2xl p-5 border border-veluna-petal flex gap-4 items-start hover:shadow-md hover:border-veluna-mauve transition-all duration-200"
            >
              {/* Icon container */}
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-veluna-blush to-[#F1E5EE] flex items-center justify-center text-veluna-plum p-2">
                <p.Icon />
              </div>
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
            روتين فيلونا كيساعد تتعاملي مع هاد المشاكل
          </div>
        </div>
      </div>
    </section>
  )
}
