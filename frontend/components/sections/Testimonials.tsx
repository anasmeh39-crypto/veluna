const testimonials = [
  {
    name: 'سلمى م.',
    city: 'الدار البيضاء',
    rating: 5,
    text: 'جربت زيت فيلونا وحسيت فرق في كيفية إزالة الشعر. البشرة ما تهيجاتش بحال قبل، وكانت مرطبة بعد الاستعمال. راضية بزاف!',
    product: 'زيت إزالة الشعر',
    avatar: 'س',
    avatarColor: 'bg-veluna-lavender text-veluna-plum',
    placeholder: true,
  },
  {
    name: 'نور الهدى ب.',
    city: 'مراكش',
    rating: 5,
    text: 'كنت نعاني من الشعر تحت الجلد من زمان. كريم فيلونا هو الوحيد اللي حسيت بتحسن حقيقي في مظهر البشرة.',
    product: 'كريم الشعر تحت الجلد',
    avatar: 'ن',
    avatarColor: 'bg-veluna-pink text-veluna-plum',
    placeholder: true,
  },
  {
    name: 'آية ز.',
    city: 'فاس',
    rating: 5,
    text: 'خذيت الباقة الكاملة. الزيت سهّل عليا الإزالة والكريم خلى البشرة ناعمة. روتين بسيط ومريح.',
    product: 'روتين فيلونا الكامل',
    avatar: 'آ',
    avatarColor: 'bg-[#F0E6FF] text-veluna-plum',
    placeholder: true,
  },
  {
    name: 'إيمان ش.',
    city: 'الرباط',
    rating: 5,
    text: 'التوصيل جاء بسرعة والتغليف كان أنيق. الزيت رائحته حلوة وما تهيجاتش البشرة. كنوصيه!',
    product: 'زيت إزالة الشعر',
    avatar: 'إ',
    avatarColor: 'bg-veluna-blush text-veluna-plum',
    placeholder: true,
  },
  {
    name: 'خديجة أ.',
    city: 'طنجة',
    rating: 5,
    text: 'الكريم ريحته خفيفة وخف على البشرة. استعمالو اليومي سهل وكيبان الفرق في الملمس.',
    product: 'كريم الشعر تحت الجلد',
    avatar: 'خ',
    avatarColor: 'bg-veluna-pink text-veluna-plum',
    placeholder: true,
  },
  {
    name: 'رانيا ع.',
    city: 'أكادير',
    rating: 5,
    text: 'خدمة الزبونة ممتازة. جاوبوني على واتساب بسرعة وساعدوني في الاختيار. شكراً فيلونا!',
    product: 'روتين فيلونا الكامل',
    avatar: 'ر',
    avatarColor: 'bg-veluna-lavender text-veluna-plum',
    placeholder: true,
  },
]

export default function Testimonials() {
  return (
    <section className="bg-gradient-to-br from-[#EDE0FF] via-[#FFF0F8] to-[#F6EEFF] py-10 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8 md:mb-12">
          <span className="tag">آراء الزبونات</span>
          <h2 className="section-heading mt-4">
            واش كيقولو{' '}
            <span className="text-veluna-plum">زبوناتنا</span>
          </h2>
          <p className="section-sub">آراء من زبونات استعملن روتين فيلونا</p>
          <p className="text-xs text-veluna-muted mt-2 italic">
            * هاد التقييمات نماذج توضيحية وسيتم استبدالها بتقييمات حقيقية
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-veluna-petal flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="stars text-sm">{'★'.repeat(t.rating)}</span>
                <span className="tag text-xs">{t.product}</span>
              </div>
              <p className="text-sm text-veluna-text leading-relaxed flex-1">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-3 border-t border-veluna-petal">
                <div className={`w-9 h-9 rounded-full ${t.avatarColor} font-bold text-sm flex items-center justify-center flex-shrink-0`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-veluna-dark">{t.name}</p>
                  <p className="text-xs text-veluna-muted">{t.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 bg-veluna-blush rounded-2xl p-6 border border-veluna-petal max-w-md mx-auto">
          <div className="text-center">
            <div className="text-4xl font-extrabold text-veluna-plum">4.9</div>
            <div className="stars text-lg mt-1">★★★★★</div>
          </div>
          <div className="text-center sm:text-start">
            <p className="font-bold text-veluna-dark">تقييم ممتاز</p>
            <p className="text-sm text-veluna-muted">بناءً على 400+ تقييم</p>
          </div>
        </div>
      </div>
    </section>
  )
}
