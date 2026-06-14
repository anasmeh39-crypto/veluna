'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ResultItem {
  src: string
  alt: string
}

/**
 * Real before/after result photos (each image = قبل on the left half,
 * بعد on the right half). Drop replacements in /public/results/ with the
 * same names. Missing files fall back to a branded placeholder (never broken).
 */
const DEFAULT_RESULTS: ResultItem[] = [
  { src: '/results/result-1.jpg', alt: 'نتيجة قبل وبعد — بشرة أنعم مع روتين فيلونا' },
  { src: '/results/result-2.jpg', alt: 'نتيجة قبل وبعد — شعر أقل وملمس أنعم' },
  { src: '/results/result-3.jpg', alt: 'نتيجة قبل وبعد — مظهر أصفى للبشرة' },
  { src: '/results/result-4.jpg', alt: 'نتيجة قبل وبعد — رجلين أنعم بعد الإزالة' },
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

      {/* 2 cols on phone · 4 cols on desktop — equal square framed cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {images.map((img) => (
          <ResultCard key={img.src} {...img} />
        ))}
      </div>

      <p className="text-xs text-veluna-muted text-center mt-5 italic max-w-xl mx-auto leading-relaxed">
        النتائج كتختلف من بشرة لبشرة، والصور للتوضيح فقط.
      </p>
    </section>
  )
}

function ResultCard({ src, alt }: ResultItem) {
  const [failed, setFailed] = useState(false)

  return (
    <figure
      className="relative rounded-2xl bg-white p-1.5 border-[2.5px] border-[#E7A8CB] shadow-veluna-sm
                 hover:shadow-veluna-md transition-shadow duration-200"
    >
      <div className="relative rounded-xl overflow-hidden bg-veluna-blush" style={{ aspectRatio: '1/1' }}>
        {failed ? (
          <Placeholder />
        ) : (
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 50vw, 25vw"
            onError={() => setFailed(true)}
          />
        )}

        {/* before / after badges — pinned to the physical sides of the split image */}
        <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-veluna-dark
                         text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
          قبل
        </span>
        <span className="absolute top-2 right-2 bg-veluna-plum text-white
                         text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
          بعد
        </span>
      </div>
    </figure>
  )
}

/* Branded fallback if a photo isn't available */
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
