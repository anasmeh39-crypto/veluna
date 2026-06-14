import type { ReactNode } from 'react'

/* Premium line icons — brand plum, consistent 24px stroke set */
function IconCOD() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="2" y="6" width="20" height="12" rx="2.5" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 9.5v5M18 9.5v5" />
    </svg>
  )
}
function IconDelivery() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M3 6h11v9H3z" />
      <path d="M14 9h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.8" />
      <circle cx="17.5" cy="18" r="1.8" />
    </svg>
  )
}
function IconSupport() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M21 11.5a8.5 8.5 0 0 1-12.2 7.7L3 21l1.8-5.8A8.5 8.5 0 1 1 21 11.5z" />
      <path d="M8.5 10.5c.4 2 2 3.6 4 4l1.2-1.4 1.8.7v1.9c-3.6.4-7-3-6.6-6.6h1.9l.7 1.8z" fill="currentColor" stroke="none" opacity="0.55" />
    </svg>
  )
}
function IconSecure() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M12 3l7 3v5c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

const ITEMS: { icon: ReactNode; title: string; sub: string }[] = [
  { icon: <IconCOD />,      title: 'الدفع عند الاستلام', sub: 'خلصي من بعد ما توصلك' },
  { icon: <IconDelivery />, title: 'توصيل داخل المغرب',  sub: 'لكل المدن 2-5 أيام' },
  { icon: <IconSupport />,  title: 'دعم واتساب',         sub: 'جاوبينك على كل سؤال' },
  { icon: <IconSecure />,   title: 'طلب آمن',            sub: 'بلا أي مخاطرة' },
]

export default function ProductTrustStrip() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pb-10">
      {ITEMS.map((it) => (
        <div
          key={it.title}
          className="flex items-center gap-3 bg-white border border-veluna-petal rounded-2xl px-4 py-3.5 hover:shadow-veluna-sm hover:border-veluna-mauve transition-all duration-200"
        >
          <span className="w-10 h-10 rounded-xl bg-veluna-blush text-veluna-plum flex items-center justify-center flex-shrink-0">
            {it.icon}
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-veluna-dark leading-tight">{it.title}</p>
            <p className="text-[11px] text-veluna-muted leading-tight mt-0.5">{it.sub}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
