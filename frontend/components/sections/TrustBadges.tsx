import Image from 'next/image'

interface ProofCard {
  img: string
  alt: string
  title: string
  desc: string
}

const CARDS: ProofCard[] = [
  {
    img:   '/images/veluna-products-together.jpg',
    alt:   'زيت إزالة الشعر وكريم العناية من فيلونا معاً',
    title: 'روتين من جوج خطوات',
    desc:  'زيت لإزالة الشعر + كريم للعناية بالشعر تحت الجلد وجلد الوزة.',
  },
  {
    img:   '/images/veluna-before-after.jpg',
    alt:   'الفرق قبل وبعد استعمال روتين فيلونا',
    title: 'الفرق باين قبل وبعد',
    desc:  'روتين كيبين الفرق فنعومة البشرة ومظهرها بعد إزالة الشعر.',
  },
  {
    img:   '/images/veluna-easy-use.jpg',
    alt:   'طريقة استعمال فيلونا فخطوات بسيطة',
    title: 'استعمال واضح وبسيط',
    desc:  'طبقي الزيت، خليه 5 حتى 8 دقايق، مسحيه بلطف، ومن بعد ديري الكريم.',
  },
  {
    img:   '/images/veluna-cod-trust.jpg',
    alt:   'ثقة مغربية ودفع عند الاستلام مع فيلونا',
    title: 'ثقة مغربية ودفع عند الاستلام',
    desc:  'توصيل داخل المغرب، دعم سريع، والدفع حتى توصلك الطلبية.',
  },
]

export default function TrustBadges() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-[#FFF7FB] via-[#FDF2F8] to-[#F8F1FF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-14">
          <span className="tag">علاش Veluna؟</span>
          <h2 className="section-heading mt-4">
            لأن إزالة الشعر بوحدها{' '}
            <span className="text-veluna-plum">ما كافياش</span>
          </h2>
          <p className="section-sub mt-3">
            فيلونا كتجمع بين إزالة الشعر والعناية بالبشرة من بعده، باش تبقى البشرة
            ناعمة، مرتاحة، وما يبقاش الشعر تحت الجلد والحبيبات كيبانو.
          </p>
        </div>

        {/* Proof cards — 1 col mobile · 2 cols tablet · 4 cols desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {CARDS.map((c) => (
            <article
              key={c.title}
              className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-[#EAD7E7]
                         shadow-veluna-sm hover:shadow-veluna-lg hover:-translate-y-1
                         transition-all duration-300"
            >
              {/* Image */}
              <div className="relative aspect-[4/5] overflow-hidden bg-veluna-blush">
                <Image
                  src={c.img}
                  alt={c.alt}
                  fill
                  loading="lazy"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>

              {/* Text */}
              <div className="p-5 flex flex-col gap-2 flex-1">
                <h3 className="font-extrabold text-veluna-dark text-base leading-snug">
                  {c.title}
                </h3>
                <p className="text-sm text-veluna-muted leading-relaxed">{c.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
