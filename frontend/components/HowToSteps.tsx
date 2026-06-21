import Image from 'next/image'

export interface HowToStep {
  img: string
  text: string
  warn?: boolean
}

interface Props {
  title: string
  subtitle: string
  steps: HowToStep[]
  warnings?: string[]
}

/**
 * Photo-based "how to use" steps. Phone-first: a compact numbered list on
 * mobile, a clean row of cards on desktop. Step photos already carry the
 * number badge in the corner.
 */
export default function HowToSteps({ title, subtitle, steps, warnings }: Props) {
  return (
    <section className="py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="tag">طريقة الاستخدام</span>
        <h2 className="section-heading mt-3">{title}</h2>
        <p className="section-sub mt-2">{subtitle}</p>
      </div>

      {/* ── Mobile / tablet: compact numbered rows ── */}
      <ol className="lg:hidden space-y-3 max-w-lg mx-auto">
        {steps.map((s, i) => (
          <li
            key={i}
            className={`flex gap-4 items-center bg-white rounded-2xl border p-3 shadow-veluna-sm ${
              s.warn ? 'border-amber-300' : 'border-veluna-petal'
            }`}
          >
            <div className="relative w-24 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-veluna-blush">
              <Image src={s.img} alt={`الخطوة ${i + 1}`} fill className="object-cover" sizes="96px" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`w-7 h-7 rounded-full text-white font-extrabold text-sm flex items-center justify-center flex-shrink-0 ${
                  s.warn ? 'bg-amber-500' : 'bg-veluna-plum'
                }`}>
                  {i + 1}
                </span>
                {s.warn && <span className="text-xs font-bold text-amber-600">مهم</span>}
              </div>
              <p className="text-sm text-veluna-text leading-relaxed">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>

      {/* ── Desktop: row of cards ── */}
      <div className="hidden lg:grid grid-cols-5 gap-4 max-w-5xl mx-auto">
        {steps.map((s, i) => (
          <div key={i} className="flex flex-col">
            <div className={`relative aspect-[4/5] rounded-2xl overflow-hidden border-2 shadow-veluna-sm ${
              s.warn ? 'border-amber-300' : 'border-veluna-petal'
            }`}>
              <Image src={s.img} alt={`الخطوة ${i + 1}`} fill className="object-cover" sizes="(max-width:1280px) 20vw, 200px" />
            </div>
            <div className="mt-3 px-1 text-center">
              {s.warn && <span className="inline-block text-[11px] font-bold text-amber-600 mb-0.5">! مهم</span>}
              <p className="text-xs text-veluna-text leading-relaxed">{s.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Warnings */}
      {warnings && warnings.length > 0 && (
        <div className="warning-box max-w-3xl mx-auto mt-8">
          <p className="font-bold text-amber-900 mb-2 text-sm">تحذيرات</p>
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1" role="list">
            {warnings.map((w, i) => (
              <li key={i} className="flex gap-2 text-xs"><span className="flex-shrink-0">•</span><span>{w}</span></li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
