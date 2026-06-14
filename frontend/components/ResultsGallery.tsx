'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ResultItem {
  src: string
  alt: string
  label: string
}

/**
 * Default result images. Drop the real files in /public/results/ with these
 * exact names and they appear automatically — no code change needed.
 * Until then each card shows a styled branded placeholder (never a broken img).
 */
const DEFAULT_RESULTS: ResultItem[] = [
  { src: '/results/result-1.jpg', alt: 'نتيجة قبل وبعد Veluna',        label: 'قبل / بعد' },
  { src: '/results/result-2.jpg', alt: 'ملمس بشرة أنعم مع Veluna',     label: 'ملمس أنعم' },
  { src: '/results/result-3.jpg', alt: 'مظهر حبيبات أقل بروزاً',        label: 'حبيبات أقل' },
  { src: '/results/result-4.jpg', alt: 'بشرة أهدأ بعد الروتين',         label: 'بشرة أهدأ' },
]

interface Props {
  header: string
  subheadline: string
  images?: ResultItem[]
}

export default function ResultsGallery({ header, subheadline, images = DEFAULT_RESULTS }: Props) {
  return (
    <section className="py-12">
      <div className="text-center mb-8 max-w-2xl mx-auto">
        <span className="tag">النتيجة اللي كتبغيها</span>
        <h2 className="section-heading mt-3">{header}</h2>
        <p className="section-sub mt-2">{subheadline}</p>
      </div>

      {/* 2 cols on phone · 4 cols on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {images.map((img) => (
          <ResultCard key={img.src} {...img} />
        ))}
      </div>

      <p className="text-xs text-veluna-muted text-center mt-5 italic max-w-xl mx-auto leading-relaxed">
        النتائج كتختلف من بشرة لبشرة، والصور للتوضيح فقط حتى نضيفو صور حقيقية.
      </p>
    </section>
  )
}

function ResultCard({ src, alt, label }: ResultItem) {
  const [failed, setFailed] = useState(false)

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-veluna-petal shadow-veluna-sm
                 bg-veluna-blush hover:shadow-veluna-md transition-shadow duration-200"
      style={{ aspectRatio: '4/5' }}
    >
      {failed ? (
        <Placeholder />
      ) : (
        <>
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 50vw, 25vw"
            onError={() => setFailed(true)}
          />
          {/* soft gradient for label legibility */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/35 to-transparent pointer-events-none" />
        </>
      )}

      {/* overlay label chip */}
      <span className="absolute bottom-2.5 start-2.5 bg-white/90 backdrop-blur-sm text-veluna-plum
                       text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
        {label}
      </span>
    </div>
  )
}

/* Branded placeholder shown when the real photo isn't available yet */
function Placeholder() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2
                    bg-gradient-to-br from-veluna-blush via-white to-veluna-lavender/30">
      <span className="w-11 h-11 rounded-2xl bg-white shadow-veluna-sm flex items-center justify-center text-veluna-plum">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <rect x="3" y="3" width="18" height="18" rx="2.5" />
          <circle cx="8.5" cy="8.5" r="1.7" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </span>
      <span className="text-[11px] text-veluna-plum font-semibold">صورة قريباً</span>
    </div>
  )
}
